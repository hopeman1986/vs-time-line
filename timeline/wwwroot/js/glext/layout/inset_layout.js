/*
 * Copyright (c) 2014, Metron, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var webglext;
(function (webglext) {
    function newInsets() {
        var insets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            insets[_i] = arguments[_i];
        }
        switch (insets.length) {
            case 1:
                return {
                    top: insets[0],
                    right: insets[0],
                    bottom: insets[0],
                    left: insets[0]
                };
            case 2:
                return {
                    top: insets[0],
                    right: insets[1],
                    bottom: insets[0],
                    left: insets[1]
                };
            case 3:
                return {
                    top: insets[0],
                    right: insets[1],
                    bottom: insets[2],
                    left: insets[1]
                };
            case 4:
                return {
                    top: insets[0],
                    right: insets[1],
                    bottom: insets[2],
                    left: insets[3]
                };
            default:
                throw new Error('Expected 1, 2, 3, or 4 args, but found ' + insets.length);
        }
    }
    webglext.newInsets = newInsets;
    function newInsetLayout(insets) {
        return {
            updatePrefSize: function (parentPrefSize, children) {
                if (children.length === 0) {
                    parentPrefSize.w = insets.left + insets.right;
                    parentPrefSize.h = insets.top + insets.bottom;
                }
                else if (children.length === 1) {
                    var childPrefSize = children[0].prefSize;
                    parentPrefSize.w = (webglext.isNotEmpty(childPrefSize.w) ? childPrefSize.w + insets.left + insets.right : null);
                    parentPrefSize.h = (webglext.isNotEmpty(childPrefSize.h) ? childPrefSize.h + insets.top + insets.bottom : null);
                }
                else if (children.length > 1) {
                    throw new Error('Inset layout works with at most 1 child, but pane has ' + this.children.length + ' children');
                }
            },
            updateChildViewports: function (children, parentViewport) {
                if (children.length === 1) {
                    var childViewport = children[0].viewport;
                    childViewport.setEdges(parentViewport.iStart + insets.left, parentViewport.iEnd - insets.right, parentViewport.jStart + insets.bottom, parentViewport.jEnd - insets.top);
                }
                else if (children.length > 1) {
                    throw new Error('Inset layout works with at most 1 child, but pane has ' + this.children.length + ' children');
                }
            }
        };
    }
    webglext.newInsetLayout = newInsetLayout;
    function newInsetPane(pane, insets, bgColor, consumeInputEvents) {
        if (bgColor === void 0) { bgColor = null; }
        if (consumeInputEvents === void 0) { consumeInputEvents = true; }
        var insetPane = new webglext.Pane(newInsetLayout(insets), consumeInputEvents);
        if (webglext.isNotEmpty(bgColor)) {
            insetPane.addPainter(webglext.newBackgroundPainter(bgColor));
        }
        insetPane.addPane(pane);
        return insetPane;
    }
    webglext.newInsetPane = newInsetPane;
})(webglext || (webglext = {}));
//# sourceMappingURL=inset_layout.js.map