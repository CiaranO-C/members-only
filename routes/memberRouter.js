const { Router } = require('express');
const memberController = require('../controllers/memberController');

const memberRouter = Router();

memberRouter.get("/", (req, res) => {
    res.send("This is the member page");
});

memberRouter.get('/join-club', memberController.joinClubGet)

memberRouter.post('/join-club', memberController.joinClubPost)

  module.exports = memberRouter