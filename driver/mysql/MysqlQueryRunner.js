"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var TransactionAlreadyStartedError_1 = require("../../error/TransactionAlreadyStartedError");
var TransactionNotStartedError_1 = require("../../error/TransactionNotStartedError");
var TableColumn_1 = require("../../schema-builder/schema/TableColumn");
var Table_1 = require("../../schema-builder/schema/Table");
var TableForeignKey_1 = require("../../schema-builder/schema/TableForeignKey");
var TablePrimaryKey_1 = require("../../schema-builder/schema/TablePrimaryKey");
var TableIndex_1 = require("../../schema-builder/schema/TableIndex");
var QueryRunnerAlreadyReleasedError_1 = require("../../error/QueryRunnerAlreadyReleasedError");
var OrmUtils_1 = require("../../util/OrmUtils");
var QueryFailedError_1 = require("../../error/QueryFailedError");
/**
 * Runs queries on a single mysql database connection.
 */
var MysqlQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MysqlQueryRunner(driver, mode) {
        if (mode === void 0) { mode = "master"; }
        /**
         * Indicates if connection for this query runner is released.
         * Once its released, query runner cannot run queries anymore.
         */
        this.isReleased = false;
        /**
         * Indicates if transaction is in progress.
         */
        this.isTransactionActive = false;
        /**
         * Stores temporarily user data.
         * Useful for sharing data with subscribers.
         */
        this.data = {};
        /**
         * Indicates if special query runner mode in which sql queries won't be executed is enabled.
         */
        this.sqlMemoryMode = false;
        /**
         * Sql-s stored if "sql in memory" mode is enabled.
         */
        this.sqlsInMemory = [];
        this.driver = driver;
        this.connection = driver.connection;
        this.mode = mode;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    MysqlQueryRunner.prototype.connect = function () {
        var _this = this;
        if (this.databaseConnection)
            return Promise.resolve(this.databaseConnection);
        if (this.databaseConnectionPromise)
            return this.databaseConnectionPromise;
        if (this.mode === "slave" && this.driver.isReplicated) {
            this.databaseConnectionPromise = this.driver.obtainSlaveConnection().then(function (connection) {
                _this.databaseConnection = connection;
                return _this.databaseConnection;
            });
        }
        else { // master
            this.databaseConnectionPromise = this.driver.obtainMasterConnection().then(function (connection) {
                _this.databaseConnection = connection;
                return _this.databaseConnection;
            });
        }
        return this.databaseConnectionPromise;
    };
    /**
     * Releases used database connection.
     * You cannot use query runner methods once its released.
     */
    MysqlQueryRunner.prototype.release = function () {
        this.isReleased = true;
        if (this.databaseConnection)
            this.databaseConnection.release();
        return Promise.resolve();
    };
    /**
     * Starts transaction on the current connection.
     */
    MysqlQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isTransactionActive)
                            throw new TransactionAlreadyStartedError_1.TransactionAlreadyStartedError();
                        this.isTransactionActive = true;
                        return [4 /*yield*/, this.query("START TRANSACTION")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    MysqlQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError_1.TransactionNotStartedError();
                        return [4 /*yield*/, this.query("COMMIT")];
                    case 1:
                        _a.sent();
                        this.isTransactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rollbacks transaction.
     * Error will be thrown if transaction was not started.
     */
    MysqlQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError_1.TransactionNotStartedError();
                        return [4 /*yield*/, this.query("ROLLBACK")];
                    case 1:
                        _a.sent();
                        this.isTransactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a raw SQL query.
     */
    MysqlQueryRunner.prototype.query = function (query, parameters) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError_1.QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var databaseConnection, queryStartTime_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        queryStartTime_1 = +new Date();
                        databaseConnection.query(query, parameters, function (err, result) {
                            // log slow queries if maxQueryExecution time is set
                            var maxQueryExecutionTime = _this.driver.connection.options.maxQueryExecutionTime;
                            var queryEndTime = +new Date();
                            var queryExecutionTime = queryEndTime - queryStartTime_1;
                            if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                _this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, _this);
                            if (err) {
                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                return fail(new QueryFailedError_1.QueryFailedError(query, parameters, err));
                            }
                            ok(result);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        fail(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns raw data stream.
     */
    MysqlQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError_1.QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var databaseConnection, stream, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        stream = databaseConnection.query(query, parameters);
                        if (onEnd)
                            stream.on("end", onEnd);
                        if (onError)
                            stream.on("error", onError);
                        ok(stream);
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        fail(err_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    MysqlQueryRunner.prototype.insert = function (tablePath, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, columns, values, parameters, generatedColumns, sql, result, generatedMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(keyValues);
                        columns = keys.map(function (key) { return "`" + key + "`"; }).join(", ");
                        values = keys.map(function (key) { return "?"; }).join(",");
                        parameters = keys.map(function (key) { return keyValues[key]; });
                        generatedColumns = this.connection.hasMetadata(tablePath) ? this.connection.getMetadata(tablePath).generatedColumns : [];
                        sql = "INSERT INTO `" + this.escapeTablePath(tablePath) + "`(" + columns + ") VALUES (" + values + ")";
                        return [4 /*yield*/, this.query(sql, parameters)];
                    case 1:
                        result = _a.sent();
                        generatedMap = generatedColumns.reduce(function (map, generatedColumn) {
                            var value = generatedColumn.isPrimary && result.insertId ? result.insertId : keyValues[generatedColumn.databaseName];
                            if (!value)
                                return map;
                            return OrmUtils_1.OrmUtils.mergeDeep(map, generatedColumn.createValueMap(value));
                        }, {});
                        return [2 /*return*/, {
                                result: result,
                                generatedMap: Object.keys(generatedMap).length > 0 ? generatedMap : undefined
                            }];
                }
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     */
    MysqlQueryRunner.prototype.update = function (tablePath, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            var updateValues, conditionString, sql, conditionParams, updateParams, allParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateValues = this.parametrize(valuesMap).join(", ");
                        conditionString = this.parametrize(conditions).join(" AND ");
                        sql = "UPDATE `" + this.escapeTablePath(tablePath) + "` SET " + updateValues + " " + (conditionString ? (" WHERE " + conditionString) : "");
                        conditionParams = Object.keys(conditions).map(function (key) { return conditions[key]; });
                        updateParams = Object.keys(valuesMap).map(function (key) { return valuesMap[key]; });
                        allParameters = updateParams.concat(conditionParams);
                        return [4 /*yield*/, this.query(sql, allParameters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes from the given table by a given conditions.
     */
    MysqlQueryRunner.prototype.delete = function (tablePath, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionString, parameters, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditionString = typeof conditions === "string" ? conditions : this.parametrize(conditions).join(" AND ");
                        parameters = conditions instanceof Object ? Object.keys(conditions).map(function (key) { return conditions[key]; }) : maybeParameters;
                        sql = "DELETE FROM `" + this.escapeTablePath(tablePath) + "` WHERE " + conditionString;
                        return [4 /*yield*/, this.query(sql, parameters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inserts rows into the closure table.
     */
    MysqlQueryRunner.prototype.insertIntoClosureTable = function (tablePath, newEntityId, parentId, hasLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!hasLevel) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.query("INSERT INTO `" + this.escapeTablePath(tablePath) + "`(`ancestor`, `descendant`, `level`) " +
                                ("SELECT `ancestor`, " + newEntityId + ", `level` + 1 FROM `" + this.escapeTablePath(tablePath) + "` WHERE `descendant` = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId + ", 1"))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.query("INSERT INTO `" + this.escapeTablePath(tablePath) + "`(`ancestor`, `descendant`) " +
                            ("SELECT `ancestor`, " + newEntityId + " FROM `" + this.escapeTablePath(tablePath) + "` WHERE `descendant` = " + parentId + " ") +
                            ("UNION ALL SELECT " + newEntityId + ", " + newEntityId))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!hasLevel) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.query("SELECT MAX(`level`) as `level` FROM `" + this.escapeTablePath(tablePath) + "` WHERE `descendant` = " + parentId)];
                    case 5:
                        results = _a.sent();
                        return [2 /*return*/, results && results[0] && results[0]["level"] ? parseInt(results[0]["level"]) + 1 : 1];
                    case 6: return [2 /*return*/, -1];
                }
            });
        });
    };
    /**
     * Loads given table's data from the database.
     */
    MysqlQueryRunner.prototype.getTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTables([tableName])];
                    case 1:
                        tables = _a.sent();
                        return [2 /*return*/, tables.length > 0 ? tables[0] : undefined];
                }
            });
        });
    };
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    MysqlQueryRunner.prototype.getTables = function (tablePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableNames, dbNames, databaseNamesString, tableNamesString, tablesSql, columnsSql, indicesSql, foreignKeysSql, _a, dbTables, dbColumns, dbIndices, dbForeignKeys, isMariaDb;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.sqlMemoryMode)
                            throw new Error("Loading table is not supported in sql memory mode");
                        // if no tables given then no need to proceed
                        if (!tablePaths || !tablePaths.length)
                            return [2 /*return*/, []];
                        tableNames = tablePaths.map(function (tablePath) {
                            return tablePath.indexOf(".") === -1 ? tablePath : tablePath.split(".")[1];
                        });
                        dbNames = tablePaths
                            .filter(function (tablePath) { return tablePath.indexOf(".") !== -1; })
                            .map(function (tablePath) { return tablePath.split(".")[0]; });
                        if (this.driver.database && !dbNames.find(function (dbName) { return dbName === _this.driver.database; }))
                            dbNames.push(this.driver.database);
                        databaseNamesString = dbNames.map(function (dbName) { return "'" + dbName + "'"; }).join(", ");
                        tableNamesString = tableNames.map(function (tableName) { return "'" + tableName + "'"; }).join(", ");
                        tablesSql = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA IN (" + databaseNamesString + ") AND TABLE_NAME IN (" + tableNamesString + ")";
                        columnsSql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA IN (" + databaseNamesString + ")";
                        indicesSql = "SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA IN (" + databaseNamesString + ") AND INDEX_NAME != 'PRIMARY' ORDER BY SEQ_IN_INDEX";
                        foreignKeysSql = "SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA IN (" + databaseNamesString + ") AND REFERENCED_COLUMN_NAME IS NOT NULL";
                        return [4 /*yield*/, Promise.all([
                                this.query(tablesSql),
                                this.query(columnsSql),
                                this.query(indicesSql),
                                this.query(foreignKeysSql)
                            ])];
                    case 1:
                        _a = _b.sent(), dbTables = _a[0], dbColumns = _a[1], dbIndices = _a[2], dbForeignKeys = _a[3];
                        // if tables were not found in the db, no need to proceed
                        if (!dbTables.length)
                            return [2 /*return*/, []];
                        isMariaDb = this.driver.options.type === "mariadb";
                        // create tables for loaded tables
                        return [2 /*return*/, Promise.all(dbTables.map(function (dbTable) { return __awaiter(_this, void 0, void 0, function () {
                                var table, primaryKeys;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            table = new Table_1.Table(dbTable["TABLE_NAME"]);
                                            table.database = dbTable["TABLE_SCHEMA"];
                                            return [4 /*yield*/, this.query("SHOW INDEX FROM `" + dbTable["TABLE_SCHEMA"] + "`.`" + dbTable["TABLE_NAME"] + "` WHERE Key_name = 'PRIMARY'")];
                                        case 1:
                                            primaryKeys = _a.sent();
                                            // create columns from the loaded columns
                                            table.columns = dbColumns
                                                .filter(function (dbColumn) { return dbColumn["TABLE_NAME"] === table.name; })
                                                .map(function (dbColumn) {
                                                var tableColumn = new TableColumn_1.TableColumn();
                                                tableColumn.name = dbColumn["COLUMN_NAME"];
                                                var columnType = dbColumn["COLUMN_TYPE"].toLowerCase();
                                                var endIndex = columnType.indexOf("(");
                                                tableColumn.type = endIndex !== -1 ? columnType.substring(0, endIndex) : columnType;
                                                if (dbColumn["COLUMN_DEFAULT"] === null || dbColumn["COLUMN_DEFAULT"] === undefined
                                                    || (isMariaDb && dbColumn["COLUMN_DEFAULT"] === "NULL")) {
                                                    tableColumn.default = undefined;
                                                }
                                                else {
                                                    tableColumn.default = dbColumn["COLUMN_DEFAULT"];
                                                }
                                                tableColumn.isNullable = dbColumn["IS_NULLABLE"] === "YES";
                                                tableColumn.isPrimary = dbColumn["COLUMN_KEY"].indexOf("PRI") !== -1;
                                                tableColumn.isUnique = dbColumn["COLUMN_KEY"].indexOf("UNI") !== -1;
                                                tableColumn.isGenerated = dbColumn["EXTRA"].indexOf("auto_increment") !== -1;
                                                tableColumn.comment = dbColumn["COLUMN_COMMENT"];
                                                tableColumn.precision = dbColumn["NUMERIC_PRECISION"];
                                                tableColumn.scale = dbColumn["NUMERIC_SCALE"];
                                                tableColumn.charset = dbColumn["CHARACTER_SET_NAME"];
                                                tableColumn.collation = dbColumn["COLLATION_NAME"];
                                                if (tableColumn.type === "int" || tableColumn.type === "tinyint"
                                                    || tableColumn.type === "smallint" || tableColumn.type === "mediumint"
                                                    || tableColumn.type === "bigint" || tableColumn.type === "year") {
                                                    var length = columnType.substring(columnType.indexOf("(") + 1, columnType.indexOf(")"));
                                                    tableColumn.length = length ? length.toString() : "";
                                                }
                                                else {
                                                    tableColumn.length = dbColumn["CHARACTER_MAXIMUM_LENGTH"] ? dbColumn["CHARACTER_MAXIMUM_LENGTH"].toString() : "";
                                                }
                                                if (tableColumn.type === "enum") {
                                                    var colType = dbColumn["COLUMN_TYPE"];
                                                    var items = colType.substring(colType.indexOf("(") + 1, colType.indexOf(")")).split(",");
                                                    tableColumn.enum = items.map(function (item) {
                                                        return item.substring(1, item.length - 1);
                                                    });
                                                }
                                                if (tableColumn.type === "datetime" || tableColumn.type === "time" || tableColumn.type === "timestamp") {
                                                    tableColumn.precision = dbColumn["DATETIME_PRECISION"];
                                                }
                                                return tableColumn;
                                            });
                                            // create primary keys
                                            table.primaryKeys = primaryKeys.map(function (primaryKey) {
                                                return new TablePrimaryKey_1.TablePrimaryKey(primaryKey["Key_name"], primaryKey["Column_name"]);
                                            });
                                            // create foreign key schemas from the loaded indices
                                            table.foreignKeys = dbForeignKeys
                                                .filter(function (dbForeignKey) { return dbForeignKey["TABLE_NAME"] === table.name; })
                                                .map(function (dbForeignKey) { return new TableForeignKey_1.TableForeignKey(dbForeignKey["CONSTRAINT_NAME"], [], [], "", ""); }); // todo: fix missing params
                                            // create index schemas from the loaded indices
                                            table.indices = dbIndices
                                                .filter(function (dbIndex) {
                                                return dbIndex["TABLE_NAME"] === table.name &&
                                                    (!table.foreignKeys.find(function (foreignKey) { return foreignKey.name === dbIndex["INDEX_NAME"]; })) &&
                                                    (!table.primaryKeys.find(function (primaryKey) { return primaryKey.name === dbIndex["INDEX_NAME"]; }));
                                            })
                                                .map(function (dbIndex) { return dbIndex["INDEX_NAME"]; })
                                                .filter(function (value, index, self) { return self.indexOf(value) === index; }) // unqiue
                                                .map(function (dbIndexName) {
                                                var currentDbIndices = dbIndices.filter(function (dbIndex) { return dbIndex["TABLE_NAME"] === table.name && dbIndex["INDEX_NAME"] === dbIndexName; });
                                                var columnNames = currentDbIndices.map(function (dbIndex) { return dbIndex["COLUMN_NAME"]; });
                                                // find a special index - unique index and
                                                if (currentDbIndices.length === 1 && currentDbIndices[0]["NON_UNIQUE"] === 0) {
                                                    var column = table.columns.find(function (column) { return column.name === currentDbIndices[0]["INDEX_NAME"] && column.name === currentDbIndices[0]["COLUMN_NAME"]; });
                                                    if (column) {
                                                        column.isUnique = true;
                                                        return;
                                                    }
                                                }
                                                return new TableIndex_1.TableIndex(dbTable["TABLE_NAME"], dbIndexName, columnNames, currentDbIndices[0]["NON_UNIQUE"] === 0);
                                            })
                                                .filter(function (index) { return !!index; }); // remove empty returns
                                            return [2 /*return*/, table];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * Checks if database with the given name exist.
     */
    MysqlQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT * FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '" + database + "'")];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length ? true : false];
                }
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    MysqlQueryRunner.prototype.hasTable = function (tableOrPath) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tableOrPath);
                        sql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + parsedTablePath.database + "' AND TABLE_NAME = '" + parsedTablePath.tableName + "'";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length ? true : false];
                }
            });
        });
    };
    /**
     * Checks if column with the given name exist in the given table.
     */
    MysqlQueryRunner.prototype.hasColumn = function (tableOrPath, column) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, columnName, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tableOrPath);
                        columnName = column instanceof TableColumn_1.TableColumn ? column.name : column;
                        sql = "SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '" + parsedTablePath.database + "' AND TABLE_NAME = '" + parsedTablePath.tableName + "' AND COLUMN_NAME = '" + columnName + "'";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length ? true : false];
                }
            });
        });
    };
    /**
     * Creates a database if it's not created.
     */
    MysqlQueryRunner.prototype.createDatabase = function (database) {
        return this.query("CREATE DATABASE IF NOT EXISTS " + database); // todo(dima): IT SHOULD NOT EXECUTE "IF NOT EXIST" if user already has a database (privileges issue)
    };
    /**
     * Creates a schema if it's not created.
     */
    MysqlQueryRunner.prototype.createSchema = function (schemas) {
        return Promise.resolve([]);
    };
    /**
     * Creates a new table from the given table and column inside it.
     */
    MysqlQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var columnDefinitions, sql, primaryKeyColumns, revertSql;
            return __generator(this, function (_a) {
                columnDefinitions = table.columns.map(function (column) { return _this.buildCreateColumnSql(column, false); }).join(", ");
                sql = "CREATE TABLE `" + this.escapeTablePath(table) + "` (" + columnDefinitions;
                primaryKeyColumns = table.columns.filter(function (column) { return column.isPrimary && !column.isGenerated; });
                if (primaryKeyColumns.length > 0)
                    sql += ", PRIMARY KEY(" + primaryKeyColumns.map(function (column) { return "`" + column.name + "`"; }).join(", ") + ")";
                sql += ") ENGINE=" + (table.engine || "InnoDB");
                revertSql = "DROP TABLE `" + this.escapeTablePath(table) + "`";
                return [2 /*return*/, this.schemaQuery(sql, revertSql)];
            });
        });
    };
    /**
     * Drop the table.
     */
    MysqlQueryRunner.prototype.dropTable = function (tableOrPath) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                sql = "DROP TABLE `" + this.escapeTablePath(tableOrPath) + "`";
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Creates a new column from the column in the table.
     */
    MysqlQueryRunner.prototype.addColumn = function (tableOrPath, column) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, revertSql;
            return __generator(this, function (_a) {
                sql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` ADD " + this.buildCreateColumnSql(column, false);
                revertSql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` DROP `" + column.name + "`";
                return [2 /*return*/, this.schemaQuery(sql, revertSql)];
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    MysqlQueryRunner.prototype.addColumns = function (tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var queries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queries = columns.map(function (column) { return _this.addColumn(tableOrName, column); });
                        return [4 /*yield*/, Promise.all(queries)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renames column in the given table.
     */
    MysqlQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, newColumn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table_1.Table)) return [3 /*break*/, 1];
                        table = tableOrName;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getTable(tableOrName)];
                    case 2:
                        table = _a.sent(); // todo: throw exception, this wont work because of sql memory enabled. remove support by table name
                        if (!table)
                            throw new Error("Table " + tableOrName + " was not found.");
                        _a.label = 3;
                    case 3:
                        oldColumn = undefined;
                        if (oldTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        newColumn = undefined;
                        if (newTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            newColumn = newTableColumnOrName;
                        }
                        else {
                            newColumn = oldColumn.clone();
                            newColumn.name = newTableColumnOrName;
                        }
                        return [2 /*return*/, this.changeColumn(table, oldColumn, newColumn)];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    MysqlQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, sql, revertSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table_1.Table)) return [3 /*break*/, 1];
                        table = tableOrName;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getTable(tableOrName)];
                    case 2:
                        table = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!table)
                            throw new Error("Table " + tableOrName + " was not found.");
                        oldColumn = undefined;
                        if (oldTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        if (!(newColumn.isUnique === false && oldColumn.isUnique === true)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.query("ALTER TABLE `" + this.escapeTablePath(table) + "` DROP INDEX `" + oldColumn.name + "`")];
                    case 4:
                        _a.sent(); // todo: add revert code
                        _a.label = 5;
                    case 5:
                        sql = "ALTER TABLE `" + this.escapeTablePath(table) + "` CHANGE `" + oldColumn.name + "` " + this.buildCreateColumnSql(newColumn, oldColumn.isPrimary);
                        revertSql = "ALTER TABLE `" + this.escapeTablePath(table) + "` CHANGE `" + oldColumn.name + "` " + this.buildCreateColumnSql(oldColumn, oldColumn.isPrimary);
                        return [2 /*return*/, this.schemaQuery(sql, revertSql)];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    MysqlQueryRunner.prototype.changeColumns = function (table, changedColumns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var updatePromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatePromises = changedColumns.map(function (changedColumn) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, this.changeColumn(table, changedColumn.oldColumn, changedColumn.newColumn)];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(updatePromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops column in the table.
     */
    MysqlQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, revertSql;
            return __generator(this, function (_a) {
                sql = "ALTER TABLE `" + this.escapeTablePath(table) + "` DROP `" + column.name + "`";
                revertSql = "ALTER TABLE `" + this.escapeTablePath(table) + "` ADD " + this.buildCreateColumnSql(column, false);
                return [2 /*return*/, this.schemaQuery(sql, revertSql)];
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    MysqlQueryRunner.prototype.dropColumns = function (table, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var dropPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dropPromises = columns.map(function (column) { return _this.dropColumn(table, column); });
                        return [4 /*yield*/, Promise.all(dropPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates table's primary keys.
     */
    MysqlQueryRunner.prototype.updatePrimaryKeys = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var primaryColumnNames, sql, revertSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!table.hasGeneratedColumn) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.query("ALTER TABLE `" + this.escapeTablePath(table) + "` DROP PRIMARY KEY")];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        primaryColumnNames = table.columns
                            .filter(function (column) { return column.isPrimary && !column.isGenerated; })
                            .map(function (column) { return "`" + column.name + "`"; });
                        if (primaryColumnNames.length > 0) {
                            sql = "ALTER TABLE `" + this.escapeTablePath(table) + "` ADD PRIMARY KEY (" + primaryColumnNames.join(", ") + ")";
                            revertSql = "ALTER TABLE `" + this.escapeTablePath(table) + "` DROP PRIMARY KEY";
                            return [2 /*return*/, this.schemaQuery(sql, revertSql)];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new foreign key.
     */
    MysqlQueryRunner.prototype.createForeignKey = function (tableOrPath, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, referencedColumnNames, sql, revertSql;
            return __generator(this, function (_a) {
                columnNames = foreignKey.columnNames.map(function (column) { return "`" + column + "`"; }).join(", ");
                referencedColumnNames = foreignKey.referencedColumnNames.map(function (column) { return "`" + column + "`"; }).join(",");
                sql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` ADD CONSTRAINT `" + foreignKey.name + "` " +
                    ("FOREIGN KEY (" + columnNames + ") ") +
                    ("REFERENCES `" + foreignKey.referencedTableName + "`(" + referencedColumnNames + ")");
                if (foreignKey.onDelete)
                    sql += " ON DELETE " + foreignKey.onDelete;
                revertSql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` DROP FOREIGN KEY `" + foreignKey.name + "`";
                return [2 /*return*/, this.schemaQuery(sql, revertSql)];
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    MysqlQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = foreignKeys.map(function (foreignKey) { return _this.createForeignKey(tableOrName, foreignKey); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops a foreign key from the table.
     */
    MysqlQueryRunner.prototype.dropForeignKey = function (tableOrPath, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, columnNames, referencedColumnNames, revertSql;
            return __generator(this, function (_a) {
                sql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` DROP FOREIGN KEY `" + foreignKey.name + "`";
                columnNames = foreignKey.columnNames.map(function (column) { return "`" + column + "`"; }).join(", ");
                referencedColumnNames = foreignKey.referencedColumnNames.map(function (column) { return "`" + column + "`"; }).join(",");
                revertSql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` ADD CONSTRAINT `" + foreignKey.name + "` " +
                    ("FOREIGN KEY (" + columnNames + ") ") +
                    ("REFERENCES `" + foreignKey.referencedTableName + "`(" + referencedColumnNames + ")");
                if (foreignKey.onDelete)
                    revertSql += " ON DELETE " + foreignKey.onDelete;
                return [2 /*return*/, this.schemaQuery(sql, revertSql)];
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    MysqlQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = foreignKeys.map(function (foreignKey) { return _this.dropForeignKey(tableOrName, foreignKey); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new index.
     */
    MysqlQueryRunner.prototype.createIndex = function (table, index) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, sql, revertSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columns = index.columnNames.map(function (columnName) { return "`" + columnName + "`"; }).join(", ");
                        sql = "CREATE " + (index.isUnique ? "UNIQUE " : "") + "INDEX `" + index.name + "` ON `" + this.escapeTablePath(table) + "`(" + columns + ")";
                        revertSql = "ALTER TABLE `" + this.escapeTablePath(table) + "` DROP INDEX `" + index.name + "`";
                        return [4 /*yield*/, this.schemaQuery(sql, revertSql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops an index from the table.
     */
    MysqlQueryRunner.prototype.dropIndex = function (tableOrPath, index) {
        return __awaiter(this, void 0, void 0, function () {
            var indexName, sql, columns, revertSql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexName = index instanceof TableIndex_1.TableIndex ? index.name : index;
                        sql = "ALTER TABLE `" + this.escapeTablePath(tableOrPath) + "` DROP INDEX `" + indexName + "`";
                        if (!(index instanceof TableIndex_1.TableIndex)) return [3 /*break*/, 2];
                        columns = index.columnNames.map(function (columnName) { return "`" + columnName + "`"; }).join(", ");
                        revertSql = "CREATE " + (index.isUnique ? "UNIQUE " : "") + "INDEX `" + index.name + "` ON `" + this.escapeTablePath(tableOrPath) + "`(" + columns + ")";
                        return [4 /*yield*/, this.schemaQuery(sql, revertSql)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.query(sql)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Truncates table.
     */
    MysqlQueryRunner.prototype.truncate = function (tableOrPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("TRUNCATE TABLE `" + this.escapeTablePath(tableOrPath) + "`")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all tables from the currently connected database.
     * Be careful using this method and avoid using it in production or migrations
     * (because it can clear all your database).
     */
    MysqlQueryRunner.prototype.clearDatabase = function (tables, database) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var disableForeignKeysCheckQuery, dropTablesQuery, enableForeignKeysCheckQuery, dropQueries, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startTransaction()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 13]);
                        disableForeignKeysCheckQuery = "SET FOREIGN_KEY_CHECKS = 0;";
                        dropTablesQuery = "SELECT concat('DROP TABLE IF EXISTS `', table_schema, '`.`', table_name, '`;') AS query FROM information_schema.tables WHERE table_schema = '" + database + "'";
                        enableForeignKeysCheckQuery = "SET FOREIGN_KEY_CHECKS = 1;";
                        return [4 /*yield*/, this.query(disableForeignKeysCheckQuery)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.query(dropTablesQuery)];
                    case 4:
                        dropQueries = _a.sent();
                        return [4 /*yield*/, Promise.all(dropQueries.map(function (query) { return _this.query(query["query"]); }))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.query(enableForeignKeysCheckQuery)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.commitTransaction()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        error_1 = _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        rollbackError_1 = _a.sent();
                        return [3 /*break*/, 12];
                    case 12: throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    MysqlQueryRunner.prototype.enableSqlMemory = function () {
        this.sqlMemoryMode = true;
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    MysqlQueryRunner.prototype.disableSqlMemory = function () {
        this.sqlsInMemory = [];
        this.sqlMemoryMode = false;
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    MysqlQueryRunner.prototype.getMemorySql = function () {
        return this.sqlsInMemory;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Executes sql used special for schema build.
     */
    MysqlQueryRunner.prototype.schemaQuery = function (upQuery, downQuery) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if sql-in-memory mode is enabled then simply store sql in memory and return
                        if (this.sqlMemoryMode === true) {
                            this.sqlsInMemory.push({ up: upQuery, down: downQuery });
                            return [2 /*return*/, Promise.resolve()];
                        }
                        return [4 /*yield*/, this.query(upQuery)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MysqlQueryRunner.prototype.parseTablePath = function (tableOrPath) {
        if (tableOrPath instanceof Table_1.Table) {
            return {
                database: tableOrPath.database || this.driver.database,
                tableName: tableOrPath.name
            };
        }
        else {
            return {
                database: tableOrPath.indexOf(".") !== -1 ? tableOrPath.split(".")[0] : this.driver.database,
                tableName: tableOrPath.indexOf(".") !== -1 ? tableOrPath.split(".")[1] : tableOrPath
            };
        }
    };
    MysqlQueryRunner.prototype.escapeTablePath = function (tableOrPath) {
        if (tableOrPath instanceof Table_1.Table)
            return tableOrPath.database ? tableOrPath.database + "`.`" + tableOrPath.name : "" + tableOrPath.name;
        return tableOrPath.split(".").map(function (i) { return "" + i; }).join("\`.\`");
    };
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    MysqlQueryRunner.prototype.parametrize = function (objectLiteral) {
        return Object.keys(objectLiteral).map(function (key) { return "`" + key + "`=?"; });
    };
    /**
     * Builds a part of query to create/change a column.
     */
    MysqlQueryRunner.prototype.buildCreateColumnSql = function (column, skipPrimary) {
        var c = "`" + column.name + "` " + this.connection.driver.createFullType(column);
        if (column.enum)
            c += "(" + column.enum.map(function (value) { return "'" + value + "'"; }).join(", ") + ")";
        if (column.charset)
            c += " CHARACTER SET " + column.charset;
        if (column.collation)
            c += " COLLATE " + column.collation;
        if (column.isNullable !== true)
            c += " NOT NULL";
        if (column.isNullable === true)
            c += (column.isPrimary && !skipPrimary) ? " NOT NULL" : " NULL";
        if (column.isUnique === true)
            c += " UNIQUE";
        if (column.isGenerated && column.isPrimary && !skipPrimary)
            c += " PRIMARY KEY";
        if (column.isGenerated === true && column.generationStrategy === "increment") // don't use skipPrimary here since updates can update already exist primary without auto inc.
            c += " AUTO_INCREMENT";
        if (column.comment)
            c += " COMMENT '" + column.comment + "'";
        if (column.default !== undefined && column.default !== null)
            c += " DEFAULT " + column.default;
        return c;
    };
    return MysqlQueryRunner;
}());
exports.MysqlQueryRunner = MysqlQueryRunner;

//# sourceMappingURL=MysqlQueryRunner.js.map
