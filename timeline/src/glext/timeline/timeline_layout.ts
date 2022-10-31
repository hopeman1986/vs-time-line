module webglext {


    export function newTimelineLayout( axisHeight : number ) : Layout {

        return {

            updatePrefSize: function( parentPrefSize : Size, children : LayoutEntry[] ) {
                var topAxis : LayoutEntry = null;
                var bottomAxis : LayoutEntry = null;
                var center : LayoutEntry = null;
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    switch ( child.layoutArg ) {
                        case Side.TOP:
                            if ( isNotEmpty( topAxis ) ) throw new Error( 'Timeline-layout can have at most one top-axis pane' );
                            topAxis = child;
                            break;

                        case Side.BOTTOM:
                            if ( isNotEmpty( bottomAxis ) ) throw new Error( 'Timeline-layout can have at most one bottom-axis pane' );
                            bottomAxis = child;
                            break;

                        default:
                            if ( isNotEmpty( center ) ) throw new Error( 'Timeline-layout can have at most one center pane' );
                            center = child;
                            break;
                    }
                }

                var hSum = 0;

                if ( isNotEmpty( topAxis ) ) {
                    hSum += axisHeight;
                }

                if ( isNotEmpty( bottomAxis ) ) {
                    hSum += axisHeight;
                }

                if ( isNotEmpty( center ) ) {
                    if ( isNotEmpty( center.prefSize.h ) ) {
                        hSum += center.prefSize.h;
                    }
                    else {
                        hSum = null;
                    }
                }

                parentPrefSize.w = null;
                parentPrefSize.h = hSum;
            },

            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                var topAxis : LayoutEntry = null;
                var bottomAxis : LayoutEntry = null;
                var center : LayoutEntry = null;
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    switch ( child.layoutArg ) {
                        case Side.TOP:
                            if ( isNotEmpty( topAxis ) ) throw new Error( 'Timeline-layout can have at most one top-axis pane' );
                            topAxis = child;
                            break;

                        case Side.BOTTOM:
                            if ( isNotEmpty( bottomAxis ) ) throw new Error( 'Timeline-layout can have at most one bottom-axis pane' );
                            bottomAxis = child;
                            break;

                        default:
                            if ( isNotEmpty( center ) ) throw new Error( 'Timeline-layout can have at most one center pane' );
                            center = child;
                            break;
                    }
                }

                if ( isNotEmpty( topAxis ) ) {
                    topAxis.viewport.setRect( parentViewport.i, parentViewport.jEnd - axisHeight, parentViewport.w, axisHeight );
                }

                if ( isNotEmpty( bottomAxis ) ) {
                    var jBottomMax = ( isNotEmpty( topAxis ) ? topAxis.viewport.j : parentViewport.jEnd ) - axisHeight;
                    bottomAxis.viewport.setRect( parentViewport.i, Math.min( jBottomMax, parentViewport.j ), parentViewport.w, axisHeight );
                }

                if ( isNotEmpty( center ) ) {
                    var jCenterEnd = ( isNotEmpty( topAxis ) ? topAxis.viewport.jStart : parentViewport.jEnd );
                    var jCenterStart = ( isNotEmpty( bottomAxis ) ? bottomAxis.viewport.jEnd : parentViewport.jStart );
                    center.viewport.setEdges( parentViewport.iStart, parentViewport.iEnd, jCenterStart, jCenterEnd );
                }
            }

        };
    }


}