const Sequelize = require("sequelize");

const env = "dev"; // prod -> production (désactive les logs et paramètre le bon port pour postgres)

let options = {
    "host": "localhost",
    "dialect": "postgres",
    "timezone": "Europe/Paris"
};

if (env == "dev") {
    options.port = 5432;
} else if (env == "prod") {
    options.port = 6432;
    options.logging = false;
}

const sequelize = new Sequelize("maillage", "guillaume", "la pomme est verte", options);

module.exports = {
    "sequelize": sequelize
};
