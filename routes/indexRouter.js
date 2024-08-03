const { Router } = require("express");
const { usersTable } = require("../db/tables");
const passport = require('passport');

const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  console.log(req);
  res.render("index");
});

indexRouter.get("/sign-up", (req, res) => {
  res.render("sign-up-form");
});

indexRouter.post("/sign-up", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const salt = 10;
    const hash = await bcryptjs.hash(password, salt);

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
});

indexRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

indexRouter.get("/log-out", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = indexRouter;
