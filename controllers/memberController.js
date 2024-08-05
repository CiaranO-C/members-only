const { body, validationResult } = require("express-validator");
const { pool } = require("../db/pool");
const bcrypt = require("bcryptjs");

function joinAdminGet(req, res, next) {
  res.render("join-admin-form");
}

const joinAdminPost = [
  body("adminPassword")
    .notEmpty()
    .withMessage("Try again...but write something!"),
  async function (req, res, next) {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      const error = err.array();
      return res.render("join-admin-form", {
        message: error[0].msg,
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM passes WHERE pass_name = 'admin pass';",
    );
    const passHash = rows[0].pass_hash;

    const isMatch = await bcrypt.compare(req.body.adminPassword, passHash);
    if (!isMatch) {
      return res.render("join-admin-form", {
        message: "No admin for you",
      });
    }

    const updateUser = await pool.query(
      "UPDATE users SET admin = true WHERE id = $1 RETURNING *",
      [req.user.id],
    );
    console.log(updateUser.rows[0]);
    res.send("HONK HONK");
  },
];

module.exports = {
  joinAdminGet,
  joinAdminPost,
};
