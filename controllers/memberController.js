const { body, validationResult } = require("express-validator");
const { pool } = require("../db/pool");
const bcrypt = require("bcryptjs");
const { errors } = require("formidable");

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

function messageFormGet(req, res, next) {
  res.render("create-message-form");
}

const messageFormPost = [
  body("title")
    .notEmpty()
    .withMessage("title cannot be empty")
    .trim()
    .isLength({ min: 1, max: 35 })
    .withMessage("Title between 1-35 characters")
    .escape(),
  body("text")
    .notEmpty()
    .withMessage("message must have content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message exceeds character limit")
    .escape(),
  async function (req, res, next) {
    const { title, text } = req.body;
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.render("create-message-form", {
        errors: err.array({ onlyFirstError: true }),
        values: { title, text },
      });
    }

    const { rows } = await pool.query('INSERT INTO messages(user_id, title, text) VALUES($1, $2, $3) RETURNING *;', [req.user.id, title, text])
    console.log(rows);
    console.log('message added to db');
    res.redirect('/message-board');
  },
];

module.exports = {
  joinAdminGet,
  joinAdminPost,
  messageFormGet,
  messageFormPost,
};
