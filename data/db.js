// const mysql = require("mysql2");
const config = require("../config");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
    dialect: "mysql",
    host: config.db.host
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("MySQL server bağlantısı yapıldı");
    } catch (err) {
        console.log("Bağlantı hatası:", err);
    }
};

connectDB();

module.exports = sequelize;

// let connection = mysql.createConnection(config.db);

// connection.connect((err) => {
//     if(err){
//         return console.log(err);
//     }
//     console.log("mysql server bağlantısı kuruldu");
// });

// module.exports = connection.promise();