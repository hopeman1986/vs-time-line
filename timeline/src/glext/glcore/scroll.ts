// this is scroll layout
module webglext {


    export interface VerticalScrollLayout extends Layout {
        jOffset : number;
        hContent : number;
        hVisible : number;
    }


    export function newVerticalScrollLayout( ) : VerticalScrollLayout {
        var layout = {

            updatePrefSize: function( parentPrefSize : Size, children : LayoutEntry[] ) {
                if ( children.length === 1 ) {
                    var childPrefSize = children[ 0 ].prefSize;

                    // XXX: Need some way to override the child's pref-height
                    if ( !isNotEmpty( childPrefSize.h ) ) {
                        throw new Error( 'Vertical-scroll layout requires child to have a defined pref-height, but its pref-height is ' + childPrefSize.h );
                    }

                    parentPrefSize.w = childPrefSize.w;
                    parentPrefSize.h = childPrefSize.h;
                }
                else if ( children.length > 1 ) {
                    throw new Error( 'Vertical-scroll layout only works with 1 child, but pane has ' + this.children.length + ' children' );
                }
            },

            jOffset: 0,
            hContent: 0,
            hVisible: 0,

            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                if ( children.length === 1 ) {
                    var child = children[ 0 ];

                    var j;
                    var h = child.prefSize.h;
                    if ( h <= parentViewport.h ) {
                        j = parentViewport.jEnd - h;
                    }
                    else {
                        j = Math.min( parentViewport.j, parentViewport.jEnd - h + Math.max( 0, Math.round( layout.jOffset ) ) );
                    }

                    child.viewport.setRect( parentViewport.i, j, parentViewport.w, h );

                    layout.jOffset = ( j + h ) - parentViewport.jEnd;
                    layout.hContent = h;
                    layout.hVisible = parentViewport.h;
                }
                else if ( children.length > 1 ) {
                    throw new Error( 'Vertical-scroll layout only works with 1 child, but pane has ' + this.children.length + ' children' );
                }
            }

        };
        return layout;
    }


    export interface ScrollbarOptions {
        fgColor? : Color;
        bgColor? : Color;
        borderColor? : Color;
        borderThickness? : number;
        borderTop? : boolean;
        borderLeft? : boolean;
        borderRight? : boolean;
        borderBottom? : boolean;
    }


    export function newVerticalScrollbar( scrollLayout : VerticalScrollLayout, drawable : Drawable, options? : ScrollbarOptions ) : Pane {
        var bgColor = ( isNotEmpty( options ) && isNotEmpty( options.bgColor ) ? options.bgColor : gray( 0.9 ) );

        var scrollbar = new Pane( null );
        scrollbar.addPainter( newBackgroundPainter( bgColor ) );
        scrollbar.addPainter( newVerticalScrollbarPainter( scrollLayout, options ) );

        attachVerticalScrollMouseListeners( scrollbar, scrollLayout, drawable );

        return scrollbar;
    }


    export function newVerticalScrollbarPainter( scrollLayout : VerticalScrollLayout, options? : ScrollbarOptions ) : Painter {
        var fgColor     = ( isNotEmpty( options ) && isNotEmpty( options.fgColor )     ? options.fgColor     : gray( 0.56 ) );
        var borderColor = ( isNotEmpty( options ) && isNotEmpty( options.borderColor ) ? options.borderColor : gray( 0.42 ) );
        var borderThickness = ( isNotEmpty( options ) && isNotEmpty( options.borderThickness ) ? options.borderThickness : 1 );
        var borderTop = ( isNotEmpty( options ) && isNotEmpty( options.borderTop ) ? options.borderTop : true );
        var borderLeft = ( isNotEmpty( options ) && isNotEmpty( options.borderLeft ) ? options.borderLeft : false );
        var borderRight = ( isNotEmpty( options ) && isNotEmpty( options.borderRight ) ? options.borderRight : false );
        var borderBottom = ( isNotEmpty( options ) && isNotEmpty( options.borderBottom ) ? options.borderBottom : true );

        var program = new Program( xyFrac_VERTSHADER, solid_FRAGSHADER );
        var u_Color = new UniformColor( program, 'u_Color' );
        var a_XyFrac = new Attribute( program, 'a_XyFrac' );

        var numFillVertices = 6;
        var numBorderVertices = ( borderTop ? 6 : 0 ) + ( borderLeft ? 6 : 0 ) + ( borderRight ? 6 : 0 ) + ( borderBottom ? 6 : 0 );
        var xyFrac = new Float32Array( 2 * Math.max( numFillVertices, numBorderVertices ) );
        var xyFracBuffer = newDynamicBuffer( );

        return function( gl : WebGLRenderingContext, viewport : BoundsUnmodifiable ) {
            var hFrac = scrollLayout.hVisible / scrollLayout.hContent;
            if ( hFrac < 1 ) {
                var yTop = Math.round( ( ( scrollLayout.hContent - ( scrollLayout.jOffset ) ) / scrollLayout.hContent )*viewport.h + 1e-4 );
                var yBottom = Math.round( ( ( scrollLayout.hContent - ( scrollLayout.jOffset + scrollLayout.hVisible ) ) / scrollLayout.hContent )*viewport.h + 1e-4 );

                var yFracTop = yTop / viewport.h;
                var yFracBottom = yBottom / viewport.h;

                var wBorderFrac = borderThickness / viewport.w;
                var hBorderFrac = borderThickness / viewport.h;

                gl.disable( GL.BLEND );

                program.use( gl );


                // Fill
                //

                putQuadXys( xyFrac, 0, 0+(borderLeft?wBorderFrac:0), 1-(borderRight?wBorderFrac:0), yFracTop-(borderTop?hBorderFrac:0), yFracBottom+(borderBottom?hBorderFrac:0) );
                xyFracBuffer.setData( xyFrac.subarray( 0, 2*numFillVertices ) );
                a_XyFrac.setDataAndEnable( gl, xyFracBuffer, 2, GL.FLOAT );
                u_Color.setData( gl, fgColor );
                gl.drawArrays( GL.TRIANGLES, 0, numFillVertices );


                // Border
                //

                var index = 0;
                if ( borderTop    ) index = putQuadXys( xyFrac, index, 0, 1-(borderRight?wBorderFrac:0), yFracTop, yFracTop-hBorderFrac );
                if ( borderBottom ) index = putQuadXys( xyFrac, index, 0+(borderLeft?wBorderFrac:0), 1, yFracBottom+hBorderFrac, yFracBottom );
                if ( borderRight  ) index = putQuadXys( xyFrac, index, 1-wBorderFrac, 1, yFracTop, yFracBottom+(borderBottom?hBorderFrac:0) );
                if ( borderLeft   ) index = putQuadXys( xyFrac, index, 0, 0+wBorderFrac, yFracTop-(borderTop?hBorderFrac:0), yFracBottom );

                xyFracBuffer.setData( xyFrac.subarray( 0, 2*numBorderVertices ) );
                a_XyFrac.setDataAndEnable( gl, xyFracBuffer, 2, GL.FLOAT );
                u_Color.setData( gl, borderColor );
                gl.drawArrays( GL.TRIANGLES, 0, numBorderVertices );


                a_XyFrac.disable( gl );
                program.endUse( gl );
            }
        };
    }

    // mouse listener for scrolling while panning on the timeline itself
    export function attachTimelineVerticalScrollMouseListeners( pane : Pane, scrollLayout : VerticalScrollLayout, drawable : Drawable ) {
        
        // Used when dragging inside pane
        var grab : number = null;
        var jOffset : number = null;
        
        pane.mouseDown.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) ) {
                grab = ev.j;
                jOffset = scrollLayout.jOffset;
            }
        } );
            
        pane.mouseMove.on( function( ev : PointerEvent ) {
            if ( isNotEmpty( grab ) ) {
                scrollLayout.jOffset = jOffset - ( grab - ev.j );
                drawable.redraw( );
            }
        } );

        pane.mouseUp.on( function( ev : PointerEvent ) {
            grab = null;
        } );
    }

    // mouse listener for scrolling while interacting with the scrollbar
    export function attachVerticalScrollMouseListeners( scrollbar : Pane, scrollLayout : VerticalScrollLayout, drawable : Drawable ) {

        // Used when dragging the handle
        var grab : number = null;

        // Used when scrollbar is pressed-and-held outside the handle
        var pageScrollTimer : number = null;
        var recentPointerFrac : number = null;

        scrollbar.mouseDown.on( function( ev : PointerEvent ) {
            if ( isLeftMouseDown( ev.mouseEvent ) && !isNotEmpty( grab ) ) {
                var topFrac = ( scrollLayout.hContent - scrollLayout.jOffset ) / scrollLayout.hContent;
                var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                var pointerFrac = yFrac( ev );
                if ( topFrac-fracExtent <= pointerFrac && pointerFrac <= topFrac ) {
                    grab = ( topFrac - pointerFrac ) / fracExtent;
                }
                else {

                    var direction = 0;
                    if ( pointerFrac < topFrac-fracExtent ) direction = +1;
                    else if ( pointerFrac > topFrac ) direction = -1;
                    scrollLayout.jOffset += direction * Math.max( 1, 0.875 * scrollLayout.hVisible );
                    drawable.redraw( );

                    recentPointerFrac = pointerFrac;
                    var pageScroll = function( ) {
                        var topFrac = ( scrollLayout.hContent - scrollLayout.jOffset ) / scrollLayout.hContent;
                        var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                        var pointerFrac = recentPointerFrac;

                        var direction = 0;
                        if ( pointerFrac < topFrac-fracExtent ) direction = +1;
                        else if ( pointerFrac > topFrac ) direction = -1;
                        scrollLayout.jOffset += direction * Math.max( 1, 0.875 * scrollLayout.hVisible );
                        drawable.redraw( );

                        pageScrollTimer = setTimeout( pageScroll, 50 );
                    };
                    pageScrollTimer = setTimeout( pageScroll, 500 );
                }
            }
        } );

        scrollbar.mouseMove.on( function( ev : PointerEvent ) {
            var pointerFrac = yFrac( ev );
            if ( isNotEmpty( grab ) ) {
                var fracExtent = scrollLayout.hVisible / scrollLayout.hContent;
                var topFrac = pointerFrac + grab*fracExtent;
                scrollLayout.jOffset = scrollLayout.hContent - topFrac*scrollLayout.hContent;
                drawable.redraw( );
            }
            if ( isNotEmpty( pageScrollTimer ) ) {
                recentPointerFrac = pointerFrac;
            }
        } );

        scrollbar.mouseUp.on( function( ev : PointerEvent ) {
            grab = null;
            if ( isNotEmpty( pageScrollTimer ) ) {
                clearTimeout( pageScrollTimer );
                pageScrollTimer = null;
                recentPointerFrac = null;
            }
        } );

    }


}