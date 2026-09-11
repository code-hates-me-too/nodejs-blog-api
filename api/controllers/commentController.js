const Comment = require("../../models/comment");
const CommentReaction = require("../../models/commentReaction");
const User = require("../../models/user");
const Blog = require("../../models/blog");
const { Op } = require("sequelize");

const MAX_DERINLIK = 2;
const SAYFA_BOYUTU = 20;


async function getReactionSummary(commentIds, currentUserId) {
    if (!commentIds.length) return {};

    const rows = await CommentReaction.findAll({
        where: { commentid: { [Op.in]: commentIds } },
        attributes: ["commentid", "userid", "tur"]
    });

    const summary = {};
    for (const id of commentIds) {
        summary[id] = { begeni: 0, begenmeme: 0, kullaniciTepkisi: null };
    }

    for (const row of rows) {
        summary[row.commentid][row.tur] += 1;
        if (currentUserId && row.userid === currentUserId) {
            summary[row.commentid].kullaniciTepkisi = row.tur;
        }
    }

    return summary;
}


function buildCommentTree(allComments, reactionSummary) {
    const childrenOf = {};

    for (const comment of allComments) {
        const parentKey = comment.parentid || "root";
        if (!childrenOf[parentKey]) childrenOf[parentKey] = [];
        childrenOf[parentKey].push(comment);
    }

    function serialize(comment) {
        const reactions = reactionSummary[comment.commentid] || { begeni: 0, begenmeme: 0, kullaniciTepkisi: null };

        return {
            commentid: comment.commentid,
            icerik: comment.silindiMi ? null : comment.icerik,
            derinlik: comment.derinlik,
            createdAt: comment.createdAt,
            user: comment.silindiMi ? null : comment.user,
            silindiMi: comment.silindiMi,
            begeniSayisi: reactions.begeni,
            begenmemeSayisi: reactions.begenmeme,
            kullaniciTepkisi: reactions.kullaniciTepkisi,
            yanitlar: (childrenOf[comment.commentid] || [])
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map(serialize)
        };
    }

    const topLevel = (childrenOf["root"] || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
        tree: topLevel.map(serialize),
        topLevelCount: topLevel.length
    };
}


exports.comments_get = async (req, res, next) => {
    const blogid = req.params.blogid;
    const currentUserId = req.user?.userid || null;

    try {
        let page = Number(req.query.page);
        if (!Number.isInteger(page) || page < 0) page = 0;

        // Not: derinlik en fazla 2 olduğu ve blog başına yorum hacmi
        // makul olduğu için tüm onaylı yorumları tek seferde çekip
        // ağacı bellekte kuruyoruz. Yorum hacmi çok büyürse (binlerce),
        // bu kısmı sayfa bazlı/recursive sorguya çevirmemiz gerekecek.
        const allComments = await Comment.findAll({
            where: { blogid, onay: true },
            include: [{ model: User, attributes: ["userid", "username", "avatar"] }],
            order: [["createdAt", "ASC"]]
        });

        const reactionSummary = await getReactionSummary(
            allComments.map(c => c.commentid),
            currentUserId
        );

        const { tree, topLevelCount } = buildCommentTree(allComments, reactionSummary);

        const pageStart = page * SAYFA_BOYUTU;
        const pageItems = tree.slice(pageStart, pageStart + SAYFA_BOYUTU);

        return res.status(200).json({
            success: true,
            pagination: {
                totalItems: topLevelCount,
                totalPages: Math.ceil(topLevelCount / SAYFA_BOYUTU),
                currentPage: page,
                pageSize: SAYFA_BOYUTU
            },
            totalComments: allComments.length,
            comments: pageItems
        });

    } catch (err) {
        next(err);
    }
};


exports.comments_post = async (req, res, next) => {
    const blogid = req.params.blogid;
    const userid = req.user.userid;
    const { icerik, parentid } = req.body;

    try {
        const user = await User.findByPk(userid, { attributes: ["yorumEngelliMi"] });

        if (user?.yorumEngelliMi) {
            return res.status(403).json({
                success: false,
                message: "Yorum yapma yetkiniz kısıtlanmış."
            });
        }

        const blog = await Blog.findByPk(blogid, { attributes: ["yorumlaraKapaliMi"] });

        if (blog?.yorumlaraKapaliMi) {
            return res.status(403).json({
                success: false,
                message: "Bu blogun yorumları kapatılmış."
            });
        }

        const adminMi = (req.user.roles || []).includes("admin");

        let derinlik = 0;

        if (parentid) {
            const parent = await Comment.findOne({ where: { commentid: parentid, blogid } });
            if (!parent) {
                return res.status(404).json({ success: false, message: "Yanıt verilen yorum bulunamadı." });
            }
            derinlik = Math.min(parent.derinlik + 1, MAX_DERINLIK);
        }

        const comment = await Comment.create({
            blogid,
            userid,
            parentid: parentid || null,
            icerik,
            derinlik,
            onay: adminMi   
        });

        const withUser = await Comment.findByPk(comment.commentid, {
            include: [{ model: User, attributes: ["userid", "username", "avatar"] }]
        });

        return res.status(201).json({
            success: true,
            message: adminMi ? "Yorumunuz eklendi." : "Yorumunuz gönderildi, admin onayı bekleniyor.",
            onaylandiMi: adminMi,
            data: {
                commentid: withUser.commentid,
                icerik: withUser.icerik,
                derinlik: withUser.derinlik,
                createdAt: withUser.createdAt,
                user: withUser.user,
                begeniSayisi: 0,
                begenmemeSayisi: 0,
                kullaniciTepkisi: null,
                yanitlar: []
            }
        });

    } catch (err) {
        if (err.name === "SequelizeValidationError") {
            const errors = err.errors.map(e => e.message);
            return res.status(400).json({
                success: false,
                message: "Yorum eklenemedi.",
                errors
            });
        }
        next(err);
    }
};


exports.comment_reaction_post = async (req, res, next) => {
    const commentid = req.params.commentid;
    const userid = req.user.userid;
    const { tur } = req.body;

    try {
        if (!["begeni", "begenmeme"].includes(tur)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz tepki türü."
            });
        }

        const existing = await CommentReaction.findOne({ where: { commentid, userid } });

        if (existing && existing.tur === tur) {
            await existing.destroy();
        } else if (existing) {
            existing.tur = tur;
            await existing.save();
        } else {
            await CommentReaction.create({ commentid, userid, tur });
        }

        const begeni = await CommentReaction.count({ where: { commentid, tur: "begeni" } });
        const begenmeme = await CommentReaction.count({ where: { commentid, tur: "begenmeme" } });
        const guncel = await CommentReaction.findOne({ where: { commentid, userid } });

        return res.status(200).json({
            success: true,
            data: {
                begeniSayisi: begeni,
                begenmemeSayisi: begenmeme,
                kullaniciTepkisi: guncel ? guncel.tur : null
            }
        });

    } catch (err) {
        next(err);
    }
};


exports.yorum_sil_delete = async (req, res, next) => {
    const commentid = req.params.commentid;
    try {
        const yorum = await Comment.findByPk(commentid);
        if (!yorum) {
            return res.status(404).json({ success: false, message: "Yorum bulunamadı." });
        }

        yorum.silindiMi = true;
        await yorum.save();

        return res.status(200).json({ success: true, message: "Yorum kaldırıldı." });
    } catch (err) {
        next(err);
    }
};