module webglext {


    export class Label {
        private _font : string;
        private _fgColor : Color;
        private _bgColor : Color;
        private _text : string;
        private _textureFactory : TextTextureFactory;
        private _texture : TextTexture2D;

        constructor( text? : string, font? : string, fgColor? : Color, bgColor? : Color ) {
            this._font = font;
            this._text = text;
            this._fgColor = fgColor;
            this._bgColor = bgColor;
        }

        get font( ) : string {
            return this._font;
        }

        set font( font : string ) {
            if ( this._font !== font ) {
                this._font = font;
                this._textureFactory = null;
                if ( this._texture ) {
                    this._texture.dispose( );
                    this._texture = null;
                }
            }
        }

        // retained for backwards compatibility, should use fgColor
        get color( ) : Color {
            return this._fgColor;
        }

        // retained for backwards compatibility, should use fgColor
        set color( fgColor : Color ) {
            if ( !sameColor( this._fgColor, fgColor ) ) {
                this._fgColor = fgColor;
                if ( this._texture ) {
                    this._texture.dispose( );
                    this._texture = null;
                }
            }
        }
        
        get fgColor( ) : Color {
            return this._fgColor;
        }

        set fgColor( fgColor : Color ) {
            if ( !sameColor( this._fgColor, fgColor ) ) {
                this._fgColor = fgColor;
                if ( this._texture ) {
                    this._texture.dispose( );
                    this._texture = null;
                }
            }
        }
        
        get bgColor( ) : Color {
            return this._bgColor;
        }

        set bgColor( bgColor : Color ) {
            if ( !sameColor( this._bgColor, bgColor ) ) {
                this._bgColor = bgColor;
            }
        }

        get text( ) : string {
            return this._text;
        }

        set text( text : string ) {
            if ( this._text !== text ) {
                this._text = text;
                if ( this._texture ) {
                    this._texture.dispose( );
                    this._texture = null;
                }
            }
        }

        get texture( ) : TextTexture2D {
            if ( !this._textureFactory ) {
                this._textureFactory = ( this._font ? createTextTextureFactory( this._font ) : null );
            }
            if ( !this._texture ) {
                this._texture = ( this._fgColor && this._text ? this._textureFactory( this._fgColor, this._text ) : null );
            }
            return this._texture;
        }
    }


    export function fitToLabel( label : Label ) {
        return function( parentPrefSize : Size ) {
            var texture = label.texture;
            parentPrefSize.w = ( texture ? texture.w : 0 );
            parentPrefSize.h = ( texture ? texture.h : 0 );
        };
    }


    export function newLabelPainter( label : Label, xFrac : number, yFrac : number, xAnchor? : number, yAnchor? : number, rotation_CCWRAD? : number ) {
        var textureRenderer = new TextureRenderer( );
        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
            
            if ( isNotEmpty( label.bgColor ) ) {
                gl.clearColor( label.bgColor.r, label.bgColor.g, label.bgColor.b, label.bgColor.a );
                gl.clear( GL.COLOR_BUFFER_BIT );
            }
            
            var texture = label.texture;
            if ( texture ) {
                textureRenderer.begin( gl, viewport );
                textureRenderer.draw( gl, texture, xFrac, yFrac, { xAnchor: xAnchor, yAnchor: texture.yAnchor( yAnchor ), rotation_CCWRAD: rotation_CCWRAD } );
                textureRenderer.end( gl );
            }
        };
    }


}