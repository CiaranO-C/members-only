const { Strategy } = require("passport-local");
const { usersTable } = require("../db/tables");
const bcrypt = require("bcryptjs");

const localStrategy = new Strategy(async (username, password, done) => {
  try {
    // Check for username
    const rows = await usersTable.select({column: 'email', condition: `= '${username}'`});
    const user = rows[0];
    console.log(user);
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return done(null, false, { message: "Incorrect password" });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
});

module.exports = localStrategy;