var webglext;
(function (webglext) {
    var Label = /** @class */ (function () {
        function Label(text, font, fgColor, bgColor) {
            this._font = font;
            this._text = text;
            this._fgColor = fgColor;
            this._bgColor = bgColor;
        }
        Object.defineProperty(Label.prototype, "font", {
            get: function () {
                return this._font;
            },
            set: function (font) {
                if (this._font !== font) {
                    this._font = font;
                    this._textureFactory = null;
                    if (this._texture) {
                        this._texture.dispose();
                        this._texture = null;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "color", {
            // retained for backwards compatibility, should use fgColor
            get: function () {
                return this._fgColor;
            },
            // retained for backwards compatibility, should use fgColor
            set: function (fgColor) {
                if (!webglext.sameColor(this._fgColor, fgColor)) {
                    this._fgColor = fgColor;
                    if (this._texture) {
                        this._texture.dispose();
                        this._texture = null;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "fgColor", {
            get: function () {
                return this._fgColor;
            },
            set: function (fgColor) {
                if (!webglext.sameColor(this._fgColor, fgColor)) {
                    this._fgColor = fgColor;
                    if (this._texture) {
                        this._texture.dispose();
                        this._texture = null;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "bgColor", {
            get: function () {
                return this._bgColor;
            },
            set: function (bgColor) {
                if (!webglext.sameColor(this._bgColor, bgColor)) {
                    this._bgColor = bgColor;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (text) {
                if (this._text !== text) {
                    this._text = text;
                    if (this._texture) {
                        this._texture.dispose();
                        this._texture = null;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Label.prototype, "texture", {
            get: function () {
                if (!this._textureFactory) {
                    this._textureFactory = (this._font ? webglext.createTextTextureFactory(this._font) : null);
                }
                if (!this._texture) {
                    this._texture = (this._fgColor && this._text ? this._textureFactory(this._fgColor, this._text) : null);
                }
                return this._texture;
            },
            enumerable: false,
            configurable: true
        });
        return Label;
    }());
    webglext.Label = Label;
    function fitToLabel(label) {
        return function (parentPrefSize) {
            var texture = label.texture;
            parentPrefSize.w = (texture ? texture.w : 0);
            parentPrefSize.h = (texture ? texture.h : 0);
        };
    }
    webglext.fitToLabel = fitToLabel;
    function newLabelPainter(label, xFrac, yFrac, xAnchor, yAnchor, rotation_CCWRAD) {
        var textureRenderer = new webglext.TextureRenderer();
        return function (gl, viewport) {
            if (webglext.isNotEmpty(label.bgColor)) {
                gl.clearColor(label.bgColor.r, label.bgColor.g, label.bgColor.b, label.bgColor.a);
                gl.clear(webglext.GL.COLOR_BUFFER_BIT);
            }
            var texture = label.texture;
            if (texture) {
                textureRenderer.begin(gl, viewport);
                textureRenderer.draw(gl, texture, xFrac, yFrac, { xAnchor: xAnchor, yAnchor: texture.yAnchor(yAnchor), rotation_CCWRAD: rotation_CCWRAD });
                textureRenderer.end(gl);
            }
        };
    }
    webglext.newLabelPainter = newLabelPainter;
})(webglext || (webglext = {}));
//# sourceMappingURL=label.js.map