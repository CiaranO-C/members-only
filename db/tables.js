require("dotenv").config();
const { pool } = require("./pool");
const format = require("pg-format");

function Table(tableName) {
  const name = tableName;
  const queryLimit = 100;

  async function query(sql, params) {
    const { rows } = await pool.query(sql, params);
    return rows;
  }

  async function validateColumns(columns) {
    const rows = await query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = N'${name}'`);
    const validColumns = rows.map((row) => row.column_name);

    if (Array.isArray(columns)) {
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        console.log(columns, col);
        if (validColumns.includes(col)) {
          return true;
        }
      }
    } else {
      if (validColumns.includes(columns)) {
        return true;
      }
    }

    return false;
  }

  this.selectAll = async function (options) {
    if (!options) {
      const sql = format("SELECT * FROM %I;", name);
      console.log(sql);
      const rows = await query(sql);
      console.log(rows);
      return rows;
    }

    const {
      orderBy = false,
      order = "ASC",
      limit = queryLimit,
      offset = 0,
    } = options;
    if (!orderBy) {
      const sql = format(
        "SELECT * FROM %I LIMIT %L OFFSET %L;",
        name,
        limit,
        offset,
      );
      const rows = await query(sql);
      console.log(rows);
      return rows;
    }

    const sql = format(
      "SELECT * FROM %I ORDER BY %I %s LIMIT %L OFFSET %L;",
      name,
      orderBy,
      order,
      limit,
      offset,
    );
    const rows = await query(sql);
    console.log(rows);
    return rows;
  };

  this.selectById = async function (id) {
    const sql = format("SELECT * FROM %I WHERE id = %L;", name, id);
    console.log(sql);
    const rows = await query(sql);
    console.log(rows);
    return rows;
  };

  this.select = async function (options) {
    const { select = null, column, condition } = options;
    let isValid = await validateColumns(column);

    if (!isValid) {
      throw new Error("invalid column name");
    }

    if (!select) {
      const sql = format(
        "SELECT * FROM %I WHERE %I %s;",
        name,
        column,
        condition,
      );
      console.log(sql);
      const rows = await query(sql);
      console.log(rows);
      return rows;
    }

    isValid = await validateColumns(select);

    if (!isValid) {
      throw new Error("invalid column name");
    }

    const sql = format(
      `SELECT ${select.join(", ")} FROM %I WHERE %I = %L`,
      name,
      column,
      value,
    );
    console.log(sql);
    const rows = await query(sql);
    console.log(rows);
    return rows;
  };

  this.insert = async function (options) {
    const { columns, values } = options;

    if (!columns || !values) {
      throw new Error("invalid query");
    }

    const isValid = await validateColumns(columns);
    if (!isValid) {
      throw new Error("invalid columns");
    }
    let valueString = "VALUES (";
    for (let i = 1; i <= values.length; i++) {
      const param = i !== values.length ? `$${i}, ` : `$${i})`;
      valueString += param;
    }
    let sql = `INSERT INTO ${name} (${columns}) ${valueString} RETURNING *;`;
    const rows = await query(sql, values);
    console.log(rows);
    return rows
  };
}

const usersTable = new Table("users");
const messagesTable = new Table("messages");

module.exports = { usersTable, messagesTable };
