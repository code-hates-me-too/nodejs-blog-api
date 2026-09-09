const Blog = require("../../models/blog");
const { SNAPSHOT_ALANLARI } = require("../../helpers/blogOnay");
const Comment = require("../../models/comment");
const User = require("../../models/user");

exports.bekleyen_bloglar_get = async (req, res, next) => {
    try {
        const yeniBloglar = await Blog.findAll({
            where: { onay: false, ilkOnayVerildiMi: false },
            order: [["createdAt", "DESC"]]
        });

        const duzenlemeler = await Blog.findAll({
            where: { onay: false, ilkOnayVerildiMi: true },
            order: [["updatedAt", "DESC"]]
        });

        return res.status(200).json({
            success: true,
            data: { yeniBloglar, duzenlemeler }
        });

    } catch (err) {
        next(err);
    }
};

exports.blog_reddet_delete = async (req, res, next) => {
    const blogid = req.params.blogid;

    try {
        const blog = await Blog.findByPk(blogid);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        }

        if (!blog.ilkOnayVerildiMi) {
            // Hiç yayınlanmamış yeni bir blog — koruyacak bir şey yok.
            await blog.destroy();
            return res.status(200).json({ success: true, message: "Blog reddedildi ve silindi." });
        }

        if (blog.oncekiOnayliHali) {
            // Daha önce yayında olan bir blogun düzenlemesi reddedildi —
            // son onaylı haline geri dönüyoruz.
            for (const alan of SNAPSHOT_ALANLARI) {
                blog[alan] = blog.oncekiOnayliHali[alan];
            }
            blog.onay = true;
            blog.oncekiOnayliHali = null;
            await blog.save();

            return res.status(200).json({
                success: true,
                message: "Düzenleme reddedildi, blog önceki onaylı haline döndürüldü."
            });
        }

        return res.status(409).json({
            success: false,
            message: "Bu blog için geri dönülecek bir önceki hal bulunamadı, manuel kontrol gerekiyor."
        });

    } catch (err) {
        next(err);
    }
};

exports.blog_onayla_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    try {
        const blog = await Blog.findByPk(blogid);
        if (!blog) return res.status(404).json({ success: false, message: "Blog bulunamadı." });

        const eskiResim = blog.oncekiOnayliHali?.resim;
        const yeniResim = blog.resim;

        blog.onay = true;
        blog.ilkOnayVerildiMi = true;
        blog.oncekiOnayliHali = null;
        blog.reddedildiMi = false;
        blog.reddedilmeNotu = null;
        await blog.save();

        if (eskiResim && eskiResim !== yeniResim) {
            fs.unlink("./public/images/" + eskiResim, err => {
                if (err) console.log(err);
            });
        }

        return res.status(200).json({ success: true, message: "Blog onaylandı." });
    } catch (err) {
        next(err);
    }
};

exports.blog_reddet_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    const { neden } = req.body;

    try {
        const blog = await Blog.findByPk(blogid);
        if (!blog) return res.status(404).json({ success: false, message: "Blog bulunamadı." });

        if (!blog.ilkOnayVerildiMi) {
            blog.reddedildiMi = true;
            blog.reddedilmeNotu = neden || null;
            await blog.save();
            return res.status(200).json({ success: true, message: "Blog reddedildi." });
        }

        if (blog.oncekiOnayliHali) {
            const reddedilenResim = blog.resim;
            const eskiResim = blog.oncekiOnayliHali.resim;
            const eskiKategoriIDler = blog.oncekiOnayliHali.kategoriIDler || [];

            for (const alan of SNAPSHOT_ALANLARI) {
                blog[alan] = blog.oncekiOnayliHali[alan];
            }
            blog.onay = true;
            blog.oncekiOnayliHali = null;
            await blog.save();

            const mevcutKategoriler = await blog.getCategories();
            if (mevcutKategoriler.length) {
                await blog.removeCategories(mevcutKategoriler);
            }
            if (eskiKategoriIDler.length) {
                await blog.addCategories(eskiKategoriIDler);
            }

            if (reddedilenResim && reddedilenResim !== eskiResim) {
                fs.unlink("./public/images/" + reddedilenResim, err => {
                    if (err) console.log(err);
                });
            }

            return res.status(200).json({ success: true, message: "Düzenleme reddedildi, blog önceki onaylı haline döndürüldü." });
        }

        return res.status(409).json({ success: false, message: "Geri dönülecek bir önceki hal bulunamadı." });
    } catch (err) {
        next(err);
    }
};

exports.blog_pasif_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    try {
        const blog = await Blog.findByPk(blogid);
        if (!blog) return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        blog.pasifMi = true;
        await blog.save();
        return res.status(200).json({ success: true, message: "Blog pasife alındı." });
    } catch (err) {
        next(err);
    }
};

exports.blog_aktif_put = async (req, res, next) => {
    const blogid = req.params.blogid;
    try {
        const blog = await Blog.findByPk(blogid);
        if (!blog) return res.status(404).json({ success: false, message: "Blog bulunamadı." });
        blog.pasifMi = false;
        await blog.save();
        return res.status(200).json({ success: true, message: "Blog tekrar aktif edildi." });
    } catch (err) {
        next(err);
    }
};

exports.bekleyen_yorumlar_get = async (req, res, next) => {
    try {
        const yorumlar = await Comment.findAll({
            where: { onay: false },
            include: [
                { model: User, attributes: ["username"] },
                { model: Blog, attributes: ["blogid", "baslik", "url"] },
                {
                    model: Comment,
                    as: "parent",
                    attributes: ["commentid", "icerik"],
                    include: [{ model: User, attributes: ["username"] }]
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        return res.status(200).json({ success: true, data: yorumlar });

    } catch (err) {
        next(err);
    }
};

exports.yorum_onayla_put = async (req, res, next) => {
    const commentid = req.params.commentid;
    try {
        const yorum = await Comment.findByPk(commentid);
        if (!yorum) return res.status(404).json({ success: false, message: "Yorum bulunamadı." });

        yorum.onay = true;
        await yorum.save();

        return res.status(200).json({ success: true, message: "Yorum onaylandı." });
    } catch (err) {
        next(err);
    }
};

exports.yorum_reddet_delete = async (req, res, next) => {
    const commentid = req.params.commentid;
    try {
        const yorum = await Comment.findByPk(commentid);
        if (!yorum) return res.status(404).json({ success: false, message: "Yorum bulunamadı." });

        await yorum.destroy();

        return res.status(200).json({ success: true, message: "Yorum reddedildi ve silindi." });
    } catch (err) {
        next(err);
    }
};