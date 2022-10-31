var webglext;
(function (webglext) {
    function childHeight(child) {
        var usePrefHeight = (!webglext.isNotEmpty(child.layoutOptions) || child.layoutOptions.height === undefined || child.layoutOptions.height === 'pref' || child.layoutOptions.height === 'pref-max');
        return (usePrefHeight ? child.prefSize.h : child.layoutOptions.height);
    }
    // see above, like childHeight( ) but don't count 'pref-max'
    function childHeightOverfull(child) {
        var usePrefHeight = (!webglext.isNotEmpty(child.layoutOptions) || child.layoutOptions.height === undefined || child.layoutOptions.height === 'pref');
        if (usePrefHeight) {
            return child.prefSize.h;
        }
        else if (child.layoutOptions.height == 'pref-max') {
            return null;
        }
        else {
            return child.layoutOptions.height;
        }
    }
    function calculateFlexData(childrenToPlace, parentViewport, childHeight) {
        var numFlexible = 0;
        var totalHeight = 0;
        for (var c = 0; c < childrenToPlace.length; c++) {
            var h = childHeight(childrenToPlace[c]);
            if (webglext.isNotEmpty(h)) {
                totalHeight += h;
            }
            else {
                numFlexible++;
            }
        }
        var totalFlexHeight = parentViewport.h - totalHeight;
        var flexHeight = totalFlexHeight / numFlexible;
        return { numFlexible: numFlexible, totalHeight: totalHeight, flexHeight: flexHeight, totalFlexHeight: totalFlexHeight, childHeight: childHeight };
    }
    function newRowLayout(topToBottom) {
        if (topToBottom === void 0) { topToBottom = true; }
        return {
            updatePrefSize: function (parentPrefSize, children) {
                var childrenToPlace = [];
                for (var c = 0; c < children.length; c++) {
                    var child = children[c];
                    if (webglext.isNumber(child.layoutArg) && !(child.layoutOptions && child.layoutOptions.hide)) {
                        childrenToPlace.push(child);
                    }
                }
                var wMax = 0;
                var hSum = 0;
                for (var c = 0; c < childrenToPlace.length; c++) {
                    var child = childrenToPlace[c];
                    var honorChildWidth = !(child.layoutOptions && child.layoutOptions.ignoreWidth);
                    if (honorChildWidth) {
                        var w = child.prefSize.w;
                        if (webglext.isNotEmpty(wMax) && webglext.isNotEmpty(w)) {
                            wMax = Math.max(wMax, w);
                        }
                        else {
                            wMax = null;
                        }
                    }
                    var h = childHeight(child);
                    if (webglext.isNotEmpty(hSum) && webglext.isNotEmpty(h)) {
                        hSum += h;
                    }
                    else {
                        hSum = null;
                    }
                }
                parentPrefSize.w = wMax;
                parentPrefSize.h = hSum;
            },
            updateChildViewports: function (children, parentViewport) {
                var childrenToPlace = [];
                var childrenToHide = [];
                for (var c = 0; c < children.length; c++) {
                    var child = children[c];
                    if (webglext.isNumber(child.layoutArg) && !(child.layoutOptions && child.layoutOptions.hide)) {
                        childrenToPlace.push(child);
                    }
                    else {
                        childrenToHide.push(child);
                    }
                }
                // Use the original index to make the sort stable
                var indexProp = 'webglext_rowLayout_index';
                for (var c = 0; c < childrenToPlace.length; c++) {
                    var child = childrenToPlace[c];
                    child[indexProp] = c;
                }
                childrenToPlace.sort(function (a, b) {
                    var orderDiff = a.layoutArg - b.layoutArg;
                    return (orderDiff !== 0 ? orderDiff : (a[indexProp] - b[indexProp]));
                });
                // calculate assuming sufficient space
                var flexData = calculateFlexData(children, parentViewport, childHeight);
                // recalculate allowing 'pref-max' children to shrink if insufficient space
                if (flexData.totalHeight > parentViewport.h) {
                    flexData = calculateFlexData(children, parentViewport, childHeightOverfull);
                }
                if (topToBottom) {
                    var iStart = parentViewport.iStart;
                    var iEnd = parentViewport.iEnd;
                    var jEnd = parentViewport.jEnd;
                    var jRemainder = 0;
                    for (var c = 0; c < childrenToPlace.length; c++) {
                        var child = childrenToPlace[c];
                        var jStart;
                        var h = flexData.childHeight(child);
                        if (webglext.isNotEmpty(h)) {
                            jStart = jEnd - h;
                        }
                        else {
                            var jStart0 = jEnd - flexData.flexHeight - jRemainder;
                            jStart = Math.round(jStart0);
                            jRemainder = jStart - jStart0;
                        }
                        child.viewport.setEdges(iStart, iEnd, jStart, jEnd);
                        jEnd = jStart;
                    }
                }
                else {
                    var iStart = parentViewport.iStart;
                    var iEnd = parentViewport.iEnd;
                    var jStart = parentViewport.jStart;
                    var jRemainder = 0;
                    for (var c = 0; c < childrenToPlace.length; c++) {
                        var child = childrenToPlace[c];
                        var jEnd;
                        var h = flexData.childHeight(child);
                        if (webglext.isNotEmpty(h)) {
                            jEnd = jStart + h;
                        }
                        else {
                            var jEnd0 = jStart + flexData.flexHeight + jRemainder;
                            jEnd = Math.round(jEnd0);
                            jRemainder = jEnd0 - jEnd;
                        }
                        child.viewport.setEdges(iStart, iEnd, jStart, jEnd);
                        jStart = jEnd;
                    }
                }
                for (var c = 0; c < childrenToHide.length; c++) {
                    childrenToHide[c].viewport.setEdges(0, 0, 0, 0);
                }
            }
        };
    }
    webglext.newRowLayout = newRowLayout;
})(webglext || (webglext = {}));
//# sourceMappingURL=row_layout.js.map