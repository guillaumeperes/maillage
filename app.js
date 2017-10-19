const express = require("express");
const app = express();

// Port sur lequel le serveur NodeJs va écouter
const LISTEN_PORT = 55555;

// Classes du modèle
const model = require("./model");
const Category = model.Category;
const Tag = model.Tag;
const Event = model.Event;
const ActionType = model.ActionType;
const Mesh = model.Mesh;
const MeshTag = model.MeshTag;
const Role = model.Role;
const User = model.User;
const UserRole = model.UserRole;

// Permet les requêtes cross-domain
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// Liste les catégories avec leurs tags associés
app.get("/categories/list/", function(request, response) {
    Category.findAll({
        "order": [
            ["title", "ASC"],
            ["id", "ASC"]
        ],
        "include": [{
            "model": Tag,
            "order": [
                ["title", "ASC"],
                ["id", "ASC"]
            ]
        }]
    }).then(function(categories) {
        let out = categories.filter(function(category) {
            return category.tags.length > 0;
        });
        response.json(out);
    });
});

// Lance le serveur
app.listen(LISTEN_PORT, function() {
    console.log("Le serveur est lancé et écoute sur le port : "+LISTEN_PORT);
});
