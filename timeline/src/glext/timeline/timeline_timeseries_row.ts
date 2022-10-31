module webglext {

    export interface TimelineTimeseriesPainterOptions {
        timelineFont : string;
        timelineFgColor : Color;
        timelineThickness : number;
        rowTopPadding : number;
        rowBottomPadding : number;
    }
    
    export interface TimelineTimeseriesPainterFactory {
        ( drawable : Drawable, timeAxis : TimeAxis1D, dataAxis : Axis1D, model : TimelineModel, rowModel : TimelineRowModel, ui : TimelineUi, options : TimelineTimeseriesPainterOptions ) : Painter;
    }
    
    export interface TimelineTimeseriesRowPaneOptions {
        rowHeight?        : number;
        rowTopPadding?    : number;
        rowBottomPadding? : number;
        axisOptions?      : EdgeAxisPainterOptions;
        axisWidth?        : number
        painterFactories? : TimelineTimeseriesPainterFactory[];
    }
    
    export function newTimeseriesRowPaneFactory( rowOptions? : TimelineTimeseriesRowPaneOptions ) : TimelineRowPaneFactory {
        return function( drawable : Drawable, timeAxis : TimeAxis1D, dataAxis : Axis1D, model : TimelineModel, row : TimelineRowModel, ui : TimelineUi, options : TimelineRowPaneOptions ) : Pane {
            
            var rowTopPadding       = ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.rowTopPadding    ) ? rowOptions.rowTopPadding    : 6 );
            var rowBottomPadding    = ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.rowBottomPadding ) ? rowOptions.rowBottomPadding : 6 );
            var axisWidth           = ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.axisWidth ) ? rowOptions.axisWidth : 60 );
            var painterFactories    = ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.painterFactories ) ? rowOptions.painterFactories : [] );
            var axisOptions         = ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.axisOptions ) ? rowOptions.axisOptions : {} );
            
            var keyPrefix = options.isMaximized ? 'maximized-' : '';
            
            var getRowHeight = function( ) {
                // maximized rows do not specifiy a height (they should fill available space)
                if ( options.isMaximized ) {
                    return null;
                }
                // if the row has a custom row specified, use it
                else if ( isNotEmpty( row.rowHeight ) ) {
                    return row.rowHeight;
                }
                // otherwise use the default for this RowPaneFactory
                else if ( isNotEmpty( rowOptions ) && isNotEmpty( rowOptions.rowHeight ) ) {
                    return rowOptions.rowHeight;
                }
                // as a last resort use a hard coded default
                else {
                    return 135;
                }
            }
            
            var rowHeight : number = getRowHeight( );
            
            var timelineFont       = options.timelineFont;
            var timelineFgColor    = options.timelineFgColor;
            var draggableEdgeWidth = options.draggableEdgeWidth;
            var snapToDistance     = options.snapToDistance;

            var rowUi = ui.rowUi( row.rowGuid );
            var input = ui.input;
            var selection = ui.selection;
            
            if ( !isNotEmpty( axisOptions.font ) ) axisOptions.font = timelineFont;
            if ( !isNotEmpty( axisOptions.tickColor ) ) axisOptions.tickColor = timelineFgColor;
            if ( !isNotEmpty( axisOptions.textColor ) ) axisOptions.textColor = timelineFgColor;
            if ( !isNotEmpty( axisOptions.showLabel ) ) axisOptions.showLabel = true;
            if ( !isNotEmpty( axisOptions.shortenLabels ) ) axisOptions.shortenLabels = false;
            
            var redraw = function( ) {
                drawable.redraw( );
            };

            // setup pane for data (y) axis painter and mouse listener
            var yAxisPane = new Pane( { updatePrefSize: fixedSize( axisWidth, rowHeight ) } );
            dataAxis.limitsChanged.on( redraw );
            attachAxisMouseListeners1D( yAxisPane, dataAxis, true );
            
            // add listener to update the height of the row if the rowHeight attribute changes
            var updateRowHeight = function( ) {
                yAxisPane.layout = { updatePrefSize: fixedSize( axisWidth, getRowHeight( ) ) };
            };
            row.attrsChanged.on( updateRowHeight );
            
          var underlayPane = new Pane( newOverlayLayout( ), false );
            var overlayPane = new Pane( null, false );
            
            var painterOptions = { timelineFont: timelineFont, timelineFgColor: timelineFgColor, timelineThickness: 1, rowTopPadding: rowTopPadding, rowBottomPadding: rowBottomPadding };
           
            
            yAxisPane.addPainter( newEdgeAxisPainter( dataAxis, Side.RIGHT, axisOptions ) );
            rowUi.addPane( keyPrefix+'overlay', overlayPane );
            rowUi.addPane( keyPrefix+'underlay', underlayPane );
            rowUi.addPane( keyPrefix+'y-axis', yAxisPane );

            row.timeseriesGuids.valueAdded.on( redraw );
            row.timeseriesGuids.valueMoved.on( redraw );
            row.timeseriesGuids.valueRemoved.on( redraw );
            
                
            var timeAtCoords_PMILLIS = function( viewport : BoundsUnmodifiable, i : number ) : number {
                return timeAxis.tAtFrac_PMILLIS( viewport.xFrac( i ) );
            };
            
            var timeAtPointer_PMILLIS = function( ev : PointerEvent ) : number {
                return timeAtCoords_PMILLIS( ev.paneViewport, ev.i );
            };
            
            // Used by both sets of listeners to know whether a timeseries-drag is in progress
            var timeseriesDragMode : string = null;

            // Hook up input notifications
            //

            var recentMouseMove : PointerEvent = null;

            var uiMillisPerPxChanged = function( ) {
                if ( !isNotEmpty( timeseriesDragMode ) && recentMouseMove != null ) {
                    var ev = recentMouseMove;
                    input.timeHover.fire( timeAtPointer_PMILLIS( ev ), ev );
                }
            };
            ui.millisPerPx.changed.on( uiMillisPerPxChanged );
         
         
            selection.hoveredAnnotation.changed.on( redraw );
            
            overlayPane.mouseExit.on( function( ) {
                selection.hoveredY.value = undefined;
                selection.hoveredAnnotation.value = null;
            } );
             
            return underlayPane;
        }
    }
                    
    export function newTimeseriesPainterFactory( options? : TimelineTimeseriesPainterOptions ) : TimelineTimeseriesPainterFactory {
        // Painter Factory
        return function( drawable : Drawable, timeAxis : TimeAxis1D, dataAxis : Axis1D, model : TimelineModel, rowModel : TimelineRowModel, ui : TimelineUi ) : Painter {
            
            var selection : TimelineSelectionModel = ui.selection;
            var defaultColor = isNotEmpty( options ) && isNotEmpty( options.timelineFgColor ) ? options.timelineFgColor : white;
            var defaultThickness = isNotEmpty( options ) && isNotEmpty( options.timelineThickness ) ? options.timelineThickness : 1;
            
            var modelview_pointsize_VERTSHADER = concatLines(
                    '    uniform mat4 u_modelViewMatrix;                       ',
                    '    attribute vec4 a_Position;                            ',
                    '    uniform float u_PointSize;                            ',
                    '                                                          ',
                    '    void main( ) {                                        ',
                    '        gl_PointSize = u_PointSize ;                      ',
                    '        gl_Position = u_modelViewMatrix * a_Position ;    ',
                    '    }                                                     ',
                    '                                                          '
            );
            
            var program = new Program( modelview_pointsize_VERTSHADER, solid_FRAGSHADER );
            var u_Color = new UniformColor( program, 'u_Color' );
            var u_modelViewMatrix = new UniformMatrix4f( program, 'u_modelViewMatrix' );
            var a_Position = new Attribute( program, 'a_Position' );
            var u_PointSize = new Uniform1f( program, 'u_PointSize' );
            
            var axis = new Axis2D( timeAxis, dataAxis );
            
            var xys = new Float32Array( 0 );
            var xysBuffer = newDynamicBuffer( );
           
            // Painter
            return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
           
                gl.blendFuncSeparate( GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA );
                gl.enable( GL.BLEND );
                
                // enable the shader
                program.use( gl );
                
                u_modelViewMatrix.setData( gl, glOrthoAxis( axis ) );
                
                a_Position.disable( gl );
                program.endUse( gl );
            }
        }    
    }
}
