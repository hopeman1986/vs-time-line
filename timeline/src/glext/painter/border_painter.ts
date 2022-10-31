module webglext {


    export interface BorderOptions {
        drawTop?    : boolean;
        drawLeft?   : boolean;
        drawRight?  : boolean;
        drawBottom? : boolean;
        thickness?  : number;
    }


    export function newBorderPainter( color : Color, options? : BorderOptions ) : Painter {
        if ( !isNotEmpty( options ) ) options = { };
        if ( !isNotEmpty( options.drawTop ) ) options.drawTop = true;
        if ( !isNotEmpty( options.drawLeft ) ) options.drawLeft = true;
        if ( !isNotEmpty( options.drawRight ) ) options.drawRight = true;
        if ( !isNotEmpty( options.drawBottom ) ) options.drawBottom = true;
        if ( !isNotEmpty( options.thickness ) ) options.thickness = 1;

        var simple = ( options.thickness === 1 && color.a >= 1 );
        return ( simple ? newSimpleBorderPainter( color, options ) : newFullBorderPainter( color, options ) );
    }


    function newFullBorderPainter( color : Color, options : BorderOptions ) : Painter {
        var drawTop = options.drawTop;
        var drawLeft = options.drawLeft;
        var drawRight = options.drawRight;
        var drawBottom = options.drawBottom;
        var thickness = options.thickness;

        var program = new Program( xyNdc_VERTSHADER, solid_FRAGSHADER );
        var u_Color = new UniformColor( program, 'u_Color' );
        var a_XyNdc = new Attribute( program, 'a_XyNdc' );

        var numVertices = ( drawTop ? 6 : 0 ) + ( drawLeft ? 6 : 0 ) + ( drawRight ? 6 : 0 ) + ( drawBottom ? 6 : 0 );
        var xy_NDC = new Float32Array( 2*numVertices );
        var xyBuffer_NDC = newDynamicBuffer( );

        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
            if ( color.a >= 1 ) {
                gl.disable( GL.BLEND );
            }
            else {
                gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
                gl.enable( GL.BLEND );
            }

            program.use( gl );
            u_Color.setData( gl, color );

            var w_NDC = 2*thickness / viewport.w;
            var h_NDC = 2*thickness / viewport.h;
            var index = 0;
            if ( drawTop    ) index = putQuadXys( xy_NDC, index, -1, ( drawRight ? +1-w_NDC : +1 ), +1, +1-h_NDC );
            if ( drawRight  ) index = putQuadXys( xy_NDC, index, +1-w_NDC, +1, +1, ( drawBottom ? -1+h_NDC : -1 ) );
            if ( drawBottom ) index = putQuadXys( xy_NDC, index, ( drawLeft ? -1+w_NDC : -1 ), +1, -1+h_NDC, -1 );
            if ( drawLeft   ) index = putQuadXys( xy_NDC, index, -1, -1+w_NDC, ( drawTop ? +1-h_NDC : +1 ), -1 );

            xyBuffer_NDC.setData( xy_NDC );
            a_XyNdc.setDataAndEnable( gl, xyBuffer_NDC, 2, GL.FLOAT );

            gl.drawArrays( GL.TRIANGLES, 0, numVertices );

            a_XyNdc.disable( gl );
            program.endUse( gl );
        };
    }


    function newSimpleBorderPainter( color : Color, options : BorderOptions ) : Painter {
        var drawTop = options.drawTop;
        var drawLeft = options.drawLeft;
        var drawRight = options.drawRight;
        var drawBottom = options.drawBottom;

        var program = new Program( xyNdc_VERTSHADER, solid_FRAGSHADER );
        var u_Color = new UniformColor( program, 'u_Color' );
        var a_XyNdc = new Attribute( program, 'a_XyNdc' );

        var numVertices = ( drawTop ? 2 : 0 ) + ( drawLeft ? 2 : 0 ) + ( drawRight ? 2 : 0 ) + ( drawBottom ? 2 : 0 );
        var xy_NDC = new Float32Array( 2*numVertices );
        var xyBuffer_NDC = newDynamicBuffer( );

        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
            gl.disable( GL.BLEND );

            program.use( gl );
            u_Color.setData( gl, color );

            var left_NDC = fracToNdc( 0.5 / viewport.w );
            var bottom_NDC = fracToNdc( 0.5 / viewport.h );
            var right_NDC = fracToNdc( ( viewport.w - 0.5 ) / viewport.w );
            var top_NDC = fracToNdc( ( viewport.h - 0.5 ) / viewport.h );

            var n = 0;
            if ( drawTop ) {
                xy_NDC[ n++ ] = -1; xy_NDC[ n++ ] = top_NDC;
                xy_NDC[ n++ ] = +1; xy_NDC[ n++ ] = top_NDC;
            }
            if ( drawRight ) {
                xy_NDC[ n++ ] = right_NDC; xy_NDC[ n++ ] = +1;
                xy_NDC[ n++ ] = right_NDC; xy_NDC[ n++ ] = -1;
            }
            if ( drawBottom ) {
                xy_NDC[ n++ ] = +1; xy_NDC[ n++ ] = bottom_NDC;
                xy_NDC[ n++ ] = -1; xy_NDC[ n++ ] = bottom_NDC;
            }
            if ( drawLeft ) {
                xy_NDC[ n++ ] = left_NDC; xy_NDC[ n++ ] = -1;
                xy_NDC[ n++ ] = left_NDC; xy_NDC[ n++ ] = +1;
            }

            xyBuffer_NDC.setData( xy_NDC );
            a_XyNdc.setDataAndEnable( gl, xyBuffer_NDC, 2, GL.FLOAT );

            // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
            gl.lineWidth( 1 );
            gl.drawArrays( GL.LINES, 0, numVertices );

            a_XyNdc.disable( gl );
            program.endUse( gl );
        };
    }


}