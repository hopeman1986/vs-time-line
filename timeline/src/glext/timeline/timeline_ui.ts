module webglext {


    export interface TimelineUiOptions {
        allowEventMultiSelection? : boolean;
    }
    
    export class TimelineUi {
        private _input : TimelineInput;
        private _selection : TimelineSelectionModel;

        private _groupUis : OrderedSet<TimelineGroupUi>;
        private _rowUis : OrderedSet<TimelineRowUi>;
        private _eventStyles : OrderedSet<TimelineEventStyleUi>;
        private _annotationStyles : OrderedSet<TimelineAnnotationStyleUi>;

        private _millisPerPx : SimpleModel<number>;

        private _imageStatus : StringMap<boolean>;
        private _imageCache : StringMap<Texture2D>;
        
        private _dispose : Notification;

        private _panes : OrderedSet<Pane>;

        constructor( model : TimelineModel, options : TimelineUiOptions = { } ) {
            this._dispose = new Notification( );
            this._input = new TimelineInput( );
            
            var getPaneId = function( pane ) {
                var paneId = pane['webglext_PaneId']
                return isNotEmpty( paneId ) ? paneId : getObjectId( pane );
            }
            
            this._panes = new OrderedSet<Pane>( [], getPaneId );

            this._selection = new TimelineSelectionModel( );
            attachTimelineInputToSelection( this._input, this._selection, options );

            this._groupUis = new OrderedSet<TimelineGroupUi>( [], (g)=>g.groupGuid );
            var groupUis = this._groupUis;
            var addGroupUi = function( group : TimelineGroupModel ) { groupUis.add( new TimelineGroupUi( group.groupGuid ) ); };
            var removeGroupUi = function( group : TimelineGroupModel ) { groupUis.removeId( group.groupGuid ); };
            model.groups.forEach( addGroupUi );
            model.groups.valueAdded.on( addGroupUi );
            model.groups.valueRemoved.on( removeGroupUi );

            this._rowUis = new OrderedSet<TimelineRowUi>( [], (r)=>r.rowGuid );
            var rowUis = this._rowUis;
            var addRowUi = function( row : TimelineRowModel ) { rowUis.add( new TimelineRowUi( row.rowGuid ) ); }
            var removeRowUi = function( row : TimelineRowModel ) { rowUis.removeId( row.rowGuid ); }
            model.rows.forEach( addRowUi );
            model.rows.valueAdded.on( addRowUi );
            model.rows.valueRemoved.on( removeRowUi );

            this._eventStyles = new OrderedSet<TimelineEventStyleUi>( [], (s)=>s.styleGuid );
            this._annotationStyles = new OrderedSet<TimelineAnnotationStyleUi>( [], (s)=>s.styleGuid );
            
            this._millisPerPx = new SimpleModel<number>( 1000 );

            this._imageStatus = {};
            this._imageCache = {};
            
            this._dispose.on( function( ) {
                model.groups.valueAdded.off( addGroupUi );
                model.groups.valueRemoved.off( removeGroupUi );
                model.rows.valueAdded.off( addRowUi );
                model.rows.valueRemoved.off( removeRowUi );
            } );
        }

        get input( ) : TimelineInput {
            return this._input;
        }

        get selection( ) : TimelineSelectionModel {
            return this._selection;
        }

        get groupUis( ) : OrderedSet<TimelineGroupUi> {
            return this._groupUis;
        }

        groupUi( groupGuid : string ) : TimelineGroupUi {
            return this._groupUis.valueFor( groupGuid );
        }

        get rowUis( ) : OrderedSet<TimelineRowUi> {
            return this._rowUis;
        }

        rowUi( rowGuid : string ) : TimelineRowUi {
            return this._rowUis.valueFor( rowGuid );
        }

        get eventStyles( ) : OrderedSet<TimelineEventStyleUi> {
            return this._eventStyles;
        }

        eventStyle( styleGuid : string ) : TimelineEventStyleUi {
            return ( ( isNotEmpty( styleGuid ) && this._eventStyles.valueFor( styleGuid ) ) || timelineEventStyle_DEFAULT );
        }
        
        get annotationStyles( ) : OrderedSet<TimelineAnnotationStyleUi> {
            return this._annotationStyles;
        }

        annotationStyle( styleGuid : string ) : TimelineAnnotationStyleUi {
            return ( ( isNotEmpty( styleGuid ) && this._annotationStyles.valueFor( styleGuid ) ) || timelineAnnotationStyle_DEFAULT );
        }

        get millisPerPx( ) : SimpleModel<number> {
            return this._millisPerPx;
        }

        loadImage( url : string, onLoaded : ()=>void ) : Texture2D {
            if ( !isNotEmpty( this._imageStatus[ url ] ) ) {
                this._imageStatus[ url ] = true;

                var imageCache = this._imageCache;
                var image = new Image( );
                image.onload = function( ) {
                    var w = image.naturalWidth;
                    var h = image.naturalHeight;
                    imageCache[ url ] = new Texture2D( w, h, GL.LINEAR, GL.LINEAR, function( g ) { g.drawImage( image, 0, 0 ); } );
                    if ( onLoaded ) onLoaded( );
                };
                image.src = url;
            }
            return this._imageCache[ url ];
        }
        
        get panes( ) : OrderedSet<Pane> {
            return this._panes;
        }
        
        addPane( paneId : string, pane : Pane ) {
            pane['webglext_PaneId'] = paneId;
            this._panes.removeId( paneId );
            this._panes.add( pane );
        }
        
        removePane( paneId : string ) {
            this._panes.removeId( paneId );
        }
        
        getPane( paneId : string ) : Pane {
            return this._panes.valueFor( paneId );
        }
        
        get dispose( ) { return this._dispose; }
    }



    export class TimelineGroupUi {
        private _groupGuid : string;

        constructor( groupGuid : string ) {
            this._groupGuid = groupGuid;
        }

        get groupGuid( ) : string {
            return this._groupGuid;
        }
    }



    export class TimelineRowUi {
        private _rowGuid : string;
        private _paneFactoryChanged : Notification;
        private _paneFactory : TimelineRowPaneFactory;
        private _panes : OrderedSet<Pane>;

        constructor( rowGuid : string ) {
            this._rowGuid = rowGuid;
            this._paneFactoryChanged = new Notification( );
            this._paneFactory = null;
            
            var getPaneId = function( pane ) {
                var paneId = pane['webglext_PaneId']
                return isNotEmpty( paneId ) ? paneId : getObjectId( pane );
            }
            
            this._panes = new OrderedSet<Pane>( [], getPaneId );
        }

        get rowGuid( ) : string {
            return this._rowGuid;
        }

        get paneFactoryChanged( ) : Notification {
            return this._paneFactoryChanged;
        }

        get paneFactory( ) : TimelineRowPaneFactory {
            return this._paneFactory;
        }

        set paneFactory( paneFactory : TimelineRowPaneFactory ) {
            if ( paneFactory !== this._paneFactory ) {
                this._paneFactory = paneFactory;
                this._paneFactoryChanged.fire( );
            }
        }
        
        get panes( ) : OrderedSet<Pane> {
            return this._panes;
        }
        
        addPane( paneId : string, pane : Pane ) {
            pane['webglext_PaneId'] = paneId;
            this._panes.removeId( paneId );
            this._panes.add( pane );
        }
        
        removePane( paneId : string ) {
            this._panes.removeId( paneId );
        }
        
        getPane( paneId : string ) : Pane {
            return this._panes.valueFor( paneId );
        }
    }


    var timelineAnnotationStyle_DEFAULT = new TimelineAnnotationStyleUi( {
        styleGuid: 'DEFAULT',
        color: 'white',
        icons: []
    } );


    var timelineEventStyle_DEFAULT = new TimelineEventStyleUi( {
        styleGuid: 'DEFAULT',
        icons: []
    } );



    export class TimelineInput {
        private _mouseMove = new Notification1<PointerEvent>( );
        private _mouseExit = new Notification1<PointerEvent>( );
        private _timeHover = new Notification2<number,PointerEvent>( );
        private _rowHover = new Notification2<TimelineRowModel,PointerEvent>( );
        private _eventHover = new Notification2<TimelineTrackModel,PointerEvent>( );
        private _mouseDown = new Notification1<PointerEvent>( );
        private _mouseUp = new Notification1<PointerEvent>( );
        private _contextMenu = new Notification1<PointerEvent>( );

        get mouseMove( ) : Notification1<PointerEvent> { return this._mouseMove; }
        get mouseExit( ) : Notification1<PointerEvent> { return this._mouseExit; }
        get timeHover( ) : Notification2<number,PointerEvent> { return this._timeHover; }
        get rowHover( ) : Notification2<TimelineRowModel,PointerEvent> { return this._rowHover; }
        get eventHover( ) : Notification2<TimelineTrackModel,PointerEvent> { return this._eventHover; }
        get mouseDown( ) : Notification1<PointerEvent> { return this._mouseDown; }
        get mouseUp( ) : Notification1<PointerEvent> { return this._mouseUp; }
        get contextMenu( ) : Notification1<PointerEvent> { return this._contextMenu; }
    }



    export class TimelineSelectionModel {
        private _mousePos = new XyModel( );
        
        private _hoveredY = new SimpleModel<number>( );
        private _hoveredTime_PMILLIS = new SimpleModel<number>( );
        private _selectedInterval = new TimeIntervalModel( 0, 0 );
        
        private _hoveredRow = new SimpleModel<TimelineRowModel>( );
        
        private _hoveredEvent = new SimpleModel<TimelineTrackModel>( );
        private _selectedEvents = new OrderedSet<TimelineTrackModel>( [], (e)=>e.eventGuid );

        private _hoveredAnnotation = new SimpleModel<TimelineAnnotationModel>( );
        
        get mousePos( ) : XyModel { return this._mousePos; }
        
        get hoveredY( ) : SimpleModel<number> { return this._hoveredY; }
        get hoveredTime_PMILLIS( ) : SimpleModel<number> { return this._hoveredTime_PMILLIS; }
        get selectedInterval( ) : TimeIntervalModel { return this._selectedInterval; }
        
        get hoveredRow( ) : SimpleModel<TimelineRowModel> { return this._hoveredRow; }
        
        get hoveredEvent( ) : SimpleModel<TimelineTrackModel> { return this._hoveredEvent; }
        get selectedEvents( ) : OrderedSet<TimelineTrackModel> { return this._selectedEvents; }
        
        get hoveredAnnotation( ) : SimpleModel<TimelineAnnotationModel> { return this._hoveredAnnotation; }
    }

    export class TimeIntervalModel {
        private _start_PMILLIS : number;
        private _end_PMILLIS : number;
        private _cursor_PMILLIS : number;
        private _changed : Notification;

        constructor( start_PMILLIS : number, end_PMILLIS : number, cursor_PMILLIS? : number ) {
            this._start_PMILLIS = start_PMILLIS;
            this._end_PMILLIS = end_PMILLIS;
            this._cursor_PMILLIS = cursor_PMILLIS ? cursor_PMILLIS : end_PMILLIS;
            this._changed = new Notification( );
        }

        get start_PMILLIS( ) : number { return this._start_PMILLIS; }
        get end_PMILLIS( ) : number { return this._end_PMILLIS; }
        get cursor_PMILLIS( ) : number { return this._cursor_PMILLIS; }
        get duration_MILLIS( ) : number { return this._end_PMILLIS - this._start_PMILLIS; }
        get changed( ) : Notification { return this._changed; }

        set start_PMILLIS( start_PMILLIS : number ) {
            if ( start_PMILLIS !== this._start_PMILLIS ) {
                this._start_PMILLIS = start_PMILLIS;
                this._changed.fire( );
            }
        }

        set end_PMILLIS( end_PMILLIS : number ) {
            if ( end_PMILLIS !== this._end_PMILLIS ) {
                this._end_PMILLIS = end_PMILLIS;
                this._changed.fire( );
            }
        }
        
        set cursor_PMILLIS( cursor_PMILLIS : number ) {
            if ( cursor_PMILLIS !== this._cursor_PMILLIS ) {
                this._cursor_PMILLIS = cursor_PMILLIS;
                this._changed.fire( );
            }
        }

        setInterval( start_PMILLIS : number, end_PMILLIS : number, cursor_PMILLIS? : number ) {
            if ( start_PMILLIS !== this._start_PMILLIS ||
                     end_PMILLIS !== this._end_PMILLIS ||
                     ( cursor_PMILLIS && cursor_PMILLIS != this._cursor_PMILLIS ) ) {
                
                this._start_PMILLIS = start_PMILLIS;
                this._end_PMILLIS = end_PMILLIS;
                this._cursor_PMILLIS = cursor_PMILLIS ? cursor_PMILLIS : end_PMILLIS;
                this._changed.fire( );
            }
        }

        overlaps( start_PMILLIS : number, end_PMILLIS : number ) : boolean {
            return ( this._start_PMILLIS <= end_PMILLIS && start_PMILLIS <= this._end_PMILLIS );
        }
        
        contains( time_PMILLIS : number ) : boolean {
            return ( this._start_PMILLIS <= time_PMILLIS && time_PMILLIS <= this._end_PMILLIS );
        }

        pan( amount_MILLIS : number ) {
            if ( amount_MILLIS !== 0 ) {
                this._start_PMILLIS += amount_MILLIS;
                this._end_PMILLIS += amount_MILLIS;
                this._cursor_PMILLIS += amount_MILLIS;
                this._changed.fire( );
            }
        }

        scale( factor : number, anchor_PMILLIS : number ) {
            if ( anchor_PMILLIS !== 1 ) {
                this._start_PMILLIS =     anchor_PMILLIS + factor * ( this._start_PMILLIS - anchor_PMILLIS );
                this._end_PMILLIS =       anchor_PMILLIS + factor * ( this._end_PMILLIS - anchor_PMILLIS );
                this._cursor_PMILLIS = anchor_PMILLIS + factor * ( this._cursor_PMILLIS - anchor_PMILLIS );
                this._changed.fire( );
            }
        }
    }



    function attachTimelineInputToSelection( input : TimelineInput, selection : TimelineSelectionModel, options : TimelineUiOptions ) {
        
        var allowEventMultiSelection   = ( isNotEmpty( options ) && isNotEmpty( options.allowEventMultiSelection ) ? options.allowEventMultiSelection : true );
        
        // Mouse-pos & Time
        //
        input.mouseMove.on( function( ev : PointerEvent ) {
            selection.mousePos.setXy( ev.i, ev.j );
        } );
        input.mouseExit.on( function( ev : PointerEvent ) {
            selection.mousePos.setXy( null, null );
        } );
        input.rowHover.on( function( row : TimelineRowModel, ev : PointerEvent ) {
            selection.hoveredRow.value = row;
        } );
        input.timeHover.on( function( time_PMILLIS : number, ev : PointerEvent ) {
            selection.hoveredTime_PMILLIS.value = time_PMILLIS;
        } );

        // Events
        //
        input.eventHover.on( function( event : TimelineTrackModel ) {
            selection.hoveredEvent.value = event;
        } );
        
        if ( options.allowEventMultiSelection ) {
            input.mouseDown.on( function( ev : PointerEvent ) {
                if ( isLeftMouseDown( ev.mouseEvent ) ) {
                    var event = selection.hoveredEvent.value;
                    if ( isNotEmpty( event ) ) {
                        var multiSelectMode = ( ev.mouseEvent && ( ev.mouseEvent.ctrlKey || ev.mouseEvent.shiftKey ) );
                        var unselectedEventClicked = !selection.selectedEvents.hasValue( event );
                        if ( multiSelectMode ) {
                            if ( selection.selectedEvents.hasValue( event ) ) {
                                selection.selectedEvents.removeValue( event );
                            }
                            else {
                                selection.selectedEvents.add( event );
                            }
                        }
                        else if ( unselectedEventClicked ) {
                            selection.selectedEvents.retainValues( [ event ] );
                            selection.selectedEvents.add( event );
                        }
                        else {
                            // if a selected event is clicked, do nothing (the user is probably initiating a drag)
                            // if they wish to deselect the event, they need to ctrl+click the event or click on
                            // a deselected event
                        }
                    }
                }
            } );
        }
        else {
            input.mouseDown.on( function( ev : PointerEvent ) {
                if ( isLeftMouseDown( ev.mouseEvent ) ) {
                    var event = selection.hoveredEvent.value;
                    if ( isNotEmpty( event ) ) {
                        selection.selectedEvents.retainValues( [ event ] );
                        selection.selectedEvents.add( event );
                    }
                }
            } );
        }
    }
}