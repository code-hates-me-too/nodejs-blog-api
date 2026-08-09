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

router.delete("/blog/delete/:id", verifyToken, requireRole("admin", "moderator"), adminController.blog_delete_delete); 

router.get("/blogs/create", verifyToken, requireRole("admin", "moderator"), adminController.blog_create_get); 

router.post("/blogs/create", verifyToken, requireRole("admin", "moderator"), imageUpload.upload.single("resim"), adminController.blog_create_post); 

router.get("/blogs/:blogid", verifyToken, requireRole("admin", "moderator"), adminController.blog_edit_get); 

router.put("/blogs/:blogid", verifyToken, requireRole("admin", "moderator"), imageUpload.upload.single("resim"), adminController.blog_edit_put); 

router.get("/blogs", verifyToken, requireRole("admin", "moderator"), adminController.blogs_get); 

// router.get("/roles", verifyToken, requireRole("admin"), adminController.roles_get);

// router.post("/roles/create", isAdmin, csrf, adminController.roles_create_post);

// router.get("/roles/delete/:roleid", isAdmin, csrf, adminController.roles_delete_get);

// router.post("/roles/delete/:roleid", isAdmin, csrf, adminController.roles_delete_post);

// router.post("/roles/remove", isAdmin, csrf, adminController.role_remove_post);

// router.get("/roles/:roleid", isAdmin, csrf, adminController.role_edit_get);

// router.post("/roles/:roleid", isAdmin, csrf, adminController.role_edit_post);

// router.get("/users", verifyToken, requireRole("admin"), adminController.users_get);

// router.get("/users/:userid", isAdmin, csrf, adminController.users_edit_get);

// router.post("/users/:userid", isAdmin, csrf, adminController.users_edit_post);

module.exports = router;