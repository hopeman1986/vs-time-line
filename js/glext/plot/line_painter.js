var webglext;
(function (webglext) {
    /**
     * Simple xy line painter which displays static data
     */
    function newXyLinePainter(axis, xCoords, yCoords, options) {
        var thickness = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.thickness) ? options.thickness : 4);
        var color = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.color) ? options.color : webglext.black);
        var blend = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.blend) ? options.blend : false);
        var program = new webglext.Program(webglext.modelview_VERTSHADER, webglext.solid_FRAGSHADER);
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        var u_modelViewMatrix = new webglext.UniformMatrix4f(program, 'u_modelViewMatrix');
        var coordArray = [];
        for (var i = 0; i < xCoords.length; i++) {
            coordArray[2 * i] = xCoords[i];
            coordArray[2 * i + 1] = yCoords[i];
        }
        var coordFloatArray = new Float32Array(coordArray);
        var coordBuffer = webglext.newStaticBuffer(coordFloatArray);
        var dim = 2;
        var count = coordFloatArray.length / dim;
        return function (gl, viewport) {
            if (blend) {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
            }
            // enable the shader
            program.use(gl);
            // set color and projection matrix variables
            u_Color.setData(gl, color);
            // set the projection matrix based on the axis bounds
            u_modelViewMatrix.setData(gl, webglext.glOrthoAxis(axis));
            // XXX: IE doesn't support lineWidth
            gl.lineWidth(thickness);
            // enable vertex attribute array corresponding to vPosition variable in shader
            gl.enableVertexAttribArray(0);
            // bind buffer data to vertex attribute array
            coordBuffer.bind(gl, webglext.GL.ARRAY_BUFFER);
            // first argument corresponds to the 0 attrib array set above
            // second argument indicates two coordinates per vertex
            gl.vertexAttribPointer(0, dim, webglext.GL.FLOAT, false, 0, 0);
            // draw the lines
            gl.drawArrays(webglext.GL.LINE_STRIP, 0, count);
            coordBuffer.unbind(gl, webglext.GL.ARRAY_BUFFER);
            program.endUse(gl);
        };
    }
    webglext.newXyLinePainter = newXyLinePainter;
})(webglext || (webglext = {}));
//# sourceMappingURL=line_painter.js.map