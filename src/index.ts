import { isArray, isEmpty, isUndefined, replace, toUpper } from "lodash";
import mssql from "mssql/msnodesqlv8";

type Equivalent = "=" | "<" | ">";
type WhereEquivalent = Equivalent | "LIKE" | "IN";
export type Sort = "DESC" | "ASC";

export type KeyValueType = string | number | boolean;
export interface KeyValue {
  [key: string]: KeyValueType;
}

interface Input {
  key: string;
  value: KeyValueType;
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
  private static selectStatement: string = "";
  private static innerJoinStatement: string = "";
  private static whereStatement: string = "";
  private static offsetStatement: string = "";
  private static orderByStatement: string = "";
  private static tableName: string = "";

  /** Db stuff */
  public static transaction: mssql.Transaction;
  private static request: mssql.Request;
  private static inputs: Input[] = [];

  /**
   * Initialize transcation pool
   */
  public static async initializeTransaction(
    connectionPool: mssql.ConnectionPool,
  ) {
    this.finalize();
    const transaction = await new mssql.Transaction(connectionPool).begin();

    this.transaction = transaction;
    this.request = new mssql.Request(transaction);

    return this;
  }

  /**
   * Initialize request pool
   */
  public static async initializeRequest(connectionPool: mssql.ConnectionPool) {
    this.finalize();
    this.request = new mssql.Request(connectionPool);

    return this;
  }

  /**
   * Clear all parameters
   */
  private static finalize() {
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
  }

  /**
   *
   * @param key - Column name
   * @param value - Value for column
   */
  private static addInput(key: string, value: KeyValueType) {
    const isInputExists = this.inputs.find((input) => input.key === key);

    if (isUndefined(isInputExists)) {
      this.inputs.push({
        key,
        value,
      });

      this.request.input(key, value);
    } else {
      this.request.input(key, value);
    }
  }

  /**
   * Set the table name
   * @param tableName - Name of the table
   */
  public static table(tableName: string): typeof Database {
    this.tableName = tableName;

    return this;
  }

  /**
   * Provides SQL Select statement
   * @param select - SQL Select statement
   */
  public static select(select: string): typeof Database {
    this.selectStatement = `SELECT ${select} FROM ${this.tableName}`;

    return this;
  }

  /**
   * Provides SQL Delete statement
   */
  public static async delete() {
    const statement = `DELETE FROM ${this.tableName}${this.whereStatement}`;

    try {
      return await this.request.query(statement);
    } catch (e) {
      await this.transaction.rollback();
    } finally {
      this.finalize();
    }
  }

  /**
   * Provides SQL Update statement
   * @param data - Update data
   */
  public static async update(data: KeyValue) {
    let updateStatement: string = "";

    let index = 0;
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      const comma = index < entries.length - 1 ? ", " : "";

      updateStatement += `${key} = @${key}${comma}`;
      this.addInput(key, value);

      ++index;
    }

    const statement = `UPDATE ${this.tableName} SET ${updateStatement}${this.whereStatement}`;

    try {
      return await this.request.query(statement);
    } catch (e) {
      return null;
    } finally {
      this.finalize();
    }
  }

  /**
   * Provides SQL Insert statement and query SQL
   * @param data - Insert data
   */
  public static async insert<T extends IDBIdentify>(
    data: T | T[],
    returnColumnName: string = "",
  ) {
    const arrayData = isArray(data) ? data : [data];

    if (arrayData.length === 0) {
      throw new Error("No data to insert.");
    }

    const dbKeys = `(${Object.keys(arrayData[0])})`;
    const values: string[] = [];

    arrayData.map((item, index) => {
      const valueKeys = Object.keys(item).map((key) => "@" + key + "_" + index);

      Object.values(item).map((value, index) => {
        this.addInput(valueKeys[index].substr(1), value);
      });

      values.push(`(${valueKeys.join(",")})`);
    });

    let statement = `
      INSERT INTO ${this.tableName} ${dbKeys} VALUES ${values.join(",")}
    `;

    if (!isEmpty(returnColumnName)) {
      statement += `;SELECT @${returnColumnName} = SCOPE_IDENTITY()`;
      this.request.output(returnColumnName, mssql.Int);
    }

    try {
      return await this.request.query(statement);
    } catch (e) {
      // await this.transaction.rollback();

      throw new Error((e as Error).message);
    } finally {
      this.finalize();
    }
  }

  /**
   *
   * @param tableName - Table name to join
   * @param columnName1 - First column name
   * @param equivalent - Equivalent
   * @param columName2 - Second column name
   */
  public static innerJoin(
    tableName: string,
    columnName1: string,
    equivalent: Equivalent,
    columName2: string,
  ): typeof Database {
    this.innerJoinStatement += ` INNER JOIN ${tableName} ON ${columnName1} ${equivalent} ${columName2}`;

    return this;
  }

  /**
   * Provides SQL Where statement
   * @param column - Column name
   * @param equivalent - Equivalent
   * @param value - Comparative value
   */
  public static where(
    column: string,
    equivalent: WhereEquivalent,
    value: string | number | boolean,
  ): typeof Database {
    const columnWithoutDot = replace(column, ".", "");

    let sqlWhereStatement = "";

    switch (equivalent) {
      case "IN":
        const values = value.toString().split(",");
        let formattedValue = "";

        values.map((val, index) => {
          const comma = index < values.length - 1 ? ", " : "";
          val = val.trim();

          formattedValue += `@${val}${comma}`;

          this.addInput(val, val);
        });

        sqlWhereStatement = `${column} ${equivalent} (${formattedValue})`;
        break;

      default:
        sqlWhereStatement = `${column} ${equivalent} @${columnWithoutDot}`;
        this.addInput(columnWithoutDot, value);
        break;
    }

    this.whereStatement += isEmpty(this.whereStatement)
      ? ` WHERE ${sqlWhereStatement}`
      : ` AND ${sqlWhereStatement}`;

    return this;
  }

  /**
   * Provides SQL Order By statement
   * @param column - Colun name
   * @param sort - Sort
   */
  public static orderBy(column: string, sort: Sort = "DESC"): typeof Database {
    this.orderByStatement += ` ORDER BY ${column} ${toUpper(sort)}`;

    return this;
  }

  /**
   * Provides selecting case
   * @param argument - Argument
   * @param callbackTrue - Invoked when argument is true
   * @param callbackFalse - Invoked when argument is false
   */
  public static when(
    argument: boolean,
    callbackTrue: (query: typeof Database, argument: boolean) => void,
    callbackFalse?: (query: typeof Database, argument: boolean) => void,
  ) {
    if (argument) callbackTrue(this, argument);
    else if (!argument && typeof callbackFalse === "function")
      callbackFalse(this, argument);

    return this;
  }

  /**
   * Provides SQL Offset statement ONLY FOR ROWS!
   * @param offset - Offset
   * @param countRows - Number of rows
   */
  public static offset(
    offset: number,
    countRows: number = 10,
  ): typeof Database {
    this.offsetStatement = ` OFFSET ${offset} ROWS FETCH FIRST ${countRows} ROWS ONLY`;

    return this;
  }

  public static async get<T>() {
    const statement = `${this.selectStatement}${this.innerJoinStatement}${this.whereStatement}${this.orderByStatement}${this.offsetStatement}`;
    console.log(statement);
    try {
      const response = await this.request.query<T>(statement);

      return response;
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      this.finalize();
    }
  }
}
