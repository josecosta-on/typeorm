var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { RawSqlResultsToEntityTransformer } from "./transformer/RawSqlResultsToEntityTransformer";
import { SqlServerDriver } from "../driver/sqlserver/SqlServerDriver";
import { PessimisticLockTransactionRequiredError } from "../error/PessimisticLockTransactionRequiredError";
import { NoVersionOrUpdateDateColumnError } from "../error/NoVersionOrUpdateDateColumnError";
import { OptimisticLockVersionMismatchError } from "../error/OptimisticLockVersionMismatchError";
import { OptimisticLockCanNotBeUsedError } from "../error/OptimisticLockCanNotBeUsedError";
import { JoinAttribute } from "./JoinAttribute";
import { RelationIdAttribute } from "./relation-id/RelationIdAttribute";
import { RelationCountAttribute } from "./relation-count/RelationCountAttribute";
import { RelationIdLoader } from "./relation-id/RelationIdLoader";
import { RelationIdMetadataToAttributeTransformer } from "./relation-id/RelationIdMetadataToAttributeTransformer";
import { RelationCountLoader } from "./relation-count/RelationCountLoader";
import { RelationCountMetadataToAttributeTransformer } from "./relation-count/RelationCountMetadataToAttributeTransformer";
import { Broadcaster } from "../subscriber/Broadcaster";
import { QueryBuilder } from "./QueryBuilder";
import { LockNotSupportedOnGivenDriverError } from "../error/LockNotSupportedOnGivenDriverError";
import { MysqlDriver } from "../driver/mysql/MysqlDriver";
import { PostgresDriver } from "../driver/postgres/PostgresDriver";
import { OracleDriver } from "../driver/oracle/OracleDriver";
import { AbstractSqliteDriver } from "../driver/sqlite-abstract/AbstractSqliteDriver";
import { OffsetWithoutLimitNotSupportedError } from "../error/OffsetWithoutLimitNotSupportedError";
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var SelectQueryBuilder = /** @class */ (function (_super) {
    __extends(SelectQueryBuilder, _super);
    function SelectQueryBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    SelectQueryBuilder.prototype.getQuery = function () {
        var sql = this.createSelectExpression();
        sql += this.createJoinExpression();
        sql += this.createWhereExpression();
        sql += this.createGroupByExpression();
        sql += this.createHavingExpression();
        sql += this.createOrderByExpression();
        sql += this.createLimitOffsetExpression();
        sql += this.createLockExpression();
        sql = this.createLimitOffsetOracleSpecificExpression(sql);
        sql = sql.trim();
        if (this.expressionMap.subQuery)
            sql = "(" + sql + ")";
        return sql;
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a subquery - query that can be used inside other queries.
     */
    SelectQueryBuilder.prototype.subQuery = function () {
        var qb = this.createQueryBuilder();
        qb.expressionMap.subQuery = true;
        qb.expressionMap.parentQueryBuilder = this;
        return qb;
    };
    /**
     * Creates SELECT query and selects given data.
     * Replaces all previous selections if they exist.
     */
    SelectQueryBuilder.prototype.select = function (selection, selectionAliasName) {
        this.expressionMap.queryType = "select";
        if (selection instanceof Array) {
            this.expressionMap.selects = selection.map(function (selection) { return ({ selection: selection }); });
        }
        else if (selection instanceof Function) {
            var subQueryBuilder = selection(this.subQuery());
            this.setParameters(subQueryBuilder.getParameters());
            this.expressionMap.selects.push({ selection: subQueryBuilder.getQuery(), aliasName: selectionAliasName });
        }
        else if (selection) {
            this.expressionMap.selects = [{ selection: selection, aliasName: selectionAliasName }];
        }
        return this;
    };
    /**
     * Adds new selection to the SELECT query.
     */
    SelectQueryBuilder.prototype.addSelect = function (selection, selectionAliasName) {
        if (!selection)
            return this;
        if (selection instanceof Array) {
            this.expressionMap.selects = this.expressionMap.selects.concat(selection.map(function (selection) { return ({ selection: selection }); }));
        }
        else if (selection instanceof Function) {
            var subQueryBuilder = selection(this.subQuery());
            this.setParameters(subQueryBuilder.getParameters());
            this.expressionMap.selects.push({ selection: subQueryBuilder.getQuery(), aliasName: selectionAliasName });
        }
        else if (selection) {
            this.expressionMap.selects.push({ selection: selection, aliasName: selectionAliasName });
        }
        return this;
    };
    /**
     * Specifies FROM which entity's table select/update/delete will be executed.
     * Also sets a main string alias of the selection data.
     * Removes all previously set from-s.
     */
    SelectQueryBuilder.prototype.from = function (entityTarget, aliasName) {
        var mainAlias = this.createFromAlias(entityTarget, aliasName);
        this.expressionMap.setMainAlias(mainAlias);
        return this;
    };
    /**
     * Specifies FROM which entity's table select/update/delete will be executed.
     * Also sets a main string alias of the selection data.
     */
    SelectQueryBuilder.prototype.addFrom = function (entityTarget, aliasName) {
        var alias = this.createFromAlias(entityTarget, aliasName);
        if (!this.expressionMap.mainAlias)
            this.expressionMap.setMainAlias(alias);
        return this;
    };
    /**
     * INNER JOINs (without selection).
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.innerJoin = function (entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.join("INNER", entityOrProperty, aliasName, condition, parameters);
        return this;
    };
    /**
     * LEFT JOINs (without selection).
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.leftJoin = function (entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.join("LEFT", entityOrProperty, aliasName, condition, parameters);
        return this;
    };
    /**
     * INNER JOINs and adds all selection properties to SELECT.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.innerJoinAndSelect = function (entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.innerJoin(entityOrProperty, aliasName, condition, parameters);
        return this;
    };
    /**
     * LEFT JOINs and adds all selection properties to SELECT.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.leftJoinAndSelect = function (entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.leftJoin(entityOrProperty, aliasName, condition, parameters);
        return this;
    };
    /**
     * INNER JOINs, SELECTs the data returned by a join and MAPs all that data to some entity's property.
     * This is extremely useful when you want to select some data and map it to some virtual property.
     * It will assume that there are multiple rows of selecting data, and mapped result will be an array.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.innerJoinAndMapMany = function (mapToProperty, entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.join("INNER", entityOrProperty, aliasName, condition, parameters, mapToProperty, true);
        return this;
    };
    /**
     * INNER JOINs, SELECTs the data returned by a join and MAPs all that data to some entity's property.
     * This is extremely useful when you want to select some data and map it to some virtual property.
     * It will assume that there is a single row of selecting data, and mapped result will be a single selected value.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.innerJoinAndMapOne = function (mapToProperty, entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.join("INNER", entityOrProperty, aliasName, condition, parameters, mapToProperty, false);
        return this;
    };
    /**
     * LEFT JOINs, SELECTs the data returned by a join and MAPs all that data to some entity's property.
     * This is extremely useful when you want to select some data and map it to some virtual property.
     * It will assume that there are multiple rows of selecting data, and mapped result will be an array.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.leftJoinAndMapMany = function (mapToProperty, entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.join("LEFT", entityOrProperty, aliasName, condition, parameters, mapToProperty, true);
        return this;
    };
    /**
     * LEFT JOINs, SELECTs the data returned by a join and MAPs all that data to some entity's property.
     * This is extremely useful when you want to select some data and map it to some virtual property.
     * It will assume that there is a single row of selecting data, and mapped result will be a single selected value.
     * You also need to specify an alias of the joined data.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.leftJoinAndMapOne = function (mapToProperty, entityOrProperty, aliasName, condition, parameters) {
        if (condition === void 0) { condition = ""; }
        this.addSelect(aliasName);
        this.join("LEFT", entityOrProperty, aliasName, condition, parameters, mapToProperty, false);
        return this;
    };
    /**
     * LEFT JOINs relation id and maps it into some entity's property.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.loadRelationIdAndMap = function (mapToProperty, relationName, aliasNameOrOptions, queryBuilderFactory) {
        var relationIdAttribute = new RelationIdAttribute(this.expressionMap);
        relationIdAttribute.mapToProperty = mapToProperty;
        relationIdAttribute.relationName = relationName;
        if (typeof aliasNameOrOptions === "string")
            relationIdAttribute.alias = aliasNameOrOptions;
        if (aliasNameOrOptions instanceof Object && aliasNameOrOptions.disableMixedMap)
            relationIdAttribute.disableMixedMap = true;
        relationIdAttribute.queryBuilderFactory = queryBuilderFactory;
        this.expressionMap.relationIdAttributes.push(relationIdAttribute);
        if (relationIdAttribute.relation.junctionEntityMetadata) {
            this.expressionMap.createAlias({
                type: "other",
                name: relationIdAttribute.junctionAlias,
                metadata: relationIdAttribute.relation.junctionEntityMetadata
            });
        }
        return this;
    };
    /**
     * Counts number of entities of entity's relation and maps the value into some entity's property.
     * Optionally, you can add condition and parameters used in condition.
     */
    SelectQueryBuilder.prototype.loadRelationCountAndMap = function (mapToProperty, relationName, aliasName, queryBuilderFactory) {
        var relationCountAttribute = new RelationCountAttribute(this.expressionMap);
        relationCountAttribute.mapToProperty = mapToProperty;
        relationCountAttribute.relationName = relationName;
        relationCountAttribute.alias = aliasName;
        relationCountAttribute.queryBuilderFactory = queryBuilderFactory;
        this.expressionMap.relationCountAttributes.push(relationCountAttribute);
        this.expressionMap.createAlias({
            type: "other",
            name: relationCountAttribute.junctionAlias
        });
        if (relationCountAttribute.relation.junctionEntityMetadata) {
            this.expressionMap.createAlias({
                type: "other",
                name: relationCountAttribute.junctionAlias,
                metadata: relationCountAttribute.relation.junctionEntityMetadata
            });
        }
        return this;
    };
    /**
     * Loads all relation ids for all relations of the selected entity.
     * All relation ids will be mapped to relation property themself.
     */
    SelectQueryBuilder.prototype.loadAllRelationIds = function () {
        var _this = this;
        this.expressionMap.mainAlias.metadata.relations.forEach(function (relation) {
            _this.loadRelationIdAndMap(_this.expressionMap.mainAlias.name + "." + relation.propertyPath, _this.expressionMap.mainAlias.name + "." + relation.propertyPath, { disableMixedMap: true });
        });
        return this;
    };
    /**
     * Sets WHERE condition in the query builder.
     * If you had previously WHERE expression defined,
     * calling this function will override previously set WHERE conditions.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.where = function (where, parameters) {
        this.expressionMap.wheres = []; // don't move this block below since computeWhereParameter can add where expressions
        var condition = this.computeWhereParameter(where);
        if (condition)
            this.expressionMap.wheres = [{ type: "simple", condition: condition }];
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.andWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "and", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR WHERE condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.orWhere = function (where, parameters) {
        this.expressionMap.wheres.push({ type: "or", condition: this.computeWhereParameter(where) });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     *
     * Ids are mixed.
     * It means if you have single primary key you can pass a simple id values, for example [1, 2, 3].
     * If you have multiple primary keys you need to pass object with property names and values specified,
     * for example [{ firstId: 1, secondId: 2 }, { firstId: 2, secondId: 3 }, ...]
     */
    SelectQueryBuilder.prototype.whereInIds = function (ids) {
        ids = ids instanceof Array ? ids : [ids];
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.where(whereExpression, parameters);
        return this;
    };
    /**
     * Adds new AND WHERE with conditions for the given ids.
     *
     * Ids are mixed.
     * It means if you have single primary key you can pass a simple id values, for example [1, 2, 3].
     * If you have multiple primary keys you need to pass object with property names and values specified,
     * for example [{ firstId: 1, secondId: 2 }, { firstId: 2, secondId: 3 }, ...]
     */
    SelectQueryBuilder.prototype.andWhereInIds = function (ids) {
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.andWhere(whereExpression, parameters);
        return this;
    };
    /**
     * Adds new OR WHERE with conditions for the given ids.
     *
     * Ids are mixed.
     * It means if you have single primary key you can pass a simple id values, for example [1, 2, 3].
     * If you have multiple primary keys you need to pass object with property names and values specified,
     * for example [{ firstId: 1, secondId: 2 }, { firstId: 2, secondId: 3 }, ...]
     */
    SelectQueryBuilder.prototype.orWhereInIds = function (ids) {
        var _a = this.createWhereIdsExpression(ids), whereExpression = _a[0], parameters = _a[1];
        this.orWhere(whereExpression, parameters);
        return this;
    };
    /**
     * Sets HAVING condition in the query builder.
     * If you had previously HAVING expression defined,
     * calling this function will override previously set HAVING conditions.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.having = function (having, parameters) {
        this.expressionMap.havings.push({ type: "simple", condition: having });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new AND HAVING condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.andHaving = function (having, parameters) {
        this.expressionMap.havings.push({ type: "and", condition: having });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Adds new OR HAVING condition in the query builder.
     * Additionally you can add parameters used in where expression.
     */
    SelectQueryBuilder.prototype.orHaving = function (having, parameters) {
        this.expressionMap.havings.push({ type: "or", condition: having });
        if (parameters)
            this.setParameters(parameters);
        return this;
    };
    /**
     * Sets GROUP BY condition in the query builder.
     * If you had previously GROUP BY expression defined,
     * calling this function will override previously set GROUP BY conditions.
     */
    SelectQueryBuilder.prototype.groupBy = function (groupBy) {
        if (groupBy) {
            this.expressionMap.groupBys = [groupBy];
        }
        else {
            this.expressionMap.groupBys = [];
        }
        return this;
    };
    /**
     * Adds GROUP BY condition in the query builder.
     */
    SelectQueryBuilder.prototype.addGroupBy = function (groupBy) {
        this.expressionMap.groupBys.push(groupBy);
        return this;
    };
    /**
     * Sets ORDER BY condition in the query builder.
     * If you had previously ORDER BY expression defined,
     * calling this function will override previously set ORDER BY conditions.
     */
    SelectQueryBuilder.prototype.orderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (order !== undefined && order !== "ASC" && order !== "DESC")
            throw new Error("SelectQueryBuilder.addOrderBy \"order\" can accept only \"ASC\" and \"DESC\" values.");
        if (nulls !== undefined && nulls !== "NULLS FIRST" && nulls !== "NULLS LAST")
            throw new Error("SelectQueryBuilder.addOrderBy \"nulls\" can accept only \"NULLS FIRST\" and \"NULLS LAST\" values.");
        if (sort) {
            if (sort instanceof Object) {
                this.expressionMap.orderBys = sort;
            }
            else {
                if (nulls) {
                    this.expressionMap.orderBys = (_a = {}, _a[sort] = { order: order, nulls: nulls }, _a);
                }
                else {
                    this.expressionMap.orderBys = (_b = {}, _b[sort] = order, _b);
                }
            }
        }
        else {
            this.expressionMap.orderBys = {};
        }
        return this;
        var _a, _b;
    };
    /**
     * Adds ORDER BY condition in the query builder.
     */
    SelectQueryBuilder.prototype.addOrderBy = function (sort, order, nulls) {
        if (order === void 0) { order = "ASC"; }
        if (order !== undefined && order !== "ASC" && order !== "DESC")
            throw new Error("SelectQueryBuilder.addOrderBy \"order\" can accept only \"ASC\" and \"DESC\" values.");
        if (nulls !== undefined && nulls !== "NULLS FIRST" && nulls !== "NULLS LAST")
            throw new Error("SelectQueryBuilder.addOrderBy \"nulls\" can accept only \"NULLS FIRST\" and \"NULLS LAST\" values.");
        if (nulls) {
            this.expressionMap.orderBys[sort] = { order: order, nulls: nulls };
        }
        else {
            this.expressionMap.orderBys[sort] = order;
        }
        return this;
    };
    /**
     * Set's LIMIT - maximum number of rows to be selected.
     * NOTE that it may not work as you expect if you are using joins.
     * If you want to implement pagination, and you are having join in your query,
     * then use instead take method instead.
     */
    SelectQueryBuilder.prototype.limit = function (limit) {
        this.expressionMap.limit = this.normalizeNumber(limit);
        if (this.expressionMap.limit !== undefined && isNaN(this.expressionMap.limit))
            throw new Error("Provided \"limit\" value is not a number. Please provide a numeric value.");
        return this;
    };
    /**
     * Set's OFFSET - selection offset.
     * NOTE that it may not work as you expect if you are using joins.
     * If you want to implement pagination, and you are having join in your query,
     * then use instead skip method instead.
     */
    SelectQueryBuilder.prototype.offset = function (offset) {
        this.expressionMap.offset = this.normalizeNumber(offset);
        if (this.expressionMap.offset !== undefined && isNaN(this.expressionMap.offset))
            throw new Error("Provided \"offset\" value is not a number. Please provide a numeric value.");
        return this;
    };
    /**
     * Sets maximal number of entities to take.
     */
    SelectQueryBuilder.prototype.take = function (take) {
        this.expressionMap.take = this.normalizeNumber(take);
        if (this.expressionMap.take !== undefined && isNaN(this.expressionMap.take))
            throw new Error("Provided \"take\" value is not a number. Please provide a numeric value.");
        return this;
    };
    /**
     * Sets number of entities to skip.
     */
    SelectQueryBuilder.prototype.skip = function (skip) {
        this.expressionMap.skip = this.normalizeNumber(skip);
        if (this.expressionMap.skip !== undefined && isNaN(this.expressionMap.skip))
            throw new Error("Provided \"skip\" value is not a number. Please provide a numeric value.");
        return this;
    };
    /**
     * Sets locking mode.
     */
    SelectQueryBuilder.prototype.setLock = function (lockMode, lockVersion) {
        this.expressionMap.lockMode = lockMode;
        this.expressionMap.lockVersion = lockVersion;
        return this;
    };
    /**
     * Gets first raw result returned by execution of generated query builder sql.
     */
    SelectQueryBuilder.prototype.getRawOne = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawMany()];
                    case 1: return [2 /*return*/, (_a.sent())[0]];
                }
            });
        });
    };
    /**
     * Gets all raw results returned by execution of generated query builder sql.
     */
    SelectQueryBuilder.prototype.getRawMany = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.expressionMap.lockMode === "optimistic")
                            throw new OptimisticLockCanNotBeUsedError();
                        this.expressionMap.queryEntity = false;
                        queryRunner = this.obtainQueryRunner();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 6]);
                        return [4 /*yield*/, this.loadRawResults(queryRunner)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.release()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes sql generated by query builder and returns object with raw results and entities created from them.
     */
    SelectQueryBuilder.prototype.getRawAndEntities = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.obtainQueryRunner();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 6]);
                        this.expressionMap.queryEntity = true;
                        return [4 /*yield*/, this.executeEntitiesAndRawResults(queryRunner)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.release()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets single entity returned by execution of generated query builder sql.
     */
    SelectQueryBuilder.prototype.getOne = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, result, metadata, actualVersion, actualVersion;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawAndEntities()];
                    case 1:
                        results = _a.sent();
                        result = results.entities[0];
                        if (result && this.expressionMap.lockMode === "optimistic" && this.expressionMap.lockVersion) {
                            metadata = this.expressionMap.mainAlias.metadata;
                            if (this.expressionMap.lockVersion instanceof Date) {
                                actualVersion = result[metadata.updateDateColumn.propertyName];
                                if (actualVersion.getTime() !== this.expressionMap.lockVersion.getTime())
                                    throw new OptimisticLockVersionMismatchError(metadata.name, this.expressionMap.lockVersion, actualVersion);
                            }
                            else {
                                actualVersion = result[metadata.versionColumn.propertyName];
                                if (actualVersion !== this.expressionMap.lockVersion)
                                    throw new OptimisticLockVersionMismatchError(metadata.name, this.expressionMap.lockVersion, actualVersion);
                            }
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Gets entities returned by execution of generated query builder sql.
     */
    SelectQueryBuilder.prototype.getMany = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.expressionMap.lockMode === "optimistic")
                            throw new OptimisticLockCanNotBeUsedError();
                        return [4 /*yield*/, this.getRawAndEntities()];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results.entities];
                }
            });
        });
    };
    /**
     * Gets count - number of entities selected by sql generated by this query builder.
     * Count excludes all limitations set by setFirstResult and setMaxResults methods call.
     */
    SelectQueryBuilder.prototype.getCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.expressionMap.lockMode === "optimistic")
                            throw new OptimisticLockCanNotBeUsedError();
                        queryRunner = this.obtainQueryRunner();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 6]);
                        return [4 /*yield*/, this.executeCountQuery(queryRunner)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 5];
                        return [4 /*yield*/, queryRunner.release()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes built SQL query and returns entities and overall entities count (without limitation).
     * This method is useful to build pagination.
     */
    SelectQueryBuilder.prototype.getManyAndCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, entitiesAndRaw, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.expressionMap.lockMode === "optimistic")
                            throw new OptimisticLockCanNotBeUsedError();
                        queryRunner = this.obtainQueryRunner();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 7]);
                        return [4 /*yield*/, this.executeEntitiesAndRawResults(queryRunner)];
                    case 2:
                        entitiesAndRaw = _a.sent();
                        return [4 /*yield*/, this.executeCountQuery(queryRunner)];
                    case 3:
                        count = _a.sent();
                        return [2 /*return*/, [entitiesAndRaw.entities, count]];
                    case 4:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 6];
                        return [4 /*yield*/, queryRunner.release()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes built SQL query and returns raw data stream.
     */
    SelectQueryBuilder.prototype.stream = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, sql, parameters, queryRunner, releaseFn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.expressionMap.queryEntity = false;
                        _a = this.getQueryAndParameters(), sql = _a[0], parameters = _a[1];
                        queryRunner = this.obtainQueryRunner();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, , 2, 5]);
                        releaseFn = function () {
                            if (queryRunner !== _this.queryRunner) // means we created our own query runner
                                return queryRunner.release();
                            return;
                        };
                        return [2 /*return*/, queryRunner.stream(sql, parameters, releaseFn, releaseFn)];
                    case 2:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 4];
                        return [4 /*yield*/, queryRunner.release()];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables or disables query result caching.
     */
    SelectQueryBuilder.prototype.cache = function (enabledOrMillisecondsOrId, maybeMilliseconds) {
        if (typeof enabledOrMillisecondsOrId === "boolean") {
            this.expressionMap.cache = enabledOrMillisecondsOrId;
        }
        else if (typeof enabledOrMillisecondsOrId === "number") {
            this.expressionMap.cache = true;
            this.expressionMap.cacheDuration = enabledOrMillisecondsOrId;
        }
        else if (typeof enabledOrMillisecondsOrId === "string" || typeof enabledOrMillisecondsOrId === "number") {
            this.expressionMap.cache = true;
            this.expressionMap.cacheId = enabledOrMillisecondsOrId;
        }
        if (maybeMilliseconds) {
            this.expressionMap.cacheDuration = maybeMilliseconds;
        }
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    SelectQueryBuilder.prototype.join = function (direction, entityOrProperty, aliasName, condition, parameters, mapToProperty, isMappingMany) {
        this.setParameters(parameters || {});
        var joinAttribute = new JoinAttribute(this.connection, this.expressionMap);
        joinAttribute.direction = direction;
        joinAttribute.mapToProperty = mapToProperty;
        joinAttribute.isMappingMany = isMappingMany;
        joinAttribute.entityOrProperty = entityOrProperty; // relationName
        joinAttribute.condition = condition; // joinInverseSideCondition
        // joinAttribute.junctionAlias = joinAttribute.relation.isOwning ? parentAlias + "_" + destinationTableAlias : destinationTableAlias + "_" + parentAlias;
        this.expressionMap.joinAttributes.push(joinAttribute);
        if (joinAttribute.metadata) {
            // todo: find and set metadata right there?
            joinAttribute.alias = this.expressionMap.createAlias({
                type: "join",
                name: aliasName,
                metadata: joinAttribute.metadata
            });
            if (joinAttribute.relation && joinAttribute.relation.junctionEntityMetadata) {
                this.expressionMap.createAlias({
                    type: "join",
                    name: joinAttribute.junctionAlias,
                    metadata: joinAttribute.relation.junctionEntityMetadata
                });
            }
        }
        else {
            var subQuery = "";
            if (entityOrProperty instanceof Function) {
                var subQueryBuilder = entityOrProperty(this.subQuery());
                this.setParameters(subQueryBuilder.getParameters());
                subQuery = subQueryBuilder.getQuery();
            }
            else {
                subQuery = entityOrProperty;
            }
            var isSubQuery = entityOrProperty instanceof Function || entityOrProperty.substr(0, 1) === "(" && entityOrProperty.substr(-1) === ")";
            joinAttribute.alias = this.expressionMap.createAlias({
                type: "join",
                name: aliasName,
                tablePath: isSubQuery === false ? entityOrProperty : undefined,
                subQuery: isSubQuery === true ? subQuery : undefined,
            });
        }
    };
    /**
     * Creates "SELECT FROM" part of SQL query.
     */
    SelectQueryBuilder.prototype.createSelectExpression = function () {
        var _this = this;
        if (!this.expressionMap.mainAlias)
            throw new Error("Cannot build query because main alias is not set (call qb#from method)");
        // todo throw exception if selects or from is missing
        var allSelects = [];
        var excludedSelects = [];
        if (this.expressionMap.mainAlias.hasMetadata) {
            var metadata = this.expressionMap.mainAlias.metadata;
            allSelects.push.apply(allSelects, this.buildEscapedEntityColumnSelects(this.expressionMap.mainAlias.name, metadata));
            excludedSelects.push.apply(excludedSelects, this.findEntityColumnSelects(this.expressionMap.mainAlias.name, metadata));
        }
        // add selects from joins
        this.expressionMap.joinAttributes
            .forEach(function (join) {
            if (join.metadata) {
                allSelects.push.apply(allSelects, _this.buildEscapedEntityColumnSelects(join.alias.name, join.metadata));
                excludedSelects.push.apply(excludedSelects, _this.findEntityColumnSelects(join.alias.name, join.metadata));
            }
            else {
                var hasMainAlias = _this.expressionMap.selects.some(function (select) { return select.selection === join.alias.name; });
                if (hasMainAlias) {
                    allSelects.push({ selection: _this.escape(join.alias.name) + ".*" });
                    var excludedSelect = _this.expressionMap.selects.find(function (select) { return select.selection === join.alias.name; });
                    excludedSelects.push(excludedSelect);
                }
            }
        });
        if (!this.expressionMap.ignoreParentTablesJoins && this.expressionMap.mainAlias.hasMetadata) {
            var metadata = this.expressionMap.mainAlias.metadata;
            if (metadata.parentEntityMetadata && metadata.parentEntityMetadata.inheritanceType === "class-table" && metadata.parentIdColumns) {
                var alias_1 = "parentIdColumn_" + metadata.parentEntityMetadata.tableName;
                metadata.parentEntityMetadata.columns.forEach(function (column) {
                    // TODO implement partial select
                    allSelects.push({ selection: _this.escape(alias_1) + "." + _this.escape(column.databaseName), aliasName: alias_1 + "_" + column.databaseName });
                });
            }
        }
        // add selects from relation id joins
        // this.relationIdAttributes.forEach(relationIdAttr => {
        // });
        /*if (this.enableRelationIdValues) {
         const parentMetadata = this.aliasMap.getEntityMetadataByAlias(this.aliasMap.mainAlias);
         if (!parentMetadata)
         throw new Error("Cannot get entity metadata for the given alias " + this.aliasMap.mainAlias.name);

         const metadata = this.connection.entityMetadatas.findByTarget(this.aliasMap.mainAlias.target);
         metadata.manyToManyRelations.forEach(relation => {

         const junctionMetadata = relation.junctionEntityMetadata;
         junctionMetadata.columns.forEach(column => {
         const select = ea(this.aliasMap.mainAlias.name + "_" + junctionMetadata.table.name + "_ids") + "." +
         ec(column.name) + " AS " +
         ea(this.aliasMap.mainAlias.name + "_" + relation.name + "_ids_" + column.name);
         allSelects.push(select);
         });
         });
         }*/
        // add all other selects
        this.expressionMap.selects
            .filter(function (select) { return excludedSelects.indexOf(select) === -1; })
            .forEach(function (select) { return allSelects.push({ selection: _this.replacePropertyNames(select.selection), aliasName: select.aliasName }); });
        // if still selection is empty, then simply set it to all (*)
        if (allSelects.length === 0)
            allSelects.push({ selection: "*" });
        var lock = "";
        if (this.connection.driver instanceof SqlServerDriver) {
            switch (this.expressionMap.lockMode) {
                case "pessimistic_read":
                    lock = " WITH (HOLDLOCK, ROWLOCK)";
                    break;
                case "pessimistic_write":
                    lock = " WITH (UPDLOCK, ROWLOCK)";
                    break;
            }
        }
        // create a selection query
        var froms = this.expressionMap.aliases
            .filter(function (alias) { return alias.type === "from" && (alias.tablePath || alias.subQuery); })
            .map(function (alias) {
            if (alias.subQuery)
                return alias.subQuery + " " + _this.escape(alias.name);
            return _this.getTableName(alias.tablePath) + " " + _this.escape(alias.name);
        });
        var selection = allSelects.map(function (select) { return select.selection + (select.aliasName ? " AS " + _this.escape(select.aliasName) : ""); }).join(", ");
        if ((this.expressionMap.limit || this.expressionMap.offset) && this.connection.driver instanceof OracleDriver)
            return "SELECT ROWNUM " + this.escape("RN") + "," + selection + " FROM " + froms.join(", ") + lock;
        return "SELECT " + selection + " FROM " + froms.join(", ") + lock;
    };
    /**
     * Creates "JOIN" part of SQL query.
     */
    SelectQueryBuilder.prototype.createJoinExpression = function () {
        // examples:
        // select from owning side
        // qb.select("post")
        //     .leftJoinAndSelect("post.category", "category");
        // select from non-owning side
        // qb.select("category")
        //     .leftJoinAndSelect("category.post", "post");
        var _this = this;
        var joins = this.expressionMap.joinAttributes.map(function (joinAttr) {
            var relation = joinAttr.relation;
            var destinationTableName = joinAttr.tablePath;
            var destinationTableAlias = joinAttr.alias.name;
            var appendedCondition = joinAttr.condition ? " AND (" + joinAttr.condition + ")" : "";
            var parentAlias = joinAttr.parentAlias;
            // if join was build without relation (e.g. without "post.category") then it means that we have direct
            // table to join, without junction table involved. This means we simply join direct table.
            if (!parentAlias || !relation) {
                var destinationJoin = joinAttr.alias.subQuery ? joinAttr.alias.subQuery : _this.getTableName(destinationTableName);
                return " " + joinAttr.direction + " JOIN " + destinationJoin + " " + _this.escape(destinationTableAlias) +
                    (joinAttr.condition ? " ON " + _this.replacePropertyNames(joinAttr.condition) : "");
            }
            // if real entity relation is involved
            if (relation.isManyToOne || relation.isOneToOneOwner) {
                // JOIN `category` `category` ON `category`.`id` = `post`.`categoryId`
                var condition = relation.joinColumns.map(function (joinColumn) {
                    return destinationTableAlias + "." + joinColumn.referencedColumn.propertyPath + "=" +
                        parentAlias + "." + relation.propertyPath + "." + joinColumn.referencedColumn.propertyPath;
                }).join(" AND ");
                return " " + joinAttr.direction + " JOIN " + _this.getTableName(destinationTableName) + " " + _this.escape(destinationTableAlias) + " ON " + _this.replacePropertyNames(condition + appendedCondition);
            }
            else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                // JOIN `post` `post` ON `post`.`categoryId` = `category`.`id`
                var condition = relation.inverseRelation.joinColumns.map(function (joinColumn) {
                    return destinationTableAlias + "." + relation.inverseRelation.propertyPath + "." + joinColumn.referencedColumn.propertyPath + "=" +
                        parentAlias + "." + joinColumn.referencedColumn.propertyPath;
                }).join(" AND ");
                return " " + joinAttr.direction + " JOIN " + _this.getTableName(destinationTableName) + " " + _this.escape(destinationTableAlias) + " ON " + _this.replacePropertyNames(condition + appendedCondition);
            }
            else { // means many-to-many
                var junctionTableName = relation.junctionEntityMetadata.tablePath;
                var junctionAlias_1 = joinAttr.junctionAlias;
                var junctionCondition = "", destinationCondition = "";
                if (relation.isOwning) {
                    junctionCondition = relation.joinColumns.map(function (joinColumn) {
                        // `post_category`.`postId` = `post`.`id`
                        return junctionAlias_1 + "." + joinColumn.propertyPath + "=" + parentAlias + "." + joinColumn.referencedColumn.propertyPath;
                    }).join(" AND ");
                    destinationCondition = relation.inverseJoinColumns.map(function (joinColumn) {
                        // `category`.`id` = `post_category`.`categoryId`
                        return destinationTableAlias + "." + joinColumn.referencedColumn.propertyPath + "=" + junctionAlias_1 + "." + joinColumn.propertyPath;
                    }).join(" AND ");
                }
                else {
                    junctionCondition = relation.inverseRelation.inverseJoinColumns.map(function (joinColumn) {
                        // `post_category`.`categoryId` = `category`.`id`
                        return junctionAlias_1 + "." + joinColumn.propertyPath + "=" + parentAlias + "." + joinColumn.referencedColumn.propertyPath;
                    }).join(" AND ");
                    destinationCondition = relation.inverseRelation.joinColumns.map(function (joinColumn) {
                        // `post`.`id` = `post_category`.`postId`
                        return destinationTableAlias + "." + joinColumn.referencedColumn.propertyPath + "=" + junctionAlias_1 + "." + joinColumn.propertyPath;
                    }).join(" AND ");
                }
                return " " + joinAttr.direction + " JOIN " + _this.getTableName(junctionTableName) + " " + _this.escape(junctionAlias_1) + " ON " + _this.replacePropertyNames(junctionCondition) +
                    " " + joinAttr.direction + " JOIN " + _this.getTableName(destinationTableName) + " " + _this.escape(destinationTableAlias) + " ON " + _this.replacePropertyNames(destinationCondition + appendedCondition);
            }
        });
        if (!this.expressionMap.ignoreParentTablesJoins && this.expressionMap.mainAlias.hasMetadata) {
            var metadata = this.expressionMap.mainAlias.metadata;
            if (metadata.parentEntityMetadata && metadata.parentEntityMetadata.inheritanceType === "class-table" && metadata.parentIdColumns) {
                var alias_2 = "parentIdColumn_" + metadata.parentEntityMetadata.tableName;
                var condition = metadata.parentIdColumns.map(function (parentIdColumn) {
                    return _this.expressionMap.mainAlias.name + "." + parentIdColumn.propertyPath + " = " + _this.escape(alias_2) + "." + _this.escape(parentIdColumn.referencedColumn.propertyPath);
                }).join(" AND ");
                var join = " JOIN " + this.getTableName(metadata.parentEntityMetadata.tablePath) + " " + this.escape(alias_2) + " ON " + this.replacePropertyNames(condition);
                joins.push(join);
            }
        }
        return joins.join(" ");
    };
    /**
     * Creates "GROUP BY" part of SQL query.
     */
    SelectQueryBuilder.prototype.createGroupByExpression = function () {
        if (!this.expressionMap.groupBys || !this.expressionMap.groupBys.length)
            return "";
        return " GROUP BY " + this.replacePropertyNames(this.expressionMap.groupBys.join(", "));
    };
    /**
     * Creates "ORDER BY" part of SQL query.
     */
    SelectQueryBuilder.prototype.createOrderByExpression = function () {
        var _this = this;
        var orderBys = this.expressionMap.allOrderBys;
        if (Object.keys(orderBys).length > 0)
            return " ORDER BY " + Object.keys(orderBys)
                .map(function (columnName) {
                if (typeof orderBys[columnName] === "string") {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName];
                }
                else {
                    return _this.replacePropertyNames(columnName) + " " + orderBys[columnName].order + " " + orderBys[columnName].nulls;
                }
            })
                .join(", ");
        return "";
    };
    /**
     * Creates "LIMIT" and "OFFSET" parts of SQL query for Oracle database.
     */
    SelectQueryBuilder.prototype.createLimitOffsetOracleSpecificExpression = function (sql) {
        if ((this.expressionMap.offset || this.expressionMap.limit) && this.connection.driver instanceof OracleDriver) {
            sql = "SELECT * FROM (" + sql + ") WHERE ";
            if (this.expressionMap.offset) {
                sql += this.escape("RN") + " >= " + this.expressionMap.offset;
            }
            if (this.expressionMap.limit) {
                sql += (this.expressionMap.offset ? " AND " : "") + this.escape("RN") + " <= " + ((this.expressionMap.offset || 0) + this.expressionMap.limit);
            }
        }
        return sql;
    };
    /**
     * Creates "LIMIT" and "OFFSET" parts of SQL query.
     */
    SelectQueryBuilder.prototype.createLimitOffsetExpression = function () {
        if (this.connection.driver instanceof OracleDriver)
            return "";
        // in the case if nothing is joined in the query builder we don't need to make two requests to get paginated results
        // we can use regular limit / offset, that's why we add offset and limit construction here based on skip and take values
        var offset = this.expressionMap.offset, limit = this.expressionMap.limit;
        if (!offset && !limit && this.expressionMap.joinAttributes.length === 0) {
            offset = this.expressionMap.skip;
            limit = this.expressionMap.take;
        }
        if (this.connection.driver instanceof SqlServerDriver) {
            if (limit && offset)
                return " OFFSET " + offset + " ROWS FETCH NEXT " + limit + " ROWS ONLY";
            if (limit)
                return " OFFSET 0 ROWS FETCH NEXT " + limit + " ROWS ONLY";
            if (offset)
                return " OFFSET " + offset + " ROWS";
        }
        else if (this.connection.driver instanceof MysqlDriver) {
            if (limit && offset)
                return " LIMIT " + limit + " OFFSET " + offset;
            if (limit)
                return " LIMIT " + limit;
            if (offset)
                throw new OffsetWithoutLimitNotSupportedError("MySQL");
        }
        else if (this.connection.driver instanceof AbstractSqliteDriver) {
            if (limit && offset)
                return " LIMIT " + limit + " OFFSET " + offset;
            if (limit)
                return " LIMIT " + limit;
            if (offset)
                return " LIMIT -1 OFFSET " + offset;
        }
        else {
            if (limit && offset)
                return " LIMIT " + limit + " OFFSET " + offset;
            if (limit)
                return " LIMIT " + limit;
            if (offset)
                return " OFFSET " + offset;
        }
        return "";
    };
    /**
     * Creates "LOCK" part of SQL query.
     */
    SelectQueryBuilder.prototype.createLockExpression = function () {
        switch (this.expressionMap.lockMode) {
            case "pessimistic_read":
                if (this.connection.driver instanceof MysqlDriver) {
                    return " LOCK IN SHARE MODE";
                }
                else if (this.connection.driver instanceof PostgresDriver) {
                    return " FOR SHARE";
                }
                else if (this.connection.driver instanceof SqlServerDriver) {
                    return "";
                }
                else {
                    throw new LockNotSupportedOnGivenDriverError();
                }
            case "pessimistic_write":
                if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof PostgresDriver) {
                    return " FOR UPDATE";
                }
                else if (this.connection.driver instanceof SqlServerDriver) {
                    return "";
                }
                else {
                    throw new LockNotSupportedOnGivenDriverError();
                }
            default:
                return "";
        }
    };
    /**
     * Creates "HAVING" part of SQL query.
     */
    SelectQueryBuilder.prototype.createHavingExpression = function () {
        var _this = this;
        if (!this.expressionMap.havings || !this.expressionMap.havings.length)
            return "";
        var conditions = this.expressionMap.havings.map(function (having, index) {
            switch (having.type) {
                case "and":
                    return (index > 0 ? "AND " : "") + _this.replacePropertyNames(having.condition);
                case "or":
                    return (index > 0 ? "OR " : "") + _this.replacePropertyNames(having.condition);
                default:
                    return _this.replacePropertyNames(having.condition);
            }
        }).join(" ");
        if (!conditions.length)
            return "";
        return " HAVING " + conditions;
    };
    SelectQueryBuilder.prototype.buildEscapedEntityColumnSelects = function (aliasName, metadata) {
        var _this = this;
        var hasMainAlias = this.expressionMap.selects.some(function (select) { return select.selection === aliasName; });
        var columns = [];
        if (hasMainAlias) {
            columns.push.apply(columns, metadata.columns.filter(function (column) { return column.isSelect === true; }));
        }
        columns.push.apply(columns, metadata.columns.filter(function (column) {
            return _this.expressionMap.selects.some(function (select) { return select.selection === aliasName + "." + column.propertyName; });
        }));
        // if user used partial selection and did not select some primary columns which are required to be selected
        // we select those primary columns and mark them as "virtual". Later virtual column values will be removed from final entity
        // to make entity contain exactly what user selected
        var nonSelectedPrimaryColumns = this.expressionMap.queryEntity ? metadata.primaryColumns.filter(function (primaryColumn) { return columns.indexOf(primaryColumn) === -1; }) : [];
        var allColumns = columns.concat(nonSelectedPrimaryColumns);
        return allColumns.map(function (column) {
            var selection = _this.expressionMap.selects.find(function (select) { return select.selection === aliasName + "." + column.propertyName; });
            return {
                selection: _this.escape(aliasName) + "." + _this.escape(column.databaseName),
                aliasName: selection && selection.aliasName ? selection.aliasName : aliasName + "_" + column.databaseName,
                // todo: need to keep in mind that custom selection.aliasName breaks hydrator. fix it later!
                virtual: selection ? selection.virtual === true : (hasMainAlias ? false : true),
            };
        });
    };
    SelectQueryBuilder.prototype.findEntityColumnSelects = function (aliasName, metadata) {
        var mainSelect = this.expressionMap.selects.find(function (select) { return select.selection === aliasName; });
        if (mainSelect)
            return [mainSelect];
        return this.expressionMap.selects.filter(function (select) {
            return metadata.columns.some(function (column) { return select.selection === aliasName + "." + column.propertyName; });
        });
    };
    SelectQueryBuilder.prototype.executeCountQuery = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var mainAlias, metadata, distinctAlias, countSql, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.expressionMap.queryEntity = false;
                        mainAlias = this.expressionMap.mainAlias.name;
                        metadata = this.expressionMap.mainAlias.metadata;
                        distinctAlias = this.escape(mainAlias);
                        countSql = "";
                        if (metadata.hasMultiplePrimaryKeys) {
                            if (this.connection.driver instanceof AbstractSqliteDriver) {
                                countSql = "COUNT(DISTINCT(" + metadata.primaryColumns.map(function (primaryColumn, index) {
                                    var propertyName = _this.escape(primaryColumn.databaseName);
                                    return distinctAlias + "." + propertyName;
                                }).join(" || ") + ")) as \"cnt\"";
                            }
                            else {
                                countSql = "COUNT(DISTINCT(CONCAT(" + metadata.primaryColumns.map(function (primaryColumn, index) {
                                    var propertyName = _this.escape(primaryColumn.databaseName);
                                    return distinctAlias + "." + propertyName;
                                }).join(", ") + "))) as \"cnt\"";
                            }
                        }
                        else {
                            countSql = "COUNT(DISTINCT(" + metadata.primaryColumns.map(function (primaryColumn, index) {
                                var propertyName = _this.escape(primaryColumn.databaseName);
                                return distinctAlias + "." + propertyName;
                            }).join(", ") + ")) as \"cnt\"";
                        }
                        return [4 /*yield*/, this.clone()
                                .mergeExpressionMap({ ignoreParentTablesJoins: true })
                                .orderBy()
                                .groupBy()
                                .offset(undefined)
                                .limit(undefined)
                                .skip(undefined)
                                .take(undefined)
                                .select(countSql)
                                .loadRawResults(queryRunner)];
                    case 1:
                        results = _a.sent();
                        if (!results || !results[0] || !results[0]["cnt"])
                            return [2 /*return*/, 0];
                        return [2 /*return*/, parseInt(results[0]["cnt"])];
                }
            });
        });
    };
    /**
     * Executes sql generated by query builder and returns object with raw results and entities created from them.
     */
    SelectQueryBuilder.prototype.executeEntitiesAndRawResults = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var metadata, broadcaster, relationIdLoader, relationCountLoader, relationIdMetadataTransformer, relationCountMetadataTransformer, rawResults, entities, _a, selects, orderBys_1, metadata_1, mainAliasName_1, querySelects, condition, parameters_1, ids, areAllNumbers, rawRelationIdResults, rawRelationCountResults, transformer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.expressionMap.mainAlias)
                            throw new Error("Alias is not set. Use \"from\" method to set an alias.");
                        if ((this.expressionMap.lockMode === "pessimistic_read" || this.expressionMap.lockMode === "pessimistic_write") && !queryRunner.isTransactionActive)
                            throw new PessimisticLockTransactionRequiredError();
                        if (this.expressionMap.lockMode === "optimistic") {
                            metadata = this.expressionMap.mainAlias.metadata;
                            if (!metadata.versionColumn && !metadata.updateDateColumn)
                                throw new NoVersionOrUpdateDateColumnError(metadata.name);
                        }
                        broadcaster = new Broadcaster(this.connection);
                        relationIdLoader = new RelationIdLoader(this.connection, queryRunner, this.expressionMap.relationIdAttributes);
                        relationCountLoader = new RelationCountLoader(this.connection, queryRunner, this.expressionMap.relationCountAttributes);
                        relationIdMetadataTransformer = new RelationIdMetadataToAttributeTransformer(this.expressionMap);
                        relationIdMetadataTransformer.transform();
                        relationCountMetadataTransformer = new RelationCountMetadataToAttributeTransformer(this.expressionMap);
                        relationCountMetadataTransformer.transform();
                        rawResults = [], entities = [];
                        if (!((this.expressionMap.skip || this.expressionMap.take) && this.expressionMap.joinAttributes.length > 0)) return [3 /*break*/, 4];
                        _a = this.createOrderByCombinedWithSelectExpression("distinctAlias"), selects = _a[0], orderBys_1 = _a[1];
                        metadata_1 = this.expressionMap.mainAlias.metadata;
                        mainAliasName_1 = this.expressionMap.mainAlias.name;
                        querySelects = metadata_1.primaryColumns.map(function (primaryColumn) {
                            var distinctAlias = _this.escape("distinctAlias");
                            var columnAlias = _this.escape(mainAliasName_1 + "_" + primaryColumn.databaseName);
                            if (!orderBys_1[columnAlias]) // make sure we aren't overriding user-defined order in inverse direction
                                orderBys_1[columnAlias] = "ASC";
                            return distinctAlias + "." + columnAlias + " as \"ids_" + (mainAliasName_1 + "_" + primaryColumn.databaseName) + "\"";
                        });
                        return [4 /*yield*/, new SelectQueryBuilder(this.connection, queryRunner)
                                .select("DISTINCT " + querySelects.join(", "))
                                .addSelect(selects)
                                .from("(" + this.clone().orderBy().groupBy().getQuery() + ")", "distinctAlias")
                                .offset(this.expressionMap.skip)
                                .limit(this.expressionMap.take)
                                .orderBy(orderBys_1)
                                .cache(this.expressionMap.cache ? this.expressionMap.cache : this.expressionMap.cacheId, this.expressionMap.cacheDuration)
                                .setParameters(this.getParameters())
                                .getRawMany()];
                    case 1:
                        rawResults = _b.sent();
                        if (!(rawResults.length > 0)) return [3 /*break*/, 3];
                        condition = "";
                        parameters_1 = {};
                        if (metadata_1.hasMultiplePrimaryKeys) {
                            condition = rawResults.map(function (result, index) {
                                return metadata_1.primaryColumns.map(function (primaryColumn) {
                                    parameters_1["ids_" + index + "_" + primaryColumn.propertyName] = result["ids_" + mainAliasName_1 + "_" + primaryColumn.databaseName];
                                    return mainAliasName_1 + "." + primaryColumn.propertyName + "=:ids_" + index + "_" + primaryColumn.databaseName;
                                }).join(" AND ");
                            }).join(" OR ");
                        }
                        else {
                            ids = rawResults.map(function (result) { return result["ids_" + mainAliasName_1 + "_" + metadata_1.primaryColumns[0].databaseName]; });
                            areAllNumbers = ids.every(function (id) { return typeof id === "number"; });
                            if (areAllNumbers) {
                                // fixes #190. if all numbers then its safe to perform query without parameter
                                condition = mainAliasName_1 + "." + metadata_1.primaryColumns[0].propertyName + " IN (" + ids.join(", ") + ")";
                            }
                            else {
                                parameters_1["ids"] = ids;
                                condition = mainAliasName_1 + "." + metadata_1.primaryColumns[0].propertyName + " IN (:ids)";
                            }
                        }
                        return [4 /*yield*/, this.clone()
                                .mergeExpressionMap({ extraAppendedAndWhereCondition: condition })
                                .setParameters(parameters_1)
                                .loadRawResults(queryRunner)];
                    case 2:
                        rawResults = _b.sent();
                        _b.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.loadRawResults(queryRunner)];
                    case 5:
                        rawResults = _b.sent();
                        _b.label = 6;
                    case 6:
                        if (!(rawResults.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, relationIdLoader.load(rawResults)];
                    case 7:
                        rawRelationIdResults = _b.sent();
                        return [4 /*yield*/, relationCountLoader.load(rawResults)];
                    case 8:
                        rawRelationCountResults = _b.sent();
                        transformer = new RawSqlResultsToEntityTransformer(this.expressionMap, this.connection.driver, rawRelationIdResults, rawRelationCountResults);
                        entities = transformer.transform(rawResults, this.expressionMap.mainAlias);
                        if (!this.expressionMap.mainAlias.hasMetadata) return [3 /*break*/, 10];
                        return [4 /*yield*/, broadcaster.broadcastLoadEventsForAll(this.expressionMap.mainAlias.target, entities)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/, {
                            raw: rawResults,
                            entities: entities,
                        }];
                }
            });
        });
    };
    SelectQueryBuilder.prototype.createOrderByCombinedWithSelectExpression = function (parentAlias) {
        var _this = this;
        // if table has a default order then apply it
        var orderBys = this.expressionMap.allOrderBys;
        var selectString = Object.keys(orderBys)
            .map(function (orderCriteria) {
            if (orderCriteria.indexOf(".") !== -1) {
                var _a = orderCriteria.split("."), aliasName = _a[0], propertyPath = _a[1];
                var alias = _this.expressionMap.findAliasByName(aliasName);
                var column = alias.metadata.findColumnWithPropertyName(propertyPath);
                return _this.escape(parentAlias) + "." + _this.escape(aliasName + "_" + column.databaseName);
            }
            else {
                if (_this.expressionMap.selects.find(function (select) { return select.selection === orderCriteria || select.aliasName === orderCriteria; }))
                    return _this.escape(parentAlias) + "." + orderCriteria;
                return "";
            }
        })
            .join(", ");
        var orderByObject = {};
        Object.keys(orderBys).forEach(function (orderCriteria) {
            if (orderCriteria.indexOf(".") !== -1) {
                var _a = orderCriteria.split("."), aliasName = _a[0], propertyPath = _a[1];
                var alias = _this.expressionMap.findAliasByName(aliasName);
                var column = alias.metadata.findColumnWithPropertyName(propertyPath);
                orderByObject[_this.escape(parentAlias) + "." + _this.escape(aliasName + "_" + column.databaseName)] = orderBys[orderCriteria];
            }
            else {
                if (_this.expressionMap.selects.find(function (select) { return select.selection === orderCriteria || select.aliasName === orderCriteria; })) {
                    orderByObject[_this.escape(parentAlias) + "." + orderCriteria] = orderBys[orderCriteria];
                }
                else {
                    orderByObject[orderCriteria] = orderBys[orderCriteria];
                }
            }
        });
        return [selectString, orderByObject];
    };
    /**
     * Loads raw results from the database.
     */
    SelectQueryBuilder.prototype.loadRawResults = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, sql, parameters, cacheOptions, savedQueryResultCacheOptions, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.getQueryAndParameters(), sql = _a[0], parameters = _a[1];
                        cacheOptions = typeof this.connection.options.cache === "object" ? this.connection.options.cache : {};
                        savedQueryResultCacheOptions = undefined;
                        if (!(this.connection.queryResultCache && (this.expressionMap.cache || cacheOptions.alwaysEnabled))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connection.queryResultCache.getFromCache({
                                identifier: this.expressionMap.cacheId,
                                query: this.getSql(),
                                duration: this.expressionMap.cacheDuration || cacheOptions.duration || 1000
                            }, queryRunner)];
                    case 1:
                        savedQueryResultCacheOptions = _b.sent();
                        if (savedQueryResultCacheOptions && !this.connection.queryResultCache.isExpired(savedQueryResultCacheOptions))
                            return [2 /*return*/, JSON.parse(savedQueryResultCacheOptions.result)];
                        _b.label = 2;
                    case 2: return [4 /*yield*/, queryRunner.query(sql, parameters)];
                    case 3:
                        results = _b.sent();
                        if (!(this.connection.queryResultCache && (this.expressionMap.cache || cacheOptions.alwaysEnabled))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.connection.queryResultCache.storeInCache({
                                identifier: this.expressionMap.cacheId,
                                query: this.getSql(),
                                time: new Date().getTime(),
                                duration: this.expressionMap.cacheDuration || cacheOptions.duration || 1000,
                                result: JSON.stringify(results)
                            }, savedQueryResultCacheOptions, queryRunner)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Merges into expression map given expression map properties.
     */
    SelectQueryBuilder.prototype.mergeExpressionMap = function (expressionMap) {
        Object.assign(this.expressionMap, expressionMap);
        return this;
    };
    /**
     * Normalizes a give number - converts to int if possible.
     */
    SelectQueryBuilder.prototype.normalizeNumber = function (num) {
        if (typeof num === "number" || num === undefined || num === null)
            return num;
        return Number(num);
    };
    /**
     * Creates a query builder used to execute sql queries inside this query builder.
     */
    SelectQueryBuilder.prototype.obtainQueryRunner = function () {
        return this.queryRunner || this.connection.createQueryRunner("slave");
    };
    return SelectQueryBuilder;
}(QueryBuilder));
export { SelectQueryBuilder };

//# sourceMappingURL=SelectQueryBuilder.js.map
