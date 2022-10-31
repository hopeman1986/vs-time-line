var webglext;
(function (webglext) {
    var BinaryTree = /** @class */ (function () {
        function BinaryTree(comparator) {
            this._root = null;
            this._comp = comparator;
            this._size = 0;
        }
        // Inserts the value into the tree. Nothing is inserted if the value already exists
        BinaryTree.prototype.insert = function (value) {
            this._root = this.insert0(value, this._root);
        };
        // Removes the value from the tree (if it exists)
        BinaryTree.prototype.remove = function (value) {
            this._root = this.remove0(value, this._root);
        };
        // Removes all values from the tree (size will be 0)
        BinaryTree.prototype.removeAll = function () {
            this._root = null;
            this._size = 0;
        };
        BinaryTree.prototype.contains = function (value) {
            return this.contains0(value, this._root) !== null;
        };
        // Gets the actual value stored in the tree or null if it does not exist.
        // Normally this is not useful. This method is provided for trees which store additional
        // data in their values besides their sort order.
        BinaryTree.prototype.getValue = function (value) {
            return this.contains0(value, this._root);
        };
        Object.defineProperty(BinaryTree.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(BinaryTree.prototype, "isEmpty", {
            get: function () {
                return (this._size === 0);
            },
            enumerable: false,
            configurable: true
        });
        // Returns the lowest element greater than or equal to the given value, or null if no such element exists
        BinaryTree.prototype.ceiling = function (value) {
            return this.higher0(value, this._root, true);
        };
        // Returns the greatest element less than or equal to the given value, or null if no such element exists
        BinaryTree.prototype.floor = function (value) {
            return this.lower0(value, this._root, true);
        };
        // Returns the greatest element strictly less than the given value, or null if no such element exists
        BinaryTree.prototype.lower = function (value) {
            return this.lower0(value, this._root, false);
        };
        // Returns the lowest element strictly greater than the given value, or null if no such element exists
        BinaryTree.prototype.higher = function (value) {
            return this.higher0(value, this._root, false);
        };
        // Returns all elements greater than (or equal to, if inclusive is true) the provided value (sorted from low to high)
        BinaryTree.prototype.headSet = function (value, inclusive) {
            if (inclusive === void 0) { inclusive = true; }
            var results = new Array();
            this.head0(value, inclusive, this._root, results);
            return results;
        };
        // Returns all elements less than ( or equal to, if inclusive is true) the provided value (sorted from low to high)
        BinaryTree.prototype.tailSet = function (value, inclusive) {
            if (inclusive === void 0) { inclusive = false; }
            var results = new Array();
            this.tail0(value, inclusive, this._root, results);
            return results;
        };
        // Returns all elements between the provided values (sorted from low to high)
        BinaryTree.prototype.subSet = function (low, high, lowInclusive, highInclusive) {
            if (lowInclusive === void 0) { lowInclusive = true; }
            if (highInclusive === void 0) { highInclusive = false; }
            var results = new Array();
            this.sub0(low, high, lowInclusive, highInclusive, this._root, results);
            return results;
        };
        // Returns all elements in the tree (sorted from low to high)
        BinaryTree.prototype.toArray = function () {
            var results = new Array();
            this.addAll0(this._root, results);
            return results;
        };
        BinaryTree.prototype.iterator = function () {
            // find the first node by traversing left links down the tree
            var node = this._root;
            var down;
            var stack = new Array();
            while (node != null && node.left != null) {
                stack.push(node);
                node = node.left;
            }
            down = node.right != null;
            return {
                next: function () {
                    var value = node.value;
                    // down indicates we should follow the right link
                    if (down && node != null && node.right != null) {
                        node = node.right;
                        while (node != null && node.left != null) {
                            stack.push(node);
                            node = node.left;
                        }
                        down = node.right != null;
                    }
                    // up indicates the right link has been followed and we should move up to parent
                    else {
                        node = stack.pop();
                        down = true;
                    }
                    return value;
                },
                hasNext: function () {
                    return node != null;
                }
            };
        };
        BinaryTree.prototype.compare = function (node1, node2) {
            return this._comp.compare(node1, node2);
        };
        BinaryTree.prototype.contains0 = function (value, node) {
            if (node == null) {
                return null;
            }
            var comp = this.compare(value, node.value);
            if (comp > 0) {
                return this.contains0(value, node.right);
            }
            else if (comp < 0) {
                return this.contains0(value, node.left);
            }
            else {
                return node.value;
            }
        };
        BinaryTree.prototype.lower0 = function (value, node, inclusive) {
            if (node == null) {
                return null;
            }
            var comp = this.compare(value, node.value);
            var candidate;
            if (comp > 0) {
                candidate = this.lower0(value, node.right, inclusive);
                // don't need to compare again, candidate will be closer to value
                return candidate != null ? candidate : node.value;
            }
            else if (comp < 0 || (!inclusive && comp == 0)) {
                // current node's value is lower -- if we don't find a better value:
                //   * return this node's value if lower
                //   * otherwise return null
                candidate = this.lower0(value, node.left, inclusive);
                if (candidate == null)
                    candidate = node.value;
                comp = this.compare(value, candidate);
                return comp > 0 || (inclusive && comp == 0) ? candidate : null;
            }
            else {
                // the node's value equals the search value and inclusive is true
                return node.value;
            }
        };
        BinaryTree.prototype.higher0 = function (value, node, inclusive) {
            if (node == null) {
                return null;
            }
            var comp = this.compare(value, node.value);
            var candidate;
            if (comp < 0) {
                candidate = this.higher0(value, node.left, inclusive);
                // don't need to compare again, candidate will be closer to value
                return candidate != null ? candidate : node.value;
            }
            else if (comp > 0 || (!inclusive && comp == 0)) {
                // current node's value is lower -- if we don't find a better value:
                //   * return this node's value if higher
                //   * otherwise return null
                candidate = this.higher0(value, node.right, inclusive);
                if (candidate == null)
                    candidate = node.value;
                comp = this.compare(value, candidate);
                return comp < 0 || (inclusive && comp == 0) ? candidate : null;
            }
            else {
                // the node's value equals the search value and inclusive is true
                return node.value;
            }
        };
        BinaryTree.prototype.sub0 = function (low, high, lowInclusive, highInclusive, node, results) {
            if (node == null) {
                return;
            }
            // low end of range is above node value
            var compLow = this.compare(low, node.value);
            if (compLow > 0 || (compLow == 0 && !lowInclusive)) {
                return this.sub0(low, high, lowInclusive, highInclusive, node.right, results);
            }
            // high end of range is below node value
            var compHigh = this.compare(high, node.value);
            if (compHigh < 0 || (compHigh == 0 && !highInclusive)) {
                return this.sub0(low, high, lowInclusive, highInclusive, node.left, results);
            }
            // value is within range
            this.sub0(low, high, lowInclusive, highInclusive, node.left, results);
            results.push(node.value);
            this.sub0(low, high, lowInclusive, highInclusive, node.right, results);
        };
        BinaryTree.prototype.head0 = function (value, inclusive, node, results) {
            if (node == null) {
                return;
            }
            var comp = this.compare(value, node.value);
            if (comp < 0 || (comp == 0 && inclusive)) {
                this.head0(value, inclusive, node.left, results);
                results.push(node.value);
                this.addAll0(node.right, results);
            }
            else if (comp > 0) {
                this.head0(value, inclusive, node.right, results);
            }
        };
        BinaryTree.prototype.tail0 = function (value, inclusive, node, results) {
            if (node == null) {
                return;
            }
            var comp = this.compare(value, node.value);
            if (comp > 0 || (comp == 0 && inclusive)) {
                this.addAll0(node.left, results);
                results.push(node.value);
                this.tail0(value, inclusive, node.right, results);
            }
            else if (comp < 0) {
                this.tail0(value, inclusive, node.left, results);
            }
        };
        BinaryTree.prototype.addAll0 = function (node, results) {
            if (node == null) {
                return;
            }
            this.addAll0(node.left, results);
            results.push(node.value);
            this.addAll0(node.right, results);
        };
        // 1) turn deletion of internal node into deletion of leaf node by swapping with closest successor or predecessor
        //    (which will always be in level 1)
        // 2) lower level of nodes whose children are two levels below them (not allowed by invariants 2 and 3)
        //    also lower level of nodes who are now leaf nodes (level > 1 not allowed by invariant 1)
        // 3) skew and split the entire level
        BinaryTree.prototype.remove0 = function (value, node) {
            if (node == null) {
                return node;
            }
            // find and remove the node
            var comp = this.compare(value, node.value);
            if (comp < 0) {
                node.left = this.remove0(value, node.left);
            }
            else if (comp > 0) {
                node.right = this.remove0(value, node.right);
            }
            else {
                if (node.isLeaf()) {
                    return null;
                }
                else if (node.left == null) {
                    var lower = node.getSuccessor();
                    node.right = this.remove0(lower.value, node.right);
                    node.value = lower.value;
                }
                else {
                    var lower = node.getPredecessor();
                    node.left = this.remove0(lower.value, node.left);
                    node.value = lower.value;
                }
                this._size -= 1;
            }
            // rebalance the tree
            node = this.decreaseLevel0(node);
            node = this.skew0(node);
            node.right = this.skew0(node.right);
            if (node.right != null) {
                node.right.right = this.skew0(node.right.right);
            }
            node = this.split0(node);
            node.right = this.split0(node.right);
            return node;
        };
        // return the level of the node, or 0 if null
        BinaryTree.prototype.level0 = function (node) {
            if (node == null) {
                return 0;
            }
            else {
                return node.level;
            }
        };
        // lower the level of nodes which violate invariants 1, 2, and/or 3
        BinaryTree.prototype.decreaseLevel0 = function (node) {
            var correctLevel = Math.min(this.level0(node.left), this.level0(node.right)) + 1;
            if (correctLevel < node.level) {
                node.level = correctLevel;
                if (node.right != null && correctLevel < node.right.level) {
                    node.right.level = correctLevel;
                }
            }
            return node;
        };
        // 1) insert the value as you would in a binary tree
        // 2) walk back to the root performing skew() then split() operations
        // returns an updated version of the provided node (after the insert)
        BinaryTree.prototype.insert0 = function (value, node) {
            if (node == null) {
                this._size += 1;
                return this.newTreeNode0(value);
            }
            // find the appropriate spot and insert the node
            var comp = this.compare(value, node.value);
            if (comp < 0) {
                node.left = this.insert0(value, node.left);
            }
            else if (comp > 0) {
                node.right = this.insert0(value, node.right);
            }
            // always perform a skew then split to rebalance tree
            // (if no balancing is necessary, these operations will return the node unchanged)
            node = this.skew0(node);
            node = this.split0(node);
            return node;
        };
        BinaryTree.prototype.newTreeNode0 = function (value) {
            return new TreeNode(value);
        };
        BinaryTree.prototype.skew0 = function (node) {
            if (node == null) {
                return null;
            }
            else if (node.left == null) {
                return node;
            }
            else if (node.left.level == node.level) {
                // swap the pointers of the horizontal (same level value) left links
                var left = node.left;
                node.left = left.right;
                left.right = node;
                return left;
            }
            else {
                return node;
            }
        };
        BinaryTree.prototype.split0 = function (node) {
            if (node == null) {
                return null;
            }
            else if (node.right == null || node.right.right == null) {
                return node;
            }
            else if (node.level == node.right.right.level) {
                // two horizontal (same level value) right links
                // take the middle node, elevate it, and return it
                var right = node.right;
                node.right = right.left;
                right.left = node;
                right.level = right.level + 1;
                return right;
            }
            else {
                return node;
            }
        };
        return BinaryTree;
    }());
    webglext.BinaryTree = BinaryTree;
    var TreeNode = /** @class */ (function () {
        function TreeNode(value, level, left, right) {
            if (level === void 0) { level = 1; }
            if (left === void 0) { left = null; }
            if (right === void 0) { right = null; }
            this._level = level;
            this._right = right;
            this._left = left;
            this._value = value;
        }
        Object.defineProperty(TreeNode.prototype, "level", {
            get: function () {
                return this._level;
            },
            set: function (level) {
                this._level = level;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "right", {
            get: function () {
                return this._right;
            },
            set: function (node) {
                this._right = node;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "left", {
            get: function () {
                return this._left;
            },
            set: function (node) {
                this._left = node;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (value) {
                this._value = value;
            },
            enumerable: false,
            configurable: true
        });
        TreeNode.prototype.isLeaf = function () {
            return this.right == null && this.left == null;
        };
        TreeNode.prototype.getSuccessor = function () {
            var node = this.right;
            while (node != null && node.left != null) {
                node = node.left;
            }
            return node;
        };
        TreeNode.prototype.getPredecessor = function () {
            var node = this.left;
            while (node != null && node.right != null) {
                node = node.right;
            }
            return node;
        };
        TreeNode.prototype.toString = function () {
            return this.value.toString() + ':' + this.level.toString();
        };
        return TreeNode;
    }());
    webglext.TreeNode = TreeNode;
    var StringComparator = /** @class */ (function () {
        function StringComparator() {
        }
        StringComparator.prototype.compare = function (value1, value2) {
            return value1.toLocaleLowerCase().localeCompare(value2.toLocaleLowerCase());
        };
        return StringComparator;
    }());
    webglext.StringComparator = StringComparator;
    var NumberComparator = /** @class */ (function () {
        function NumberComparator() {
        }
        NumberComparator.prototype.compare = function (value1, value2) {
            return value1 - value2;
        };
        return NumberComparator;
    }());
    webglext.NumberComparator = NumberComparator;
    function createStringTree() {
        return new BinaryTree(new StringComparator());
    }
    webglext.createStringTree = createStringTree;
    function createNumberTree() {
        return new BinaryTree(new NumberComparator());
    }
    webglext.createNumberTree = createNumberTree;
})(webglext || (webglext = {}));
//# sourceMappingURL=binary_tree.js.map