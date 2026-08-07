const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../../helpers/image-upload");
const adminController = require("../controllers/admin");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// router.get("/categories/delete/:slug", isAdmin, csrf, adminController.categories_delete_get); 

// router.post("/categories/delete/:slug", isAdmin, csrf, adminController.categories_delete_post); 

// router.post("/categories/remove", isAdmin, adminController.get_categories_remove); 

// router.get("/categories/create", isAdmin, csrf, adminController.categories_create_get);  

// router.post("/categories/create", isAdmin, csrf, adminController.categories_create_post); 

router.get("/categories/:id", verifyToken, requireRole("admin"), adminController.categories_edit_get); 

router.put("/categories/:id", verifyToken, requireRole("admin"), adminController.categories_edit_put); 

router.get("/categories", verifyToken, requireRole("admin"), adminController.categories_get); 

// router.get("/blog/delete/:slug", isModerator, csrf, adminController.blog_delete_get); 

// router.post("/blog/delete/:slug", isModerator, csrf, adminController.blog_delete_post); 

// router.get("/blogs/create", isModerator, csrf, adminController.blog_create_get); 

// router.post("/blogs/create", isModerator, csrf, imageUpload.upload.single("resim"), adminController.blog_create_post); 

// router.get("/blogs/:slug", isModerator, csrf, adminController.blog_edit_get); 

// router.post("/blogs/:slug", isModerator, csrf, imageUpload.upload.single("resim"), adminController.blog_edit_post); 

// router.get("/blogs", verifyToken, requireRole("admin"), adminController.blogs_get); 

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