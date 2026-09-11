const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../../helpers/image-upload");
const adminController = require("../controllers/admin");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

router.delete("/categories/delete/:id", verifyToken, requireRole("admin"), adminController.categories_delete_delete); 

router.delete("/categories/:categoryid/blogs/:blogid", verifyToken, requireRole("admin"), adminController.categories_remove_delete); 

router.post("/categories/create", verifyToken, requireRole("admin"), adminController.categories_create_post); 

router.get("/categories/:id", verifyToken, requireRole("admin"), adminController.categories_edit_get); 

router.put("/categories/:id", verifyToken, requireRole("admin"), adminController.categories_edit_put); 

router.get("/categories", verifyToken, requireRole("admin"), adminController.categories_get); 

router.put("/blogs/:blogid/iptal", verifyToken, requireRole("admin", "moderator"), adminController.blog_duzenleme_iptal_put);

router.delete("/blog/delete/:id", verifyToken, requireRole("admin", "moderator"), adminController.blog_delete_delete); 

router.get("/blogs/create", verifyToken, requireRole("admin", "moderator"), adminController.blog_create_get); 

router.post("/blogs/create", verifyToken, requireRole("admin", "moderator"), imageUpload.upload.single("resim"), adminController.blog_create_post); 

router.get("/blogs/:blogid", verifyToken, requireRole("admin", "moderator"), adminController.blog_edit_get); 

router.put("/blogs/:blogid", verifyToken, requireRole("admin", "moderator"), imageUpload.upload.single("resim"), adminController.blog_edit_put); 

router.get("/blogs", verifyToken, requireRole("admin", "moderator"), adminController.blogs_get); 

router.put("/users/:userid/avatar-kaldir", verifyToken, requireRole("admin"), adminController.users_avatar_remove_put);

router.put("/users/:userid/yorum-engeli", verifyToken, requireRole("admin"), adminController.kullanici_yorum_engelle_put);

router.get("/users", verifyToken, requireRole("admin"), adminController.users_get);

router.get("/users/:userid", verifyToken, requireRole("admin"), adminController.users_edit_get);

router.put("/users/:userid", verifyToken, requireRole("admin"), adminController.users_edit_put);

router.delete("/roles/delete/:roleid", verifyToken, requireRole("admin"), adminController.roles_delete_delete);

router.delete("/roles/remove", verifyToken, requireRole("admin"), adminController.role_remove_delete);

router.post("/roles/create", verifyToken, requireRole("admin"), adminController.roles_create_post);

router.get("/roles", verifyToken, requireRole("admin"), adminController.roles_get);

router.get("/roles/:roleid", verifyToken, requireRole("admin"), adminController.role_edit_get);

router.put("/roles/:roleid", verifyToken, requireRole("admin"), adminController.role_edit_put);

router.post("/add", verifyToken, requireRole("admin"), adminController.role_add_post);

router.get("/", verifyToken, requireRole("admin"), adminController.users_get);

router.get("/search", verifyToken, requireRole("admin"), adminController.users_search_get); 

router.get("/:userid", verifyToken, requireRole("admin"), adminController.users_edit_get);

router.put("/:userid", verifyToken, requireRole("admin"), adminController.users_edit_put);


module.exports = router;