const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../helpers/image-upload");
const adminController = require("../controllers/admin");
const isAuth = require("../middlewares/auth");
const csrf = require("../middlewares/csrf");

router.get("/categories/delete/:slug", isAuth, csrf, adminController.categories_delete_get); 

router.post("/categories/delete/:slug", isAuth, adminController.categories_delete_post); 

router.post("/categories/remove", isAuth, adminController.get_categories_remove); 

router.get("/categories/create", isAuth, csrf, adminController.categories_create_get);  

router.post("/categories/create", isAuth, adminController.categories_create_post); 

router.get("/categories/:slug", isAuth, csrf, adminController.categories_edit_get); 

router.post("/categories/:slug", isAuth, adminController.categories_edit_post); 

router.get("/categories", isAuth, adminController.categories_get); 

router.get("/blog/delete/:slug", isAuth, csrf, adminController.blog_delete_get); 

router.post("/blog/delete/:slug", isAuth, adminController.blog_delete_post); 

router.get("/blogs/create", isAuth, csrf, adminController.blog_create_get); 

router.post("/blogs/create", isAuth, imageUpload.upload.single("resim"), adminController.blog_create_post); 

router.get("/blogs/:slug", isAuth, csrf, adminController.blog_edit_get); 

router.post("/blogs/:slug", isAuth, imageUpload.upload.single("resim"), adminController.blog_edit_post); 

router.get("/blogs", isAuth, adminController.blogs_get); 

module.exports = router;