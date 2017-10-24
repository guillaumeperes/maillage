const express = require("express");
const app = express();

// Port sur lequel le serveur NodeJs va écouter
const LISTEN_PORT = 55555;

// Classes du modèle
const model = require("./model");
const sequelize = model.sequelize;
const Category = model.Category;
const Tag = model.Tag;
const Event = model.Event;
const ActionType = model.ActionType;
const Mesh = model.Mesh;
const Image = model.Image;
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

// Fichiers statiques 
app.use(express.static(__dirname + "/public"));

// Liste les catégories avec leurs tags associés
app.get("/categories/list/", function(request, response) {
    Category.findAll({
        "include": [{
            "model": Tag,
            "include": {
                "model": MeshTag,
            }
        }],
        "order": [
            ["title", "ASC"],
            ["id", "ASC"],
            [Tag, "title", "ASC"],
            [Tag, "id", "ASC"]
        ]
    }).then(function(categories) {
        let out = categories.map(function(category) {
            let tags = category.tags.filter(function(tag) {
                return tag.meshesTags.length > 0;
            });
            tags = tags.map(function(tag) {
                let json = tag.toJSON();
                json.occurences = tag.meshesTags.length;
                return json;
            });
            let json = category.toJSON();
            json.tags = tags;
            return json;
        });
        out = out.filter(function(category) {
            return category.tags.length > 0;
        })
        response.json(out);
    });
});

// Recherche de fichiers de maillage
app.get("/meshes/search/", function(request, response) {
    Mesh.findAll({
        "include": [{
            "model": Tag,
        }, {
            "model": Image,
            "where": {
                "isDefault": true
            }
        }, {
            "model": User
        }],
        "order": [
            ["id", "ASC"]
        ]
    }).then(function(meshes) {
        response.json(meshes);
    });
});

// Lance le serveur
app.listen(LISTEN_PORT, function() {
    console.log("Le serveur est lancé et écoute sur le port : "+LISTEN_PORT);
});
