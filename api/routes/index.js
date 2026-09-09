const express = require("express");
const router = express.Router();

router.use("/blogs", require("./blog"));
router.use("/auth", require("./auth"));
router.use("/admin/onaylar", require("./onay"));
router.use("/admin", require("./admin"));
router.use("/profile", require("./profile"));

module.exports = router;