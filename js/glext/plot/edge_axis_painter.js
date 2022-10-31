var webglext;
(function (webglext) {
    function edgeMarks_VERTSHADER(labelSide) {
        // The shader uses 'a' for the along-axis coord, and 'b' for the across-axis coord
        var horizontal = (labelSide === webglext.Side.TOP || labelSide === webglext.Side.BOTTOM);
        var bFlip = (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.BOTTOM);
        return webglext.concatLines(webglext.nearestPixelCenter_GLSLFUNC, '                                                                                               ', '  uniform float u_VMin;                                                                        ', '  uniform float u_VSize;                                                                       ', '  uniform vec2 u_ViewportSize;                                                                 ', '  uniform float u_MarkSize;                                                                    ', '                                                                                               ', '  attribute vec2 a_VCoord;                                                                     ', '                                                                                               ', '  void main( ) {                                                                               ', '      float aViewportSize = ' + (horizontal ? 'u_ViewportSize.x' : 'u_ViewportSize.y') + ';  ', '      float aFrac = nearestPixelCenter( ( a_VCoord.x - u_VMin ) / u_VSize, aViewportSize );    ', '      float a = -1.0 + 2.0*( aFrac );                                                          ', '                                                                                               ', '      float bViewportSize = ' + (horizontal ? 'u_ViewportSize.y' : 'u_ViewportSize.x') + ';  ', '      float bFrac = ( a_VCoord.y * u_MarkSize ) / bViewportSize;                               ', '      float b = ' + (bFlip ? '-' : '') + '( -1.0 + 2.0*( bFrac ) );                         ', '                                                                                               ', '      gl_Position = vec4( ' + (horizontal ? 'a,b' : 'b,a') + ', 0.0, 1.0 );                  ', '  }                                                                                            ', '                                                                                               ');
    }
    webglext.edgeMarks_VERTSHADER = edgeMarks_VERTSHADER;
    webglext.gradient_FRAGSHADER = webglext.concatLines('                                 ', '  precision highp float;         ', '  uniform sampler2D u_colorTex;  ', '                                 ', '  varying vec2 v_texCoord;       ', '                                                                                   ', '  void main( ) {                                                                   ', '     vec4 color = texture2D( u_colorTex, v_texCoord );                             ', '     gl_FragColor = color;                                                         ', '     gl_FragColor.a = 1.0;                                                         ', '  }                                                                                ');
    function newEdgeAxisPainter(axis, labelSide, options) {
        var tickSpacing = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickSpacing) ? options.tickSpacing : 100);
        var label = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.label) ? options.label : '');
        var units = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.units) ? options.units : '');
        var shortenLabels = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.shortenLabels) ? options.shortenLabels : true);
        var font = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.font) ? options.font : '11px verdana,sans-serif');
        var textColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.textColor) ? options.textColor : webglext.black);
        var tickColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickColor) ? options.tickColor : webglext.black);
        var tickSize = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickSize) ? options.tickSize : 6);
        var showLabel = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.showLabel) ? options.showLabel : true);
        var showBorder = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.showBorder) ? options.showBorder : false);
        var tickLabeler = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickLabeler) ? options.tickLabeler : undefined);
        var tickPositions = new Float32Array(0);
        var borderProgram = new webglext.Program(webglext.modelview_VERTSHADER, webglext.solid_FRAGSHADER);
        var borderProgram_a_Position = new webglext.Attribute(borderProgram, 'a_Position');
        var borderProgram_u_modelViewMatrix = new webglext.UniformMatrix4f(borderProgram, 'u_modelViewMatrix');
        var borderProgram_u_Color = new webglext.UniformColor(borderProgram, 'u_Color');
        var borderCoords = new Float32Array(0);
        var borderCoordsBuffer = webglext.newDynamicBuffer();
        var marksProgram = new webglext.Program(edgeMarks_VERTSHADER(labelSide), webglext.solid_FRAGSHADER);
        var marksProgram_u_VMin = new webglext.Uniform1f(marksProgram, 'u_VMin');
        var marksProgram_u_VSize = new webglext.Uniform1f(marksProgram, 'u_VSize');
        var marksProgram_u_ViewportSize = new webglext.Uniform2f(marksProgram, 'u_ViewportSize');
        var marksProgram_u_MarkSize = new webglext.Uniform1f(marksProgram, 'u_MarkSize');
        var marksProgram_u_Color = new webglext.UniformColor(marksProgram, 'u_Color');
        var marksProgram_a_VCoord = new webglext.Attribute(marksProgram, 'a_VCoord');
        var markCoords = new Float32Array(0);
        var markCoordsBuffer = webglext.newDynamicBuffer();
        var textTextures = webglext.newTextTextureCache(font, textColor);
        var textureRenderer = new webglext.TextureRenderer();
        var hTickLabels = textTextures.value('-0.123456789').h;
        var isVerticalAxis = (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.RIGHT);
        return function (gl, viewport) {
            var sizePixels = isVerticalAxis ? viewport.h : viewport.w;
            if (sizePixels === 0)
                return;
            var approxNumTicks = sizePixels / tickSpacing;
            var tickInterval = webglext.getTickInterval(axis, approxNumTicks);
            var tickCount = webglext.getTickCount(axis, tickInterval);
            tickPositions = webglext.ensureCapacityFloat32(tickPositions, tickCount);
            webglext.getTickPositions(axis, tickInterval, tickCount, tickPositions);
            if (showBorder) {
                borderCoords = webglext.ensureCapacityFloat32(borderCoords, 10);
                var horizontal = (labelSide === webglext.Side.TOP || labelSide === webglext.Side.BOTTOM);
                var bFlip = (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.BOTTOM);
                var width = viewport.w - 1;
                var height = viewport.h - 1;
                borderCoords[0] = horizontal ? 0 : (bFlip ? width - tickSize : 0);
                borderCoords[1] = !horizontal ? 0 : (bFlip ? height - tickSize : 0);
                borderCoords[2] = horizontal ? 0 : (bFlip ? width : tickSize);
                borderCoords[3] = !horizontal ? 0 : (bFlip ? height : tickSize);
                borderCoords[4] = horizontal ? width : (bFlip ? width : tickSize);
                borderCoords[5] = !horizontal ? height : (bFlip ? height : tickSize);
                borderCoords[6] = horizontal ? width : (bFlip ? width - tickSize : 0);
                borderCoords[7] = !horizontal ? height : (bFlip ? height - tickSize : 0);
                // finish off the box (same as 0, 1 coordinates)
                borderCoords[8] = horizontal ? 0 : (bFlip ? width - tickSize : 0);
                borderCoords[9] = !horizontal ? 0 : (bFlip ? height - tickSize : 0);
            }
            if (showBorder) {
                borderProgram.use(gl);
                borderProgram_u_Color.setData(gl, tickColor);
                borderProgram_u_modelViewMatrix.setData(gl, webglext.glOrthoViewport(viewport));
                borderCoordsBuffer.setData(borderCoords.subarray(0, 10));
                borderProgram_a_Position.setDataAndEnable(gl, borderCoordsBuffer, 2, webglext.GL.FLOAT);
                // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
                gl.lineWidth(1);
                gl.drawArrays(webglext.GL.LINE_STRIP, 0, 5);
                borderProgram_a_Position.disable(gl);
                borderProgram.endUse(gl);
            }
            // Tick marks
            //
            marksProgram.use(gl);
            marksProgram_u_VMin.setData(gl, axis.vMin);
            marksProgram_u_VSize.setData(gl, axis.vSize);
            marksProgram_u_ViewportSize.setData(gl, viewport.w, viewport.h);
            marksProgram_u_MarkSize.setData(gl, tickSize);
            marksProgram_u_Color.setData(gl, tickColor);
            markCoords = webglext.ensureCapacityFloat32(markCoords, 4 * tickCount);
            for (var n = 0; n < tickCount; n++) {
                var v = tickPositions[n];
                markCoords[(4 * n + 0)] = v;
                markCoords[(4 * n + 1)] = 0;
                markCoords[(4 * n + 2)] = v;
                markCoords[(4 * n + 3)] = 1;
            }
            markCoordsBuffer.setData(markCoords.subarray(0, 4 * tickCount));
            marksProgram_a_VCoord.setDataAndEnable(gl, markCoordsBuffer, 2, webglext.GL.FLOAT);
            // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
            gl.lineWidth(1);
            gl.drawArrays(webglext.GL.LINES, 0, 2 * tickCount);
            marksProgram_a_VCoord.disable(gl);
            marksProgram.endUse(gl);
            // Tick labels
            //
            gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
            gl.enable(webglext.GL.BLEND);
            var orderAxisRaw = webglext.order(Math.abs(axis.vSize));
            var orderAxis = 0;
            if (orderAxisRaw > 0) {
                orderAxis = Math.floor((orderAxisRaw - 1) / 3) * 3;
            }
            else if (orderAxisRaw < 0) {
                orderAxis = (Math.ceil(orderAxisRaw / 3) - 1) * 3;
            }
            var orderFactor = Math.pow(10, -orderAxis);
            var orderTick = webglext.order(tickInterval);
            var precision = Math.max(0, orderAxis - orderTick);
            textTextures.resetTouches();
            textureRenderer.begin(gl, viewport);
            for (var n = 0; n < tickCount; n++) {
                var v = tickPositions[n];
                var vFrac = axis.vFrac(v);
                if (vFrac < 0 || vFrac >= 1)
                    continue;
                var tickLabel;
                if (tickLabeler) {
                    // show custom tick value
                    tickLabel = tickLabeler(v, axis, tickInterval);
                }
                else if (shortenLabels && showLabel) {
                    // show shortened tick value
                    tickLabel = Number(v * orderFactor).toFixed(precision);
                }
                else if (!shortenLabels) {
                    // show actual tick value
                    if (orderAxisRaw >= 0) {
                        tickLabel = Number(v).toFixed(0);
                    }
                    else {
                        tickLabel = Number(v).toFixed(-orderAxisRaw);
                    }
                }
                else {
                    // show magnitude inline for each tick
                    tickLabel = Number(v * orderFactor).toFixed(precision) + (orderAxis === 0 ? '' : 'e' + orderAxis);
                }
                var textTexture = textTextures.value(tickLabel);
                var xFrac;
                var yFrac;
                if (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.RIGHT) {
                    var yAnchor = textTexture.yAnchor(0.43);
                    var j0 = (vFrac * viewport.h) - yAnchor * textTexture.h;
                    var j = webglext.clamp(0, viewport.h - textTexture.h, j0);
                    yFrac = j / viewport.h;
                    if (labelSide === webglext.Side.LEFT) {
                        xFrac = (viewport.w - tickSize - 2 - textTexture.w) / viewport.w;
                    }
                    else {
                        xFrac = (tickSize + 2) / viewport.w;
                    }
                }
                else {
                    var wMinus = 0;
                    if (v < 0) {
                        var absTickLabel = Number(Math.abs(v) * orderFactor).toFixed(precision);
                        wMinus = textTexture.w - textTextures.value(absTickLabel).w;
                    }
                    var xAnchor = 0.45;
                    var i0 = (vFrac * viewport.w) - xAnchor * (textTexture.w - wMinus) - wMinus;
                    var i = webglext.clamp(0, viewport.w - textTexture.w, i0);
                    xFrac = i / viewport.w;
                    if (labelSide === webglext.Side.BOTTOM) {
                        yFrac = (viewport.h - tickSize - 2 - hTickLabels) / viewport.h;
                    }
                    else {
                        yFrac = (tickSize + 2) / viewport.h;
                    }
                }
                textureRenderer.draw(gl, textTexture, xFrac, yFrac, { xAnchor: 0, yAnchor: 0 });
            }
            // Axis label
            //
            if (showLabel) {
                var unitsString = units + (!shortenLabels || orderAxis === 0 ? '' : ' x 10^' + orderAxis.toFixed(0));
                var axisLabel = label + (unitsString ? ' (' + unitsString + ')' : '');
                if (axisLabel !== '') {
                    var textTexture = textTextures.value(axisLabel);
                    var xFrac;
                    var yFrac;
                    var textOpts;
                    if (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.RIGHT) {
                        // Using hTickLabels here works out about right, even though the tick-label text is horizontal
                        var xFrac0 = 0.5 * (viewport.w - tickSize - 2 - hTickLabels) / viewport.w;
                        xFrac = (labelSide === webglext.Side.LEFT ? xFrac0 : 1 - xFrac0);
                        yFrac = 0.5;
                        textOpts = { xAnchor: textTexture.yAnchor(0.5),
                            yAnchor: 0.5,
                            rotation_CCWRAD: 0.5 * Math.PI };
                    }
                    else {
                        var yFrac0 = 0.5 * (viewport.h - tickSize - 2 - hTickLabels) / viewport.h;
                        yFrac = (labelSide === webglext.Side.BOTTOM ? yFrac0 : 1 - yFrac0);
                        xFrac = 0.5;
                        textOpts = { xAnchor: 0.5,
                            yAnchor: textTexture.yAnchor(0.5),
                            rotation_CCWRAD: 0 };
                    }
                    textureRenderer.draw(gl, textTexture, xFrac, yFrac, textOpts);
                }
            }
            // Finish up
            //
            textureRenderer.end(gl);
            textTextures.retainTouched();
        };
    }
    webglext.newEdgeAxisPainter = newEdgeAxisPainter;
})(webglext || (webglext = {}));
//# sourceMappingURL=edge_axis_painter.js.map