module webglext {


    export interface TimeAxisPainterOptions {
        tickSpacings?      : number;
        font?             : string;
        textColor?        : Color;
        tickColor?        : Color;
        tickSize?         : number;
        labelAlign?       : number;
        referenceDate?    : string;
        isFuturePositive? : boolean;
    }


    export function newTimeAxisPainter( timeAxis : TimeAxis1D, labelSide : Side, displayTimeZone : string, tickTimeZone : string, options? : TimeAxisPainterOptions ) : Painter {
        var tickSpacings = ( isNotEmpty( options ) && isNotEmpty( options.tickSpacings ) ? options.tickSpacings : 60          );
        var font        = ( isNotEmpty( options ) && isNotEmpty( options.font        ) ? options.font        : '11px sans-serif' );
        var textColor   = ( isNotEmpty( options ) && isNotEmpty( options.textColor   ) ? options.textColor   : black       );
        var tickColor   = ( isNotEmpty( options ) && isNotEmpty( options.tickColor   ) ? options.tickColor   : black       );
        var tickSize    = ( isNotEmpty( options ) && isNotEmpty( options.tickSize    ) ? options.tickSize    : 6           );
        var labelAlign  = ( isNotEmpty( options ) && isNotEmpty( options.labelAlign  ) ? options.labelAlign  : 0.5         );
        var referenceDate_PMILLIS = ( isNotEmpty( options ) && isNotEmpty( options.referenceDate  ) ? parseTime_PMILLIS( options.referenceDate )  : undefined );
        var isFuturePositive  = ( isNotEmpty( options ) && isNotEmpty( options.isFuturePositive  ) ? options.isFuturePositive  : true        );

        var marksProgram = new Program( edgeMarks_VERTSHADER( labelSide ), solid_FRAGSHADER );
        var marksProgram_u_VMin = new Uniform1f( marksProgram, 'u_VMin' );
        var marksProgram_u_VSize = new Uniform1f( marksProgram, 'u_VSize' );
        var marksProgram_u_ViewportSize = new Uniform2f( marksProgram, 'u_ViewportSize' );
        var marksProgram_u_MarkSize = new Uniform1f( marksProgram, 'u_MarkSize' );
        var marksProgram_u_Color = new UniformColor( marksProgram, 'u_Color' );
        var marksProgram_a_VCoord = new Attribute( marksProgram, 'a_VCoord' );

        var markCoords = new Float32Array( 0 );
        var markCoordsBuffer = newDynamicBuffer( );

        var textTextures = <Cache<TextTexture2D>> newTextTextureCache( font, textColor );
        var textureRenderer = new TextureRenderer( );
        var hTickLabels = textTextures.value( '-0123456789:.' ).h;
        var isVerticalAxis = ( labelSide === Side.LEFT || labelSide === Side.RIGHT );

        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
        
            var sizePixels = isVerticalAxis ? viewport.h : viewport.w;
            if ( sizePixels === 0 ) return;
 
            var tickTimes_PMILLIS = getTickTimes_PMILLIS( timeAxis, sizePixels, tickSpacings, tickTimeZone, referenceDate_PMILLIS );
            var tickInterval_MILLIS = getTickInterval_MILLIS( tickTimes_PMILLIS );
            var tickCount = tickTimes_PMILLIS.length;


            // Tick marks
            //

            marksProgram.use( gl );
            marksProgram_u_VMin.setData( gl, timeAxis.vMin );
            marksProgram_u_VSize.setData( gl, timeAxis.vSize );
            marksProgram_u_ViewportSize.setData( gl, viewport.w, viewport.h );
            marksProgram_u_MarkSize.setData( gl, tickSize );
            marksProgram_u_Color.setData( gl, tickColor );

            markCoords = ensureCapacityFloat32( markCoords, 4*tickCount );
            for ( var n = 0; n < tickCount; n++ ) {
                var v = timeAxis.vAtTime( tickTimes_PMILLIS[ n ] );
                markCoords[ ( 4*n + 0 ) ] = v;
                markCoords[ ( 4*n + 1 ) ] = 0;
                markCoords[ ( 4*n + 2 ) ] = v;
                markCoords[ ( 4*n + 3 ) ] = 1;
            }
            markCoordsBuffer.setData( markCoords.subarray( 0, 4*tickCount ) );
            marksProgram_a_VCoord.setDataAndEnable( gl, markCoordsBuffer, 2, GL.FLOAT );

            // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
            gl.lineWidth( 1 );
            gl.drawArrays( GL.LINES, 0, 2*tickCount );

            marksProgram_a_VCoord.disable( gl );
            marksProgram.endUse( gl );

            gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
            gl.enable( GL.BLEND );


            // Tick labels
            //

            var ticks : TickDisplayData = getTickDisplayData( tickInterval_MILLIS, referenceDate_PMILLIS, displayTimeZone, isFuturePositive );

            textTextures.resetTouches( );
            textureRenderer.begin( gl, viewport );

            for ( var n = 0; n < tickCount; n++ ) {
                var tickTime_PMILLIS = tickTimes_PMILLIS[ n ];
                var tFrac = timeAxis.tFrac( tickTime_PMILLIS );
                if ( tFrac < 0 || tFrac >= 1 ) continue;

                var tickLabel : string = ticks.tickFormat( tickTime_PMILLIS );
                var textTexture = textTextures.value( tickLabel );

                var xFrac : number;
                var yFrac : number;
                if ( labelSide === Side.LEFT || labelSide === Side.RIGHT ) {
                    var yAnchor = textTexture.yAnchor( 0.43 );
                    var j0 = ( tFrac * viewport.h ) - yAnchor*textTexture.h;
                    var j = clamp( 0, viewport.h - textTexture.h, j0 );
                    yFrac = j / viewport.h;

                    if ( labelSide === Side.LEFT ) {
                        xFrac = ( viewport.w - tickSize - 2 - textTexture.w ) / viewport.w;
                    }
                    else {
                        xFrac = ( tickSize + 2 ) / viewport.w;
                    }
                }
                else {
                    var xAnchor = 0.45;
                    var i0 = ( tFrac * viewport.w ) - xAnchor*( textTexture.w );
                    var i = clamp( 0, viewport.w - textTexture.w, i0 );
                    xFrac = i / viewport.w;

                    if ( labelSide === Side.BOTTOM ) {
                        yFrac = ( viewport.h - tickSize - 2 - hTickLabels ) / viewport.h;
                    }
                    else {
                        yFrac = ( tickSize + 2 ) / viewport.h;
                    }
                }
                textureRenderer.draw( gl, textTexture, xFrac, yFrac, { xAnchor: 0, yAnchor: 0 } );
            }


            textureRenderer.end( gl );
            textTextures.retainTouched( );
        }
    }

    function getTickDisplayData( tickInterval_MILLIS : number, referenceDate_PMILLIS : number, displayTimeZone : string, isFuturePositive : boolean ) : TickDisplayData {
        return getTickDisplayDataRelative( tickInterval_MILLIS, 0, isFuturePositive );

    }

    function getTickDisplayDataRelative( tickInterval_MILLIS : number, referenceDate_PMILLIS : number, isFuturePositive : boolean ) : TickDisplayData {
        if ( tickInterval_MILLIS <= minutesToMillis( 1 ) ) {
            var tickFormat : TickFormat = function( tickTime_PMILLIS : number ) : string {
                var elapsedTime_MILLIS      = Math.abs( tickTime_PMILLIS - referenceDate_PMILLIS );
                var elapsedTime_DAYS        = millisToDays( elapsedTime_MILLIS );
                var elapsedTime_DAYS_WHOLE  = Math.floor( elapsedTime_DAYS );
                var elapsedTime_HOURS       = ( elapsedTime_DAYS - elapsedTime_DAYS_WHOLE ) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor( elapsedTime_HOURS );
                var elapsedTime_MIN         = ( elapsedTime_HOURS - elapsedTime_HOURS_WHOLE ) * 60;
                var elapsedTime_MIN_WHOLE   = Math.floor( elapsedTime_MIN );
                var elapsedTime_SEC         = ( elapsedTime_MIN - elapsedTime_MIN_WHOLE ) * 60;
                var elapsedTime_SEC_WHOLE   = Math.floor( elapsedTime_SEC );
                var elapsedTime_MILLSEC         = ( elapsedTime_SEC - elapsedTime_SEC_WHOLE ) * 100;
                var elapsedTime_MILLSEC_WHOLE   = Math.round( elapsedTime_MILLSEC );

                if ( elapsedTime_SEC_WHOLE >= 60 )
                {
                    elapsedTime_SEC_WHOLE -= 60;
                    elapsedTime_MIN_WHOLE += 1;
                }
                if ( elapsedTime_MIN_WHOLE >= 60 )
                {
                    elapsedTime_MIN_WHOLE = 0;
                }

                var min : string = elapsedTime_MIN_WHOLE < 10 ? '0' + elapsedTime_MIN_WHOLE : '' + elapsedTime_MIN_WHOLE;
                var sec : string = elapsedTime_SEC_WHOLE < 10 ? '0' + elapsedTime_SEC_WHOLE : '' + elapsedTime_SEC_WHOLE;
                var milli: string = elapsedTime_MILLSEC_WHOLE < 10 ? '0' + elapsedTime_MILLSEC_WHOLE : '' + elapsedTime_MILLSEC_WHOLE;

                if(tickInterval_MILLIS <= secondsToMillis(1)) {
                    return min + ':' + sec + ':' + milli;
                }
                else {
                    return min + ':' + sec;
                }
            };

            var prefixFormat = function( timeStruct : TimeStruct ) : string {
                var center_PMILLIS          = ( timeStruct.end_PMILLIS - timeStruct.start_PMILLIS ) / 2 + timeStruct.start_PMILLIS;
                var elapsedTime_MILLIS      = center_PMILLIS - referenceDate_PMILLIS;
                var negative                = ( elapsedTime_MILLIS < 0 );
                var signString              = ( negative && isFuturePositive ) || ( !negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS          = Math.abs( elapsedTime_MILLIS );

                var elapsedTime_DAYS        = millisToDays( elapsedTime_MILLIS );
                var elapsedTime_DAYS_WHOLE  = Math.floor( elapsedTime_DAYS );
                var elapsedTime_HOURS       = ( elapsedTime_DAYS - elapsedTime_DAYS_WHOLE ) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor( elapsedTime_HOURS );

                return 'Day ' + signString +  elapsedTime_DAYS_WHOLE + ' Hour ' + signString + elapsedTime_HOURS_WHOLE;
            };

            var timeStructFactory = function( ) : TimeStruct { return new TimeStruct( ) };
        }
        else if ( tickInterval_MILLIS <= hoursToMillis( 12 ) ) {
            var tickFormat : TickFormat = function( tickTime_PMILLIS : number ) : string {
                var elapsedTime_MILLIS      = Math.abs( tickTime_PMILLIS - referenceDate_PMILLIS );
                var elapsedTime_DAYS        = millisToDays( elapsedTime_MILLIS );
                var elapsedTime_DAYS_WHOLE  = Math.floor( elapsedTime_DAYS );
                var elapsedTime_HOURS       = ( elapsedTime_DAYS - elapsedTime_DAYS_WHOLE ) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor( elapsedTime_HOURS );
                var elapsedTime_MIN         = ( elapsedTime_HOURS - elapsedTime_HOURS_WHOLE ) * 60;
                // use round() here instead of floor() because we always expect ticks to be on even minute
                // boundaries but rounding error will cause us to be somewhat unpredictably above or below
                // the nearest even minute boundary
                var elapsedTime_MIN_WHOLE   = Math.round( elapsedTime_MIN );
                // however the above fails when we round up to a whole hour, so special case that
                if ( elapsedTime_MIN_WHOLE >= 60 )
                {
                    elapsedTime_MIN_WHOLE -= 60;
                    elapsedTime_HOURS_WHOLE += 1;
                }
                if ( elapsedTime_HOURS_WHOLE >= 24 )
                {
                    elapsedTime_HOURS_WHOLE = 0;
                }

                var hour : string = elapsedTime_HOURS_WHOLE < 10 ? '0' + elapsedTime_HOURS_WHOLE : '' + elapsedTime_HOURS_WHOLE;
                var min : string = elapsedTime_MIN_WHOLE < 10 ? '0' + elapsedTime_MIN_WHOLE : '' + elapsedTime_MIN_WHOLE;

                return hour + ':' + min;
            };

            var prefixFormat = function( timeStruct : TimeStruct ) : string {
                var center_PMILLIS           = ( timeStruct.end_PMILLIS - timeStruct.start_PMILLIS ) / 2 + timeStruct.start_PMILLIS;
                var elapsedTime_MILLIS       = center_PMILLIS - referenceDate_PMILLIS;
                var negative                 = ( elapsedTime_MILLIS < 0 );
                var signString               = ( negative && isFuturePositive ) || ( !negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS           = Math.abs( elapsedTime_MILLIS );
                var elapsedTime_DAYS         = Math.floor( millisToDays( elapsedTime_MILLIS ) );
                return 'Day ' + signString + elapsedTime_DAYS;
            };

            var timeStructFactory = function( ) : TimeStruct { return new TimeStruct( ) };
        }
        else {
            var tickFormat : TickFormat = function( tickTime_PMILLIS : number ) : string {
                var elapsedTime_MILLIS = tickTime_PMILLIS - referenceDate_PMILLIS;
                var negative = ( elapsedTime_MILLIS < 0 );
                var signString = ( negative && isFuturePositive ) || ( !negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS = Math.abs( elapsedTime_MILLIS );
                var elapsedTime_DAYS = Math.floor( millisToDays( elapsedTime_MILLIS ) );
                return elapsedTime_DAYS === 0 ? '' + elapsedTime_DAYS : signString + elapsedTime_DAYS;
            };
        }

        return { prefixFormat: prefixFormat, tickFormat: tickFormat, timeStructFactory:timeStructFactory };
    }

    function getTickDisplayDataAbsolute( tickInterval_MILLIS : number, displayTimeZone : string ) : TickDisplayData {

        var defaultTickFormat = function( format : string ) : TickFormat { return function( tickTime_PMILLIS : number ) : string { return moment( tickTime_PMILLIS ).zone( displayTimeZone ).format( format ) } };
        var defaultPrefixFormat = function( format : string ) : PrefixFormat { return function( timeStruct : TimeStruct ) : string { return moment( timeStruct.textCenter_PMILLIS ).zone( displayTimeZone ).format( format ) } };

        if ( tickInterval_MILLIS > hoursToMillis( 1 ) ) {
            var tickFormat = defaultTickFormat( 'hh:mm:ss' );
            var prefixFormat = defaultPrefixFormat( 'hh:mm:ss' );
            var timeStructFactory = function( ) : TimeStruct { return new HourStruct( ) };
        }
        if ( tickInterval_MILLIS > minutesToMillis( 1 ) ) {
            var tickFormat = defaultTickFormat( 'mm:ss' );
            var prefixFormat = defaultPrefixFormat( 'mm:ss' );
            var timeStructFactory = function( ) : TimeStruct { return new HourStruct( ) };
        }
        if ( tickInterval_MILLIS < minutesToMillis( 1 ) ) {
            var tickFormat = defaultTickFormat( 'mm:ss.SSS' );
            var prefixFormat = defaultPrefixFormat( 'mm:ss.SSS' );
            var timeStructFactory = function( ) : TimeStruct { return new HourStruct( ) };
        }
        else {
            var tickFormat = defaultTickFormat( 'HH:mm:ss' );
        }

        return { prefixFormat: prefixFormat, tickFormat: tickFormat, timeStructFactory:timeStructFactory };
    }

    interface TickDisplayData {
        prefixFormat : PrefixFormat;
        tickFormat : TickFormat;
        timeStructFactory : TimeStructFactory;
    }

    interface PrefixFormat {
        ( timeStruct : TimeStruct ) : string;
    }

    interface TickFormat {
        ( tickTime_PMILLIS : number ) : string;
    }

    interface TimeStructFactory {
        ( ): TimeStruct;
    }

    class TimeStruct {
        public start_PMILLIS : number;
        public end_PMILLIS : number;
        public viewStart_PMILLIS : number;
        public viewEnd_PMILLIS : number;
        public textCenter_PMILLIS : number;

        setTime( time_PMILLIS : number, timeZone : string ) : Moment {
            return moment( time_PMILLIS ).zone( timeZone );
        }

        incrementTime( m : Moment ) {
        }
    }

    class DayStruct extends TimeStruct {
        setTime( time_PMILLIS : number) : Moment {
            var m = moment( time_PMILLIS );
            m.hours( 0 );
            m.minutes( 0 );
            m.seconds( 0 );
            return m;
        }

        incrementTime( m : Moment ) {
            m.add( 'days', 1 );
        }
    }


    class HourStruct extends TimeStruct {
        setTime( time_PMILLIS : number) : Moment {
            var m = moment( time_PMILLIS );
            m.minutes( 0 );
            m.seconds( 0 );
            return m;
        }

        incrementTime( m : Moment ) {
            m.add( 'hours', 1 );
        }
    }

    export function getTickTimes_PMILLIS( timeAxis : TimeAxis1D, sizePixels : number, tickSpacings : number, timeZone : string, referenceDate_PMILLIS : number ) : number[] {
        var dMin_PMILLIS = timeAxis.tMin_PMILLIS;
        var dMax_PMILLIS = timeAxis.tMax_PMILLIS;
        var approxTickInterval_MILLIS = tickSpacings * ( dMax_PMILLIS - dMin_PMILLIS ) / sizePixels;

        return getHourTickTimesRelative_PMILLIS( dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, 0 );
    }


    function getHourTickTimesRelative_PMILLIS( dMin_PMILLIS : number, dMax_PMILLIS : number, approxTickInterval_MILLIS : number, referenceDate_PMILLIS : number ) : number[] {
        var tickTimes = getHourTickTimes_PMILLIS( dMin_PMILLIS - referenceDate_PMILLIS, dMax_PMILLIS - referenceDate_PMILLIS, approxTickInterval_MILLIS);
    
        for ( var n = 0; n < tickTimes.length; n++ ) {
            tickTimes[n] = tickTimes[n] + referenceDate_PMILLIS;
        }

        return tickTimes;
    }

  

    function getHourTickTimes_PMILLIS( dMin_PMILLIS : number, dMax_PMILLIS : number, approxTickInterval_MILLIS : number) : number[] {
        var tickInterval_MILLIS = calculateTickInterval_MILLIS( approxTickInterval_MILLIS );

        var ticksSince1970 = Math.floor( dMin_PMILLIS / tickInterval_MILLIS );
        var firstTick_PMILLIS = ( ticksSince1970 * tickInterval_MILLIS );
        var numTicks = Math.ceil( 1 + ( dMax_PMILLIS - firstTick_PMILLIS ) / tickInterval_MILLIS );

        var tickTimes_PMILLIS = <number[]> [ ];
        for ( var n = 0; n < numTicks; n++ ) {
            var data = firstTick_PMILLIS + n*tickInterval_MILLIS;

            if(data < 0) continue;
            tickTimes_PMILLIS.push( data );
        }
        return tickTimes_PMILLIS;
    }


    var tickIntervalRungs_MILLIS = [ 
                                     10,
                                     20,
                                     50,
                                     100,
                                     200,
                                     300,
                                     400,
                                     500,
                                     secondsToMillis( 1 ),
                                     secondsToMillis( 2 ),
                                     secondsToMillis( 5 ),
                                     secondsToMillis( 10 ),
                                     secondsToMillis( 15 ),
                                     secondsToMillis( 20 ),
                                     secondsToMillis( 30 ),
                                     minutesToMillis( 1 ),
                                     minutesToMillis( 2 ),
                                     minutesToMillis( 5 ),
                                     minutesToMillis( 10 ),
                                     minutesToMillis( 15 ),
                                     minutesToMillis( 20 ),
                                     minutesToMillis( 30 ),
                                     hoursToMillis( 1 )
                                     ];


    function calculateTickInterval_MILLIS( approxTickInterval_MILLIS : number ) : number {
        for ( var n = 0; n < tickIntervalRungs_MILLIS.length; n++ ) {
            if ( approxTickInterval_MILLIS <= tickIntervalRungs_MILLIS[ n ] ) {
                return tickIntervalRungs_MILLIS[ n ];
            }
        }
        return secondsToMillis( 1 );
    }


    function getTickInterval_MILLIS( tickTimes_PMILLIS : number[] ) : number {
        if ( isNotEmpty( tickTimes_PMILLIS ) && tickTimes_PMILLIS.length > 1 ) {
            return ( tickTimes_PMILLIS[ 1 ] - tickTimes_PMILLIS[ 0 ] );
        }
        else {
            return secondsToMillis( 1 );
        }
    }


}
