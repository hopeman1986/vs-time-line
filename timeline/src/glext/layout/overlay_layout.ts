module webglext {


    /**
     * Simple layout which sets the sizes of all child panes to the size of the parent pane
     * (causing all the children to 'overlay' each other and the parent).
     */
    export function newOverlayLayout( ): Layout {

        return {

            updatePrefSize: function( parentPrefSize : Size, children : LayoutEntry[] ) {
                var underlays : LayoutEntry[] = [];
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    var isUnderlay = child.layoutArg;
                    if ( isUnderlay ) {
                        underlays.push( child );
                    }
                }

                if ( !isEmpty( underlays ) ) {
                    var maxChildPrefWidth = 0;
                    var maxChildPrefHeight = 0;
                    for ( var c = 0; c < underlays.length; c++ ) {
                        var childPrefSize = underlays[ c ].prefSize;

                        var childPrefWidth = childPrefSize.w;
                        if ( isNotEmpty( maxChildPrefWidth ) && isNotEmpty( childPrefWidth ) ) {
                            maxChildPrefWidth = Math.max( maxChildPrefWidth, childPrefWidth );
                        }
                        else {
                            maxChildPrefWidth = null;
                        }

                        var childPrefHeight = childPrefSize.h;
                        if ( isNotEmpty( maxChildPrefHeight ) && isNotEmpty( childPrefHeight ) ) {
                            maxChildPrefHeight = Math.max( maxChildPrefHeight, childPrefHeight );
                        }
                        else {
                            maxChildPrefHeight = null;
                        }
                    }
                    parentPrefSize.w = maxChildPrefWidth;
                    parentPrefSize.h = maxChildPrefHeight;
                }
                else {
                    parentPrefSize.w = 0;
                    parentPrefSize.h = 0;
                }
            },

            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                for ( var c = 0; c < children.length; c++ ) {
                    children[ c ].viewport.setBounds( parentViewport );
                }
            }

        };
    }
}