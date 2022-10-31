var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var webglext;
(function (webglext) {
    var TimelinePane = /** @class */ (function (_super) {
        __extends(TimelinePane, _super);
        function TimelinePane(layout, model, ui) {
            var _this = _super.call(this, layout, true) || this;
            _this._model = model;
            _this._ui = ui;
            return _this;
        }
        Object.defineProperty(TimelinePane.prototype, "model", {
            get: function () { return this._model; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelinePane.prototype, "ui", {
            get: function () { return this._ui; },
            enumerable: false,
            configurable: true
        });
        return TimelinePane;
    }(webglext.Pane));
    webglext.TimelinePane = TimelinePane;
    function newTimelinePane(drawable, timeAxis, model, options, ui) {
        // Misc
        var font = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.font) ? options.font : '11px verdana,sans-serif');
        var rowPaneFactoryChooser = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowPaneFactoryChooser) ? options.rowPaneFactoryChooser : webglext.rowPaneFactoryChooser_DEFAULT);
        // Scroll
        var showScrollbar = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.showScrollbar) ? options.showScrollbar : true);
        var scrollbarOptions = (webglext.isNotEmpty(options) ? options.scrollbarOptions : null);
        // Colors
        var fgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.fgColor) ? options.fgColor : webglext.white);
        var bgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.bgColor) ? options.bgColor : webglext.rgb(0.098, 0.165, 0.243));
        var rowLabelColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowLabelColor) ? options.rowLabelColor : fgColor);
        var rowLabelBgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowLabelBgColor) ? options.rowLabelBgColor : bgColor);
        var groupLabelColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.groupLabelColor) ? options.groupLabelColor : fgColor);
        var axisLabelColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.axisLabelColor) ? options.axisLabelColor : fgColor);
        var rowBgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowBgColor) ? options.rowBgColor : webglext.rgb(0.020, 0.086, 0.165));
        var rowAltBgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowAltBgColor) ? options.rowAltBgColor : webglext.rgb(0.020, 0.086, 0.165));
        var gridColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.gridColor) ? options.gridColor : webglext.gray(0.5));
        var selectedIntervalFillColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.selectedIntervalFillColor) ? options.selectedIntervalFillColor : webglext.rgba(0, 0.6, 0.8, 0.157));
        var selectedIntervalBorderColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.selectedIntervalBorderColor) ? options.selectedIntervalBorderColor : webglext.rgb(0, 0.2, 1.0));
        // Axes
        var showTopAxis = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.showTopAxis) ? options.showTopAxis : true);
        var showBottomAxis = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.showBottomAxis) ? options.showBottomAxis : true);
        var topTimeZone = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.topTimeZone) ? options.topTimeZone : '+0000');
        var bottomTimeZone = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.bottomTimeZone) ? options.bottomTimeZone : '+0000');
        var tickSpacing = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickSpacing) ? options.tickSpacing : 60);
        var axisLabelAlign = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.axisLabelAlign) ? options.axisLabelAlign : 0.5);
        showTopAxis = true;
        topTimeZone = "2123123";
        // showBottomAxis = true;
        // Sizing
        var groupLabelInsets = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.groupLabelInsets) ? options.groupLabelInsets : webglext.newInsets(6, 10));
        var rowLabelInsets = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowLabelInsets) ? options.rowLabelInsets : webglext.newInsets(0, 35));
        var rowLabelPaneWidth = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowLabelPaneWidth) ? options.rowLabelPaneWidth : 140);
        var rowSeparatorHeight = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rowSeparatorHeight) ? options.rowSeparatorHeight : 2);
        var scrollbarWidth = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.scrollbarWidth) ? options.scrollbarWidth : 16);
        scrollbarWidth = showScrollbar ? scrollbarWidth : 0; // if the scrollbar is not showing, set its width to 0
        var axisPaneHeight = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.axisPaneHeight) ? options.axisPaneHeight : 40);
        var draggableEdgeWidth = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.draggableEdgeWidth) ? options.draggableEdgeWidth : 6);
        var snapToDistance = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.snapToDistance) ? options.snapToDistance : 10);
        // Event / Selection
        var allowEventMultiSelection = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.allowEventMultiSelection) ? options.allowEventMultiSelection : true);
        var selectedIntervalMode = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.selectedIntervalMode) ? options.selectedIntervalMode : 'range');
        var centerSelectedIntervalOnDoubleClick = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.centerSelectedIntervalOnDoubleClick) ? options.centerSelectedIntervalOnDoubleClick : true);
        var defaultMouseWheelListener = function (ev) {
            var zoomFactor = Math.pow(webglext.axisZoomStep, ev.wheelSteps);
            timeAxis.zoom(zoomFactor, timeAxis.vAtFrac(webglext.xFrac(ev)));
        };
        var mouseWheelListener = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.mouseWheelListener) ? options.mouseWheelListener : defaultMouseWheelListener);
        if (!ui) {
            var outsideManagedUi = false;
            ui = new webglext.TimelineUi(model, { allowEventMultiSelection: allowEventMultiSelection });
        }
        else {
            // remove old panes (if the ui is being reused)
            var outsideManagedUi = true;
            ui.panes.removeAll();
        }
        var selection = ui.selection;
        var redraw = function () {
            drawable.redraw();
        };
        selection.selectedInterval.changed.on(redraw);
        selection.hoveredEvent.changed.on(redraw);
        selection.selectedEvents.valueAdded.on(redraw);
        selection.selectedEvents.valueRemoved.on(redraw);
        // even if the model defines cursors, we may need to redraw when the mouse position changes
        // (we might not actually need to if: none of the rows actually use the cursor, or if the 
        //  cursor doesn't show a vertical or horizontal line)
        // this check just avoids redrawing unncessarily in the easy-to-verify common case where
        // no cursors are defined
        var redrawCursor = function () {
            if (!model.cursors.isEmpty) {
                drawable.redraw();
            }
        };
        selection.hoveredY.changed.on(redrawCursor);
        selection.hoveredTime_PMILLIS.changed.on(redrawCursor);
        // Scroll Pane and Maximized Row Pane
        //
        // setup Pane which either shows timeline content, or only maximized rows
        // able to switch between the two depending on model.root.maximizedRowGuids.isEmpty 
        // Scroll Pane
        var tickTimeZone = (showTopAxis ? topTimeZone : bottomTimeZone);
        var contentPaneOpts = { selectedIntervalMode: selectedIntervalMode,
            rowPaneFactoryChooser: rowPaneFactoryChooser,
            font: font, fgColor: fgColor,
            rowLabelColor: rowLabelColor,
            rowLabelBgColor: rowLabelBgColor,
            groupLabelColor: groupLabelColor,
            axisLabelColor: axisLabelColor,
            bgColor: bgColor, rowBgColor: rowBgColor,
            rowAltBgColor: rowAltBgColor,
            gridColor: gridColor,
            gridTickSpacing: tickSpacing,
            gridTimeZone: tickTimeZone,
            referenceDate: options.referenceDate,
            groupLabelInsets: groupLabelInsets,
            rowLabelInsets: rowLabelInsets,
            rowLabelPaneWidth: rowLabelPaneWidth,
            rowSeparatorHeight: rowSeparatorHeight,
            draggableEdgeWidth: draggableEdgeWidth,
            snapToDistance: snapToDistance,
            mouseWheelListener: mouseWheelListener };
        var contentPaneArgs;
        if (showScrollbar) {
            var scrollLayout = webglext.newVerticalScrollLayout();
            var scrollable = new webglext.Pane(scrollLayout, false);
            ui.addPane('scroll-content-pane', scrollable);
            contentPaneArgs = { drawable: drawable, scrollLayout: scrollLayout, timeAxis: timeAxis, model: model, ui: ui, options: contentPaneOpts };
            var scrollContentPane = newTimelineContentPane(contentPaneArgs);
            ui.addPane('content-pane', scrollContentPane);
            scrollable.addPane(scrollContentPane, 0);
            var scrollbar = webglext.newVerticalScrollbar(scrollLayout, drawable, scrollbarOptions);
            ui.addPane('scrollbar', scrollbar);
            var contentPane = new webglext.Pane(webglext.newColumnLayout(false), false);
            ui.addPane('scroll-outer-pane', contentPane);
            contentPane.addPane(scrollbar, 0, { width: scrollbarWidth, ignoreHeight: true });
            contentPane.addPane(scrollable, 1);
        }
        else {
            contentPaneArgs = { drawable: drawable, scrollLayout: null, timeAxis: timeAxis, model: model, ui: ui, options: contentPaneOpts };
            var contentPane = newTimelineContentPane(contentPaneArgs);
            ui.addPane('content-pane', contentPane);
        }
        // Card Pane Switching Logic
        var timelineCardPane = new webglext.Pane(webglext.newCardLayout());
        ui.addPane('switch-content-pane', timelineCardPane);
        var maximizedContentPane = new webglext.Pane(webglext.newRowLayout());
        ui.addPane('maximize-content-pane', maximizedContentPane);
        var insetMaximizedContentPane = webglext.newInsetPane(maximizedContentPane, webglext.newInsets(0, scrollbarWidth, 0, 0));
        ui.addPane('inset-maximize-content-pane', insetMaximizedContentPane);
        var contentActive = model.root.maximizedRowGuids.isEmpty;
        timelineCardPane.addPane(insetMaximizedContentPane, !contentActive);
        timelineCardPane.addPane(contentPane, contentActive);
        setupRowContainerPane(contentPaneArgs, maximizedContentPane, model.root.maximizedRowGuids, true, 'maximized');
        var updateMaximizedRows = function (rowGuid, rowIndex) {
            var contentActive = model.root.maximizedRowGuids.isEmpty;
            timelineCardPane.setLayoutArg(insetMaximizedContentPane, !contentActive);
            timelineCardPane.setLayoutArg(contentPane, contentActive);
            drawable.redraw();
        };
        model.root.maximizedRowGuids.valueAdded.on(updateMaximizedRows);
        model.root.maximizedRowGuids.valueRemoved.on(updateMaximizedRows);
        // Overlay and Underlay Panes
        //
        var underlayPane = new webglext.Pane(webglext.newRowLayout());
        ui.addPane('underlay-pane', underlayPane);
        var axisInsets = webglext.newInsets(0, scrollbarWidth, 0, rowLabelPaneWidth);
        // top time axis pane
        var axisOpts = { tickSpacing: tickSpacing, font: font, textColor: axisLabelColor, tickColor: axisLabelColor, labelAlign: axisLabelAlign, referenceDate: options.referenceDate, isFuturePositive: options.isFuturePositive };
        if (showTopAxis) {
            var topAxisPane = newTimeAxisPane(contentPaneArgs, null);
            ui.addPane('top-axis-pane', topAxisPane);
            topAxisPane.addPainter(webglext.newTimeAxisPainter(timeAxis, webglext.Side.TOP, topTimeZone, tickTimeZone, axisOpts));
            underlayPane.addPane(webglext.newInsetPane(topAxisPane, axisInsets), 0, { height: axisPaneHeight, width: null });
        }
        // pane containing pinned rows specified in TimelineRoot.topPinnedRowGuids
        var topPinnedPane = new webglext.Pane(webglext.newRowLayout());
        ui.addPane('top-pinned-pane', topPinnedPane);
        var insetTopPinnedPane = webglext.newInsetPane(topPinnedPane, webglext.newInsets(0, scrollbarWidth, 0, 0));
        ui.addPane('inset-top-pinned-pane', insetTopPinnedPane);
        setupRowContainerPane(contentPaneArgs, topPinnedPane, model.root.topPinnedRowGuids, false, 'toppinned');
        underlayPane.addPane(insetTopPinnedPane, 1);
        // main pane containing timeline groups and rows
        underlayPane.addPane(timelineCardPane, 2, { height: 'pref-max', width: null });
        // pane containing pinned rows specified in TimelineRoot.bottomPinnedRowGuids
        var bottomPinnedPane = new webglext.Pane(webglext.newRowLayout());
        ui.addPane('bottom-pinned-pane', bottomPinnedPane);
        var insetBottomPinnedPane = webglext.newInsetPane(bottomPinnedPane, webglext.newInsets(0, scrollbarWidth, 0, 0));
        ui.addPane('inset-bottom-pinned-pane', insetBottomPinnedPane);
        setupRowContainerPane(contentPaneArgs, bottomPinnedPane, model.root.bottomPinnedRowGuids, false, 'bottompinned');
        underlayPane.addPane(insetBottomPinnedPane, 3);
        // bottom time axis pane
        if (showBottomAxis) {
            var bottomAxisPane = newTimeAxisPane(contentPaneArgs, null);
            ui.addPane('bottom-axis-pane', bottomAxisPane);
            bottomAxisPane.addPainter(webglext.newTimeAxisPainter(timeAxis, webglext.Side.BOTTOM, bottomTimeZone, tickTimeZone, axisOpts));
            underlayPane.addPane(webglext.newInsetPane(bottomAxisPane, axisInsets), 4, { height: axisPaneHeight, width: null });
        }
        var updateMillisPerPx = function () {
            var w = underlayPane.viewport.w - axisInsets.left - axisInsets.right;
            ui.millisPerPx.value = timeAxis.tSize_MILLIS / w;
        };
        underlayPane.viewportChanged.on(updateMillisPerPx);
        timeAxis.limitsChanged.on(updateMillisPerPx);
        var timelinePane = new TimelinePane(webglext.newOverlayLayout(), model, ui);
        ui.addPane('timeline-pane', timelinePane);
        timelinePane.addPainter(webglext.newBackgroundPainter(bgColor));
        timelinePane.addPane(underlayPane, true);
        if (selectedIntervalMode === 'single' || selectedIntervalMode === 'single-unmodifiable') {
            var overlayPane = new webglext.Pane(null, false, webglext.alwaysTrue);
            ui.addPane('overlay-pane', overlayPane);
            overlayPane.addPainter(newTimelineSingleSelectionPainter(timeAxis, selection.selectedInterval, selectedIntervalBorderColor, selectedIntervalFillColor));
            timelinePane.addPane(webglext.newInsetPane(overlayPane, axisInsets, null, false));
        }
        else if (selectedIntervalMode === 'range' || selectedIntervalMode === 'range-unmodifiable') {
            var overlayPane = new webglext.Pane(null, false, webglext.alwaysTrue);
            ui.addPane('overlay-pane', overlayPane);
            overlayPane.addPainter(newTimelineRangeSelectionPainter(timeAxis, selection.selectedInterval, selectedIntervalBorderColor, selectedIntervalFillColor));
            timelinePane.addPane(webglext.newInsetPane(overlayPane, axisInsets, null, false));
        }
        // Enable double click to center selection on mouse
        if (centerSelectedIntervalOnDoubleClick) {
            var doubleClick = function (ev) {
                if (selectedIntervalMode === 'single') {
                    if (ev.clickCount > 1) {
                        var time_PMILLIS = timeAtPointer_PMILLIS(timeAxis, ev);
                        selection.selectedInterval.setInterval(time_PMILLIS, time_PMILLIS);
                    }
                }
                else if (selectedIntervalMode === 'range') {
                    if (ev.clickCount > 1) {
                        var time_PMILLIS = timeAtPointer_PMILLIS(timeAxis, ev);
                        var offset_PMILLIS = selection.selectedInterval.start_PMILLIS + 0.5 * selection.selectedInterval.duration_MILLIS;
                        selection.selectedInterval.pan(time_PMILLIS - offset_PMILLIS);
                    }
                }
            };
            ui.input.mouseDown.on(doubleClick);
        }
        timelinePane.dispose.on(function () {
            // only dispose the ui if we created it (and this manage its lifecycle)
            if (!outsideManagedUi)
                ui.dispose.fire();
            selection.selectedInterval.changed.off(redraw);
            selection.hoveredEvent.changed.off(redraw);
            selection.hoveredY.changed.off(redrawCursor);
            selection.hoveredTime_PMILLIS.changed.off(redrawCursor);
            selection.selectedEvents.valueAdded.off(redraw);
            selection.selectedEvents.valueRemoved.off(redraw);
            underlayPane.viewportChanged.off(updateMillisPerPx);
            timeAxis.limitsChanged.off(updateMillisPerPx);
            model.root.maximizedRowGuids.valueAdded.off(updateMaximizedRows);
            model.root.maximizedRowGuids.valueRemoved.off(updateMaximizedRows);
        });
        return timelinePane;
    }
    webglext.newTimelinePane = newTimelinePane;
    function newTimeIntervalMask(timeAxis, interval, selectedIntervalMode) {
        if (selectedIntervalMode === 'range') {
            return function (viewport, i, j) {
                var time_PMILLIS = timeAxis.tAtFrac_PMILLIS(viewport.xFrac(i));
                // allow a 10 pixel selection buffer to make it easier to grab ends of the selection
                var buffer_MILLIS = timeAxis.tSize_MILLIS / viewport.w * 10;
                return interval.overlaps(time_PMILLIS - buffer_MILLIS, time_PMILLIS + buffer_MILLIS);
            };
        }
        else if (selectedIntervalMode === 'single') {
            return function (viewport, i, j) {
                var time_PMILLIS = timeAxis.tAtFrac_PMILLIS(viewport.xFrac(i));
                // allow a 10 pixel selection buffer to make it easier to grab the selection
                var buffer_MILLIS = timeAxis.tSize_MILLIS / viewport.w * 10;
                return time_PMILLIS < interval.cursor_PMILLIS + buffer_MILLIS && time_PMILLIS > interval.cursor_PMILLIS - buffer_MILLIS;
            };
        }
    }
    function attachTimeAxisMouseListeners(pane, axis, args) {
        var vGrab = null;
        pane.mouseDown.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && !webglext.isNotEmpty(vGrab)) {
                vGrab = axis.vAtFrac(webglext.xFrac(ev));
            }
        });
        pane.mouseMove.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && webglext.isNotEmpty(vGrab)) {
                axis.pan(vGrab - axis.vAtFrac(webglext.xFrac(ev)));
            }
        });
        pane.mouseUp.on(function (ev) {
            vGrab = null;
        });
        pane.mouseWheel.on(args.options.mouseWheelListener);
    }
    function newTimeAxisPane(args, row) {
        var timeAxis = args.timeAxis;
        var ui = args.ui;
        var draggableEdgeWidth = args.options.draggableEdgeWidth;
        var scrollLayout = args.scrollLayout;
        var drawable = args.drawable;
        var selectedIntervalMode = args.options.selectedIntervalMode;
        var input = ui.input;
        var axisPane = new webglext.Pane(webglext.newOverlayLayout());
        if (scrollLayout)
            webglext.attachTimelineVerticalScrollMouseListeners(axisPane, scrollLayout, drawable);
        attachTimeAxisMouseListeners(axisPane, timeAxis, args);
        var onMouseMove = function (ev) {
            var time_PMILLIS = timeAxis.tAtFrac_PMILLIS(webglext.xFrac(ev));
            input.mouseMove.fire(ev);
            input.timeHover.fire(time_PMILLIS, ev);
            if (row)
                input.rowHover.fire(row, ev);
        };
        axisPane.mouseMove.on(onMouseMove);
        var onMouseExit = function (ev) {
            input.mouseExit.fire(ev);
            input.timeHover.fire(null, ev);
            if (row)
                input.rowHover.fire(null, ev);
        };
        axisPane.mouseExit.on(onMouseExit);
        var onMouseDown = function (ev) {
            input.mouseDown.fire(ev);
        };
        axisPane.mouseDown.on(onMouseDown);
        var onMouseUp = function (ev) {
            input.mouseUp.fire(ev);
        };
        axisPane.mouseUp.on(onMouseUp);
        var onContextMenu = function (ev) {
            input.contextMenu.fire(ev);
        };
        axisPane.contextMenu.on(onContextMenu);
        if (selectedIntervalMode === 'single' || selectedIntervalMode === 'range') {
            var selection = ui.selection;
            var selectedIntervalPane = new webglext.Pane(null, true, newTimeIntervalMask(timeAxis, selection.selectedInterval, selectedIntervalMode));
            attachTimeSelectionMouseListeners(selectedIntervalPane, timeAxis, selection.selectedInterval, input, draggableEdgeWidth, selectedIntervalMode);
            axisPane.addPane(selectedIntervalPane, false);
            selectedIntervalPane.mouseMove.on(onMouseMove);
            selectedIntervalPane.mouseExit.on(onMouseExit);
            selectedIntervalPane.mouseDown.on(onMouseDown);
            selectedIntervalPane.mouseUp.on(onMouseUp);
            selectedIntervalPane.contextMenu.on(onContextMenu);
        }
        // Dispose
        //
        // mouse listeners are disposed of automatically by Pane
        return axisPane;
    }
    function timeAtPointer_PMILLIS(timeAxis, ev) {
        return timeAxis.tAtFrac_PMILLIS(ev.paneViewport.xFrac(ev.i));
    }
    function attachTimeSelectionMouseListeners(pane, timeAxis, interval, input, draggableEdgeWidth, selectedIntervalMode) {
        if (selectedIntervalMode === 'single') {
            var chooseDragMode = function chooseDragMode(ev) {
                return 'center';
            };
            attachTimeIntervalSelectionMouseListeners(pane, timeAxis, interval, input, draggableEdgeWidth, selectedIntervalMode, chooseDragMode);
        }
        else if (selectedIntervalMode === 'range') {
            // Edges are draggable when interval is at least this wide
            var minIntervalWidthForEdgeDraggability = 3 * draggableEdgeWidth;
            // When dragging an edge, the interval cannot be made narrower than this
            //
            // Needs to be greater than minIntervalWidthForEdgeDraggability -- by enough to
            // cover floating-point precision loss -- so a user can't accidentally make
            // the interval so narrow that it can't easily be widened again.
            //
            var minIntervalWidthWhenDraggingEdge = minIntervalWidthForEdgeDraggability + 1;
            var chooseDragMode = function chooseDragMode(ev) {
                var intervalWidth = (interval.duration_MILLIS) * ev.paneViewport.w / timeAxis.vSize;
                if (intervalWidth < minIntervalWidthForEdgeDraggability) {
                    // If interval isn't very wide, don't try to allow edge dragging
                    return 'center';
                }
                else {
                    var time_PMILLIS = timeAtPointer_PMILLIS(timeAxis, ev);
                    var mouseOffset = (time_PMILLIS - interval.start_PMILLIS) * ev.paneViewport.w / timeAxis.vSize;
                    if (mouseOffset < draggableEdgeWidth) {
                        // If mouse is near the left edge, drag the interval's start-time
                        return 'start';
                    }
                    else if (mouseOffset < intervalWidth - draggableEdgeWidth) {
                        // If mouse is in the center, drag the whole interval
                        return 'center';
                    }
                    else {
                        // If mouse is near the right edge, drag the interval's end-time
                        return 'end';
                    }
                }
            };
            attachTimeIntervalSelectionMouseListeners(pane, timeAxis, interval, input, draggableEdgeWidth, selectedIntervalMode, chooseDragMode);
        }
    }
    function attachTimeIntervalSelectionMouseListeners(pane, timeAxis, interval, input, draggableEdgeWidth, selectedIntervalMode, chooseDragMode) {
        // see comments in attachTimeSelectionMouseListeners( ... )
        var minIntervalWidthForEdgeDraggability = 3 * draggableEdgeWidth;
        var minIntervalWidthWhenDraggingEdge = minIntervalWidthForEdgeDraggability + 1;
        // Hook up input notifications
        //
        pane.mouseWheel.on(function (ev) {
            var zoomFactor = Math.pow(webglext.axisZoomStep, ev.wheelSteps);
            timeAxis.zoom(zoomFactor, timeAxis.vAtFrac(webglext.xFrac(ev)));
        });
        pane.contextMenu.on(function (ev) {
            input.contextMenu.fire(ev);
        });
        // Begin interval-drag
        //
        var dragMode = null;
        var dragOffset_MILLIS = null;
        pane.mouseMove.on(function (ev) {
            if (!dragMode) {
                var mouseCursors = { 'center': 'move', 'start': 'w-resize', 'end': 'e-resize' };
                pane.mouseCursor = mouseCursors[chooseDragMode(ev)];
            }
        });
        pane.mouseDown.on(function (ev) {
            dragMode = webglext.isLeftMouseDown(ev.mouseEvent) ? chooseDragMode(ev) : null;
            if (!webglext.isNotEmpty(dragMode)) {
                dragOffset_MILLIS = null;
            }
        });
        // Compute (and remember) the pointer time, for use by the drag listeners below
        //
        var dragPointer_PMILLIS = null;
        var updateDragPointer = function (ev) {
            if (webglext.isNotEmpty(dragMode)) {
                dragPointer_PMILLIS = timeAtPointer_PMILLIS(timeAxis, ev);
            }
        };
        pane.mouseDown.on(updateDragPointer);
        pane.mouseMove.on(updateDragPointer);
        // Dragging interval-center
        //
        var grabCenter = function () {
            if (dragMode === 'center') {
                dragOffset_MILLIS = dragPointer_PMILLIS - interval.start_PMILLIS;
            }
        };
        pane.mouseDown.on(grabCenter);
        var dragCenter = function () {
            if (dragMode === 'center') {
                var newStart_PMILLIS = (dragPointer_PMILLIS - dragOffset_MILLIS);
                var newEnd_PMILLIS = interval.end_PMILLIS + (newStart_PMILLIS - interval.start_PMILLIS);
                interval.setInterval(newStart_PMILLIS, newEnd_PMILLIS);
            }
        };
        pane.mouseMove.on(dragCenter);
        // Dragging interval-start
        //
        var grabStart = function () {
            if (dragMode === 'start') {
                dragOffset_MILLIS = dragPointer_PMILLIS - interval.start_PMILLIS;
            }
        };
        pane.mouseDown.on(grabStart);
        var dragStart = function () {
            if (dragMode === 'start') {
                var wMin_MILLIS = minIntervalWidthWhenDraggingEdge * timeAxis.vSize / pane.viewport.w;
                var newStart_PMILLIS = dragPointer_PMILLIS - dragOffset_MILLIS;
                interval.start_PMILLIS = Math.min(interval.end_PMILLIS - wMin_MILLIS, newStart_PMILLIS);
            }
        };
        pane.mouseMove.on(dragStart);
        // Dragging interval-end
        //
        var grabEnd = function () {
            if (dragMode === 'end') {
                dragOffset_MILLIS = dragPointer_PMILLIS - interval.end_PMILLIS;
            }
        };
        pane.mouseDown.on(grabEnd);
        var dragEnd = function () {
            if (dragMode === 'end') {
                var wMin_MILLIS = minIntervalWidthWhenDraggingEdge * timeAxis.vSize / pane.viewport.w;
                var newEnd_PMILLIS = dragPointer_PMILLIS - dragOffset_MILLIS;
                interval.end_PMILLIS = Math.max(interval.start_PMILLIS + wMin_MILLIS, newEnd_PMILLIS);
                interval.cursor_PMILLIS = interval.end_PMILLIS;
            }
        };
        pane.mouseMove.on(dragEnd);
        // Finish interval-drag
        //
        pane.mouseUp.on(function (ev) {
            dragOffset_MILLIS = null;
            dragPointer_PMILLIS = null;
            dragMode = null;
        });
    }
    function newTimelineSingleSelectionPainter(timeAxis, interval, borderColor, fillColor) {
        var program = new webglext.Program(webglext.xyFrac_VERTSHADER, webglext.solid_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        // holds vertices for fill and border
        var coords = new Float32Array(12 + 8);
        var coordsBuffer = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            if (webglext.isNotEmpty(interval.cursor_PMILLIS)) {
                var fracSelection = timeAxis.tFrac(interval.cursor_PMILLIS);
                var fracWidth = 1 / viewport.w;
                var fracHeight = 1 / viewport.h;
                var thickWidth = 3 / viewport.w;
                var highlightWidth = 7 / viewport.w;
                var index = 0;
                // fill vertices
                coords[index++] = fracSelection - highlightWidth;
                coords[index++] = 1;
                coords[index++] = fracSelection + highlightWidth;
                coords[index++] = 1;
                coords[index++] = fracSelection - highlightWidth;
                coords[index++] = 0;
                coords[index++] = fracSelection + highlightWidth;
                coords[index++] = 0;
                // selection vertices
                index = webglext.putQuadXys(coords, index, fracSelection - thickWidth / 2, fracSelection + thickWidth / 2, 1, 0 + fracHeight); // selection
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                program.use(gl);
                coordsBuffer.setData(coords);
                a_XyFrac.setDataAndEnable(gl, coordsBuffer, 2, webglext.GL.FLOAT);
                u_Color.setData(gl, fillColor);
                gl.drawArrays(webglext.GL.TRIANGLE_STRIP, 0, 4);
                u_Color.setData(gl, borderColor);
                gl.drawArrays(webglext.GL.TRIANGLES, 4, 6);
                a_XyFrac.disable(gl);
                program.endUse(gl);
            }
        };
    }
    function newTimelineRangeSelectionPainter(timeAxis, interval, borderColor, fillColor) {
        var program = new webglext.Program(webglext.xyFrac_VERTSHADER, webglext.solid_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        // holds vertices for fill and border
        var coords = new Float32Array(12 + 8 + 48);
        var coordsBuffer = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            if (webglext.isNotEmpty(interval.start_PMILLIS) && webglext.isNotEmpty(interval.end_PMILLIS)) {
                var fracStart = timeAxis.tFrac(interval.start_PMILLIS);
                var fracEnd = timeAxis.tFrac(interval.end_PMILLIS);
                var fracSelection = timeAxis.tFrac(interval.cursor_PMILLIS);
                var fracWidth = 1 / viewport.w;
                var fracHeight = 1 / viewport.h;
                var thickWidth = 3 / viewport.w;
                var index = 0;
                // fill vertices
                coords[index++] = fracStart;
                coords[index++] = 1;
                coords[index++] = fracEnd;
                coords[index++] = 1;
                coords[index++] = fracStart;
                coords[index++] = 0;
                coords[index++] = fracEnd;
                coords[index++] = 0;
                // border vertices
                index = webglext.putQuadXys(coords, index, fracStart, fracEnd - fracWidth, +1, +1 - fracHeight); // top
                index = webglext.putQuadXys(coords, index, fracStart + fracWidth, fracEnd, 0 + fracHeight, 0); // bottom
                index = webglext.putQuadXys(coords, index, fracStart, fracStart + fracWidth, 1 - fracHeight, 0); // left
                index = webglext.putQuadXys(coords, index, fracEnd - fracWidth, fracEnd, 1, 0 + fracHeight); // right
                // selection vertices
                index = webglext.putQuadXys(coords, index, fracSelection - thickWidth, fracSelection, 1, 0 + fracHeight); // selection
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                program.use(gl);
                coordsBuffer.setData(coords);
                a_XyFrac.setDataAndEnable(gl, coordsBuffer, 2, webglext.GL.FLOAT);
                u_Color.setData(gl, fillColor);
                gl.drawArrays(webglext.GL.TRIANGLE_STRIP, 0, 4);
                u_Color.setData(gl, borderColor);
                gl.drawArrays(webglext.GL.TRIANGLES, 4, 30);
                a_XyFrac.disable(gl);
                program.endUse(gl);
            }
        };
    }
    function newGroupCollapseExpandArrowPainter(group) {
        var program = new webglext.Program(webglext.xyFrac_VERTSHADER, webglext.solid_FRAGSHADER);
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        // holds vertices for triangle
        var coords = new Float32Array(6);
        var coordsBuffer = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            var sizeFracX = 0.5;
            var sizeX = sizeFracX * viewport.w;
            var sizeY = sizeX * Math.sqrt(3) / 2;
            var sizeFracY = sizeY / viewport.h;
            var bufferFracX = 0.05;
            var bufferSize = bufferFracX * viewport.w;
            var bufferFracY = bufferSize / viewport.h;
            var centerFracX = 0.5;
            var centerFracY = bufferFracY + sizeFracY / 2;
            if (group.collapsed) {
                sizeFracX = sizeY / viewport.w;
                sizeFracY = sizeX / viewport.h;
                var fracStartX = centerFracX - sizeFracX / 2;
                var fracEndX = centerFracX + sizeFracX / 2;
                var fracStartY = 1 - (centerFracY - sizeFracY / 2);
                var fracEndY = 1 - (centerFracY + sizeFracY / 2);
                var index = 0;
                coords[index++] = fracStartX;
                coords[index++] = fracStartY;
                coords[index++] = fracEndX;
                coords[index++] = (fracStartY + fracEndY) / 2;
                coords[index++] = fracStartX;
                coords[index++] = fracEndY;
            }
            else {
                var fracStartX = centerFracX - sizeFracX / 2;
                var fracEndX = centerFracX + sizeFracX / 2;
                var fracStartY = 1 - (centerFracY - sizeFracY / 2);
                var fracEndY = 1 - (centerFracY + sizeFracY / 2);
                var index = 0;
                coords[index++] = fracStartX;
                coords[index++] = fracStartY;
                coords[index++] = fracEndX;
                coords[index++] = fracStartY;
                coords[index++] = (fracStartX + fracEndX) / 2;
                coords[index++] = fracEndY;
            }
            program.use(gl);
            coordsBuffer.setData(coords);
            a_XyFrac.setDataAndEnable(gl, coordsBuffer, 2, webglext.GL.FLOAT);
            u_Color.setData(gl, webglext.white);
            gl.drawArrays(webglext.GL.TRIANGLES, 0, 3);
            a_XyFrac.disable(gl);
            program.endUse(gl);
        };
    }
    function newTimelineContentPane(args) {
        var drawable = args.drawable;
        var scrollLayout = args.scrollLayout;
        var timeAxis = args.timeAxis;
        var model = args.model;
        var ui = args.ui;
        var options = args.options;
        var root = model.root;
        var selectedIntervalMode = options.selectedIntervalMode;
        var rowPaneFactoryChooser = options.rowPaneFactoryChooser;
        var font = options.font;
        var fgColor = options.fgColor;
        var rowLabelColor = options.rowLabelColor;
        var groupLabelColor = options.groupLabelColor;
        var axisLabelColor = options.axisLabelColor;
        var bgColor = options.bgColor;
        var rowBgColor = options.rowBgColor;
        var rowAltBgColor = options.rowAltBgColor;
        var groupLabelInsets = options.groupLabelInsets;
        var draggableEdgeWidth = options.draggableEdgeWidth;
        var snapToDistance = options.snapToDistance;
        var timelineContentPane = new webglext.Pane(webglext.newRowLayout());
        var groupContentPanes = {};
        var addGroup = function (groupGuid, groupIndex) {
            var group = model.group(groupGuid);
            var groupLabel = new webglext.Label(group.label, font, groupLabelColor);
            var groupLabelPane = new webglext.Pane({ updatePrefSize: webglext.fitToLabel(groupLabel) }, false);
            groupLabelPane.addPainter(webglext.newLabelPainter(groupLabel, 0, 1, 0, 1));
            var groupArrowPane = new webglext.Pane({ updatePrefSize: function (parentPrefSize) {
                    parentPrefSize.w = 16;
                    parentPrefSize.h = 0;
                } }, false);
            groupArrowPane.addPainter(newGroupCollapseExpandArrowPainter(group));
            var groupPane = new webglext.Pane(webglext.newColumnLayout(), false);
            groupPane.addPane(groupArrowPane, 0);
            groupPane.addPane(groupLabelPane, 1);
            var groupButton = webglext.newInsetPane(groupPane, groupLabelInsets, bgColor);
            var redrawLabel = function () {
                groupLabel.text = group.label;
                drawable.redraw();
            };
            group.attrsChanged.on(redrawLabel);
            /// handle rollup group row ///
            var groupHeaderStripe = new webglext.Pane(webglext.newRowLayout());
            groupHeaderStripe.addPane(new webglext.Pane(null), 0, { height: null });
            groupHeaderStripe.addPane(webglext.newSolidPane(groupLabelColor), 1, { height: 1 });
            groupHeaderStripe.addPane(new webglext.Pane(null), 2, { height: null });
            var rollupRow = model.row(group.rollupGuid);
            if (rollupRow) {
                var rowBackgroundPanes = newRowBackgroundPanes(args, group.rowGuids, rollupRow);
                var rowBackgroundPane = rowBackgroundPanes.rowBackgroundPane;
                var rowInsetPane = rowBackgroundPanes.rowInsetPane;
                var rollupUi = ui.rowUi(rollupRow.rowGuid);
                // expose panes in api via TimelineRowUi
                rollupUi.addPane('background', rowBackgroundPane);
                rollupUi.addPane('inset', rowInsetPane);
                var rollupDataAxis = rollupRow.dataAxis;
                var rollupContentPane = null;
                var rollupPaneFactory = null;
                var rollupContentOptions = { timelineFont: font, timelineFgColor: fgColor, draggableEdgeWidth: draggableEdgeWidth, snapToDistance: snapToDistance, isMaximized: false, mouseWheelListener: args.options.mouseWheelListener };
                var refreshRollupContentPane = function () {
                    var newRollupPaneFactory = (rollupUi.paneFactory || rowPaneFactoryChooser(rollupRow));
                    if (newRollupPaneFactory !== rollupPaneFactory) {
                        if (rollupContentPane) {
                            rollupContentPane.dispose.fire();
                            rowInsetPane.removePane(rollupContentPane);
                        }
                        rollupPaneFactory = newRollupPaneFactory;
                        rollupContentPane = (rollupPaneFactory && rollupPaneFactory(drawable, timeAxis, rollupDataAxis, model, rollupRow, ui, rollupContentOptions));
                        if (rollupContentPane) {
                            rowInsetPane.addPane(rollupContentPane);
                        }
                        drawable.redraw();
                    }
                };
                rollupUi.paneFactoryChanged.on(refreshRollupContentPane);
                rollupRow.attrsChanged.on(refreshRollupContentPane);
                rollupRow.eventGuids.valueAdded.on(refreshRollupContentPane);
                rollupRow.eventGuids.valueRemoved.on(refreshRollupContentPane);
                rollupRow.timeseriesGuids.valueAdded.on(refreshRollupContentPane);
                rollupRow.timeseriesGuids.valueRemoved.on(refreshRollupContentPane);
                refreshRollupContentPane();
                var groupButtonHeaderUnderlay = new webglext.Pane(webglext.newColumnLayout());
                groupButtonHeaderUnderlay.addPane(groupButton, 0);
                groupButtonHeaderUnderlay.addPane(groupHeaderStripe, 1, { ignoreHeight: true });
            }
            var groupContentPane = new webglext.Pane(webglext.newRowLayout());
            timelineContentPane.updateLayoutArgs(function (layoutArg) {
                var shift = (webglext.isNumber(layoutArg) && layoutArg >= 2 * groupIndex);
                return (shift ? layoutArg + 2 : layoutArg);
            });
            timelineContentPane.addPane(groupContentPane, 2 * groupIndex + 1, { hide: group.collapsed });
            groupContentPanes[groupGuid] = groupContentPane;
            var groupAttrsChanged = function () {
                var groupContentLayoutOpts = timelineContentPane.layoutOptions(groupContentPane);
                if (group.collapsed !== groupContentLayoutOpts.hide) {
                    groupContentLayoutOpts.hide = group.collapsed;
                    drawable.redraw();
                }
            };
            group.attrsChanged.on(groupAttrsChanged);
            groupButton.mouseDown.on(function (ev) {
                if (webglext.isLeftMouseDown(ev.mouseEvent)) {
                    group.collapsed = !group.collapsed;
                }
            });
            // Handle hidden property
            //
            timelineContentPane.layoutOptions(groupContentPane).hide = group.hidden;
            setupRowContainerPane(args, groupContentPane, group.rowGuids, false, group.groupGuid);
            groupContentPane.dispose.on(function () {
                group.attrsChanged.off(redrawLabel);
                group.attrsChanged.off(groupAttrsChanged);
            });
        };
        root.groupGuids.forEach(addGroup);
        root.groupGuids.valueAdded.on(addGroup);
        var moveGroup = function (groupGuid, groupOldIndex, groupNewIndex) {
            var nMin = Math.min(groupOldIndex, groupNewIndex);
            var nMax = Math.max(groupOldIndex, groupNewIndex);
            for (var n = nMin; n <= nMax; n++) {
                var groupGuid = root.groupGuids.valueAt(n);
                timelineContentPane.setLayoutArg(groupContentPanes[groupGuid], 2 * n + 1);
            }
            drawable.redraw();
        };
        root.groupGuids.valueMoved.on(moveGroup);
        var removeGroup = function (groupGuid, groupIndex) {
            var contentPane = groupContentPanes[groupGuid];
            contentPane.dispose.fire();
            timelineContentPane.removePane(contentPane);
            timelineContentPane.updateLayoutArgs(function (layoutArg) {
                var shift = (webglext.isNumber(layoutArg) && layoutArg > 2 * groupIndex + 1);
                return (shift ? layoutArg - 2 : layoutArg);
            });
            delete groupContentPanes[groupGuid];
            drawable.redraw();
        };
        root.groupGuids.valueRemoved.on(removeGroup);
        // Handle listing for hidden property
        //
        var groupAttrsChangedListeners = {};
        var attachGroupAttrsChangedListener = function (groupGuid, groupIndex) {
            var group = model.group(groupGuid);
            var groupAttrsChangedListener = function () {
                if (webglext.isNotEmpty(group.hidden) && webglext.isNotEmpty(groupContentPanes[groupGuid])) {
                    timelineContentPane.layoutOptions(groupContentPanes[groupGuid]).hide = group.hidden;
                    drawable.redraw();
                }
            };
            groupAttrsChangedListeners[groupGuid] = groupAttrsChangedListener;
            group.attrsChanged.on(groupAttrsChangedListener);
        };
        var unattachGroupAttrsChangedListener = function (groupGuid, groupIndex) {
            var group = model.group(groupGuid);
            group.attrsChanged.off(groupAttrsChangedListeners[groupGuid]);
        };
        root.groupGuids.forEach(attachGroupAttrsChangedListener);
        root.groupGuids.valueAdded.on(attachGroupAttrsChangedListener);
        root.groupGuids.valueRemoved.on(unattachGroupAttrsChangedListener);
        // Dispose
        //
        timelineContentPane.dispose.on(function () {
            root.groupGuids.valueAdded.off(addGroup);
            root.groupGuids.valueMoved.off(moveGroup);
            root.groupGuids.valueRemoved.off(removeGroup);
        });
        return timelineContentPane;
    }
    function newRowBackgroundPainter(args, guidList, row) {
        return function (gl) {
            var color = webglext.isNotEmpty(row.bgColor) ? row.bgColor : (guidList.indexOf(row.rowGuid) % 2 ? args.options.rowBgColor : args.options.rowAltBgColor);
            gl.clearColor(color.r, color.g, color.b, color.a);
            gl.clear(webglext.GL.COLOR_BUFFER_BIT);
        };
    }
    function newRowBackgroundPanes(args, guidList, row) {
        var rowBackgroundPane = newTimeAxisPane(args, row);
        rowBackgroundPane.addPainter(newRowBackgroundPainter(args, guidList, row));
        // var timeGridOpts = { tickSpacing: args.options.gridTickSpacing, gridColor: args.options.gridColor, referenceDate: args.options.referenceDate };
        // rowBackgroundPane.addPainter( newTimeGridPainter( args.timeAxis, false, args.options.gridTimeZone, timeGridOpts ) );
        var rowInsetTop = args.options.rowSeparatorHeight / 2;
        var rowInsetBottom = args.options.rowSeparatorHeight - rowInsetTop;
        var rowInsetPane = new webglext.Pane(webglext.newInsetLayout(webglext.newInsets(rowInsetTop, 0, rowInsetBottom, 0)), false);
        rowInsetPane.addPainter(webglext.newBorderPainter(args.options.bgColor, { thickness: rowInsetTop, drawRight: false, drawLeft: false, drawBottom: false }));
        rowInsetPane.addPainter(webglext.newBorderPainter(args.options.bgColor, { thickness: rowInsetBottom, drawRight: false, drawLeft: false, drawTop: false }));
        rowBackgroundPane.addPane(rowInsetPane, true);
        var rowOverlayPane = new webglext.Pane(null, false);
        rowOverlayPane.addPainter(webglext.newBorderPainter(args.options.rowLabelColor, { drawRight: false, drawTop: false, drawBottom: false }));
        rowBackgroundPane.addPane(rowOverlayPane, false);
        return { rowInsetPane: rowInsetPane, rowBackgroundPane: rowBackgroundPane };
    }
    function setupRowContainerPane(args, parentPane, guidList, isMaximized, keyPrefix) {
        var drawable = args.drawable;
        var scrollLayout = args.scrollLayout;
        var timeAxis = args.timeAxis;
        var model = args.model;
        var ui = args.ui;
        var options = args.options;
        var rowPanes = {};
        var addRow = function (rowGuid, rowIndex) {
            var row = model.row(rowGuid);
            var rowUi = ui.rowUi(rowGuid);
            var rowLabelColorBg = webglext.isNotEmpty(row.bgLabelColor) ? row.bgLabelColor : options.rowLabelBgColor;
            var rowLabelColorFg = webglext.isNotEmpty(row.fgLabelColor) ? row.fgLabelColor : options.rowLabelColor;
            var rowLabelFont = webglext.isNotEmpty(row.labelFont) ? row.labelFont : options.font;
            var rowLabel = new webglext.Label(row.label, rowLabelFont, rowLabelColorFg);
            var rowLabelPane = new webglext.Pane({ updatePrefSize: webglext.fitToLabel(rowLabel) }, false);
            rowLabelPane.addPainter(webglext.newLabelPainter(rowLabel, 0, 0.5, 0, 0.5));
            var rowLabelBackground = new webglext.Background(rowLabelColorBg);
            var rowHeaderPane = new webglext.Pane(webglext.newInsetLayout(options.rowLabelInsets), true);
            rowHeaderPane.addPainter(rowLabelBackground.newPainter());
            rowHeaderPane.addPane(rowLabelPane);
            var rowAttrsChanged = function () {
                rowLabel.text = row.label;
                rowLabel.fgColor = webglext.isNotEmpty(row.fgLabelColor) ? row.fgLabelColor : options.rowLabelColor;
                rowLabel.font = webglext.isNotEmpty(row.labelFont) ? row.labelFont : options.font;
                rowLabelBackground.color = webglext.isNotEmpty(row.bgLabelColor) ? row.bgLabelColor : options.bgColor;
                drawable.redraw();
            };
            row.attrsChanged.on(rowAttrsChanged);
            var rowBackgroundPanes = newRowBackgroundPanes(args, guidList, row);
            var rowBackgroundPane = rowBackgroundPanes.rowBackgroundPane;
            var rowInsetPane = rowBackgroundPanes.rowInsetPane;
            var rowPane = new webglext.Pane(webglext.newColumnLayout());
            rowPane.addPane(rowHeaderPane, 0, { width: options.rowLabelPaneWidth });
            rowPane.addPane(rowBackgroundPane, 1, { width: null });
            // expose panes in api via TimelineRowUi
            rowUi.addPane(keyPrefix + '-background', rowBackgroundPane);
            rowUi.addPane(keyPrefix + '-inset', rowInsetPane);
            rowUi.addPane(keyPrefix + '-label', rowLabelPane);
            rowUi.addPane(keyPrefix + '-header', rowHeaderPane);
            var rowDataAxis = row.dataAxis;
            var rowContentPane = null;
            var rowPaneFactory = null;
            var rowContentOptions = { timelineFont: options.font, timelineFgColor: options.fgColor, draggableEdgeWidth: options.draggableEdgeWidth, snapToDistance: options.snapToDistance, isMaximized: isMaximized, mouseWheelListener: options.mouseWheelListener };
            var refreshRowContentPane = function () {
                var newRowPaneFactory = (rowUi.paneFactory || options.rowPaneFactoryChooser(row));
                if (newRowPaneFactory !== rowPaneFactory) {
                    if (rowContentPane) {
                        rowContentPane.dispose.fire();
                        rowInsetPane.removePane(rowContentPane);
                    }
                    rowPaneFactory = newRowPaneFactory;
                    rowContentPane = (rowPaneFactory && rowPaneFactory(drawable, timeAxis, rowDataAxis, model, row, ui, rowContentOptions));
                    if (rowContentPane) {
                        rowInsetPane.addPane(rowContentPane);
                    }
                    drawable.redraw();
                }
            };
            rowUi.paneFactoryChanged.on(refreshRowContentPane);
            row.attrsChanged.on(refreshRowContentPane);
            row.eventGuids.valueAdded.on(refreshRowContentPane);
            row.eventGuids.valueRemoved.on(refreshRowContentPane);
            row.timeseriesGuids.valueAdded.on(refreshRowContentPane);
            row.timeseriesGuids.valueRemoved.on(refreshRowContentPane);
            refreshRowContentPane();
            parentPane.updateLayoutArgs(function (layoutArg) {
                var shift = (webglext.isNumber(layoutArg) && layoutArg >= rowIndex);
                return (shift ? layoutArg + 1 : layoutArg);
            });
            parentPane.addPane(rowPane, rowIndex);
            rowPanes[rowGuid] = rowPane;
            // Handle hidden property
            //
            parentPane.layoutOptions(rowPane).hide = row.hidden;
            drawable.redraw();
            rowPane.dispose.on(function () {
                row.attrsChanged.off(rowAttrsChanged);
                rowUi.paneFactoryChanged.off(refreshRowContentPane);
                row.attrsChanged.off(refreshRowContentPane);
                row.eventGuids.valueAdded.off(refreshRowContentPane);
                row.eventGuids.valueRemoved.off(refreshRowContentPane);
                row.timeseriesGuids.valueAdded.off(refreshRowContentPane);
                row.timeseriesGuids.valueRemoved.off(refreshRowContentPane);
                rowUi.removePane(keyPrefix + '-background');
                rowUi.removePane(keyPrefix + '-inset');
                rowUi.removePane(keyPrefix + '-label');
                rowUi.removePane(keyPrefix + '-header');
            });
        };
        guidList.forEach(addRow);
        guidList.valueAdded.on(addRow);
        var valueMoved = function (rowGuid, rowOldIndex, rowNewIndex) {
            var nMin = Math.min(rowOldIndex, rowNewIndex);
            var nMax = Math.max(rowOldIndex, rowNewIndex);
            for (var n = nMin; n <= nMax; n++) {
                var rowGuid = guidList.valueAt(n);
                parentPane.setLayoutArg(rowPanes[rowGuid], n);
            }
            drawable.redraw();
        };
        guidList.valueMoved.on(valueMoved);
        var removeRow = function (rowGuid, rowIndex) {
            var pane = rowPanes[rowGuid];
            pane.dispose.fire();
            parentPane.removePane(pane);
            parentPane.updateLayoutArgs(function (layoutArg) {
                var shift = (webglext.isNumber(layoutArg) && layoutArg > rowIndex);
                return (shift ? layoutArg - 1 : layoutArg);
            });
            delete rowPanes[rowGuid];
            drawable.redraw();
        };
        guidList.valueRemoved.on(removeRow);
        // Handle listing for hidden property
        //
        var attrsChangedListeners = {};
        var attachAttrsChangedListener = function (rowGuid, rowIndex) {
            var row = model.row(rowGuid);
            var attrsChangedListener = function () {
                if (webglext.isNotEmpty(row.hidden && webglext.isNotEmpty(rowPanes[rowGuid]))) {
                    parentPane.layoutOptions(rowPanes[rowGuid]).hide = row.hidden;
                    drawable.redraw();
                }
            };
            attrsChangedListeners[rowGuid] = attrsChangedListener;
            row.attrsChanged.on(attrsChangedListener);
        };
        var unattachAttrsChangedListener = function (rowGuid, rowIndex) {
            var row = model.row(rowGuid);
            row.attrsChanged.off(attrsChangedListeners[rowGuid]);
        };
        guidList.forEach(attachAttrsChangedListener);
        guidList.valueAdded.on(attachAttrsChangedListener);
        guidList.valueRemoved.on(unattachAttrsChangedListener);
        // Redraw
        //
        drawable.redraw();
        // Dispose
        parentPane.dispose.on(function () {
            guidList.valueAdded.off(addRow);
            guidList.valueMoved.off(valueMoved);
            guidList.valueRemoved.off(removeRow);
            guidList.valueAdded.off(attachAttrsChangedListener);
            guidList.valueRemoved.off(unattachAttrsChangedListener);
        });
    }
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_pane.js.map