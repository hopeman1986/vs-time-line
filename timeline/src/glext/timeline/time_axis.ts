module webglext {


    export class TimeAxis1D extends Axis1D {
        
        private _epoch_PMILLIS : number;
        
        constructor( tMin_PMILLIS : number, tMax_PMILLIS : number ) {
            let w_epoch_PMILLIS = 0.5*( tMin_PMILLIS + tMax_PMILLIS );
            super( tMin_PMILLIS - w_epoch_PMILLIS, tMax_PMILLIS - w_epoch_PMILLIS );

            this._epoch_PMILLIS = 0.5*( tMin_PMILLIS + tMax_PMILLIS );
        }

        get tMin_PMILLIS( ) : number {
            return ( this._epoch_PMILLIS + this.vMin );
        }

        get tMax_PMILLIS( ) : number {
            return ( this._epoch_PMILLIS + this.vMax );
        }

        set tMin_PMILLIS( tMin_PMILLIS : number ) {
            this.vMin = ( tMin_PMILLIS - this._epoch_PMILLIS );
        }

        set tMax_PMILLIS( tMax_PMILLIS : number ) {
            this.vMax = ( tMax_PMILLIS - this._epoch_PMILLIS );
        }

        setTRange_PMILLIS( tMin_PMILLIS : number, tMax_PMILLIS : number ) {
            this.setVRange( tMin_PMILLIS - this._epoch_PMILLIS, tMax_PMILLIS - this._epoch_PMILLIS );
        }

        get tSize_MILLIS( ) : number {
            return this.vSize;
        }

        vAtTime( t_PMILLIS : number ) : number {
            return ( t_PMILLIS - this._epoch_PMILLIS );
        }

        tAtFrac_PMILLIS( tFrac : number ) : number {
            return ( this._epoch_PMILLIS + this.vAtFrac( tFrac ) );
        }

        tFrac( t_PMILLIS : number ) : number {
            return this.vFrac( t_PMILLIS - this._epoch_PMILLIS );
        }

        tPan( vAmount : number ) {
            this._vMin += vAmount;
            this._vMax += vAmount;

            var delta = 0.0;
            if(this._vMin < (-this._epoch_PMILLIS)) {

                delta = this._vMin + this._epoch_PMILLIS;
                this._vMax = this._vMax - delta;
                this._vMin = this._vMin - delta;
            }
            this._limitsChanged.fire( );
        }

        tZoom( factor : number, vAnchor : number ) {
            
            this._vMin = vAnchor - factor*( vAnchor - this._vMin );
            this._vMax = vAnchor + factor*( this._vMax - vAnchor );

            if(this._vMin < (-this._epoch_PMILLIS)) {
                this._vMin = -this._epoch_PMILLIS - 0.000001 ;
            } 
            this._limitsChanged.fire( );
        }


    }


}