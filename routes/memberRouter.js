const { Router } = require('express');
const memberController = require('../controllers/memberController');

const memberRouter = Router();

memberRouter.get("/join-admin", memberController.joinAdminGet);

memberRouter.post("/join-admin", memberController.joinAdminPost)

  module.exports = memberRouter;