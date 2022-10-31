module webglext {


    function childHeight( child : LayoutEntry ) : number {
        var usePrefHeight = ( !isNotEmpty( child.layoutOptions ) || child.layoutOptions.height === undefined || child.layoutOptions.height === 'pref' || child.layoutOptions.height === 'pref-max' );
        return ( usePrefHeight ? child.prefSize.h : child.layoutOptions.height );
    }
    
    // see above, like childHeight( ) but don't count 'pref-max'
    function childHeightOverfull( child : LayoutEntry ) : number {
        var usePrefHeight = ( !isNotEmpty( child.layoutOptions ) || child.layoutOptions.height === undefined || child.layoutOptions.height === 'pref' );
        
        if ( usePrefHeight ) {
            return child.prefSize.h;
        }
        else if ( child.layoutOptions.height == 'pref-max' ) {
            return null;
        }
        else {
            return child.layoutOptions.height;
        }
    }

    interface FlexData {
        numFlexible : number;
        totalHeight : number;
        totalFlexHeight : number;
        flexHeight : number;
        childHeight : ( child : LayoutEntry ) => number;
    }
    
    function calculateFlexData( childrenToPlace : LayoutEntry[], parentViewport : BoundsUnmodifiable, childHeight : ( child : LayoutEntry ) => number ) : FlexData {
        var numFlexible = 0;
        var totalHeight = 0;
        for ( var c = 0; c < childrenToPlace.length; c++ ) {
            var h = childHeight( childrenToPlace[ c ] );
            if ( isNotEmpty( h ) ) {
                totalHeight += h;
            }
            else {
                numFlexible++;
            }
        }
        var totalFlexHeight = parentViewport.h - totalHeight;
        var flexHeight = totalFlexHeight / numFlexible;
        return { numFlexible : numFlexible, totalHeight : totalHeight, flexHeight : flexHeight, totalFlexHeight : totalFlexHeight, childHeight : childHeight };
    }
    
    export function newRowLayout( topToBottom : boolean = true ) : Layout {

        return {


            updatePrefSize: function( parentPrefSize : Size, children : LayoutEntry[] ) {
                var childrenToPlace = <LayoutEntry[]> [ ];
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    if ( isNumber( child.layoutArg ) && !( child.layoutOptions && child.layoutOptions.hide ) ) {
                        childrenToPlace.push( child );
                    }
                }

                var wMax = 0;
                var hSum = 0;
                for ( var c = 0; c < childrenToPlace.length; c++ ) {
                    var child = childrenToPlace[ c ];

                    var honorChildWidth = !( child.layoutOptions && child.layoutOptions.ignoreWidth );
                    if ( honorChildWidth ) {
                        var w = child.prefSize.w;
                        if ( isNotEmpty( wMax ) && isNotEmpty( w ) ) {
                            wMax = Math.max( wMax, w );
                        }
                        else {
                            wMax = null;
                        }
                    }

                    var h = childHeight( child );
                    if ( isNotEmpty( hSum ) && isNotEmpty( h ) ) {
                        hSum += h;
                    }
                    else {
                        hSum = null;
                    }
                }
                parentPrefSize.w = wMax;
                parentPrefSize.h = hSum;
            },


            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                var childrenToPlace = <LayoutEntry[]> [ ];
                var childrenToHide = <LayoutEntry[]> [ ];
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    if ( isNumber( child.layoutArg ) && !( child.layoutOptions && child.layoutOptions.hide ) ) {
                        childrenToPlace.push( child );
                    }
                    else {
                        childrenToHide.push( child );
                    }
                }

                // Use the original index to make the sort stable
                var indexProp = 'webglext_rowLayout_index';
                for ( var c = 0; c < childrenToPlace.length; c++ ) {
                    var child = childrenToPlace[ c ];
                    child[ indexProp ] = c;
                }

                childrenToPlace.sort( function( a : LayoutEntry, b : LayoutEntry ) {
                    var orderDiff = a.layoutArg - b.layoutArg;
                    return ( orderDiff !== 0 ? orderDiff : ( a[ indexProp ] - b[ indexProp ] ) );
                } );

                // calculate assuming sufficient space
                var flexData = calculateFlexData( children, parentViewport, childHeight );
                
                // recalculate allowing 'pref-max' children to shrink if insufficient space
                if ( flexData.totalHeight > parentViewport.h ) {
                    flexData = calculateFlexData( children, parentViewport, childHeightOverfull );
                }
                
                if ( topToBottom ) {
                    var iStart = parentViewport.iStart;
                    var iEnd = parentViewport.iEnd;
                    var jEnd = parentViewport.jEnd;
                    var jRemainder = 0;
                    for ( var c = 0; c < childrenToPlace.length; c++ ) {
                        var child = childrenToPlace[ c ];

                        var jStart : number;
                        var h = flexData.childHeight( child );
                        if ( isNotEmpty( h ) ) {
                            jStart = jEnd - h;
                        }
                        else {
                            var jStart0 = jEnd - flexData.flexHeight - jRemainder;
                            jStart = Math.round( jStart0 );
                            jRemainder = jStart - jStart0;
                        }

                        child.viewport.setEdges( iStart, iEnd, jStart, jEnd );
                        jEnd = jStart;
                    }
                }
                else {
                    var iStart = parentViewport.iStart;
                    var iEnd = parentViewport.iEnd;
                    var jStart = parentViewport.jStart;
                    var jRemainder = 0;
                    for ( var c = 0; c < childrenToPlace.length; c++ ) {
                        var child = childrenToPlace[ c ];

                        var jEnd : number;
                        var h = flexData.childHeight( child );
                        if ( isNotEmpty( h ) ) {
                            jEnd = jStart + h;
                        }
                        else {
                            var jEnd0 = jStart + flexData.flexHeight + jRemainder;
                            jEnd = Math.round( jEnd0 );
                            jRemainder = jEnd0 - jEnd;
                        }

                        child.viewport.setEdges( iStart, iEnd, jStart, jEnd );
                        jStart = jEnd;
                    }
                }

                for ( var c = 0; c < childrenToHide.length; c++ ) {
                    childrenToHide[ c ].viewport.setEdges( 0, 0, 0, 0 );
                }
            }
        };
    }
}