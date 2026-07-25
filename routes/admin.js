const express = require("express");
const path = require("path");
const router = express.Router();
const imageUpload = require("../helpers/image-upload");
const adminController = require("../controllers/admin");

router.get("/categories/delete/:slug", adminController.categories_delete_get); 

router.post("/categories/delete/:slug", adminController.categories_delete_post); 

router.post("/categories/remove", adminController.get_categories_remove); 

router.get("/categories/create", adminController.categories_create_get);  

router.post("/categories/create", adminController.categories_create_post); 

router.get("/categories/:slug", adminController.categories_edit_get); 

router.post("/categories/:slug", adminController.categories_edit_post); 

router.get("/categories", adminController.categories_get); 

router.get("/blog/delete/:slug", adminController.blog_delete_get); 

router.post("/blog/delete/:slug", adminController.blog_delete_post); 

router.get("/blogs/create", adminController.blog_create_get); 

router.post("/blogs/create", imageUpload.upload.single("resim"), adminController.blog_create_post); 

router.get("/blogs/:slug", adminController.blog_edit_get); 

router.post("/blogs/:slug", imageUpload.upload.single("resim"), adminController.blog_edit_post); 

router.get("/blogs", adminController.blogs_get); 

module.exports = router;