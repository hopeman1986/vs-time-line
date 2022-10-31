module webglext {


    export interface TimelineEventIcon {
        url : string;
        displayWidth : number;  // horizontal size of icon in pixels
        displayHeight : number; // vertical size of icon in pixels
        hAlign : number; // relative location of center pixel of icon (0=left side, 1=right side)
        hPos : number; // relative icon position along event bar (0=left side, 1=right side)
    }



    export interface TimelineEventStyle {
        styleGuid : string;
        icons : TimelineEventIcon[];
    }



    export class TimelineEventIconUi {
        private _url : string;
        private _displayWidth : number;
        private _displayHeight : number;
        private _hAlign : number;
        private _hPos : number;

        constructor( icon : TimelineEventIcon ) {
            this._setAttrs( icon );
        }

        private _setAttrs( icon : TimelineEventIcon ) {
            this._url = icon.url;
            this._displayWidth = icon.displayWidth;
            this._displayHeight = icon.displayHeight;
            this._hAlign = icon.hAlign;
            this._hPos = icon.hPos;
        }

        get url( ) : string { return this._url; }
        get displayWidth( ) : number { return this._displayWidth; }
        get displayHeight( ) : number { return this._displayHeight; }
        get hAlign( ) : number { return this._hAlign; }
        get hPos( ) : number { return this._hPos; }

        snapshot( ) : TimelineEventIcon {
            return {
                url: this._url,
                displayWidth: this._displayWidth,
                displayHeight: this._displayHeight,
                hAlign: this._hAlign,
                hPos: this._hPos
            };
        }
    }



    export class TimelineEventStyleUi {
        private _styleGuid : string;
        private _icons : TimelineEventIconUi[];

        constructor( style : TimelineEventStyle ) {
            this._styleGuid = style.styleGuid;
            this._setAttrs( style );
        }

        get styleGuid( ) : string {
            return this._styleGuid;
        }

        private _setAttrs( style : TimelineEventStyle ) {
            this._icons = style.icons.map( ( icon )=>{ return new TimelineEventIconUi( icon ); } );
        }

        get numIcons( ) : number {
            return this._icons.length;
        }

        icon( index : number ) : TimelineEventIconUi {
            return this._icons[ index ];
        }

        snapshot( ) : TimelineEventStyle {
            return {
                styleGuid: this._styleGuid,
                icons: this._icons.map( (ui)=>ui.snapshot() )
            };
        }
    }



}