const { pool } = require("../db/pool");

function adminHomeGet(req, res, next) {
  res.send("You are an admin!");
}

async function deleteMessage(req, res, next) {
  try {
    const messageId = req.params.id;
    const { rows } = await pool.query("DELETE FROM messages WHERE id = $1", [
      messageId,
    ]);
    console.log("DELETED MESSAGE");
    res.redirect('/message-board');
  } catch (error) {
    next(error);
  }
}

module.exports = { adminHomeGet, deleteMessage };
