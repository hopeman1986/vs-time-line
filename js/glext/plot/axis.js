var webglext;
(function (webglext) {
    var Axis1D = /** @class */ (function () {
        function Axis1D(vMin, vMax) {
            this._limitsChanged = new webglext.Notification();
            this._vMin = vMin;
            this._vMax = vMax;
        }
        Object.defineProperty(Axis1D.prototype, "vMin", {
            get: function () {
                return this._vMin;
            },
            set: function (vMin) {
                this._vMin = vMin;
                this._limitsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis1D.prototype, "vMax", {
            get: function () {
                return this._vMax;
            },
            set: function (vMax) {
                this._vMax = vMax;
                this._limitsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis1D.prototype, "limitsChanged", {
            get: function () {
                return this._limitsChanged;
            },
            enumerable: false,
            configurable: true
        });
        Axis1D.prototype.setVRange = function (vMin, vMax) {
            this._vMin = vMin;
            this._vMax = vMax;
            this._limitsChanged.fire();
        };
        Object.defineProperty(Axis1D.prototype, "vSize", {
            get: function () {
                return (this._vMax - this._vMin);
            },
            enumerable: false,
            configurable: true
        });
        Axis1D.prototype.vAtFrac = function (vFrac) {
            return (this._vMin + vFrac * (this._vMax - this._vMin));
        };
        Axis1D.prototype.vFrac = function (v) {
            return (v - this._vMin) / (this._vMax - this._vMin);
        };
        Axis1D.prototype.pan = function (vAmount) {
            this._vMin += vAmount;
            this._vMax += vAmount;
            this._limitsChanged.fire();
        };
        Axis1D.prototype.zoom = function (factor, vAnchor) {
            this._vMin = vAnchor - factor * (vAnchor - this._vMin);
            this._vMax = vAnchor + factor * (this._vMax - vAnchor);
            this._limitsChanged.fire();
        };
        return Axis1D;
    }());
    webglext.Axis1D = Axis1D;
    function getTickInterval(axis, approxNumTicks) {
        var vMin = Math.min(axis.vMin, axis.vMax);
        var vMax = Math.max(axis.vMin, axis.vMax);
        var approxTickInterval = (vMax - vMin) / approxNumTicks;
        var prelimTickInterval = Math.pow(10, Math.round(webglext.log10(approxTickInterval)));
        var prelimNumTicks = (vMax - vMin) / prelimTickInterval;
        if (prelimNumTicks >= 5 * approxNumTicks)
            return (prelimTickInterval * 5);
        if (prelimNumTicks >= 2 * approxNumTicks)
            return (prelimTickInterval * 2);
        if (5 * prelimNumTicks <= approxNumTicks)
            return (prelimTickInterval / 5);
        if (2 * prelimNumTicks <= approxNumTicks)
            return (prelimTickInterval / 2);
        return prelimTickInterval;
    }
    webglext.getTickInterval = getTickInterval;
    function getTickCount(axis, tickInterval) {
        return Math.ceil(Math.abs(axis.vSize) / tickInterval) + 1;
    }
    webglext.getTickCount = getTickCount;
    function getTickPositions(axis, tickInterval, tickCount, result) {
        var vMin = Math.min(axis.vMin, axis.vMax);
        var vMax = Math.max(axis.vMin, axis.vMax);
        var minTickNumber = Math.floor(vMin / tickInterval);
        for (var i = 0; i < tickCount; i++) {
            result[i] = (minTickNumber + i) * tickInterval;
        }
        if (axis.vMin > axis.vMax) {
            // XXX: Need floor() on tickCount/2?
            for (var i = 0; i < tickCount / 2; i++) {
                var temp = result[i];
                result[i] = result[tickCount - 1 - i];
                result[tickCount - 1 - i] = temp;
            }
        }
    }
    webglext.getTickPositions = getTickPositions;
    var Axis2D = /** @class */ (function () {
        function Axis2D(xAxis, yAxis) {
            this._xAxis = xAxis;
            this._yAxis = yAxis;
        }
        Object.defineProperty(Axis2D.prototype, "xAxis", {
            get: function () { return this._xAxis; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis2D.prototype, "xMin", {
            get: function () { return this._xAxis.vMin; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis2D.prototype, "xMax", {
            get: function () { return this._xAxis.vMax; },
            enumerable: false,
            configurable: true
        });
        Axis2D.prototype.xAtFrac = function (xFrac) { return this._xAxis.vAtFrac(xFrac); };
        Object.defineProperty(Axis2D.prototype, "yAxis", {
            get: function () { return this._yAxis; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis2D.prototype, "yMin", {
            get: function () { return this._yAxis.vMin; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Axis2D.prototype, "yMax", {
            get: function () { return this._yAxis.vMax; },
            enumerable: false,
            configurable: true
        });
        Axis2D.prototype.yAtFrac = function (yFrac) { return this._yAxis.vAtFrac(yFrac); };
        Axis2D.prototype.onLimitsChanged = function (listener) {
            this._xAxis.limitsChanged.on(listener);
            this._yAxis.limitsChanged.on(listener);
        };
        Axis2D.prototype.pan = function (xAmount, yAmount) {
            this._xAxis.pan(xAmount);
            this._yAxis.pan(yAmount);
        };
        Axis2D.prototype.zoom = function (factor, xAnchor, yAnchor) {
            this._xAxis.zoom(factor, xAnchor);
            this._yAxis.zoom(factor, yAnchor);
        };
        return Axis2D;
    }());
    webglext.Axis2D = Axis2D;
    function newAxis2D(xMin, xMax, yMin, yMax) {
        return new Axis2D(new Axis1D(xMin, xMax), new Axis1D(yMin, yMax));
    }
    webglext.newAxis2D = newAxis2D;
    // XXX: Would be nice if this could be a const
    webglext.axisZoomStep = 1.12;
    function attachAxisMouseListeners1D(pane, axis, isVertical) {
        var vGrab = null;
        pane.mouseDown.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && !webglext.isNotEmpty(vGrab)) {
                vGrab = axis.vAtFrac(isVertical ? webglext.yFrac(ev) : webglext.xFrac(ev));
            }
        });
        pane.mouseMove.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && webglext.isNotEmpty(vGrab)) {
                axis.pan(vGrab - axis.vAtFrac(isVertical ? webglext.yFrac(ev) : webglext.xFrac(ev)));
            }
        });
        pane.mouseUp.on(function (ev) {
            vGrab = null;
        });
        pane.mouseWheel.on(function (ev) {
            var zoomFactor = Math.pow(webglext.axisZoomStep, ev.wheelSteps);
            axis.zoom(zoomFactor, axis.vAtFrac(isVertical ? webglext.yFrac(ev) : webglext.xFrac(ev)));
        });
    }
    webglext.attachAxisMouseListeners1D = attachAxisMouseListeners1D;
    function attachAxisMouseListeners2D(pane, axis) {
        var xGrab = null;
        var yGrab = null;
        pane.mouseDown.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && !webglext.isNotEmpty(xGrab)) {
                xGrab = axis.xAtFrac(webglext.xFrac(ev));
                yGrab = axis.yAtFrac(webglext.yFrac(ev));
            }
        });
        pane.mouseMove.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && webglext.isNotEmpty(xGrab)) {
                axis.pan(xGrab - axis.xAtFrac(webglext.xFrac(ev)), yGrab - axis.yAtFrac(webglext.yFrac(ev)));
            }
        });
        pane.mouseUp.on(function (ev) {
            xGrab = null;
            yGrab = null;
        });
        pane.mouseWheel.on(function (ev) {
            var zoomFactor = Math.pow(webglext.axisZoomStep, ev.wheelSteps);
            axis.zoom(zoomFactor, axis.xAtFrac(webglext.xFrac(ev)), axis.yAtFrac(webglext.yFrac(ev)));
        });
    }
    webglext.attachAxisMouseListeners2D = attachAxisMouseListeners2D;
})(webglext || (webglext = {}));
//# sourceMappingURL=axis.js.map