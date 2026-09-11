const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const onayController = require("../controllers/onay");


router.get("/bloglar", verifyToken, requireRole("admin"), onayController.bekleyen_bloglar_get);
router.put("/bloglar/:blogid/onayla", verifyToken, requireRole("admin"), onayController.blog_onayla_put);
router.delete("/bloglar/:blogid/reddet", verifyToken, requireRole("admin"), onayController.blog_reddet_delete);

router.put("/bloglar/:blogid/onayla", verifyToken, requireRole("admin"), onayController.blog_onayla_put);
router.put("/bloglar/:blogid/reddet", verifyToken, requireRole("admin"), onayController.blog_reddet_put);
router.put("/bloglar/:blogid/pasif", verifyToken, requireRole("admin"), onayController.blog_pasif_put);
router.put("/bloglar/:blogid/aktif", verifyToken, requireRole("admin"), onayController.blog_aktif_put);
router.put("/bloglar/:blogid/yorum-kapat", verifyToken, requireRole("admin"), onayController.blog_yorum_kapat_put);

router.get("/yorumlar", verifyToken, requireRole("admin"), onayController.bekleyen_yorumlar_get);
router.put("/yorumlar/:commentid/onayla", verifyToken, requireRole("admin"), onayController.yorum_onayla_put);
router.delete("/yorumlar/:commentid/reddet", verifyToken, requireRole("admin"), onayController.yorum_reddet_delete);

router.get("/profil-degisiklikleri", verifyToken, requireRole("admin"), onayController.bekleyen_profil_degisiklikleri_get);
router.put("/profil-degisiklikleri/:userid/kullanici-adi/onayla", verifyToken, requireRole("admin"), onayController.kullanici_adi_onayla_put);
router.put("/profil-degisiklikleri/:userid/kullanici-adi/reddet", verifyToken, requireRole("admin"), onayController.kullanici_adi_reddet_put);
router.put("/profil-degisiklikleri/:userid/avatar/onayla", verifyToken, requireRole("admin"), onayController.avatar_onayla_put);
router.put("/profil-degisiklikleri/:userid/avatar/reddet", verifyToken, requireRole("admin"), onayController.avatar_reddet_put);

module.exports = router;