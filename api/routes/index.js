const express = require("express");
const router = express.Router();

router.use("/blog", require("./blog"));
router.use("/auth", require("./auth"));
router.use("/admin", require("./admin"));

module.exports = router;