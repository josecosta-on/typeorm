"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PlatformTools_1 = require("../platform/PlatformTools");
/**
 * Performs logging of the events in TypeORM.
 * This version of logger uses console to log events and use syntax highlighting.
 */
var AdvancedConsoleLogger = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function AdvancedConsoleLogger(options) {
        this.options = options;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Logs query and parameters used in it.
     */
    AdvancedConsoleLogger.prototype.logQuery = function (query, parameters, queryRunner) {
        if (this.options === "all" || this.options === true || (this.options instanceof Array && this.options.indexOf("query") !== -1)) {
            var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
            PlatformTools_1.PlatformTools.logInfo("executing query:", PlatformTools_1.PlatformTools.highlightSql(sql));
        }
    };
    /**
     * Logs query that is failed.
     */
    AdvancedConsoleLogger.prototype.logQueryError = function (error, query, parameters, queryRunner) {
        if (this.options === "all" || this.options === true || (this.options instanceof Array && this.options.indexOf("error") !== -1)) {
            var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
            PlatformTools_1.PlatformTools.logError("query failed:", PlatformTools_1.PlatformTools.highlightSql(sql));
            PlatformTools_1.PlatformTools.logError("error:", error);
        }
    };
    /**
     * Logs query that is slow.
     */
    AdvancedConsoleLogger.prototype.logQuerySlow = function (time, query, parameters, queryRunner) {
        var sql = query + (parameters && parameters.length ? " -- PARAMETERS: " + this.stringifyParams(parameters) : "");
        PlatformTools_1.PlatformTools.logWarn("query is slow:", PlatformTools_1.PlatformTools.highlightSql(sql));
        PlatformTools_1.PlatformTools.logWarn("execution time:", time);
    };
    /**
     * Logs events from the schema build process.
     */
    AdvancedConsoleLogger.prototype.logSchemaBuild = function (message, queryRunner) {
        if (this.options === "all" || (this.options instanceof Array && this.options.indexOf("schema") !== -1)) {
            PlatformTools_1.PlatformTools.log(message);
        }
    };
    /**
     * Logs events from the migration run process.
     */
    AdvancedConsoleLogger.prototype.logMigration = function (message, queryRunner) {
        PlatformTools_1.PlatformTools.log(message);
    };
    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     */
    AdvancedConsoleLogger.prototype.log = function (level, message, queryRunner) {
        switch (level) {
            case "log":
                if (this.options === "all" || (this.options instanceof Array && this.options.indexOf("log") !== -1))
                    console.log(message);
                break;
            case "info":
                if (this.options === "all" || (this.options instanceof Array && this.options.indexOf("info") !== -1))
                    console.info(message);
                break;
            case "warn":
                if (this.options === "all" || (this.options instanceof Array && this.options.indexOf("warn") !== -1))
                    console.warn(PlatformTools_1.PlatformTools.warn(message));
                break;
        }
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Converts parameters to a string.
     * Sometimes parameters can have circular objects and therefor we are handle this case too.
     */
    AdvancedConsoleLogger.prototype.stringifyParams = function (parameters) {
        try {
            return JSON.stringify(parameters);
        }
        catch (error) { // most probably circular objects in parameters
            return parameters;
        }
    };
    return AdvancedConsoleLogger;
}());
exports.AdvancedConsoleLogger = AdvancedConsoleLogger;

//# sourceMappingURL=AdvancedConsoleLogger.js.map
