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
    var TimeAxis1D = /** @class */ (function (_super) {
        __extends(TimeAxis1D, _super);
        function TimeAxis1D(tMin_PMILLIS, tMax_PMILLIS) {
            var _this = this;
            var w_epoch_PMILLIS = 0.5 * (tMin_PMILLIS + tMax_PMILLIS);
            _this = _super.call(this, tMin_PMILLIS - w_epoch_PMILLIS, tMax_PMILLIS - w_epoch_PMILLIS) || this;
            _this._epoch_PMILLIS = 0.5 * (tMin_PMILLIS + tMax_PMILLIS);
            return _this;
        }
        Object.defineProperty(TimeAxis1D.prototype, "tMin_PMILLIS", {
            get: function () {
                return (this._epoch_PMILLIS + this.vMin);
            },
            set: function (tMin_PMILLIS) {
                this.vMin = (tMin_PMILLIS - this._epoch_PMILLIS);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimeAxis1D.prototype, "tMax_PMILLIS", {
            get: function () {
                return (this._epoch_PMILLIS + this.vMax);
            },
            set: function (tMax_PMILLIS) {
                this.vMax = (tMax_PMILLIS - this._epoch_PMILLIS);
            },
            enumerable: false,
            configurable: true
        });
        TimeAxis1D.prototype.setTRange_PMILLIS = function (tMin_PMILLIS, tMax_PMILLIS) {
            this.setVRange(tMin_PMILLIS - this._epoch_PMILLIS, tMax_PMILLIS - this._epoch_PMILLIS);
        };
        Object.defineProperty(TimeAxis1D.prototype, "tSize_MILLIS", {
            get: function () {
                return this.vSize;
            },
            enumerable: false,
            configurable: true
        });
        TimeAxis1D.prototype.vAtTime = function (t_PMILLIS) {
            return (t_PMILLIS - this._epoch_PMILLIS);
        };
        TimeAxis1D.prototype.tAtFrac_PMILLIS = function (tFrac) {
            return (this._epoch_PMILLIS + this.vAtFrac(tFrac));
        };
        TimeAxis1D.prototype.tFrac = function (t_PMILLIS) {
            return this.vFrac(t_PMILLIS - this._epoch_PMILLIS);
        };
        TimeAxis1D.prototype.tPan = function (tAmount_MILLIS) {
            this.pan(tAmount_MILLIS);
        };
        TimeAxis1D.prototype.tZoom = function (factor, tAnchor_PMILLIS) {
            this.zoom(factor, tAnchor_PMILLIS - this._epoch_PMILLIS);
        };
        return TimeAxis1D;
    }(webglext.Axis1D));
    webglext.TimeAxis1D = TimeAxis1D;
})(webglext || (webglext = {}));
//# sourceMappingURL=time_axis.js.map