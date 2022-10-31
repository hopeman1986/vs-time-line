var webglext;
(function (webglext) {
    function xFrac(ev) {
        return ev.paneViewport.xFrac(ev.i);
    }
    webglext.xFrac = xFrac;
    function yFrac(ev) {
        return ev.paneViewport.yFrac(ev.j);
    }
    webglext.yFrac = yFrac;
    var PaneChild = /** @class */ (function () {
        function PaneChild(pane, layoutArg, layoutOptions) {
            this.pane = pane;
            this.layoutArg = layoutArg;
            this.layoutOptions = layoutOptions;
            this.viewport = webglext.newBoundsFromRect(0, 0, 0, 0);
            this.scissor = webglext.newBoundsFromRect(0, 0, 0, 0);
            this.prefSize = { w: 0, h: 0 };
        }
        return PaneChild;
    }());
    var Pane = /** @class */ (function () {
        function Pane(layout, consumesInputEvents, isInside) {
            if (consumesInputEvents === void 0) { consumesInputEvents = true; }
            if (isInside === void 0) { isInside = webglext.alwaysTrue; }
            var _this = this;
            // Input Handling
            //
            this._mouseUp = new webglext.Notification1();
            this._mouseDown = new webglext.Notification1();
            this._mouseMove = new webglext.Notification1();
            this._mouseWheel = new webglext.Notification1();
            this._mouseEnter = new webglext.Notification1();
            this._mouseExit = new webglext.Notification1();
            this._contextMenu = new webglext.Notification1();
            this.painters = [];
            this.consumesInputEvents = consumesInputEvents;
            this.isInside = isInside;
            this._mouseCursor = (consumesInputEvents ? 'default' : null);
            this._mouseCursorChanged = new webglext.Notification();
            this._childMouseCursorListener = (function () { return _this._mouseCursorChanged.fire(); });
            this.children = new webglext.OrderedSet([], function (paneChild) { return webglext.getObjectId(paneChild.pane); }, false);
            this._layout = layout;
            this._viewport = webglext.newBoundsFromRect(0, 0, 0, 0);
            this._scissor = webglext.newBoundsFromRect(0, 0, 0, 0);
            this._viewportChanged = new webglext.Notification();
            this._dispose = new webglext.Notification();
            this._dispose.on(function () {
                _this._mouseUp.dispose();
                _this._mouseDown.dispose();
                _this._mouseMove.dispose();
                _this._mouseWheel.dispose();
                _this._mouseEnter.dispose();
                _this._mouseExit.dispose();
                _this._contextMenu.dispose();
                // recursively dispose all child panes
                for (var i = 0; i < _this.children.length; i++) {
                    _this.children.valueAt(i).pane.dispose.fire();
                }
            });
        }
        Object.defineProperty(Pane.prototype, "layout", {
            get: function () {
                return this.layout;
            },
            set: function (layout) {
                this._layout = layout;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseCursor", {
            get: function () {
                return this._mouseCursor;
            },
            set: function (mouseCursor) {
                if (mouseCursor !== this._mouseCursor) {
                    this._mouseCursor = mouseCursor;
                    this._mouseCursorChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseCursorChanged", {
            get: function () {
                return this._mouseCursorChanged;
            },
            enumerable: false,
            configurable: true
        });
        Pane.prototype.addPainter = function (painter) {
            this.painters.push(painter);
        };
        Pane.prototype.addPane = function (pane, layoutArg, layoutOptions) {
            if (layoutArg === void 0) { layoutArg = null; }
            if (layoutOptions === void 0) { layoutOptions = {}; }
            this.children.add(new PaneChild(pane, layoutArg, layoutOptions));
            pane.mouseCursorChanged.on(this._childMouseCursorListener);
        };
        Pane.prototype.removePane = function (pane) {
            this.children.removeValue(this._childFor(pane));
            pane.mouseCursorChanged.off(this._childMouseCursorListener);
        };
        Pane.prototype.layoutArg = function (pane) {
            return this._childFor(pane).layoutArg;
        };
        Pane.prototype.setLayoutArg = function (pane, layoutArg) {
            this._childFor(pane).layoutArg = layoutArg;
        };
        Pane.prototype.updateLayoutArgs = function (updateFn) {
            for (var c = 0; c < this.children.length; c++) {
                var child = this.children.valueAt(c);
                child.layoutArg = updateFn(child.layoutArg, child.layoutOptions);
            }
        };
        Pane.prototype.layoutOptions = function (pane) {
            return this._childFor(pane).layoutOptions;
        };
        Pane.prototype._childFor = function (pane) {
            return this.children.valueFor(webglext.getObjectId(pane));
        };
        // Layout & Paint
        //
        Pane.prototype.updatePrefSizes = function (result) {
            // Child panes
            for (var c = 0; c < this.children.length; c++) {
                var child = this.children.valueAt(c);
                child.pane.updatePrefSizes(child.prefSize);
            }
            // This pane
            if (webglext.isNotEmpty(this._layout) && webglext.isNotEmpty(this._layout.updatePrefSize)) {
                this._layout.updatePrefSize(result, this.children.toArray());
            }
            else {
                result.w = null;
                result.h = null;
            }
        };
        Pane.prototype.updateBounds = function (viewport, scissor) {
            // This pane
            var viewportChanged = (viewport.iStart !== this._viewport.iStart || viewport.iEnd !== this._viewport.iEnd || viewport.jStart !== this._viewport.jStart || viewport.jEnd !== this._viewport.jEnd);
            this._viewport.setBounds(viewport);
            this._scissor.setBounds(scissor);
            // Child panes
            if (webglext.isNotEmpty(this._layout) && webglext.isNotEmpty(this._layout.updateChildViewports)) {
                this._layout.updateChildViewports(this.children.toArray(), viewport);
                for (var c = 0; c < this.children.length; c++) {
                    var child = this.children.valueAt(c);
                    child.scissor.setBounds(child.viewport.unmod);
                    child.scissor.cropToBounds(scissor);
                    child.pane.updateBounds(child.viewport.unmod, child.scissor.unmod);
                }
            }
            else if (this.children.length > 0) {
                throw new Error('Pane has ' + this.children.length + ' ' + (this.children.length === 1 ? 'child' : 'children') + ', but its layout is ' + this.layout);
            }
            // Notify
            if (viewportChanged) {
                this._viewportChanged.fire();
            }
        };
        Pane.prototype.paint = function (gl) {
            var viewport = this._viewport.unmod;
            var scissor = this._scissor.unmod;
            if (scissor.w > 0 && scissor.h > 0) {
                // This pane
                gl.viewport(viewport.i, viewport.j, viewport.w, viewport.h);
                gl.enable(webglext.GL.SCISSOR_TEST);
                gl.scissor(scissor.i, scissor.j, scissor.w, scissor.h);
                for (var p = 0; p < this.painters.length; p++) {
                    this.painters[p](gl, viewport);
                }
                // Child panes
                for (var c = 0; c < this.children.length; c++) {
                    this.children.valueAt(c).pane.paint(gl);
                }
            }
        };
        Object.defineProperty(Pane.prototype, "viewport", {
            get: function () {
                return this._viewport.unmod;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "scissor", {
            get: function () {
                return this._scissor.unmod;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "viewportChanged", {
            get: function () {
                return this._viewportChanged;
            },
            enumerable: false,
            configurable: true
        });
        Pane.prototype.panesAt = function (i, j) {
            var result = [];
            this._panesAt(i, j, result);
            return result;
        };
        Pane.prototype._panesAt = function (i, j, result) {
            if (this._scissor.contains(i, j)) {
                for (var c = this.children.length - 1; c >= 0; c--) {
                    var consumed = this.children.valueAt(c).pane._panesAt(i, j, result);
                    if (consumed)
                        return true;
                }
                if (this.isInside(this._viewport.unmod, i, j)) {
                    result.push(this);
                    return this.consumesInputEvents;
                }
            }
            return false;
        };
        Object.defineProperty(Pane.prototype, "mouseUp", {
            get: function () { return this._mouseUp; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseDown", {
            get: function () { return this._mouseDown; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseMove", {
            get: function () { return this._mouseMove; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseWheel", {
            get: function () { return this._mouseWheel; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseEnter", {
            get: function () { return this._mouseEnter; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "mouseExit", {
            get: function () { return this._mouseExit; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Pane.prototype, "contextMenu", {
            get: function () { return this._contextMenu; },
            enumerable: false,
            configurable: true
        });
        Pane.prototype.fireMouseUp = function (i, j, clickCount, mouseEvent) {
            return this._mouseUp.fire({ paneViewport: this._viewport.unmod, i: i, j: j, clickCount: clickCount, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireMouseDown = function (i, j, clickCount, mouseEvent) {
            return this._mouseDown.fire({ paneViewport: this._viewport.unmod, i: i, j: j, clickCount: clickCount, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireMouseMove = function (i, j, mouseEvent) {
            return this._mouseMove.fire({ paneViewport: this._viewport.unmod, i: i, j: j, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireMouseWheel = function (i, j, wheelSteps, mouseEvent) {
            return this._mouseWheel.fire({ paneViewport: this._viewport.unmod, i: i, j: j, wheelSteps: wheelSteps, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireMouseEnter = function (i, j, mouseEvent) {
            return this._mouseEnter.fire({ paneViewport: this._viewport.unmod, i: i, j: j, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireMouseExit = function (i, j, mouseEvent) {
            return this._mouseExit.fire({ paneViewport: this._viewport.unmod, i: i, j: j, mouseEvent: mouseEvent });
        };
        Pane.prototype.fireContextMenu = function (i, j, mouseEvent) {
            return this._contextMenu.fire({ paneViewport: this._viewport.unmod, i: i, j: j, mouseEvent: mouseEvent });
        };
        Object.defineProperty(Pane.prototype, "dispose", {
            // Disposal
            //
            get: function () {
                return this._dispose;
            },
            enumerable: false,
            configurable: true
        });
        return Pane;
    }());
    webglext.Pane = Pane;
    function requireGL(canvasElement) {
        // Wrapping the getContext calls in try-catch blocks may lose information. However,
        // there are two reasons to do so:
        //
        //   1. We want to try 'experimental-webgl' even if 'webgl' throws an error
        //   2. Throwing a custom error should make it easy to show a helpful message
        //
        // Reason 2 is particularly important on Firefox, where the error thrown by getContext
        // has a completely uninformative message.
        //
        try {
            var glA = canvasElement.getContext('webgl');
            if (glA)
                return glA;
        }
        catch (e) { }
        try {
            var glB = canvasElement.getContext('webgl2');
            if (glB)
                return glB;
        }
        catch (e) { }
        throw new Error('WebGLContextCreationError');
    }
    webglext.requireGL = requireGL;
    function iMouse(element, ev) {
        return (ev.clientX - element.getBoundingClientRect().left);
    }
    function jMouse(element, ev) {
        return (element.clientHeight - (ev.clientY - element.getBoundingClientRect().top));
    }
    function mouseWheelSteps(ev) {
        // Firefox puts the scroll amount in the 'detail' field; everybody else puts it in 'wheelDelta'
        // Firefox uses positive values for a downward scroll; everybody else uses positive for upward
        //var raw = ( ev.wheelDelta !== undefined ? ev.wheelDelta : -ev.detail );
        var raw = (ev.deltaY !== undefined ? ev.deltaY : -ev.detail);
        if (raw > 0) {
            return -1;
        }
        if (raw < 0) {
            return +1;
        }
        return 0;
    }
    // Button presses for mouse events are reported differently in different browsers:
    // The results below are for the following browser versions:
    // Chrome Version 40.0.2214.94 (64-bit)
    // Firefox 35.0.1
    // IE 11.0.9600.17501
    //
    // ‘mousemove’ event with left mouse button down:
    //
    //                        Chrome                Firefox                  IE
    // MouseEvent.button      0                     0                        0
    // MouseEvent.buttons     1                     1                        1
    // MouseEvent.which       1                     1                        1
    //
    // ‘mousemove’ event with no mouse button down:
    //
    //                        Chrome                Firefox                  IE
    // MouseEvent.button      0                     0                        0
    // MouseEvent.buttons     undefined             0                        0
    // MouseEvent.which       0                     1                        1
    //
    //
    // For more info see: http://stackoverflow.com/questions/3944122/detect-left-mouse-button-press
    //
    function isLeftMouseDown(ev) {
        // it appears that ev.buttons works across the board now, so ev.buttons === 1 is probably all that is necessary
        if (ev.buttons !== undefined) {
            return ev.buttons === 1;
        }
        else {
            return ev.which === 1;
        }
    }
    webglext.isLeftMouseDown = isLeftMouseDown;
    // detects whether any mouse button is down
    function isMouseDown(ev) {
        return ev.buttons !== 0;
    }
    webglext.isMouseDown = isMouseDown;
    function attachEventListeners(element, contentPane) {
        function detectEntersAndExits(oldPanes, newPanes, i, j, mouseEvent) {
            for (var n = 0; n < oldPanes.length; n++) {
                oldPanes[n]['isHovered'] = false;
            }
            for (var n = 0; n < newPanes.length; n++) {
                newPanes[n]['isHovered'] = true;
            }
            for (var n = 0; n < oldPanes.length; n++) {
                var oldPane = oldPanes[n];
                if (!oldPane['isHovered']) {
                    oldPane.fireMouseExit(i, j, mouseEvent);
                }
            }
            for (var n = 0; n < newPanes.length; n++) {
                newPanes[n]['wasHovered'] = false;
            }
            for (var n = 0; n < oldPanes.length; n++) {
                oldPanes[n]['wasHovered'] = true;
            }
            for (var n = 0; n < newPanes.length; n++) {
                var newPane = newPanes[n];
                if (!newPane['wasHovered']) {
                    newPane.fireMouseEnter(i, j, mouseEvent);
                }
            }
        }
        // Support for reporting click count. Browsers handle reporting single/double
        // clicks differently, so it's generally not a good idea to use both listeners
        // at one. That's why it's done this way instead of using the 'dblclick' event.
        var multiPressTimeout_MILLIS = 250;
        var prevPress_PMILLIS = 0;
        var clickCount = 1;
        var currentPanes = [];
        var currentMouseCursor = null;
        var dragging = false;
        var pendingExit = false;
        function refreshMouseCursor() {
            var newMouseCursor = null;
            for (var n = 0; n < currentPanes.length; n++) {
                newMouseCursor = currentPanes[n].mouseCursor;
                if (webglext.isNotEmpty(newMouseCursor))
                    break;
            }
            if (!webglext.isNotEmpty(newMouseCursor)) {
                newMouseCursor = 'default';
            }
            if (newMouseCursor !== currentMouseCursor) {
                element.style.cursor = newMouseCursor;
                currentMouseCursor = newMouseCursor;
            }
        }
        refreshMouseCursor();
        contentPane.mouseCursorChanged.on(refreshMouseCursor);
        element.addEventListener('mousedown', function (ev) {
            var press_PMILLIS = (new Date()).getTime();
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            if (press_PMILLIS - prevPress_PMILLIS < multiPressTimeout_MILLIS) {
                clickCount++;
            }
            else {
                clickCount = 1;
            }
            prevPress_PMILLIS = press_PMILLIS;
            var newPanes = contentPane.panesAt(i, j);
            detectEntersAndExits(currentPanes, newPanes, i, j, ev);
            currentPanes = newPanes;
            for (var n = 0; n < currentPanes.length; n++) {
                currentPanes[n].fireMouseDown(i, j, clickCount, ev);
            }
            refreshMouseCursor();
            dragging = true;
            // Disable browser-default double-click action, which selects text and messes up subsequent drags
            ev.preventDefault();
        });
        // Only want NON-DRAG moves from the canvas (e.g. we don't want moves that occur in an overlay div) -- so subscribe to CANVAS's mousemove
        element.addEventListener('mousemove', function (ev) {
            if (!dragging) {
                var i = iMouse(element, ev);
                var j = jMouse(element, ev);
                var newPanes = contentPane.panesAt(i, j);
                detectEntersAndExits(currentPanes, newPanes, i, j, ev);
                currentPanes = newPanes;
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
                refreshMouseCursor();
            }
        });
        // During a DRAG we want all move events, even ones that occur outside the canvas -- so subscribe to WINDOW's mousemove
        window.addEventListener('mousemove', function (ev) {
            if (dragging) {
                var i = iMouse(element, ev);
                var j = jMouse(element, ev);
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
            }
        });
        element.addEventListener('mouseout', function (ev) {
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            if (dragging) {
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
                pendingExit = true;
            }
            else {
                detectEntersAndExits(currentPanes, [], i, j, ev);
                currentPanes = [];
                refreshMouseCursor();
            }
        });
        element.addEventListener('mouseover', function (ev) {
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            if (dragging) {
                pendingExit = false;
            }
            else {
                var newPanes = contentPane.panesAt(i, j);
                detectEntersAndExits(currentPanes, newPanes, i, j, ev);
                currentPanes = newPanes;
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
                refreshMouseCursor();
            }
        });
        var endDrag = function (ev) {
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            for (var n = 0; n < currentPanes.length; n++) {
                currentPanes[n].fireMouseUp(i, j, clickCount, ev);
            }
            dragging = false;
            if (pendingExit) {
                detectEntersAndExits(currentPanes, [], i, j, ev);
                currentPanes = [];
                pendingExit = false;
                refreshMouseCursor();
            }
            else {
                var newPanes = contentPane.panesAt(i, j);
                detectEntersAndExits(currentPanes, newPanes, i, j, ev);
                currentPanes = newPanes;
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
                refreshMouseCursor();
            }
        };
        // The window always gets the mouse-up event at the end of a drag -- even if it occurs outside the browser window
        window.addEventListener('mouseup', function (ev) {
            if (dragging) {
                endDrag(ev);
            }
        });
        // We don't receive mouse events that happen over another iframe -- even during a drag. If we miss a mouseup that
        // should terminate a drag, we end up stuck in dragging mode, which makes for a really lousy user experience. To
        // avoid that, whenever the mouse moves, check whether the button is down. If we're still in dragging mode, but
        // the button is now up, end the drag. 
        // If we're dragging, and we see a mousemove with no buttons down, end the drag
        var recentDrag = null;
        var handleMissedMouseUp = function (ev) {
            if (dragging) {
                if (!isMouseDown(ev) && recentDrag) {
                    var mouseUp = document.createEvent('MouseEvents');
                    mouseUp.initMouseEvent('mouseup', true, true, window, 0, recentDrag.screenX, recentDrag.screenY, ev.screenX - window.screenX, ev.screenY - window.screenY, recentDrag.ctrlKey, recentDrag.altKey, recentDrag.shiftKey, recentDrag.metaKey, 0, null);
                    endDrag(mouseUp);
                }
                recentDrag = ev;
            }
        };
        window.addEventListener('mousemove', handleMissedMouseUp);
        var w = window;
        while (w.parent !== w) {
            try {
                w.parent.addEventListener('mousemove', handleMissedMouseUp);
                //  w = w.parent; //B2PB2P
            }
            catch (e) {
                // Cross-origin security may prevent us from adding a listener to a window other than our own -- in that case,
                // the least bad option is to terminate drags on exit from the highest accessible window
                w.addEventListener('mouseout', function (ev) {
                    if (dragging) {
                        var mouseUp = document.createEvent('MouseEvents');
                        mouseUp.initMouseEvent('mouseup', true, true, window, 0, ev.screenX, ev.screenY, ev.screenX - window.screenX, ev.screenY - window.screenY, ev.ctrlKey, ev.altKey, ev.shiftKey, ev.metaKey, 0, null);
                        endDrag(mouseUp);
                    }
                });
                break;
            }
        }
        // Firefox uses event type 'DOMMouseScroll' for mouse-wheel events; everybody else uses 'mousewheel'
        var handleMouseWheel = function (ev) {
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            if (dragging) {
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
            }
            else {
                var newPanes = contentPane.panesAt(i, j);
                detectEntersAndExits(currentPanes, newPanes, i, j, ev);
                currentPanes = newPanes;
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
            }
            var wheelSteps = mouseWheelSteps(ev);
            for (var n = 0; n < currentPanes.length; n++) {
                currentPanes[n].fireMouseWheel(i, j, wheelSteps, ev);
            }
        };
        element.addEventListener('mousewheel', handleMouseWheel);
        element.addEventListener('DOMMouseScroll', handleMouseWheel, false);
        element.addEventListener('contextmenu', function (ev) {
            var i = iMouse(element, ev);
            var j = jMouse(element, ev);
            if (dragging) {
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
            }
            else {
                var newPanes = contentPane.panesAt(i, j);
                detectEntersAndExits(currentPanes, newPanes, i, j, ev);
                currentPanes = newPanes;
                for (var n = 0; n < currentPanes.length; n++) {
                    currentPanes[n].fireMouseMove(i, j, ev);
                }
                refreshMouseCursor();
            }
            for (var n = 0; n < currentPanes.length; n++) {
                currentPanes[n].fireContextMenu(i, j, ev);
            }
            // Disable browser-default context menu
            ev.preventDefault();
        });
    }
    function newDrawable(canvas) {
        var contentPane = null;
        var contentPrefSizeNotification = new webglext.Notification1();
        var contentPrefSize = { w: null, h: null };
        var contentViewport = webglext.newBoundsFromRect(0, 0, 0, 0);
        var gl = requireGL(canvas);
        var pendingRequestId = null;
        return {
            setContentPane: function (pane) {
                if (webglext.isNotEmpty(contentPane)) {
                    // XXX: Detach listeners from old contentPane
                }
                contentPane = pane;
                attachEventListeners(canvas, contentPane);
            },
            redraw: function () {
                if (!webglext.isNotEmpty(pendingRequestId)) {
                    pendingRequestId = window.requestAnimationFrame(function () {
                        if (webglext.isNotEmpty(contentPane)) {
                            var oldPrefSize = { w: contentPrefSize.w, h: contentPrefSize.h };
                            contentPane.updatePrefSizes(contentPrefSize);
                            contentViewport.setRect(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                            contentPane.updateBounds(contentViewport.unmod, contentViewport.unmod);
                            contentPane.paint(gl);
                            // XXX: Trigger an enter/exit check somehow (fake a mouse-event?)
                        }
                        pendingRequestId = null;
                        if (oldPrefSize.w !== contentPrefSize.w || oldPrefSize.h !== contentPrefSize.h) {
                            contentPrefSizeNotification.fire({ w: contentPrefSize.w, h: contentPrefSize.h });
                        }
                    });
                }
            },
            getPrefSize: function () {
                return { w: contentPrefSize.w, h: contentPrefSize.h };
            },
            prefSizeChanged: function () {
                return contentPrefSizeNotification;
            }
        };
    }
    webglext.newDrawable = newDrawable;
})(webglext || (webglext = {}));
//# sourceMappingURL=core.js.map