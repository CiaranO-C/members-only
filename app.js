require("dotenv").config();
const { pool } = require("./db/pool");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const localStrategy = require("./config/passport");
const { usersTable } = require("./db/tables");
const indexRouter = require('./routes/indexRouter')

const sessionStore = new pgSession({
  pool,
  tableName: "user_sessions",
  createTableIfMissing: true,
});

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  }),
);

app.use(passport.session());

passport.use("local", localStrategy);

passport.serializeUser((user, done) => {
  console.log("In Serialize User:", user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("In deserialize User:", id);
    const rows = await usersTable.select({
      column: "id",
      condition: `= ${id}`,
    });
    const user = rows[0];
    console.log("User found:", user);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port: ${PORT}`));
