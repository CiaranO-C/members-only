const { Router } = require("express");
const { usersTable } = require("../db/tables");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { isAuth, isAdmin } = require("../controllers/authenticate");

const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  console.log("REQ.USER --> ", req.user);
  res.render("index");
});

indexRouter.get("/sign-up", (req, res) => {
  res.render("sign-up-form");
});

indexRouter.post("/sign-up", async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
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

indexRouter.get("/member", isAuth, (req, res) => {
  res.send("This is the member page");
});

indexRouter.get("/admin", isAdmin, (req, res) => {
  res.send("This is the admin page");
});

module.exports = indexRouter;
