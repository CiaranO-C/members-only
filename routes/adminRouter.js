const { Router } = require("express");
const adminController = require("../controllers/adminController");

const adminRouter = Router();

adminRouter.get("/", adminController.adminHomeGet);

adminRouter.get("/delete-message/:id", adminController.deleteMessage);

module.exports = adminRouter;
