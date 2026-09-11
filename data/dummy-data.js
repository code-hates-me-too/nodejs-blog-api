const Blog = require("../models/blog");
const Category = require("../models/category");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Role = require("../models/role");

const RESIM = "pexels-pawelkalisinski-1076758-1787040417578.jpg";

async function populate() {

    const users = await User.bulkCreate([
        {
            fullname: "hokoko",
            username: "hokokoyum",
            email: "info@hokoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },
        {
            fullname: "mokoko",
            username: "mokokoyum",
            email: "info@mokoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m9okoaskoyum",
            email: "info@mokdsoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "moko24956koy9um",
            email: "info@moko2ko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m245o99kokoyum",
            email: "info@mok245oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mo9kok99o245yum",
            email: "info@moko4ko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m6oko65koyu9m",
            email: "info@m24okoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mo65496kokoyum",
            email: "info@mokok2456o.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mokokoy66u99m",
            email: "inf6o@mokok6o.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m66429okoko66yum",
            email: "in45fo@mok4oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mok245okoy99um",
            email: "info@moko4562ko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mok99o2456koyu9m",
            email: "i2456nfo@mokoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "moko654koyum",
            email: "in6fo@moko6645ko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mokok25oy6um",
            email: "info@mokoko66.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m24666okokoyum",
            email: "in6462fo@mokoko.c2om",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mo5koko4645yum",
            email: "in6fo@mok254oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mokok642oyum654",
            email: "in67fo@mokoko.com75",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "m76okokoyu77m",
            email: "in6fo@mo56k56oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "moko99k577yum7",
            email: "i5675nfo@mok99oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "moko789k577yum7",
            email: "i56759nfo@mok9oko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mokok577yum7",
            email: "i5675nfo@mokoko.co99m",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },{
            fullname: "mokoko",
            username: "mo9kok577yum7",
            email: "i5675nfo789@mokoko.com",
            password: await bcrypt.hash("12345", 10),
            emailDogrulandiMi: true
        },
    ]);

    const adminUser = users[0];
    const normalUser = users[1];

    const adminRole = await Role.create({ rolename: "admin" });
    const userRole = await Role.create({ rolename: "moderator" });
    const defaultRole = await Role.create({ rolename: "user" });

    await adminUser.addRoles([adminRole, userRole]);
    await normalUser.addRole(userRole);

    const count = await Category.count();
    if (count > 0) {
        return;
    }

    const yazilim = await Category.create({ categoryname: "Yazılım", url: "yazilim" });
    const teknoloji = await Category.create({ categoryname: "Teknoloji", url: "teknoloji" });
    const yapayzeka = await Category.create({ categoryname: "Yapay Zeka", url: "yapay-zeka" });
    const web = await Category.create({ categoryname: "Web Geliştirme", url: "web-gelistirme" });
    const kariyer = await Category.create({ categoryname: "Kariyer", url: "kariyer" });

    // Not: Blog modelindeki beforeValidate hook'u başlığa göre url'i
    // otomatik üretiyor, bu yüzden aşağıda 'url' alanını elle vermiyoruz.
    // 'onay: true' verilen her blog, aynı zamanda 'ilkOnayVerildiMi: true'
    // olmalı — yoksa admin panelinde "Yeni Blog Onayı Bekleyen" listesine
    // düşer (o alanın varsayılanı false).

    const blog1 = await Blog.create({
        baslik: "Node.js'e Giriş",
        altbaslik: "Node.js ile ilk uygulamanızı oluşturun.",
        aciklama: "<p>Node.js sunucu tarafında JavaScript çalıştırmayı sağlar.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog2 = await Blog.create({
        baslik: "Express Router Kullanımı",
        altbaslik: "Express'te route yapısını öğrenin.",
        aciklama: "<p>Express Router büyük projelerde kod düzenini kolaylaştırır.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog3 = await Blog.create({
        baslik: "Sequelize ORM",
        altbaslik: "SQL sorgularını ORM ile yönetin.",
        aciklama: "<p>Sequelize sayesinde SQL yerine JavaScript kullanabilirsiniz.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog4 = await Blog.create({
        baslik: "REST API Nedir?",
        altbaslik: "REST mimarisinin temelleri.",
        aciklama: "<p>REST API istemci ile sunucu arasında veri alışverişini sağlar.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog5 = await Blog.create({
        baslik: "Bootstrap Grid Sistemi",
        altbaslik: "Responsive tasarım oluşturun.",
        aciklama: "<p>Bootstrap grid sistemi sayfa düzenini kolaylaştırır.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog6 = await Blog.create({
        baslik: "Yapay Zeka Nedir?",
        altbaslik: "AI dünyasına kısa bir giriş.",
        aciklama: "<p>Yapay zeka günümüzde birçok alanda kullanılmaktadır.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog7 = await Blog.create({
        baslik: "Git ve GitHub",
        altbaslik: "Versiyon kontrol sistemlerini öğrenin.",
        aciklama: "<p>Git yazılım geliştirme süreçlerinde vazgeçilmezdir.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog8 = await Blog.create({
        baslik: "Frontend Yol Haritası",
        altbaslik: "Frontend geliştirici olmak için gerekenler.",
        aciklama: "<p>HTML, CSS ve JavaScript frontend'in temelidir.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog9 = await Blog.create({
        baslik: "Yazılımcılar İçin Kariyer Tavsiyeleri",
        altbaslik: "İlk işinizi bulmanıza yardımcı olacak öneriler.",
        aciklama: "<p>Portföy oluşturmak ve GitHub kullanmak kariyeriniz için önemlidir.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    // Sayfalama testi için birkaç ek, gerçekçi başlıklı blog.
    const blog10 = await Blog.create({
        baslik: "TypeScript'e Giriş",
        altbaslik: "Tip güvenliğiyle daha sağlam kod yazın.",
        aciklama: "<p>TypeScript, JavaScript'e statik tipler ekler.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog11 = await Blog.create({
        baslik: "Docker ile Konteynerleştirme",
        altbaslik: "Uygulamalarınızı taşınabilir hale getirin.",
        aciklama: "<p>Docker, uygulamaları izole ortamlarda çalıştırmayı sağlar.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog12 = await Blog.create({
        baslik: "CSS Grid ve Flexbox Karşılaştırması",
        altbaslik: "Hangi durumda hangisini kullanmalısınız?",
        aciklama: "<p>CSS Grid iki boyutlu, Flexbox tek boyutlu düzenler için idealdir.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog13 = await Blog.create({
        baslik: "PostgreSQL'e Başlangıç",
        altbaslik: "İlişkisel veritabanlarına giriş.",
        aciklama: "<p>PostgreSQL, açık kaynaklı güçlü bir ilişkisel veritabanıdır.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
    });

    const blog14 = await Blog.create({
        baslik: "Test Yazma Alışkanlığı Kazanmak",
        altbaslik: "Neden ve nasıl test yazmalısınız?",
        aciklama: "<p>Testler, kodunuzu güvenle değiştirebilmenizi sağlar.</p>",
        resim: RESIM,
        onay: true,
        ilkOnayVerildiMi: true
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
    await blog10.addCategories([yazilim, teknoloji]);
    await blog11.addCategories([teknoloji, web]);
    await blog12.addCategories([web]);
    await blog13.addCategories([yazilim, teknoloji]);
    await blog14.addCategories([kariyer, yazilim]);

    await adminUser.addBlogs([blog1, blog2, blog3, blog4]);
    await normalUser.addBlogs([blog5, blog6, blog7, blog8, blog9, blog10, blog11, blog12, blog13, blog14]);
}

module.exports = populate;