module webglext {


    export interface XyLinePainterOptions {
        color?     : Color;
        blend?     : boolean;
        thickness? : number;
    }


    /**
     * Simple xy line painter which displays static data
     */
    export function newXyLinePainter( axis : Axis2D, xCoords : number[], yCoords : number[], options? : XyLinePainterOptions ) : Painter {
        var thickness = ( isNotEmpty( options ) && isNotEmpty( options.thickness ) ? options.thickness : 4     );
        var color     = ( isNotEmpty( options ) && isNotEmpty( options.color )     ? options.color     : black );
        var blend     = ( isNotEmpty( options ) && isNotEmpty( options.blend )     ? options.blend     : false );

        var program = new Program( modelview_VERTSHADER, solid_FRAGSHADER );
        var u_Color = new UniformColor( program, 'u_Color' );
        var u_modelViewMatrix = new UniformMatrix4f( program, 'u_modelViewMatrix' );

        var coordArray = [];
        for ( var i = 0 ; i < xCoords.length ; i++ ) {
            coordArray[2*i]   = xCoords[i];
            coordArray[2*i+1] = yCoords[i];
        }
        var coordFloatArray = new Float32Array( coordArray );
        var coordBuffer = newStaticBuffer( coordFloatArray );
        var dim = 2;
        var count = coordFloatArray.length / dim;

        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {

            if ( blend ) {
                gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
                gl.enable( GL.BLEND );
            }

            // enable the shader
            program.use( gl );

            // set color and projection matrix variables
            u_Color.setData( gl, color );
            
            // set the projection matrix based on the axis bounds
            u_modelViewMatrix.setData( gl, glOrthoAxis( axis ) );

            // XXX: IE doesn't support lineWidth
            gl.lineWidth( thickness );

            // enable vertex attribute array corresponding to vPosition variable in shader
            gl.enableVertexAttribArray( 0 );

            // bind buffer data to vertex attribute array
            coordBuffer.bind( gl, GL.ARRAY_BUFFER );
            
            // first argument corresponds to the 0 attrib array set above
            // second argument indicates two coordinates per vertex
            gl.vertexAttribPointer( 0, dim, GL.FLOAT, false, 0, 0 );

            // draw the lines
            gl.drawArrays( GL.LINE_STRIP, 0, count );

            coordBuffer.unbind( gl, GL.ARRAY_BUFFER );
            program.endUse( gl );
        }
    }


}
