var webglext;
(function (webglext) {
    var CacheEntry = /** @class */ (function () {
        function CacheEntry(value) {
            this.touched = false;
            this.value = value;
        }
        return CacheEntry;
    }());
    var Cache = /** @class */ (function () {
        function Cache(helper) {
            this.helper = helper;
            this.map = {};
        }
        Cache.prototype.value = function (key) {
            if (!this.map.hasOwnProperty(key)) {
                this.map[key] = new CacheEntry(this.helper.create(key));
            }
            var en = this.map[key];
            en.touched = true;
            return en.value;
        };
        Cache.prototype.clear = function () {
            for (var k in this.map) {
                if (this.map.hasOwnProperty(k)) {
                    this.helper.dispose(this.map[k].value, k);
                }
            }
            this.map = {};
        };
        Cache.prototype.remove = function (key) {
            if (this.map.hasOwnProperty(key)) {
                this.helper.dispose(this.map[key].value, key);
                delete this.map[key];
            }
        };
        Cache.prototype.removeAll = function (keys) {
            for (var i = 0; i < keys.length; i++) {
                this.remove(keys[i]);
            }
        };
        Cache.prototype.retain = function (key) {
            var newMap = {};
            if (this.map.hasOwnProperty(key)) {
                newMap[key] = this.map[key];
                delete this.map[key];
            }
            for (var k in this.map) {
                if (this.map.hasOwnProperty(k)) {
                    this.helper.dispose(this.map[k].value, k);
                }
            }
            this.map = newMap;
        };
        Cache.prototype.retainAll = function (keys) {
            var newMap = {};
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                if (this.map.hasOwnProperty(k)) {
                    newMap[k] = this.map[k];
                    delete this.map[k];
                }
            }
            for (var k2 in this.map) {
                if (this.map.hasOwnProperty(k2)) {
                    this.helper.dispose(this.map[k2].value, k2);
                }
            }
            this.map = newMap;
        };
        Cache.prototype.resetTouches = function () {
            for (var k in this.map) {
                if (this.map.hasOwnProperty(k)) {
                    this.map[k].touched = false;
                }
            }
        };
        Cache.prototype.retainTouched = function () {
            var newMap = {};
            for (var k in this.map) {
                if (this.map.hasOwnProperty(k)) {
                    var en = this.map[k];
                    if (en.touched) {
                        newMap[k] = this.map[k];
                    }
                    else {
                        this.helper.dispose(en.value, k);
                    }
                }
            }
            this.map = newMap;
        };
        return Cache;
    }());
    webglext.Cache = Cache;
})(webglext || (webglext = {}));
//# sourceMappingURL=cache.js.map