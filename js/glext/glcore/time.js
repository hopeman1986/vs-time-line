/*this is the module for time */
var webglext;
(function (webglext) {
    function secondsToMillis(value_SECONDS) {
        return value_SECONDS * 1000;
    }
    webglext.secondsToMillis = secondsToMillis;
    function millisToSeconds(value_MILLIS) {
        return value_MILLIS / 1000;
    }
    webglext.millisToSeconds = millisToSeconds;
    function minutesToMillis(value_MINUTES) {
        return value_MINUTES * 60000;
    }
    webglext.minutesToMillis = minutesToMillis;
    function millisToMinutes(value_MILLIS) {
        return value_MILLIS / 60000;
    }
    webglext.millisToMinutes = millisToMinutes;
    function hoursToMillis(value_HOURS) {
        return value_HOURS * 3600000;
    }
    webglext.hoursToMillis = hoursToMillis;
    function millisToHours(value_MILLIS) {
        return value_MILLIS / 3600000;
    }
    webglext.millisToHours = millisToHours;
    function daysToMillis(value_DAYS) {
        return value_DAYS * 86400000;
    }
    webglext.daysToMillis = daysToMillis;
    function millisToDays(value_MILLIS) {
        return value_MILLIS / 86400000;
    }
    webglext.millisToDays = millisToDays;
})(webglext || (webglext = {}));
//# sourceMappingURL=time.js.map