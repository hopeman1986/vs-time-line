/*this is the module for time */

module webglext {


    export function secondsToMillis( value_SECONDS : number ) : number {
        return value_SECONDS * 1000;
    }

    export function millisToSeconds( value_MILLIS : number ) : number {
        return value_MILLIS / 1000;
    }

    export function minutesToMillis( value_MINUTES : number ) : number {
        return value_MINUTES * 60000;
    }

    export function millisToMinutes( value_MILLIS : number ) : number {
        return value_MILLIS / 60000;
    }

    export function hoursToMillis( value_HOURS : number ) : number {
        return value_HOURS * 3600000;
    }

    export function millisToHours( value_MILLIS : number ) : number {
        return value_MILLIS / 3600000;
    }

    export function daysToMillis( value_DAYS : number ) : number {
        return value_DAYS * 86400000;
    }

    export function millisToDays( value_MILLIS : number ) : number {
        return value_MILLIS / 86400000;
    }


}