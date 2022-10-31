/* this is the module for texture*/

module webglext {


    class TextureEntry {
        gl : WebGLRenderingContext; //Context
        target : number; //TEXTURE_2D
        texture : WebGLTexture;
        textureUnit : number;

        constructor( gl : WebGLRenderingContext, target : number, texture : WebGLTexture ) {
            this.gl = gl;
            this.target = target;
            this.texture = texture;
            this.textureUnit = -1;
        }
    }


    export interface TextureHelper {
        target( gl : WebGLRenderingContext ) : number;
        init( gl : WebGLRenderingContext, target : number );
    }


    export class Texture {
        private helper : TextureHelper;
        private textures : StringMap<TextureEntry>;

        constructor( helper : TextureHelper ) {
            this.helper = helper;
            this.textures = { };
        }

        bind( gl : WebGLRenderingContext, textureUnit : number ) {
            var glId = getObjectId( gl );
            if ( isNotEmpty( this.textures[ glId ] ) ) {
                var en = this.textures[ glId ];
                gl.activeTexture( GL.TEXTURE0 + textureUnit );
                gl.bindTexture( en.target, en.texture );
                en.textureUnit = textureUnit;
            }
            else {
                var target = this.helper.target( gl );
                var texture = gl.createTexture( );
                if ( !isNotEmpty( texture ) ) throw new Error( 'Failed to create texture' );
                this.textures[ glId ] = new TextureEntry( gl, target, texture );

                var en = this.textures[ glId ];
                gl.activeTexture( GL.TEXTURE0 + textureUnit );
                gl.bindTexture( en.target, en.texture );
                en.textureUnit = textureUnit;

                this.helper.init( gl, target );
            }
        }

        unbind( gl : WebGLRenderingContext ) {
            var glId = getObjectId( gl );
            if ( isNotEmpty( this.textures[ glId ] ) ) {
                var en = this.textures[ glId ];
                gl.activeTexture( GL.TEXTURE0 + en.textureUnit );
                gl.bindTexture( en.target, null );
                en.textureUnit = -1;
            }
        }

        dispose( ) {
            for ( var glid in this.textures ) {
                if ( this.textures.hasOwnProperty( glid ) ) {
                    var en = this.textures[ glid ];
                    en.gl.deleteTexture( en.texture );
                }
            }
            this.textures = { };
        }
    }


    export interface ImageDrawer {
        ( context : CanvasRenderingContext2D );
    }

    export class FloatDataTexture2D extends Texture {
        private _w : number;
        private _h : number;

        get w( ) : number { return this._w; }
        get h( ) : number { return this._h; }

        constructor( w : number, h : number, array : Float32Array ) {
            super( {
                target: function( gl : WebGLRenderingContext ) : number {
                    return GL.TEXTURE_2D;
                },
                init: function( gl : WebGLRenderingContext, target : number ) {
                
                    if ( !gl.getExtension( 'OES_texture_float' ) ) {
                       throw new Error( 'OES_texture_float extension is required' );
                    }
                    
                    gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, GL.NEAREST );
                    gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, GL.NEAREST );
                    gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
                    gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
                    
                    // GL.LUMINANCE isn't supported with GL.FLOAT
                    gl.texImage2D( target, 0, GL.RGBA, w, h, 0, GL.RGBA, GL.FLOAT, array );
                }
            } );
            this._w = w;
            this._h = h;
        }
    }

    export class Texture2D extends Texture {
        private _w : number;
        private _h : number;

        get w( ) : number { return this._w; }
        get h( ) : number { return this._h; }

        constructor( w : number, h : number, minFilter : number, magFilter : number, draw : ImageDrawer ) {

            var canvas = document.createElement( 'canvas' );
            canvas.width = w;
            canvas.height = h;
            draw( canvas.getContext( '2d' ) );

            super( {
                target: function( gl : WebGLRenderingContext ) : number {
                    return GL.TEXTURE_2D;
                },
                init: function( gl : WebGLRenderingContext, target : number ) {
                    gl.texParameteri( target, GL.TEXTURE_MAG_FILTER, magFilter );
                    gl.texParameteri( target, GL.TEXTURE_MIN_FILTER, minFilter );
                    gl.texParameteri( target, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE );
                    gl.texParameteri( target, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE );
                    gl.texImage2D( target, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, canvas );
                }
            } );
            this._w = w;
            this._h = h;
        }
    }


    export interface TextureDrawOptions {
        xAnchor? : number;
        yAnchor? : number;
        rotation_CCWRAD? : number;
        width? : number;
        height? : number;
    }


    export class TextureRenderer {

        private textureRenderer_VERTSHADER = concatLines(
            '                                                                                                                 ',
            '  uniform vec2 u_XyFrac;                                                                                         ',
            '  uniform vec2 u_Anchor;                                                                                         ',
            '  uniform float u_Rotation_CCWRAD;                                                                               ',
            '  uniform vec2 u_ImageSize;                                                                                      ',
            '  uniform vec2 u_ViewportSize;                                                                                   ',
            '                                                                                                                 ',
            '  attribute vec2 a_ImageFrac;                                                                                    ',
            '                                                                                                                 ',
            '  varying vec2 v_StCoord;                                                                                        ',
            '                                                                                                                 ',
            '  void main( ) {                                                                                                 ',
            '      float cosRot = cos( u_Rotation_CCWRAD );                                                                   ',
            '      float sinRot = sin( u_Rotation_CCWRAD );                                                                   ',
            '                                                                                                                 ',
            '      // Column major                                                                                            ',
            '      mat2 rotation = mat2( cosRot, sinRot,                                                                      ',
            '                           -sinRot, cosRot );                                                                    ',
            '                                                                                                                 ',
            '      vec2 xy = -1.0 + 2.0*( u_XyFrac + rotation*( u_ImageSize*( a_ImageFrac - u_Anchor ) ) / u_ViewportSize );  ',
            '      gl_Position = vec4( xy, 0.0, 1.0 );                                                                        ',
            '                                                                                                                 ',
            '      v_StCoord = vec2( a_ImageFrac.x, 1.0 - a_ImageFrac.y );                                                    ',
            '  }                                                                                                              ',
            '                                                                                                                 '
        );

        private textureRenderer_FRAGSHADER = concatLines(
            '                                                         ',
            '  precision mediump float;                               ',
            '                                                         ',
            '  uniform sampler2D u_Sampler;                           ',
            '                                                         ',
            '  varying vec2 v_StCoord;                                ',
            '                                                         ',
            '  void main( ) {                                         ',
            '      gl_FragColor = texture2D( u_Sampler, v_StCoord );  ',
            '  }                                                      ',
            '                                                         '
        );


        private program : Program;
        private u_XyFrac : Uniform2f;
        private u_Anchor : Uniform2f;
        private u_Rotation_CCWRAD : Uniform1f;
        private u_ImageSize : Uniform2f;
        private u_ViewportSize : Uniform2f;
        private u_Sampler : UniformSampler2D;

        private a_ImageFrac : Attribute;

        private imageFracData : Buffer;

        private wViewport : number;
        private hViewport : number;


        constructor( ) {
            this.program = new Program( this.textureRenderer_VERTSHADER, this.textureRenderer_FRAGSHADER );
            this.u_XyFrac = new Uniform2f( this.program, 'u_XyFrac' );
            this.u_Anchor = new Uniform2f( this.program, 'u_Anchor' );
            this.u_Rotation_CCWRAD = new Uniform1f( this.program, 'u_Rotation_CCWRAD' );
            this.u_ImageSize = new Uniform2f( this.program, 'u_ImageSize' );
            this.u_ViewportSize = new Uniform2f( this.program, 'u_ViewportSize' );
            this.u_Sampler = new UniformSampler2D( this.program, 'u_Sampler' );

            this.a_ImageFrac = new Attribute( this.program, 'a_ImageFrac' );
            this.imageFracData = newStaticBuffer( new Float32Array( [ 0.0,0.0, 0.0,1.0, 1.0,0.0, 1.0,1.0 ] ) );

            this.wViewport = 0;
            this.hViewport = 0;
        }

        begin( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
            gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
            gl.enable( GL.BLEND );

            this.program.use( gl );
            this.u_ViewportSize.setData( gl, viewport.w, viewport.h );
            this.a_ImageFrac.setDataAndEnable( gl, this.imageFracData, 2, GL.FLOAT );

            this.wViewport = viewport.w;
            this.hViewport = viewport.h;
        }

        draw( gl : WebGLRenderingContext, texture : Texture2D, xFrac : number, yFrac : number, options? : TextureDrawOptions  ) {
            var xAnchor         = ( isNotEmpty( options ) && isNotEmpty( options.xAnchor         ) ? options.xAnchor         : 0.5       );
            var yAnchor         = ( isNotEmpty( options ) && isNotEmpty( options.yAnchor         ) ? options.yAnchor         : 0.5       );
            var rotation_CCWRAD = ( isNotEmpty( options ) && isNotEmpty( options.rotation_CCWRAD ) ? options.rotation_CCWRAD : 0         );
            var width           = ( isNotEmpty( options ) && isNotEmpty( options.width           ) ? options.width           : texture.w );
            var height          = ( isNotEmpty( options ) && isNotEmpty( options.height          ) ? options.height          : texture.h );

            this.u_XyFrac.setData( gl, nearestPixel( xFrac, this.wViewport, xAnchor, texture.w ), nearestPixel( yFrac, this.hViewport, yAnchor, texture.h ) );
            this.u_Anchor.setData( gl, xAnchor, yAnchor );
            this.u_Rotation_CCWRAD.setData( gl, rotation_CCWRAD );
            this.u_ImageSize.setData( gl, width, height );
            this.u_Sampler.setDataAndBind( gl, 0, texture );
            gl.drawArrays( GL.TRIANGLE_STRIP, 0, 4 );
        }

        end( gl : WebGLRenderingContext ) {
            this.a_ImageFrac.disable( gl );
            this.u_Sampler.unbind( gl );
            this.program.endUse( gl );
        }
    }


}