function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ msg: "You are not authenticated" });
  }
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin === true) {
    next();
  } else {
    res.status(401).json({ msg: "You are not an admin" });
  }
}

module.exports = { isAuth, isAdmin }
