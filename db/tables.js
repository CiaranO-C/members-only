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
      const sql = format("SELECT * FROM %I WHERE %I %s;", name, column, condition);
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
}

const usersTable = new Table("users");
const messagesTable = new Table("messages");

//usersTable.selectById(1);
//usersTable.selectAll();
usersTable.select({ column: "first_name", condition: "LIKE '%il%' OR first_name LIKE '%ia%'" });
//usersTable.select({ column: "email", value: "ciaranoc@poo.com" });

//messagesTable.selectAll();

module.exports = { usersTable, messagesTable };

/*const usersTable = {
  tableName: "users",

  select: async function (queryOptions) {
    let sql;

    if (!queryOptions) {
      sql = `SELECT * FROM ${this.tableName};`;
    } else {
      const { column, value } = queryOptions;
    }
  },

  selectAllUsers: async function () {
    try {
      const res = await pool.query("SELECT * FROM users;");
      console.log(res);
      if (res.rows.length === 0) {
        return false;
      }
      return res.rows;
    } catch (error) {
      throw new Error("Database error");
    }
  },
  selectByEmail: async function (email) {
    try {
      const { rows } = await pool.query(
        `
        SELECT * FROM users 
        WHERE email = $1;
        `[email],
      );
      const user = rows[0];
      if (!user) return false;

      return user;
    } catch (error) {
      throw new Error("Database error");
    }
  },
};*/

//module.exports = { usersTable };
