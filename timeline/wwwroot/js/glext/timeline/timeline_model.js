var webglext;
(function (webglext) {
    var TimelineCursorModel = /** @class */ (function () {
        function TimelineCursorModel(cursor) {
            this._cursorGuid = cursor.cursorGuid;
            this._attrsChanged = new webglext.Notification();
            this.setAttrs(cursor);
        }
        Object.defineProperty(TimelineCursorModel.prototype, "labeledTimeseriesGuids", {
            get: function () {
                return this._labeledTimeseriesGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "cursorGuid", {
            get: function () {
                return this._cursorGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "lineColor", {
            get: function () {
                return this._lineColor;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "textColor", {
            get: function () {
                return this._textColor;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "showVerticalLine", {
            get: function () {
                return this._showVerticalLine;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "showHorizontalLine", {
            get: function () {
                return this._showHorizontalLine;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineCursorModel.prototype, "showCursorText", {
            get: function () {
                return this._showCursorText;
            },
            enumerable: false,
            configurable: true
        });
        TimelineCursorModel.prototype.setAttrs = function (cursor) {
            this._labeledTimeseriesGuids = new webglext.OrderedStringSet(cursor.labeledTimeseriesGuids || []);
            this._lineColor = (webglext.isNotEmpty(cursor.lineColor) ? webglext.parseCssColor(cursor.lineColor) : null);
            this._textColor = (webglext.isNotEmpty(cursor.textColor) ? webglext.parseCssColor(cursor.textColor) : null);
            this._showVerticalLine = cursor.showVerticalLine;
            this._showHorizontalLine = cursor.showHorizontalLine;
            this._showCursorText = cursor.showCursorText;
            this._attrsChanged.fire();
        };
        TimelineCursorModel.prototype.snapshot = function () {
            return {
                cursorGuid: this._cursorGuid,
                labeledTimeseriesGuids: this._labeledTimeseriesGuids.toArray(),
                lineColor: (webglext.isNotEmpty(this._lineColor) ? this._lineColor.cssString : null),
                textColor: (webglext.isNotEmpty(this._textColor) ? this._textColor.cssString : null),
                showVerticalLine: this._showVerticalLine,
                showHorizontalLine: this._showHorizontalLine,
                showCursorText: this._showCursorText
            };
        };
        return TimelineCursorModel;
    }());
    webglext.TimelineCursorModel = TimelineCursorModel;
    var TimelineAnnotationModel = /** @class */ (function () {
        function TimelineAnnotationModel(annotation) {
            this._annotationGuid = annotation.annotationGuid;
            this._attrsChanged = new webglext.Notification();
            this.setAttrs(annotation);
        }
        Object.defineProperty(TimelineAnnotationModel.prototype, "annotationGuid", {
            get: function () {
                return this._annotationGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationModel.prototype.setLocation = function (time_PMILLIS, y) {
            if (time_PMILLIS !== this._time_PMILLIS || y !== this.y) {
                this._y = y;
                this._time_PMILLIS = time_PMILLIS;
                this._attrsChanged.fire();
            }
        };
        Object.defineProperty(TimelineAnnotationModel.prototype, "time_PMILLIS", {
            get: function () {
                return this._time_PMILLIS;
            },
            set: function (time_PMILLIS) {
                if (time_PMILLIS !== this._time_PMILLIS) {
                    this._time_PMILLIS = time_PMILLIS;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationModel.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (y) {
                if (y !== this.y) {
                    this._y = y;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationModel.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (label) {
                if (label !== this.label) {
                    this._label = label;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineAnnotationModel.prototype, "styleGuid", {
            get: function () {
                return this._styleGuid;
            },
            set: function (styleGuid) {
                if (styleGuid !== this.styleGuid) {
                    this._styleGuid = styleGuid;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        TimelineAnnotationModel.prototype.setAttrs = function (annotation) {
            // Don't both checking whether values are going to change -- it's not that important, and it would be obnoxious here
            this._time_PMILLIS = webglext.isNotEmpty(annotation.time_ISO8601) ? webglext.parseTime_PMILLIS(annotation.time_ISO8601) : undefined;
            this._y = annotation.y;
            this._label = annotation.label;
            this._styleGuid = annotation.styleGuid;
            this._attrsChanged.fire();
        };
        TimelineAnnotationModel.prototype.snapshot = function () {
            return {
                annotationGuid: this._annotationGuid,
                label: this._label,
                styleGuid: this._styleGuid,
                time_ISO8601: webglext.formatTime_ISO8601(this._time_PMILLIS),
                y: this._y,
            };
        };
        return TimelineAnnotationModel;
    }());
    webglext.TimelineAnnotationModel = TimelineAnnotationModel;
    var TimelineEventModel = /** @class */ (function () {
        function TimelineEventModel(event) {
            this._eventGuid = event.eventGuid;
            this._attrsChanged = new webglext.Notification();
            this.setAttrs(event);
        }
        Object.defineProperty(TimelineEventModel.prototype, "eventGuid", {
            get: function () {
                return this._eventGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        TimelineEventModel.prototype.setAttrs = function (event) {
            // Don't both checking whether values are going to change -- it's not that important, and it would be obnoxious here
            this._startLimit_PMILLIS = (webglext.isNotEmpty(event.startLimit_ISO8601) ? webglext.parseTime_PMILLIS(event.startLimit_ISO8601) : null);
            this._endLimit_PMILLIS = (webglext.isNotEmpty(event.endLimit_ISO8601) ? webglext.parseTime_PMILLIS(event.endLimit_ISO8601) : null);
            this._start_PMILLIS = webglext.parseTime_PMILLIS(event.start_time);
            this._end_PMILLIS = webglext.parseTime_PMILLIS(event.end_time);
            this._label = event.label;
            this._labelIcon = event.labelIcon;
            this._userEditable = (webglext.isNotEmpty(event.userEditable) ? event.userEditable : false);
            this._styleGuid = event.styleGuid;
            this._order = event.order;
            this._topMargin = event.topMargin;
            this._bottomMargin = event.bottomMargin;
            this._fgColor = (webglext.isNotEmpty(event.fgColor) ? webglext.parseCssColor(event.fgColor) : null);
            this._bgColor = (webglext.isNotEmpty(event.bgColor) ? webglext.parseCssColor(event.bgColor) : null);
            this._bgSecondaryColor = (webglext.isNotEmpty(event.bgSecondaryColor) ? webglext.parseCssColor(event.bgSecondaryColor) : null);
            this._borderColor = (webglext.isNotEmpty(event.borderColor) ? webglext.parseCssColor(event.borderColor) : null);
            this._borderSecondaryColor = (webglext.isNotEmpty(event.borderSecondaryColor) ? webglext.parseCssColor(event.borderSecondaryColor) : null);
            this._labelTopMargin = event.labelTopMargin;
            this._labelBottomMargin = event.labelBottomMargin;
            this._labelVAlign = event.labelVAlign;
            this._labelVPos = event.labelVPos;
            this._labelHAlign = event.labelHAlign;
            this._labelHPos = event.labelHPos;
            this._isBorderDashed = (webglext.isNotEmpty(event.isBorderDashed) ? event.isBorderDashed : false);
            this._fillPattern = (webglext.isNotEmpty(event.fillPattern) ? webglext.FillPattern[event.fillPattern] : webglext.FillPattern.solid);
            this._attrsChanged.fire();
        };
        TimelineEventModel.prototype.setInterval = function (start_PMILLIS, end_PMILLIS) {
            if (start_PMILLIS !== this._start_PMILLIS || end_PMILLIS !== this._end_PMILLIS) {
                var initial_start_PMILLIS = this._start_PMILLIS;
                var initial_end_PMILLIS = this._end_PMILLIS;
                var underStartLimit = webglext.isNotEmpty(this._startLimit_PMILLIS) && start_PMILLIS < this._startLimit_PMILLIS;
                var overEndLimit = webglext.isNotEmpty(this._endLimit_PMILLIS) && end_PMILLIS > this._endLimit_PMILLIS;
                var duration_PMILLIS = end_PMILLIS - start_PMILLIS;
                var durationLimit_PMILLIS = this._endLimit_PMILLIS - this._startLimit_PMILLIS;
                // If both limits are present and the event is larger than the total distance between them
                // then shrink the event to fit between the limits.
                if (webglext.isNotEmpty(this._startLimit_PMILLIS) && webglext.isNotEmpty(this._endLimit_PMILLIS) && durationLimit_PMILLIS < duration_PMILLIS) {
                    this._start_PMILLIS = this._startLimit_PMILLIS;
                    this._end_PMILLIS = this._endLimit_PMILLIS;
                }
                // Otherwise shift the event to comply with the limits without adjusting its total duration
                else if (underStartLimit) {
                    this._start_PMILLIS = this._startLimit_PMILLIS;
                    this._end_PMILLIS = this._start_PMILLIS + duration_PMILLIS;
                }
                else if (overEndLimit) {
                    this._end_PMILLIS = this._endLimit_PMILLIS;
                    this._start_PMILLIS = this._end_PMILLIS - duration_PMILLIS;
                }
                else {
                    this._end_PMILLIS = end_PMILLIS;
                    this._start_PMILLIS = start_PMILLIS;
                }
                // its possible due to the limits that the values didn't actually change
                // only fire attrsChanged if one of the values did actually change
                if (initial_start_PMILLIS !== this._start_PMILLIS || initial_end_PMILLIS !== this._end_PMILLIS) {
                    this._attrsChanged.fire();
                }
            }
        };
        TimelineEventModel.prototype.limit_start_PMILLIS = function (start_PMILLIS) {
            return webglext.isNotEmpty(this._startLimit_PMILLIS) ? Math.max(start_PMILLIS, this._startLimit_PMILLIS) : start_PMILLIS;
        };
        TimelineEventModel.prototype.limit_end_PMILLIS = function (end_PMILLIS) {
            return webglext.isNotEmpty(this._endLimit_PMILLIS) ? Math.min(end_PMILLIS, this._endLimit_PMILLIS) : end_PMILLIS;
        };
        Object.defineProperty(TimelineEventModel.prototype, "start_PMILLIS", {
            get: function () {
                return this._start_PMILLIS;
            },
            set: function (start_PMILLIS) {
                if (start_PMILLIS !== this._start_PMILLIS) {
                    this._start_PMILLIS = this.limit_start_PMILLIS(start_PMILLIS);
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "end_PMILLIS", {
            get: function () {
                return this._end_PMILLIS;
            },
            set: function (end_PMILLIS) {
                if (end_PMILLIS !== this._end_PMILLIS) {
                    this._end_PMILLIS = this.limit_end_PMILLIS(end_PMILLIS);
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "startLimit_PMILLIS", {
            get: function () {
                return this._startLimit_PMILLIS;
            },
            set: function (startLimit_PMILLIS) {
                if (startLimit_PMILLIS !== this._startLimit_PMILLIS) {
                    this._startLimit_PMILLIS = startLimit_PMILLIS;
                    this._start_PMILLIS = this.limit_start_PMILLIS(this._start_PMILLIS);
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "endLimit_PMILLIS", {
            get: function () {
                return this._endLimit_PMILLIS;
            },
            set: function (endLimit_PMILLIS) {
                if (endLimit_PMILLIS !== this._endLimit_PMILLIS) {
                    this._endLimit_PMILLIS = endLimit_PMILLIS;
                    this._end_PMILLIS = this.limit_end_PMILLIS(this._end_PMILLIS);
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (label) {
                if (label !== this._label) {
                    this._label = label;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelIcon", {
            get: function () {
                return this._labelIcon;
            },
            set: function (labelIcon) {
                if (labelIcon !== this._labelIcon) {
                    this._labelIcon = labelIcon;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "userEditable", {
            get: function () {
                return this._userEditable;
            },
            set: function (userEditable) {
                if (userEditable !== this._userEditable) {
                    this._userEditable = userEditable;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "styleGuid", {
            get: function () {
                return this._styleGuid;
            },
            set: function (styleGuid) {
                if (styleGuid !== this._styleGuid) {
                    this._styleGuid = styleGuid;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "order", {
            get: function () {
                return this._order;
            },
            set: function (order) {
                if (order !== this._order) {
                    this._order = order;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "topMargin", {
            get: function () {
                return this._topMargin;
            },
            set: function (topMargin) {
                if (topMargin !== this._topMargin) {
                    this._topMargin = topMargin;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "bottomMargin", {
            get: function () {
                return this._bottomMargin;
            },
            set: function (bottomMargin) {
                if (bottomMargin !== this._bottomMargin) {
                    this._bottomMargin = bottomMargin;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "fgColor", {
            get: function () {
                return this._fgColor;
            },
            set: function (fgColor) {
                if (fgColor !== this._fgColor) {
                    this._fgColor = fgColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "bgColor", {
            get: function () {
                return this._bgColor;
            },
            set: function (bgColor) {
                if (bgColor !== this._bgColor) {
                    this._bgColor = bgColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "bgSecondaryColor", {
            get: function () {
                return this._bgSecondaryColor;
            },
            set: function (bgSecondaryColor) {
                if (bgSecondaryColor !== this._bgSecondaryColor) {
                    this._bgSecondaryColor = bgSecondaryColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "borderColor", {
            get: function () {
                return this._borderColor;
            },
            set: function (borderColor) {
                if (borderColor !== this._borderColor) {
                    this._borderColor = borderColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "borderSecondaryColor", {
            get: function () {
                return this._borderSecondaryColor;
            },
            set: function (borderSecondaryColor) {
                if (borderSecondaryColor !== this._borderSecondaryColor) {
                    this._borderSecondaryColor = borderSecondaryColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelTopMargin", {
            get: function () {
                return this._labelTopMargin;
            },
            set: function (labelTopMargin) {
                if (labelTopMargin !== this._labelTopMargin) {
                    this._labelTopMargin = labelTopMargin;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelBottomMargin", {
            get: function () {
                return this._labelBottomMargin;
            },
            set: function (labelBottomMargin) {
                if (labelBottomMargin !== this._labelBottomMargin) {
                    this._labelBottomMargin = labelBottomMargin;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelVAlign", {
            get: function () {
                return this._labelVAlign;
            },
            set: function (labelVAlign) {
                if (labelVAlign !== this._labelVAlign) {
                    this._labelVAlign = labelVAlign;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelVPos", {
            get: function () {
                return this._labelVPos;
            },
            set: function (labelVPos) {
                if (labelVPos !== this._labelVPos) {
                    this._labelVPos = labelVPos;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelHAlign", {
            get: function () {
                return this._labelHAlign;
            },
            set: function (labelHAlign) {
                if (labelHAlign !== this._labelHAlign) {
                    this._labelHAlign = labelHAlign;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "labelHPos", {
            get: function () {
                return this._labelHPos;
            },
            set: function (labelHPos) {
                if (labelHPos !== this._labelHPos) {
                    this._labelHPos = labelHPos;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "isBorderDashed", {
            get: function () {
                return this._isBorderDashed;
            },
            set: function (isBorderDashed) {
                if (isBorderDashed !== this._isBorderDashed) {
                    this._isBorderDashed = isBorderDashed;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineEventModel.prototype, "fillPattern", {
            get: function () {
                return this._fillPattern;
            },
            set: function (fillPattern) {
                if (fillPattern !== this._fillPattern) {
                    this._fillPattern = fillPattern;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        TimelineEventModel.prototype.snapshot = function () {
            return {
                eventGuid: this._eventGuid,
                startLimit_ISO8601: (webglext.isNotEmpty(this._startLimit_PMILLIS) ? webglext.formatTime_ISO8601(this._startLimit_PMILLIS) : null),
                endLimit_ISO8601: (webglext.isNotEmpty(this._endLimit_PMILLIS) ? webglext.formatTime_ISO8601(this._endLimit_PMILLIS) : null),
                start_time: webglext.formatTime_ISO8601(this._start_PMILLIS),
                end_time: webglext.formatTime_ISO8601(this._end_PMILLIS),
                label: this._label,
                labelIcon: this._labelIcon,
                userEditable: this._userEditable,
                styleGuid: this._styleGuid,
                order: this._order,
                topMargin: this._topMargin,
                bottomMargin: this._bottomMargin,
                bgColor: (webglext.isNotEmpty(this._bgColor) ? this._bgColor.cssString : null),
                bgSecondaryColor: (webglext.isNotEmpty(this._bgSecondaryColor) ? this._bgSecondaryColor.cssString : null),
                fgColor: (webglext.isNotEmpty(this._fgColor) ? this._fgColor.cssString : null),
                borderColor: (webglext.isNotEmpty(this._borderColor) ? this._borderColor.cssString : null),
                borderSecondaryColor: (webglext.isNotEmpty(this._borderSecondaryColor) ? this.borderSecondaryColor.cssString : null),
                labelTopMargin: this._labelTopMargin,
                labelBottomMargin: this._labelBottomMargin,
                labelVAlign: this._labelVAlign,
                labelVPos: this._labelVPos,
                labelHAlign: this._labelHAlign,
                labelHPos: this._labelHPos,
                isBorderDashed: this._isBorderDashed,
                fillPattern: webglext.FillPattern[this._fillPattern]
            };
        };
        return TimelineEventModel;
    }());
    webglext.TimelineEventModel = TimelineEventModel;
    var TimelineRowModel = /** @class */ (function () {
        function TimelineRowModel(row) {
            this._rowGuid = row.rowGuid;
            this._attrsChanged = new webglext.Notification();
            var min = webglext.isNotEmpty(row.yMin) ? row.yMin : 0;
            var max = webglext.isNotEmpty(row.yMax) ? row.yMax : 1;
            this._dataAxis = new webglext.Axis1D(min, max);
            this.setAttrs(row);
            this._eventGuids = new webglext.OrderedStringSet(row.eventGuids || []);
            this._timeseriesGuids = new webglext.OrderedStringSet(row.timeseriesGuids || []);
            this._annotationGuids = new webglext.OrderedStringSet(row.annotationGuids || []);
        }
        Object.defineProperty(TimelineRowModel.prototype, "rowGuid", {
            get: function () {
                return this._rowGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        TimelineRowModel.prototype.setAttrs = function (row) {
            // Don't both checking whether values are going to change -- it's not that important, and it would be obnoxious here
            this._label = row.label;
            this._uiHint = row.uiHint;
            this._hidden = row.hidden;
            this._rowHeight = row.rowHeight;
            this._cursorGuid = row.cursorGuid;
            this._bgColor = (webglext.isNotEmpty(row.bgColor) ? webglext.parseCssColor(row.bgColor) : null);
            this._fgLabelColor = (webglext.isNotEmpty(row.fgLabelColor) ? webglext.parseCssColor(row.fgLabelColor) : null);
            this._bgLabelColor = (webglext.isNotEmpty(row.bgLabelColor) ? webglext.parseCssColor(row.bgLabelColor) : null);
            this._labelFont = row.labelFont;
            this._attrsChanged.fire();
        };
        Object.defineProperty(TimelineRowModel.prototype, "cursorGuid", {
            get: function () {
                return this._cursorGuid;
            },
            set: function (cursorGuid) {
                this._cursorGuid = cursorGuid;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "rowHeight", {
            get: function () {
                return this._rowHeight;
            },
            set: function (rowHeight) {
                this._rowHeight = rowHeight;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "hidden", {
            get: function () {
                return this._hidden;
            },
            set: function (hidden) {
                this._hidden = hidden;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "dataAxis", {
            get: function () {
                return this._dataAxis;
            },
            set: function (dataAxis) {
                this._dataAxis = dataAxis;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (label) {
                if (label !== this._label) {
                    this._label = label;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "uiHint", {
            get: function () {
                return this._uiHint;
            },
            set: function (uiHint) {
                if (uiHint !== this._uiHint) {
                    this._uiHint = uiHint;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "bgColor", {
            get: function () {
                return this._bgColor;
            },
            set: function (bgColor) {
                if (bgColor !== this._bgColor) {
                    this._bgColor = bgColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "bgLabelColor", {
            get: function () {
                return this._bgLabelColor;
            },
            set: function (bgLabelColor) {
                if (bgLabelColor !== this._bgLabelColor) {
                    this._bgLabelColor = bgLabelColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "fgLabelColor", {
            get: function () {
                return this._fgLabelColor;
            },
            set: function (fgLabelColor) {
                if (fgLabelColor !== this._fgLabelColor) {
                    this._fgLabelColor = fgLabelColor;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "labelFont", {
            get: function () {
                return this._labelFont;
            },
            set: function (labelFont) {
                if (labelFont !== this._labelFont) {
                    this._labelFont = labelFont;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "eventGuids", {
            get: function () {
                return this._eventGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "timeseriesGuids", {
            get: function () {
                return this._timeseriesGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRowModel.prototype, "annotationGuids", {
            get: function () {
                return this._annotationGuids;
            },
            enumerable: false,
            configurable: true
        });
        TimelineRowModel.prototype.snapshot = function () {
            return {
                rowGuid: this._rowGuid,
                label: this._label,
                rowHeight: this._rowHeight,
                hidden: this._hidden,
                uiHint: this._uiHint,
                eventGuids: this._eventGuids.toArray(),
                timeseriesGuids: this._timeseriesGuids.toArray(),
                annotationGuids: this._annotationGuids.toArray(),
                cursorGuid: this._cursorGuid,
                bgColor: (webglext.isNotEmpty(this._bgColor) ? this._bgColor.cssString : null),
                bgLabelColor: (webglext.isNotEmpty(this._bgLabelColor) ? this._bgLabelColor.cssString : null),
                fgLabelColor: (webglext.isNotEmpty(this._fgLabelColor) ? this._fgLabelColor.cssString : null),
                labelFont: this._labelFont
            };
        };
        return TimelineRowModel;
    }());
    webglext.TimelineRowModel = TimelineRowModel;
    var TimelineGroupModel = /** @class */ (function () {
        function TimelineGroupModel(group) {
            this._groupGuid = group.groupGuid;
            this._attrsChanged = new webglext.Notification();
            this.setAttrs(group);
            this._rowGuids = new webglext.OrderedStringSet(group.rowGuids);
        }
        Object.defineProperty(TimelineGroupModel.prototype, "groupGuid", {
            get: function () {
                return this._groupGuid;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineGroupModel.prototype, "rollupGuid", {
            get: function () {
                return this._rollupGuid;
            },
            set: function (rollupGuid) {
                this._rollupGuid = rollupGuid;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineGroupModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        TimelineGroupModel.prototype.setAttrs = function (group) {
            // Don't both checking whether values are going to change -- it's not that important, and it would be obnoxious here
            this._rollupGuid = group.rollupGuid;
            this._hidden = group.hidden;
            this._label = group.label;
            this._collapsed = group.collapsed;
            this._attrsChanged.fire();
        };
        Object.defineProperty(TimelineGroupModel.prototype, "hidden", {
            get: function () {
                return this._hidden;
            },
            set: function (hidden) {
                this._hidden = hidden;
                this._attrsChanged.fire();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineGroupModel.prototype, "label", {
            get: function () {
                return this._label;
            },
            set: function (label) {
                if (label !== this._label) {
                    this._label = label;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineGroupModel.prototype, "collapsed", {
            get: function () {
                return this._collapsed;
            },
            set: function (collapsed) {
                if (collapsed !== this._collapsed) {
                    this._collapsed = collapsed;
                    this._attrsChanged.fire();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineGroupModel.prototype, "rowGuids", {
            get: function () {
                return this._rowGuids;
            },
            enumerable: false,
            configurable: true
        });
        TimelineGroupModel.prototype.snapshot = function () {
            return {
                groupGuid: this._groupGuid,
                rollupGuid: this._rollupGuid,
                label: this._label,
                hidden: this._hidden,
                collapsed: (webglext.isNotEmpty(this._collapsed) ? this._collapsed : false),
                rowGuids: this._rowGuids.toArray()
            };
        };
        return TimelineGroupModel;
    }());
    webglext.TimelineGroupModel = TimelineGroupModel;
    var TimelineRootModel = /** @class */ (function () {
        function TimelineRootModel(root) {
            this._attrsChanged = new webglext.Notification();
            this.setAttrs(root);
            this._groupGuids = new webglext.OrderedStringSet(root.groupGuids);
            this._rowGuids = new webglext.OrderedStringSet();
            this._topPinnedRowGuids = new webglext.OrderedStringSet(root.topPinnedRowGuids || []);
            this._bottomPinnedRowGuids = new webglext.OrderedStringSet(root.bottomPinnedRowGuids || []);
            this._maximizedRowGuids = new webglext.OrderedStringSet(root.maximizedRowGuids || []);
        }
        Object.defineProperty(TimelineRootModel.prototype, "attrsChanged", {
            get: function () {
                return this._attrsChanged;
            },
            enumerable: false,
            configurable: true
        });
        TimelineRootModel.prototype.setAttrs = function (root) {
            // Don't both checking whether values are going to change -- it's not that important, and it would be obnoxious here
            // No attrs yet
            this._attrsChanged.fire();
        };
        Object.defineProperty(TimelineRootModel.prototype, "groupGuids", {
            get: function () {
                return this._groupGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRootModel.prototype, "rowGuids", {
            get: function () {
                return this._rowGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRootModel.prototype, "topPinnedRowGuids", {
            get: function () {
                return this._topPinnedRowGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRootModel.prototype, "bottomPinnedRowGuids", {
            get: function () {
                return this._bottomPinnedRowGuids;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineRootModel.prototype, "maximizedRowGuids", {
            get: function () {
                return this._maximizedRowGuids;
            },
            enumerable: false,
            configurable: true
        });
        TimelineRootModel.prototype.snapshot = function () {
            return {
                groupGuids: this._groupGuids.toArray(),
                rowGuids: this._rowGuids.toArray(),
                topPinnedRowGuids: this._topPinnedRowGuids.toArray(),
                bottomPinnedRowGuids: this._bottomPinnedRowGuids.toArray(),
                maximizedRowGuids: this._maximizedRowGuids.toArray()
            };
        };
        return TimelineRootModel;
    }());
    webglext.TimelineRootModel = TimelineRootModel;
    var TimelineModel = /** @class */ (function () {
        function TimelineModel(timeline) {
            var cursors = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.cursors) ? timeline.cursors : []);
            this._cursors = new webglext.OrderedSet([], function (g) { return g.cursorGuid; });
            for (var n = 0; n < cursors.length; n++) {
                this._cursors.add(new TimelineCursorModel(cursors[n]));
            }
            var annotations = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.annotations) ? timeline.annotations : []);
            this._annotations = new webglext.OrderedSet([], function (g) { return g.annotationGuid; });
            for (var n = 0; n < annotations.length; n++) {
                this._annotations.add(new TimelineAnnotationModel(annotations[n]));
            }
            var events = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.events) ? timeline.events : []);
            this._events = new webglext.OrderedSet([], function (e) { return e.eventGuid; });
            for (var n = 0; n < events.length; n++) {
                this._events.add(new TimelineEventModel(events[n]));
            }
            var rows = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.rows) ? timeline.rows : []);
            this._rows = new webglext.OrderedSet([], function (r) { return r.rowGuid; });
            for (var n = 0; n < rows.length; n++) {
                this._rows.add(new TimelineRowModel(rows[n]));
            }
            var groups = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.groups) ? timeline.groups : []);
            this._groups = new webglext.OrderedSet([], function (g) { return g.groupGuid; });
            for (var n = 0; n < groups.length; n++) {
                this._groups.add(new TimelineGroupModel(groups[n]));
            }
            var root = (webglext.isNotEmpty(timeline) && webglext.isNotEmpty(timeline.root) ? timeline.root : newEmptyTimelineRoot());
            this._root = new TimelineRootModel(root);
        }
        Object.defineProperty(TimelineModel.prototype, "cursors", {
            get: function () { return this._cursors; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineModel.prototype, "annotations", {
            get: function () { return this._annotations; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineModel.prototype, "events", {
            get: function () { return this._events; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineModel.prototype, "rows", {
            get: function () { return this._rows; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineModel.prototype, "groups", {
            get: function () { return this._groups; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TimelineModel.prototype, "root", {
            get: function () { return this._root; },
            enumerable: false,
            configurable: true
        });
        TimelineModel.prototype.cursor = function (cursorGuid) { return this._cursors.valueFor(cursorGuid); };
        TimelineModel.prototype.annotation = function (annotationGuid) { return this._annotations.valueFor(annotationGuid); };
        TimelineModel.prototype.event = function (eventGuid) { return this._events.valueFor(eventGuid); };
        TimelineModel.prototype.row = function (rowGuid) { return this._rows.valueFor(rowGuid); };
        TimelineModel.prototype.group = function (groupGuid) { return this._groups.valueFor(groupGuid); };
        TimelineModel.prototype.replace = function (newTimeline) {
            // Purge removed items
            //
            var freshRoot = newTimeline.root;
            this._root.groupGuids.retainValues(freshRoot.groupGuids);
            this._root.topPinnedRowGuids.retainValues(freshRoot.topPinnedRowGuids);
            this._root.bottomPinnedRowGuids.retainValues(freshRoot.bottomPinnedRowGuids);
            this._root.maximizedRowGuids.retainValues(freshRoot.maximizedRowGuids);
            var freshGroups = newTimeline.groups;
            var retainedGroupGuids = [];
            for (var n = 0; n < freshGroups.length; n++) {
                var freshGroup = freshGroups[n];
                var groupGuid = freshGroup.groupGuid;
                var oldGroup = this._groups.valueFor(groupGuid);
                if (webglext.isNotEmpty(oldGroup)) {
                    oldGroup.rowGuids.retainValues(freshGroup.rowGuids);
                    retainedGroupGuids.push(groupGuid);
                }
            }
            this._groups.retainIds(retainedGroupGuids);
            var freshRows = newTimeline.rows;
            var retainedRowGuids = [];
            for (var n = 0; n < freshRows.length; n++) {
                var freshRow = freshRows[n];
                var rowGuid = freshRow.rowGuid;
                var oldRow = this._rows.valueFor(rowGuid);
                if (webglext.isNotEmpty(oldRow)) {
                    oldRow.eventGuids.retainValues(freshRow.eventGuids || []);
                    retainedRowGuids.push(rowGuid);
                }
            }
            this._rows.retainIds(retainedRowGuids);
            var freshEvents = newTimeline.events;
            var retainedEventGuids = [];
            for (var n = 0; n < freshEvents.length; n++) {
                var freshEvent = freshEvents[n];
                var eventGuid = freshEvent.eventGuid;
                var oldEvent = this._events.valueFor(eventGuid);
                if (webglext.isNotEmpty(oldEvent)) {
                    retainedEventGuids.push(eventGuid);
                }
            }
            this._events.retainIds(retainedEventGuids);
            var freshAnnotations = newTimeline.annotations;
            var retainedAnnotationGuids = [];
            for (var n = 0; n < freshAnnotations.length; n++) {
                var freshAnnotation = freshAnnotations[n];
                var annotationGuid = freshAnnotation.annotationGuid;
                var oldAnnotation = this._annotations.valueFor(annotationGuid);
                if (webglext.isNotEmpty(oldAnnotation)) {
                    retainedAnnotationGuids.push(annotationGuid);
                }
            }
            this._annotations.retainIds(retainedAnnotationGuids);
            var freshCursors = newTimeline.cursors;
            var retainedCursorGuids = [];
            for (var n = 0; n < freshCursors.length; n++) {
                var freshCursor = freshCursors[n];
                var cursorGuid = freshCursor.cursorGuid;
                var oldCursor = this._cursors.valueFor(cursorGuid);
                if (webglext.isNotEmpty(oldCursor)) {
                    retainedCursorGuids.push(cursorGuid);
                }
            }
            this._cursors.retainIds(retainedCursorGuids);
            // Add new items
            //
            for (var n = 0; n < freshCursors.length; n++) {
                var freshCursor = freshCursors[n];
                var oldCursor = this._cursors.valueFor(freshCursor.cursorGuid);
                if (webglext.isNotEmpty(oldCursor)) {
                    oldCursor.setAttrs(freshCursor);
                }
                else {
                    this._cursors.add(new TimelineCursorModel(freshCursor));
                }
            }
            for (var n = 0; n < freshAnnotations.length; n++) {
                var freshAnnotation = freshAnnotations[n];
                var oldAnnotation = this._annotations.valueFor(freshAnnotation.annotationGuid);
                if (webglext.isNotEmpty(oldAnnotation)) {
                    oldAnnotation.setAttrs(freshAnnotation);
                }
                else {
                    this._annotations.add(new TimelineAnnotationModel(freshAnnotation));
                }
            }
            for (var n = 0; n < freshEvents.length; n++) {
                var freshEvent = freshEvents[n];
                var oldEvent = this._events.valueFor(freshEvent.eventGuid);
                if (webglext.isNotEmpty(oldEvent)) {
                    oldEvent.setAttrs(freshEvent);
                }
                else {
                    this._events.add(new TimelineEventModel(freshEvent));
                }
            }
            for (var n = 0; n < freshRows.length; n++) {
                var freshRow = freshRows[n];
                var oldRow = this._rows.valueFor(freshRow.rowGuid);
                if (webglext.isNotEmpty(oldRow)) {
                    oldRow.setAttrs(freshRow);
                    oldRow.eventGuids.addAll((freshRow.eventGuids || []), 0, true);
                }
                else {
                    this._rows.add(new TimelineRowModel(freshRow));
                }
            }
            for (var n = 0; n < freshGroups.length; n++) {
                var freshGroup = freshGroups[n];
                var oldGroup = this._groups.valueFor(freshGroup.groupGuid);
                if (webglext.isNotEmpty(oldGroup)) {
                    oldGroup.setAttrs(freshGroup);
                    oldGroup.rowGuids.addAll(freshGroup.rowGuids, 0, true);
                }
                else {
                    this._groups.add(new TimelineGroupModel(freshGroup));
                }
            }
            this._root.groupGuids.addAll(freshRoot.groupGuids, 0, true);
            this._root.topPinnedRowGuids.addAll(freshRoot.topPinnedRowGuids, 0, true);
            this._root.bottomPinnedRowGuids.addAll(freshRoot.bottomPinnedRowGuids, 0, true);
            this._root.maximizedRowGuids.addAll(freshRoot.maximizedRowGuids, 0, true);
        };
        TimelineModel.prototype.merge = function (newData, strategy) {
            var newEvents = webglext.isNotEmpty(newData.events) ? newData.events : [];
            for (var n = 0; n < newEvents.length; n++) {
                var newEvent = newEvents[n];
                var eventModel = this._events.valueFor(newEvent.eventGuid);
                if (webglext.isNotEmpty(eventModel)) {
                    strategy.updateEventModel(eventModel, newEvent);
                }
                else {
                    this._events.add(new TimelineEventModel(newEvent));
                }
            }
            var newRows = webglext.isNotEmpty(newData.rows) ? newData.rows : [];
            for (var n = 0; n < newRows.length; n++) {
                var newRow = newRows[n];
                var rowModel = this._rows.valueFor(newRow.rowGuid);
                if (webglext.isNotEmpty(rowModel)) {
                    strategy.updateRowModel(rowModel, newRow);
                }
                else {
                    this._rows.add(new TimelineRowModel(newRow));
                }
            }
            var newGroups = webglext.isNotEmpty(newData.groups) ? newData.groups : [];
            for (var n = 0; n < newGroups.length; n++) {
                var newGroup = newGroups[n];
                var groupModel = this._groups.valueFor(newGroup.groupGuid);
                if (webglext.isNotEmpty(groupModel)) {
                    strategy.updateGroupModel(groupModel, newGroup);
                }
                else {
                    this._groups.add(new TimelineGroupModel(newGroup));
                }
            }
            var newRoot = newData.root;
            strategy.
                updateRootModel(this._root, newRoot);
        };
        TimelineModel.prototype.snapshot = function () {
            return {
                cursors: this._cursors.map(function (e) { return e.snapshot(); }),
                annotations: this._annotations.map(function (e) { return e.snapshot(); }),
                events: this._events.map(function (e) { return e.snapshot(); }),
                rows: this._rows.map(function (r) { return r.snapshot(); }),
                groups: this._groups.map(function (g) { return g.snapshot(); }),
                root: this._root.snapshot()
            };
        };
        return TimelineModel;
    }());
    webglext.TimelineModel = TimelineModel;
    function newEmptyTimelineRoot() {
        return { groupGuids: [],
            rowGuids: [],
            bottomPinnedRowGuids: [],
            topPinnedRowGuids: [],
            maximizedRowGuids: [] };
    }
    webglext.newEmptyTimelineRoot = newEmptyTimelineRoot;
    webglext.timelineMergeNewBeforeOld = {
        updateCursorModel: function (cursorModel, newCursor) {
            cursorModel.setAttrs(newCursor);
        },
        updateAnnotationModel: function (annotationModel, newAnnotation) {
            annotationModel.setAttrs(newAnnotation);
        },
        updateEventModel: function (eventModel, newEvent) {
            eventModel.setAttrs(newEvent);
        },
        updateRowModel: function (rowModel, newRow) {
            rowModel.setAttrs(newRow);
            rowModel.eventGuids.addAll((newRow.eventGuids || []), 0, true);
        },
        updateGroupModel: function (groupModel, newGroup) {
            groupModel.setAttrs(newGroup);
            groupModel.rowGuids.addAll(newGroup.rowGuids, 0, true);
        },
        updateRootModel: function (rootModel, newRoot) {
            rootModel.setAttrs(newRoot);
            rootModel.groupGuids.addAll(newRoot.groupGuids, 0, true);
            rootModel.topPinnedRowGuids.addAll(newRoot.topPinnedRowGuids || [], 0, true);
            rootModel.bottomPinnedRowGuids.addAll(newRoot.bottomPinnedRowGuids || [], 0, true);
            rootModel.maximizedRowGuids.addAll(newRoot.maximizedRowGuids || [], 0, true);
        }
    };
    webglext.timelineMergeNewAfterOld = {
        updateCursorModel: function (cursorModel, newCursor) {
            cursorModel.setAttrs(newCursor);
        },
        updateAnnotationModel: function (annotationModel, newAnnotation) {
            annotationModel.setAttrs(newAnnotation);
        },
        updateEventModel: function (eventModel, newEvent) {
            eventModel.setAttrs(newEvent);
        },
        updateRowModel: function (rowModel, newRow) {
            rowModel.setAttrs(newRow);
            rowModel.eventGuids.addAll(newRow.eventGuids || []);
            rowModel.timeseriesGuids.addAll(newRow.timeseriesGuids || []);
            rowModel.annotationGuids.addAll(newRow.annotationGuids || []);
        },
        updateGroupModel: function (groupModel, newGroup) {
            groupModel.setAttrs(newGroup);
            groupModel.rowGuids.addAll(newGroup.rowGuids);
        },
        updateRootModel: function (rootModel, newRoot) {
            rootModel.setAttrs(newRoot);
            rootModel.groupGuids.addAll(newRoot.groupGuids);
            rootModel.topPinnedRowGuids.addAll(newRoot.topPinnedRowGuids || []);
            rootModel.bottomPinnedRowGuids.addAll(newRoot.bottomPinnedRowGuids || []);
            rootModel.maximizedRowGuids.addAll(newRoot.maximizedRowGuids || []);
        }
    };
})(webglext || (webglext = {}));
//# sourceMappingURL=timeline_model.js.map