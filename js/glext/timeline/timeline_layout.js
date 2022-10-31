var webglext;
(function (webglext) {
    function newTimelineLayout(axisHeight) {
        return {
            updatePrefSize: function (parentPrefSize, children) {
                var topAxis = null;
                var bottomAxis = null;
                var center = null;
                for (var c = 0; c < children.length; c++) {
                    var child = children[c];
                    switch (child.layoutArg) {
                        case webglext.Side.TOP:
                            if (webglext.isNotEmpty(topAxis))
                                throw new Error('Timeline-layout can have at most one top-axis pane');
                            topAxis = child;
                            break;
                        case webglext.Side.BOTTOM:
                            if (webglext.isNotEmpty(bottomAxis))
                                throw new Error('Timeline-layout can have at most one bottom-axis pane');
                            bottomAxis = child;
                            break;
                        default:
                            if (webglext.isNotEmpty(center))
                                throw new Error('Timeline-layout can have at most one center pane');
                            center = child;
                            break;
                    }
                }
                var hSum = 0;
                if (webglext.isNotEmpty(topAxis)) {
                    hSum += axisHeight;
                }
                if (webglext.isNotEmpty(bottomAxis)) {
                    hSum += axisHeight;
                }
                if (webglext.isNotEmpty(center)) {
                    if (webglext.isNotEmpty(center.prefSize.h)) {
                        hSum += center.prefSize.h;
                    }
                    else {
                        hSum = null;
                    }
                }
                parentPrefSize.w = null;
                parentPrefSize.h = hSum;
            },
            updateChildViewports: function (children, parentViewport) {
                var topAxis = null;
                var bottomAxis = null;
                var center = null;
                for (var c = 0; c < children.length; c++) {
                    var child = children[c];
                    switch (child.layoutArg) {
                        case webglext.Side.TOP:
                            if (webglext.isNotEmpty(topAxis))
                                throw new Error('Timeline-layout can have at most one top-axis pane');
                            topAxis = child;
                            break;
                        case webglext.Side.BOTTOM:
                            if (webglext.isNotEmpty(bottomAxis))
                                throw new Error('Timeline-layout can have at most one bottom-axis pane');
                            bottomAxis = child;
                            break;
                        default:
                            if (webglext.isNotEmpty(center))
                                throw new Error('Timeline-layout can have at most one center pane');
                            center = child;
                            break;
                    }
                }
                if (webglext.isNotEmpty(topAxis)) {
                    topAxis.viewport.setRect(parentViewport.i, parentViewport.jEnd - axisHeight, parentViewport.w, axisHeight);
                }
                if (webglext.isNotEmpty(bottomAxis)) {
                    var jBottomMax = (webglext.isNotEmpty(topAxis) ? topAxis.viewport.j : parentViewport.jEnd) - axisHeight;
                    bottomAxis.viewport.setRect(parentViewport.i, Math.min(jBottomMax, parentViewport.j), parentViewport.w, axisHeight);
                }
                if (webglext.isNotEmpty(center)) {
                    var jCenterEnd = (webglext.isNotEmpty(topAxis) ? topAxis.viewport.jStart : parentViewport.jEnd);
                    var jCenterStart = (webglext.isNotEmpty(bottomAxis) ? bottomAxis.viewport.jEnd : parentViewport.jStart);
                    center.viewport.setEdges(parentViewport.iStart, parentViewport.iEnd, jCenterStart, jCenterEnd);
                }
            }
        };
    }
    webglext.newTimelineLayout = newTimelineLayout;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_layout.js.map