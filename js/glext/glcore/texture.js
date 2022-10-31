/* this is the module for texture*/
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
    var TextureEntry = /** @class */ (function () {
        function TextureEntry(gl, target, texture) {
            this.gl = gl;
            this.target = target;
            this.texture = texture;
            this.textureUnit = -1;
        }
        return TextureEntry;
    }());
    var Texture = /** @class */ (function () {
        function Texture(helper) {
            this.helper = helper;
            this.textures = {};
        }
        Texture.prototype.bind = function (gl, textureUnit) {
            var glId = webglext.getObjectId(gl);
            if (webglext.isNotEmpty(this.textures[glId])) {
                var en = this.textures[glId];
                gl.activeTexture(webglext.GL.TEXTURE0 + textureUnit);
                gl.bindTexture(en.target, en.texture);
                en.textureUnit = textureUnit;
            }
            else {
                var target = this.helper.target(gl);
                var texture = gl.createTexture();
                if (!webglext.isNotEmpty(texture))
                    throw new Error('Failed to create texture');
                this.textures[glId] = new TextureEntry(gl, target, texture);
                var en = this.textures[glId];
                gl.activeTexture(webglext.GL.TEXTURE0 + textureUnit);
                gl.bindTexture(en.target, en.texture);
                en.textureUnit = textureUnit;
                this.helper.init(gl, target);
            }
        };
        Texture.prototype.unbind = function (gl) {
            var glId = webglext.getObjectId(gl);
            if (webglext.isNotEmpty(this.textures[glId])) {
                var en = this.textures[glId];
                gl.activeTexture(webglext.GL.TEXTURE0 + en.textureUnit);
                gl.bindTexture(en.target, null);
                en.textureUnit = -1;
            }
        };
        Texture.prototype.dispose = function () {
            for (var glid in this.textures) {
                if (this.textures.hasOwnProperty(glid)) {
                    var en = this.textures[glid];
                    en.gl.deleteTexture(en.texture);
                }
            }
            this.textures = {};
        };
        return Texture;
    }());
    webglext.Texture = Texture;
    var FloatDataTexture2D = /** @class */ (function (_super) {
        __extends(FloatDataTexture2D, _super);
        function FloatDataTexture2D(w, h, array) {
            var _this = _super.call(this, {
                target: function (gl) {
                    return webglext.GL.TEXTURE_2D;
                },
                init: function (gl, target) {
                    if (!gl.getExtension('OES_texture_float')) {
                        throw new Error('OES_texture_float extension is required');
                    }
                    gl.texParameteri(target, webglext.GL.TEXTURE_MAG_FILTER, webglext.GL.NEAREST);
                    gl.texParameteri(target, webglext.GL.TEXTURE_MIN_FILTER, webglext.GL.NEAREST);
                    gl.texParameteri(target, webglext.GL.TEXTURE_WRAP_S, webglext.GL.CLAMP_TO_EDGE);
                    gl.texParameteri(target, webglext.GL.TEXTURE_WRAP_T, webglext.GL.CLAMP_TO_EDGE);
                    // GL.LUMINANCE isn't supported with GL.FLOAT
                    gl.texImage2D(target, 0, webglext.GL.RGBA, w, h, 0, webglext.GL.RGBA, webglext.GL.FLOAT, array);
                }
            }) || this;
            _this._w = w;
            _this._h = h;
            return _this;
        }
        Object.defineProperty(FloatDataTexture2D.prototype, "w", {
            get: function () { return this._w; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(FloatDataTexture2D.prototype, "h", {
            get: function () { return this._h; },
            enumerable: false,
            configurable: true
        });
        return FloatDataTexture2D;
    }(Texture));
    webglext.FloatDataTexture2D = FloatDataTexture2D;
    var Texture2D = /** @class */ (function (_super) {
        __extends(Texture2D, _super);
        function Texture2D(w, h, minFilter, magFilter, draw) {
            var _this = this;
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            draw(canvas.getContext('2d'));
            _this = _super.call(this, {
                target: function (gl) {
                    return webglext.GL.TEXTURE_2D;
                },
                init: function (gl, target) {
                    gl.texParameteri(target, webglext.GL.TEXTURE_MAG_FILTER, magFilter);
                    gl.texParameteri(target, webglext.GL.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(target, webglext.GL.TEXTURE_WRAP_S, webglext.GL.CLAMP_TO_EDGE);
                    gl.texParameteri(target, webglext.GL.TEXTURE_WRAP_T, webglext.GL.CLAMP_TO_EDGE);
                    gl.texImage2D(target, 0, webglext.GL.RGBA, webglext.GL.RGBA, webglext.GL.UNSIGNED_BYTE, canvas);
                }
            }) || this;
            _this._w = w;
            _this._h = h;
            return _this;
        }
        Object.defineProperty(Texture2D.prototype, "w", {
            get: function () { return this._w; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Texture2D.prototype, "h", {
            get: function () { return this._h; },
            enumerable: false,
            configurable: true
        });
        return Texture2D;
    }(Texture));
    webglext.Texture2D = Texture2D;
    var TextureRenderer = /** @class */ (function () {
        function TextureRenderer() {
            this.textureRenderer_VERTSHADER = webglext.concatLines('                                                                                                                 ', '  uniform vec2 u_XyFrac;                                                                                         ', '  uniform vec2 u_Anchor;                                                                                         ', '  uniform float u_Rotation_CCWRAD;                                                                               ', '  uniform vec2 u_ImageSize;                                                                                      ', '  uniform vec2 u_ViewportSize;                                                                                   ', '                                                                                                                 ', '  attribute vec2 a_ImageFrac;                                                                                    ', '                                                                                                                 ', '  varying vec2 v_StCoord;                                                                                        ', '                                                                                                                 ', '  void main( ) {                                                                                                 ', '      float cosRot = cos( u_Rotation_CCWRAD );                                                                   ', '      float sinRot = sin( u_Rotation_CCWRAD );                                                                   ', '                                                                                                                 ', '      // Column major                                                                                            ', '      mat2 rotation = mat2( cosRot, sinRot,                                                                      ', '                           -sinRot, cosRot );                                                                    ', '                                                                                                                 ', '      vec2 xy = -1.0 + 2.0*( u_XyFrac + rotation*( u_ImageSize*( a_ImageFrac - u_Anchor ) ) / u_ViewportSize );  ', '      gl_Position = vec4( xy, 0.0, 1.0 );                                                                        ', '                                                                                                                 ', '      v_StCoord = vec2( a_ImageFrac.x, 1.0 - a_ImageFrac.y );                                                    ', '  }                                                                                                              ', '                                                                                                                 ');
            this.textureRenderer_FRAGSHADER = webglext.concatLines('                                                         ', '  precision mediump float;                               ', '                                                         ', '  uniform sampler2D u_Sampler;                           ', '                                                         ', '  varying vec2 v_StCoord;                                ', '                                                         ', '  void main( ) {                                         ', '      gl_FragColor = texture2D( u_Sampler, v_StCoord );  ', '  }                                                      ', '                                                         ');
            this.program = new webglext.Program(this.textureRenderer_VERTSHADER, this.textureRenderer_FRAGSHADER);
            this.u_XyFrac = new webglext.Uniform2f(this.program, 'u_XyFrac');
            this.u_Anchor = new webglext.Uniform2f(this.program, 'u_Anchor');
            this.u_Rotation_CCWRAD = new webglext.Uniform1f(this.program, 'u_Rotation_CCWRAD');
            this.u_ImageSize = new webglext.Uniform2f(this.program, 'u_ImageSize');
            this.u_ViewportSize = new webglext.Uniform2f(this.program, 'u_ViewportSize');
            this.u_Sampler = new webglext.UniformSampler2D(this.program, 'u_Sampler');
            this.a_ImageFrac = new webglext.Attribute(this.program, 'a_ImageFrac');
            this.imageFracData = webglext.newStaticBuffer(new Float32Array([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]));
            this.wViewport = 0;
            this.hViewport = 0;
        }
        TextureRenderer.prototype.begin = function (gl, viewport) {
            gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
            gl.enable(webglext.GL.BLEND);
            this.program.use(gl);
            this.u_ViewportSize.setData(gl, viewport.w, viewport.h);
            this.a_ImageFrac.setDataAndEnable(gl, this.imageFracData, 2, webglext.GL.FLOAT);
            this.wViewport = viewport.w;
            this.hViewport = viewport.h;
        };
        TextureRenderer.prototype.draw = function (gl, texture, xFrac, yFrac, options) {
            var xAnchor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.xAnchor) ? options.xAnchor : 0.5);
            var yAnchor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.yAnchor) ? options.yAnchor : 0.5);
            var rotation_CCWRAD = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.rotation_CCWRAD) ? options.rotation_CCWRAD : 0);
            var width = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.width) ? options.width : texture.w);
            var height = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.height) ? options.height : texture.h);
            this.u_XyFrac.setData(gl, webglext.nearestPixel(xFrac, this.wViewport, xAnchor, texture.w), webglext.nearestPixel(yFrac, this.hViewport, yAnchor, texture.h));
            this.u_Anchor.setData(gl, xAnchor, yAnchor);
            this.u_Rotation_CCWRAD.setData(gl, rotation_CCWRAD);
            this.u_ImageSize.setData(gl, width, height);
            this.u_Sampler.setDataAndBind(gl, 0, texture);
            gl.drawArrays(webglext.GL.TRIANGLE_STRIP, 0, 4);
        };
        TextureRenderer.prototype.end = function (gl) {
            this.a_ImageFrac.disable(gl);
            this.u_Sampler.unbind(gl);
            this.program.endUse(gl);
        };
        return TextureRenderer;
    }());
    webglext.TextureRenderer = TextureRenderer;
})(webglext || (webglext = {}));
//# sourceMappingURL=texture.js.map