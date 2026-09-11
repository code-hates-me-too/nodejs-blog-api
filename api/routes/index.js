const express = require("express");
const router = express.Router();

router.use("/blogs", require("./blog"));
router.use("/auth", require("./auth"));
router.use("/admin/onaylar", require("./onay"));
router.use("/admin/comments", require("./adminComment"));
router.use("/admin", require("./admin"));
router.use("/profile", require("./profile"));
router.use("/notifications", require("./notification"));
router.use("/comments", require("./comment"));
router.use("/home", require("./home"));

module.exports = router;