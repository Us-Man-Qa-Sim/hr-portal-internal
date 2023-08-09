const express = require("express");

const { Authenticate } = require("../middlewares/Auth");

const router = express.Router();

router.use(Authenticate);

module.exports = router;
