const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const onayController = require("../controllers/onay");


router.get("/bloglar", verifyToken, requireRole("admin"), onayController.bekleyen_bloglar_get);
router.put("/bloglar/:blogid/onayla", verifyToken, requireRole("admin"), onayController.blog_onayla_put);
router.delete("/bloglar/:blogid/reddet", verifyToken, requireRole("admin"), onayController.blog_reddet_delete);

// onay.js
router.put("/bloglar/:blogid/onayla", verifyToken, requireRole("admin"), onayController.blog_onayla_put);
router.put("/bloglar/:blogid/reddet", verifyToken, requireRole("admin"), onayController.blog_reddet_put);
router.put("/bloglar/:blogid/pasif", verifyToken, requireRole("admin"), onayController.blog_pasif_put);
router.put("/bloglar/:blogid/aktif", verifyToken, requireRole("admin"), onayController.blog_aktif_put);

router.get("/yorumlar", verifyToken, requireRole("admin"), onayController.bekleyen_yorumlar_get);
router.put("/yorumlar/:commentid/onayla", verifyToken, requireRole("admin"), onayController.yorum_onayla_put);
router.delete("/yorumlar/:commentid/reddet", verifyToken, requireRole("admin"), onayController.yorum_reddet_delete);

module.exports = router;