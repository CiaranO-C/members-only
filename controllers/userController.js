const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/pool');


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

module.exports = { logOutGet, joinClubGet, joinClubPost };
