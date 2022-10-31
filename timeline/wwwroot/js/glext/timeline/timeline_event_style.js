var webglext;
(function (webglext) {
    var TimelineEventIconUi = /** @class */ (function () {
        function TimelineEventIconUi(icon) {
            this._setAttrs(icon);
        }
        TimelineEventIconUi.prototype._setAttrs = function (icon) {
            this._url = icon.url;
            this._displayWidth = icon.displayWidth;
            this._displayHeight = icon.displayHeight;
            this._hAlign = icon.hAlign;
            this._hPos = icon.hPos;
        };
        Object.defineProperty(TimelineEventIconUi.prototype, "url", {
            get: function () { return this._url; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventIconUi.prototype, "displayWidth", {
            get: function () { return this._displayWidth; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventIconUi.prototype, "displayHeight", {
            get: function () { return this._displayHeight; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventIconUi.prototype, "hAlign", {
            get: function () { return this._hAlign; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventIconUi.prototype, "hPos", {
            get: function () { return this._hPos; },
            enumerable: false,
            configurable: true
        });
        TimelineEventIconUi.prototype.snapshot = function () {
            return {
                url: this._url,
                displayWidth: this._displayWidth,
                displayHeight: this._displayHeight,
                hAlign: this._hAlign,
                hPos: this._hPos
            };
        };
        return TimelineEventIconUi;
    }());
    webglext.TimelineEventIconUi = TimelineEventIconUi;
    var TimelineEventStyleUi = /** @class */ (function () {
        function TimelineEventStyleUi(style) {
            this._styleGuid = style.styleGuid;
            this._setAttrs(style);
        }
        Object.defineProperty(TimelineEventStyleUi.prototype, "styleGuid", {
            get: function () {
                return this._styleGuid;
            },
            enumerable: false,
            configurable: true
        });
        TimelineEventStyleUi.prototype._setAttrs = function (style) {
            this._icons = style.icons.map(function (icon) { return new TimelineEventIconUi(icon); });
        };
        Object.defineProperty(TimelineEventStyleUi.prototype, "numIcons", {
            get: function () {
                return this._icons.length;
            },
            enumerable: false,
            configurable: true
        });
        TimelineEventStyleUi.prototype.icon = function (index) {
            return this._icons[index];
        };
        TimelineEventStyleUi.prototype.snapshot = function () {
            return {
                styleGuid: this._styleGuid,
                icons: this._icons.map(function (ui) { return ui.snapshot(); })
            };
        };
        return TimelineEventStyleUi;
    }());
    webglext.TimelineEventStyleUi = TimelineEventStyleUi;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_event_style.js.map