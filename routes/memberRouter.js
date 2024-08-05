const { Router } = require('express');
const memberController = require('../controllers/memberController');

const memberRouter = Router();

memberRouter.get('/', (req, res) => {
  res.send('member page')
})

memberRouter.get("/join-admin", memberController.joinAdminGet);

memberRouter.post("/join-admin", memberController.joinAdminPost);

memberRouter.get("/create-message", memberController.messageFormGet);

memberRouter.post("/create-message", memberController.messageFormPost);

  module.exports = memberRouter;