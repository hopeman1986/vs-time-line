module webglext {


    /**
     * A layout similar to overlay_layout except only one child pane is visible at a time.
     * That child pane has its size set to the size of the parent pane. The other children panes
     * are made invisible until they are the active pane.
     * 
     * The layoutArg for each child is a boolean, true if it should be the active pane. One is chosen
     * arbitrarily if multiple panes have true layoutArg.
     */
    export function newCardLayout( ): Layout {

        return {

            updatePrefSize: function( parentPrefSize : Size, children : LayoutEntry[] ) {
                var activeChild : LayoutEntry;
                
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    var isActive = child.layoutArg;
                    if ( isActive ) {
                        activeChild = child;
                    }
                }

                if ( isNotEmpty( activeChild ) ) {

                    var childPrefSize = activeChild.prefSize;

                    var childPrefWidth = childPrefSize.w;
                    if ( isNotEmpty( childPrefWidth ) ) {
                        parentPrefSize.w = childPrefWidth;
                    }
                    else {
                        parentPrefSize.w = null;
                    }

                    var childPrefHeight = childPrefSize.h;
                    if ( isNotEmpty( childPrefHeight ) ) {
                        parentPrefSize.h = childPrefHeight;
                    }
                    else {
                        parentPrefSize.h = null;
                    }
                }
                else {
                    parentPrefSize.w = 0;
                    parentPrefSize.h = 0;
                }
            },

            updateChildViewports: function( children : LayoutEntry[], parentViewport : BoundsUnmodifiable ) {
                var activeChildIndex : number;
                
                for ( var c = 0; c < children.length; c++ ) {
                    var child = children[ c ];
                    var isActive = child.layoutArg;
                    if ( isActive ) {
                        activeChildIndex = c;
                    }
                }
                
                for ( var c = 0; c < children.length; c++ ) {
                    if ( c === activeChildIndex ) {
                        children[ c ].viewport.setBounds( parentViewport );
                    }
                    else {
                        children[ c ].viewport.setEdges( 0, 0, 0, 0 );
                    }
                }
            }

        };
    }
}