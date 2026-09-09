const SNAPSHOT_ALANLARI = ["baslik", "altbaslik", "aciklama", "resim"];

async function oncekiHaliYakala(blog) {
    const kategoriler = await blog.getCategories({ attributes: ["categoryid"] });

    const yakalanan = {};
    for (const alan of SNAPSHOT_ALANLARI) {
        yakalanan[alan] = blog[alan];
    }
    yakalanan.kategoriIDler = kategoriler.map(k => k.categoryid);

    return yakalanan;
}

function yayinaAcikHali(blog) {
    if (blog.onay) return blog;
    if (blog.oncekiOnayliHali) {
        return Object.assign(blog.toJSON ? blog.toJSON() : blog, blog.oncekiOnayliHali);
    }
    return null;
}

module.exports = { SNAPSHOT_ALANLARI, oncekiHaliYakala, yayinaAcikHali };