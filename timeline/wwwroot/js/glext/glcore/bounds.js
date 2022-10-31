var webglext;
(function (webglext) {
    var BoundsUnmodifiable = /** @class */ (function () {
        function BoundsUnmodifiable(bounds) {
            this.bounds = bounds;
        }
        Object.defineProperty(BoundsUnmodifiable.prototype, "iStart", {
            get: function () { return this.bounds.iStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "jStart", {
            get: function () { return this.bounds.jStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "iEnd", {
            get: function () { return this.bounds.iEnd; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "jEnd", {
            get: function () { return this.bounds.jEnd; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "i", {
            get: function () { return this.bounds.i; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "j", {
            get: function () { return this.bounds.j; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "w", {
            get: function () { return this.bounds.w; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BoundsUnmodifiable.prototype, "h", {
            get: function () { return this.bounds.h; },
            enumerable: false,
            configurable: true
        });
        BoundsUnmodifiable.prototype.xFrac = function (i) { return this.bounds.xFrac(i); };
        BoundsUnmodifiable.prototype.yFrac = function (j) { return this.bounds.yFrac(j); };
        BoundsUnmodifiable.prototype.contains = function (i, j) { return this.bounds.contains(i, j); };
        return BoundsUnmodifiable;
    }());
    webglext.BoundsUnmodifiable = BoundsUnmodifiable;
    var Bounds = /** @class */ (function () {
        function Bounds() {
            this._iStart = 0;
            this._jStart = 0;
            this._iEnd = 0;
            this._jEnd = 0;
            this._unmod = new BoundsUnmodifiable(this);
        }
        Object.defineProperty(Bounds.prototype, "iStart", {
            get: function () { return this._iStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "jStart", {
            get: function () { return this._jStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "iEnd", {
            get: function () { return this._iEnd; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "jEnd", {
            get: function () { return this._jEnd; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "i", {
            get: function () { return this._iStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "j", {
            get: function () { return this._jStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "w", {
            get: function () { return this._iEnd - this._iStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "h", {
            get: function () { return this._jEnd - this._jStart; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "unmod", {
            get: function () { return this._unmod; },
            enumerable: false,
            configurable: true
        });
        Bounds.prototype.xFrac = function (i) {
            return (i - this._iStart) / (this._iEnd - this._iStart);
        };
        Bounds.prototype.yFrac = function (j) {
            return (j - this._jStart) / (this._jEnd - this._jStart);
        };
        Bounds.prototype.contains = function (i, j) {
            return (this._iStart <= i && i < this._iEnd && this._jStart <= j && j < this._jEnd);
        };
        Bounds.prototype.setEdges = function (iStart, iEnd, jStart, jEnd) {
            this._iStart = iStart;
            this._jStart = jStart;
            this._iEnd = iEnd;
            this._jEnd = jEnd;
        };
        Bounds.prototype.setRect = function (i, j, w, h) {
            this.setEdges(i, i + w, j, j + h);
        };
        Bounds.prototype.setBounds = function (bounds) {
            this.setEdges(bounds.iStart, bounds.iEnd, bounds.jStart, bounds.jEnd);
        };
        Bounds.prototype.cropToEdges = function (iCropStart, iCropEnd, jCropStart, jCropEnd) {
            this._iStart = webglext.clamp(iCropStart, iCropEnd, this._iStart);
            this._jStart = webglext.clamp(jCropStart, jCropEnd, this._jStart);
            this._iEnd = webglext.clamp(iCropStart, iCropEnd, this._iEnd);
            this._jEnd = webglext.clamp(jCropStart, jCropEnd, this._jEnd);
        };
        Bounds.prototype.cropToRect = function (iCrop, jCrop, wCrop, hCrop) {
            this.cropToEdges(iCrop, iCrop + wCrop, jCrop, jCrop + hCrop);
        };
        Bounds.prototype.cropToBounds = function (cropBounds) {
            this.cropToEdges(cropBounds.iStart, cropBounds.iEnd, cropBounds.jStart, cropBounds.jEnd);
        };
        return Bounds;
    }());
    webglext.Bounds = Bounds;
    function newBoundsFromRect(i, j, w, h) {
        var b = new Bounds();
        b.setRect(i, j, w, h);
        return b;
    }
    webglext.newBoundsFromRect = newBoundsFromRect;
    function newBoundsFromEdges(iStart, iEnd, jStart, jEnd) {
        var b = new Bounds();
        b.setEdges(iStart, iEnd, jStart, jEnd);
        return b;
    }
    webglext.newBoundsFromEdges = newBoundsFromEdges;
})(webglext || (webglext = {}));
//# sourceMappingURL=bounds.js.map