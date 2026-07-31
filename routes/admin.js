const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../helpers/image-upload");
const adminController = require("../controllers/admin");
const isAdmin = require("../middlewares/is-admin");
const isModerator = require("../middlewares/is-moderator");
const csrf = require("../middlewares/csrf");

router.get("/categories/delete/:slug", isAdmin, csrf, adminController.categories_delete_get); 

router.post("/categories/delete/:slug", isAdmin, adminController.categories_delete_post); 

router.post("/categories/remove", isAdmin, adminController.get_categories_remove); 

router.get("/categories/create", isAdmin, csrf, adminController.categories_create_get);  

router.post("/categories/create", isAdmin, adminController.categories_create_post); 

router.get("/categories/:slug", isAdmin, csrf, adminController.categories_edit_get); 

router.post("/categories/:slug", isAdmin, adminController.categories_edit_post); 

router.get("/categories", isAdmin, adminController.categories_get); 

router.get("/blog/delete/:slug", isModerator, csrf, adminController.blog_delete_get); 

router.post("/blog/delete/:slug", isModerator, adminController.blog_delete_post); 

router.get("/blogs/create", isModerator, csrf, adminController.blog_create_get); 

router.post("/blogs/create", isModerator, imageUpload.upload.single("resim"), adminController.blog_create_post); 

router.get("/blogs/:slug", isModerator, csrf, adminController.blog_edit_get); 

router.post("/blogs/:slug", isModerator, imageUpload.upload.single("resim"), adminController.blog_edit_post); 

router.get("/blogs", isModerator, adminController.blogs_get); 

router.get("/roles", isAdmin, csrf, adminController.roles_get);

router.post("/roles/create", isAdmin, adminController.roles_create_post);

router.get("/roles/delete/:roleid", isAdmin, csrf, adminController.roles_delete_get);

router.post("/roles/delete/:roleid", isAdmin, adminController.roles_delete_post);

router.post("/roles/remove", isAdmin, adminController.role_remove_post);

router.get("/roles/:roleid", isAdmin, csrf, adminController.role_edit_get);

router.post("/roles/:roleid", isAdmin, adminController.role_edit_post);

router.get("/users", isAdmin, adminController.users_get);

router.get("/users/:userid", isAdmin, csrf, adminController.users_edit_get);

router.post("/users/:userid", isAdmin, adminController.users_edit_post);

module.exports = router;