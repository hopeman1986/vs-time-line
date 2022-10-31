var webglext;
(function (webglext) {
    var TimelineAnnotationIconUi = /** @class */ (function () {
        function TimelineAnnotationIconUi(icon) {
            this._setAttrs(icon);
        }
        TimelineAnnotationIconUi.prototype._setAttrs = function (icon) {
            this._url = icon.url;
            this._displayWidth = icon.displayWidth;
            this._displayHeight = icon.displayHeight;
            this._hAlign = icon.hAlign;
            this._vAlign = icon.vAlign;
            this._hOffset = icon.hOffset;
            this._vOffset = icon.vOffset;
        };
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "url", {
            get: function () { return this._url; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "displayWidth", {
            get: function () { return this._displayWidth; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "displayHeight", {
            get: function () { return this._displayHeight; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "hAlign", {
            get: function () { return this._hAlign; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "vAlign", {
            get: function () { return this._vAlign; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "hOffset", {
            get: function () { return this._hOffset; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationIconUi.prototype, "vOffset", {
            get: function () { return this._vOffset; },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationIconUi.prototype.snapshot = function () {
            return {
                url: this._url,
                displayWidth: this._displayWidth,
                displayHeight: this._displayHeight,
                hAlign: this._hAlign,
                vAlign: this._vAlign,
                hOffset: this._hOffset,
                vOffset: this._vOffset
            };
        };
        return TimelineAnnotationIconUi;
    }());
    webglext.TimelineAnnotationIconUi = TimelineAnnotationIconUi;
    var TimelineAnnotationStyleUi = /** @class */ (function () {
        function TimelineAnnotationStyleUi(style) {
            this._styleGuid = style.styleGuid;
            this._setAttrs(style);
        }
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "styleGuid", {
            get: function () {
                return this._styleGuid;
            },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationStyleUi.prototype._setAttrs = function (style) {
            this._color = webglext.isNotEmpty(style.color) ? webglext.parseCssColor(style.color) : undefined;
            this._font = style.font;
            this._hTextOffset = style.hTextOffset;
            this._vTextOffset = style.vTextOffset;
            this._hTextAlign = style.hTextAlign;
            this._vTextAlign = style.vTextAlign;
            this._align = style.align;
            this._uiHint = style.uiHint;
            this._icons = webglext.isNotEmpty(style.color) ? style.icons.map(function (icon) { return new TimelineAnnotationIconUi(icon); }) : [];
        };
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "numIcons", {
            get: function () {
                return this._icons.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationStyleUi.prototype.icon = function (index) {
            return this._icons[index];
        };
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "color", {
            get: function () {
                return this._color;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "font", {
            get: function () {
                return this._font;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "hTextOffset", {
            get: function () {
                return this._hTextOffset;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "vTextOffset", {
            get: function () {
                return this._vTextOffset;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "hTextAlign", {
            get: function () {
                return this._hTextAlign;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "vTextAlign", {
            get: function () {
                return this._vTextAlign;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "align", {
            get: function () {
                return this._align;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationStyleUi.prototype, "uiHint", {
            get: function () {
                return this._uiHint;
            },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationStyleUi.prototype.snapshot = function () {
            return {
                styleGuid: this._styleGuid,
                color: this._color.cssString,
                font: this._font,
                vTextOffset: this._hTextOffset,
                hTextOffset: this._vTextOffset,
                vTextAlign: this._hTextAlign,
                hTextAlign: this._vTextAlign,
                align: this._align,
                uiHint: this._uiHint,
                icons: this._icons.map(function (ui) { return ui.snapshot(); })
            };
        };
        return TimelineAnnotationStyleUi;
    }());
    webglext.TimelineAnnotationStyleUi = TimelineAnnotationStyleUi;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_annotation_style.js.map