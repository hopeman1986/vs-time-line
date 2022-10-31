module webglext {


    interface SimpleTooltip {
        show( html : string, i : number, j : number );
        move( i : number, j : number );
        hide( );
    }


    function newToolTip( ) : SimpleTooltip {
        var div = document.createElement( 'div' );
        div.classList.add( 'exampleTooltip' );
        div.style.position = 'absolute';
        div.style.zIndex = '1';
        div.style.visibility = 'hidden';
        document.body.appendChild( div );

        return {
            show: function( html : string, i : number, j : number ) {
                div.innerHTML = html;
                div.style.left = ( i ) + 'px';
                div.style.bottom = ( j - div.clientHeight ) + 'px';
                div.style.visibility = 'visible';
            },
            move: function( i : number, j : number ) {
                div.style.left = ( i ) + 'px';
                div.style.bottom = ( j - div.clientHeight ) + 'px';
            },
            hide: function( ) {
                div.style.visibility = 'hidden';
            }
        };
    }


    export function dispTimeLines( container : Node ) {


        // DOM Setup
        //

        var canvas = document.createElement( 'canvas' );
        canvas.id = 'timeLineCanvas';
        canvas.style.padding = '0';
        container.appendChild( canvas );

        var drawable = newDrawable( canvas );

        var updateCanvasSize = function( ) {
            // Make the canvas extend to the bottom of the browser viewport
            // (can't just set CSS height to 100%, because of the toolbar)
            $( canvas ).height(( $( window ).height( ) - canvas.getBoundingClientRect( ).top ));

            canvas.width = $( canvas ).width( );
            canvas.height = $( canvas ).height( );
            drawable.redraw( );
        };
        $( window ).resize( updateCanvasSize );
        updateCanvasSize( );

        // Timeline Setup
        //
        var timeAxis = new TimeAxis1D( 0, 40000);
        timeAxis.limitsChanged.on( drawable.redraw );

   

        var timelineOptions : TimelinePaneOptions = {
            showTopAxis: true,
            selectedIntervalMode: 'single',
            fgColor: white,
            rowLabelColor: black,
            groupLabelColor: white,
            axisLabelColor: black,
            bgColor: white,
            rowBgColor: white,
            rowAltBgColor: rgb( 0.05, 0.056, 0.12 ),
            selectedIntervalFillColor: rgba( 0, 0.7, 0.9, 0.187 ),
            selectedIntervalBorderColor: rgb( 0, 0.3, 0.6 ),
            allowEventMultiSelection: true,
            gridColor: gray( 0.3),
            tickSpacings: 60,

        };
        var model = new TimelineModel( );
        var ui = new TimelineUi( model, { allowEventMultiSelection : true } );
        var timelinePane = newTimelinePane( drawable, timeAxis, model, timelineOptions, ui );
        var selection = ui.selection;
        selection.selectedInterval.setInterval( 0, 200 );

        var contentPane = new Pane( newCornerLayout( Side.LEFT, Side.TOP ) );
        contentPane.addPane( timelinePane );
        drawable.setContentPane( newInsetPane( contentPane, newInsets( 12, 10, 2 ), timelineOptions.bgColor ) );
        drawable.redraw( );

                
        $.getJSON( 'timelineUi.json', function( uiStyles : { eventStyles : TimelineEventStyle[]; annotationStyles : TimelineAnnotationStyle[] } ) {
            uiStyles.eventStyles.forEach( function( s ) {
                ui.eventStyles.add( new TimelineEventStyleUi( s ) );
            } );
            uiStyles.annotationStyles.forEach( function( s ) {
                ui.annotationStyles.add( new TimelineAnnotationStyleUi( s ) );
            } );
        } );



        var addTrack = document.getElementById('selected-time-add');
        addTrack.onclick = function() {
            
        }

        var addPlay = document.getElementById('selected-time-autoplay');
        var playState = false;
        var myVar;
        addPlay.onclick = function() {
            if(!playState) {
                myVar = setInterval(playTimeLine, 100);
                playState = true;
                addPlay.className = "fa fa-pause"
            }
            else {
                clearInterval(myVar);
                addPlay.className = "fa fa-play"
                playState = false;
            }
        }

        function playTimeLine() {
            var timeStep = 100;
            var selectedInterval = selection.selectedInterval;
            selectedInterval.pan(timeStep);

              // if the time selection scrolls off the screen, jump the axis to keep it visible
              if ( selectedInterval.end_PMILLIS > timeAxis.tMax_PMILLIS ) {
                var tSize_MILLIS = timeAxis.tSize_MILLIS;
                timeAxis.tMax_PMILLIS = selectedInterval.end_PMILLIS;
                timeAxis.tMin_PMILLIS = timeAxis.tMax_PMILLIS - tSize_MILLIS;
            }
            drawable.redraw();
        }

        // step in 1 second increments
        var timeStep = secondsToMillis( 1 );
        var selectedInterval = selection.selectedInterval;

        var a = document.getElementById( 'selected-time-step-backward' );
        a.onclick = function( ) {
            selectedInterval.pan( -timeStep );
            // if the time selection scrolls off the screen, jump the axis to keep it visible
            if ( selectedInterval.start_PMILLIS < timeAxis.tMin_PMILLIS ) {
                var tSize_MILLIS = timeAxis.tSize_MILLIS;
                timeAxis.tMin_PMILLIS = selectedInterval.start_PMILLIS;
                timeAxis.tMax_PMILLIS = timeAxis.tMin_PMILLIS + tSize_MILLIS;
            }
            drawable.redraw( );
        };

        var a = document.getElementById( 'selected-time-step-forward' );
        a.onclick = function( ) {
            selectedInterval.pan( timeStep );
            // if the time selection scrolls off the screen, jump the axis to keep it visible
            if ( selectedInterval.end_PMILLIS > timeAxis.tMax_PMILLIS ) {
                var tSize_MILLIS = timeAxis.tSize_MILLIS;
                timeAxis.tMax_PMILLIS = selectedInterval.end_PMILLIS;
                timeAxis.tMin_PMILLIS = timeAxis.tMax_PMILLIS - tSize_MILLIS;
            }
            drawable.redraw( );
        };

        
        //add listener for new TimelineRowUi
        ui.rowUis.valueAdded.on( function ( rowUi : TimelineRowUi ) {
            // add listener for new Panes
            rowUi.panes.valueAdded.on( function ( pane : Pane, index : number ) {
                var id = rowUi.panes.idAt( index );
                // test if the new Pane is a maximized row label pane
                if ( id === 'maximized-label' ) {
                     // add a mouse listener to the maximized row label Pane
                    pane.mouseDown.on( function( event : PointerEvent ) {
                        if ( event.clickCount === 2 ) {
                            // minimize the double clicked row
                            model.root.maximizedRowGuids.removeValue( rowUi.rowGuid );
                        }
                    } );
                }
                // test if the new Pane is a label pane (id ends with '-label')
                else if ( id.search( '-label$' ) !== -1 ) {
                     // add a mouse listener to the row label Pane
                    pane.mouseDown.on( function( event : PointerEvent ) {
                        if ( event.clickCount === 2 ) {
                            // maximize the double clicked row
                            model.root.maximizedRowGuids.add( rowUi.rowGuid );
                        }
                    } );
                }
            } );
        } );
        
        
        // Shows overlay div, containing arbitrary html content, when an event is hovered
        //

        var tooltip = newToolTip( );
        var iTooltipOffset = +12;
        var jTooltipOffset = -12;

        selection.hoveredEvent.changed.on( function( ) {
            var hoveredEvent = selection.hoveredEvent.value;
            if ( hoveredEvent ) {
                var iMouse = selection.mousePos.x;
                var jMouse = selection.mousePos.y;
                if ( isNumber( iMouse ) && isNumber( jMouse ) ) {

                    // Generate application-specific html content, based on which event is hovered
                    var html = hoveredEvent.label;

                    tooltip.show( html, iMouse+iTooltipOffset, jMouse+jTooltipOffset );
                }
                else {
                    tooltip.hide( );
                }
            }
            else {
                tooltip.hide( );
            }
        } );

        selection.mousePos.changed.on( function( ) {
            var iMouse = selection.mousePos.x;
            var jMouse = selection.mousePos.y;
            if ( isNumber( iMouse ) && isNumber( jMouse ) ) {
                tooltip.move( iMouse+iTooltipOffset, jMouse+jTooltipOffset );
            }
            else {
                tooltip.hide( );
            }
        } );


        // Example Input Listeners
        //
        // Fill these in with application-specific input-handling code
        //
        
        selection.hoveredAnnotation.changed.on( function( ) {
            if ( isNotEmpty( selection.hoveredAnnotation.value ) )
            {
                // Do something with the hovered annotation
            }
        });
        
       
        selection.mousePos.changed.on( function( ) {
            // Handle mouse position
            var iMouse = selection.mousePos.x; // null if the mouse is outside the timeline
            var jMouse = selection.mousePos.y; // null if the mouse is outside the timeline
        } );

        selection.hoveredTime_PMILLIS.changed.on( function( ) {
            // Handle hovered time
            var hoveredTime_PMILLIS = selection.hoveredTime_PMILLIS.value;
        } );

        selection.selectedInterval.changed.on( function( ) {
            // Handle selected time interval
            var selectionStart_PMILLIS = selection.selectedInterval.start_PMILLIS;
            var selectionEnd_PMILLIS = selection.selectedInterval.end_PMILLIS;
        } );

        selection.hoveredRow.changed.on( function( ) {
            // Handle row hovered
            var hoveredRow = selection.hoveredRow.value;
        } );

        selection.hoveredEvent.changed.on( function( ) {
            // Handle event hovered
            var hoveredEvent = selection.hoveredEvent.value;
        } );

        selection.selectedEvents.valueAdded.on( function( event : TimelineTrackModel ) {
            // Handle event selected
        } );

        selection.selectedEvents.valueRemoved.on( function( event : TimelineTrackModel ) {
            // Handle event de-selected
        } );
        
        

        
        $.getJSON( 'timelineData.json', function( newTimeline : Timeline ) {
            model.merge( newTimeline, timelineMergeNewBeforeOld );
        } );
    }
   
}
