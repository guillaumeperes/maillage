const Sequelize = require("sequelize");
const express = require("express");
const app = express();

/**
* Port sur lequel Nodejs va écouter
*/
const LISTEN_PORT = 55555;

/**
* Charge les classes du modèle
*/
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

/**
* Autorise les requêtes http cross-domain
*/
app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

/**
* Sert les fichiers statiques
*/
app.use(express.static(__dirname + "/public"));

/**
* Liste les catégories disponibles avec leurs tags associés
*/
app.get("/categories/list/", function(request, response) {
    if (typeof request.query.filters === "object" && request.query.filters.length > 0) {
        var filters = request.query.filters.map(function(filter) {
            return parseInt(filter, 10) || 0;
        });
        filters = filters.filter(function(filter) {
            return filter > 0;
        });
    }
    Mesh.findAll({
        "include": [{
            "model": Tag,
            "include": [{
                "model": Category
            }]
        }]
    }).then(function(meshes) {
        // On commence par retirer les contenus qui n'ont pas les facettes recherchées
        if (typeof filters === "object" && filters.length > 0) {
            meshes = meshes.filter(function(mesh) {
                const tagsIds = mesh.tags.map(function(tag) {
                    return tag.id;
                });
                let accept = true;
                filters.forEach(function(filter) {
                    if (tagsIds.indexOf(filter) === -1) {
                        accept = false;
                    }
                });
                return accept;
            });
        }
        // On rassemble ensuite toutes les facettes des contenus qui correspondent à la recherche
        let tagsIds = [];
        meshes.forEach(function(mesh) {
            mesh.tags.forEach(function(tag) {
                if (tagsIds.indexOf(tag.id) === -1) {
                    tagsIds.push(tag.id);
                }
            });
        });
        // On recherche ensuite dans la db les tags qui correspondent à nos facettes
        Category.findAll({
            "include": [{
                "model": Tag,
                "where": Sequelize.or({"id": tagsIds}),
                "include": {
                    "model": Mesh
                }
            }],
            "order": [
                ["title", "ASC"],
                ["id", "ASC"],
                [Tag, "title", "ASC"],
                [Tag, "id", "ASC"]
            ]
        }).then(function(categories) {
            const out = categories.map(function(category) {
                let tags = category.tags.map(function(tag) {
                    if (typeof filters === "object" && filters.length > 0) {
                        // On calcule le nombre de contenus que ce prochain filtre nous permettra d'avoir
                        let json = tag.toJSON();
                        const nextMeshes = meshes.filter(function(mesh) {
                            const index = mesh.tags.findIndex(function(meshTag) {
                                return meshTag.id === tag.id;
                            });
                            return index !== -1;
                        });
                        json.occurences = nextMeshes.length;
                        return json;
                    } else {
                        // Pas de filtres sélectionnés
                        let json = tag.toJSON();
                        json.occurences = tag.meshes.length;
                        return json;
                    }
                });
                let json = category.toJSON();
                json.tags = tags;
                return json;
            });
            response.json(out);
        }).catch(function(error) {
            response.json([]);
        });
    }).catch(function(error) {
        response.json([]);
    });
});

/**
* Recherche de fichiers de maillage
*/
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
            ["id", "ASC"],
            [Tag, "title", "ASC"],
            [Tag, "id", "ASC"]
        ]
    }).then(function(meshes) {
        response.json(meshes);
    });
});

/**
* Crée un nouveau fichier de maillage dans la base de données
*/
app.put("/mesh/new/", function(request, response) {
    // TODO
});

/**
* Middleware
* Vérifie que le fichier de maillage identifié par "mesh_id" existe dans la base de données
*/
const checkMeshExists = function(request, response, next) {
    Mesh.findById(request.params.mesh_id).then(function(mesh) {
        if (mesh !== null) {
            next();
        } else {
            response.status(404);
            response.json({
                "code": 404,
                "error": "Le fichier de maillage demandé n'a pas été trouvé."
            });
            response.end();
        }
    }).catch(function(error) {
        response.status(404);
        response.json({
            "code": 404,
            "error": "Le fichier de maillage demandé n'a pas été trouvé."
        });
        response.end();
        return;
    });
};

/**
* Récupère les données d'un fichier de maillage
*/
app.get("/mesh/:mesh_id/view/", checkMeshExists, function(request, response) {
    Mesh.findById(request.params.mesh_id, {
        "include": [{
            "model": Tag
        }, {
            "model": Image
        }, {
            "model": User
        }]
    }).then(function(mesh) {
        response.json(mesh).end();
    });
});

/**
* Met à jour les données d'un fichier de maillage
*/
app.post("/mesh/:mesh_id/edit/", checkMeshExists, function(request, response) {
    // TODO
});

/**
* Supprime un fichier de maillage
*/
app.delete("/mesh/:mesh_id/delete/", checkMeshExists, function(request, response) {
    // TODO
});

/**
* Lance le serveur
*/
app.listen(LISTEN_PORT, function() {
    console.log("Le serveur est lancé et écoute sur le port : "+LISTEN_PORT);
});
