var webglext;
(function (webglext) {
    function newGroupPainter() {
        var painters = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            painters[_i] = arguments[_i];
        }
        return function (gl, viewport) {
            for (var n = 0; n < painters.length; n++) {
                painters[n](gl, viewport);
            }
        };
    }
    webglext.newGroupPainter = newGroupPainter;
    function newBlendingBackgroundPainter(color) {
        var program = new webglext.Program(webglext.xyNdc_VERTSHADER, webglext.solid_FRAGSHADER);
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        var a_XyNdc = new webglext.Attribute(program, 'a_XyNdc');
        var numVertices = 4;
        var xy_NDC = new Float32Array(2 * numVertices);
        var xyBuffer_NDC = webglext.newDynamicBuffer();
        return function (gl) {
            if (color.a >= 1) {
                gl.disable(webglext.GL.BLEND);
            }
            else {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
            }
            program.use(gl);
            u_Color.setData(gl, color);
            xy_NDC[0] = -1;
            xy_NDC[1] = 1;
            xy_NDC[2] = -1;
            xy_NDC[3] = -1;
            xy_NDC[4] = 1;
            xy_NDC[5] = 1;
            xy_NDC[6] = 1;
            xy_NDC[7] = -1;
            xyBuffer_NDC.setData(xy_NDC);
            a_XyNdc.setDataAndEnable(gl, xyBuffer_NDC, 2, webglext.GL.FLOAT);
            gl.drawArrays(webglext.GL.TRIANGLE_STRIP, 0, numVertices);
            a_XyNdc.disable(gl);
            program.endUse(gl);
        };
    }
    webglext.newBlendingBackgroundPainter = newBlendingBackgroundPainter;
    var Background = /** @class */ (function () {
        function Background(color) {
            this._color = color;
        }
        Object.defineProperty(Background.prototype, "color", {
            get: function () {
                return this._color;
            },
            set: function (color) {
                if (!webglext.sameColor(this._color, color)) {
                    this._color = color;
                }
            },
            enumerable: false,
            configurable: true
        });
        Background.prototype.newPainter = function () {
            var background = this;
            return function (gl, viewport) {
                if (webglext.isNotEmpty(background.color)) {
                    gl.clearColor(background.color.r, background.color.g, background.color.b, background.color.a);
                    gl.clear(webglext.GL.COLOR_BUFFER_BIT);
                }
            };
        };
        return Background;
    }());
    webglext.Background = Background;
    function newBackgroundPainter(color) {
        return function (gl) {
            gl.clearColor(color.r, color.g, color.b, color.a);
            gl.clear(webglext.GL.COLOR_BUFFER_BIT);
        };
    }
    webglext.newBackgroundPainter = newBackgroundPainter;
    function newTexturePainter(texture, xFrac, yFrac, options) {
        var textureRenderer = new webglext.TextureRenderer();
        return function (gl, viewport) {
            textureRenderer.begin(gl, viewport);
            textureRenderer.draw(gl, texture, xFrac, yFrac, options);
            textureRenderer.end(gl);
        };
    }
    webglext.newTexturePainter = newTexturePainter;
    function newSolidPane(color) {
        var pane = new webglext.Pane(null);
        pane.addPainter(newBackgroundPainter(color));
        return pane;
    }
    webglext.newSolidPane = newSolidPane;
    function fitToTexture(texture) {
        return function (parentPrefSize) {
            parentPrefSize.w = texture.w;
            parentPrefSize.h = texture.h;
        };
    }
    webglext.fitToTexture = fitToTexture;
    function fixedSize(w, h) {
        return function (parentPrefSize) {
            parentPrefSize.w = w;
            parentPrefSize.h = h;
        };
    }
    webglext.fixedSize = fixedSize;
    /**
     * Takes (x,y) in NDC (Normalized Device Coords), in attribute a_XyNdc
     */
    webglext.xyNdc_VERTSHADER = webglext.concatLines('                                                ', '  attribute vec2 a_XyNdc;                       ', '                                                ', '  void main( ) {                                ', '      gl_Position = vec4( a_XyNdc, 0.0, 1.0 );  ', '  }                                             ', '                                                ');
    /**
     * Takes (x,y) as fractions of the viewport, in attribute a_XyFrac
     */
    webglext.xyFrac_VERTSHADER = webglext.concatLines('                                                                ', '  attribute vec2 a_XyFrac;                                      ', '                                                                ', '  void main( ) {                                                ', '      gl_Position = vec4( ( -1.0 + 2.0*a_XyFrac ), 0.0, 1.0 );  ', '  }                                                             ', '                                                                ');
    webglext.solid_FRAGSHADER = webglext.concatLines('                               ', '  precision lowp float;        ', '  uniform vec4 u_Color;        ', '                               ', '  void main( ) {               ', '      gl_FragColor = u_Color;  ', '  }                            ', '                               ');
    webglext.varyingColor_FRAGSHADER = webglext.concatLines('                               ', '  precision lowp float;        ', '  varying vec4 v_Color;        ', '                               ', '  void main( ) {               ', '      gl_FragColor = v_Color;  ', '  }                            ', '                               ');
    webglext.modelview_VERTSHADER = webglext.concatLines('    uniform mat4 u_modelViewMatrix;                       ', '    attribute vec4 a_Position;                            ', '                                                          ', '    void main( ) {                                        ', '        gl_Position = u_modelViewMatrix * a_Position ;    ', '    }                                                     ', '                                                          ');
    webglext.nearestPixelCenter_GLSLFUNC = webglext.concatLines('                                                                    ', '  float nearestPixelCenter( float frac, float pixelSize ) {         ', '      return ( floor( frac*pixelSize + 1e-4 ) + 0.5 ) / pixelSize;  ', '  }                                                                 ', '                                                                    ');
    var Side;
    (function (Side) {
        Side[Side["TOP"] = 0] = "TOP";
        Side[Side["BOTTOM"] = 1] = "BOTTOM";
        Side[Side["RIGHT"] = 2] = "RIGHT";
        Side[Side["LEFT"] = 3] = "LEFT";
    })(Side = webglext.Side || (webglext.Side = {}));
    /**
     * Converts viewport-fraction to NDC (Normalized Device Coords)
     */
    function fracToNdc(frac) {
        return -1 + 2 * frac;
    }
    webglext.fracToNdc = fracToNdc;
    function nearestPixel(viewportFrac, viewportSize, imageAnchor, imageSize) {
        var anchor = (imageAnchor * imageSize) % 1.0;
        return (Math.floor(viewportFrac * viewportSize - anchor + 0.5 + 1e-4) + anchor) / viewportSize;
    }
    webglext.nearestPixel = nearestPixel;
    function putQuadXys(xys, index, xLeft, xRight, yTop, yBottom) {
        var n = index;
        n = putUpperLeftTriangleXys(xys, n, xLeft, xRight, yTop, yBottom);
        n = putLowerRightTriangleXys(xys, n, xLeft, xRight, yTop, yBottom);
        return n;
    }
    webglext.putQuadXys = putQuadXys;
    function putUpperLeftTriangleXys(xys, index, xLeft, xRight, yTop, yBottom) {
        var n = index;
        xys[n++] = xLeft;
        xys[n++] = yTop;
        xys[n++] = xRight;
        xys[n++] = yTop;
        xys[n++] = xLeft;
        xys[n++] = yBottom;
        return n;
    }
    webglext.putUpperLeftTriangleXys = putUpperLeftTriangleXys;
    function putLowerRightTriangleXys(xys, index, xLeft, xRight, yTop, yBottom) {
        var n = index;
        xys[n++] = xLeft;
        xys[n++] = yBottom;
        xys[n++] = xRight;
        xys[n++] = yTop;
        xys[n++] = xRight;
        xys[n++] = yBottom;
        return n;
    }
    webglext.putLowerRightTriangleXys = putLowerRightTriangleXys;
    function putUpperRightTriangleXys(xys, index, xLeft, xRight, yTop, yBottom) {
        var n = index;
        xys[n++] = xLeft;
        xys[n++] = yTop;
        xys[n++] = xRight;
        xys[n++] = yTop;
        xys[n++] = xRight;
        xys[n++] = yBottom;
        return n;
    }
    webglext.putUpperRightTriangleXys = putUpperRightTriangleXys;
    function putLowerLeftTriangleXys(xys, index, xLeft, xRight, yTop, yBottom) {
        var n = index;
        xys[n++] = xLeft;
        xys[n++] = yBottom;
        xys[n++] = xLeft;
        xys[n++] = yTop;
        xys[n++] = xRight;
        xys[n++] = yBottom;
        return n;
    }
    webglext.putLowerLeftTriangleXys = putLowerLeftTriangleXys;
    function putQuadRgbas(rgbas, index, color) {
        return putRgbas(rgbas, index, color, 6);
    }
    webglext.putQuadRgbas = putQuadRgbas;
    function putRgbas(rgbas, index, color, count) {
        var n = index;
        for (var v = 0; v < count; v++) {
            rgbas[n++] = color.r;
            rgbas[n++] = color.g;
            rgbas[n++] = color.b;
            rgbas[n++] = color.a;
        }
        return n;
    }
    webglext.putRgbas = putRgbas;
    function clearSelection() {
        var selection = window.getSelection();
        if (selection) {
            if (selection['removeAllRanges']) {
                selection['removeAllRanges']();
            }
            else if (selection['empty']) {
                selection['empty']();
            }
        }
    }
    webglext.clearSelection = clearSelection;
    var SimpleModel = /** @class */ (function () {
        function SimpleModel(value) {
            if (value === void 0) { value = null; }
            this._value = value;
            this._changed = new webglext.Notification();
        }
        Object.defineProperty(SimpleModel.prototype, "value", {
            get: function () { return this._value; },
            set: function (value) {
                if (value !== this._value) {
                    this._value = value;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(SimpleModel.prototype, "changed", {
            get: function () { return this._changed; },
            enumerable: false,
            configurable: true
        });
        return SimpleModel;
    }());
    webglext.SimpleModel = SimpleModel;
    var XyModel = /** @class */ (function () {
        function XyModel(x, y) {
            this._x = x;
            this._y = y;
            this._changed = new webglext.Notification();
        }
        Object.defineProperty(XyModel.prototype, "x", {
            get: function () { return this._x; },
            set: function (x) {
                if (x !== this._x) {
                    this._x = x;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(XyModel.prototype, "y", {
            get: function () { return this._y; },
            set: function (y) {
                if (y !== this._y) {
                    this._y = y;
                    this._changed.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(XyModel.prototype, "changed", {
            get: function () { return this._changed; },
            enumerable: false,
            configurable: true
        });
        XyModel.prototype.setXy = function (x, y) {
            if (x !== this._x || y !== this._y) {
                this._x = x;
                this._y = y;
                this._changed.fire();
            }
        };
        return XyModel;
    }());
    webglext.XyModel = XyModel;
})(webglext || (webglext = {}));
//# sourceMappingURL=misc.js.map