var webglext;
(function (webglext) {
    function newTimeseriesRowPaneFactory(rowOptions) {
        return function (drawable, timeAxis, dataAxis, model, row, ui, options) {
            var rowTopPadding = (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.rowTopPadding) ? rowOptions.rowTopPadding : 6);
            var rowBottomPadding = (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.rowBottomPadding) ? rowOptions.rowBottomPadding : 6);
            var axisWidth = (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.axisWidth) ? rowOptions.axisWidth : 60);
            var painterFactories = (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.painterFactories) ? rowOptions.painterFactories : []);
            var axisOptions = (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.axisOptions) ? rowOptions.axisOptions : {});
            var keyPrefix = options.isMaximized ? 'maximized-' : '';
            var getRowHeight = function () {
                // maximized rows do not specifiy a height (they should fill available space)
                if (options.isMaximized) {
                    return null;
                }
                // if the row has a custom row specified, use it
                else if (webglext.isNotEmpty(row.rowHeight)) {
                    return row.rowHeight;
                }
                // otherwise use the default for this RowPaneFactory
                else if (webglext.isNotEmpty(rowOptions) && webglext.isNotEmpty(rowOptions.rowHeight)) {
                    return rowOptions.rowHeight;
                }
                // as a last resort use a hard coded default
                else {
                    return 135;
                }
            };
            var rowHeight = getRowHeight();
            var timelineFont = options.timelineFont;
            var timelineFgColor = options.timelineFgColor;
            var draggableEdgeWidth = options.draggableEdgeWidth;
            var snapToDistance = options.snapToDistance;
            var rowUi = ui.rowUi(row.rowGuid);
            var input = ui.input;
            var selection = ui.selection;
            if (!webglext.isNotEmpty(axisOptions.font))
                axisOptions.font = timelineFont;
            if (!webglext.isNotEmpty(axisOptions.tickColor))
                axisOptions.tickColor = timelineFgColor;
            if (!webglext.isNotEmpty(axisOptions.textColor))
                axisOptions.textColor = timelineFgColor;
            if (!webglext.isNotEmpty(axisOptions.showLabel))
                axisOptions.showLabel = true;
            if (!webglext.isNotEmpty(axisOptions.shortenLabels))
                axisOptions.shortenLabels = false;
            var redraw = function () {
                drawable.redraw();
            };
            // setup pane for data (y) axis painter and mouse listener
            var yAxisPane = new webglext.Pane({ updatePrefSize: webglext.fixedSize(axisWidth, rowHeight) });
            dataAxis.limitsChanged.on(redraw);
            webglext.attachAxisMouseListeners1D(yAxisPane, dataAxis, true);
            // add listener to update the height of the row if the rowHeight attribute changes
            var updateRowHeight = function () {
                yAxisPane.layout = { updatePrefSize: webglext.fixedSize(axisWidth, getRowHeight()) };
            };
            row.attrsChanged.on(updateRowHeight);
            var underlayPane = new webglext.Pane(webglext.newOverlayLayout(), false);
            var overlayPane = new webglext.Pane(null, false);
            var painterOptions = { timelineFont: timelineFont, timelineFgColor: timelineFgColor, timelineThickness: 1, rowTopPadding: rowTopPadding, rowBottomPadding: rowBottomPadding };
            yAxisPane.addPainter(webglext.newEdgeAxisPainter(dataAxis, webglext.Side.RIGHT, axisOptions));
            rowUi.addPane(keyPrefix + 'overlay', overlayPane);
            rowUi.addPane(keyPrefix + 'underlay', underlayPane);
            rowUi.addPane(keyPrefix + 'y-axis', yAxisPane);
            row.timeseriesGuids.valueAdded.on(redraw);
            row.timeseriesGuids.valueMoved.on(redraw);
            row.timeseriesGuids.valueRemoved.on(redraw);
            var timeAtCoords_PMILLIS = function (viewport, i) {
                return timeAxis.tAtFrac_PMILLIS(viewport.xFrac(i));
            };
            var timeAtPointer_PMILLIS = function (ev) {
                return timeAtCoords_PMILLIS(ev.paneViewport, ev.i);
            };
            // Used by both sets of listeners to know whether a timeseries-drag is in progress
            var timeseriesDragMode = null;
            // Hook up input notifications
            //
            var recentMouseMove = null;
            var uiMillisPerPxChanged = function () {
                if (!webglext.isNotEmpty(timeseriesDragMode) && recentMouseMove != null) {
                    var ev = recentMouseMove;
                    input.timeHover.fire(timeAtPointer_PMILLIS(ev), ev);
                }
            };
            ui.millisPerPx.changed.on(uiMillisPerPxChanged);
            selection.hoveredAnnotation.changed.on(redraw);
            overlayPane.mouseExit.on(function () {
                selection.hoveredY.value = undefined;
                selection.hoveredAnnotation.value = null;
            });
            return underlayPane;
        };
    }
    webglext.newTimeseriesRowPaneFactory = newTimeseriesRowPaneFactory;
    function newTimeseriesPainterFactory(options) {
        // Painter Factory
        return function (drawable, timeAxis, dataAxis, model, rowModel, ui) {
            var selection = ui.selection;
            var defaultColor = webglext.isNotEmpty(options) && webglext.isNotEmpty(options.timelineFgColor) ? options.timelineFgColor : webglext.white;
            var defaultThickness = webglext.isNotEmpty(options) && webglext.isNotEmpty(options.timelineThickness) ? options.timelineThickness : 1;
            var modelview_pointsize_VERTSHADER = webglext.concatLines('    uniform mat4 u_modelViewMatrix;                       ', '    attribute vec4 a_Position;                            ', '    uniform float u_PointSize;                            ', '                                                          ', '    void main( ) {                                        ', '        gl_PointSize = u_PointSize ;                      ', '        gl_Position = u_modelViewMatrix * a_Position ;    ', '    }                                                     ', '                                                          ');
            var program = new webglext.Program(modelview_pointsize_VERTSHADER, webglext.solid_FRAGSHADER);
            var u_Color = new webglext.UniformColor(program, 'u_Color');
            var u_modelViewMatrix = new webglext.UniformMatrix4f(program, 'u_modelViewMatrix');
            var a_Position = new webglext.Attribute(program, 'a_Position');
            var u_PointSize = new webglext.Uniform1f(program, 'u_PointSize');
            var axis = new webglext.Axis2D(timeAxis, dataAxis);
            var xys = new Float32Array(0);
            var xysBuffer = webglext.newDynamicBuffer();
            // Painter
            return function (gl, viewport) {
                gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
                gl.enable(webglext.GL.BLEND);
                // enable the shader
                program.use(gl);
                u_modelViewMatrix.setData(gl, webglext.glOrthoAxis(axis));
                a_Position.disable(gl);
                program.endUse(gl);
            };
        };
    }
    webglext.newTimeseriesPainterFactory = newTimeseriesPainterFactory;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_timeseries_row.js.map