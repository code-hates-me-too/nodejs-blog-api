const Blog = require("../../models/blog");
const Category = require("../../models/category");
const { Op } = require("sequelize");
const User = require("../../models/user");


exports.blog_details = async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const blog = await Blog.findOne({
            where: {
                url: slug,
                onay: true
            },
            include: [
                {
                    model: Category,
                    attributes: ["categoryid", "categoryname", "url"]
                },
                {
                    model: User,
                    attributes: ["username", "avatar"]
                }
            ]
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
    const size = 15;
    let page;
    const slug = req.params.slug;
    const arama = req.query.ara;

    try {
        page = Number(req.query.page);
        if (!Number.isInteger(page) || page < 0) {
            page = 0;
        }

        const where = { onay: true };

        if (arama) {
            where[Op.or] = [
                { baslik: { [Op.like]: `%${arama}%` } },
                { altbaslik: { [Op.like]: `%${arama}%` } }
            ];
        }

        const queryOptions = {
            where,
            include: [
                {
                    model: Category,
                    attributes: ["categoryid", "categoryname", "url"],
                    ...(slug ? { where: { url: slug } } : {})
                },
                {
                    model: User,
                    attributes: ["username", "avatar"]
                }
            ],
            limit: size,
            offset: page * size,
            distinct: true
        };

        const { rows, count } = await Blog.findAndCountAll(queryOptions);
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
    const size = 15;
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

exports.categories_get = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            attributes: ["categoryid", "categoryname", "url"],
            order: [["categoryname", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            data: categories
        });

    } catch (err) {
        next(err);
    }
};