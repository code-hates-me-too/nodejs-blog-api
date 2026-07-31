const Blog = require("../models/blog");
const Category = require("../models/category");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Role = require("../models/role");

async function populate() {

    const users = await User.bulkCreate([
        {
            fullname: "hokoko",
            email: "info@hokoko.com",
            password: await bcrypt.hash("12345", 10)
        },
        {
            fullname: "mokoko",
            email: "info@mokoko.com",
            password: await bcrypt.hash("12345", 10)
        },
    ]);

    // Kullanıcıları değişkenlere al
    const adminUser = users[0];
    const normalUser = users[1];

    // Roller
    const adminRole = await Role.create({
        rolename: "admin"
    });

    const userRole = await Role.create({
        rolename: "moderator"
    });

    // Rol ilişkileri
    await adminUser.addRoles([adminRole, userRole]);
    await normalUser.addRole(userRole);

    const count = await Category.count();

    if (count > 0) {
        return;
    }

    const yazilim = await Category.create({
        categoryname: "Yazılım",
        url: "yazilim"
    });

    const teknoloji = await Category.create({
        categoryname: "Teknoloji",
        url: "teknoloji"
    });

    const yapayzeka = await Category.create({
        categoryname: "Yapay Zeka",
        url: "yapay-zeka"
    });

    const web = await Category.create({
        categoryname: "Web Geliştirme",
        url: "web-gelistirme"
    });

    const kariyer = await Category.create({
        categoryname: "Kariyer",
        url: "kariyer"
    });

    const blog1 = await Blog.create({
        baslik: "Node.js'e Giriş",
        url: "nodejs-giris",
        altbaslik: "Node.js ile ilk uygulamanızı oluşturun.",
        aciklama: "<p>Node.js sunucu tarafında JavaScript çalıştırmayı sağlar.</p>",
        resim: "1.jpg",
        anasayfa: true,
        onay: true
    });

    const blog2 = await Blog.create({
        baslik: "Express Router Kullanımı",
        url: "express-router",
        altbaslik: "Express'te route yapısını öğrenin.",
        aciklama: "<p>Express Router büyük projelerde kod düzenini kolaylaştırır.</p>",
        resim: "2.jpg",
        anasayfa: true,
        onay: true
    });

    const blog3 = await Blog.create({
        baslik: "Sequelize ORM",
        url: "sequelize-orm",
        altbaslik: "SQL sorgularını ORM ile yönetin.",
        aciklama: "<p>Sequelize sayesinde SQL yerine JavaScript kullanabilirsiniz.</p>",
        resim: "3.jpg",
        anasayfa: true,
        onay: true
    });

    const blog4 = await Blog.create({
        baslik: "REST API Nedir?",
        url: "rest-api",
        altbaslik: "REST mimarisinin temelleri.",
        aciklama: "<p>REST API istemci ile sunucu arasında veri alışverişini sağlar.</p>",
        resim: "4.jpg",
        anasayfa: false,
        onay: true
    });

    const blog5 = await Blog.create({
        baslik: "Bootstrap Grid Sistemi",
        url: "bootstrap-grid",
        altbaslik: "Responsive tasarım oluşturun.",
        aciklama: "<p>Bootstrap grid sistemi sayfa düzenini kolaylaştırır.</p>",
        resim: "5.jpg",
        anasayfa: true,
        onay: true
    });

    const blog6 = await Blog.create({
        baslik: "Yapay Zeka Nedir?",
        url: "yapay-zeka",
        altbaslik: "AI dünyasına kısa bir giriş.",
        aciklama: "<p>Yapay zeka günümüzde birçok alanda kullanılmaktadır.</p>",
        resim: "6.jpg",
        anasayfa: false,
        onay: true
    });

    const blog7 = await Blog.create({
        baslik: "Git ve GitHub",
        url: "git-github",
        altbaslik: "Versiyon kontrol sistemlerini öğrenin.",
        aciklama: "<p>Git yazılım geliştirme süreçlerinde vazgeçilmezdir.</p>",
        resim: "7.jpg",
        anasayfa: true,
        onay: true
    });

    const blog8 = await Blog.create({
        baslik: "Frontend Yol Haritası",
        url: "frontend-roadmap",
        altbaslik: "Frontend geliştirici olmak için gerekenler.",
        aciklama: "<p>HTML, CSS ve JavaScript frontend'in temelidir.</p>",
        resim: "8.jpg",
        anasayfa: false,
        onay: true
    });

    const blog9 = await Blog.create({
        baslik: "Yazılımcılar İçin Kariyer Tavsiyeleri",
        url: "kariyer-tavsiyeleri",
        altbaslik: "İlk işinizi bulmanıza yardımcı olacak öneriler.",
        aciklama: "<p>Portföy oluşturmak ve GitHub kullanmak kariyeriniz için önemlidir.</p>",
        resim: "9.jpg",
        anasayfa: true,
        onay: true
    });


    await blog1.addCategories([yazilim, web]);
    await blog2.addCategories([yazilim, web]);
    await blog3.addCategories([yazilim, teknoloji]);
    await blog4.addCategories([teknoloji]);
    await blog5.addCategories([web]);
    await blog6.addCategories([yapayzeka, teknoloji]);
    await blog7.addCategories([yazilim, kariyer]);
    await blog8.addCategories([web, kariyer]);
    await blog9.addCategories([kariyer]);

    await adminUser.addBlogs([blog1, blog2, blog3, blog4]);
    await normalUser.addBlogs([blog5, blog6, blog7, blog8, blog9]);
}

module.exports = populate;