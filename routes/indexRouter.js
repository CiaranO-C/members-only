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
const userRouter = require('./userRouter')

const indexRouter = Router();

indexRouter.get("/message-board", indexController.messageBoardGet);

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

indexRouter.use("/user", isUser, userRouter);
indexRouter.use("/member", isMember, memberRouter);
indexRouter.use("/admin", isAdmin, adminRouter);

module.exports = indexRouter;
