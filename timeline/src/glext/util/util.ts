module webglext {

    // Alias for more readable access to static constants
    export var GL = WebGLRenderingContext;


    export function isNotEmpty( value : any ) : boolean {
        // Double-equals is weird: ( undefined == null ) is true
        return ( value != null );
    }


    export function isNumber( value : any ) : boolean {
        return typeof( value ) === 'number';
    }


    export function isString( value : any ) : boolean {
        return typeof( value ) === 'string';
    }


    export function isEmpty( array : any[] ) : boolean {
        return ( array.length === 0 );
    }


    export function notEmpty( array : any[] ) : boolean {
        return ( array.length > 0 );
    }


    export function alwaysTrue( ) : boolean {
        return true;
    }


    export function alwaysFalse( ) : boolean {
        return false;
    }


    export function constantFn<V>( value : V ) : ()=>V {
        return function( ) : V {
            return value;
        };
    }


    export function log10( x : number ) : number {
        return Math.log( x ) * ( 1.0 / Math.LN10 );
    }


    export function order( x : number ) : number {
        return Math.floor( log10( x ) + 1e-12 );
    }


    export function clamp( xMin : number, xMax : number, x : number ) : number {
        return Math.max( xMin, Math.min( xMax, x ) );
    }


    export function copyArray<T>( values : T[] ) : T[] {
        return values.slice( 0 );
    }


    export function ensureCapacityFloat32( buffer : Float32Array, minNewCapacity : number ) : Float32Array {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if ( !minNewCapacity || buffer.length >= minNewCapacity ) {
            return buffer;
        }
        else {
            var newCapacity = Math.max( minNewCapacity, 2*buffer.length );
            return new Float32Array( newCapacity );
        }
    }


    export function ensureCapacityUint32( buffer : Uint32Array, minNewCapacity : number ) : Uint32Array {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if ( !minNewCapacity || buffer.length >= minNewCapacity ) {
            return buffer;
        }
        else {
            var newCapacity = Math.max( minNewCapacity, 2*buffer.length );
            return new Uint32Array( newCapacity );
        }
    }


    export function ensureCapacityUint16( buffer : Uint16Array, minNewCapacity : number ) : Uint16Array {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if ( !minNewCapacity || buffer.length >= minNewCapacity ) {
            return buffer;
        }
        else {
            var newCapacity = Math.max( minNewCapacity, 2*buffer.length );
            return new Uint16Array( newCapacity );
        }
    }


    export interface StringMap<V> {
        [ key : string ] : V;
    }
    
    export interface IdFunction<V> {
        ( value : V ) : string;
    }


    export var getObjectId = ( function( ) {
        var keyName = 'webglext_ObjectId';
        var nextValue = 0;
        return function( obj : any ) : string {
            var value = obj[ keyName ];
            if ( !isNotEmpty( value ) ) {
                value = ( nextValue++ ).toString( );
                obj[ keyName ] = value;
            }
            return value;
        };
    } )( );


    export function concatLines( ...lines : string[] ) {
        return lines.join( '\n' );
    }


    /**
     * Parses a timestamp from the format 'HH:mm:ss[.SSS]ZZ' into posix-milliseconds.
     *
     * Format examples:
     *   - '2014-01-01T00:00:00Z'
     *   - '2014-01-01T00:00:00.000+00:00'
     *
     * Use of a colon in numeric timezones is optional. However, it is strongly encouraged, for
     * compatibility with Date in major browsers.
     *
     * Parsing is strict, and will throw an error if the input string does not match the expected
     * format. A notable example is that the seconds field must not have more than three decimal
     * places.
     *
     */
    export function parseTime_PMILLIS( time_ISO8601 : string ) : number {

        // Moment's lenient parsing is way too lenient -- but its strict parsing is a little too
        // strict, so we have to try several possible formats.
        //
        // We could pass in multiple formats to try all at once, but Moment's docs warn that that
        // can be slow. Plus, we expect some formats to be more common than others, so we can make
        // the common formats fast at the expense of the less common ones.
        //

        var m = moment( time_ISO8601, 'HH:mm:ssZZ', true );
        if ( m.isValid( ) ) return m.valueOf( );

        var m = moment( time_ISO8601, 'HH:mm:ss.SSSZZ', true );
        if ( m.isValid( ) ) return m.valueOf( );

        var m = moment( time_ISO8601, 'HH:mm:ss.SSZZ', true );
        if ( m.isValid( ) ) return m.valueOf( );

        var m = moment( time_ISO8601, 'HH:mm:ss.SZZ', true );
        if ( m.isValid( ) ) return m.valueOf( );

        throw new Error( 'Failed to parse time-string: \'' + time_ISO8601 + '\'' );
    }


    /**
     * Formats a timestamp from posix-millis into the format 'hh:mm:ss.SSSZZ' (for
     * example '2014-01-01T00:00:00.000Z').
     *
     * The input value is effectively truncated (not rounded!) to milliseconds. So for example,
     * formatTime_ISO8601(12345.999) will return '1970-01-01T00:00:12.345Z' -- exactly the same
     * as for an input of 12345.
     *
     */
    export function formatTime_ISO8601( time_PMILLIS : number ) : string {
        return moment( time_PMILLIS ).toISOString( );
    }

    export interface Window {
          example: string;
        }

}
