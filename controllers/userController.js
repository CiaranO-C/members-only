const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { pool } = require("../db/pool");

function logOutGet(req, res, next) {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

function joinClubGet(req, res, next) {
  res.render("join-club-form");
}

const joinClubPost = [
  body("clubPassword").notEmpty().withMessage("Try again!"),
  async function (req, res, next) {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      const error = err.array();
      return res.render("join-club-form", {
        message: error[0].msg,
      });
    }

    const { rows } = await pool.query(
      "SELECT * FROM passes WHERE pass_name = 'member pass'",
    );
    const passHash = rows[0].pass_hash;

    const isMatch = await bcrypt.compare(req.body.clubPassword, passHash);
    if (!isMatch) {
      return res.render("join-club-form", {
        message: "Better luck next time!",
      });
    }

    const updateUser = await pool.query(
      "UPDATE users SET member = true WHERE id = $1 RETURNING *",
      [req.user.id],
    );
    console.log(updateUser.rows[0]);
    res.send("Quack Qauck!");
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
    .withMessage("Title between 1-35 characters"),
  body("text")
    .notEmpty()
    .withMessage("message must have content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message exceeds character limit"),
  async function (req, res, next) {
    const { title, text } = req.body;
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.render("create-message-form", {
        errors: err.array({ onlyFirstError: true }),
        values: { title, text },
      });
    }

    const { rows } = await pool.query(
      "INSERT INTO messages(user_id, title, text) VALUES($1, $2, $3) RETURNING *;",
      [req.user.id, title, text],
    );
    console.log(rows);
    console.log("message added to db");
    res.redirect("/message-board");
  },
];

module.exports = {
  logOutGet,
  joinClubGet,
  joinClubPost,
  messageFormGet,
  messageFormPost,
};
