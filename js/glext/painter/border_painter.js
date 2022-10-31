var webglext;
(function (webglext) {
    function newBorderPainter(color, options) {
        if (!webglext.isNotEmpty(options))
            options = {};
        if (!webglext.isNotEmpty(options.drawTop))
            options.drawTop = true;
        if (!webglext.isNotEmpty(options.drawLeft))
            options.drawLeft = true;
        if (!webglext.isNotEmpty(options.drawRight))
            options.drawRight = true;
        if (!webglext.isNotEmpty(options.drawBottom))
            options.drawBottom = true;
        if (!webglext.isNotEmpty(options.thickness))
            options.thickness = 1;
        var simple = (options.thickness === 1 && color.a >= 1);
        return (simple ? newSimpleBorderPainter(color, options) : newFullBorderPainter(color, options));
    }
    webglext.newBorderPainter = newBorderPainter;
    function newFullBorderPainter(color, options) {
        var drawTop = options.drawTop;
        var drawLeft = options.drawLeft;
        var drawRight = options.drawRight;
        var drawBottom = options.drawBottom;
        var thickness = options.thickness;
        var program = new webglext.Program(webglext.xyNdc_VERTSHADER, webglext.solid_FRAGSHADER);
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        var a_XyNdc = new webglext.Attribute(program, 'a_XyNdc');
        var numVertices = (drawTop ? 6 : 0) + (drawLeft ? 6 : 0) + (drawRight ? 6 : 0) + (drawBottom ? 6 : 0);
        var xy_NDC = new Float32Array(2 * numVertices);
        var xyBuffer_NDC = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            if (color.a >= 1) {
                gl.disable(webglext.GL.BLEND);
            }
            else {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
            }
            program.use(gl);
            u_Color.setData(gl, color);
            var w_NDC = 2 * thickness / viewport.w;
            var h_NDC = 2 * thickness / viewport.h;
            var index = 0;
            if (drawTop)
                index = webglext.putQuadXys(xy_NDC, index, -1, (drawRight ? +1 - w_NDC : +1), +1, +1 - h_NDC);
            if (drawRight)
                index = webglext.putQuadXys(xy_NDC, index, +1 - w_NDC, +1, +1, (drawBottom ? -1 + h_NDC : -1));
            if (drawBottom)
                index = webglext.putQuadXys(xy_NDC, index, (drawLeft ? -1 + w_NDC : -1), +1, -1 + h_NDC, -1);
            if (drawLeft)
                index = webglext.putQuadXys(xy_NDC, index, -1, -1 + w_NDC, (drawTop ? +1 - h_NDC : +1), -1);
            xyBuffer_NDC.setData(xy_NDC);
            a_XyNdc.setDataAndEnable(gl, xyBuffer_NDC, 2, webglext.GL.FLOAT);
            gl.drawArrays(webglext.GL.TRIANGLES, 0, numVertices);
            a_XyNdc.disable(gl);
            program.endUse(gl);
        };
    }
    function newSimpleBorderPainter(color, options) {
        var drawTop = options.drawTop;
        var drawLeft = options.drawLeft;
        var drawRight = options.drawRight;
        var drawBottom = options.drawBottom;
        var program = new webglext.Program(webglext.xyNdc_VERTSHADER, webglext.solid_FRAGSHADER);
        var u_Color = new webglext.UniformColor(program, 'u_Color');
        var a_XyNdc = new webglext.Attribute(program, 'a_XyNdc');
        var numVertices = (drawTop ? 2 : 0) + (drawLeft ? 2 : 0) + (drawRight ? 2 : 0) + (drawBottom ? 2 : 0);
        var xy_NDC = new Float32Array(2 * numVertices);
        var xyBuffer_NDC = webglext.newDynamicBuffer();
        return function (gl, viewport) {
            gl.disable(webglext.GL.BLEND);
            program.use(gl);
            u_Color.setData(gl, color);
            var left_NDC = webglext.fracToNdc(0.5 / viewport.w);
            var bottom_NDC = webglext.fracToNdc(0.5 / viewport.h);
            var right_NDC = webglext.fracToNdc((viewport.w - 0.5) / viewport.w);
            var top_NDC = webglext.fracToNdc((viewport.h - 0.5) / viewport.h);
            var n = 0;
            if (drawTop) {
                xy_NDC[n++] = -1;
                xy_NDC[n++] = top_NDC;
                xy_NDC[n++] = +1;
                xy_NDC[n++] = top_NDC;
            }
            if (drawRight) {
                xy_NDC[n++] = right_NDC;
                xy_NDC[n++] = +1;
                xy_NDC[n++] = right_NDC;
                xy_NDC[n++] = -1;
            }
            if (drawBottom) {
                xy_NDC[n++] = +1;
                xy_NDC[n++] = bottom_NDC;
                xy_NDC[n++] = -1;
                xy_NDC[n++] = bottom_NDC;
            }
            if (drawLeft) {
                xy_NDC[n++] = left_NDC;
                xy_NDC[n++] = -1;
                xy_NDC[n++] = left_NDC;
                xy_NDC[n++] = +1;
            }
            xyBuffer_NDC.setData(xy_NDC);
            a_XyNdc.setDataAndEnable(gl, xyBuffer_NDC, 2, webglext.GL.FLOAT);
            // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
            gl.lineWidth(1);
            gl.drawArrays(webglext.GL.LINES, 0, numVertices);
            a_XyNdc.disable(gl);
            program.endUse(gl);
        };
    }
})(webglext || (webglext = {}));
//# sourceMappingURL=border_painter.js.map