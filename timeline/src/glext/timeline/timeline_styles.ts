module webglext {


    // Default
    //

    export var timeseriesRowPainterFactories_DEFAULT = [
        newTimeseriesPainterFactory( ),
    ];
    
    export var eventsRowPaneFactory_DEFAULT : TimelineRowPaneFactory = newEventsRowPaneFactory( {
        laneHeight: 40,
        painterFactories: [
            newEventLimitsPainterFactory( ),
            newEventBarsPainterFactory( ),
            newEventIconsPainterFactory( ),
            newEventLabelsPainterFactory( {
                iconsSizeFactor: 0.7
            } )
        ]
    } );
    
    export var timeseriesRowPaneFactory_DEFAULT : TimelineRowPaneFactory = newTimeseriesRowPaneFactory( {
        painterFactories: timeseriesRowPainterFactories_DEFAULT,
        axisOptions: { tickSpacings: 34 }
    } );

    export function rowPaneFactoryChooser_DEFAULT( row : TimelineRowModel ) : TimelineRowPaneFactory {
        if ( !row.eventGuids.isEmpty ) {
            return eventsRowPaneFactory_DEFAULT;
        }
        else if ( !row.timeseriesGuids.isEmpty ) {
            return timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }



    // Thin
    //

    export var eventsRowPaneFactory_THIN : TimelineRowPaneFactory = newEventsRowPaneFactory( {
        rowTopPadding: 0,
        rowBottomPadding: 0,
        laneHeight: 23,
        allowMultipleLanes: true,
        painterFactories: [
            newEventLimitsPainterFactory( {
                lineColor: new Color( 1, 0, 0, 1 ),
                lineThickness: 2
            } ),
            newEventStripedBarsPainterFactory( {
                bottomMargin: 0,
                topMargin: 13,
                minimumVisibleWidth: 0,
                stripeSlant: -1,
                stripeSecondaryWidth: 10,
                stripeWidth: 10
            } ),
            newEventDashedBordersPainterFactory( {
                bottomMargin: 0,
                topMargin: 13,
                minimumVisibleWidth: 0,
                cornerType: JointType.MITER,
                dashLength: 5
            } ),
            newEventIconsPainterFactory( {
                bottomMargin: 0,
                topMargin: 13,
                vAlign: 0.0
            } ),
            newEventLabelsPainterFactory( {
                bottomMargin: 12,
                topMargin: 0,
                leftMargin: 2,
                rightMargin: 2,
                vAlign: 0.0,
                spacing: 2,
                extendBeyondBar: false,
                textMode: 'truncate'
            } )
        ]
    } );

    export function rowPaneFactoryChooser_THIN( row : TimelineRowModel ) : TimelineRowPaneFactory {
        if ( !row.eventGuids.isEmpty ) {
            return eventsRowPaneFactory_THIN;
        }
        else if ( !row.timeseriesGuids.isEmpty ) {
            return timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }
    
    export var eventsRowPaneFactory_SINGLE : TimelineRowPaneFactory = newEventsRowPaneFactory( {
        rowTopPadding: 0,
        rowBottomPadding: 0,
        laneHeight: 23,
        allowMultipleLanes: false,
        painterFactories: [
            newEventLimitsPainterFactory( {
                lineColor: new Color( 1, 0, 0, 1 ),
                lineThickness: 2
            } ),
            newCombinedEventPainterFactory( 
                {
                    bottomMargin: 0,
                    topMargin: 13,
                    minimumVisibleWidth: 0,
                    cornerType: JointType.MITER
                },
                {
                    bottomMargin: 12,
                    topMargin: 0,
                    leftMargin: 2,
                    rightMargin: 2,
                    vAlign: 0.0,
                    spacing: 2,
                    extendBeyondBar: false,
                    textMode: 'show'
                },
                {
                    bottomMargin: 0,
                    topMargin: 13,
                    vAlign: 0.0
                }
            )
        ]
    } );
    
    export function rowPaneFactoryChooser_SINGLE( row : TimelineRowModel ) : TimelineRowPaneFactory {
        if ( !row.eventGuids.isEmpty ) {
            return eventsRowPaneFactory_SINGLE;
        }
        else if ( !row.timeseriesGuids.isEmpty ) {
            return timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }

}