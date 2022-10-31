module webglext {

    // this is related to Buffer;
    export interface Buffer {
        bind( gl : WebGLRenderingContext, target : number );
        unbind( gl : WebGLRenderingContext, target : number );
        dispose( );
    }

    export interface DynamicBuffer extends Buffer {
        setData( newData : ArrayBuffer );
    }

    export function newStaticBuffer( data : ArrayBuffer ) : Buffer {
        return new StaticBufferImpl( data );
    }

    export function newDynamicBuffer( data : ArrayBuffer = new Float32Array( 0 ) ) : DynamicBuffer {
        return new DynamicBufferImpl( data );
    }


    class BufferEntry {
        gl : WebGLRenderingContext;
        buffer : WebGLBuffer;
        capacity : number = 0;
        marker : number = null;

        constructor( gl : WebGLRenderingContext, buffer : WebGLBuffer ) {
            this.gl = gl;
            this.buffer = buffer;
        }
    }

    class AbstractBuffer implements Buffer {
        private buffers : StringMap<BufferEntry> = { };
        private currentMarker : number = 0;

        init( gl : WebGLRenderingContext, target : number ) : number {
            throw new Error( 'Method is abstract' );
        }

        update( gl : WebGLRenderingContext, target : number, capacity : number ) : number {
            throw new Error( 'Method is abstract' );
        }

        setDirty( ) {
            this.currentMarker++;
        }

        bind( gl : WebGLRenderingContext, target : number ) {
            var glId = getObjectId( gl );
            if ( this.buffers[ glId ] === undefined ) {
                var buffer = gl.createBuffer( );
                if ( !isNotEmpty( buffer ) ) throw new Error( 'Failed to create buffer' );
                this.buffers[ glId ] = new BufferEntry( gl, buffer );

                gl.bindBuffer( target, this.buffers[ glId ].buffer );
                this.buffers[ glId ].capacity = this.init( gl, target );
                this.buffers[ glId ].marker = this.currentMarker;
            }
            else if ( this.buffers[ glId ].marker !== this.currentMarker ) {
                gl.bindBuffer( target, this.buffers[ glId ].buffer );
                this.buffers[ glId ].capacity = this.update( gl, target, this.buffers[ glId ].capacity );
                this.buffers[ glId ].marker = this.currentMarker;
            }
            else {
                gl.bindBuffer( target, this.buffers[ glId ].buffer );
            }
        }

        unbind( gl : WebGLRenderingContext, target : number ) {
            gl.bindBuffer( target, null );
        }

        dispose( ) {
            for ( var glid in this.buffers ) {
                if ( this.buffers.hasOwnProperty( glid ) ) {
                    var en = this.buffers[ glid ];
                    en.gl.deleteBuffer( en.buffer );
                }
            }
            this.buffers = { };
        }
    }


    class StaticBufferImpl extends AbstractBuffer {
        private _data : ArrayBuffer;

        constructor( data : ArrayBuffer ) {
            super( );
            this._data = data;
        }

        init( gl : WebGLRenderingContext, target : number ) : number {
            gl.bufferData( target, this._data, GL.STATIC_DRAW );
            return this._data.byteLength;
        }

        update( gl : WebGLRenderingContext, target : number, capacity : number ) : number {
            throw new Error( 'This buffer need not to update because it is STATIC_ROW' );
        }
    }


    class DynamicBufferImpl extends AbstractBuffer implements DynamicBuffer {
        private _data : ArrayBuffer;

        constructor( data : ArrayBuffer ) {
            super( );
            this._data = data;
        }

        setData( data : ArrayBuffer ) {
            this._data = data;
            this.setDirty( );
        }

        init( gl : WebGLRenderingContext, target : number ) : number {
            gl.bufferData( target, this._data, GL.DYNAMIC_DRAW );
            return this._data.byteLength;
        }

        update( gl : WebGLRenderingContext, target : number, capacity : number ) : number {
            if ( this._data.byteLength <= capacity ) {
                gl.bufferSubData( target, 0, this._data );
                return capacity;
            }
            else {
                gl.bufferData( target, this._data, GL.DYNAMIC_DRAW );
                return this._data.byteLength;
            }
        }
    }


}