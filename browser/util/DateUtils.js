/**
 * Provides utilities to transform hydrated and persisted data.
 */
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------
    /**
     * Normalizes date object hydrated from the database.
     */
    DateUtils.normalizeHydratedDate = function (mixedDate) {
        if (!mixedDate)
            return mixedDate;
        var date = typeof mixedDate === "string" ? new Date(mixedDate) : mixedDate;
        return date;
    };
    /**
     * Converts given value into date string in a "YYYY-MM-DD" format.
     */
    DateUtils.mixedDateToDateString = function (value) {
        if (value instanceof Date)
            return this.formatZerolessValue(value.getFullYear()) + "-" + this.formatZerolessValue(value.getMonth() + 1) + "-" + this.formatZerolessValue(value.getDate());
        return value;
    };
    /**
     * Converts given value into date object.
     */
    DateUtils.mixedDateToDate = function (mixedDate, toUtc, useMilliseconds) {
        if (toUtc === void 0) { toUtc = false; }
        if (useMilliseconds === void 0) { useMilliseconds = true; }
        var date = typeof mixedDate === "string" ? new Date(mixedDate) : mixedDate;
        if (toUtc)
            date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        if (!useMilliseconds)
            date.setUTCMilliseconds(0);
        return date;
    };
    /**
     * Converts given value into time string in a "HH:mm:ss" format.
     */
    DateUtils.mixedDateToTimeString = function (value, skipSeconds) {
        if (skipSeconds === void 0) { skipSeconds = false; }
        if (value instanceof Date)
            return this.formatZerolessValue(value.getHours()) +
                ":" + this.formatZerolessValue(value.getMinutes()) +
                (!skipSeconds ? ":" + this.formatZerolessValue(value.getSeconds()) : "");
        return value;
    };
    /**
     * Converts given value into time string in a "HH:mm:ss" format.
     */
    DateUtils.mixedTimeToDate = function (value) {
        if (typeof value === "string") {
            var _a = value.split(":"), hours = _a[0], minutes = _a[1], seconds = _a[2];
            var date = new Date();
            if (hours)
                date.setHours(parseInt(hours));
            if (minutes)
                date.setMinutes(parseInt(minutes));
            if (seconds)
                date.setSeconds(parseInt(seconds));
            return date;
        }
        return value;
    };
    /**
     * Converts given string value with "-" separator into a "HH:mm:ss" format.
     */
    DateUtils.mixedTimeToString = function (value, skipSeconds) {
        if (skipSeconds === void 0) { skipSeconds = false; }
        value = value instanceof Date ? (value.getHours() + ":" + value.getMinutes() + (!skipSeconds ? ":" + value.getSeconds() : "")) : value;
        if (typeof value === "string") {
            return value.split(":")
                .map(function (v) { return v.length === 1 ? "0" + v : v; }) // append zero at beginning if we have a first-zero-less number
                .join(":");
        }
        return value;
    };
    /**
     * Converts given value into datetime string in a "YYYY-MM-DD HH-mm-ss" format.
     */
    DateUtils.mixedDateToDatetimeString = function (value) {
        if (typeof value === "string") {
            value = new Date(value);
        }
        if (value instanceof Date) {
            return this.formatZerolessValue(value.getFullYear()) + "-" +
                this.formatZerolessValue(value.getMonth() + 1) + "-" +
                this.formatZerolessValue(value.getDate()) + " " +
                this.formatZerolessValue(value.getHours()) + ":" +
                this.formatZerolessValue(value.getMinutes()) + ":" +
                this.formatZerolessValue(value.getSeconds()) + "." +
                this.formatMilliseconds(value.getUTCMilliseconds());
        }
        return value;
    };
    /**
     * Converts given value into utc datetime string in a "YYYY-MM-DD HH-mm-ss" format.
     */
    DateUtils.mixedDateToUtcDatetimeString = function (value) {
        if (typeof value === "string") {
            value = new Date(value);
        }
        if (value instanceof Date) {
            return this.formatZerolessValue(value.getUTCFullYear()) + "-" +
                this.formatZerolessValue(value.getUTCMonth() + 1) + "-" +
                this.formatZerolessValue(value.getUTCDate()) + " " +
                this.formatZerolessValue(value.getUTCHours()) + ":" +
                this.formatZerolessValue(value.getUTCMinutes()) + ":" +
                this.formatZerolessValue(value.getUTCSeconds()) + "." +
                this.formatMilliseconds(value.getUTCMilliseconds());
        }
        return value;
    };
    /**
     * Converts each item in the given array to string joined by "," separator.
     */
    DateUtils.simpleArrayToString = function (value) {
        if (value instanceof Array) {
            return value
                .map(function (i) { return String(i); })
                .join(",");
        }
        return value;
    };
    /**
     * Converts given string to simple array split by "," separator.
     */
    DateUtils.stringToSimpleArray = function (value) {
        if (value instanceof String || typeof value === "string") {
            if (value.length > 0) {
                return value.split(",");
            }
            else {
                return [];
            }
        }
        return value;
    };
    DateUtils.simpleJsonToString = function (value) {
        return JSON.stringify(value);
    };
    DateUtils.stringToSimpleJson = function (value) {
        return JSON.parse(value);
    };
    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------
    /**
     * Formats given number to "0x" format, e.g. if it is 1 then it will return "01".
     */
    DateUtils.formatZerolessValue = function (value) {
        if (value < 10)
            return "0" + value;
        return String(value);
    };
    /**
     * Formats given number to "0x" format, e.g. if it is 1 then it will return "01".
     */
    DateUtils.formatMilliseconds = function (value) {
        if (value < 100)
            return "0" + value;
        return String(value);
    };
    return DateUtils;
}());
export { DateUtils };

//# sourceMappingURL=DateUtils.js.map
