var webglext;
(function (webglext) {
    var MultiKeyCacheEntry = /** @class */ (function () {
        function MultiKeyCacheEntry(keyParts, value) {
            this.touched = false;
            this.keyParts = keyParts;
            this.value = value;
        }
        return MultiKeyCacheEntry;
    }());
    var MultiKeyCache = /** @class */ (function () {
        function MultiKeyCache(helper) {
            this.helper = helper;
            this.map = {};
        }
        MultiKeyCache.prototype.combineKeyParts = function (keyParts) {
            var esc = '\\';
            var sep = ';';
            var escapedEsc = esc + esc;
            var escapedSep = esc + sep;
            var escapedParts = [];
            for (var n = 0; n < keyParts.length; n++) {
                escapedParts[n] = keyParts[n].replace(esc, escapedEsc).replace(sep, escapedSep);
            }
            return escapedParts.join(sep);
        };
        MultiKeyCache.prototype.value = function () {
            var keyParts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keyParts[_i] = arguments[_i];
            }
            var key = this.combineKeyParts(keyParts);
            if (!this.map.hasOwnProperty(key)) {
                this.map[key] = new MultiKeyCacheEntry(keyParts, this.helper.create(keyParts));
            }
            var en = this.map[key];
            en.touched = true;
            return en.value;
        };
        MultiKeyCache.prototype.remove = function () {
            var keyParts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keyParts[_i] = arguments[_i];
            }
            var key = this.combineKeyParts(keyParts);
            if (this.map.hasOwnProperty(key)) {
                var en = this.map[key];
                this.helper.dispose(en.value, en.keyParts);
                delete this.map[key];
            }
        };
        MultiKeyCache.prototype.retain = function () {
            var keyParts = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                keyParts[_i] = arguments[_i];
            }
            var newMap = {};
            var retainKey = this.combineKeyParts(keyParts);
            if (this.map.hasOwnProperty(retainKey)) {
                newMap[retainKey] = this.map[retainKey];
                delete this.map[retainKey];
            }
            for (var key in this.map) {
                if (this.map.hasOwnProperty(key)) {
                    var en = this.map[key];
                    this.helper.dispose(en.value, en.keyParts);
                }
            }
            this.map = newMap;
        };
        MultiKeyCache.prototype.resetTouches = function () {
            for (var key in this.map) {
                if (this.map.hasOwnProperty(key)) {
                    this.map[key].touched = false;
                }
            }
        };
        MultiKeyCache.prototype.retainTouched = function () {
            var newMap = {};
            for (var key in this.map) {
                if (this.map.hasOwnProperty(key)) {
                    var en = this.map[key];
                    if (en.touched) {
                        newMap[key] = this.map[key];
                    }
                    else {
                        this.helper.dispose(en.value, en.keyParts);
                    }
                }
            }
            this.map = newMap;
        };
        MultiKeyCache.prototype.clear = function () {
            for (var key in this.map) {
                if (this.map.hasOwnProperty(key)) {
                    var en = this.map[key];
                    this.helper.dispose(en.value, en.keyParts);
                }
            }
            this.map = {};
        };
        return MultiKeyCache;
    }());
    webglext.MultiKeyCache = MultiKeyCache;
    var TwoKeyCache = /** @class */ (function () {
        function TwoKeyCache(helper) {
            this.cache = new MultiKeyCache({
                create: function (keyParts) {
                    return helper.create(keyParts[0], keyParts[1]);
                },
                dispose: function (value, keyParts) {
                    helper.dispose(value, keyParts[0], keyParts[1]);
                }
            });
        }
        TwoKeyCache.prototype.value = function (keyPart1, keyPart2) { return this.cache.value(keyPart1, keyPart2); };
        TwoKeyCache.prototype.remove = function (keyPart1, keyPart2) { this.cache.remove(keyPart1, keyPart2); };
        TwoKeyCache.prototype.retain = function (keyPart1, keyPart2) { this.cache.retain(keyPart1, keyPart2); };
        TwoKeyCache.prototype.resetTouches = function () { this.cache.resetTouches(); };
        TwoKeyCache.prototype.retainTouched = function () { this.cache.retainTouched(); };
        TwoKeyCache.prototype.clear = function () { this.cache.clear(); };
        return TwoKeyCache;
    }());
    webglext.TwoKeyCache = TwoKeyCache;
    var ThreeKeyCache = /** @class */ (function () {
        function ThreeKeyCache(helper) {
            this.cache = new MultiKeyCache({
                create: function (keyParts) {
                    return helper.create(keyParts[0], keyParts[1], keyParts[2]);
                },
                dispose: function (value, keyParts) {
                    helper.dispose(value, keyParts[0], keyParts[1], keyParts[2]);
                }
            });
        }
        ThreeKeyCache.prototype.value = function (keyPart1, keyPart2, keyPart3) { return this.cache.value(keyPart1, keyPart2, keyPart3); };
        ThreeKeyCache.prototype.remove = function (keyPart1, keyPart2, keyPart3) { this.cache.remove(keyPart1, keyPart2, keyPart3); };
        ThreeKeyCache.prototype.retain = function (keyPart1, keyPart2, keyPart3) { this.cache.retain(keyPart1, keyPart2, keyPart3); };
        ThreeKeyCache.prototype.resetTouches = function () { this.cache.resetTouches(); };
        ThreeKeyCache.prototype.retainTouched = function () { this.cache.retainTouched(); };
        ThreeKeyCache.prototype.clear = function () { this.cache.clear(); };
        return ThreeKeyCache;
    }());
    webglext.ThreeKeyCache = ThreeKeyCache;
})(webglext || (webglext = {}));
//# sourceMappingURL=multikey_cache.js.map