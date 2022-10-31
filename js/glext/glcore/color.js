var webglext;
(function (webglext) {
    var Color = /** @class */ (function () {
        function Color(r, g, b, a) {
            if (a === void 0) { a = 1; }
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }
        Object.defineProperty(Color.prototype, "r", {
            get: function () { return this._r; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "g", {
            get: function () { return this._g; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "b", {
            get: function () { return this._b; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "a", {
            get: function () { return this._a; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "cssString", {
            get: function () {
                return 'rgba(' + Math.round(255 * this._r) + ',' + Math.round(255 * this._g) + ',' + Math.round(255 * this._b) + ',' + this._a + ')';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "rgbaString", {
            get: function () {
                return '' + Math.round(255 * this._r) + ',' + Math.round(255 * this._g) + ',' + Math.round(255 * this._b) + ',' + Math.round(255 * this._a);
            },
            enumerable: false,
            configurable: true
        });
        Color.prototype.withAlphaTimes = function (aFactor) {
            return new Color(this._r, this._g, this._b, aFactor * this._a);
        };
        return Color;
    }());
    webglext.Color = Color;
    function darker(color, factor) {
        return new Color(color.r * factor, color.g * factor, color.b * factor, color.a);
    }
    webglext.darker = darker;
    function rgba(r, g, b, a) {
        return new Color(r, g, b, a);
    }
    webglext.rgba = rgba;
    function rgb(r, g, b) {
        return new Color(r, g, b, 1);
    }
    webglext.rgb = rgb;
    function sameColor(c1, c2) {
        if (c1 === c2)
            return true;
        if (!webglext.isNotEmpty(c1) || !webglext.isNotEmpty(c2))
            return false;
        return (c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a);
    }
    webglext.sameColor = sameColor;
    /**
     * Creates a Color object based on a CSS color string. Supports the following notations:
     *  - hex
     *  - rgb/rgba
     *  - hsl/hsla
     *  - named colors
     *
     * Behavior is undefined for strings that are not in one of the listed notations.
     *
     * Note that different browsers may use different color values for the named colors.
     *
     */
    webglext.parseCssColor = (function () {
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        var g = canvas.getContext('2d');
        return function (cssColorString) {
            g.clearRect(0, 0, 1, 1);
            g.fillStyle = cssColorString;
            g.fillRect(0, 0, 1, 1);
            var rgbaData = g.getImageData(0, 0, 1, 1).data;
            var R = rgbaData[0] / 255;
            var G = rgbaData[1] / 255;
            var B = rgbaData[2] / 255;
            var A = rgbaData[3] / 255;
            return rgba(R, G, B, A);
        };
    })();
    function parseRgba(rgbaString) {
        var tokens = rgbaString.split(',', 4);
        return new Color(parseInt(tokens[0]) / 255, parseInt(tokens[1]) / 255, parseInt(tokens[2]) / 255, parseInt(tokens[3]) / 255);
    }
    webglext.parseRgba = parseRgba;
    function gray(brightness) {
        return new Color(brightness, brightness, brightness, 1);
    }
    webglext.gray = gray;
    webglext.black = rgb(0, 0, 0);
    webglext.white = rgb(1, 1, 1);
    webglext.red = rgb(1, 0, 0);
    webglext.green = rgb(0, 1, 0);
    webglext.blue = rgb(0, 0, 1);
    webglext.periwinkle = rgb(0.561, 0.561, 0.961);
    webglext.cyan = rgb(0, 1, 1);
    webglext.magenta = rgb(1, 0, 1);
    webglext.yellow = rgb(1, 1, 0);
})(webglext || (webglext = {}));
//# sourceMappingURL=color.js.map