const { body, validationResult } = require("express-validator");
const { pool } = require("../db/pool");
const bcrypt = require("bcryptjs");
const { usersTable } = require("../db/tables");

function indexGet(req, res, next) {
  res.render("index");
}

function signUpGet(req, res) {
  res.render("sign-up-form");
}

const signUpPost = [
  body("firstName")
    .notEmpty()
    .withMessage("First name cannot be empty")
    .trim()
    .isLength({ min: 1, max: 15 })
    .withMessage("First name between 1-15 chars")
    .isAlpha()
    .withMessage("First name alphabetic chars only")
    .escape(),
  body("lastName")
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage("Last name between 1-25 chars")
    .isAlpha()
    .withMessage("Last name alphabetic chars only")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      try {
        const rows = await usersTable.select({
          column: "email",
          condition: `= '${value}'`,
        });
        const user = rows[0];
        console.log("user ->", user);
        if (user) {
          throw new Error("Email already in use");
        }
        return true;
      } catch (error) {
        if (error.message === "Email already in use") {
          throw error;
        } else {
          throw new Error("Server error");
        }
      }
    })
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isStrongPassword({
      minSymbols: 0,
    })
    .withMessage(
      "Passwords must contain uppercase, lowercase and at least one number",
    )
    .escape(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation required")
    .custom((value, { req }) => {
      const password = req.body.password;
      if (value !== password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  async function (req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.render("sign-up-form", {
        values: { firstName, lastName, email, password },
        errors: err.array(),
      });
    }

    try {
      const salt = 10;
      const hash = await bcrypt.hash(password, salt);

      const rows = await usersTable.insert({
        columns: [
          "first_name",
          "last_name",
          "email",
          "password_hash",
          "salt",
          "member",
        ],
        values: [firstName, lastName, email, hash, salt, false],
      });
      console.log("New User:", rows);
      res.redirect("/");
    } catch (error) {
      return next(err);
    }
  },
];

function logInGet(req, res, next) {
  res.render("log-in-form");
}

async function messageBoardGet(req, res, next) {
  try {
    const { rows } = await pool.query(`
      SELECT messages.*, users.id AS user_id, first_name, last_name 
      FROM messages
      JOIN users
      ON messages.user_id = users.id
      LIMIT 100;`);

    res.render("message-board", {
      messages: rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  indexGet,
  signUpGet,
  signUpPost,
  logInGet,
  joinClubGet,
  joinClubPost,
  messageBoardGet,
};
