module webglext {

    export function newPlotLayout( options? : { horizAxisHeight? : number; vertAxisWidth? : number } ) : Layout {
        var horizAxisHeight = ( isNotEmpty( options ) && isNotEmpty( options.horizAxisHeight ) ? options.horizAxisHeight : 60 );
        var vertAxisWidth   = ( isNotEmpty( options ) && isNotEmpty( options.vertAxisWidth  )  ? options.vertAxisWidth   : 70 );

        return {

            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                var topAxes = <LayoutEntry[]> [ ];
                var leftAxes = <LayoutEntry[]> [ ];
                var rightAxes = <LayoutEntry[]> [ ];
                var bottomAxes = <LayoutEntry[]> [ ];
                var centers = <LayoutEntry[]> [ ];
                var others = <LayoutEntry[]> [ ];
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    switch ( child.layoutArg ) {
                        case Side.TOP: topAxes.push( child ); break;
                        case Side.LEFT: leftAxes.push( child ); break;
                        case Side.RIGHT: rightAxes.push( child ); break;
                        case Side.BOTTOM: bottomAxes.push( child ); break;
                        case null: centers.push( child ); break;
                        default: others.push( child ); break;
                    }
                }

                var numVertAxes = leftAxes.length + rightAxes.length;
                var numHorizAxes = topAxes.length + bottomAxes.length;
                var centerWidth = Math.max( vertAxisWidth, parentViewport.w - numVertAxes*vertAxisWidth );
                var centerHeight = Math.max( horizAxisHeight, parentViewport.h - numHorizAxes*horizAxisHeight );
                var vertAxisWidth2 = ( numVertAxes === 0 ? 0 : ( parentViewport.w - centerWidth )/numVertAxes );
                var horizAxisHeight2 = ( numHorizAxes === 0 ? 0 : ( parentViewport.h - centerHeight )/numHorizAxes );

                var iCenterStart = parentViewport.iStart + leftAxes.length*vertAxisWidth2;
                var iCenterEnd = parentViewport.iEnd - rightAxes.length*vertAxisWidth2;
                var jCenterStart = parentViewport.jStart + bottomAxes.length*horizAxisHeight2;
                var jCenterEnd = parentViewport.jEnd - topAxes.length*horizAxisHeight2;

                for ( var c = 0; c < topAxes.length; c++ ) {
                    var jStart = Math.round( jCenterEnd + c*horizAxisHeight2 );
                    var jEnd = ( c === topAxes.length-1 ? parentViewport.jEnd : Math.round( jCenterEnd + (c+1)*horizAxisHeight2 ) );
                    topAxes[ c ].viewport.setEdges( iCenterStart, iCenterEnd, jStart, jEnd );
                }

                for ( var c = 0; c < bottomAxes.length; c++ ) {
                    var jStart = ( c === bottomAxes.length-1 ? parentViewport.jStart : Math.round( jCenterStart - (c+1)*horizAxisHeight2 ) );
                    var jEnd = Math.round( jCenterStart - c*horizAxisHeight2 );
                    bottomAxes[ c ].viewport.setEdges( iCenterStart, iCenterEnd, jStart, jEnd );
                }

                for ( var c = 0; c < leftAxes.length; c++ ) {
                    var iStart = ( c === leftAxes.length-1 ? parentViewport.iStart : Math.round( iCenterStart - (c+1)*vertAxisWidth2 ) );
                    var iEnd = Math.round( iCenterStart - c*vertAxisWidth2 );
                    leftAxes[ c ].viewport.setEdges( iStart, iEnd, jCenterStart, jCenterEnd );
                }

                for ( var c = 0; c < rightAxes.length; c++ ) {
                    var iStart = Math.round( iCenterEnd + c*vertAxisWidth2 );
                    var iEnd = ( c === rightAxes.length-1 ? parentViewport.iEnd : Math.round( iCenterEnd + (c+1)*vertAxisWidth2 ) );
                    rightAxes[ c ].viewport.setEdges( iStart, iEnd, jCenterStart, jCenterEnd );
                }

                for ( var c = 0; c < centers.length; c++ ) {
                    centers[ c ].viewport.setEdges( iCenterStart, iCenterEnd, jCenterStart, jCenterEnd );
                }

                for ( var c = 0; c < others.length; c++ ) {
                    others[ c ].viewport.setEdges( 0, 0, 0, 0 );
                }
            }

        };
    }
}
