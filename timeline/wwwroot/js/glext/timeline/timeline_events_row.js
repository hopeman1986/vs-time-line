var webglext;
(function (webglext) {
    function newEventsRowPaneFactory(eventsRowOpts) {
        // Pane Factory
        return function (drawable, timeAxis, dataAxis, model, row, ui, options) {
            var rowTopPadding = (webglext.isNotEmpty(eventsRowOpts) && webglext.isNotEmpty(eventsRowOpts.rowTopPadding) ? eventsRowOpts.rowTopPadding : 6);
            var rowBottomPadding = (webglext.isNotEmpty(eventsRowOpts) && webglext.isNotEmpty(eventsRowOpts.rowBottomPadding) ? eventsRowOpts.rowBottomPadding : 6);
            var laneHeight = (webglext.isNotEmpty(eventsRowOpts) && webglext.isNotEmpty(eventsRowOpts.laneHeight) ? eventsRowOpts.laneHeight : 33);
            var painterFactories = (webglext.isNotEmpty(eventsRowOpts) && webglext.isNotEmpty(eventsRowOpts.painterFactories) ? eventsRowOpts.painterFactories : []);
            var allowMultipleLanes = (webglext.isNotEmpty(eventsRowOpts) && webglext.isNotEmpty(eventsRowOpts.allowMultipleLanes) ? eventsRowOpts.allowMultipleLanes : true);
            var timelineFont = options.timelineFont;
            var timelineFgColor = options.timelineFgColor;
            var draggableEdgeWidth = options.draggableEdgeWidth;
            var snapToDistance = options.snapToDistance;
            var rowUi = ui.rowUi(row.rowGuid);
            var input = ui.input;
            var selection = ui.selection;
            var lanes = new webglext.TimelineLaneArray(model, row, ui, allowMultipleLanes);
            var timeAtCoords_PMILLIS = function (viewport, i) {
                return timeAxis.tAtFrac_PMILLIS(viewport.xFrac(i));
            };
            var timeAtPointer_PMILLIS = function (ev) {
                return timeAtCoords_PMILLIS(ev.paneViewport, ev.i);
            };
            var eventAtCoords = function (viewport, i, j) {
                var laneNum = Math.floor((viewport.jEnd - j - rowTopPadding) / laneHeight);
                var time_PMILLIS = timeAtCoords_PMILLIS(viewport, i);
                return lanes.eventAt(laneNum, time_PMILLIS);
            };
            var eventAtPointer = function (ev) {
                return eventAtCoords(ev.paneViewport, ev.i, ev.j);
            };
            var isInsideAnEvent = function (viewport, i, j) {
                return webglext.isNotEmpty(eventAtCoords(viewport, i, j));
            };
            // Create pane
            //
            var layout = {
                updatePrefSize: function (parentPrefSize) {
                    parentPrefSize.h = rowTopPadding + rowBottomPadding + Math.max(1, lanes.length) * laneHeight;
                    parentPrefSize.w = null;
                }
            };
            var rowContentPane = new webglext.Pane(layout, true, isInsideAnEvent);
            rowUi.addPane('content', rowContentPane);
            var painterOptions = { timelineFont: timelineFont, timelineFgColor: timelineFgColor, rowTopPadding: rowTopPadding, rowBottomPadding: rowBottomPadding, laneHeight: laneHeight };
            for (var n = 0; n < painterFactories.length; n++) {
                var createPainter = painterFactories[n];
                rowContentPane.addPainter(createPainter(drawable, timeAxis, lanes, ui, painterOptions));
            }
            var redraw = function () {
                drawable.redraw();
            };
            row.eventGuids.valueAdded.on(redraw);
            row.eventGuids.valueMoved.on(redraw);
            row.eventGuids.valueRemoved.on(redraw);
            var watchEventAttrs = function (eventGuid) {
                model.event(eventGuid).attrsChanged.on(redraw);
            };
            row.eventGuids.forEach(watchEventAttrs);
            row.eventGuids.valueAdded.on(watchEventAttrs);
            var removeRedraw = function (eventGuid) {
                model.event(eventGuid).attrsChanged.off(redraw);
            };
            row.eventGuids.valueRemoved.on(removeRedraw);
            // Used by both sets of listeners to know whether an event-drag is in progress
            var eventDragMode = null;
            // Hook up input notifications
            //
            var recentMouseMove = null;
            rowContentPane.mouseMove.on(function (ev) {
                input.mouseMove.fire(ev);
                if (!eventDragMode) {
                    input.timeHover.fire(timeAtPointer_PMILLIS(ev), ev);
                    input.rowHover.fire(row, ev);
                    input.eventHover.fire(eventAtPointer(ev), ev);
                }
                recentMouseMove = ev;
            });
            rowContentPane.mouseExit.on(function (ev) {
                input.mouseExit.fire(ev);
                if (!eventDragMode) {
                    input.timeHover.fire(null, ev);
                    input.rowHover.fire(null, ev);
                    input.eventHover.fire(null, ev);
                }
                recentMouseMove = null;
            });
            var uiMillisPerPxChanged = function () {
                if (!eventDragMode && recentMouseMove != null) {
                    var ev = recentMouseMove;
                    input.timeHover.fire(timeAtPointer_PMILLIS(ev), ev);
                    input.eventHover.fire(eventAtPointer(ev), ev);
                }
            };
            ui.millisPerPx.changed.on(uiMillisPerPxChanged);
            rowContentPane.mouseUp.on(function (ev) {
                input.mouseUp.fire(ev);
            });
            rowContentPane.mouseDown.on(function (ev) {
                input.mouseDown.fire(ev);
            });
            rowContentPane.mouseWheel.on(options.mouseWheelListener);
            rowContentPane.contextMenu.on(function (ev) {
                input.contextMenu.fire(ev);
            });
            // Begin event-drag
            //
            var eventDragEvents = [];
            var eventDragOffsets_MILLIS = {};
            var eventDragSnapTimes_PMILLIS = [];
            // Event-edges are draggable for events at least this wide
            var minEventWidthForEdgeDraggability = 3 * draggableEdgeWidth;
            // When dragging an event-edge, the event cannot be made narrower than this
            //
            // Needs to be greater than minEventWidthForEdgeDraggability -- by enough to
            // cover floating-point precision loss -- so a user can't accidentally make
            // an event so narrow that it can't easily be widened again.
            //
            var minEventWidthWhenDraggingEdge = minEventWidthForEdgeDraggability + 1;
            function allUserEditable(events) {
                for (var n = 0; n < events.length; n++) {
                    if (!events[n].userEditable) {
                        return false;
                    }
                }
                return true;
            }
            function chooseEventDragMode(ui, mouseTime_PMILLIS, eventDragEvents) {
                if (eventDragEvents.length === 0) {
                    // If no events are selected, then we don't have any to drag
                    return null;
                }
                else if (!allUserEditable(eventDragEvents)) {
                    // If any selected event is not user-editable, don't allow editing
                    return 'undraggable';
                }
                else if (eventDragEvents.length > 1) {
                    // If more than one event is selected, don't allow edge dragging
                    return 'center';
                }
                else if (eventDragEvents.length === 1) {
                    var event = eventDragEvents[0];
                    var pxPerMilli = 1 / ui.millisPerPx.value;
                    var eventWidth = (event.end_PMILLIS - event.start_PMILLIS) * pxPerMilli;
                    if (eventWidth < minEventWidthForEdgeDraggability) {
                        // If event isn't very wide, don't try to allow edge dragging
                        return 'center';
                    }
                    else {
                        var mouseOffset = (mouseTime_PMILLIS - event.start_PMILLIS) * pxPerMilli;
                        if (mouseOffset < draggableEdgeWidth) {
                            // If mouse is near the left edge, drag the event's start-time
                            return 'start';
                        }
                        else if (mouseOffset < eventWidth - draggableEdgeWidth) {
                            // If mouse is in the center, drag the whole event
                            return 'center';
                        }
                        else {
                            // If mouse is near the right edge, drag the event's end-time
                            return 'end';
                        }
                    }
                }
                else {
                    // Should never get here, because we have clauses above for length === 0, length === 1, and length > 1
                    return null;
                }
            }
            var updateCursor = function () {
                if (!eventDragMode) {
                    var mouseCursors = { 'center': 'default', 'start': 'w-resize', 'end': 'e-resize', 'undraggable': 'default' };
                    var hoveredTime_PMILLIS = selection.hoveredTime_PMILLIS.value;
                    // if a multi-selection has been made, update the cursor based on all the events in the multi-selection
                    if (selection.selectedEvents.length > 1) {
                        rowContentPane.mouseCursor = mouseCursors[chooseEventDragMode(ui, hoveredTime_PMILLIS, selection.selectedEvents.toArray())];
                    }
                    else {
                        var hoveredEvent = selection.hoveredEvent.value;
                        var hoveredEvents = (webglext.isNotEmpty(hoveredEvent) ? [hoveredEvent] : []);
                        rowContentPane.mouseCursor = mouseCursors[chooseEventDragMode(ui, hoveredTime_PMILLIS, hoveredEvents)];
                    }
                }
            };
            ui.millisPerPx.changed.on(updateCursor);
            selection.hoveredTime_PMILLIS.changed.on(updateCursor);
            selection.hoveredEvent.changed.on(updateCursor);
            rowContentPane.mouseDown.on(function (ev) {
                if (webglext.isLeftMouseDown(ev.mouseEvent)) {
                    var eventDragEventsSet = selection.selectedEvents;
                    eventDragEvents = eventDragEventsSet.toArray();
                    eventDragMode = chooseEventDragMode(ui, timeAtPointer_PMILLIS(ev), eventDragEvents);
                    eventDragSnapTimes_PMILLIS = new Array();
                    var numSnapTimes = 0;
                    var allEventGuids = row.eventGuids;
                    for (var n = 0; n < allEventGuids.length; n++) {
                        var eventGuid = allEventGuids.valueAt(n);
                        if (!eventDragEventsSet.hasId(eventGuid)) {
                            var event = model.event(eventGuid);
                            eventDragSnapTimes_PMILLIS.push(event.start_PMILLIS);
                            eventDragSnapTimes_PMILLIS.push(event.end_PMILLIS);
                        }
                    }
                    eventDragSnapTimes_PMILLIS.sort();
                }
            });
            function findSnapShift_MILLIS(t_PMILLIS, maxShift_MILLIS) {
                var i = webglext.indexNearest(eventDragSnapTimes_PMILLIS, t_PMILLIS);
                if (i >= 0) {
                    var shift_MILLIS = eventDragSnapTimes_PMILLIS[i] - t_PMILLIS;
                    if (Math.abs(shift_MILLIS) <= maxShift_MILLIS) {
                        return shift_MILLIS;
                    }
                }
                return null;
            }
            // Compute (and remember) the pointer time, for use by the event-drag listeners below
            //
            var eventDragPointer_PMILLIS = null;
            var updateEventDragPointer = function (ev) {
                if (webglext.isLeftMouseDown(ev.mouseEvent) && eventDragMode) {
                    eventDragPointer_PMILLIS = timeAtPointer_PMILLIS(ev);
                }
            };
            rowContentPane.mouseDown.on(updateEventDragPointer);
            rowContentPane.mouseMove.on(updateEventDragPointer);
            // Dragging event-center
            //
            var grabEventCenter = function () {
                if (eventDragMode === 'center') {
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        eventDragOffsets_MILLIS[event.eventGuid] = eventDragPointer_PMILLIS - event.start_PMILLIS;
                    }
                    // If this is a simple click-and-release, leave the mouse-cursor alone --
                    // but once we can tell that it's actually a drag, change to a drag cursor
                    //
                    var beginDrag = function () {
                        rowContentPane.mouseCursor = 'move';
                    };
                    rowContentPane.mouseMove.on(beginDrag);
                    var pendingBeginDrag = setTimeout(beginDrag, 300);
                    var endDrag = function () {
                        clearTimeout(pendingBeginDrag);
                        rowContentPane.mouseMove.off(beginDrag);
                        rowContentPane.mouseUp.off(endDrag);
                    };
                    rowContentPane.mouseUp.on(endDrag);
                }
            };
            rowContentPane.mouseDown.on(grabEventCenter);
            var dragEventCenter = function () {
                if (eventDragMode === 'center') {
                    var maxSnapShift_MILLIS = snapToDistance * (timeAxis.tSize_MILLIS / rowContentPane.viewport.w);
                    var snapShift_MILLIS = null;
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newStart_PMILLIS = (eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid]);
                        var newEnd_PMILLIS = event.end_PMILLIS + (newStart_PMILLIS - event.start_PMILLIS);
                        var eventStartSnapShift_MILLIS = findSnapShift_MILLIS(newStart_PMILLIS, maxSnapShift_MILLIS);
                        if (webglext.isNotEmpty(eventStartSnapShift_MILLIS)) {
                            if (!webglext.isNotEmpty(snapShift_MILLIS) || Math.abs(eventStartSnapShift_MILLIS) < Math.abs(snapShift_MILLIS)) {
                                snapShift_MILLIS = eventStartSnapShift_MILLIS;
                            }
                        }
                        var eventEndSnapShift_MILLIS = findSnapShift_MILLIS(newEnd_PMILLIS, maxSnapShift_MILLIS);
                        if (webglext.isNotEmpty(eventEndSnapShift_MILLIS)) {
                            if (!webglext.isNotEmpty(snapShift_MILLIS) || Math.abs(eventEndSnapShift_MILLIS) < Math.abs(snapShift_MILLIS)) {
                                snapShift_MILLIS = eventEndSnapShift_MILLIS;
                            }
                        }
                    }
                    if (!webglext.isNotEmpty(snapShift_MILLIS)) {
                        snapShift_MILLIS = 0;
                    }
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newStart_PMILLIS = eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid] + snapShift_MILLIS;
                        var newEnd_PMILLIS = event.end_PMILLIS + (newStart_PMILLIS - event.start_PMILLIS);
                        event.setInterval(newStart_PMILLIS, newEnd_PMILLIS);
                    }
                }
            };
            rowContentPane.mouseMove.on(dragEventCenter);
            // Dragging event-start
            //
            var grabEventStart = function () {
                if (eventDragMode === 'start') {
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        eventDragOffsets_MILLIS[event.eventGuid] = eventDragPointer_PMILLIS - event.start_PMILLIS;
                    }
                }
            };
            rowContentPane.mouseDown.on(grabEventStart);
            var dragEventStart = function () {
                if (eventDragMode === 'start') {
                    var wMin_MILLIS = minEventWidthWhenDraggingEdge * timeAxis.vSize / rowContentPane.viewport.w;
                    var maxSnapShift_MILLIS = snapToDistance * (timeAxis.tSize_MILLIS / rowContentPane.viewport.w);
                    var snapShift_MILLIS = null;
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newStart_PMILLIS = eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid];
                        var eventSnapShift_MILLIS = findSnapShift_MILLIS(newStart_PMILLIS, maxSnapShift_MILLIS);
                        if (webglext.isNotEmpty(eventSnapShift_MILLIS)) {
                            if (!webglext.isNotEmpty(snapShift_MILLIS) || Math.abs(eventSnapShift_MILLIS) < Math.abs(snapShift_MILLIS)) {
                                snapShift_MILLIS = eventSnapShift_MILLIS;
                            }
                        }
                    }
                    if (!webglext.isNotEmpty(snapShift_MILLIS)) {
                        snapShift_MILLIS = 0;
                    }
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newStart_PMILLIS = eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid] + snapShift_MILLIS;
                        event.start_PMILLIS = Math.min(event.end_PMILLIS - wMin_MILLIS, newStart_PMILLIS);
                    }
                }
            };
            rowContentPane.mouseMove.on(dragEventStart);
            timeAxis.limitsChanged.on(dragEventStart);
            // Dragging event-end
            //
            var grabEventEnd = function () {
                if (eventDragMode === 'end') {
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        eventDragOffsets_MILLIS[event.eventGuid] = eventDragPointer_PMILLIS - event.end_PMILLIS;
                    }
                }
            };
            rowContentPane.mouseDown.on(grabEventEnd);
            var dragEventEnd = function () {
                if (eventDragMode === 'end') {
                    var wMin_MILLIS = minEventWidthWhenDraggingEdge * timeAxis.vSize / rowContentPane.viewport.w;
                    var maxSnapShift_MILLIS = snapToDistance * (timeAxis.tSize_MILLIS / rowContentPane.viewport.w);
                    var snapShift_MILLIS = null;
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newEnd_PMILLIS = eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid];
                        var eventSnapShift_MILLIS = findSnapShift_MILLIS(newEnd_PMILLIS, maxSnapShift_MILLIS);
                        if (webglext.isNotEmpty(eventSnapShift_MILLIS)) {
                            if (!webglext.isNotEmpty(snapShift_MILLIS) || Math.abs(eventSnapShift_MILLIS) < Math.abs(snapShift_MILLIS)) {
                                snapShift_MILLIS = eventSnapShift_MILLIS;
                            }
                        }
                    }
                    if (!webglext.isNotEmpty(snapShift_MILLIS)) {
                        snapShift_MILLIS = 0;
                    }
                    for (var n = 0; n < eventDragEvents.length; n++) {
                        var event = eventDragEvents[n];
                        var newEnd_PMILLIS = eventDragPointer_PMILLIS - eventDragOffsets_MILLIS[event.eventGuid] + snapShift_MILLIS;
                        event.end_PMILLIS = Math.max(event.start_PMILLIS + wMin_MILLIS, newEnd_PMILLIS);
                    }
                }
            };
            rowContentPane.mouseMove.on(dragEventEnd);
            timeAxis.limitsChanged.on(dragEventEnd);
            // Finish event-drag
            //
            rowContentPane.mouseUp.on(function (ev) {
                eventDragEvents = [];
                eventDragOffsets_MILLIS = {};
                eventDragSnapTimes_PMILLIS = [];
                eventDragPointer_PMILLIS = null;
                eventDragMode = null;
            });
            rowContentPane.dispose.on(function () {
                lanes.dispose();
                timeAxis.limitsChanged.off(dragEventEnd);
                timeAxis.limitsChanged.off(dragEventStart);
                ui.millisPerPx.changed.off(uiMillisPerPxChanged);
                ui.millisPerPx.changed.off(updateCursor);
                selection.hoveredTime_PMILLIS.changed.off(updateCursor);
                selection.hoveredEvent.changed.off(updateCursor);
                row.eventGuids.valueAdded.off(redraw);
                row.eventGuids.valueMoved.off(redraw);
                row.eventGuids.valueRemoved.off(redraw);
                row.eventGuids.valueRemoved.off(removeRedraw);
                row.eventGuids.valueAdded.off(watchEventAttrs);
                row.eventGuids.forEach(function (eventGuid) {
                    model.event(eventGuid).attrsChanged.off(redraw);
                });
            });
            return rowContentPane;
        };
    }
    webglext.newEventsRowPaneFactory = newEventsRowPaneFactory;
    function eventLimitsPainterHelper(limitsOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var lineColor = (webglext.isNotEmpty(limitsOpts) && webglext.isNotEmpty(limitsOpts.lineColor) ? limitsOpts.lineColor : new webglext.Color(1, 0, 0, 1));
        var lineThickness = (webglext.isNotEmpty(limitsOpts) && webglext.isNotEmpty(limitsOpts.lineThickness) ? limitsOpts.lineThickness : 2.5);
        var xyFrac_vColor_VERTSHADER = webglext.concatLines('                                                                ', '  attribute vec2 a_XyFrac;                                      ', '  attribute vec4 a_Color;                                       ', '                                                                ', '  varying vec4 v_Color;                                         ', '                                                                ', '  void main( ) {                                                ', '      gl_Position = vec4( ( -1.0 + 2.0*a_XyFrac ), 0.0, 1.0 );  ', '      v_Color = a_Color;                                        ', '  }                                                             ', '                                                                ');
        var program = new webglext.Program(xyFrac_vColor_VERTSHADER, webglext.varyingColor_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var a_Color = new webglext.Attribute(program, 'a_Color');
        var xys = new Float32Array(0);
        var xysBuffer = webglext.newDynamicBuffer();
        var rgbas = new Float32Array(0);
        var rgbasBuffer = webglext.newDynamicBuffer();
        return {
            paint: function (indexXys, indexRgbas, gl, viewport) {
                if (indexXys > 0) {
                    gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                    gl.enable(webglext.GL.BLEND);
                    program.use(gl);
                    xysBuffer.setData(xys.subarray(0, indexXys));
                    a_XyFrac.setDataAndEnable(gl, xysBuffer, 2, webglext.GL.FLOAT);
                    rgbasBuffer.setData(rgbas.subarray(0, indexRgbas));
                    a_Color.setDataAndEnable(gl, rgbasBuffer, 4, webglext.GL.FLOAT);
                    gl.drawArrays(webglext.GL.TRIANGLES, 0, Math.floor(indexXys / 2));
                    a_Color.disable(gl);
                    a_XyFrac.disable(gl);
                    program.endUse(gl);
                }
            },
            ensureCapacity: function (eventCount) {
                var numVertices = (6 * 3 /* triangles */ * eventCount);
                xys = webglext.ensureCapacityFloat32(xys, 2 * numVertices);
                rgbas = webglext.ensureCapacityFloat32(rgbas, 4 * numVertices);
            },
            fillEvent: function (laneIndex, eventIndex, indexXys, indexRgbas, viewport) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var wLine = lineThickness / viewport.w;
                var hLine = lineThickness / viewport.h;
                var jTop = rowTopPadding + (laneIndex) * laneHeight;
                var yTop = (viewport.h - jTop) / viewport.h;
                var jBottom = rowTopPadding + (laneIndex + 1) * laneHeight;
                var yBottom = (viewport.h - jBottom) / viewport.h;
                var yMid = (yTop + yBottom) / 2;
                var xLeft = webglext.isNotEmpty(event.startLimit_PMILLIS) ? timeAxis.tFrac(event.startLimit_PMILLIS) : 0;
                var xRight = webglext.isNotEmpty(event.endLimit_PMILLIS) ? timeAxis.tFrac(event.endLimit_PMILLIS) : 1;
                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xRight, yMid - hLine / 2, yMid + hLine / 2);
                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xLeft - wLine, yTop, yBottom);
                indexXys = webglext.putQuadXys(xys, indexXys, xRight, xRight + wLine, yTop, yBottom);
                indexRgbas = webglext.putRgbas(rgbas, indexRgbas, lineColor, 18);
                return { indexXys: indexXys, indexRgbas: indexRgbas };
            }
        };
    }
    function newEventLimitsPainterFactory(limitOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventLimitsPainterHelper(limitOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                var selectedEvents = ui.selection.selectedEvents;
                helper.ensureCapacity(lanes.numEvents);
                var indexXys = 0;
                var indexRgbas = 0;
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        // check whether the event is selected and has limits defined
                        if (selectedEvents.hasId(event.eventGuid) && (webglext.isNotEmpty(event.startLimit_PMILLIS) || webglext.isNotEmpty(event.endLimit_PMILLIS))) {
                            var indexes = helper.fillEvent(l, e, indexXys, indexRgbas, viewport);
                            indexXys = indexes.indexXys;
                            indexRgbas = indexes.indexRgbas;
                        }
                    }
                }
                helper.paint(indexXys, indexRgbas, gl, viewport);
            };
        };
    }
    webglext.newEventLimitsPainterFactory = newEventLimitsPainterFactory;
    var JointType;
    (function (JointType) {
        JointType[JointType["BEVEL"] = 0] = "BEVEL";
        JointType[JointType["MITER"] = 1] = "MITER";
    })(JointType = webglext.JointType || (webglext.JointType = {}));
    var FillPattern;
    (function (FillPattern) {
        FillPattern[FillPattern["solid"] = 0] = "solid";
        FillPattern[FillPattern["stripe"] = 1] = "stripe";
        FillPattern[FillPattern["gradient"] = 2] = "gradient";
    })(FillPattern = webglext.FillPattern || (webglext.FillPattern = {}));
    function eventStripedBarPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var topMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.topMargin) ? barOpts.topMargin : 1.2);
        var bottomMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.bottomMargin) ? barOpts.bottomMargin : 1.2);
        var borderThickness = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.borderThickness) ? barOpts.borderThickness : 2);
        var cornerType = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.cornerType) ? barOpts.cornerType : JointType.BEVEL);
        var defaultColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.defaultColor) ? barOpts.defaultColor : options.timelineFgColor.withAlphaTimes(0.4));
        var defaultColorSecondary = new webglext.Color(1, 1, 1, 1);
        var minimumVisibleWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.minimumVisibleWidth) ? barOpts.minimumVisibleWidth : 0);
        var stripeWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.stripeWidth) ? barOpts.stripeWidth : 5);
        var stripeSecondaryWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.stripeSecondaryWidth) ? barOpts.stripeSecondaryWidth : 5);
        var stripeSlant = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.stripeSlant) ? barOpts.stripeSlant : 1);
        var featherWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.featherWidth) ? barOpts.featherWidth : 2);
        var selection = ui.selection;
        var xyFrac_vColor_VERTSHADER = webglext.concatLines('                                                                ', '  attribute vec2 a_XyFrac;                                      ', '  attribute vec4 a_Color;                                       ', '  attribute vec4 a_ColorSecondary;                              ', '  attribute vec2 a_relativeXy;                                  ', '  attribute float a_fillPattern;                                ', '                                                                ', '  varying vec4 v_Color;                                         ', '  varying vec4 v_ColorSecondary;                                ', '  varying vec2 v_relativeXy;                                    ', '  varying float v_fillPattern;                                  ', '                                                                ', '  void main( ) {                                                ', '      gl_Position = vec4( ( -1.0 + 2.0*a_XyFrac ), 0.0, 1.0 );  ', '      v_Color = a_Color;                                        ', '      v_ColorSecondary = a_ColorSecondary;                      ', '      v_relativeXy = a_relativeXy;                              ', '      v_fillPattern = a_fillPattern;                            ', '  }                                                             ', '                                                                ');
        var fillPattern_FRAGSHADER = webglext.concatLines(' #define PI 3.1415926535897932384626433832795                                                  ', '                                                                                               ', ' precision lowp float;                                                                         ', ' // the width in pixels of the first color stripe                                              ', ' uniform float u_stripeWidth;                                                                  ', ' // the width in pixels of the second color stripe                                             ', ' uniform float u_stripeSecondaryWidth;                                                         ', ' // the slant of the stipes: 0 = horizontal, 1 = 45 degrees                                    ', ' uniform float u_slant;                                                                        ', ' // width in pixels of the antialiasing of the slant                                           ', ' uniform float u_featherWidth;                                                                 ', '                                                                                               ', ' varying vec4 v_Color;                                                                         ', ' varying vec4 v_ColorSecondary;                                                                ', ' varying vec2 v_relativeXy;                                                                    ', ' varying float v_fillPattern;                                                                  ', '                                                                                               ', ' void pattern_stripe( ) {                                                                      ', '     float stripeWidthTotal = u_stripeWidth + u_stripeSecondaryWidth;                          ', '                                                                                               ', '     // calculate the value indicating where we are in the stripe pattern                      ', '     float stripeCoord = mod( v_relativeXy.x + u_slant * v_relativeXy.y , stripeWidthTotal );  ', '                                                                                               ', '     // we are in the feather region beween the two stripes                                    ', '     if ( stripeCoord < u_featherWidth ) {                                                     ', '         float diff = stripeCoord / u_featherWidth;                                            ', '         gl_FragColor = vec4 ( v_Color.xyz * diff + (1.0-diff) * v_ColorSecondary.xyz, 1.0 );  ', '     }                                                                                         ', '     // we are in the color 1 stripe                                                           ', '     else if ( stripeCoord < u_stripeWidth ) {                                                 ', '         gl_FragColor = v_Color;                                                               ', '     }                                                                                         ', '     // we are the feather region between the two stripes                                      ', '     else if ( stripeCoord  < u_stripeWidth + u_featherWidth ) {                               ', '         float diff = ( stripeCoord - u_stripeWidth ) / u_featherWidth;                        ', '         gl_FragColor = vec4 ( v_Color.xyz * (1.0-diff) + diff * v_ColorSecondary.xyz, 1.0 );  ', '     }                                                                                         ', '     // we are in the color 2 stripe                                                           ', '     else {                                                                                    ', '         gl_FragColor = v_ColorSecondary;                                                      ', '     }                                                                                         ', ' }                                                                                             ', '                                                                                               ', ' void pattern_gradient( ) {                                                                    ', '     float stripeWidthTotal = u_stripeWidth + u_stripeSecondaryWidth;                          ', '                                                                                               ', '     // calculate the value indicating where we are in the stripe pattern                      ', '     float stripeCoord = mod( v_relativeXy.x + u_slant * v_relativeXy.y , stripeWidthTotal );  ', '                                                                                               ', '     float weightedCoord;                                                                      ', '     if ( stripeCoord < u_stripeWidth ) {                                                      ', '         float slope =  PI / u_stripeWidth;                                                    ', '         weightedCoord = slope * stripeCoord;                                                  ', '     }                                                                                         ', '     else {                                                                                    ', '         float slope = PI / u_stripeSecondaryWidth;                                            ', '         weightedCoord = PI + slope * ( stripeCoord - u_stripeWidth );                         ', '     }                                                                                         ', '                                                                                               ', '     // sin wave domain: [0, stripeWidthTotal ] range: [0, 1]                                  ', '     float frac = sin( weightedCoord ) * 2.0 - 1.0;                                            ', '                                                                                               ', '     // mix primary and secondary colors based on gradient fraction                            ', '     gl_FragColor = mix( v_Color, v_ColorSecondary, frac );                                    ', ' }                                                                                             ', '                                                                                               ', ' void pattern_solid( ) {                                                                       ', '     gl_FragColor = v_Color;                                                                   ', ' }                                                                                             ', '                                                                                               ', ' void main( ) {                                                                                ', '     if ( v_fillPattern == 1.0 ) {                                                             ', '         pattern_stripe( );                                                                    ', '     }                                                                                         ', '     else if ( v_fillPattern == 2.0 ) {                                                        ', '         pattern_gradient( );                                                                  ', '     }                                                                                         ', '     else {                                                                                    ', '         pattern_solid( );                                                                     ', '     }                                                                                         ', ' }                                                                                             ', '                                                                                               ', '                                                                                               ', '                                                                                               ');
        var program = new webglext.Program(xyFrac_vColor_VERTSHADER, fillPattern_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var a_Color = new webglext.Attribute(program, 'a_Color');
        var a_ColorSecondary = new webglext.Attribute(program, 'a_ColorSecondary');
        var a_relativeXy = new webglext.Attribute(program, 'a_relativeXy');
        var a_fillPattern = new webglext.Attribute(program, 'a_fillPattern');
        var u_stripeWidth = new webglext.Uniform1f(program, 'u_stripeWidth');
        var u_stripeSecondaryWidth = new webglext.Uniform1f(program, 'u_stripeSecondaryWidth');
        var u_slant = new webglext.Uniform1f(program, 'u_slant');
        var u_featherWidth = new webglext.Uniform1f(program, 'u_featherWidth');
        var xys = new Float32Array(0);
        var xysBuffer = webglext.newDynamicBuffer();
        var rgbas = new Float32Array(0);
        var rgbasBuffer = webglext.newDynamicBuffer();
        var rgbasSecondary = new Float32Array(0);
        var rgbasSecondaryBuffer = webglext.newDynamicBuffer();
        var relativeXys = new Float32Array(0);
        var relativeXysBuffer = webglext.newDynamicBuffer();
        var fillPattern = new Float32Array(0);
        var fillPatternBuffer = webglext.newDynamicBuffer();
        return {
            paint: function (indexXys, indexRgbas, gl, viewport, indexRelativeXys, indexFillPattern) {
                if (indexXys == 0 || indexRgbas == 0)
                    return;
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                program.use(gl);
                u_slant.setData(gl, stripeSlant);
                u_stripeWidth.setData(gl, stripeWidth);
                u_stripeSecondaryWidth.setData(gl, stripeSecondaryWidth);
                u_featherWidth.setData(gl, featherWidth);
                xysBuffer.setData(xys.subarray(0, indexXys));
                a_XyFrac.setDataAndEnable(gl, xysBuffer, 2, webglext.GL.FLOAT);
                rgbasBuffer.setData(rgbas.subarray(0, indexRgbas));
                a_Color.setDataAndEnable(gl, rgbasBuffer, 4, webglext.GL.FLOAT);
                rgbasSecondaryBuffer.setData(rgbasSecondary.subarray(0, indexRgbas));
                a_ColorSecondary.setDataAndEnable(gl, rgbasSecondaryBuffer, 4, webglext.GL.FLOAT);
                relativeXysBuffer.setData(relativeXys.subarray(0, indexRelativeXys));
                a_relativeXy.setDataAndEnable(gl, relativeXysBuffer, 2, webglext.GL.FLOAT);
                fillPatternBuffer.setData(fillPattern.subarray(0, indexFillPattern));
                a_fillPattern.setDataAndEnable(gl, fillPatternBuffer, 1, webglext.GL.FLOAT);
                gl.drawArrays(webglext.GL.TRIANGLES, 0, Math.floor(indexXys / 2));
                a_Color.disable(gl);
                a_XyFrac.disable(gl);
                a_ColorSecondary.disable(gl);
                a_fillPattern.disable(gl);
                a_relativeXy.disable(gl);
                program.endUse(gl);
            },
            ensureCapacity: function (eventCount) {
                var numVertices = (6 * (1 /*quads*/)) * eventCount;
                xys = webglext.ensureCapacityFloat32(xys, 2 * numVertices);
                rgbas = webglext.ensureCapacityFloat32(rgbas, 4 * numVertices);
                rgbasSecondary = webglext.ensureCapacityFloat32(rgbasSecondary, 4 * numVertices);
                relativeXys = webglext.ensureCapacityFloat32(relativeXys, 2 * numVertices);
                fillPattern = webglext.ensureCapacityFloat32(fillPattern, numVertices);
            },
            fillEvent: function (laneIndex, eventIndex, indexXys, indexRgbas, viewport, indexRelativeXys, indexFillPattern) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var wBorder = borderThickness / viewport.w;
                var hBorder = borderThickness / viewport.h;
                var _topMargin = webglext.isNotEmpty(event.topMargin) ? event.topMargin : topMargin;
                var _bottomMargin = webglext.isNotEmpty(event.bottomMargin) ? event.bottomMargin : bottomMargin;
                var jTop = rowTopPadding + (laneIndex) * laneHeight + _topMargin;
                var yTop = (viewport.h - jTop) / viewport.h;
                var jBottom = rowTopPadding + (laneIndex + 1) * laneHeight - _bottomMargin;
                var yBottom = (viewport.h - jBottom) / viewport.h;
                var xLeft = timeAxis.tFrac(event.start_PMILLIS);
                var xRight = timeAxis.tFrac(event.end_PMILLIS);
                var xWidthPixels = viewport.w * (xRight - xLeft);
                var yHeightPixels = jTop - jBottom;
                if (!(xRight < 0 || xLeft > 1) && xWidthPixels > minimumVisibleWidth) {
                    // Fill
                    var fillColor = (event.bgColor || defaultColor);
                    var fillColorSecondary = (event.bgSecondaryColor || defaultColorSecondary);
                    if (event === selection.hoveredEvent.value) {
                        fillColor = webglext.darker(fillColor, 0.8);
                        fillColorSecondary = webglext.darker(fillColorSecondary, 0.8);
                    }
                    indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yTop - hBorder, yBottom + hBorder);
                    var startIndex = indexRgbas;
                    webglext.putQuadRgbas(rgbas, startIndex, fillColor);
                    indexRgbas = webglext.putQuadRgbas(rgbasSecondary, startIndex, fillColorSecondary);
                    // create a quad with relative coordinates
                    indexRelativeXys = webglext.putQuadXys(relativeXys, indexRelativeXys, 0.0, xWidthPixels, 0.0, yHeightPixels);
                    // Set the fillPatternValue per vertex of the quad
                    var fillPatternValue = event.fillPattern;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                    fillPattern[indexFillPattern++] = fillPatternValue;
                }
                return { indexXys: indexXys, indexRgbas: indexRgbas, indexRelativeXys: indexRelativeXys, indexFillPattern: indexFillPattern };
            }
        };
    }
    function eventDashedBorderPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var topMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.topMargin) ? barOpts.topMargin : 1.2);
        var bottomMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.bottomMargin) ? barOpts.bottomMargin : 1.2);
        var borderThickness = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.borderThickness) ? barOpts.borderThickness : 2);
        var cornerType = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.cornerType) ? barOpts.cornerType : JointType.BEVEL);
        var defaultColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.defaultColor) ? barOpts.defaultColor : options.timelineFgColor.withAlphaTimes(0.4));
        var defaultBorderColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.defaultBorderColor) ? barOpts.defaultBorderColor : null);
        var selectedBorderColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.selectedBorderColor) ? barOpts.selectedBorderColor : options.timelineFgColor);
        var minimumVisibleWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.minimumVisibleWidth) ? barOpts.minimumVisibleWidth : 0);
        var dashLength = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.dashLength) ? barOpts.dashLength : 5);
        var defaultSecondaryColor = new webglext.Color(0, 0, 0, 0);
        var selection = ui.selection;
        var dashedBorder_VERTSHADER = webglext.concatLines('                                                                ', '  attribute vec2 a_XyFrac;                                      ', '  attribute vec4 a_Color;                                       ', '  attribute vec4 a_SecondaryColor;                              ', '  attribute float a_LengthSoFar;                                ', '                                                                ', '  varying vec4 v_Color;                                         ', '  varying vec4 v_SecondaryColor;                                ', '  varying float f_LengthSoFar;                                  ', '                                                                ', '  void main( ) {                                                ', '      gl_Position = vec4( ( -1.0 + 2.0*a_XyFrac ), 0.0, 1.0 );  ', '      v_Color = a_Color;                                        ', '      v_SecondaryColor = a_SecondaryColor;                      ', '      f_LengthSoFar = a_LengthSoFar;                            ', '  }                                                             ', '                                                                ');
        var varyingBorder_FRAGSHADER = webglext.concatLines('                                                                            ', '  precision lowp float;                                                     ', '  varying vec4 v_Color;                                                     ', '  varying vec4 v_SecondaryColor;                                            ', '  varying float f_LengthSoFar;                                              ', '  //dashes are u_DashLength_PX pixels long                                  ', '  uniform float u_DashLength_PX;                                            ', '                                                                            ', '  void main( ) {                                                            ', '      gl_FragColor = v_Color;                                               ', '                                                                            ', '      if (f_LengthSoFar > 0.0) {                                            ', '         float mod = mod(f_LengthSoFar, u_DashLength_PX * 2.0);             ', '         float alpha = 1.0;                                                 ', '         if ( mod < u_DashLength_PX ) {                                     ', '            gl_FragColor = v_SecondaryColor;                                ', '         }                                                                  ', '         else {                                                             ', '            gl_FragColor = v_Color;                                         ', '         }                                                                  ', '      }                                                                     ', '      else {                                                                ', '         gl_FragColor = v_Color;                                            ', '      }                                                                     ', '  }                                                                         ', '                                                                            ');
        var program = new webglext.Program(dashedBorder_VERTSHADER, varyingBorder_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var a_Color = new webglext.Attribute(program, 'a_Color');
        var a_SecondaryColor = new webglext.Attribute(program, 'a_SecondaryColor');
        var a_LengthSoFar = new webglext.Attribute(program, 'a_LengthSoFar');
        var u_DashLength_PX = new webglext.Uniform1f(program, 'u_DashLength_PX');
        var xys = new Float32Array(0);
        var xysBuffer = webglext.newDynamicBuffer();
        var rgbas = new Float32Array(0);
        var rgbasBuffer = webglext.newDynamicBuffer();
        var rgbasSecondary = new Float32Array(0);
        var rgbasSecondaryBuffer = webglext.newDynamicBuffer();
        var lengths = new Float32Array(0);
        var lengthsBuffer = webglext.newDynamicBuffer();
        return {
            paint: function (indexXys, indexRgbas, gl, viewport, indexLengthSoFar) {
                if (indexXys == 0 || indexRgbas == 0)
                    return;
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                program.use(gl);
                u_DashLength_PX.setData(gl, dashLength);
                xysBuffer.setData(xys.subarray(0, indexXys));
                a_XyFrac.setDataAndEnable(gl, xysBuffer, 2, webglext.GL.FLOAT);
                rgbasBuffer.setData(rgbas.subarray(0, indexRgbas));
                a_Color.setDataAndEnable(gl, rgbasBuffer, 4, webglext.GL.FLOAT);
                rgbasSecondaryBuffer.setData(rgbasSecondary.subarray(0, indexRgbas));
                a_SecondaryColor.setDataAndEnable(gl, rgbasSecondaryBuffer, 4, webglext.GL.FLOAT);
                lengthsBuffer.setData(lengths.subarray(0, indexLengthSoFar));
                a_LengthSoFar.setDataAndEnable(gl, lengthsBuffer, 1, webglext.GL.FLOAT);
                gl.drawArrays(webglext.GL.TRIANGLES, 0, Math.floor(indexXys / 2));
                a_Color.disable(gl);
                a_SecondaryColor.disable(gl);
                a_XyFrac.disable(gl);
                a_LengthSoFar.disable(gl);
                program.endUse(gl);
            },
            ensureCapacity: function (eventCount) {
                var numVertices;
                switch (cornerType) {
                    case JointType.BEVEL:
                        numVertices = (6 * (4 /*quads*/) + 3 * (4 /*triangles*/)) * eventCount;
                        break;
                    default:
                        numVertices = (6 * (4 /*quads*/)) * eventCount;
                        break;
                }
                xys = webglext.ensureCapacityFloat32(xys, 2 * numVertices);
                rgbas = webglext.ensureCapacityFloat32(rgbas, 4 * numVertices);
                rgbasSecondary = webglext.ensureCapacityFloat32(rgbasSecondary, 4 * numVertices);
                lengths = webglext.ensureCapacityFloat32(lengths, numVertices);
            },
            fillEvent: function (laneIndex, eventIndex, indexXys, indexRgbas, viewport, indexLengthSoFar) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var wBorder = borderThickness / viewport.w;
                var hBorder = borderThickness / viewport.h;
                var _topMargin = webglext.isNotEmpty(event.topMargin) ? event.topMargin : topMargin;
                var _bottomMargin = webglext.isNotEmpty(event.bottomMargin) ? event.bottomMargin : bottomMargin;
                var jTop = rowTopPadding + (laneIndex) * laneHeight + _topMargin;
                var yTop = (viewport.h - jTop) / viewport.h;
                var jBottom = rowTopPadding + (laneIndex + 1) * laneHeight - _bottomMargin;
                var yBottom = (viewport.h - jBottom) / viewport.h;
                var xLeft = timeAxis.tFrac(event.start_PMILLIS);
                var xRight = timeAxis.tFrac(event.end_PMILLIS);
                var widthPixels = viewport.w * (xRight - xLeft);
                var heightPixels = jBottom - jTop; // confirmed jBottom > jTop
                var setLengthsVertical = function (bottomEdge, topEdge) {
                    lengths[indexLengthSoFar++] = topEdge;
                    lengths[indexLengthSoFar++] = topEdge;
                    lengths[indexLengthSoFar++] = bottomEdge;
                    lengths[indexLengthSoFar++] = bottomEdge;
                    lengths[indexLengthSoFar++] = topEdge;
                    lengths[indexLengthSoFar++] = bottomEdge;
                    // for convenience, return the length of the edge
                    return Math.abs(bottomEdge - topEdge);
                };
                var setLengthsHorizontal = function (leftEdge, rightEdge) {
                    lengths[indexLengthSoFar++] = leftEdge;
                    lengths[indexLengthSoFar++] = rightEdge;
                    lengths[indexLengthSoFar++] = leftEdge;
                    lengths[indexLengthSoFar++] = leftEdge;
                    lengths[indexLengthSoFar++] = rightEdge;
                    lengths[indexLengthSoFar++] = rightEdge;
                    // for convenience, return the length of the edge
                    return Math.abs(leftEdge - rightEdge);
                };
                var setLengthsTriangle = function (length) {
                    lengths[indexLengthSoFar++] = length;
                    lengths[indexLengthSoFar++] = length;
                    lengths[indexLengthSoFar++] = length;
                };
                if (!(xRight < 0 || xLeft > 1) && widthPixels > minimumVisibleWidth) {
                    // Border
                    var borderColor = (event.borderColor || event.bgColor || defaultBorderColor);
                    var borderSecondaryColor = (event.borderSecondaryColor || defaultSecondaryColor);
                    if (selection.selectedEvents.hasValue(event)) {
                        borderColor = selectedBorderColor;
                    }
                    if (borderColor) {
                        switch (cornerType) {
                            case JointType.BEVEL:
                                // Quads
                                // top edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yTop, yTop - hBorder);
                                indexXys = webglext.putUpperRightTriangleXys(xys, indexXys, xLeft, xLeft + wBorder, yBottom + hBorder, yBottom);
                                // right edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xRight - wBorder, xRight, yTop - hBorder, yBottom + hBorder);
                                indexXys = webglext.putLowerRightTriangleXys(xys, indexXys, xLeft, xLeft + wBorder, yTop, yTop - hBorder);
                                // bottom edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yBottom + hBorder, yBottom);
                                indexXys = webglext.putLowerLeftTriangleXys(xys, indexXys, xRight - wBorder, xRight, yTop, yTop - hBorder);
                                // left edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xLeft + wBorder, yTop - hBorder, yBottom + hBorder);
                                indexXys = webglext.putUpperLeftTriangleXys(xys, indexXys, xRight - wBorder, xRight, yBottom + hBorder, yBottom);
                                // Colors
                                var startIndex = indexRgbas;
                                webglext.putRgbas(rgbas, startIndex, borderColor, 24);
                                indexRgbas = webglext.putRgbas(rgbasSecondary, startIndex, borderSecondaryColor, 24);
                                // Colors
                                startIndex = indexRgbas;
                                webglext.putRgbas(rgbas, startIndex, borderColor, 12);
                                indexRgbas = webglext.putRgbas(rgbasSecondary, startIndex, borderSecondaryColor, 12);
                                // Stipple
                                if (!event.isBorderDashed) {
                                    setLengthsHorizontal(-1, -1);
                                    setLengthsTriangle(-1);
                                    setLengthsVertical(-1, -1);
                                    setLengthsTriangle(-1);
                                    setLengthsHorizontal(-1, -1);
                                    setLengthsTriangle(-1);
                                    setLengthsVertical(-1, -1);
                                    setLengthsTriangle(-1);
                                }
                                else {
                                    var cumulativeLength = 0;
                                    // top edge
                                    cumulativeLength += setLengthsHorizontal(cumulativeLength, cumulativeLength + widthPixels);
                                    setLengthsTriangle(cumulativeLength);
                                    // right edge
                                    cumulativeLength += setLengthsVertical(cumulativeLength + heightPixels, cumulativeLength);
                                    setLengthsTriangle(cumulativeLength);
                                    // bottom edge
                                    cumulativeLength += setLengthsHorizontal(cumulativeLength, cumulativeLength + widthPixels);
                                    setLengthsTriangle(cumulativeLength);
                                    // left edge
                                    cumulativeLength += setLengthsVertical(cumulativeLength + heightPixels, cumulativeLength);
                                    setLengthsTriangle(cumulativeLength);
                                }
                                break;
                            default:
                                // top edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xRight - wBorder, yTop, yTop - hBorder);
                                // right edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xRight - wBorder, xRight, yTop, yBottom + hBorder);
                                // bottom edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight, yBottom + hBorder, yBottom);
                                // left edge
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xLeft + wBorder, yTop - hBorder, yBottom);
                                // color
                                var startIndex = indexRgbas;
                                webglext.putRgbas(rgbas, startIndex, borderColor, 24);
                                indexRgbas = webglext.putRgbas(rgbasSecondary, startIndex, borderSecondaryColor, 24);
                                // Stipple
                                if (!event.isBorderDashed) {
                                    setLengthsHorizontal(-1, -1);
                                    setLengthsVertical(-1, -1);
                                    setLengthsHorizontal(-1, -1);
                                    setLengthsVertical(-1, -1);
                                }
                                else {
                                    var cumulativeLength = 0;
                                    // top edge
                                    cumulativeLength += setLengthsHorizontal(cumulativeLength, cumulativeLength + widthPixels);
                                    // right edge
                                    cumulativeLength += setLengthsVertical(cumulativeLength + heightPixels, cumulativeLength);
                                    // bottom edge
                                    cumulativeLength += setLengthsHorizontal(cumulativeLength, cumulativeLength + widthPixels);
                                    // left edge
                                    cumulativeLength += setLengthsVertical(cumulativeLength + heightPixels, cumulativeLength);
                                }
                                break;
                        }
                    }
                }
                return { indexXys: indexXys, indexRgbas: indexRgbas, indexLengthSoFar: indexLengthSoFar };
            }
        };
    }
    function newEventStripedBarsPainterFactory(barOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventStripedBarPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                helper.ensureCapacity(lanes.numEvents);
                var indexXys = 0;
                var indexRgbas = 0;
                var indexRelativeXys = 0;
                var indexFillPattern = 0;
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        var indexes = helper.fillEvent(l, e, indexXys, indexRgbas, viewport, indexRelativeXys, indexFillPattern);
                        indexXys = indexes.indexXys;
                        indexRgbas = indexes.indexRgbas;
                        indexRelativeXys = indexes.indexRelativeXys;
                        indexFillPattern = indexes.indexFillPattern;
                    }
                }
                helper.paint(indexXys, indexRgbas, gl, viewport, indexRelativeXys, indexFillPattern);
            };
        };
    }
    webglext.newEventStripedBarsPainterFactory = newEventStripedBarsPainterFactory;
    function newEventDashedBordersPainterFactory(barOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventDashedBorderPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                helper.ensureCapacity(lanes.numEvents);
                var indexXys = 0;
                var indexRgbas = 0;
                var indexLengthSoFar = 0;
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        var indexes = helper.fillEvent(l, e, indexXys, indexRgbas, viewport, indexLengthSoFar);
                        indexXys = indexes.indexXys;
                        indexRgbas = indexes.indexRgbas;
                        indexLengthSoFar = indexes.indexLengthSoFar;
                    }
                }
                helper.paint(indexXys, indexRgbas, gl, viewport, indexLengthSoFar);
            };
        };
    }
    webglext.newEventDashedBordersPainterFactory = newEventDashedBordersPainterFactory;
    function eventIconsPainterHelper(iconOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var topMargin = (webglext.isNotEmpty(iconOpts) && webglext.isNotEmpty(iconOpts.topMargin) ? iconOpts.topMargin : 1.2);
        var bottomMargin = (webglext.isNotEmpty(iconOpts) && webglext.isNotEmpty(iconOpts.bottomMargin) ? iconOpts.bottomMargin : 1.2);
        var vAlign = (webglext.isNotEmpty(iconOpts) && webglext.isNotEmpty(iconOpts.vAlign) ? iconOpts.vAlign : 0.5);
        var textureRenderer = new webglext.TextureRenderer();
        return {
            textureRenderer: textureRenderer,
            paintEvent: function (laneIndex, eventIndex, gl, viewport) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var eventStyle = ui.eventStyle(event.styleGuid);
                var jTop = rowTopPadding + (laneIndex) * laneHeight + topMargin;
                var yFrac = (viewport.h - jTop - (1.0 - vAlign) * (laneHeight - topMargin - bottomMargin)) / viewport.h;
                for (var n = 0; n < eventStyle.numIcons; n++) {
                    var icon = eventStyle.icon(n);
                    var iconTime_PMILLIS = event.start_PMILLIS + icon.hPos * (event.end_PMILLIS - event.start_PMILLIS);
                    var xFrac = timeAxis.tFrac(iconTime_PMILLIS);
                    var w = icon.displayWidth / viewport.w;
                    if (-w <= xFrac && xFrac <= 1 + w) {
                        var iconTexture = ui.loadImage(icon.url, function () { drawable.redraw(); });
                        if (iconTexture) {
                            textureRenderer.draw(gl, iconTexture, xFrac, yFrac, { xAnchor: icon.hAlign, yAnchor: vAlign, width: icon.displayWidth, height: icon.displayHeight });
                        }
                    }
                }
            }
        };
    }
    function newEventIconsPainterFactory(iconOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventIconsPainterHelper(iconOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                helper.textureRenderer.begin(gl, viewport);
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        helper.paintEvent(l, e, gl, viewport);
                    }
                }
                helper.textureRenderer.end(gl);
            };
        };
    }
    webglext.newEventIconsPainterFactory = newEventIconsPainterFactory;
    function calculateTextWidth(textEnabled, labelText, fgColor, textDefaultColor, textTextures, viewport) {
        var wText = 0;
        var textTexture;
        if (textEnabled && labelText) {
            var textColor = webglext.isNotEmpty(fgColor) ? fgColor : textDefaultColor;
            textTexture = textTextures.value(textColor.rgbaString, labelText);
            wText = textTexture.w / viewport.w;
        }
        return {
            wText: wText,
            textTexture: textTexture
        };
    }
    function eventLabelsPainterHelper(labelOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var topMargin = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.topMargin) ? labelOpts.topMargin : 1.2);
        var bottomMargin = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.bottomMargin) ? labelOpts.bottomMargin : 1.2);
        var leftMargin = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.leftMargin) ? labelOpts.leftMargin : 4);
        var rightMargin = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.rightMargin) ? labelOpts.rightMargin : 4);
        var vAlign = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.vAlign) ? labelOpts.vAlign : 0.5);
        var spacing = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.spacing) ? labelOpts.spacing : 3);
        var extendBeyondBar = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.extendBeyondBar) ? labelOpts.extendBeyondBar : false);
        var textMode = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.textMode) ? labelOpts.textMode : 'force');
        // Icon options
        var iconsEnabled = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.iconsEnabled) ? labelOpts.iconsEnabled : true);
        var iconsForceWidth = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.iconsForceWidth) ? labelOpts.iconsForceWidth : 'auto');
        var iconsForceHeight = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.iconsForceHeight) ? labelOpts.iconsForceHeight : 'auto');
        var iconsSizeFactor = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.iconsSizeFactor) ? labelOpts.iconsSizeFactor : 1);
        // Text options
        var textEnabled = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.textEnabled) ? labelOpts.textEnabled : true);
        var textDefaultColor = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.textDefaultColor) ? labelOpts.textDefaultColor : options.timelineFgColor);
        var textFont = (webglext.isNotEmpty(labelOpts) && webglext.isNotEmpty(labelOpts.textFont) ? labelOpts.textFont : options.timelineFont);
        // XXX: Old icon textures never get cleaned out
        var iconTextures = {};
        var textTextures = webglext.newTextTextureCache2(textFont);
        var textureRenderer = new webglext.TextureRenderer();
        return {
            textTextures: textTextures,
            textureRenderer: textureRenderer,
            paintEvent: function (laneIndex, eventIndex, gl, viewport) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var labelTopMargin = webglext.isNotEmpty(event.labelTopMargin) ? event.labelTopMargin : topMargin;
                var labelBottomMargin = webglext.isNotEmpty(event.labelBottomMargin) ? event.labelBottomMargin : bottomMargin;
                var labelVAlign = webglext.isNotEmpty(event.labelVAlign) ? event.labelVAlign : vAlign;
                var labelVPos = webglext.isNotEmpty(event.labelVPos) ? event.labelVPos : labelVAlign;
                var labelHAlign = webglext.isNotEmpty(event.labelHAlign) ? event.labelHAlign : 0;
                var labelHPos = webglext.isNotEmpty(event.labelHPos) ? event.labelHPos : labelHAlign;
                var jTop = rowTopPadding + (laneIndex) * laneHeight + labelTopMargin;
                var yFrac = (viewport.h - jTop - (1.0 - labelVAlign) * (laneHeight - labelTopMargin - labelBottomMargin)) / viewport.h;
                var xLeftMin = 2 / viewport.w;
                var xRightMax = (viewport.w - 2) / viewport.w;
                var wLeftIndent = leftMargin / viewport.w;
                var wRightIndent = rightMargin / viewport.w;
                var xStart = timeAxis.tFrac(event.start_PMILLIS);
                var xEnd = timeAxis.tFrac(event.end_PMILLIS);
                var wTotal = (xEnd - wRightIndent) - (xStart + wLeftIndent);
                var wSpacing = (spacing / viewport.w);
                if (!(xEnd <= 0 || xStart > 1)) {
                    var xLeft;
                    var xRight;
                    if (extendBeyondBar) {
                        if (eventIndex + 1 < lane.length) {
                            var nextEvent = lane.event(eventIndex + 1);
                            var nextStart_PMILLIS = webglext.effectiveEdges_PMILLIS(ui, nextEvent)[0];
                            xRight = timeAxis.tFrac(nextStart_PMILLIS);
                        }
                        else {
                            xRight = xRightMax;
                        }
                        if (eventIndex - 1 >= 0) {
                            var previousEvent = lane.event(eventIndex - 1);
                            var previousEnd_PMILLIS = webglext.effectiveEdges_PMILLIS(ui, previousEvent)[1];
                            xLeft = timeAxis.tFrac(previousEnd_PMILLIS);
                        }
                        else {
                            xLeft = xLeftMin;
                        }
                    }
                    else {
                        xRight = xEnd;
                        xLeft = xStart;
                    }
                    // calculate Text width
                    var calculatedTextWidth = calculateTextWidth(textEnabled, event.label, event.fgColor, textDefaultColor, textTextures, viewport);
                    var wText = calculatedTextWidth.wText;
                    var textTexture = calculatedTextWidth.textTexture;
                    // calculate Icon width (and start load if necessary)
                    var wIcon = 0;
                    var wIconPlusSpacing = 0;
                    var iconWidth;
                    var iconHeight;
                    var iconTexture;
                    if (iconsEnabled && event.labelIcon) {
                        iconTexture = iconTextures[event.labelIcon];
                        if (webglext.isNotEmpty(iconTexture)) {
                            iconWidth = (webglext.isNumber(iconsForceWidth) ? iconsForceWidth : (iconsForceWidth === 'imageSize' ? iconTexture.w : null));
                            iconHeight = (webglext.isNumber(iconsForceHeight) ? iconsForceHeight : (iconsForceHeight === 'imageSize' ? iconTexture.h : null));
                            var wIconKnown = webglext.isNotEmpty(iconWidth);
                            var hIconKnown = webglext.isNotEmpty(iconHeight);
                            if (!wIconKnown && !hIconKnown) {
                                iconHeight = Math.round(iconsSizeFactor * (laneHeight - labelTopMargin - labelBottomMargin));
                                iconWidth = iconTexture.w * iconHeight / iconTexture.h;
                            }
                            else if (!wIconKnown) {
                                iconHeight = Math.round(iconsSizeFactor * iconHeight);
                                iconWidth = iconTexture.w * iconHeight / iconTexture.h;
                            }
                            else if (!hIconKnown) {
                                iconWidth = Math.round(iconsSizeFactor * iconWidth);
                                iconHeight = iconTexture.h * iconWidth / iconTexture.w;
                            }
                            else {
                                iconWidth = Math.round(iconsSizeFactor * iconWidth);
                                iconHeight = Math.round(iconsSizeFactor * iconHeight);
                            }
                            wIcon = (iconWidth / viewport.w);
                            wIconPlusSpacing = wIcon + wSpacing;
                        }
                        // A null in the map means a fetch has already been initiated
                        // ... either it is still in progress, or it has already failed
                        else if (iconTexture !== null) {
                            iconTextures[event.labelIcon] = null;
                            var image = new Image();
                            image.onload = (function (url, img) {
                                return function () {
                                    var wImage = img.naturalWidth;
                                    var hImage = img.naturalHeight;
                                    iconTextures[url] = new webglext.Texture2D(wImage, hImage, webglext.GL.LINEAR, webglext.GL.LINEAR, function (g) {
                                        g.drawImage(img, 0, 0);
                                    });
                                    drawable.redraw();
                                };
                            })(event.labelIcon, image);
                            image.src = event.labelIcon;
                        }
                    }
                    // NOTE: With extendBeyondBar=true, we detect when there is insufficient space between the current event
                    //       and those to either side to display the text + icon. However, if one event has right aligned text
                    //       and the other has left aligned text, so both text labels overlap into the same space between the
                    //       events, we don't currently try to detect that.
                    // Determine whether there is enough space to display both text and icon, or only icon, or neither
                    // coordinates of the start edge of the icon + label
                    var xStartLabel = xStart + wLeftIndent - (wSpacing + wIcon + wText) * labelHPos + (wTotal) * labelHAlign;
                    // coordinates of the end edge of the icon + label
                    var xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                    // adjust xStartLabel and xEndLabel if they fall off the screen
                    if (xStartLabel < xLeftMin) {
                        xStartLabel = xLeftMin;
                        xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                    }
                    else if (xEndLabel > xRightMax) {
                        xEndLabel = xRightMax;
                        xStartLabel = xEndLabel - (wSpacing + wIcon + wText);
                    }
                    if (textMode === 'truncate') {
                        var labelText = event.label;
                        while (!!labelText && labelText !== "...") {
                            if (xEndLabel > xRight || xStartLabel < xLeft) {
                                // there is not enough room for the text, begin truncating the text
                                labelText = labelText.substring(0, labelText.length - 4).concat("...");
                                var calculatedTextWidth = calculateTextWidth(textEnabled, labelText, event.fgColor, textDefaultColor, textTextures, viewport);
                                wText = calculatedTextWidth.wText;
                                textTexture = calculatedTextWidth.textTexture;
                                xStartLabel = xStart + wLeftIndent - (wSpacing + wIcon + wText) * labelHPos + wTotal * labelHAlign;
                                // coordinates of the end edge of the icon + label
                                xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                                // adjust xStartLabel and xEndLabel if they fall off the screen
                                if (xStartLabel < xLeftMin) {
                                    xStartLabel = xLeftMin;
                                    xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                                }
                                else if (xEndLabel > xRightMax) {
                                    xEndLabel = xRightMax;
                                    xStartLabel = xEndLabel - (wSpacing + wIcon + wText);
                                }
                            }
                            else {
                                break;
                            }
                        }
                        if (!labelText || labelText === "...") {
                            wText = 0;
                            textTexture = null;
                        }
                    }
                    else if (textMode === 'show') {
                        if (xEndLabel > xRight || xStartLabel < xLeft) {
                            // there is not enough room for the text, try with just the icon
                            wText = 0;
                            textTexture = null;
                            // coordinates of the start edge of the icon + label
                            var xStartLabel = xStart + wLeftIndent - (wIcon) * labelHPos + (wTotal) * labelHAlign;
                            // coordinates of the end edge of the icon + label
                            var xEndLabel = xStartLabel + (wIcon);
                            // adjust xStartLabel and xEndLabel if they fall off the screen
                            if (xStartLabel < xLeftMin) {
                                xStartLabel = xLeftMin;
                                xEndLabel = xStartLabel + (wIcon);
                            }
                            else if (xEndLabel > xRightMax) {
                                xEndLabel = xRightMax;
                                xStartLabel = xEndLabel - (wIcon);
                            }
                            // if there is still not enough room, don't show anything
                            if (xEndLabel > xRight || xStartLabel < xLeft) {
                                wIcon = 0;
                                iconTexture = null;
                            }
                        }
                    }
                    // Icons
                    if (webglext.isNotEmpty(iconTexture)) {
                        // coordinates of the start edge of the icon + label
                        var xStartLabel = xStart + wLeftIndent - (wSpacing + wIcon + wText) * labelHPos + (wTotal) * labelHAlign;
                        // coordinates of the end edge of the icon + label
                        var xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                        if (xStartLabel < xLeftMin) {
                            textureRenderer.draw(gl, iconTexture, xLeftMin, yFrac, { xAnchor: 0, yAnchor: labelVPos, width: iconWidth, height: iconHeight });
                        }
                        else if (xEndLabel > xRightMax) {
                            textureRenderer.draw(gl, iconTexture, xRightMax - wSpacing - wText, yFrac, { xAnchor: 1, yAnchor: labelVPos, width: iconWidth, height: iconHeight });
                        }
                        else {
                            var xFrac = xStart + wLeftIndent - (wSpacing + wText) * labelHPos + (wTotal) * labelHAlign;
                            textureRenderer.draw(gl, iconTexture, xFrac, yFrac, { xAnchor: labelHPos, yAnchor: labelVPos, width: iconWidth, height: iconHeight });
                        }
                    }
                    // Text
                    if (webglext.isNotEmpty(textTexture)) {
                        // coordinates of the start edge of the icon + label
                        var xStartLabel = xStart + wLeftIndent - (wSpacing + wIcon + wText) * labelHPos + (wTotal) * labelHAlign;
                        // coordinates of the end edge of the icon + label
                        var xEndLabel = xStartLabel + (wSpacing + wIcon + wText);
                        if (xStartLabel < xLeftMin) {
                            textureRenderer.draw(gl, textTexture, xLeftMin + wSpacing + wIcon, yFrac, { xAnchor: 0, yAnchor: textTexture.yAnchor(labelVPos) });
                        }
                        else if (xEndLabel > xRightMax) {
                            textureRenderer.draw(gl, textTexture, xRightMax, yFrac, { xAnchor: 1, yAnchor: textTexture.yAnchor(labelVPos) });
                        }
                        else {
                            var xFrac = xStart + wLeftIndent + (wIconPlusSpacing) * (1 - labelHPos) + (wTotal) * labelHAlign;
                            textureRenderer.draw(gl, textTexture, xFrac, yFrac, { xAnchor: labelHPos, yAnchor: textTexture.yAnchor(labelVPos) });
                        }
                    }
                }
            }
        };
    }
    function newEventLabelsPainterFactory(labelOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventLabelsPainterHelper(labelOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                helper.textTextures.resetTouches();
                helper.textureRenderer.begin(gl, viewport);
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        helper.paintEvent(l, e, gl, viewport);
                    }
                }
                helper.textureRenderer.end(gl);
                helper.textTextures.retainTouched();
            };
        };
    }
    webglext.newEventLabelsPainterFactory = newEventLabelsPainterFactory;
    function eventBarPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options) {
        var rowTopPadding = options.rowTopPadding;
        var rowBottomPadding = options.rowBottomPadding;
        var laneHeight = options.laneHeight;
        var topMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.topMargin) ? barOpts.topMargin : 1.2);
        var bottomMargin = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.bottomMargin) ? barOpts.bottomMargin : 1.2);
        var borderThickness = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.borderThickness) ? barOpts.borderThickness : 2);
        var cornerType = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.cornerType) ? barOpts.cornerType : JointType.BEVEL);
        var defaultColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.defaultColor) ? barOpts.defaultColor : options.timelineFgColor.withAlphaTimes(0.4));
        var defaultBorderColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.defaultBorderColor) ? barOpts.defaultBorderColor : null);
        var selectedBorderColor = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.selectedBorderColor) ? barOpts.selectedBorderColor : options.timelineFgColor);
        var minimumVisibleWidth = (webglext.isNotEmpty(barOpts) && webglext.isNotEmpty(barOpts.minimumVisibleWidth) ? barOpts.minimumVisibleWidth : 0);
        var selection = ui.selection;
        var xyFrac_vColor_VERTSHADER = webglext.concatLines('                                                                ', '  attribute vec2 a_XyFrac;                                      ', '  attribute vec4 a_Color;                                       ', '                                                                ', '  varying vec4 v_Color;                                         ', '                                                                ', '  void main( ) {                                                ', '      gl_Position = vec4( ( -1.0 + 2.0*a_XyFrac ), 0.0, 1.0 );  ', '      v_Color = a_Color;                                        ', '  }                                                             ', '                                                                ');
        var program = new webglext.Program(xyFrac_vColor_VERTSHADER, webglext.varyingColor_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var a_Color = new webglext.Attribute(program, 'a_Color');
        var xys = new Float32Array(0);
        var xysBuffer = webglext.newDynamicBuffer();
        var rgbas = new Float32Array(0);
        var rgbasBuffer = webglext.newDynamicBuffer();
        return {
            paint: function (indexXys, indexRgbas, gl, viewport) {
                if (indexXys == 0 || indexRgbas == 0)
                    return;
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                program.use(gl);
                xysBuffer.setData(xys.subarray(0, indexXys));
                a_XyFrac.setDataAndEnable(gl, xysBuffer, 2, webglext.GL.FLOAT);
                rgbasBuffer.setData(rgbas.subarray(0, indexRgbas));
                a_Color.setDataAndEnable(gl, rgbasBuffer, 4, webglext.GL.FLOAT);
                gl.drawArrays(webglext.GL.TRIANGLES, 0, Math.floor(indexXys / 2));
                a_Color.disable(gl);
                a_XyFrac.disable(gl);
                program.endUse(gl);
            },
            ensureCapacity: function (eventCount) {
                var numVertices;
                switch (cornerType) {
                    case JointType.BEVEL:
                        numVertices = (6 * (5 /*quads*/) + 3 * (4 /*triangles*/)) * eventCount;
                        break;
                    default:
                        numVertices = (6 * (5 /*quads*/)) * eventCount;
                        break;
                }
                xys = webglext.ensureCapacityFloat32(xys, 2 * numVertices);
                rgbas = webglext.ensureCapacityFloat32(rgbas, 4 * numVertices);
            },
            fillEvent: function (laneIndex, eventIndex, indexXys, indexRgbas, viewport) {
                var lane = lanes.lane(laneIndex);
                var event = lane.event(eventIndex);
                var wBorder = borderThickness / viewport.w;
                var hBorder = borderThickness / viewport.h;
                var _topMargin = webglext.isNotEmpty(event.topMargin) ? event.topMargin : topMargin;
                var _bottomMargin = webglext.isNotEmpty(event.bottomMargin) ? event.bottomMargin : bottomMargin;
                var jTop = rowTopPadding + (laneIndex) * laneHeight + _topMargin;
                var yTop = (viewport.h - jTop) / viewport.h;
                var jBottom = rowTopPadding + (laneIndex + 1) * laneHeight - _bottomMargin;
                var yBottom = (viewport.h - jBottom) / viewport.h;
                var xLeft = timeAxis.tFrac(event.start_PMILLIS);
                var xRight = timeAxis.tFrac(event.end_PMILLIS);
                var xWidthPixels = viewport.w * (xRight - xLeft);
                if (!(xRight < 0 || xLeft > 1) && xWidthPixels > minimumVisibleWidth) {
                    // Fill
                    var fillColor = (event.bgColor || defaultColor);
                    if (event === selection.hoveredEvent.value) {
                        fillColor = webglext.darker(fillColor, 0.8);
                    }
                    indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yTop - hBorder, yBottom + hBorder);
                    indexRgbas = webglext.putQuadRgbas(rgbas, indexRgbas, fillColor);
                    // Border
                    var borderColor = (event.borderColor || (event.bgColor ? fillColor : null) || defaultBorderColor || fillColor);
                    if (selection.selectedEvents.hasValue(event)) {
                        borderColor = selectedBorderColor;
                    }
                    if (borderColor) {
                        switch (cornerType) {
                            case JointType.BEVEL:
                                // Quads
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xLeft + wBorder, yTop - hBorder, yBottom + hBorder);
                                indexXys = webglext.putQuadXys(xys, indexXys, xRight - wBorder, xRight, yTop - hBorder, yBottom + hBorder);
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yTop, yTop - hBorder);
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight - wBorder, yBottom + hBorder, yBottom);
                                indexRgbas = webglext.putRgbas(rgbas, indexRgbas, borderColor, 24);
                                // Triangles
                                indexXys = webglext.putLowerLeftTriangleXys(xys, indexXys, xRight - wBorder, xRight, yTop, yTop - hBorder);
                                indexXys = webglext.putUpperLeftTriangleXys(xys, indexXys, xRight - wBorder, xRight, yBottom + hBorder, yBottom);
                                indexXys = webglext.putUpperRightTriangleXys(xys, indexXys, xLeft, xLeft + wBorder, yBottom + hBorder, yBottom);
                                indexXys = webglext.putLowerRightTriangleXys(xys, indexXys, xLeft, xLeft + wBorder, yTop, yTop - hBorder);
                                indexRgbas = webglext.putRgbas(rgbas, indexRgbas, borderColor, 12);
                                break;
                            default:
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xRight - wBorder, yTop, yTop - hBorder);
                                indexXys = webglext.putQuadXys(xys, indexXys, xRight - wBorder, xRight, yTop, yBottom + hBorder);
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft + wBorder, xRight, yBottom + hBorder, yBottom);
                                indexXys = webglext.putQuadXys(xys, indexXys, xLeft, xLeft + wBorder, yTop - hBorder, yBottom);
                                indexRgbas = webglext.putRgbas(rgbas, indexRgbas, borderColor, 24);
                                break;
                        }
                    }
                }
                return { indexXys: indexXys, indexRgbas: indexRgbas };
            }
        };
    }
    function newEventBarsPainterFactory(barOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var helper = eventBarPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                helper.ensureCapacity(lanes.numEvents);
                var indexXys = 0;
                var indexRgbas = 0;
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        var indexes = helper.fillEvent(l, e, indexXys, indexRgbas, viewport);
                        indexXys = indexes.indexXys;
                        indexRgbas = indexes.indexRgbas;
                    }
                }
                helper.paint(indexXys, indexRgbas, gl, viewport);
            };
        };
    }
    webglext.newEventBarsPainterFactory = newEventBarsPainterFactory;
    function newCombinedEventPainterFactory(barOpts, labelOpts, iconOpts) {
        // Painter Factory
        return function (drawable, timeAxis, lanes, ui, options) {
            var labelHelper = eventLabelsPainterHelper(labelOpts, drawable, timeAxis, lanes, ui, options);
            var iconHelper = eventIconsPainterHelper(iconOpts, drawable, timeAxis, lanes, ui, options);
            var barHelper = eventStripedBarPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options);
            var dashedHelper = eventDashedBorderPainterHelper(barOpts, drawable, timeAxis, lanes, ui, options);
            // Painter
            return function (gl, viewport) {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                for (var l = 0; l < lanes.length; l++) {
                    var lane = lanes.lane(l);
                    for (var e = 0; e < lane.length; e++) {
                        // draw bar
                        barHelper.ensureCapacity(1);
                        var indexes = barHelper.fillEvent(l, e, 0, 0, viewport, 0, 0);
                        var dashedIndexes = dashedHelper.fillEvent(l, e, 0, 0, viewport, 0);
                        barHelper.paint(indexes.indexXys, indexes.indexRgbas, gl, viewport, indexes.indexRelativeXys, indexes.indexFillPattern);
                        dashedHelper.paint(dashedIndexes.indexXys, dashedIndexes.indexRgbas, gl, viewport, dashedIndexes.indexLengthSoFar);
                        // draw label
                        labelHelper.textTextures.resetTouches();
                        labelHelper.textureRenderer.begin(gl, viewport);
                        labelHelper.paintEvent(l, e, gl, viewport);
                        labelHelper.textureRenderer.end(gl);
                        labelHelper.textTextures.retainTouched();
                        // draw icon
                        iconHelper.textureRenderer.begin(gl, viewport);
                        iconHelper.paintEvent(l, e, gl, viewport);
                        iconHelper.textureRenderer.end(gl);
                    }
                }
            };
        };
    }
    webglext.newCombinedEventPainterFactory = newCombinedEventPainterFactory;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_events_row.js.map