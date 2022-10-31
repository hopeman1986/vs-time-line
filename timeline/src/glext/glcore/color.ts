module webglext {


    export class Color {
        private _r : number;
        private _g : number;
        private _b : number;
        private _a : number;

        get r( ) : number { return this._r; }
        get g( ) : number { return this._g; }
        get b( ) : number { return this._b; }
        get a( ) : number { return this._a; }

        get cssString( ) : string {
            return 'rgba(' + Math.round( 255*this._r ) + ',' + Math.round( 255*this._g ) + ',' + Math.round( 255*this._b ) + ',' + this._a + ')';
        }

        get rgbaString( ) : string {
            return '' + Math.round( 255*this._r ) + ',' + Math.round( 255*this._g ) + ',' + Math.round( 255*this._b ) + ',' + Math.round( 255*this._a );
        }

        constructor( r : number, g : number, b : number, a : number = 1 ) {
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }

        withAlphaTimes( aFactor : number ) : Color {
            return new Color( this._r, this._g, this._b, aFactor * this._a );
        }
    }


    export function darker( color : Color, factor : number ) : Color {
        return new Color( color.r * factor, color.g * factor, color.b * factor, color.a );
    }


    export function rgba( r : number, g : number, b : number, a : number ) : Color {
        return new Color( r, g, b, a );
    }


    export function rgb( r : number, g : number, b : number ) : Color {
        return new Color( r, g, b, 1 );
    }


    export function sameColor( c1 : Color, c2 : Color ) : boolean {
        if ( c1 === c2 ) return true;
        if ( !isNotEmpty( c1 ) || !isNotEmpty( c2 ) ) return false;
        return ( c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a );
    }


    /**
     * Creates a Color object based on a CSS color string. Supports the following notations:
     *  - hex
     *  - rgb/rgba
     *  - hsl/hsla
     *  - named colors
     *
     * Behavior is undefined for strings that are not in one of the listed notations.
     *
     * Note that different browsers may use different color values for the named colors.
     *
     */
    export var parseCssColor = ( function( ) {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 1;
        canvas.height = 1;
        var g = canvas.getContext( '2d' );
        return function( cssColorString : string ) : Color {
            g.clearRect( 0, 0, 1, 1 );
            g.fillStyle = cssColorString;
            g.fillRect( 0, 0, 1, 1 );

            var rgbaData = g.getImageData( 0, 0, 1, 1 ).data;
            var R = rgbaData[ 0 ] / 255;
            var G = rgbaData[ 1 ] / 255;
            var B = rgbaData[ 2 ] / 255;
            var A = rgbaData[ 3 ] / 255;
            return rgba( R, G, B, A );
        }
    } )( );


    export function parseRgba( rgbaString : string ) : Color {
        var tokens = rgbaString.split( ',', 4 );
        return new Color( parseInt(tokens[0])/255, parseInt(tokens[1])/255, parseInt(tokens[2])/255, parseInt(tokens[3])/255 );
    }

    export function gray( brightness : number ) : Color {
        return new Color( brightness, brightness, brightness, 1 );
    }


    export var black = rgb( 0, 0, 0 );
    export var white = rgb( 1, 1, 1 );

    export var red   = rgb( 1, 0, 0 );
    export var green = rgb( 0, 1, 0 );
    export var blue  = rgb( 0, 0, 1 );

    export var periwinkle  = rgb( 0.561, 0.561, 0.961 );

    export var cyan    = rgb( 0, 1, 1 );
    export var magenta = rgb( 1, 0, 1 );
    export var yellow  = rgb( 1, 1, 0 );



}