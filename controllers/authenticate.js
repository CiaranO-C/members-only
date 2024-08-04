function isUser(req, res, next) {
    if (req.isAuthenticated()) {
        next();
      } else {
        res.status(401).json({ msg: "You need to sign in to go here!" });
      } 
}

function isMember(req, res, next) {
  if (req.isAuthenticated() && req.user.member === true) {
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

module.exports = { isUser, isMember, isAdmin }