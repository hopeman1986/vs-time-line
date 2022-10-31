module webglext {

    export interface TimelineRowPaneOptions {
        timelineFont : string;
        timelineFgColor : Color;
        draggableEdgeWidth : number;
        snapToDistance : number;
        isMaximized : boolean;
        mouseWheelListener? : ( PointerEvent ) => void;
    }

    export interface TimelineRowPaneFactory {
        ( drawable : Drawable,
          timeAxis : TimeAxis1D,
          dataAxis : Axis1D,
          model : TimelineModel,
          row : TimelineRowModel,
          ui : TimelineUi,
          options : TimelineRowPaneOptions ) : Pane;
    }

    export interface TimelineRowPaneFactoryChooser {
        ( row : TimelineRowModel ) : TimelineRowPaneFactory;
    }
}