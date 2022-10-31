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
    function compileShader(gl, shaderType, glsl) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, glsl);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, webglext.GL.COMPILE_STATUS))
            throw new Error(gl.getShaderInfoLog(shader));
        return shader;
    }
    function linkProgram(gl, shaders) {
        var program = gl.createProgram();
        for (var i = 0; i < shaders.length; i++) {
            gl.attachShader(program, shaders[i]);
        }
        try {
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, webglext.GL.LINK_STATUS))
                throw new Error(gl.getProgramInfoLog(program));
            return program;
        }
        finally {
        }
    }
    function createProgram(gl, vertShaderSource, fragShaderSource) {
        var shaders = [];
        try {
            shaders.push(compileShader(gl, webglext.GL.VERTEX_SHADER, vertShaderSource));
            shaders.push(compileShader(gl, webglext.GL.FRAGMENT_SHADER, fragShaderSource));
            return linkProgram(gl, shaders);
        }
        finally {
        }
    }
    var ProgramEntry = /** @class */ (function () {
        function ProgramEntry(gl, program) {
            this.gl = gl;
            this.program = program;
        }
        return ProgramEntry;
    }());
    var Program = /** @class */ (function () {
        function Program(vertShaderSource, fragShaderSource) {
            this.programs = {};
            this.vertShaderSource = vertShaderSource;
            this.fragShaderSource = fragShaderSource;
        }
        // XXX: Would be nice if this weren't public
        Program.prototype._program = function (gl) {
            var glId = webglext.getObjectId(gl);
            if (this.programs[glId] === undefined) {
                var program = createProgram(gl, this.vertShaderSource, this.fragShaderSource);
                this.programs[glId] = new ProgramEntry(gl, program);
            }
            return this.programs[glId].program;
        };
        Program.prototype.use = function (gl) {
            gl.useProgram(this._program(gl));
        };
        Program.prototype.endUse = function (gl) {
            gl.useProgram(null);
        };
        Program.prototype.dispose = function () {
            // XXX: Not sure this actually works ... may have to make each gl current or something
            for (var glid in this.programs) {
                if (this.programs.hasOwnProperty(glid)) {
                    var en = this.programs[glid];
                    en.gl.deleteProgram(en.program);
                }
            }
            this.programs = {};
        };
        return Program;
    }());
    webglext.Program = Program;
    var Uniform = /** @class */ (function () {
        function Uniform(program, name, optional) {
            this.locations = {};
            this.program = program;
            this.name = name;
            this.optional = optional;
        }
        // XXX: Would be nice if this weren't public
        Uniform.prototype._location = function (gl) {
            var glId = webglext.getObjectId(gl);
            if (this.locations[glId] === undefined) {
                var location = gl.getUniformLocation(this.program._program(gl), this.name);
                if (!this.optional && !webglext.isNotEmpty(location))
                    throw new Error('Uniform \'' + this.name + '\' not found');
                this.locations[glId] = location;
            }
            return this.locations[glId];
        };
        return Uniform;
    }());
    webglext.Uniform = Uniform;
    var Uniform1f = /** @class */ (function (_super) {
        __extends(Uniform1f, _super);
        function Uniform1f(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform1f.prototype.setData = function (gl, x) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform1f(location, x);
        };
        return Uniform1f;
    }(Uniform));
    webglext.Uniform1f = Uniform1f;
    var Uniform2f = /** @class */ (function (_super) {
        __extends(Uniform2f, _super);
        function Uniform2f(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform2f.prototype.setData = function (gl, x, y) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform2f(location, x, y);
        };
        return Uniform2f;
    }(Uniform));
    webglext.Uniform2f = Uniform2f;
    var Uniform3f = /** @class */ (function (_super) {
        __extends(Uniform3f, _super);
        function Uniform3f(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform3f.prototype.setData = function (gl, x, y, z) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform3f(location, x, y, z);
        };
        return Uniform3f;
    }(Uniform));
    webglext.Uniform3f = Uniform3f;
    var Uniform4f = /** @class */ (function (_super) {
        __extends(Uniform4f, _super);
        function Uniform4f(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform4f.prototype.setData = function (gl, x, y, z, w) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform4f(location, x, y, z, w);
        };
        return Uniform4f;
    }(Uniform));
    webglext.Uniform4f = Uniform4f;
    var UniformMatrix4f = /** @class */ (function (_super) {
        __extends(UniformMatrix4f, _super);
        function UniformMatrix4f(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        UniformMatrix4f.prototype.setData = function (gl, value, transpose) {
            if (transpose === void 0) { transpose = false; }
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniformMatrix4fv(location, transpose, value);
        };
        return UniformMatrix4f;
    }(Uniform));
    webglext.UniformMatrix4f = UniformMatrix4f;
    var Uniform1i = /** @class */ (function (_super) {
        __extends(Uniform1i, _super);
        function Uniform1i(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform1i.prototype.setData = function (gl, x) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform1i(location, x);
        };
        return Uniform1i;
    }(Uniform));
    webglext.Uniform1i = Uniform1i;
    var Uniform2i = /** @class */ (function (_super) {
        __extends(Uniform2i, _super);
        function Uniform2i(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform2i.prototype.setData = function (gl, x, y) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform2i(location, x, y);
        };
        return Uniform2i;
    }(Uniform));
    webglext.Uniform2i = Uniform2i;
    var Uniform3i = /** @class */ (function (_super) {
        __extends(Uniform3i, _super);
        function Uniform3i(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform3i.prototype.setData = function (gl, x, y, z) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform3i(location, x, y, z);
        };
        return Uniform3i;
    }(Uniform));
    webglext.Uniform3i = Uniform3i;
    var Uniform4i = /** @class */ (function (_super) {
        __extends(Uniform4i, _super);
        function Uniform4i(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        Uniform4i.prototype.setData = function (gl, x, y, z, w) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform4i(location, x, y, z, w);
        };
        return Uniform4i;
    }(Uniform));
    webglext.Uniform4i = Uniform4i;
    var UniformColor = /** @class */ (function (_super) {
        __extends(UniformColor, _super);
        function UniformColor(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        UniformColor.prototype.setData = function (gl, color) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location))
                gl.uniform4f(location, color.r, color.g, color.b, color.a);
        };
        return UniformColor;
    }(Uniform));
    webglext.UniformColor = UniformColor;
    var UniformSampler2D = /** @class */ (function (_super) {
        __extends(UniformSampler2D, _super);
        function UniformSampler2D(program, name, optional) {
            if (optional === void 0) { optional = false; }
            return _super.call(this, program, name, optional) || this;
        }
        UniformSampler2D.prototype.setDataAndBind = function (gl, textureUnit, texture) {
            var location = this._location(gl);
            if (webglext.isNotEmpty(location)) {
                texture.bind(gl, textureUnit);
                gl.uniform1i(location, textureUnit);
                this.currentTexture = texture;
            }
        };
        UniformSampler2D.prototype.unbind = function (gl) {
            if (webglext.isNotEmpty(this.currentTexture)) {
                this.currentTexture.unbind(gl);
                this.currentTexture = null;
            }
        };
        return UniformSampler2D;
    }(Uniform));
    webglext.UniformSampler2D = UniformSampler2D;
    var Attribute = /** @class */ (function () {
        function Attribute(program, name) {
            this.locations = {};
            this.program = program;
            this.name = name;
        }
        // XXX: Would be nice if this weren't public
        Attribute.prototype._location = function (gl) {
            var glId = webglext.getObjectId(gl);
            if (this.locations[glId] === undefined) {
                var location = gl.getAttribLocation(this.program._program(gl), this.name);
                if (location === -1)
                    throw new Error('Attribute "' + this.name + '" not found');
                this.locations[glId] = location;
            }
            return this.locations[glId];
        };
        Attribute.prototype.setDataAndEnable = function (gl, buffer, size, type, normalized, stride, offset) {
            if (normalized === void 0) { normalized = false; }
            if (stride === void 0) { stride = 0; }
            if (offset === void 0) { offset = 0; }
            var location = this._location(gl);
            gl.enableVertexAttribArray(location);
            buffer.bind(gl, webglext.GL.ARRAY_BUFFER);
            gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
            buffer.unbind(gl, webglext.GL.ARRAY_BUFFER);
        };
        Attribute.prototype.disable = function (gl) {
            gl.disableVertexAttribArray(this._location(gl));
        };
        return Attribute;
    }());
    webglext.Attribute = Attribute;
})(webglext || (webglext = {}));
//# sourceMappingURL=shader.js.map