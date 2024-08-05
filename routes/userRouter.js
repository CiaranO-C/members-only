const { Router } = require("express");
const userController = require("../controllers/userController");

const userRouter = Router();

userRouter.get("/log-out", userController.logOutGet);

userRouter.get("/join-club" , userController.joinClubGet);

userRouter.post("/join-club", userController.joinClubPost);

module.exports = userRouter;
