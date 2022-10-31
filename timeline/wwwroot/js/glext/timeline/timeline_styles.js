var webglext;
(function (webglext) {
    // Default
    //
    webglext.timeseriesRowPainterFactories_DEFAULT = [
        webglext.newTimeseriesPainterFactory(),
    ];
    webglext.eventsRowPaneFactory_DEFAULT = webglext.newEventsRowPaneFactory({
        laneHeight: 40,
        painterFactories: [
            webglext.newEventLimitsPainterFactory(),
            webglext.newEventBarsPainterFactory(),
            webglext.newEventIconsPainterFactory(),
            webglext.newEventLabelsPainterFactory({
                iconsSizeFactor: 0.7
            })
        ]
    });
    webglext.timeseriesRowPaneFactory_DEFAULT = webglext.newTimeseriesRowPaneFactory({
        painterFactories: webglext.timeseriesRowPainterFactories_DEFAULT,
        axisOptions: { tickSpacing: 34 }
    });
    function rowPaneFactoryChooser_DEFAULT(row) {
        if (!row.eventGuids.isEmpty) {
            return webglext.eventsRowPaneFactory_DEFAULT;
        }
        else if (!row.timeseriesGuids.isEmpty) {
            return webglext.timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }
    webglext.rowPaneFactoryChooser_DEFAULT = rowPaneFactoryChooser_DEFAULT;
    // Thin
    //
    webglext.eventsRowPaneFactory_THIN = webglext.newEventsRowPaneFactory({
        rowTopPadding: 0,
        rowBottomPadding: 0,
        laneHeight: 23,
        allowMultipleLanes: true,
        painterFactories: [
            webglext.newEventLimitsPainterFactory({
                lineColor: new webglext.Color(1, 0, 0, 1),
                lineThickness: 2
            }),
            webglext.newEventStripedBarsPainterFactory({
                bottomMargin: 0,
                topMargin: 13,
                minimumVisibleWidth: 0,
                stripeSlant: -1,
                stripeSecondaryWidth: 10,
                stripeWidth: 10
            }),
            webglext.newEventDashedBordersPainterFactory({
                bottomMargin: 0,
                topMargin: 13,
                minimumVisibleWidth: 0,
                cornerType: webglext.JointType.MITER,
                dashLength: 5
            }),
            webglext.newEventIconsPainterFactory({
                bottomMargin: 0,
                topMargin: 13,
                vAlign: 0.0
            }),
            webglext.newEventLabelsPainterFactory({
                bottomMargin: 12,
                topMargin: 0,
                leftMargin: 2,
                rightMargin: 2,
                vAlign: 0.0,
                spacing: 2,
                extendBeyondBar: false,
                textMode: 'truncate'
            })
        ]
    });
    function rowPaneFactoryChooser_THIN(row) {
        if (!row.eventGuids.isEmpty) {
            return webglext.eventsRowPaneFactory_THIN;
        }
        else if (!row.timeseriesGuids.isEmpty) {
            return webglext.timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }
    webglext.rowPaneFactoryChooser_THIN = rowPaneFactoryChooser_THIN;
    webglext.eventsRowPaneFactory_SINGLE = webglext.newEventsRowPaneFactory({
        rowTopPadding: 0,
        rowBottomPadding: 0,
        laneHeight: 23,
        allowMultipleLanes: false,
        painterFactories: [
            webglext.newEventLimitsPainterFactory({
                lineColor: new webglext.Color(1, 0, 0, 1),
                lineThickness: 2
            }),
            webglext.newCombinedEventPainterFactory({
                bottomMargin: 0,
                topMargin: 13,
                minimumVisibleWidth: 0,
                cornerType: webglext.JointType.MITER
            }, {
                bottomMargin: 12,
                topMargin: 0,
                leftMargin: 2,
                rightMargin: 2,
                vAlign: 0.0,
                spacing: 2,
                extendBeyondBar: false,
                textMode: 'show'
            }, {
                bottomMargin: 0,
                topMargin: 13,
                vAlign: 0.0
            })
        ]
    });
    function rowPaneFactoryChooser_SINGLE(row) {
        if (!row.eventGuids.isEmpty) {
            return webglext.eventsRowPaneFactory_SINGLE;
        }
        else if (!row.timeseriesGuids.isEmpty) {
            return webglext.timeseriesRowPaneFactory_DEFAULT;
        }
        else {
            return null;
        }
    }
    webglext.rowPaneFactoryChooser_SINGLE = rowPaneFactoryChooser_SINGLE;
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_styles.js.map