var webglext;
(function (webglext) {
    var Notification = /** @class */ (function () {
        function Notification() {
            this._listeners = new webglext.OrderedSet([], webglext.getObjectId, false);
            this._deferring = false;
            this._deferred = [];
        }
        Notification.prototype.on = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.add(listener); });
            }
            else {
                this._listeners.add(listener);
            }
        };
        Notification.prototype.off = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.removeValue(listener); });
            }
            else {
                this._listeners.removeValue(listener);
            }
        };
        Notification.prototype.dispose = function () {
            this._listeners.removeAll();
        };
        Notification.prototype.fire = function () {
            this._deferring = true;
            try {
                for (var n = 0; n < this._listeners.length; n++) {
                    var consumed = this._listeners.valueAt(n)();
                    if (consumed)
                        return consumed;
                }
                return false;
            }
            finally {
                if (this._deferred.length > 0) {
                    for (var n = 0; n < this._deferred.length; n++) {
                        this._deferred[n]();
                    }
                    this._deferred = [];
                }
                this._deferring = false;
            }
        };
        return Notification;
    }());
    webglext.Notification = Notification;
    var Notification1 = /** @class */ (function () {
        function Notification1() {
            this._listeners = new webglext.OrderedSet([], webglext.getObjectId, false);
            this._deferring = false;
            this._deferred = [];
        }
        Notification1.prototype.on = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.add(listener); });
            }
            else {
                this._listeners.add(listener);
            }
        };
        Notification1.prototype.off = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.removeValue(listener); });
            }
            else {
                this._listeners.removeValue(listener);
            }
        };
        Notification1.prototype.dispose = function () {
            this._listeners.removeAll();
        };
        Notification1.prototype.fire = function (a) {
            this._deferring = true;
            try {
                for (var n = 0; n < this._listeners.length; n++) {
                    var consumed = this._listeners.valueAt(n)(a);
                    if (consumed)
                        return consumed;
                }
                return false;
            }
            finally {
                if (this._deferred.length > 0) {
                    for (var n = 0; n < this._deferred.length; n++) {
                        this._deferred[n]();
                    }
                    this._deferred = [];
                }
                this._deferring = false;
            }
        };
        return Notification1;
    }());
    webglext.Notification1 = Notification1;
    var Notification2 = /** @class */ (function () {
        function Notification2() {
            this._listeners = new webglext.OrderedSet([], webglext.getObjectId, false);
            this._deferring = false;
            this._deferred = [];
        }
        Notification2.prototype.on = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.add(listener); });
            }
            else {
                this._listeners.add(listener);
            }
        };
        Notification2.prototype.off = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.removeValue(listener); });
            }
            else {
                this._listeners.removeValue(listener);
            }
        };
        Notification2.prototype.dispose = function () {
            this._listeners.removeAll();
        };
        Notification2.prototype.fire = function (a, b) {
            this._deferring = true;
            try {
                for (var n = 0; n < this._listeners.length; n++) {
                    var consumed = this._listeners.valueAt(n)(a, b);
                    if (consumed)
                        return consumed;
                }
                return false;
            }
            finally {
                if (this._deferred.length > 0) {
                    for (var n = 0; n < this._deferred.length; n++) {
                        this._deferred[n]();
                    }
                    this._deferred = [];
                }
                this._deferring = false;
            }
        };
        return Notification2;
    }());
    webglext.Notification2 = Notification2;
    var Notification3 = /** @class */ (function () {
        function Notification3() {
            this._listeners = new webglext.OrderedSet([], webglext.getObjectId, false);
            this._deferring = false;
            this._deferred = [];
        }
        Notification3.prototype.on = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.add(listener); });
            }
            else {
                this._listeners.add(listener);
            }
        };
        Notification3.prototype.off = function (listener) {
            if (this._deferring) {
                var self = this;
                this._deferred.push(function () { self._listeners.removeValue(listener); });
            }
            else {
                this._listeners.removeValue(listener);
            }
        };
        Notification3.prototype.dispose = function () {
            this._listeners.removeAll();
        };
        Notification3.prototype.fire = function (a, b, c) {
            this._deferring = true;
            try {
                for (var n = 0; n < this._listeners.length; n++) {
                    var consumed = this._listeners.valueAt(n)(a, b, c);
                    if (consumed)
                        return consumed;
                }
                return false;
            }
            finally {
                if (this._deferred.length > 0) {
                    for (var n = 0; n < this._deferred.length; n++) {
                        this._deferred[n]();
                    }
                    this._deferred = [];
                }
                this._deferring = false;
            }
        };
        return Notification3;
    }());
    webglext.Notification3 = Notification3;
})(webglext || (webglext = {}));
//# sourceMappingURL=notification.js.map