const { Router } = require("express");

const adminRouter = Router();

adminRouter.get("/", (req, res) => {
  res.send("This is the admin page");
});

module.exports = adminRouter;
