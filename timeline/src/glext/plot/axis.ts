module webglext {


    export class Axis1D {
        protected _vMin : number;
        protected _vMax : number;
        protected _limitsChanged = new Notification( );

        constructor( vMin : number, vMax : number ) {
            this._vMin = vMin;
            this._vMax = vMax;
        }

        get vMin( ) : number {
            return this._vMin;
        }

        get vMax( ) : number {
            return this._vMax;
        }

        get limitsChanged( ) : Notification {
            return this._limitsChanged;
        }

        set vMin( vMin : number ) {
            this._vMin = vMin;
            this._limitsChanged.fire( );
        }

        set vMax( vMax : number ) {
            this._vMax = vMax;
            this._limitsChanged.fire( );
        }

        setVRange( vMin : number, vMax : number ) {
            this._vMin = vMin;
            this._vMax = vMax;
            this._limitsChanged.fire( );
        }

        get vSize( ) : number {
            return ( this._vMax - this._vMin );
        }

        vAtFrac( vFrac : number ) : number {
            return ( this._vMin + vFrac*( this._vMax - this._vMin ) );
        }

        vFrac( v : number ) : number {
            return ( v - this._vMin ) / ( this._vMax - this._vMin );
        }

        pan( vAmount : number) {
            this._vMin += vAmount;
            this._vMax += vAmount;
            this._limitsChanged.fire( );
        }

        zoom( factor : number, vAnchor : number) {

            this._vMin = vAnchor - factor*( vAnchor - this._vMin );
            this._vMax = vAnchor + factor*( this._vMax - vAnchor );

            this._limitsChanged.fire( );
        }
        
    }


    export function getTickInterval( axis : Axis1D, approxNumTicks : number ) : number {
        var vMin = Math.min( axis.vMin, axis.vMax );
        var vMax = Math.max( axis.vMin, axis.vMax );
        var approxTickInterval = ( vMax - vMin ) / approxNumTicks;
        var prelimTickInterval = Math.pow( 10, Math.round( log10( approxTickInterval ) ) );
        var prelimNumTicks = ( vMax - vMin ) / prelimTickInterval;

        if ( prelimNumTicks >= 5 * approxNumTicks ) return ( prelimTickInterval * 5 );
        if ( prelimNumTicks >= 2 * approxNumTicks ) return ( prelimTickInterval * 2 );

        if ( 5 * prelimNumTicks <= approxNumTicks ) return ( prelimTickInterval / 5 );
        if ( 2 * prelimNumTicks <= approxNumTicks ) return ( prelimTickInterval / 2 );

        return prelimTickInterval;
    }


    export function getTickCount( axis : Axis1D, tickInterval : number ) : number {
        return Math.ceil( Math.abs( axis.vSize ) / tickInterval ) + 1;
    }


    export function getTickPositions( axis : Axis1D, tickInterval : number, tickCount : number, result : Float32Array ) {
        var vMin = Math.min( axis.vMin, axis.vMax );
        var vMax = Math.max( axis.vMin, axis.vMax );

        var minTickNumber = Math.floor( vMin / tickInterval );

        for ( var i = 0; i < tickCount; i++ ) {
            result[ i ] = ( minTickNumber + i ) * tickInterval;
        }

        if ( axis.vMin > axis.vMax ) {
            // XXX: Need floor() on tickCount/2?
            for ( var i = 0; i < tickCount/2; i++ ) {
                var temp = result[ i ];
                result[ i ] = result[ tickCount-1 - i ];
                result[ tickCount-1 - i ] = temp;
            }
        }
    }


    export class Axis2D {
        private _xAxis : Axis1D;
        private _yAxis : Axis1D;

        get xAxis( ) : Axis1D { return this._xAxis; }
        get xMin( ) : number { return this._xAxis.vMin; }
        get xMax( ) : number { return this._xAxis.vMax; }
        xAtFrac( xFrac : number ) : number { return this._xAxis.vAtFrac( xFrac ); }

        get yAxis( ) : Axis1D { return this._yAxis; }
        get yMin( ) : number { return this._yAxis.vMin; }
        get yMax( ) : number { return this._yAxis.vMax; }
        yAtFrac( yFrac : number ) : number { return this._yAxis.vAtFrac( yFrac ); }

        constructor( xAxis : Axis1D, yAxis : Axis1D ) {
            this._xAxis = xAxis;
            this._yAxis = yAxis;
        }

        onLimitsChanged( listener : Listener ) {
            this._xAxis.limitsChanged.on( listener );
            this._yAxis.limitsChanged.on( listener );
        }

        pan( xAmount : number, yAmount : number ) {
            this._xAxis.pan( xAmount);
            this._yAxis.pan( yAmount);
        }

        zoom( factor : number, xAnchor : number, yAnchor : number ) {
            this._xAxis.zoom( factor, xAnchor);
            this._yAxis.zoom( factor, yAnchor);
        }
    }


    export function newAxis2D( xMin : number, xMax : number, yMin : number, yMax : number ) : Axis2D {
        return new Axis2D( new Axis1D( xMin, xMax ), new Axis1D( yMin, yMax ) );
    }


    // XXX: Would be nice if this could be a const
    export var axisZoomStep = 1.12;


    export function attachAxisMouseListeners1D( pane : Pane, axis : Axis1D, isVertical : boolean ) {
        var vGrab : number = null;

        pane.mouseDown.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) && !isNotEmpty( vGrab ) ) {
                vGrab = axis.vAtFrac( isVertical ? yFrac( ev ) : xFrac( ev ) );
            }
        } );

        pane.mouseMove.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) && isNotEmpty( vGrab ) ) {
                axis.pan( vGrab - axis.vAtFrac( isVertical ? yFrac( ev ) : xFrac( ev ) ));
            }
        } );

        pane.mouseUp.on( function( ev : PointerEvent ) {
            vGrab = null;
        } );

        pane.mouseWheel.on( function( ev : PointerEvent ) {
            var zoomFactor = Math.pow( axisZoomStep, ev.wheelSteps );
            axis.zoom( zoomFactor, axis.vAtFrac( isVertical ? yFrac( ev ) : xFrac( ev ) ));
        } );
    }


    export function attachAxisMouseListeners2D( pane : Pane, axis : Axis2D ) {
        var xGrab : number = null;
        var yGrab : number = null;

        pane.mouseDown.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) && !isNotEmpty( xGrab ) ) {
                xGrab = axis.xAtFrac( xFrac( ev ) );
                yGrab = axis.yAtFrac( yFrac( ev ) );
            }
        } );

        pane.mouseMove.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) && isNotEmpty( xGrab ) ) {
                axis.pan( xGrab - axis.xAtFrac( xFrac( ev ) ), yGrab - axis.yAtFrac( yFrac( ev ) ) );
            }
        } );

        pane.mouseUp.on( function( ev : PointerEvent ) {
            xGrab = null;
            yGrab = null;
        } );

        pane.mouseWheel.on( function( ev : PointerEvent ) {
            var zoomFactor = Math.pow( axisZoomStep, ev.wheelSteps );
            axis.zoom( zoomFactor, axis.xAtFrac( xFrac( ev ) ), axis.yAtFrac( yFrac( ev ) ));
        } );
    }

}