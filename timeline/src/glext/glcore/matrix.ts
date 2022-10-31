
module webglext {

    export function glOrtho( left : number, right : number, bottom : number, top : number, near : number, far : number ) : Float32Array {

        var tx = ( right + left ) / ( right - left );
        var ty = ( top + bottom ) / ( top - bottom );
        var tz = ( far + near )   / ( far - near );

        // GL ES (and therefore WebGL) requires matrices to be column-major
        return new Float32Array( [
            2 / ( right - left ), 0, 0, 0,
            0, 2 / ( top - bottom ), 0, 0,
            0, 0, -2 / ( far - near ), 0,
            -tx, -ty, -tz, 1
        ] );
    }
    
    export function glOrthoViewport( viewport : BoundsUnmodifiable ) : Float32Array {
        return glOrtho( -0.5, viewport.w-0.5, -0.5, viewport.h-0.5, -1, 1 );
    }
    
    export function glOrthoAxis( axis : Axis2D ) : Float32Array {
        return glOrtho( axis.xAxis.vMin, axis.xAxis.vMax, axis.yAxis.vMin, axis.yAxis.vMax, -1, 1 );
    }
}