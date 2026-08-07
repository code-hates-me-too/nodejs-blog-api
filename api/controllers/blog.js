const Blog = require("../../models/blog");
const Category = require("../../models/category");
const { Op } = require("sequelize");

exports.blog_details = async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const blog = await Blog.findOne({
            where: {
                url: slug,
                onay: true
            }
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog bulunamadı."
            });
        }

        return res.status(200).json({
            success: true,
            data: blog
        });

    } catch (err) {
        next(err);
    }
};

exports.blogs = async (req, res, next) => {
    const size = 6;
    let page;
    const slug = req.params.slug;

    try {
        page = Number(req.query.page);
        if (!Number.isInteger(page) || page < 0) {
            page = 0;
        }
        const { rows, count } = await Blog.findAndCountAll({
            where: {
                onay: true
            },
            include: slug
                ? {
                    model: Category,
                    where: { url: slug }
                }
                : null,
            limit: size,
            offset: page * size
        });

        const categories = await Category.findAll();

        return res.status(200).json({
            success: true,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / size),
                currentPage: page,
                pageSize: size
            },
            categories,
            blogs: rows
        });

    } catch (err) {
        next(err);
    }
};

exports.mainpage = async (req, res, next) => {
    const size = 6;
    const page = Number(req.query.page) || 0;

    try {
        const { rows, count } = await Blog.findAndCountAll({
            where: {
                [Op.and]: [
                    { anasayfa: true },
                    { onay: true }
                ]
            },
            limit: size,
            offset: page * size
        });

        const categories = await Category.findAll();

        return res.status(200).json({
            success: true,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / size),
                currentPage: page,
                pageSize: size
            },
            categories,
            blogs: rows
        });

    } catch (err) {
        next(err);
    }
};