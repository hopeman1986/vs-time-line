// this is scroll layout
var webglext;
(function (webglext) {
    function newVerticalScrollLayout() {
        var layout = {
            updatePrefSize: function (parentPrefSize, children) {
                if (children.length === 1) {
                    var childPrefSize = children[0].prefSize;
                    // XXX: Need some way to override the child's pref-height
                    if (!webglext.isNotEmpty(childPrefSize.h)) {
                        throw new Error('Vertical-scroll layout requires child to have a defined pref-height, but its pref-height is ' + childPrefSize.h);
                    }
                    parentPrefSize.w = childPrefSize.w;
                    parentPrefSize.h = childPrefSize.h;
                }
                else if (children.length > 1) {
                    throw new Error('Vertical-scroll layout only works with 1 child, but pane has ' + this.children.length + ' children');
                }
            },
            jOffset: 0,
            hContent: 0,
            hVisible: 0,
            updateChildViewports: function (children, parentViewport) {
                if (children.length === 1) {
                    var child = children[0];
                    var j;
                    var h = child.prefSize.h;
                    if (h <= parentViewport.h) {
                        j = parentViewport.jEnd - h;
                    }
                    else {
                        j = Math.min(parentViewport.j, parentViewport.jEnd - h + Math.max(0, Math.round(layout.jOffset)));
                    }
                    child.viewport.setRect(parentViewport.i, j, parentViewport.w, h);
                    layout.jOffset = (j + h) - parentViewport.jEnd;
                    layout.hContent = h;
                    layout.hVisible = parentViewport.h;
                }
                else if (children.length > 1) {
                    throw new Error('Vertical-scroll layout only works with 1 child, but pane has ' + this.children.length + ' children');
                }
            }
        };
        return layout;
    }
    webglext.newVerticalScrollLayout = newVerticalScrollLayout;
    function newVerticalScrollbar(scrollLayout, drawable, options) {
        var bgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.bgColor) ? options.bgColor : webglext.gray(0.9));
        var scrollbar = new webglext.Pane(null);
        scrollbar.addPainter(webglext.newBackgroundPainter(bgColor));
        scrollbar.addPainter(newVerticalScrollbarPainter(scrollLayout, options));
        attachVerticalScrollMouseListeners(scrollbar, scrollLayout, drawable);
        return scrollbar;
    }
    webglext.newVerticalScrollbar = newVerticalScrollbar;
    function newVerticalScrollbarPainter(scrollLayout, options) {
        var fgColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.fgColor) ? options.fgColor : webglext.gray(0.56));
        var borderColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderColor) ? options.borderColor : webglext.gray(0.42));
        var borderThickness = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderThickness) ? options.borderThickness : 1);
        var borderTop = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderTop) ? options.borderTop : true);
        var borderLeft = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderLeft) ? options.borderLeft : false);
        var borderRight = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderRight) ? options.borderRight : false);
        var borderBottom = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.borderBottom) ? options.borderBottom : true);
        var program = new webglext.Program(webglext.xyFrac_VERTSHADER, webglext.solid_FRAGSHADER);
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        var a_XyFrac = new webglext.Attribute(program, 'a_XyFrac');
        var numFillVertices = 6;
        var numBorderVertices = (borderTop ? 6 : 0) + (borderLeft ? 6 : 0) + (borderRight ? 6 : 0) + (borderBottom ? 6 : 0);
        var xyFrac = new Float32Array(2 * Math.max(numFillVertices, numBorderVertices));
        var xyFracBuffer = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            var hFrac = scrollLayout.hVisible / scrollLayout.hContent;
            if (hFrac < 1) {
                var yTop = Math.round(((scrollLayout.hContent - (scrollLayout.jOffset)) / scrollLayout.hContent) * viewport.h + 1e-4);
                var yBottom = Math.round(((scrollLayout.hContent - (scrollLayout.jOffset + scrollLayout.hVisible)) / scrollLayout.hContent) * viewport.h + 1e-4);
                var yFracTop = yTop / viewport.h;
                var yFracBottom = yBottom / viewport.h;
                var wBorderFrac = borderThickness / viewport.w;
                var hBorderFrac = borderThickness / viewport.h;
                gl.disable(webglext.GL.BLEND);
                program.use(gl);
                // Fill
                //
                webglext.putQuadXys(xyFrac, 0, 0 + (borderLeft ? wBorderFrac : 0), 1 - (borderRight ? wBorderFrac : 0), yFracTop - (borderTop ? hBorderFrac : 0), yFracBottom + (borderBottom ? hBorderFrac : 0));
                xyFracBuffer.setData(xyFrac.subarray(0, 2 * numFillVertices));
                a_XyFrac.setDataAndEnable(gl, xyFracBuffer, 2, webglext.GL.FLOAT);
                u_Color.setData(gl, fgColor);
                gl.drawArrays(webglext.GL.TRIANGLES, 0, numFillVertices);
                // Border
                //
                var index = 0;
                if (borderTop)
                    index = webglext.putQuadXys(xyFrac, index, 0, 1 - (borderRight ? wBorderFrac : 0), yFracTop, yFracTop - hBorderFrac);
                if (borderBottom)
                    index = webglext.putQuadXys(xyFrac, index, 0 + (borderLeft ? wBorderFrac : 0), 1, yFracBottom + hBorderFrac, yFracBottom);
                if (borderRight)
                    index = webglext.putQuadXys(xyFrac, index, 1 - wBorderFrac, 1, yFracTop, yFracBottom + (borderBottom ? hBorderFrac : 0));
                if (borderLeft)
                    index = webglext.putQuadXys(xyFrac, index, 0, 0 + wBorderFrac, yFracTop - (borderTop ? hBorderFrac : 0), yFracBottom);
                xyFracBuffer.setData(xyFrac.subarray(0, 2 * numBorderVertices));
                a_XyFrac.setDataAndEnable(gl, xyFracBuffer, 2, webglext.GL.FLOAT);
                u_Color.setData(gl, borderColor);
                gl.drawArrays(webglext.GL.TRIANGLES, 0, numBorderVertices);
                a_XyFrac.disable(gl);
                program.endUse(gl);
            }
        };
    }
    webglext.newVerticalScrollbarPainter = newVerticalScrollbarPainter;
    // mouse listener for scrolling while panning on the timeline itself
    function attachTimelineVerticalScrollMouseListeners(pane, scrollLayout, drawable) {
        // Used when dragging inside pane
        var grab = null;
        var jOffset = null;
        pane.mouseDown.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent)) {
                grab = ev.j;
                jOffset = scrollLayout.jOffset;
            }
        });
        pane.mouseMove.on(function (ev) {
            if (webglext.isNotEmpty(grab)) {
                scrollLayout.jOffset = jOffset - (grab - ev.j);
                drawable.redraw();
            }
        });
        pane.mouseUp.on(function (ev) {
            grab = null;
        });
    }
    webglext.attachTimelineVerticalScrollMouseListeners = attachTimelineVerticalScrollMouseListeners;
    // mouse listener for scrolling while interacting with the scrollbar
    function attachVerticalScrollMouseListeners(scrollbar, scrollLayout, drawable) {
        // Used when dragging the handle
        var grab = null;
        // Used when scrollbar is pressed-and-held outside the handle
        var pageScrollTimer = null;
        var recentPointerFrac = null;
        scrollbar.mouseDown.on(function (ev) {
            if (webglext.isLeftMouseDown(ev.mouseEvent) && !webglext.isNotEmpty(grab)) {
                var topFrac = (scrollLayout.hContent - scrollLayout.jOffset) / scrollLayout.hContent;
                var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                var pointerFrac = webglext.yFrac(ev);
                if (topFrac - fracExtent <= pointerFrac && pointerFrac <= topFrac) {
                    grab = (topFrac - pointerFrac) / fracExtent;
                }
                else {
                    var direction = 0;
                    if (pointerFrac < topFrac - fracExtent)
                        direction = +1;
                    else if (pointerFrac > topFrac)
                        direction = -1;
                    scrollLayout.jOffset += direction * Math.max(1, 0.875 * scrollLayout.hVisible);
                    drawable.redraw();
                    recentPointerFrac = pointerFrac;
                    var pageScroll = function () {
                        var topFrac = (scrollLayout.hContent - scrollLayout.jOffset) / scrollLayout.hContent;
                        var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                        var pointerFrac = recentPointerFrac;
                        var direction = 0;
                        if (pointerFrac < topFrac - fracExtent)
                            direction = +1;
                        else if (pointerFrac > topFrac)
                            direction = -1;
                        scrollLayout.jOffset += direction * Math.max(1, 0.875 * scrollLayout.hVisible);
                        drawable.redraw();
                        pageScrollTimer = setTimeout(pageScroll, 50);
                    };
                    pageScrollTimer = setTimeout(pageScroll, 500);
                }
            }
        });
        scrollbar.mouseMove.on(function (ev) {
            var pointerFrac = webglext.yFrac(ev);
            if (webglext.isNotEmpty(grab)) {
                var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                var topFrac = pointerFrac + grab * fracExtent;
                scrollLayout.jOffset = scrollLayout.hContent - topFrac * scrollLayout.hContent;
                drawable.redraw();
            }
            if (webglext.isNotEmpty(pageScrollTimer)) {
                recentPointerFrac = pointerFrac;
            }
        });
        scrollbar.mouseUp.on(function (ev) {
            grab = null;
            if (webglext.isNotEmpty(pageScrollTimer)) {
                clearTimeout(pageScrollTimer);
                pageScrollTimer = null;
                recentPointerFrac = null;
            }
        });
    }
    webglext.attachVerticalScrollMouseListeners = attachVerticalScrollMouseListeners;
})(webglext || (webglext = {}));
//# sourceMappingURL=scroll.js.map