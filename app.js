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
app.get("/categories/alltags/", function(request, response){
 // On recherche ensuite dans la db les catégorie et tags associée
        Category.findAll({
            "include": [{
                "model": Tag
            }],
    "order": [
                ["title", "ASC"],
                ["id", "ASC"],
                [Tag, "title", "ASC"],
                [Tag, "id", "ASC"]
            ]
        }).then(function(categories) { 
            response.json(categories);
        }); 
});

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

    let wheres = {};

    // Recherche à facettes
    if (typeof filters === "object" && filters.length > 0) {
        const filtersBaseQuery = "(SELECT DISTINCT meshes.id FROM meshes INNER JOIN meshes_tags ON meshes.id = meshes_tags.meshes_id WHERE meshes_tags.tags_id = ?)";
        const filtersQueryArr = filters.map(function(filter) {
            return filtersBaseQuery.replace("?", filter);
        });
        const filtersQuery = filtersQueryArr.join(" INTERSECT ");
        wheres.id = {
            $in: sequelize.literal("(" + filtersQuery + ")")
        };
    }

    Mesh.findAll({
        "where": wheres,
        "include": [{
            "model": Tag,
            "include": [{
                "model": Category
            }]
        }]
    }).then(function(meshes) {
        // On récupère les tags des contenus qu'on a récupérés
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
        }).then(function(categories) {
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
* Liste des options de tri des fichiers de maillage supportés par l'application
*/
app.set("meshesSorts", [
    {
        "name": "title",
        "label": "Ordre alphabétique",
        "column": "title",
        "reverse": false,
        "default": true
    }, {
        "name": "title-reverse",
        "label": "Ordre alphabétique inverse",
        "column": "title",
        "reverse": true
    }, {
        "name": "cells",
        "label": "Nombre de cellules : croissant",
        "column": "cells",
        "reverse": false
    }, {
        "name": "cells-reverse",
        "label": "Nombre de cellules : décroissant",
        "column": "cells",
        "reverse": true
    }, {
        "name": "vertices",
        "label": "Nombre de sommets : croissant",
        "column": "vertices",
        "reverse": false
    }, {
        "name": "vertices-reverse",
        "label": "Nombre de sommets : décroissant",
        "column": "vertices",
        "reverse": true
    }, {
        "name": "created",
        "label": "Du plus ancien au plus récent",
        "column": "created",
        "reverse": false
    }, {
        "name": "created-reverse",
        "label": "Du plus récent au plus ancien",
        "column": "created",
        "reverse": true
    }
]);

/**
* Options disponibles pour trier les fichiers de maillage
*/
app.get("/meshes/sorts/", function(request, response) {
    const sorts = app.get("meshesSorts");
    const out = sorts.map(function(sort) {
        return {
            "name": sort.name,
            "label": sort.label,
            "default": sort.default ? true : false
        };
    });
    response.json(out);
});

/**
* Recherche de fichiers de maillage
*/
app.get("/meshes/search/", function(request, response) {
    if (typeof request.query.filters === "object" && request.query.filters.length > 0) {
        var filters = request.query.filters.map(function(filter) {
            return parseInt(filter, 10) || 0;
        });
        filters = filters.filter(function(filter) {
            return filter > 0;
        });
    }

    let wheres = {};

    // Recherche à facettes
    if (typeof filters === "object" && filters.length > 0) {
        const filtersBaseQuery = "(SELECT DISTINCT meshes.id FROM meshes INNER JOIN meshes_tags ON meshes.id = meshes_tags.meshes_id WHERE meshes_tags.tags_id = ?)";
        const filtersQueryArr = filters.map(function(filter) {
            return filtersBaseQuery.replace("?", filter);
        });
        const filtersQuery = filtersQueryArr.join(" INTERSECT ");
        wheres.id = {
            $in: sequelize.literal("(" + filtersQuery + ")")
        };
    }

    Mesh.findAll({
        "where": wheres,
        "include": [{
            "model": Tag,
        }, {
            "model": Image,
            "where": {
                "isDefault": true
            }
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
        const tagsIds = mesh.tags.map(function(tag) {
            return tag.id;
        });
        Category.findAll({
            "include": {
                "model": Tag,
                "where": Sequelize.or({"id": tagsIds})
            },
            "order": [
                ["title", "ASC"],
                ["id", "ASC"],
                [Tag, "title", "ASC"],
                [Tag, "id", "ASC"]
            ]
        }).then(function(categories) {
            mesh = mesh.toJSON();
            mesh.tagsCategories = categories;
            response.json(mesh).end();
        });
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
