import mssql from "mssql/msnodesqlv8";
declare type Equivalent = "=" | "<" | ">";
declare type WhereEquivalent = Equivalent | "LIKE" | "IN";
export declare type Sort = "DESC" | "ASC";
export declare type KeyValueType = string | number | boolean;
export interface KeyValue {
    [key: string]: KeyValueType;
}
interface IDBIdentify {
    d_change_: string;
    s_change_: number;
    change_: number;
}
export interface IDatabase {
    connectionPool: mssql.ConnectionPool;
    transaction: mssql.Transaction;
    request: mssql.Request;
}
export default class Database {
    private static selectStatement;
    private static innerJoinStatement;
    private static whereStatement;
    private static offsetStatement;
    private static orderByStatement;
    private static tableName;
    /** Db stuff */
    static transaction: mssql.Transaction;
    private static request;
    private static inputs;
    /**
     * Initialize transcation pool
     */
    static initializeTransaction(connectionPool: mssql.ConnectionPool): Promise<typeof Database>;
    /**
     * Initialize request pool
     */
    static initializeRequest(connectionPool: mssql.ConnectionPool): Promise<typeof Database>;
    /**
     * Clear all parameters
     */
    private static finalize;
    /**
     *
     * @param key - Column name
     * @param value - Value for column
     */
    private static addInput;
    /**
     * Set the table name
     * @param tableName - Name of the table
     */
    static table(tableName: string): typeof Database;
    /**
     * Provides SQL Select statement
     * @param select - SQL Select statement
     */
    static select(select: string): typeof Database;
    /**
     * Provides SQL Delete statement
     */
    static delete(): Promise<mssql.IResult<any> | undefined>;
    /**
     * Provides SQL Update statement
     * @param data - Update data
     */
    static update(data: KeyValue): Promise<mssql.IResult<any> | null>;
    /**
     * Provides SQL Insert statement and query SQL
     * @param data - Insert data
     */
    static insert<T extends IDBIdentify>(data: T | T[], returnColumnName?: string): Promise<mssql.IResult<any>>;
    /**
     *
     * @param tableName - Table name to join
     * @param columnName1 - First column name
     * @param equivalent - Equivalent
     * @param columName2 - Second column name
     */
    static innerJoin(tableName: string, columnName1: string, equivalent: Equivalent, columName2: string): typeof Database;
    /**
     * Provides SQL Where statement
     * @param column - Column name
     * @param equivalent - Equivalent
     * @param value - Comparative value
     */
    static where(column: string, equivalent: WhereEquivalent, value: string | number | boolean): typeof Database;
    /**
     * Provides SQL Order By statement
     * @param column - Colun name
     * @param sort - Sort
     */
    static orderBy(column: string, sort?: Sort): typeof Database;
    /**
     * Provides selecting case
     * @param argument - Argument
     * @param callbackTrue - Invoked when argument is true
     * @param callbackFalse - Invoked when argument is false
     */
    static when(argument: boolean, callbackTrue: (query: typeof Database, argument: boolean) => void, callbackFalse?: (query: typeof Database, argument: boolean) => void): typeof Database;
    /**
     * Provides SQL Offset statement ONLY FOR ROWS!
     * @param offset - Offset
     * @param countRows - Number of rows
     */
    static offset(offset: number, countRows?: number): typeof Database;
    static get<T>(): Promise<mssql.IResult<T> | null>;
}
export {};
