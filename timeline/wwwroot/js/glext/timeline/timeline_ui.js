var webglext;
(function (webglext) {
    var TimelineUi = /** @class */ (function () {
        function TimelineUi(model, options) {
            if (options === void 0) { options = {}; }
            this._dispose = new webglext.Notification();
            this._input = new TimelineInput();
            var getPaneId = function (pane) {
                var paneId = pane['webglext_PaneId'];
                return webglext.isNotEmpty(paneId) ? paneId : webglext.getObjectId(pane);
            };
            this._panes = new webglext.OrderedSet([], getPaneId);
            this._selection = new TimelineSelectionModel();
            attachTimelineInputToSelection(this._input, this._selection, options);
            this._groupUis = new webglext.OrderedSet([], function (g) { return g.groupGuid; });
            var groupUis = this._groupUis;
            var addGroupUi = function (group) { groupUis.add(new TimelineGroupUi(group.groupGuid)); };
            var removeGroupUi = function (group) { groupUis.removeId(group.groupGuid); };
            model.groups.forEach(addGroupUi);
            model.groups.valueAdded.on(addGroupUi);
            model.groups.valueRemoved.on(removeGroupUi);
            this._rowUis = new webglext.OrderedSet([], function (r) { return r.rowGuid; });
            var rowUis = this._rowUis;
            var addRowUi = function (row) { rowUis.add(new TimelineRowUi(row.rowGuid)); };
            var removeRowUi = function (row) { rowUis.removeId(row.rowGuid); };
            model.rows.forEach(addRowUi);
            model.rows.valueAdded.on(addRowUi);
            model.rows.valueRemoved.on(removeRowUi);
            this._eventStyles = new webglext.OrderedSet([], function (s) { return s.styleGuid; });
            this._annotationStyles = new webglext.OrderedSet([], function (s) { return s.styleGuid; });
            this._millisPerPx = new webglext.SimpleModel(1000);
            this._imageStatus = {};
            this._imageCache = {};
            this._dispose.on(function () {
                model.groups.valueAdded.off(addGroupUi);
                model.groups.valueRemoved.off(removeGroupUi);
                model.rows.valueAdded.off(addRowUi);
                model.rows.valueRemoved.off(removeRowUi);
            });
        }
        Object.defineProperty(TimelineUi.prototype, "input", {
            get: function () {
                return this._input;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineUi.prototype, "selection", {
            get: function () {
                return this._selection;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineUi.prototype, "groupUis", {
            get: function () {
                return this._groupUis;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.groupUi = function (groupGuid) {
            return this._groupUis.valueFor(groupGuid);
        };
        Object.defineProperty(TimelineUi.prototype, "rowUis", {
            get: function () {
                return this._rowUis;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.rowUi = function (rowGuid) {
            return this._rowUis.valueFor(rowGuid);
        };
        Object.defineProperty(TimelineUi.prototype, "eventStyles", {
            get: function () {
                return this._eventStyles;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.eventStyle = function (styleGuid) {
            return ((webglext.isNotEmpty(styleGuid) && this._eventStyles.valueFor(styleGuid)) || timelineEventStyle_DEFAULT);
        };
        Object.defineProperty(TimelineUi.prototype, "annotationStyles", {
            get: function () {
                return this._annotationStyles;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.annotationStyle = function (styleGuid) {
            return ((webglext.isNotEmpty(styleGuid) && this._annotationStyles.valueFor(styleGuid)) || timelineAnnotationStyle_DEFAULT);
        };
        Object.defineProperty(TimelineUi.prototype, "millisPerPx", {
            get: function () {
                return this._millisPerPx;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.loadImage = function (url, onLoaded) {
            if (!webglext.isNotEmpty(this._imageStatus[url])) {
                this._imageStatus[url] = true;
                var imageCache = this._imageCache;
                var image = new Image();
                image.onload = function () {
                    var w = image.naturalWidth;
                    var h = image.naturalHeight;
                    imageCache[url] = new webglext.Texture2D(w, h, webglext.GL.LINEAR, webglext.GL.LINEAR, function (g) { g.drawImage(image, 0, 0); });
                    if (onLoaded)
                        onLoaded();
                };
                image.src = url;
            }
            return this._imageCache[url];
        };
        Object.defineProperty(TimelineUi.prototype, "panes", {
            get: function () {
                return this._panes;
            },
            enumerable: false,
            configurable: true
        });
        TimelineUi.prototype.addPane = function (paneId, pane) {
            pane['webglext_PaneId'] = paneId;
            this._panes.removeId(paneId);
            this._panes.add(pane);
        };
        TimelineUi.prototype.removePane = function (paneId) {
            this._panes.removeId(paneId);
        };
        TimelineUi.prototype.getPane = function (paneId) {
            return this._panes.valueFor(paneId);
        };
        Object.defineProperty(TimelineUi.prototype, "dispose", {
            get: function () { return this._dispose; },
            enumerable: false,
            configurable: true
        });
        return TimelineUi;
    }());
    webglext.TimelineUi = TimelineUi;
    var TimelineGroupUi = /** @class */ (function () {
        function TimelineGroupUi(groupGuid) {
            this._groupGuid = groupGuid;
        }
        Object.defineProperty(TimelineGroupUi.prototype, "groupGuid", {
            get: function () {
                return this._groupGuid;
            },
            enumerable: false,
            configurable: true
        });
        return TimelineGroupUi;
    }());
    webglext.TimelineGroupUi = TimelineGroupUi;
    var TimelineRowUi = /** @class */ (function () {
        function TimelineRowUi(rowGuid) {
            this._rowGuid = rowGuid;
            this._paneFactoryChanged = new webglext.Notification();
            this._paneFactory = null;
            var getPaneId = function (pane) {
                var paneId = pane['webglext_PaneId'];
                return webglext.isNotEmpty(paneId) ? paneId : webglext.getObjectId(pane);
            };
            this._panes = new webglext.OrderedSet([], getPaneId);
        }
        Object.defineProperty(TimelineRowUi.prototype, "rowGuid", {
            get: function () {
                return this._rowGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowUi.prototype, "paneFactoryChanged", {
            get: function () {
                return this._paneFactoryChanged;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowUi.prototype, "paneFactory", {
            get: function () {
                return this._paneFactory;
            },
            set: function (paneFactory) {
                if (paneFactory !== this._paneFactory) {
                    this._paneFactory = paneFactory;
                    this._paneFactoryChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowUi.prototype, "panes", {
            get: function () {
                return this._panes;
            },
            enumerable: false,
            configurable: true
        });
        TimelineRowUi.prototype.addPane = function (paneId, pane) {
            pane['webglext_PaneId'] = paneId;
            this._panes.removeId(paneId);
            this._panes.add(pane);
        };
        TimelineRowUi.prototype.removePane = function (paneId) {
            this._panes.removeId(paneId);
        };
        TimelineRowUi.prototype.getPane = function (paneId) {
            return this._panes.valueFor(paneId);
        };
        return TimelineRowUi;
    }());
    webglext.TimelineRowUi = TimelineRowUi;
    var timelineAnnotationStyle_DEFAULT = new webglext.TimelineAnnotationStyleUi({
        styleGuid: 'DEFAULT',
        color: 'white',
        icons: []
    });
    var timelineEventStyle_DEFAULT = new webglext.TimelineEventStyleUi({
        styleGuid: 'DEFAULT',
        icons: []
    });
    var TimelineInput = /** @class */ (function () {
        function TimelineInput() {
            this._mouseMove = new webglext.Notification1();
            this._mouseExit = new webglext.Notification1();
            this._timeHover = new webglext.Notification2();
            this._rowHover = new webglext.Notification2();
            this._eventHover = new webglext.Notification2();
            this._mouseDown = new webglext.Notification1();
            this._mouseUp = new webglext.Notification1();
            this._contextMenu = new webglext.Notification1();
        }
        Object.defineProperty(TimelineInput.prototype, "mouseMove", {
            get: function () { return this._mouseMove; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "mouseExit", {
            get: function () { return this._mouseExit; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "timeHover", {
            get: function () { return this._timeHover; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "rowHover", {
            get: function () { return this._rowHover; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "eventHover", {
            get: function () { return this._eventHover; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "mouseDown", {
            get: function () { return this._mouseDown; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "mouseUp", {
            get: function () { return this._mouseUp; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineInput.prototype, "contextMenu", {
            get: function () { return this._contextMenu; },
            enumerable: false,
            configurable: true
        });
        return TimelineInput;
    }());
    webglext.TimelineInput = TimelineInput;
    var TimelineSelectionModel = /** @class */ (function () {
        function TimelineSelectionModel() {
            this._mousePos = new webglext.XyModel();
            this._hoveredY = new webglext.SimpleModel();
            this._hoveredTime_PMILLIS = new webglext.SimpleModel();
            this._selectedInterval = new TimeIntervalModel(0, 0);
            this._hoveredRow = new webglext.SimpleModel();
            this._hoveredEvent = new webglext.SimpleModel();
            this._selectedEvents = new webglext.OrderedSet([], function (e) { return e.eventGuid; });
            this._hoveredAnnotation = new webglext.SimpleModel();
        }
        Object.defineProperty(TimelineSelectionModel.prototype, "mousePos", {
            get: function () { return this._mousePos; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "hoveredY", {
            get: function () { return this._hoveredY; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "hoveredTime_PMILLIS", {
            get: function () { return this._hoveredTime_PMILLIS; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "selectedInterval", {
            get: function () { return this._selectedInterval; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "hoveredRow", {
            get: function () { return this._hoveredRow; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "hoveredEvent", {
            get: function () { return this._hoveredEvent; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "selectedEvents", {
            get: function () { return this._selectedEvents; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineSelectionModel.prototype, "hoveredAnnotation", {
            get: function () { return this._hoveredAnnotation; },
            enumerable: false,
            configurable: true
        });
        return TimelineSelectionModel;
    }());
    webglext.TimelineSelectionModel = TimelineSelectionModel;
    var TimeIntervalModel = /** @class */ (function () {
        function TimeIntervalModel(start_PMILLIS, end_PMILLIS, cursor_PMILLIS) {
            this._start_PMILLIS = start_PMILLIS;
            this._end_PMILLIS = end_PMILLIS;
            this._cursor_PMILLIS = cursor_PMILLIS ? cursor_PMILLIS : end_PMILLIS;
            this._changed = new webglext.Notification();
        }
        Object.defineProperty(TimeIntervalModel.prototype, "start_PMILLIS", {
            get: function () { return this._start_PMILLIS; },
            set: function (start_PMILLIS) {
                if (start_PMILLIS !== this._start_PMILLIS) {
                    this._start_PMILLIS = start_PMILLIS;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimeIntervalModel.prototype, "end_PMILLIS", {
            get: function () { return this._end_PMILLIS; },
            set: function (end_PMILLIS) {
                if (end_PMILLIS !== this._end_PMILLIS) {
                    this._end_PMILLIS = end_PMILLIS;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimeIntervalModel.prototype, "cursor_PMILLIS", {
            get: function () { return this._cursor_PMILLIS; },
            set: function (cursor_PMILLIS) {
                if (cursor_PMILLIS !== this._cursor_PMILLIS) {
                    this._cursor_PMILLIS = cursor_PMILLIS;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimeIntervalModel.prototype, "duration_MILLIS", {
            get: function () { return this._end_PMILLIS - this._start_PMILLIS; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimeIntervalModel.prototype, "changed", {
            get: function () { return this._changed; },
            enumerable: false,
            configurable: true
        });
        TimeIntervalModel.prototype.setInterval = function (start_PMILLIS, end_PMILLIS, cursor_PMILLIS) {
            if (start_PMILLIS !== this._start_PMILLIS ||
                end_PMILLIS !== this._end_PMILLIS ||
                (cursor_PMILLIS && cursor_PMILLIS != this._cursor_PMILLIS)) {
                this._start_PMILLIS = start_PMILLIS;
                this._end_PMILLIS = end_PMILLIS;
                this._cursor_PMILLIS = cursor_PMILLIS ? cursor_PMILLIS : end_PMILLIS;
                this._changed.fire();
            }
        };
        TimeIntervalModel.prototype.overlaps = function (start_PMILLIS, end_PMILLIS) {
            return (this._start_PMILLIS <= end_PMILLIS && start_PMILLIS <= this._end_PMILLIS);
        };
        TimeIntervalModel.prototype.contains = function (time_PMILLIS) {
            return (this._start_PMILLIS <= time_PMILLIS && time_PMILLIS <= this._end_PMILLIS);
        };
        TimeIntervalModel.prototype.pan = function (amount_MILLIS) {
            if (amount_MILLIS !== 0) {
                this._start_PMILLIS += amount_MILLIS;
                this._end_PMILLIS += amount_MILLIS;
                this._cursor_PMILLIS += amount_MILLIS;
                this._changed.fire();
            }
        };
        TimeIntervalModel.prototype.scale = function (factor, anchor_PMILLIS) {
            if (anchor_PMILLIS !== 1) {
                this._start_PMILLIS = anchor_PMILLIS + factor * (this._start_PMILLIS - anchor_PMILLIS);
                this._end_PMILLIS = anchor_PMILLIS + factor * (this._end_PMILLIS - anchor_PMILLIS);
                this._cursor_PMILLIS = anchor_PMILLIS + factor * (this._cursor_PMILLIS - anchor_PMILLIS);
                this._changed.fire();
            }
        };
        return TimeIntervalModel;
    }());
    webglext.TimeIntervalModel = TimeIntervalModel;
    function attachTimelineInputToSelection(input, selection, options) {
        var allowEventMultiSelection = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.allowEventMultiSelection) ? options.allowEventMultiSelection : true);
        // Mouse-pos & Time
        //
        input.mouseMove.on(function (ev) {
            selection.mousePos.setXy(ev.i, ev.j);
        });
        input.mouseExit.on(function (ev) {
            selection.mousePos.setXy(null, null);
        });
        input.rowHover.on(function (row, ev) {
            selection.hoveredRow.value = row;
        });
        input.timeHover.on(function (time_PMILLIS, ev) {
            selection.hoveredTime_PMILLIS.value = time_PMILLIS;
        });
        // Events
        //
        input.eventHover.on(function (event) {
            selection.hoveredEvent.value = event;
        });
        if (options.allowEventMultiSelection) {
            input.mouseDown.on(function (ev) {
                if (webglext.isLeftMouseDown(ev.mouseEvent)) {
                    var event = selection.hoveredEvent.value;
                    if (webglext.isNotEmpty(event)) {
                        var multiSelectMode = (ev.mouseEvent && (ev.mouseEvent.ctrlKey || ev.mouseEvent.shiftKey));
                        var unselectedEventClicked = !selection.selectedEvents.hasValue(event);
                        if (multiSelectMode) {
                            if (selection.selectedEvents.hasValue(event)) {
                                selection.selectedEvents.removeValue(event);
                            }
                            else {
                                selection.selectedEvents.add(event);
                            }
                        }
                        else if (unselectedEventClicked) {
                            selection.selectedEvents.retainValues([event]);
                            selection.selectedEvents.add(event);
                        }
                        else {
                            // if a selected event is clicked, do nothing (the user is probably initiating a drag)
                            // if they wish to deselect the event, they need to ctrl+click the event or click on
                            // a deselected event
                        }
                    }
                }
            });
        }
        else {
            input.mouseDown.on(function (ev) {
                if (webglext.isLeftMouseDown(ev.mouseEvent)) {
                    var event = selection.hoveredEvent.value;
                    if (webglext.isNotEmpty(event)) {
                        selection.selectedEvents.retainValues([event]);
                        selection.selectedEvents.add(event);
                    }
                }
            });
        }
    }
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_ui.js.map