const Blog = require("../../models/blog");
const Category = require("../../models/category");
const { Op } = require("sequelize");
const User = require("../../models/user");
const { yayinaAcikHali } = require("../../helpers/blogOnay");
const sequelize = require("../../data/db");
const Comment = require("../../models/comment");


exports.blog_details = async (req, res, next) => {
    const slug = req.params.slug;

    try {
        const blog = await Blog.findOne({
            where: {
                url: slug,
                pasifMi: false,
                [Op.or]: [
                    { onay: true },
                    { onay: false, oncekiOnayliHali: { [Op.ne]: null } }
                ]
            },
            include: [
                { model: Category, attributes: ["categoryid", "categoryname", "url"] },
                { model: User, attributes: ["username", "avatar"] }
            ]
        });

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        }

        const yayinaAcik = await yayinaAcikHali(blog);

        return res.status(200).json({ success: true, data: yayinaAcik });

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

        const where = {
            pasifMi: false,
            [Op.or]: [
                { onay: true },
                {
                    onay: false,
                    oncekiOnayliHali: {
                        [Op.ne]: null
                    }
                }
            ]
        };

        if (arama) {
            where[Op.and] = [
                {
                    [Op.or]: [
                        { baslik: { [Op.like]: `%${arama}%` } },
                        { altbaslik: { [Op.like]: `%${arama}%` } }
                    ]
                }
            ];
        }

        const queryOptions = {
            where,
            include: [
                {
                    model: Category,
                    attributes: ["categoryid", "categoryname", "url"],
                    ...(slug
                        ? { where: { url: slug } }
                        : {})
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

        const { rows, count } =
            await Blog.findAndCountAll(queryOptions);

        // const blogs = rows
        //     .map(yayinaAcikHali)
        //     .filter(Boolean);
        
        const blogs = (await Promise.all(
            rows.map(blog => yayinaAcikHali(blog))
        )).filter(Boolean);

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
            blogs
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

exports.home_get = async (req, res, next) => {
    try {
        const sonBloglar = await Blog.findAll({
            where: { onay: true, pasifMi: false },
            include: [
                { model: Category, attributes: ["categoryid", "categoryname", "url"] },
                { model: User, attributes: ["username"] }
            ],
            order: [["createdAt", "DESC"]],
            limit: 6
        });

        const rastgeleBlog = await Blog.findOne({
            where: { onay: true, pasifMi: false },
            include: [
                { model: Category, attributes: ["categoryid", "categoryname", "url"] },
                { model: User, attributes: ["username"] }
            ],
            order: sequelize.random()
        });

        const kategoriler = await Category.findAll({
            attributes: ["categoryid", "categoryname", "url"],
            order: [["categoryname", "ASC"]]
        });

        // En çok onaylı yoruma sahip 3 blog — önce sayım, sonra o ID'lerle
        // tam blog verisini çekiyoruz (join çarpılması olmasın diye iki adımda).
        const sayimlar = await Comment.findAll({
            attributes: ["blogid", [sequelize.fn("COUNT", sequelize.col("commentid")), "yorumSayisi"]],
            where: { onay: true },
            group: ["blogid"],
            order: [[sequelize.literal("yorumSayisi"), "DESC"]],
            limit: 3
        });

        const populerBlogIds = sayimlar.map(s => s.blogid);

        const populerBloglarRaw = populerBlogIds.length
            ? await Blog.findAll({
                where: { blogid: { [Op.in]: populerBlogIds }, onay: true, pasifMi: false },
                include: [
                    { model: Category, attributes: ["categoryid", "categoryname", "url"] },
                    { model: User, attributes: ["username"] }
                ]
            })
            : [];

        const populerBloglar = populerBlogIds
            .map(id => {
                const blog = populerBloglarRaw.find(b => b.blogid === id);
                const sayim = sayimlar.find(s => s.blogid === id);
                if (!blog) return null;
                return { ...blog.toJSON(), yorumSayisi: Number(sayim.get("yorumSayisi")) };
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            data: { sonBloglar, rastgeleBlog, kategoriler, populerBloglar }
        });

    } catch (err) {
        next(err);
    }
};

exports.rastgele_blog_get = async (req, res, next) => {
    try {
        const blog = await Blog.findOne({
            where: { onay: true, pasifMi: false },
            include: [
                { model: Category, attributes: ["categoryid", "categoryname", "url"] },
                { model: User, attributes: ["username"] }
            ],
            order: sequelize.random()
        });

        return res.status(200).json({ success: true, data: blog });

    } catch (err) {
        next(err);
    }
};