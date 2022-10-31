var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var webglext;
(function (webglext) {
    function newTimeAxisPainter(timeAxis, labelSide, displayTimeZone, tickTimeZone, options) {
        var tickSpacing = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickSpacing) ? options.tickSpacing : 60);
        var font = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.font) ? options.font : '11px sans-serif');
        var textColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.textColor) ? options.textColor : webglext.black);
        var tickColor = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickColor) ? options.tickColor : webglext.black);
        var tickSize = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.tickSize) ? options.tickSize : 6);
        var labelAlign = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.labelAlign) ? options.labelAlign : 0.5);
        var referenceDate_PMILLIS = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.referenceDate) ? webglext.parseTime_PMILLIS(options.referenceDate) : undefined);
        var isFuturePositive = (webglext.isNotEmpty(options) && webglext.isNotEmpty(options.isFuturePositive) ? options.isFuturePositive : true);
        var marksProgram = new webglext.Program(webglext.edgeMarks_VERTSHADER(labelSide), webglext.solid_FRAGSHADER);
        var marksProgram_u_VMin = new webglext.Uniform1f(marksProgram, 'u_VMin');
        var marksProgram_u_VSize = new webglext.Uniform1f(marksProgram, 'u_VSize');
        var marksProgram_u_ViewportSize = new webglext.Uniform2f(marksProgram, 'u_ViewportSize');
        var marksProgram_u_MarkSize = new webglext.Uniform1f(marksProgram, 'u_MarkSize');
        var marksProgram_u_Color = new webglext.UniformColor(marksProgram, 'u_Color');
        var marksProgram_a_VCoord = new webglext.Attribute(marksProgram, 'a_VCoord');
        var markCoords = new Float32Array(0);
        var markCoordsBuffer = webglext.newDynamicBuffer();
        var textTextures = webglext.newTextTextureCache(font, textColor);
        var textureRenderer = new webglext.TextureRenderer();
        var hTickLabels = textTextures.value('-0123456789:.').h;
        var isVerticalAxis = (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.RIGHT);
        return function (gl, viewport) {
            var sizePixels = isVerticalAxis ? viewport.h : viewport.w;
            if (sizePixels === 0)
                return;
            var tickTimes_PMILLIS = getTickTimes_PMILLIS(timeAxis, sizePixels, tickSpacing, tickTimeZone, referenceDate_PMILLIS);
            var tickInterval_MILLIS = getTickInterval_MILLIS(tickTimes_PMILLIS);
            var tickCount = tickTimes_PMILLIS.length;
            // Tick marks
            //
            marksProgram.use(gl);
            marksProgram_u_VMin.setData(gl, timeAxis.vMin);
            marksProgram_u_VSize.setData(gl, timeAxis.vSize);
            marksProgram_u_ViewportSize.setData(gl, viewport.w, viewport.h);
            marksProgram_u_MarkSize.setData(gl, tickSize);
            marksProgram_u_Color.setData(gl, tickColor);
            markCoords = webglext.ensureCapacityFloat32(markCoords, 4 * tickCount);
            for (var n = 0; n < tickCount; n++) {
                var v = timeAxis.vAtTime(tickTimes_PMILLIS[n]);
                markCoords[(4 * n + 0)] = v;
                markCoords[(4 * n + 1)] = 0;
                markCoords[(4 * n + 2)] = v;
                markCoords[(4 * n + 3)] = 1;
            }
            markCoordsBuffer.setData(markCoords.subarray(0, 4 * tickCount));
            marksProgram_a_VCoord.setDataAndEnable(gl, markCoordsBuffer, 2, webglext.GL.FLOAT);
            // IE does not support lineWidths other than 1, so make sure all browsers use lineWidth of 1
            gl.lineWidth(1);
            gl.drawArrays(webglext.GL.LINES, 0, 2 * tickCount);
            marksProgram_a_VCoord.disable(gl);
            marksProgram.endUse(gl);
            gl.blendFuncSeparate(webglext.GL.SRC_ALPHA, webglext.GL.ONE_MINUS_SRC_ALPHA, webglext.GL.ONE, webglext.GL.ONE_MINUS_SRC_ALPHA);
            gl.enable(webglext.GL.BLEND);
            // Tick labels
            //
            var ticks = getTickDisplayData(tickInterval_MILLIS, referenceDate_PMILLIS, displayTimeZone, isFuturePositive);
            textTextures.resetTouches();
            textureRenderer.begin(gl, viewport);
            for (var n = 0; n < tickCount; n++) {
                var tickTime_PMILLIS = tickTimes_PMILLIS[n];
                var tFrac = timeAxis.tFrac(tickTime_PMILLIS);
                if (tFrac < 0 || tFrac >= 1)
                    continue;
                var tickLabel = ticks.tickFormat(tickTime_PMILLIS);
                var textTexture = textTextures.value(tickLabel);
                var xFrac;
                var yFrac;
                if (labelSide === webglext.Side.LEFT || labelSide === webglext.Side.RIGHT) {
                    var yAnchor = textTexture.yAnchor(0.43);
                    var j0 = (tFrac * viewport.h) - yAnchor * textTexture.h;
                    var j = webglext.clamp(0, viewport.h - textTexture.h, j0);
                    yFrac = j / viewport.h;
                    if (labelSide === webglext.Side.LEFT) {
                        xFrac = (viewport.w - tickSize - 2 - textTexture.w) / viewport.w;
                    }
                    else {
                        xFrac = (tickSize + 2) / viewport.w;
                    }
                }
                else {
                    var xAnchor = 0.45;
                    var i0 = (tFrac * viewport.w) - xAnchor * (textTexture.w);
                    var i = webglext.clamp(0, viewport.w - textTexture.w, i0);
                    xFrac = i / viewport.w;
                    if (labelSide === webglext.Side.BOTTOM) {
                        yFrac = (viewport.h - tickSize - 2 - hTickLabels) / viewport.h;
                    }
                    else {
                        yFrac = (tickSize + 2) / viewport.h;
                    }
                }
                textureRenderer.draw(gl, textTexture, xFrac, yFrac, { xAnchor: 0, yAnchor: 0 });
            }
            textureRenderer.end(gl);
            textTextures.retainTouched();
        };
    }
    webglext.newTimeAxisPainter = newTimeAxisPainter;
    function getTickDisplayData(tickInterval_MILLIS, referenceDate_PMILLIS, displayTimeZone, isFuturePositive) {
        if (webglext.isNotEmpty(referenceDate_PMILLIS)) {
            return getTickDisplayDataRelative(tickInterval_MILLIS, referenceDate_PMILLIS, isFuturePositive);
        }
        else {
            return getTickDisplayDataAbsolute(tickInterval_MILLIS, displayTimeZone);
        }
    }
    function getTickDisplayDataRelative(tickInterval_MILLIS, referenceDate_PMILLIS, isFuturePositive) {
        if (tickInterval_MILLIS <= webglext.minutesToMillis(1)) {
            var tickFormat = function (tickTime_PMILLIS) {
                var elapsedTime_MILLIS = Math.abs(tickTime_PMILLIS - referenceDate_PMILLIS);
                var elapsedTime_DAYS = webglext.millisToDays(elapsedTime_MILLIS);
                var elapsedTime_DAYS_WHOLE = Math.floor(elapsedTime_DAYS);
                var elapsedTime_HOURS = (elapsedTime_DAYS - elapsedTime_DAYS_WHOLE) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor(elapsedTime_HOURS);
                var elapsedTime_MIN = (elapsedTime_HOURS - elapsedTime_HOURS_WHOLE) * 60;
                var elapsedTime_MIN_WHOLE = Math.floor(elapsedTime_MIN);
                var elapsedTime_SEC = (elapsedTime_MIN - elapsedTime_MIN_WHOLE) * 60;
                // use round() here instead of floor() because we always expect ticks to be on even second
                // boundaries but rounding error will cause us to be somewhat unpredictably above or below
                // the nearest even second boundary
                var elapsedTime_SEC_WHOLE = Math.round(elapsedTime_SEC);
                // however the above fails when we round up to a whole minute, so special case that
                if (elapsedTime_SEC_WHOLE >= 60) {
                    elapsedTime_SEC_WHOLE -= 60;
                    elapsedTime_MIN_WHOLE += 1;
                }
                if (elapsedTime_MIN_WHOLE >= 60) {
                    elapsedTime_MIN_WHOLE = 0;
                }
                var min = elapsedTime_MIN_WHOLE < 10 ? '0' + elapsedTime_MIN_WHOLE : '' + elapsedTime_MIN_WHOLE;
                var sec = elapsedTime_SEC_WHOLE < 10 ? '0' + elapsedTime_SEC_WHOLE : '' + elapsedTime_SEC_WHOLE;
                return min + ':' + sec;
            };
            var prefixFormat = function (timeStruct) {
                var center_PMILLIS = (timeStruct.end_PMILLIS - timeStruct.start_PMILLIS) / 2 + timeStruct.start_PMILLIS;
                var elapsedTime_MILLIS = center_PMILLIS - referenceDate_PMILLIS;
                var negative = (elapsedTime_MILLIS < 0);
                var signString = (negative && isFuturePositive) || (!negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS = Math.abs(elapsedTime_MILLIS);
                var elapsedTime_DAYS = webglext.millisToDays(elapsedTime_MILLIS);
                var elapsedTime_DAYS_WHOLE = Math.floor(elapsedTime_DAYS);
                var elapsedTime_HOURS = (elapsedTime_DAYS - elapsedTime_DAYS_WHOLE) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor(elapsedTime_HOURS);
                return 'Day ' + signString + elapsedTime_DAYS_WHOLE + ' Hour ' + signString + elapsedTime_HOURS_WHOLE;
            };
            var timeStructFactory = function () { return new TimeStruct(); };
        }
        else if (tickInterval_MILLIS <= webglext.hoursToMillis(12)) {
            var tickFormat = function (tickTime_PMILLIS) {
                var elapsedTime_MILLIS = Math.abs(tickTime_PMILLIS - referenceDate_PMILLIS);
                var elapsedTime_DAYS = webglext.millisToDays(elapsedTime_MILLIS);
                var elapsedTime_DAYS_WHOLE = Math.floor(elapsedTime_DAYS);
                var elapsedTime_HOURS = (elapsedTime_DAYS - elapsedTime_DAYS_WHOLE) * 24;
                var elapsedTime_HOURS_WHOLE = Math.floor(elapsedTime_HOURS);
                var elapsedTime_MIN = (elapsedTime_HOURS - elapsedTime_HOURS_WHOLE) * 60;
                // use round() here instead of floor() because we always expect ticks to be on even minute
                // boundaries but rounding error will cause us to be somewhat unpredictably above or below
                // the nearest even minute boundary
                var elapsedTime_MIN_WHOLE = Math.round(elapsedTime_MIN);
                // however the above fails when we round up to a whole hour, so special case that
                if (elapsedTime_MIN_WHOLE >= 60) {
                    elapsedTime_MIN_WHOLE -= 60;
                    elapsedTime_HOURS_WHOLE += 1;
                }
                if (elapsedTime_HOURS_WHOLE >= 24) {
                    elapsedTime_HOURS_WHOLE = 0;
                }
                var hour = elapsedTime_HOURS_WHOLE < 10 ? '0' + elapsedTime_HOURS_WHOLE : '' + elapsedTime_HOURS_WHOLE;
                var min = elapsedTime_MIN_WHOLE < 10 ? '0' + elapsedTime_MIN_WHOLE : '' + elapsedTime_MIN_WHOLE;
                return hour + ':' + min;
            };
            var prefixFormat = function (timeStruct) {
                var center_PMILLIS = (timeStruct.end_PMILLIS - timeStruct.start_PMILLIS) / 2 + timeStruct.start_PMILLIS;
                var elapsedTime_MILLIS = center_PMILLIS - referenceDate_PMILLIS;
                var negative = (elapsedTime_MILLIS < 0);
                var signString = (negative && isFuturePositive) || (!negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS = Math.abs(elapsedTime_MILLIS);
                var elapsedTime_DAYS = Math.floor(webglext.millisToDays(elapsedTime_MILLIS));
                return 'Day ' + signString + elapsedTime_DAYS;
            };
            var timeStructFactory = function () { return new TimeStruct(); };
        }
        else {
            var tickFormat = function (tickTime_PMILLIS) {
                var elapsedTime_MILLIS = tickTime_PMILLIS - referenceDate_PMILLIS;
                var negative = (elapsedTime_MILLIS < 0);
                var signString = (negative && isFuturePositive) || (!negative && !isFuturePositive) ? "-" : "";
                elapsedTime_MILLIS = Math.abs(elapsedTime_MILLIS);
                var elapsedTime_DAYS = Math.floor(webglext.millisToDays(elapsedTime_MILLIS));
                return elapsedTime_DAYS === 0 ? '' + elapsedTime_DAYS : signString + elapsedTime_DAYS;
            };
        }
        return { prefixFormat: prefixFormat, tickFormat: tickFormat, timeStructFactory: timeStructFactory };
    }
    function getTickDisplayDataAbsolute(tickInterval_MILLIS, displayTimeZone) {
        var defaultTickFormat = function (format) { return function (tickTime_PMILLIS) { return moment(tickTime_PMILLIS).zone(displayTimeZone).format(format); }; };
        var defaultPrefixFormat = function (format) { return function (timeStruct) { return moment(timeStruct.textCenter_PMILLIS).zone(displayTimeZone).format(format); }; };
        if (tickInterval_MILLIS <= webglext.hoursToMillis(1)) {
            var tickFormat = defaultTickFormat('mm:ss');
            var prefixFormat = defaultPrefixFormat('mm:ss');
            var timeStructFactory = function () { return new HourStruct(); };
        }
        else if (tickInterval_MILLIS < webglext.daysToMillis(1)) {
            var tickFormat = defaultTickFormat('HH:mm');
            var prefixFormat = defaultPrefixFormat('HH:mm:ss');
            var timeStructFactory = function () { return new DayStruct(); };
        }
        else {
            var tickFormat = defaultTickFormat('HH:mm:ss');
        }
        return { prefixFormat: prefixFormat, tickFormat: tickFormat, timeStructFactory: timeStructFactory };
    }
    var TimeStruct = /** @class */ (function () {
        function TimeStruct() {
        }
        TimeStruct.prototype.setTime = function (time_PMILLIS, timeZone) {
            return moment(time_PMILLIS).zone(timeZone);
        };
        TimeStruct.prototype.incrementTime = function (m) {
        };
        return TimeStruct;
    }());
    var YearStruct = /** @class */ (function (_super) {
        __extends(YearStruct, _super);
        function YearStruct() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        YearStruct.prototype.setTime = function (time_PMILLIS, timeZone) {
            var m = moment(time_PMILLIS).zone(timeZone);
            m.month(0);
            m.date(0);
            m.hours(0);
            m.minutes(0);
            m.seconds(0);
            return m;
        };
        YearStruct.prototype.incrementTime = function (m) {
            m.add('years', 1);
        };
        return YearStruct;
    }(TimeStruct));
    var MonthStruct = /** @class */ (function (_super) {
        __extends(MonthStruct, _super);
        function MonthStruct() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MonthStruct.prototype.setTime = function (time_PMILLIS, timeZone) {
            var m = moment(time_PMILLIS).zone(timeZone);
            m.date(0);
            m.hours(0);
            m.minutes(0);
            m.seconds(0);
            return m;
        };
        MonthStruct.prototype.incrementTime = function (m) {
            m.add('months', 1);
        };
        return MonthStruct;
    }(TimeStruct));
    var DayStruct = /** @class */ (function (_super) {
        __extends(DayStruct, _super);
        function DayStruct() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DayStruct.prototype.setTime = function (time_PMILLIS, timeZone) {
            var m = moment(time_PMILLIS).zone(timeZone);
            m.hours(0);
            m.minutes(0);
            m.seconds(0);
            return m;
        };
        DayStruct.prototype.incrementTime = function (m) {
            m.add('days', 1);
        };
        return DayStruct;
    }(TimeStruct));
    var HourStruct = /** @class */ (function (_super) {
        __extends(HourStruct, _super);
        function HourStruct() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HourStruct.prototype.setTime = function (time_PMILLIS, timeZone) {
            var m = moment(time_PMILLIS).zone(timeZone);
            m.minutes(0);
            m.seconds(0);
            return m;
        };
        HourStruct.prototype.incrementTime = function (m) {
            m.add('hours', 1);
        };
        return HourStruct;
    }(TimeStruct));
    function getTickTimes_PMILLIS(timeAxis, sizePixels, tickSpacing, timeZone, referenceDate_PMILLIS) {
        if (webglext.isNotEmpty(referenceDate_PMILLIS)) {
            return getTickTimesRelative_PMILLIS(timeAxis, sizePixels, tickSpacing, referenceDate_PMILLIS);
        }
        else {
            return getTickTimesAbsolute_PMILLIS(timeAxis, sizePixels, tickSpacing, timeZone);
        }
    }
    webglext.getTickTimes_PMILLIS = getTickTimes_PMILLIS;
    function getTickTimesRelative_PMILLIS(timeAxis, sizePixels, tickSpacing, referenceDate_PMILLIS) {
        var dMin_PMILLIS = timeAxis.tMin_PMILLIS;
        var dMax_PMILLIS = timeAxis.tMax_PMILLIS;
        var approxTickInterval_MILLIS = tickSpacing * (dMax_PMILLIS - dMin_PMILLIS) / sizePixels;
        if (approxTickInterval_MILLIS < webglext.daysToMillis(1)) {
            return getHourTickTimesRelative_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, referenceDate_PMILLIS);
        }
        else {
            return getDayTickTimesRelative_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, sizePixels, tickSpacing, referenceDate_PMILLIS);
        }
    }
    function getHourTickTimesRelative_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, referenceDate_PMILLIS) {
        var tickTimes = getHourTickTimes_PMILLIS(dMin_PMILLIS - referenceDate_PMILLIS, dMax_PMILLIS - referenceDate_PMILLIS, approxTickInterval_MILLIS, 0);
        for (var n = 0; n < tickTimes.length; n++) {
            tickTimes[n] = tickTimes[n] + referenceDate_PMILLIS;
        }
        return tickTimes;
    }
    function getDayTickTimesRelative_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, sizePixels, tickSpacing, referenceDate_PMILLIS) {
        var axis = new webglext.Axis1D(webglext.millisToDays(dMin_PMILLIS - referenceDate_PMILLIS), webglext.millisToDays(dMax_PMILLIS - referenceDate_PMILLIS));
        var approxNumTicks = sizePixels / tickSpacing;
        var tickInterval = webglext.getTickInterval(axis, approxNumTicks);
        var tickCount = webglext.getTickCount(axis, tickInterval);
        var tickPositions = new Float32Array(tickCount);
        webglext.getTickPositions(axis, tickInterval, tickCount, tickPositions);
        var tickTimes_PMILLIS = [];
        for (var n = 0; n < tickCount; n++) {
            tickTimes_PMILLIS.push(webglext.daysToMillis(tickPositions[n]) + referenceDate_PMILLIS);
        }
        return tickTimes_PMILLIS;
    }
    function getTickTimesAbsolute_PMILLIS(timeAxis, sizePixels, tickSpacing, timeZone) {
        var dMin_PMILLIS = timeAxis.tMin_PMILLIS;
        var dMax_PMILLIS = timeAxis.tMax_PMILLIS;
        // NOTE: moment.js reports time zone offset reversed from Java Calendar, thus the negative sign
        var mMin = moment(dMin_PMILLIS).zone(timeZone);
        var zoneOffset_MILLIS = -webglext.minutesToMillis(mMin.zone());
        var approxTickInterval_MILLIS = tickSpacing * (dMax_PMILLIS - dMin_PMILLIS) / sizePixels;
        if (approxTickInterval_MILLIS > webglext.daysToMillis(60)) {
            return getYearTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone);
        }
        else if (approxTickInterval_MILLIS > webglext.daysToMillis(10)) {
            return getMonthTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone);
        }
        else if (approxTickInterval_MILLIS > webglext.daysToMillis(1)) {
            return getDayTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone);
        }
        else {
            return getHourTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, zoneOffset_MILLIS);
        }
    }
    function getYearTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone) {
        var m = moment(dMin_PMILLIS).zone(timeZone);
        var currentYear = m.year();
        var daysPerYear = 365.25; // assume 365.25 days in every year as a heuristic
        var approxTickInterval_YEARS = webglext.millisToDays(approxTickInterval_MILLIS) / daysPerYear;
        var yearOrderFactor = 6.0;
        var stepYears = getYearStep(approxTickInterval_YEARS * yearOrderFactor);
        var startYear = getRoundedYear(currentYear, stepYears);
        m.year(startYear).month(0).date(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        var tickTimes_PMILLIS = [];
        while (m.valueOf() <= dMax_PMILLIS) {
            tickTimes_PMILLIS.push(m.valueOf());
            m.add('years', stepYears);
        }
        return tickTimes_PMILLIS;
    }
    function getYearStep(spanYears) {
        var log10 = Math.log(spanYears) / Math.LN10;
        var order = Math.floor(log10);
        if ((log10 - order) > (1.0 - 1e-12))
            order++;
        return Math.max(1, Math.pow(10, order));
    }
    function getRoundedYear(currentYear, yearStep) {
        var numSteps = Math.floor(currentYear / yearStep);
        return numSteps * yearStep;
    }
    function getMonthTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone) {
        var m = moment(dMin_PMILLIS).zone(timeZone).date(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        var tickTimes_PMILLIS = [];
        while (m.valueOf() <= dMax_PMILLIS) {
            tickTimes_PMILLIS.push(m.valueOf());
            m.add('months', 1);
        }
        return tickTimes_PMILLIS;
    }
    function getDayTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, timeZone) {
        var tickInterval_DAYS = calculateTickInterval_DAYS(approxTickInterval_MILLIS);
        // initialize calendar off start time and reset fields less than month
        var m = moment(dMin_PMILLIS).zone(timeZone).date(1).hours(0).minutes(0).seconds(0).milliseconds(0);
        var endTime_PMILLIS = dMax_PMILLIS + webglext.daysToMillis(tickInterval_DAYS);
        var currentMonth = m.month();
        var tickTimes_PMILLIS = [];
        while (m.valueOf() <= endTime_PMILLIS) {
            // ensure ticks always fall on the first day of the month
            var newMonth = m.month();
            if (newMonth !== currentMonth) {
                m.date(1);
                currentMonth = newMonth;
            }
            // prevent display of ticks too close to the end of the month
            var maxDom = m.clone().endOf('month').date();
            var dom = m.date();
            if (maxDom - dom + 1 >= tickInterval_DAYS / 2) {
                tickTimes_PMILLIS.push(m.valueOf());
            }
            m.add('days', tickInterval_DAYS);
        }
        return tickTimes_PMILLIS;
    }
    function getHourTickTimes_PMILLIS(dMin_PMILLIS, dMax_PMILLIS, approxTickInterval_MILLIS, zoneOffset_MILLIS) {
        var tickInterval_MILLIS = calculateTickInterval_MILLIS(approxTickInterval_MILLIS);
        var ticksSince1970 = Math.floor((dMin_PMILLIS + zoneOffset_MILLIS) / tickInterval_MILLIS);
        var firstTick_PMILLIS = (ticksSince1970 * tickInterval_MILLIS) - zoneOffset_MILLIS;
        var numTicks = Math.ceil(1 + (dMax_PMILLIS - firstTick_PMILLIS) / tickInterval_MILLIS);
        var tickTimes_PMILLIS = [];
        for (var n = 0; n < numTicks; n++) {
            tickTimes_PMILLIS.push(firstTick_PMILLIS + n * tickInterval_MILLIS);
        }
        return tickTimes_PMILLIS;
    }
    var tickIntervalRungs_DAYS = [2, 3, 4, 5, 8, 10];
    function calculateTickInterval_DAYS(approxTickInterval_MILLIS) {
        var approxTickInterval_DAYS = webglext.millisToDays(approxTickInterval_MILLIS);
        for (var n = 0; n < tickIntervalRungs_DAYS.length; n++) {
            if (approxTickInterval_DAYS <= tickIntervalRungs_DAYS[n]) {
                return tickIntervalRungs_DAYS[n];
            }
        }
        return 10;
    }
    var tickIntervalRungs_MILLIS = [webglext.secondsToMillis(1),
        webglext.secondsToMillis(2),
        webglext.secondsToMillis(5),
        webglext.secondsToMillis(10),
        webglext.secondsToMillis(15),
        webglext.secondsToMillis(20),
        webglext.secondsToMillis(30),
        webglext.minutesToMillis(1),
        webglext.minutesToMillis(2),
        webglext.minutesToMillis(5),
        webglext.minutesToMillis(10),
        webglext.minutesToMillis(15),
        webglext.minutesToMillis(20),
        webglext.minutesToMillis(30),
        webglext.hoursToMillis(1),
        webglext.hoursToMillis(2),
        webglext.hoursToMillis(3),
        webglext.hoursToMillis(6),
        webglext.hoursToMillis(12),
        webglext.daysToMillis(1)];
    function calculateTickInterval_MILLIS(approxTickInterval_MILLIS) {
        for (var n = 0; n < tickIntervalRungs_MILLIS.length; n++) {
            if (approxTickInterval_MILLIS <= tickIntervalRungs_MILLIS[n]) {
                return tickIntervalRungs_MILLIS[n];
            }
        }
        return webglext.daysToMillis(1);
    }
    function getTickInterval_MILLIS(tickTimes_PMILLIS) {
        if (webglext.isNotEmpty(tickTimes_PMILLIS) && tickTimes_PMILLIS.length > 1) {
            return (tickTimes_PMILLIS[1] - tickTimes_PMILLIS[0]);
        }
        else {
            return webglext.secondsToMillis(1);
        }
    }
})(webglext || (webglext = {}));
//# sourceMappingURL=time_axis_painter.js.map