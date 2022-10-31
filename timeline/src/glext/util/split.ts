module webglext {


    export function initSplitContainer( container : HTMLElement ) : Notification {
        var tilesResized = new Notification( );

        _initSplitContainer( container, tilesResized );

        window.addEventListener( 'resize', function( ) {
            tilesResized.fire( );
        } );
        tilesResized.fire( );

        return tilesResized;
    }




    function _initSplitContainer( container : HTMLElement, tilesResized : Notification ) {
        var tileA : HTMLElement = null;
        var tileB : HTMLElement = null;
        var sep : HTMLElement = null;
        var children = container.childNodes;
        for ( var n = 0; n < children.length; n++ ) {
            var child = children[ n ];
            if ( child.nodeType === 1 && ( <any> child ).classList ) {
                var element = <HTMLElement> child;
                if ( tileA == null ) {
                    if ( element.classList.contains( 'splitContainerNS' ) || element.classList.contains( 'splitContainerEW' ) || element.classList.contains( 'splitTile' ) ) {
                        tileA = element;
                    }
                }
                else if ( sep == null ) {
                    if ( element.classList.contains( 'splitSep' ) ) {
                        sep = element;
                    }
                }
                else if ( tileB == null ) {
                    if ( element.classList.contains( 'splitContainerNS' ) || element.classList.contains( 'splitContainerEW' ) || element.classList.contains( 'splitTile' ) ) {
                        tileB = element;
                    }
                }
                else {
                    break;
                }
            }
        }
        if ( tileA == null ) throw new Error( 'Failed to init split-container: could not find first tile' );
        if ( sep == null ) throw new Error( 'Failed to init split-container: could not find separator' );
        if ( tileB == null ) throw new Error( 'Failed to init split-container: could not find second tile' );

        if ( container.classList.contains( 'splitContainerNS' ) ) {
            _initSplitNS( container, tileA, sep, tileB, tilesResized );
        }
        else if ( container.classList.contains( 'splitContainerEW' ) ) {
            _initSplitEW( container, tileA, sep, tileB, tilesResized );
        }

        if ( tileA.classList.contains( 'splitContainerNS' ) || tileA.classList.contains( 'splitContainerEW' ) ) {
            _initSplitContainer( tileA, tilesResized );
        }

        if ( tileB.classList.contains( 'splitContainerNS' ) || tileB.classList.contains( 'splitContainerEW' ) ) {
            _initSplitContainer( tileB, tilesResized );
        }
    }




    function _initSplitNS( container : HTMLElement, tileA : HTMLElement, sep : HTMLElement, tileB : HTMLElement, tilesResized : Notification ) : void {
        sep.classList.add( 'splitSepNS' );
        sep.style.left = '0px';
        sep.style.right = '0px';
        tileA.style.left = '0px';
        tileA.style.right = '0px';
        tileB.style.left = '0px';
        tileB.style.right = '0px';

        var minHeightA = 1;
        var minHeightB = 1;
        var recentFracA : number = null;

        function layoutTiles( prelimHeightA? : number ) {
            var heightSep = sep.getBoundingClientRect( ).height;
            var heightContainer = container.getBoundingClientRect( ).height;
            var heightContent = heightContainer - heightSep;
            if ( recentFracA == null ) {
                recentFracA = tileA.getBoundingClientRect( ).height / heightContent;
            }

            var keepFracA = ( prelimHeightA == null );
            if ( keepFracA ) {
                prelimHeightA = Math.round( recentFracA * heightContent );
            }

            var maxHeightA = heightContainer - heightSep - minHeightB;

            var topA = 0;
            var heightA = Math.max( minHeightA, Math.min( maxHeightA, prelimHeightA ) );
            tileA.style.top = topA + 'px';
            tileA.style.height = heightA + 'px';

            var topSep = topA + heightA;
            sep.style.top = topSep + 'px';
            sep.style.height = heightSep + 'px';

            var topB = topSep + heightSep;
            var heightB = Math.max( minHeightB, heightContainer - topB );
            tileB.style.top = topB + 'px';
            tileB.style.height = heightB + 'px';

            if ( !keepFracA && heightContent >= heightA && heightContent >= ( minHeightA + minHeightB ) ) {
                recentFracA = heightA / heightContent;
            }
        }

        var sepGrab : number = null;

        sep.addEventListener( 'mousedown', function( ev : MouseEvent ) {
            if ( ev.button === 0 ) {
                sepGrab = ev.clientY - tileA.getBoundingClientRect( ).top - tileA.getBoundingClientRect( ).height;
                ev.preventDefault( );
            }
        } );

        // During a DRAG we want all move events, even ones that occur outside the canvas -- so subscribe to WINDOW's mousemove
        window.addEventListener( 'mousemove', function( ev : MouseEvent ) {
            if ( sepGrab != null ) {
                layoutTiles( ev.clientY - tileA.getBoundingClientRect( ).top - sepGrab );
                tilesResized.fire( );
            }
        } );

        // The window always gets the mouse-up event at the end of a drag -- even if it occurs outside the browser window
        window.addEventListener( 'mouseup', function( ev : MouseEvent ) {
            if ( sepGrab != null && ev.button === 0 ) {
                layoutTiles( ev.clientY - tileA.getBoundingClientRect( ).top - sepGrab );
                tilesResized.fire( );
                sepGrab = null;
            }
        } );

        tilesResized.on( layoutTiles );
    }




    function _initSplitEW( container : HTMLElement, tileA : HTMLElement, sep : HTMLElement, tileB : HTMLElement, tilesResized : Notification ) : void {
        sep.classList.add( 'splitSepEW' );
        sep.style.top = '0px';
        sep.style.bottom = '0px';
        tileA.style.top = '0px';
        tileA.style.bottom = '0px';
        tileB.style.top = '0px';
        tileB.style.bottom = '0px';

        var minWidthA = 1;
        var minWidthB = 1;
        var recentFracA : number = null;

        function layoutTiles( prelimWidthA? : number ) {
            var widthSep = sep.getBoundingClientRect( ).width;
            var widthContainer = container.getBoundingClientRect( ).width;
            var widthContent = widthContainer - widthSep;
            if ( recentFracA == null ) {
                recentFracA = tileA.getBoundingClientRect( ).width / widthContent;
            }

            var keepFracA = ( prelimWidthA == null );
            if ( keepFracA ) {
                prelimWidthA = Math.round( recentFracA * widthContent );
            }

            var maxWidthA = widthContainer - widthSep - minWidthB;

            var leftA = 0;
            var widthA = Math.max( minWidthA, Math.min( maxWidthA, prelimWidthA ) );
            tileA.style.left = leftA + 'px';
            tileA.style.width = widthA + 'px';

            var leftSep = leftA + widthA;
            sep.style.left = leftSep + 'px';
            sep.style.width = widthSep + 'px';

            var leftB = leftSep + widthSep;
            var widthB = Math.max( minWidthB, widthContainer - leftB );
            tileB.style.left = leftB + 'px';
            tileB.style.width = widthB + 'px';

            if ( !keepFracA && widthContent >= widthA && widthContent >= ( minWidthA + minWidthB ) ) {
                recentFracA = widthA / widthContent;
            }
        }

        var sepGrab : number = null;

        sep.addEventListener( 'mousedown', function( ev : MouseEvent ) {
            if ( ev.button === 0 ) {
                sepGrab = ev.clientX - tileA.getBoundingClientRect( ).left - tileA.getBoundingClientRect( ).width;
                ev.preventDefault( );
            }
        } );

        // During a DRAG we want all move events, even ones that occur outside the canvas -- so subscribe to WINDOW's mousemove
        window.addEventListener( 'mousemove', function( ev : MouseEvent ) {
            if ( sepGrab != null ) {
                layoutTiles( ev.clientX - tileA.getBoundingClientRect( ).left - sepGrab );
                tilesResized.fire( );
            }
        } );

        // The window always gets the mouse-up event at the end of a drag -- even if it occurs outside the browser window
        window.addEventListener( 'mouseup', function( ev : MouseEvent ) {
            if ( sepGrab != null && ev.button === 0 ) {
                layoutTiles( ev.clientX - tileA.getBoundingClientRect( ).left - sepGrab );
                tilesResized.fire( );
                sepGrab = null;
            }
        } );

        tilesResized.on( layoutTiles );
    }


}
