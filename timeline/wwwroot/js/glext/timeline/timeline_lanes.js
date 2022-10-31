var webglext;
(function (webglext) {
    var TimelineLaneArray = /** @class */ (function () {
        function TimelineLaneArray(model, row, ui, allowMultipleLanes) {
            this._model = model;
            this._row = row;
            this._ui = ui;
            this._lanes = [];
            this._laneNums = {};
            this._eventAttrsListeners = {};
            var self = this;
            function findAvailableLaneNum(event, startLaneNum, endLaneNum) {
                for (var n = startLaneNum; n < endLaneNum; n++) {
                    if (self._lanes[n].couldFitEvent(event)) {
                        return n;
                    }
                }
                return null;
            }
            function firstAvailableLaneNum(event) {
                var laneNum = findAvailableLaneNum(event, 0, self._lanes.length);
                return (webglext.isNotEmpty(laneNum) ? laneNum : self._lanes.length);
            }
            function addEventToLane(event, laneNum) {
                if (!self._lanes[laneNum]) {
                    self._lanes[laneNum] = allowMultipleLanes ? new TimelineLaneStack(ui) : new TimelineLaneSimple(ui);
                }
                self._lanes[laneNum].add(event);
                self._laneNums[event.eventGuid] = laneNum;
            }
            function fillVacancy(vacancyLaneNum, vacancyEdges_PMILLIS) {
                var vacancyLane = self._lanes[vacancyLaneNum];
                for (var n = vacancyLaneNum + 1; n < self._lanes.length; n++) {
                    var lane = self._lanes[n];
                    var possibleTenants = lane.collisionsWithInterval(vacancyEdges_PMILLIS[0], vacancyEdges_PMILLIS[1]);
                    for (var p = 0; p < possibleTenants.length; p++) {
                        var event = possibleTenants[p];
                        if (vacancyLane.couldFitEvent(event)) {
                            lane.remove(event);
                            addEventToLane(event, vacancyLaneNum);
                            fillVacancy(n, effectiveEdges_PMILLIS(ui, event));
                        }
                    }
                }
            }
            function trimEmptyLanes() {
                for (var n = self._lanes.length - 1; n >= 0; n--) {
                    if (self._lanes[n].isEmpty()) {
                        self._lanes.splice(n, 1);
                    }
                    else {
                        break;
                    }
                }
            }
            // adds event to lane, may be called multiple times
            this._addEvent = function (eventGuid) {
                if (webglext.isNotEmpty(self._laneNums[eventGuid])) {
                    throw new Error('Lanes-array already contains this event: row-guid = ' + row.rowGuid + ', lane = ' + self._laneNums[eventGuid] + ', event-guid = ' + eventGuid);
                }
                var event = model.event(eventGuid);
                var laneNum = firstAvailableLaneNum(event);
                addEventToLane(event, laneNum);
            };
            row.eventGuids.forEach(this._addEvent);
            row.eventGuids.valueAdded.on(this._addEvent);
            // attaches listeners to event, should be called only once
            // when an event is first added to the row model
            this._newEvent = function (eventGuid) {
                var event = model.event(eventGuid);
                var oldEdges_PMILLIS = effectiveEdges_PMILLIS(ui, event);
                var updateLaneAssignment = function () {
                    var newEdges_PMILLIS = effectiveEdges_PMILLIS(ui, event);
                    if (newEdges_PMILLIS[0] !== oldEdges_PMILLIS[0] || newEdges_PMILLIS[1] !== oldEdges_PMILLIS[1]) {
                        var oldLaneNum = self._laneNums[event.eventGuid];
                        var oldLane = self._lanes[oldLaneNum];
                        var betterLaneNum = findAvailableLaneNum(event, 0, oldLaneNum);
                        if (webglext.isNotEmpty(betterLaneNum)) {
                            // Move to a better lane
                            oldLane.remove(event);
                            addEventToLane(event, betterLaneNum);
                        }
                        else if (oldLane.eventStillFits(event)) {
                            // Stay in the current lane
                            oldLane.update(event);
                        }
                        else {
                            // Take whatever lane we can get
                            var newLaneNum = findAvailableLaneNum(event, oldLaneNum + 1, self._lanes.length);
                            if (!webglext.isNotEmpty(newLaneNum))
                                newLaneNum = self._lanes.length;
                            oldLane.remove(event);
                            addEventToLane(event, newLaneNum);
                        }
                        fillVacancy(oldLaneNum, oldEdges_PMILLIS);
                        trimEmptyLanes();
                        oldEdges_PMILLIS = newEdges_PMILLIS;
                    }
                };
                event.attrsChanged.on(updateLaneAssignment);
                self._eventAttrsListeners[eventGuid] = updateLaneAssignment;
            };
            row.eventGuids.forEach(this._newEvent);
            row.eventGuids.valueAdded.on(this._newEvent);
            this._removeEvent = function (eventGuid) {
                var event = model.event(eventGuid);
                var oldLaneNum = self._laneNums[eventGuid];
                delete self._laneNums[eventGuid];
                self._lanes[oldLaneNum].remove(event);
                fillVacancy(oldLaneNum, effectiveEdges_PMILLIS(ui, event));
                trimEmptyLanes();
                event.attrsChanged.off(self._eventAttrsListeners[eventGuid]);
                delete self._eventAttrsListeners[eventGuid];
            };
            row.eventGuids.valueRemoved.on(this._removeEvent);
            self._rebuildLanes = function () {
                var oldLanes = self._lanes;
                self._lanes = [];
                self._laneNums = {};
                for (var l = 0; l < oldLanes.length; l++) {
                    var lane = oldLanes[l];
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        self._addEvent(event.eventGuid);
                    }
                }
            };
            var hasIcons = function () {
                var oldLanes = self._lanes;
                for (var l = 0; l < oldLanes.length; l++) {
                    var lane = oldLanes[l];
                    for (var e = 0; e < lane.length; e++) {
                        var event = lane.event(e);
                        var style = ui.eventStyle(event.styleGuid);
                        if (event.labelIcon || style.numIcons > 0)
                            return true;
                    }
                }
                return false;
            };
            self._rebuildLanesMouseWheel = function () {
                if (hasIcons()) {
                    self._rebuildLanes();
                }
            };
            ui.millisPerPx.changed.on(self._rebuildLanesMouseWheel);
            ui.eventStyles.valueAdded.on(self._rebuildLanes);
            ui.eventStyles.valueRemoved.on(self._rebuildLanes);
        }
        Object.defineProperty(TimelineLaneArray.prototype, "length", {
            get: function () {
                return this._lanes.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineLaneArray.prototype.lane = function (index) {
            return this._lanes[index];
        };
        Object.defineProperty(TimelineLaneArray.prototype, "numEvents", {
            get: function () {
                return this._row.eventGuids.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineLaneArray.prototype.eventAt = function (laneNum, time_PMILLIS) {
            var lane = this._lanes[laneNum];
            return (lane && lane.eventAtTime(time_PMILLIS));
        };
        TimelineLaneArray.prototype.dispose = function () {
            this._row.eventGuids.valueAdded.off(this._addEvent);
            this._row.eventGuids.valueRemoved.off(this._removeEvent);
            this._row.eventGuids.valueAdded.off(this._newEvent);
            this._ui.millisPerPx.changed.off(this._rebuildLanesMouseWheel);
            this._ui.eventStyles.valueAdded.off(this._rebuildLanes);
            this._ui.eventStyles.valueRemoved.off(this._rebuildLanes);
            for (var eventGuid in this._eventAttrsListeners) {
                if (this._eventAttrsListeners.hasOwnProperty(eventGuid)) {
                    var listener = this._eventAttrsListeners[eventGuid];
                    var event = this._model.event(eventGuid);
                    if (listener && event)
                        event.attrsChanged.off(listener);
                }
            }
        };
        return TimelineLaneArray;
    }());
    webglext.TimelineLaneArray = TimelineLaneArray;
    function effectiveEdges_PMILLIS(ui, event) {
        var start_PMILLIS = event.start_PMILLIS;
        var end_PMILLIS = event.end_PMILLIS;
        var millisPerPx = ui.millisPerPx.value;
        var eventStyle = ui.eventStyle(event.styleGuid);
        for (var n = 0; n < eventStyle.numIcons; n++) {
            var icon = eventStyle.icon(n);
            var iconTime_PMILLIS = event.start_PMILLIS + icon.hPos * (event.end_PMILLIS - event.start_PMILLIS);
            var iconStart_PMILLIS = iconTime_PMILLIS - (millisPerPx * icon.hAlign * icon.displayWidth);
            var iconEnd_PMILLIS = iconTime_PMILLIS + (millisPerPx * (1 - icon.hAlign) * icon.displayWidth);
            start_PMILLIS = Math.min(start_PMILLIS, iconStart_PMILLIS);
            end_PMILLIS = Math.max(end_PMILLIS, iconEnd_PMILLIS);
        }
        return [start_PMILLIS, end_PMILLIS];
    }
    webglext.effectiveEdges_PMILLIS = effectiveEdges_PMILLIS;
    // a TimelineLane where no events start/end time overlap
    var TimelineLaneStack = /** @class */ (function () {
        function TimelineLaneStack(ui) {
            this._events = [];
            this._starts_PMILLIS = [];
            this._ends_PMILLIS = [];
            this._indices = {};
            this._ui = ui;
        }
        Object.defineProperty(TimelineLaneStack.prototype, "length", {
            get: function () {
                return this._events.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineLaneStack.prototype.event = function (index) {
            return this._events[index];
        };
        TimelineLaneStack.prototype.isEmpty = function () {
            return (this._events.length === 0);
        };
        TimelineLaneStack.prototype.eventAtTime = function (time_PMILLIS) {
            if (webglext.isNotEmpty(time_PMILLIS)) {
                // Check the first event ending after time
                var iFirst = webglext.indexAfter(this._ends_PMILLIS, time_PMILLIS);
                if (iFirst < this._events.length) {
                    var eventFirst = this._events[iFirst];
                    var startFirst_PMILLIS = effectiveEdges_PMILLIS(this._ui, eventFirst)[0];
                    if (time_PMILLIS >= startFirst_PMILLIS) {
                        return eventFirst;
                    }
                }
                // Check the previous event, in case we're in its icon-slop
                var iPrev = iFirst - 1;
                if (iPrev >= 0) {
                    var eventPrev = this._events[iPrev];
                    var endPrev_PMILLIS = effectiveEdges_PMILLIS(this._ui, eventPrev)[1];
                    if (time_PMILLIS < endPrev_PMILLIS) {
                        return eventPrev;
                    }
                }
            }
            return null;
        };
        TimelineLaneStack.prototype.add = function (event) {
            var eventGuid = event.eventGuid;
            if (webglext.isNotEmpty(this._indices[eventGuid]))
                throw new Error('Lane already contains this event: event = ' + formatEvent(event));
            var i = webglext.indexAfter(this._starts_PMILLIS, event.start_PMILLIS);
            if (!this._eventFitsBetween(event, i - 1, i))
                throw new Error('New event does not fit between existing events: new = ' + formatEvent(event) + ', before = ' + formatEvent(this._events[i - 1]) + ', after = ' + formatEvent(this._events[i]));
            this._events.splice(i, 0, event);
            this._starts_PMILLIS.splice(i, 0, event.start_PMILLIS);
            this._ends_PMILLIS.splice(i, 0, event.end_PMILLIS);
            this._indices[eventGuid] = i;
            for (var n = i; n < this._events.length; n++) {
                this._indices[this._events[n].eventGuid] = n;
            }
        };
        TimelineLaneStack.prototype.remove = function (event) {
            var eventGuid = event.eventGuid;
            var i = this._indices[eventGuid];
            if (!webglext.isNotEmpty(i))
                throw new Error('Event not found in this lane: event = ' + formatEvent(event));
            this._events.splice(i, 1);
            this._starts_PMILLIS.splice(i, 1);
            this._ends_PMILLIS.splice(i, 1);
            delete this._indices[eventGuid];
            for (var n = i; n < this._events.length; n++) {
                this._indices[this._events[n].eventGuid] = n;
            }
        };
        TimelineLaneStack.prototype.eventStillFits = function (event) {
            var i = this._indices[event.eventGuid];
            if (!webglext.isNotEmpty(i))
                throw new Error('Event not found in this lane: event = ' + formatEvent(event));
            return this._eventFitsBetween(event, i - 1, i + 1);
        };
        TimelineLaneStack.prototype.update = function (event) {
            var i = this._indices[event.eventGuid];
            if (!webglext.isNotEmpty(i))
                throw new Error('Event not found in this lane: event = ' + formatEvent(event));
            this._starts_PMILLIS[i] = event.start_PMILLIS;
            this._ends_PMILLIS[i] = event.end_PMILLIS;
        };
        TimelineLaneStack.prototype.collisionsWithInterval = function (start_PMILLIS, end_PMILLIS) {
            // Find the first event ending after start
            var iFirst = webglext.indexAfter(this._ends_PMILLIS, start_PMILLIS);
            var iPrev = iFirst - 1;
            if (iPrev >= 0) {
                var endPrev_PMILLIS = effectiveEdges_PMILLIS(this._ui, this._events[iPrev])[1];
                if (start_PMILLIS < endPrev_PMILLIS) {
                    iFirst = iPrev;
                }
            }
            // Find the last event starting before end
            var iLast = webglext.indexBefore(this._starts_PMILLIS, end_PMILLIS);
            var iPost = iLast + 1;
            if (iPost < this._events.length) {
                var startPost_PMILLIS = effectiveEdges_PMILLIS(this._ui, this._events[iPost])[0];
                if (end_PMILLIS > startPost_PMILLIS) {
                    iLast = iPost;
                }
            }
            // Return that section
            return this._events.slice(iFirst, iLast + 1);
        };
        TimelineLaneStack.prototype.couldFitEvent = function (event) {
            var iAfter = webglext.indexAfter(this._starts_PMILLIS, event.start_PMILLIS);
            var iBefore = iAfter - 1;
            return this._eventFitsBetween(event, iBefore, iAfter);
        };
        TimelineLaneStack.prototype._eventFitsBetween = function (event, iBefore, iAfter) {
            var edges_PMILLIS = effectiveEdges_PMILLIS(this._ui, event);
            if (iBefore >= 0) {
                // Comparing one start-time (inclusive) and one end-time (exclusive), so equality means no collision
                var edgesBefore_PMILLIS = effectiveEdges_PMILLIS(this._ui, this._events[iBefore]);
                if (edges_PMILLIS[0] < edgesBefore_PMILLIS[1]) {
                    return false;
                }
            }
            if (iAfter < this._events.length) {
                // Comparing one start-time (inclusive) and one end-time (exclusive), so equality means no collision
                var edgesAfter_PMILLIS = effectiveEdges_PMILLIS(this._ui, this._events[iAfter]);
                if (edges_PMILLIS[1] > edgesAfter_PMILLIS[0]) {
                    return false;
                }
            }
            return true;
        };
        return TimelineLaneStack;
    }());
    webglext.TimelineLaneStack = TimelineLaneStack;
    // a TimelineLane where events are allowed to overlap arbitrarily
    // because of this assumptions like the index for an event in the _starts_PMILLIS
    // and _ends_PMILLIS arrays being the same no longer hold
    //
    // does not make any assumptions about event overlapping and uses
    // an inefficient O(n) brute force search to find events (an interval tree
    // would be needed for efficient search in the general case)
    var TimelineLaneSimple = /** @class */ (function () {
        function TimelineLaneSimple(ui) {
            this._events = [];
            this._orders = [];
            this._ids = {};
            this._ui = ui;
        }
        Object.defineProperty(TimelineLaneSimple.prototype, "length", {
            get: function () {
                return this._events.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineLaneSimple.prototype.event = function (index) {
            return this._events[index];
        };
        TimelineLaneSimple.prototype.isEmpty = function () {
            return (this._events.length === 0);
        };
        TimelineLaneSimple.prototype.eventAtTime = function (time_PMILLIS) {
            var bestEvent;
            // start at end of events list so that eventAtTime result
            // favors events drawn on top (in cases where events are unordered
            // those that happen to be at end end of the list are drawn last
            for (var n = this._events.length - 1; n >= 0; n--) {
                var event = this._events[n];
                var eventEdges_PMILLIS = effectiveEdges_PMILLIS(this._ui, event);
                if (time_PMILLIS > eventEdges_PMILLIS[0] &&
                    time_PMILLIS < eventEdges_PMILLIS[1] &&
                    (bestEvent === undefined || bestEvent.order < event.order)) {
                    bestEvent = event;
                }
            }
            return bestEvent;
        };
        TimelineLaneSimple.prototype.add = function (event) {
            var eventGuid = event.eventGuid;
            if (webglext.isNotEmpty(this._ids[eventGuid]))
                throw new Error('Lane already contains this event: event = ' + formatEvent(event));
            // for events with undefined order, replace with largest possible negative order so sort is correct
            var order = webglext.isNotEmpty(event.order) ? event.order : Number.NEGATIVE_INFINITY;
            var i = webglext.indexAtOrAfter(this._orders, order);
            this._ids[eventGuid] = eventGuid;
            this._orders.splice(i, 0, order);
            this._events.splice(i, 0, event);
        };
        TimelineLaneSimple.prototype.remove = function (event) {
            var eventGuid = event.eventGuid;
            if (!webglext.isNotEmpty(this._ids[eventGuid]))
                throw new Error('Event not found in this lane: event = ' + formatEvent(event));
            delete this._ids[eventGuid];
            var i = this._getIndex(event);
            this._orders.splice(i, 1);
            this._events.splice(i, 1);
        };
        TimelineLaneSimple.prototype.update = function (event) {
            this.remove(event);
            this.add(event);
        };
        TimelineLaneSimple.prototype.collisionsWithInterval = function (start_PMILLIS, end_PMILLIS) {
            var results = [];
            for (var n = 0; n < this._events.length; n++) {
                var event = this._events[n];
                if (!(start_PMILLIS > event.end_PMILLIS || end_PMILLIS < event.start_PMILLIS)) {
                    results.push(event);
                }
            }
            return results;
        };
        // we can always fit more events because overlaps are allowed
        TimelineLaneSimple.prototype.eventStillFits = function (event) {
            return true;
        };
        // we can always fit more events because overlaps are allowed
        TimelineLaneSimple.prototype.couldFitEvent = function (event) {
            return true;
        };
        TimelineLaneSimple.prototype._getIndex = function (queryEvent) {
            for (var n = 0; n < this._events.length; n++) {
                var event = this._events[n];
                if (queryEvent.eventGuid === event.eventGuid) {
                    return n;
                }
            }
            throw new Error('Event not found in this lane: event = ' + formatEvent(queryEvent));
        };
        return TimelineLaneSimple;
    }());
    webglext.TimelineLaneSimple = TimelineLaneSimple;
    function formatEvent(event) {
        if (!webglext.isNotEmpty(event)) {
            return '' + event;
        }
        else {
            return (event.label + ' [ ' + webglext.formatTime_ISO8601(event.start_PMILLIS) + ' ... ' + webglext.formatTime_ISO8601(event.end_PMILLIS) + ' ]');
        }
    }
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_lanes.js.map