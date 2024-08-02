require("dotenv").config();
const { pool } = require("./pool");
const format = require("pg-format");

function Table(tableName) {
  Object.defineProperties(this, {
    name: {
      value: tableName,
    },
    queryLimit: {
      value: 100,
    },
  });

  async function query(sql) {
    const { rows } = await pool.query(sql);
    return rows;
  }

  this.selectAll = async function (options) {
    if (!options) {
      const sql = format("SELECT * FROM %I;", this.name);
      console.log(sql);
      const rows = await query(sql);
      console.log(rows);
      return;
    }

    const { orderBy = false, order = "ASC", limit = this.queryLimit, offset = 0 } = options;
    if (!orderBy) {
      const sql = format(
        "SELECT * FROM %I LIMIT %L OFFSET %L;",
        this.name,
        limit,
        offset,
      );
      const rows = await query(sql);
      console.log(rows);
      return;
    }

    const sql = format(
      "SELECT * FROM %I ORDER BY %I %s LIMIT %L OFFSET %L;",
      this.name,
      orderBy,
      order,
      limit,
      offset,
    );
    const rows = await query(sql);
    console.log(rows);
    return;
  };
}

const usersTable = new Table("users");

usersTable.selectAll({ orderBy: "first_name", order: "DESC" });

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
