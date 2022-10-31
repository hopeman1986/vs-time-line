module webglext {
    
    export interface HeatmapPainterOptions {
        blend?     : boolean;
    }
    
    export interface HeatMapData {
        // matrix data stored x-major
        array : Float32Array;
        
        // size of the matrix
        xSize : number;
        ySize : number;
        
        // bounds of the matrix in axis coordinates
        xMin : number;
        xMax : number;
        yMin : number;
        yMax : number;
    }
    
    
    export var heatmap_VERTSHADER = concatLines(
        '                                                          ',
        '    uniform mat4 u_modelViewMatrix;                       ',
        '    attribute vec4 a_vertCoord;                           ',
        '    attribute vec2 a_texCoord;                            ',
        '    varying vec2 v_texCoord;                              ',
        '                                                          ',
        '    void main( ) {                                        ',
        '        gl_Position = u_modelViewMatrix * a_vertCoord;    ',
        '        v_texCoord = a_texCoord;                          ',
        '    }                                                     ',
        '                                                          '
    );
    
    
    export var heatmap_FRAGSHADER = concatLines(
        '                                 ',
        '  precision highp float;         ',
        '  uniform sampler2D u_dataTex;   ',
        '  uniform sampler2D u_colorTex;  ',
        '  uniform float u_dataMin;       ',
        '  uniform float u_dataMax;       ',
        '                                 ',
        '  varying vec2 v_texCoord;       ',
        '                                                                                   ',
        '  void main()                                                                      ',
        '  {                                                                                ',
        '     float dataVal = texture2D( u_dataTex, v_texCoord ).r;                         ',
        '     float normalizedVal = ( dataVal - u_dataMin ) / ( u_dataMax - u_dataMin );    ',
        '     clamp( normalizedVal, 0.0, 1.0 );                                             ',
        '                                                                                   ',
        '     vec4 color = texture2D( u_colorTex, vec2( normalizedVal, 0 ) );               ',
        '     gl_FragColor = color;                                                         ',
        '     gl_FragColor.a = 1.0;                                                         ',
        '  }                                                                                '
    );

    /**
     * Simple heatmap painter which displays a 2d matrix of static data
     */
    export function newHeatmapPainter( axis : Axis2D, colorAxis : Axis1D, data : HeatMapData, colorTexture : Texture, options? : HeatmapPainterOptions ) : Painter {
   
        var blend     = ( isNotEmpty( options ) && isNotEmpty( options.blend )     ? options.blend     : false );
        
        // only GL_RGBA is supported with GL_FLOAT texture type in webgl (see texture.ts)
        // we we currently need an array 4 times bigger than necessary in order to use FLOATS
        // to store the matrix data in a texture
        var array = new Float32Array( data.xSize * data.ySize * 4 );
        for ( var x = 0 ; x < data.xSize ; x++ ) {
            for ( var y = 0 ; y < data.ySize ; y++ ) {
                var index = x * data.ySize + y;
                var value = data.array[ index ];
                
                array[ 4*index ] =  value;
                array[ 4*index + 1 ] = value;
                array[ 4*index + 2 ] = value;
                array[ 4*index + 3 ] = value;
            }
        }
        data.array = array;
        
        var program = new Program( heatmap_VERTSHADER, heatmap_FRAGSHADER );
        var u_modelViewMatrix = new UniformMatrix4f( program, 'u_modelViewMatrix' );
        var u_dataTexture = new UniformSampler2D( program, 'u_dataTex' );
        var u_colorTexture = new UniformSampler2D( program, 'u_colorTex' );
        var u_dataMin = new Uniform1f( program, 'u_dataMin' );
        var u_dataMax = new Uniform1f( program, 'u_dataMax' );
        var a_vertCoord = new Attribute( program, 'a_vertCoord' );
        var a_texCoord = new Attribute( program, 'a_texCoord' );
        
        var texture = new FloatDataTexture2D( data.xSize, data.ySize, data.array );

        // points in triangle strip
        var vertCoordArray = [ data.xMin, data.yMax, data.xMax, data.yMax, data.xMin, data.yMin, data.xMax, data.yMin ];
        var vertCoordFloatArray = new Float32Array( vertCoordArray );
        var vertCoordBuffer = newStaticBuffer( vertCoordFloatArray );
        
        // texture coordinates
        var texCoordArray = [ 0, 1, 1, 1, 0, 0, 1, 0 ];
        var texCoordFloatArray = new Float32Array( texCoordArray );
        var texCoordBuffer = newStaticBuffer( texCoordFloatArray );
        
        var dim = 2;
        var vertexCount = 4;
        
        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
        
            if ( blend ) {
                gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
                gl.enable( GL.BLEND );
            }
            
            program.use( gl );
            u_dataTexture.setDataAndBind( gl, 0, texture );
            u_colorTexture.setDataAndBind( gl, 1, colorTexture );
            u_modelViewMatrix.setData( gl, glOrthoAxis( axis ) );
            
            u_dataMin.setData( gl, colorAxis.vMin );
            u_dataMax.setData( gl, colorAxis.vMax );
            
            a_vertCoord.setDataAndEnable( gl, vertCoordBuffer, dim, GL.FLOAT );
            a_texCoord.setDataAndEnable( gl, texCoordBuffer, dim, GL.FLOAT );
            
            gl.drawArrays( GL.TRIANGLE_STRIP, 0, vertexCount );
            
            a_vertCoord.disable( gl );
            a_texCoord.disable( gl );
            u_dataTexture.unbind( gl );
            u_colorTexture.unbind( gl );
            program.endUse( gl );
        };
    }
 }