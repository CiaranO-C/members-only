const { body, validationResult } = require("express-validator");
const { pool } = require("../db/pool");
const bcrypt = require("bcryptjs");

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

function logOutGet(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/log-in", {
      message: "Must be logged in first",
    });
  }
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

module.exports = {
  indexGet,
  signUpGet,
  signUpPost,
  logInGet,
  logOutGet,
  joinClubGet,
  joinClubPost,
};
