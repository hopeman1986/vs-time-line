var webglext;
(function (webglext) {
    // Alias for more readable access to static constants
    webglext.GL = WebGLRenderingContext;
    function isNotEmpty(value) {
        // Double-equals is weird: ( undefined == null ) is true
        return (value != null);
    }
    webglext.isNotEmpty = isNotEmpty;
    function isNumber(value) {
        return typeof (value) === 'number';
    }
    webglext.isNumber = isNumber;
    function isString(value) {
        return typeof (value) === 'string';
    }
    webglext.isString = isString;
    function isEmpty(array) {
        return (array.length === 0);
    }
    webglext.isEmpty = isEmpty;
    function notEmpty(array) {
        return (array.length > 0);
    }
    webglext.notEmpty = notEmpty;
    function alwaysTrue() {
        return true;
    }
    webglext.alwaysTrue = alwaysTrue;
    function alwaysFalse() {
        return false;
    }
    webglext.alwaysFalse = alwaysFalse;
    function constantFn(value) {
        return function () {
            return value;
        };
    }
    webglext.constantFn = constantFn;
    function log10(x) {
        return Math.log(x) * (1.0 / Math.LN10);
    }
    webglext.log10 = log10;
    function order(x) {
        return Math.floor(log10(x) + 1e-12);
    }
    webglext.order = order;
    function clamp(xMin, xMax, x) {
        return Math.max(xMin, Math.min(xMax, x));
    }
    webglext.clamp = clamp;
    function copyArray(values) {
        return values.slice(0);
    }
    webglext.copyArray = copyArray;
    function ensureCapacityFloat32(buffer, minNewCapacity) {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if (!minNewCapacity || buffer.length >= minNewCapacity) {
            return buffer;
        }
        else {
            var newCapacity = Math.max(minNewCapacity, 2 * buffer.length);
            return new Float32Array(newCapacity);
        }
    }
    webglext.ensureCapacityFloat32 = ensureCapacityFloat32;
    function ensureCapacityUint32(buffer, minNewCapacity) {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if (!minNewCapacity || buffer.length >= minNewCapacity) {
            return buffer;
        }
        else {
            var newCapacity = Math.max(minNewCapacity, 2 * buffer.length);
            return new Uint32Array(newCapacity);
        }
    }
    webglext.ensureCapacityUint32 = ensureCapacityUint32;
    function ensureCapacityUint16(buffer, minNewCapacity) {
        // if minNewCapacity is NaN, null, or undefined, don't try to resize the buffer
        if (!minNewCapacity || buffer.length >= minNewCapacity) {
            return buffer;
        }
        else {
            var newCapacity = Math.max(minNewCapacity, 2 * buffer.length);
            return new Uint16Array(newCapacity);
        }
    }
    webglext.ensureCapacityUint16 = ensureCapacityUint16;
    webglext.getObjectId = (function () {
        var keyName = 'webglext_ObjectId';
        var nextValue = 0;
        return function (obj) {
            var value = obj[keyName];
            if (!isNotEmpty(value)) {
                value = (nextValue++).toString();
                obj[keyName] = value;
            }
            return value;
        };
    })();
    function concatLines() {
        var lines = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            lines[_i] = arguments[_i];
        }
        return lines.join('\n');
    }
    webglext.concatLines = concatLines;
    /**
     * Parses a timestamp from the format 'HH:mm:ss[.SSS]ZZ' into posix-milliseconds.
     *
     * Format examples:
     *   - '2014-01-01T00:00:00Z'
     *   - '2014-01-01T00:00:00.000+00:00'
     *
     * Use of a colon in numeric timezones is optional. However, it is strongly encouraged, for
     * compatibility with Date in major browsers.
     *
     * Parsing is strict, and will throw an error if the input string does not match the expected
     * format. A notable example is that the seconds field must not have more than three decimal
     * places.
     *
     */
    function parseTime_PMILLIS(time_ISO8601) {
        // Moment's lenient parsing is way too lenient -- but its strict parsing is a little too
        // strict, so we have to try several possible formats.
        //
        // We could pass in multiple formats to try all at once, but Moment's docs warn that that
        // can be slow. Plus, we expect some formats to be more common than others, so we can make
        // the common formats fast at the expense of the less common ones.
        //
        var m = moment(time_ISO8601, 'HH:mm:ssZZ', true);
        if (m.isValid())
            return m.valueOf();
        var m = moment(time_ISO8601, 'HH:mm:ss.SSSZZ', true);
        if (m.isValid())
            return m.valueOf();
        var m = moment(time_ISO8601, 'HH:mm:ss.SSZZ', true);
        if (m.isValid())
            return m.valueOf();
        var m = moment(time_ISO8601, 'HH:mm:ss.SZZ', true);
        if (m.isValid())
            return m.valueOf();
        throw new Error('Failed to parse time-string: \'' + time_ISO8601 + '\'');
    }
    webglext.parseTime_PMILLIS = parseTime_PMILLIS;
    /**
     * Formats a timestamp from posix-millis into the format 'hh:mm:ss.SSSZZ' (for
     * example '2014-01-01T00:00:00.000Z').
     *
     * The input value is effectively truncated (not rounded!) to milliseconds. So for example,
     * formatTime_ISO8601(12345.999) will return '1970-01-01T00:00:12.345Z' -- exactly the same
     * as for an input of 12345.
     *
     */
    function formatTime_ISO8601(time_PMILLIS) {
        return moment(time_PMILLIS).toISOString();
    }
    webglext.formatTime_ISO8601 = formatTime_ISO8601;
})(webglext || (webglext = {}));
//# sourceMappingURL=util.js.map