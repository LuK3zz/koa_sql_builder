"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var msnodesqlv8_1 = __importDefault(require("mssql/msnodesqlv8"));
var Database = /** @class */ (function () {
    function Database() {
    }
    /**
     * Initialize transcation pool
     */
    Database.initializeTransaction = function (connectionPool) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.finalize();
                        return [4 /*yield*/, new msnodesqlv8_1.default.Transaction(connectionPool).begin()];
                    case 1:
                        transaction = _a.sent();
                        this.transaction = transaction;
                        this.request = new msnodesqlv8_1.default.Request(transaction);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Initialize request pool
     */
    Database.initializeRequest = function (connectionPool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.finalize();
                this.request = new msnodesqlv8_1.default.Request(connectionPool);
                return [2 /*return*/, this];
            });
        });
    };
    /**
     * Clear all parameters
     */
    Database.finalize = function () {
        this.selectStatement = "";
        this.innerJoinStatement = "";
        this.whereStatement = "";
        this.offsetStatement = "";
        this.orderByStatement = "";
        this.tableName = "";
        this.inputs = [];
        if (this.request) {
            this.request.parameters = {};
        }
    };
    /**
     *
     * @param key - Column name
     * @param value - Value for column
     */
    Database.addInput = function (key, value) {
        var isInputExists = this.inputs.find(function (input) { return input.key === key; });
        if ((0, lodash_1.isUndefined)(isInputExists)) {
            this.inputs.push({
                key: key,
                value: value,
            });
            this.request.input(key, value);
        }
        else {
            this.request.input(key, value);
        }
    };
    /**
     * Set the table name
     * @param tableName - Name of the table
     */
    Database.table = function (tableName) {
        this.tableName = tableName;
        return this;
    };
    /**
     * Provides SQL Select statement
     * @param select - SQL Select statement
     */
    Database.select = function (select) {
        this.selectStatement = "SELECT ".concat(select, " FROM ").concat(this.tableName);
        return this;
    };
    /**
     * Provides SQL Delete statement
     */
    Database.delete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statement, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        statement = "DELETE FROM ".concat(this.tableName).concat(this.whereStatement);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 5, 6]);
                        return [4 /*yield*/, this.request.query(statement)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        return [4 /*yield*/, this.transaction.rollback()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        this.finalize();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Provides SQL Update statement
     * @param data - Update data
     */
    Database.update = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var updateStatement, index, entries, _i, entries_1, _a, key, value, comma, statement, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        updateStatement = "";
                        index = 0;
                        entries = Object.entries(data);
                        for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                            _a = entries_1[_i], key = _a[0], value = _a[1];
                            comma = index < entries.length - 1 ? ", " : "";
                            updateStatement += "".concat(key, " = @").concat(key).concat(comma);
                            this.addInput(key, value);
                            ++index;
                        }
                        statement = "UPDATE ".concat(this.tableName, " SET ").concat(updateStatement).concat(this.whereStatement);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.request.query(statement)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        e_2 = _b.sent();
                        return [2 /*return*/, null];
                    case 4:
                        this.finalize();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Provides SQL Insert statement and query SQL
     * @param data - Insert data
     */
    Database.insert = function (data, returnColumnName) {
        if (returnColumnName === void 0) { returnColumnName = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var arrayData, dbKeys, values, statement, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        arrayData = (0, lodash_1.isArray)(data) ? data : [data];
                        if (arrayData.length === 0) {
                            throw new Error("No data to insert.");
                        }
                        dbKeys = "(".concat(Object.keys(arrayData[0]), ")");
                        values = [];
                        arrayData.map(function (item, index) {
                            var valueKeys = Object.keys(item).map(function (key) { return "@" + key + "_" + index; });
                            Object.values(item).map(function (value, index) {
                                _this.addInput(valueKeys[index].substr(1), value);
                            });
                            values.push("(".concat(valueKeys.join(","), ")"));
                        });
                        statement = "\n      INSERT INTO ".concat(this.tableName, " ").concat(dbKeys, " VALUES ").concat(values.join(","), "\n    ");
                        if (!(0, lodash_1.isEmpty)(returnColumnName)) {
                            statement += ";SELECT @".concat(returnColumnName, " = SCOPE_IDENTITY()");
                            this.request.output(returnColumnName, msnodesqlv8_1.default.Int);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.request.query(statement)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_3 = _a.sent();
                        // await this.transaction.rollback();
                        throw new Error(e_3.message);
                    case 4:
                        this.finalize();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param tableName - Table name to join
     * @param columnName1 - First column name
     * @param equivalent - Equivalent
     * @param columName2 - Second column name
     */
    Database.innerJoin = function (tableName, columnName1, equivalent, columName2) {
        this.innerJoinStatement += " INNER JOIN ".concat(tableName, " ON ").concat(columnName1, " ").concat(equivalent, " ").concat(columName2);
        return this;
    };
    /**
     * Provides SQL Where statement
     * @param column - Column name
     * @param equivalent - Equivalent
     * @param value - Comparative value
     */
    Database.where = function (column, equivalent, value) {
        var _this = this;
        var columnWithoutDot = (0, lodash_1.replace)(column, ".", "");
        var sqlWhereStatement = "";
        switch (equivalent) {
            case "IN":
                var values_1 = value.toString().split(",");
                var formattedValue_1 = "";
                values_1.map(function (val, index) {
                    var comma = index < values_1.length - 1 ? ", " : "";
                    val = val.trim();
                    formattedValue_1 += "@".concat(val).concat(comma);
                    _this.addInput(val, val);
                });
                sqlWhereStatement = "".concat(column, " ").concat(equivalent, " (").concat(formattedValue_1, ")");
                break;
            default:
                sqlWhereStatement = "".concat(column, " ").concat(equivalent, " @").concat(columnWithoutDot);
                this.addInput(columnWithoutDot, value);
                break;
        }
        this.whereStatement += (0, lodash_1.isEmpty)(this.whereStatement)
            ? " WHERE ".concat(sqlWhereStatement)
            : " AND ".concat(sqlWhereStatement);
        return this;
    };
    /**
     * Provides SQL Order By statement
     * @param column - Colun name
     * @param sort - Sort
     */
    Database.orderBy = function (column, sort) {
        if (sort === void 0) { sort = "DESC"; }
        this.orderByStatement += " ORDER BY ".concat(column, " ").concat((0, lodash_1.toUpper)(sort));
        return this;
    };
    /**
     * Provides selecting case
     * @param argument - Argument
     * @param callbackTrue - Invoked when argument is true
     * @param callbackFalse - Invoked when argument is false
     */
    Database.when = function (argument, callbackTrue, callbackFalse) {
        if (argument)
            callbackTrue(this, argument);
        else if (!argument && typeof callbackFalse === "function")
            callbackFalse(this, argument);
        return this;
    };
    /**
     * Provides SQL Offset statement ONLY FOR ROWS!
     * @param offset - Offset
     * @param countRows - Number of rows
     */
    Database.offset = function (offset, countRows) {
        if (countRows === void 0) { countRows = 10; }
        this.offsetStatement = " OFFSET ".concat(offset, " ROWS FETCH FIRST ").concat(countRows, " ROWS ONLY");
        return this;
    };
    Database.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var statement, response, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        statement = "".concat(this.selectStatement).concat(this.innerJoinStatement).concat(this.whereStatement).concat(this.orderByStatement).concat(this.offsetStatement);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        return [4 /*yield*/, this.request.query(statement)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        e_4 = _a.sent();
                        console.log(e_4);
                        return [2 /*return*/, null];
                    case 4:
                        this.finalize();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Database.selectStatement = "";
    Database.innerJoinStatement = "";
    Database.whereStatement = "";
    Database.offsetStatement = "";
    Database.orderByStatement = "";
    Database.tableName = "";
    Database.inputs = [];
    return Database;
}());
exports.default = Database;
