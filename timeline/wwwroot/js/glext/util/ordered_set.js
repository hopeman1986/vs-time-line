var webglext;
(function (webglext) {
    function requireString(s) {
        if (webglext.isString(s)) {
            return s;
        }
        else {
            throw new Error('Expected a string, but value is ' + s);
        }
    }
    var OrderedSet = /** @class */ (function () {
        function OrderedSet(values, idFn, useNotifications) {
            if (values === void 0) { values = []; }
            if (idFn === void 0) { idFn = webglext.getObjectId; }
            if (useNotifications === void 0) { useNotifications = true; }
            this._idOf = idFn;
            this._valuesArray = webglext.copyArray(values);
            this._ids = [];
            this._indexes = {};
            this._valuesMap = {};
            for (var n = 0; n < this._valuesArray.length; n++) {
                var value = this._valuesArray[n];
                var id = requireString(this._idOf(value));
                this._ids[n] = id;
                this._indexes[id] = n;
                this._valuesMap[id] = value;
            }
            if (useNotifications) {
                this._valueAdded = new webglext.Notification2();
                this._valueMoved = new webglext.Notification3();
                this._valueRemoved = new webglext.Notification2();
            }
        }
        Object.defineProperty(OrderedSet.prototype, "valueAdded", {
            get: function () {
                return this._valueAdded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedSet.prototype, "valueMoved", {
            get: function () {
                return this._valueMoved;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedSet.prototype, "valueRemoved", {
            get: function () {
                return this._valueRemoved;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedSet.prototype, "length", {
            get: function () {
                return this._valuesArray.length;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedSet.prototype, "isEmpty", {
            get: function () {
                return (this._valuesArray.length === 0);
            },
            enumerable: false,
            configurable: true
        });
        OrderedSet.prototype.toArray = function () {
            return webglext.copyArray(this._valuesArray);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.every = function (callbackFn, thisArg) {
            return this._valuesArray.every(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.some = function (callbackFn, thisArg) {
            return this._valuesArray.some(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.forEach = function (callbackFn, thisArg) {
            this._valuesArray.forEach(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.map = function (callbackFn, thisArg) {
            return this._valuesArray.map(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.filter = function (callbackFn, thisArg) {
            return this._valuesArray.filter(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.reduce = function (callbackFn, initialValue) {
            return this._valuesArray.reduce(callbackFn, initialValue);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedSet is undefined.
         */
        OrderedSet.prototype.reduceRight = function (callbackFn, initialValue) {
            return this._valuesArray.reduceRight(callbackFn, initialValue);
        };
        OrderedSet.prototype.idAt = function (index) {
            return this._ids[index];
        };
        OrderedSet.prototype.valueAt = function (index) {
            return this._valuesArray[index];
        };
        OrderedSet.prototype.indexFor = function (id) {
            return (webglext.isString(id) ? this._indexes[id] : undefined);
        };
        OrderedSet.prototype.valueFor = function (id) {
            return (webglext.isString(id) ? this._valuesMap[id] : undefined);
        };
        OrderedSet.prototype.idOf = function (value) {
            return requireString(this._idOf(value));
        };
        OrderedSet.prototype.indexOf = function (value) {
            return this._indexes[requireString(this._idOf(value))];
        };
        OrderedSet.prototype.hasValue = function (value) {
            return this.hasId(requireString(this._idOf(value)));
        };
        OrderedSet.prototype.hasValues = function (values) {
            for (var n = 0; n < values.length; n++) {
                if (!this.hasValue(values[n])) {
                    return false;
                }
            }
            return true;
        };
        OrderedSet.prototype.hasId = function (id) {
            return (webglext.isString(id) && webglext.isNotEmpty(this._valuesMap[id]));
        };
        OrderedSet.prototype.hasIds = function (ids) {
            for (var n = 0; n < ids.length; n++) {
                if (!this.hasId(ids[n])) {
                    return false;
                }
            }
            return true;
        };
        OrderedSet.prototype.add = function (value, index, moveIfExists) {
            var index = (webglext.isNotEmpty(index) ? index : this._valuesArray.length);
            if (!webglext.isNotEmpty(moveIfExists))
                moveIfExists = false;
            this._add(value, index, moveIfExists);
        };
        OrderedSet.prototype.addAll = function (values, index, moveIfExists) {
            var index = (webglext.isNotEmpty(index) ? index : this._valuesArray.length);
            if (!webglext.isNotEmpty(moveIfExists))
                moveIfExists = false;
            for (var n = 0; n < values.length; n++) {
                var actualIndex = this._add(values[n], index, moveIfExists);
                index = actualIndex + 1;
            }
        };
        OrderedSet.prototype._add = function (value, newIndex, moveIfExists) {
            var id = requireString(this._idOf(value));
            var oldIndex = this._indexes[id];
            if (!webglext.isNotEmpty(oldIndex)) {
                this._ids.splice(newIndex, 0, id);
                this._valuesArray.splice(newIndex, 0, value);
                this._valuesMap[id] = value;
                for (var n = newIndex; n < this._ids.length; n++) {
                    this._indexes[this._ids[n]] = n;
                }
                if (this._valueAdded) {
                    this._valueAdded.fire(value, newIndex);
                }
            }
            else if (newIndex !== oldIndex && moveIfExists) {
                this._ids.splice(oldIndex, 1);
                this._valuesArray.splice(oldIndex, 1);
                if (newIndex > oldIndex) {
                    newIndex--;
                    this._ids.splice(newIndex, 0, id);
                    this._valuesArray.splice(newIndex, 0, value);
                    for (var n = oldIndex; n <= newIndex; n++) {
                        this._indexes[this._ids[n]] = n;
                    }
                }
                else {
                    this._ids.splice(newIndex, 0, id);
                    this._valuesArray.splice(newIndex, 0, value);
                    for (var n = newIndex; n <= oldIndex; n++) {
                        this._indexes[this._ids[n]] = n;
                    }
                }
                if (this._valueMoved) {
                    this._valueMoved.fire(value, oldIndex, newIndex);
                }
            }
            else {
                newIndex = oldIndex;
            }
            // Return the actual insertion index -- may differ from the originally
            // requested index if an existing value had to be moved
            return newIndex;
        };
        OrderedSet.prototype.removeValue = function (value) {
            this.removeId(requireString(this._idOf(value)));
        };
        OrderedSet.prototype.removeId = function (id) {
            if (webglext.isString(id)) {
                var index = this._indexes[id];
                if (webglext.isNotEmpty(index)) {
                    this._remove(id, index);
                }
            }
        };
        OrderedSet.prototype.removeIndex = function (index) {
            var id = this._ids[index];
            if (webglext.isString(id)) {
                this._remove(id, index);
            }
        };
        OrderedSet.prototype.removeAll = function () {
            // Remove from last to first, to minimize index shifting
            for (var n = this._valuesArray.length - 1; n >= 0; n--) {
                var id = this._ids[n];
                this._remove(id, n);
            }
        };
        OrderedSet.prototype.retainValues = function (values) {
            var idsToRetain = {};
            for (var n = 0; n < values.length; n++) {
                var id = this._idOf(values[n]);
                if (webglext.isString(id)) {
                    idsToRetain[id] = true;
                }
            }
            this._retain(idsToRetain);
        };
        OrderedSet.prototype.retainIds = function (ids) {
            var idsToRetain = {};
            for (var n = 0; n < ids.length; n++) {
                var id = ids[n];
                if (webglext.isString(id)) {
                    idsToRetain[id] = true;
                }
            }
            this._retain(idsToRetain);
        };
        OrderedSet.prototype.retainIndices = function (indices) {
            var idsToRetain = {};
            for (var n = 0; n < indices.length; n++) {
                var id = this._ids[indices[n]];
                idsToRetain[id] = true;
            }
            this._retain(idsToRetain);
        };
        OrderedSet.prototype._retain = function (ids) {
            // Remove from last to first, to minimize index shifting
            for (var n = this._valuesArray.length - 1; n >= 0; n--) {
                var id = this._ids[n];
                if (!ids.hasOwnProperty(id)) {
                    this._remove(id, n);
                }
            }
        };
        OrderedSet.prototype._remove = function (id, index) {
            var value = this._valuesArray[index];
            this._ids.splice(index, 1);
            this._valuesArray.splice(index, 1);
            delete this._indexes[id];
            delete this._valuesMap[id];
            for (var n = index; n < this._ids.length; n++) {
                this._indexes[this._ids[n]] = n;
            }
            if (this._valueRemoved) {
                this._valueRemoved.fire(value, index);
            }
        };
        return OrderedSet;
    }());
    webglext.OrderedSet = OrderedSet;
    var OrderedStringSet = /** @class */ (function () {
        function OrderedStringSet(values, useNotifications) {
            if (values === void 0) { values = []; }
            if (useNotifications === void 0) { useNotifications = true; }
            this._valuesArray = [];
            this._indexes = {};
            for (var n = 0; n < values.length; n++) {
                var value = requireString(values[n]);
                this._valuesArray[n] = value;
                this._indexes[value] = n;
            }
            if (useNotifications) {
                this._valueAdded = new webglext.Notification2();
                this._valueMoved = new webglext.Notification3();
                this._valueRemoved = new webglext.Notification2();
            }
        }
        Object.defineProperty(OrderedStringSet.prototype, "valueAdded", {
            get: function () {
                return this._valueAdded;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedStringSet.prototype, "valueMoved", {
            get: function () {
                return this._valueMoved;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedStringSet.prototype, "valueRemoved", {
            get: function () {
                return this._valueRemoved;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedStringSet.prototype, "length", {
            get: function () {
                return this._valuesArray.length;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OrderedStringSet.prototype, "isEmpty", {
            get: function () {
                return (this._valuesArray.length === 0);
            },
            enumerable: false,
            configurable: true
        });
        OrderedStringSet.prototype.toArray = function () {
            return webglext.copyArray(this._valuesArray);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.every = function (callbackFn, thisArg) {
            return this._valuesArray.every(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.some = function (callbackFn, thisArg) {
            return this._valuesArray.some(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.forEach = function (callbackFn, thisArg) {
            this._valuesArray.forEach(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.map = function (callbackFn, thisArg) {
            return this._valuesArray.map(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.filter = function (callbackFn, thisArg) {
            return this._valuesArray.filter(callbackFn, thisArg);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.reduce = function (callbackFn, initialValue) {
            return this._valuesArray.reduce(callbackFn, initialValue);
        };
        /**
         * The callback should not modify its array arg; if it does, the subsequent behavior
         * of this OrderedStringSet is undefined.
         */
        OrderedStringSet.prototype.reduceRight = function (callbackFn, initialValue) {
            return this._valuesArray.reduceRight(callbackFn, initialValue);
        };
        OrderedStringSet.prototype.valueAt = function (index) {
            return this._valuesArray[index];
        };
        OrderedStringSet.prototype.indexOf = function (value) {
            return (webglext.isString(value) ? this._indexes[value] : undefined);
        };
        OrderedStringSet.prototype.hasValue = function (value) {
            return (webglext.isString(value) && webglext.isNotEmpty(this._indexes[value]));
        };
        OrderedStringSet.prototype.hasValues = function (values) {
            for (var n = 0; n < values.length; n++) {
                if (!this.hasValue(values[n])) {
                    return false;
                }
            }
            return true;
        };
        OrderedStringSet.prototype.add = function (value, index, moveIfExists) {
            var index = (webglext.isNotEmpty(index) ? index : this._valuesArray.length);
            if (!webglext.isNotEmpty(moveIfExists))
                moveIfExists = false;
            this._add(value, index, moveIfExists);
        };
        OrderedStringSet.prototype.addAll = function (values, index, moveIfExists) {
            var index = (webglext.isNotEmpty(index) ? index : this._valuesArray.length);
            if (!webglext.isNotEmpty(moveIfExists))
                moveIfExists = false;
            for (var n = 0; n < values.length; n++) {
                var actualIndex = this._add(values[n], index, moveIfExists);
                index = actualIndex + 1;
            }
        };
        OrderedStringSet.prototype._add = function (value, newIndex, moveIfExists) {
            requireString(value);
            var oldIndex = this._indexes[value];
            if (!webglext.isNotEmpty(oldIndex)) {
                this._valuesArray.splice(newIndex, 0, value);
                for (var n = newIndex; n < this._valuesArray.length; n++) {
                    this._indexes[this._valuesArray[n]] = n;
                }
                if (this._valueAdded) {
                    this._valueAdded.fire(value, newIndex);
                }
            }
            else if (newIndex !== oldIndex && moveIfExists) {
                this._valuesArray.splice(oldIndex, 1);
                if (newIndex > oldIndex) {
                    newIndex--;
                    this._valuesArray.splice(newIndex, 0, value);
                    for (var n = oldIndex; n <= newIndex; n++) {
                        this._indexes[this._valuesArray[n]] = n;
                    }
                }
                else {
                    this._valuesArray.splice(newIndex, 0, value);
                    for (var n = newIndex; n <= oldIndex; n++) {
                        this._indexes[this._valuesArray[n]] = n;
                    }
                }
                if (this._valueMoved) {
                    this._valueMoved.fire(value, oldIndex, newIndex);
                }
            }
            else {
                newIndex = oldIndex;
            }
            // Return the actual insertion index -- may differ from the originally
            // requested index if an existing value had to be moved
            return newIndex;
        };
        OrderedStringSet.prototype.removeValue = function (value) {
            if (webglext.isString(value)) {
                var index = this._indexes[value];
                if (webglext.isNotEmpty(index)) {
                    this._remove(value, index);
                }
            }
        };
        OrderedStringSet.prototype.removeIndex = function (index) {
            var value = this._valuesArray[index];
            if (webglext.isString(value)) {
                this._remove(value, index);
            }
        };
        OrderedStringSet.prototype.removeAll = function () {
            // Remove from last to first, to minimize index shifting
            for (var n = this._valuesArray.length - 1; n >= 0; n--) {
                var value = this._valuesArray[n];
                this._remove(value, n);
            }
        };
        OrderedStringSet.prototype.retainValues = function (values) {
            var valuesToRetain = {};
            for (var n = 0; n < values.length; n++) {
                var value = values[n];
                if (webglext.isString(value)) {
                    valuesToRetain[value] = true;
                }
            }
            this._retain(valuesToRetain);
        };
        OrderedStringSet.prototype.retainIndices = function (indices) {
            var valuesToRetain = {};
            for (var n = 0; n < indices.length; n++) {
                var value = this._valuesArray[indices[n]];
                valuesToRetain[value] = true;
            }
            this._retain(valuesToRetain);
        };
        OrderedStringSet.prototype._retain = function (values) {
            // Remove from last to first, to minimize index shifting
            for (var n = this._valuesArray.length - 1; n >= 0; n--) {
                var value = this._valuesArray[n];
                if (!values.hasOwnProperty(value)) {
                    this._remove(value, n);
                }
            }
        };
        OrderedStringSet.prototype._remove = function (value, index) {
            this._valuesArray.splice(index, 1);
            delete this._indexes[value];
            for (var n = index; n < this._valuesArray.length; n++) {
                this._indexes[this._valuesArray[n]] = n;
            }
            if (this._valueRemoved) {
                this._valueRemoved.fire(value, index);
            }
        };
        return OrderedStringSet;
    }());
    webglext.OrderedStringSet = OrderedStringSet;
})(webglext || (webglext = {}));
//# sourceMappingURL=ordered_set.js.map