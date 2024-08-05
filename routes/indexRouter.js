const { Router } = require("express");
const passport = require("passport");
const {
  isAuth,
  isAdmin,
  isMember,
  isUser,
} = require("../controllers/authenticate");
const indexController = require("../controllers/indexController");
const adminRouter = require("./adminRouter");
const memberRouter = require("./memberRouter");

const indexRouter = Router();

indexRouter.get('/message-board', indexController.messageBoardGet)

indexRouter.get("/", indexController.indexGet);

indexRouter.get("/sign-up", indexController.signUpGet);

indexRouter.post("/sign-up", indexController.signUpPost);

indexRouter.get("/log-in", indexController.logInGet);

indexRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);

indexRouter.get("/log-out", indexController.logOutGet);

indexRouter.get("/join-club", isUser, indexController.joinClubGet);

indexRouter.post("/join-club", isUser, indexController.joinClubPost);

indexRouter.use("/member", isMember, memberRouter);
indexRouter.use("/admin", isAdmin, adminRouter);



module.exports = indexRouter;
