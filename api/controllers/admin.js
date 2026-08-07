const fs = require("fs");
const Blog = require("../../models/blog");
const Category = require("../../models/category");
const Role = require("../../models/role");
const User = require("../../models/user");
const { Op } = require("sequelize");
const sequelize = require("../../data/db");
const slugField = require("../../helpers/slugfield");

exports.categories_edit_get = async (req, res, next) => {
    const id = req.params.id;

    try {
        const category = await Category.findOne({
            where: {
                categoryid: id
            }
        });
        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }

        const blogs = await category.getBlogs();
        const blogCount = await category.countBlogs();
        
        return res.status(200).json({
            success: true,
            data: {
                category,
                blogs: await category.getBlogs(),
                blogCount: await category.countBlogs()
            }
        });

    } catch (err) {
        next(err);
    }
}; 

exports.categories_edit_put = async (req, res, next) => {
    const { baslik } = req.body;
    try {
        const category = await Category.findOne({
            where: {
                categoryid: req.params.id
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori bulunamadı."
            });
        }
        
        category.categoryname = baslik;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Kategori başarıyla güncellendi.",
            data: category
        });

    } catch (err) {

        if (
            err.name === "SequelizeValidationError" ||
            err.name === "SequelizeUniqueConstraintError"
        ) {

            return res.status(400).json({
                success: false,
                message: "Kategori güncellenemedi.",
                errors: err.errors.map(e => ({
                    field: e.path,
                    value: e.value,
                    message: e.message
                }))
            });

        }

        next(err);
    }

}; 

exports.categories_get = async (req, res, next) => {
    const message = req.session.message || null;
    req.session.message = null; 
    try {
        const categories = await Category.findAll();
        return res.status(200).json({
            success: true,
            count: categories.length,
            categories: categories
        });
    } catch (err) {
        next(err);
    }
}; 

