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
    function newStaticBuffer(data) {
        return new StaticBufferImpl(data);
    }
    webglext.newStaticBuffer = newStaticBuffer;
    function newDynamicBuffer(data) {
        if (data === void 0) { data = new Float32Array(0); }
        return new DynamicBufferImpl(data);
    }
    webglext.newDynamicBuffer = newDynamicBuffer;
    var BufferEntry = /** @class */ (function () {
        function BufferEntry(gl, buffer) {
            this.capacity = 0;
            this.marker = null;
            this.gl = gl;
            this.buffer = buffer;
        }
        return BufferEntry;
    }());
    var AbstractBuffer = /** @class */ (function () {
        function AbstractBuffer() {
            this.buffers = {};
            this.currentMarker = 0;
        }
        AbstractBuffer.prototype.init = function (gl, target) {
            throw new Error('Method is abstract');
        };
        AbstractBuffer.prototype.update = function (gl, target, capacity) {
            throw new Error('Method is abstract');
        };
        AbstractBuffer.prototype.setDirty = function () {
            this.currentMarker++;
        };
        AbstractBuffer.prototype.bind = function (gl, target) {
            var glId = webglext.getObjectId(gl);
            if (this.buffers[glId] === undefined) {
                var buffer = gl.createBuffer();
                if (!webglext.isNotEmpty(buffer))
                    throw new Error('Failed to create buffer');
                this.buffers[glId] = new BufferEntry(gl, buffer);
                gl.bindBuffer(target, this.buffers[glId].buffer);
                this.buffers[glId].capacity = this.init(gl, target);
                this.buffers[glId].marker = this.currentMarker;
            }
            else if (this.buffers[glId].marker !== this.currentMarker) {
                gl.bindBuffer(target, this.buffers[glId].buffer);
                this.buffers[glId].capacity = this.update(gl, target, this.buffers[glId].capacity);
                this.buffers[glId].marker = this.currentMarker;
            }
            else {
                gl.bindBuffer(target, this.buffers[glId].buffer);
            }
        };
        AbstractBuffer.prototype.unbind = function (gl, target) {
            gl.bindBuffer(target, null);
        };
        AbstractBuffer.prototype.dispose = function () {
            for (var glid in this.buffers) {
                if (this.buffers.hasOwnProperty(glid)) {
                    var en = this.buffers[glid];
                    en.gl.deleteBuffer(en.buffer);
                }
            }
            this.buffers = {};
        };
        return AbstractBuffer;
    }());
    var StaticBufferImpl = /** @class */ (function (_super) {
        __extends(StaticBufferImpl, _super);
        function StaticBufferImpl(data) {
            var _this = _super.call(this) || this;
            _this._data = data;
            return _this;
        }
        StaticBufferImpl.prototype.init = function (gl, target) {
            gl.bufferData(target, this._data, webglext.GL.STATIC_DRAW);
            return this._data.byteLength;
        };
        StaticBufferImpl.prototype.update = function (gl, target, capacity) {
            throw new Error('This buffer need not to update because it is STATIC_ROW');
        };
        return StaticBufferImpl;
    }(AbstractBuffer));
    var DynamicBufferImpl = /** @class */ (function (_super) {
        __extends(DynamicBufferImpl, _super);
        function DynamicBufferImpl(data) {
            var _this = _super.call(this) || this;
            _this._data = data;
            return _this;
        }
        DynamicBufferImpl.prototype.setData = function (data) {
            this._data = data;
            this.setDirty();
        };
        DynamicBufferImpl.prototype.init = function (gl, target) {
            gl.bufferData(target, this._data, webglext.GL.DYNAMIC_DRAW);
            return this._data.byteLength;
        };
        DynamicBufferImpl.prototype.update = function (gl, target, capacity) {
            if (this._data.byteLength <= capacity) {
                gl.bufferSubData(target, 0, this._data);
                return capacity;
            }
            else {
                gl.bufferData(target, this._data, webglext.GL.DYNAMIC_DRAW);
                return this._data.byteLength;
            }
        };
        return DynamicBufferImpl;
    }(AbstractBuffer));
})(webglext || (webglext = {}));
//# sourceMappingURL=buffer.js.map