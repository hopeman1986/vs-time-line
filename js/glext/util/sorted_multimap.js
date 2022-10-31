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
    // A sorted map which allows multiple string values per key (K)
    var SortedMultimap = /** @class */ (function () {
        function SortedMultimap(comparator, idFn) {
            if (idFn === void 0) { idFn = webglext.getObjectId; }
            this._tree = new webglext.BinaryTree(this.createContainerComparator(comparator));
            this._idFn = idFn;
        }
        SortedMultimap.prototype.createContainerComparator = function (comparator) {
            return {
                compare: function (container1, container2) {
                    return comparator.compare(container1.key, container2.key);
                }
            };
        };
        // Inserts the value into the tree. Nothing is inserted if the value already exists
        SortedMultimap.prototype.insert = function (key, value) {
            var wrappedKey = new Container(key);
            var values = this._tree.getValue(wrappedKey);
            if (values === null) {
                values = wrappedKey;
                this._tree.insert(values);
            }
            values.add(value, this._idFn);
        };
        SortedMultimap.prototype.remove = function (key, value) {
            var wrappedKey = new Container(key);
            var values = this._tree.getValue(wrappedKey);
            if (values === null)
                return;
            values.remove(value, this._idFn);
            if (values.size === 0) {
                this._tree.remove(values);
            }
        };
        SortedMultimap.prototype.contains = function (key, value) {
            var wrappedKey = new Container(key);
            var values = this._tree.getValue(wrappedKey);
            if (values === null) {
                return false;
            }
            else {
                return values.contains(value, this._idFn);
            }
        };
        // Returns the lowest element greater than or equal to the given value, or null if no such element exists
        SortedMultimap.prototype.ceiling = function (key) {
            return this.unwrap(this._tree.ceiling(this.wrap(key)));
        };
        // Returns the greatest element less than or equal to the given value, or null if no such element exists
        SortedMultimap.prototype.floor = function (key) {
            return this.unwrap(this._tree.floor(this.wrap(key)));
        };
        // Returns the greatest element strictly less than the given value, or null if no such element exists
        SortedMultimap.prototype.lower = function (key) {
            return this.unwrap(this._tree.lower(this.wrap(key)));
        };
        // Returns the lowest element strictly greater than the given value, or null if no such element exists
        SortedMultimap.prototype.higher = function (key) {
            return this.unwrap(this._tree.higher(this.wrap(key)));
        };
        // Returns all elements greater than (or equal to, if inclusive is true) the provided value (sorted from low to high)
        SortedMultimap.prototype.headSet = function (key, inclusive) {
            if (inclusive === void 0) { inclusive = true; }
            return this.unwrapArray(this._tree.headSet(this.wrap(key), inclusive));
        };
        // Returns all elements less than ( or equal to, if inclusive is true) the provided value (sorted from low to high)
        SortedMultimap.prototype.tailSet = function (key, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            return this.unwrapArray(this._tree.tailSet(this.wrap(key), inclusive));
        };
        // Returns all elements between the provided values (sorted from low to high)
        SortedMultimap.prototype.subSet = function (low, high, lowInclusive, highInclusive) {
            if (lowInclusive === void 0) { lowInclusive = true; }
            if (highInclusive === void 0) { highInclusive = false; }
            var wrappedLow = new Container(low);
            var wrappedHigh = new Container(high);
            var values = this._tree.subSet(wrappedLow, wrappedHigh, lowInclusive, highInclusive);
            return this.unwrapArray(values);
        };
        // Returns all keys in the tree (sorted from low to high)
        SortedMultimap.prototype.toArray = function () {
            return this.unwrapArray(this._tree.toArray());
        };
        SortedMultimap.prototype.iterator = function () {
            var iter = this._tree.iterator();
            var currentArray = null;
            var currentIndex = 0;
            return {
                next: function () {
                    var value;
                    if (currentArray == null || currentIndex >= currentArray.length) {
                        currentArray = iter.next().toArray();
                        currentIndex = 0;
                        value = currentArray[currentIndex];
                    }
                    else {
                        value = currentArray[currentIndex];
                    }
                    currentIndex += 1;
                    return value;
                },
                hasNext: function () {
                    return iter.hasNext() || (currentArray != null && currentIndex < currentArray.length);
                }
            };
        };
        SortedMultimap.prototype.wrap = function (key) {
            return new Container(key);
        };
        SortedMultimap.prototype.unwrap = function (values) {
            if (values === null) {
                return [];
            }
            else {
                return values.toArray();
            }
        };
        SortedMultimap.prototype.unwrapArray = function (values) {
            var unwrappedValues = new Array();
            values.forEach(function (value) {
                value.toArray().forEach(function (value) {
                    unwrappedValues.push(value);
                });
            });
            return unwrappedValues;
        };
        return SortedMultimap;
    }());
    webglext.SortedMultimap = SortedMultimap;
    var SortedStringMultimap = /** @class */ (function (_super) {
        __extends(SortedStringMultimap, _super);
        function SortedStringMultimap(comparator) {
            return _super.call(this, comparator, function (value) { return value; }) || this;
        }
        return SortedStringMultimap;
    }(SortedMultimap));
    webglext.SortedStringMultimap = SortedStringMultimap;
    // a container which stores a set of values (V) associated with a sorted key (K)
    // OrderedSet or even BinaryTree could be used here instead
    // more sophisticated set implementation: http://stackoverflow.com/questions/7958292/mimicking-sets-in-javascript
    var Container = /** @class */ (function () {
        function Container(key) {
            this._key = key;
            this._values = {};
        }
        Object.defineProperty(Container.prototype, "size", {
            get: function () {
                return this.toArray().length;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Container.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Container.prototype, "values", {
            get: function () {
                return this._values;
            },
            enumerable: false,
            configurable: true
        });
        Container.prototype.toArray = function () {
            var _this = this;
            return Object.keys(this._values).map(function (key) { return _this._values[key]; });
        };
        Container.prototype.contains = function (value, idFn) {
            // safer than 'value in this._values' because of potential conflict with built in properties/methods
            return Object.prototype.hasOwnProperty.call(this._values, idFn(value));
        };
        Container.prototype.add = function (value, idFn) {
            this._values[idFn(value)] = value;
        };
        Container.prototype.remove = function (value, idFn) {
            delete this._values[idFn(value)];
        };
        return Container;
    }());
})(webglext || (webglext = {}));
//# sourceMappingURL=sorted_multimap.js.map