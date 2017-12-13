const Sequelize = require("sequelize");
const express = require("express");
const validator = require("email-validator");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const app = express();

/**
* Port sur lequel Nodejs va écouter
*/
const LISTEN_PORT = 55555;

/**
* Clé utilisée pour encrypter les JWT
*/
const privateKey = "b02f6cbf19d00c656095d41d810e8953";

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
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

/**
* Sert les fichiers statiques
*/
app.use(express.static(__dirname + "/public"));

/**
* Parse les requêtes HTTP avec du JSON
*/
app.use(bodyParser.json());

/**
* Parse les requêtes HTTP avec des données issues d'un formulaire
*/
app.use(bodyParser.urlencoded({ extended: true }));


/* ============================================================ */
/*                      MIDDLEWARES                             */
/* ============================================================ */

/**
* Vérifie que le fichier de maillage identifié par "mesh_id" existe dans la base de données
*/
const checkMeshExists = function(request, response, next) {
    Mesh.findById(request.params.mesh_id).then(function(mesh) {
        if (!mesh) {
            response.status(404).json({
                "code": 404,
                "error": "Le fichier de maillage demandé n'a pas été trouvé."
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(404).json({
            "code": 404,
            "error": "Le fichier de maillage demandé n'a pas été trouvé."
        }).end();
        return;
    });
};

/**
* Vérifie la validité du token de connexion envoyé par le client
*/
const checkUserTokenIsValid = function(request, response, next) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    if (!token) {
        response.status(500).json({
            "code": 500,
            "error": "Le token de connexion est absent."
        }).end();
        return;
    }
    try {
        const payload = jwt.verify(token, privateKey);
        User.findById(payload.uid).then(function(user){
            if (!user) {
                response.status(500).json({
                    "code": 500,
                    "error": "Le token de connexion est invalide."
                }).end();
                return;
            } else {
                next();
            }
        }).catch(function(error) {
            response.status(500).json({
                "code": 500,
                "error": "Le token de connexion est invalide."
            }).end();
            return;
        });
    } catch (error) {
        response.status(500).json({
            "code": 500,
            "error": "Le token de connexion est invalide."
        }).end();
        return;
    }
};

/**
* Vérifie que l'utilisateur dont le token de connexion est passé en paramètre a le rôle d'administrateur
*/
const checkUserIsAdmin = function(request, response, next) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    User.findById(payload.uid, {
        "include": [{
            "model": Role
        }]
    }).then(function(user) {
        const role = user.roles.find(function(role) {
            return role.name == "administrator";
        });
        if (!role) {
            response.status(403).json({
                "code": 403, 
                "error": "Vous n'avez pas les permissions suffisantes pour accéder à cette page"
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
};

/**
* Vérifie que l'utilisateur dont le token de connexion est passé en paramètre a le rôle de contributeur
*/
const checkUserIsContributor = function(request, response, next) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    User.findById(payload.uid, {
        "include": [{
            "model": Role
        }]
    }).then(function(user) {
        const role = user.roles.find(function(role) {
            return role.name == "contributor";
        });
        if (!role) {
            response.status(403).json({
                "code": 403, 
                "error": "Vous n'avez pas les permissions suffisantes pour accéder à cette page"
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
};

/**
* Vérifie que la catégorie "categoryId" existe
*/
const checkCategoryExists = function(request, response, next) {
    Category.findById(request.params.categoryId).then(function(category) {
        if (!category) {
            response.status(404).json({
                "code": 404,
                "error": "La catégorie demandée n'a pas été trouvée."
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(404).json({
            "code": 404,
            "error": "La catégorie demandée n'a pas été trouvée."
        }).end();
        return;
    });
};

/**
* Vérifie que la catégorie correspondant à "categoryId" n'est pas protégée
*/
const checkCategoryIsNotProtected = function(request, response, next) {
    Category.findById(request.params.categoryId).then(function(category) {
        if (category.protected) {
            response.status(500).json({
                "code": 500,
                "error": "Cette catégorie est protégée."
            }).end();
            return;
        }
        next();
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur est survenue."
        }).end();
        return;
    });
};

/**
* Vérifie que le tag "tagId" existe
*/
const checkTagExists = function(request, response, next) {
    Tag.findById(request.params.tagId).then(function(tag) {
        if (!tag) {
            response.status(404).json({
                "code": 404,
                "error": "Le tag demandé n'a pas été trouvé."
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(404).json({
            "code": 404,
            "error": "Le tag demandé n'a pas été trouvé."
        }).end();
        return;
    });
};

/**
* Vérifie que le tag "tagId" n'est pas protégé
*/
const checkTagIsNotProtected = function(request, response, next) {
    Tag.findById(request.params.tagId).then(function(tag) {
        if (tag.protected) {
            response.status(500).json({
                "code": 500,
                "error": "Ce tag est protégé."
            }).end();
            return;
        }
        next();
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur est survenue."
        }).end();
        return;
    });
};

/**
* Vérifie que l'utilisateur "UserId" existe
*/
const checkUserExists = function(request, response, next){
    User.findById(request.params.userId).then(function(user){
        if (!user){
            response.status(404).json({
                "code": 404,
                "error": "L'utisateur demandé n'a pas été trouvé."
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        response.status(404).json({
            "code": 404,
            "error": "L'utisateur demandé n'a pas été trouvé."
        }).end();
        return;
    });
};


/**
* Vérifie que l'utilisateur n'est pas lui même
*/
const checkUserIsNotMe = function(request, response, next){
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    if (payload.uid == request.params.userId){
        response.status(500).json({
                "code": 500,
                "error": "Te supprime pas toi même boufon"
            }).end();
            return;
        }
        next();
};


/* ============================================================ */
/*                        ROUTES                                */
/* ============================================================ */

/**
* Liste les catégories disponibles avec leurs tags associés
*/
app.get("/categories/alltags/", function(request, response){
    Category.findAll({
        "include": [{
            "model": Tag,
            "include": [{
                "model": Mesh
            }]
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
* Liste des utilisateurs
*/
app.get("/users/list/", function(request, response){
    User.findAll({
            "include": [{
                "model": Role
            }],
    "order": [
                ["email", "ASC"],
                ["id", "ASC"],
                [Role, "title", "ASC"],
                [Role, "id", "ASC"]
            ]
        }).then(function(users) { 
            response.json(users);
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
* Créer une nouvelle catégorie
*/
app.put("/categories/new/", [checkUserTokenIsValid, checkUserIsAdmin], function(request, response) {
    let data = request.body;

    // Validation des données
    if (data.title == null || !data.title.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner un titre pour la nouvelle catégorie."
        }).end();
        return;
    }
    if (data.color == null || !data.color.length) {
        data.color = "#e8e8e8";
    }
    if (/^#[0-9A-F]{6}$/i.test(data.color) == false) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner une couleur sous la forme d'une représentation hexadécimale valide."
        }).end();
        return;
    }

    // Création de la catégorie
    Category.create({
        "title": data.title,
        "color": data.color,
        "protected": false
    }).then(function(category) {
        category = category.toJSON();
        category.tags = [];
        response.status(200).json({
            "code": 200,
            "message": "La catégorie a été créée avec succès.",
            "data": {
                "category": category
            }
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Détail d'une catégorie
*/
app.get("/categories/:categoryId([0-9]*)/detail/", [checkUserTokenIsValid, checkUserIsAdmin, checkCategoryExists], function(request, response) {
    Category.findById(request.params.categoryId).then(function(category) {
        response.status(200).json({
            "code": 200,
            "message": "",
            "data": {
                "category": category
            }
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Modifier une catégorie
*/
app.post("/categories/:categoryId([0-9]*)/edit/", [checkUserTokenIsValid, checkUserIsAdmin, checkCategoryExists, checkCategoryIsNotProtected], function(request, response) {
    let data = request.body;

    // Validation des données
    if (data.title == null || !data.title.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner un titre pour la nouvelle catégorie."
        }).end();
        return;
    }
    if (data.color == null || !data.color.length) {
        data.color = "#e8e8e8";
    }
    if (/^#[0-9A-F]{6}$/i.test(data.color) == false) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner une couleur sous la forme d'une représentation hexadécimale valide."
        }).end();
        return;
    }

    // Mise à jour de la catégorie
    Category.findById(request.params.categoryId, {
        "include": [{
            "model": Tag,
            "include": [{
                "model": Mesh
            }]
        }]
    }).then(function(category) {
        category.update({
            "title": data.title,
            "color": data.color
        }).then(function(category) {
            response.status(200).json({
                "code": 200,
                "message": "La catégorie a été mise à jour avec succès.",
                "data": {
                    "category": category
                }
            }).end();
            return;
        });
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Supprime une catégorie
*/
app.delete("/categories/:categoryId([0-9]*)/delete/", [checkUserTokenIsValid, checkUserIsAdmin, checkCategoryExists, checkCategoryIsNotProtected], function(request, response) {
    Category.findById(request.params.categoryId).then(function(category) {
        category.destroy();
        response.status(200).json({
            "code": 200,
            "message": "La catégorie a été supprimée avec succès"
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Créer un nouveau tag dans une catégorie
*/
app.put("/categories/:categoryId([0-9]*)/tags/new/", [checkUserTokenIsValid, checkUserIsAdmin, checkCategoryExists], function(request, response) {
    let data = request.body;

    // Vérification des données
    if (data.title == null || !data.title.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner un titre pour le nouveau tag."
        }).end();
        return;
    }

    // Création du nouveau tag
    Tag.create({
        "categoriesId": request.params.categoryId,
        "title": data.title
    }).then(function(tag) {
        tag = tag.toJSON();
        tag.meshes = [];
        response.status(200).json({
            "code": 200,
            "message": "Le tag a été créé avec succès.",
            "data": {
                "tag": tag
            }
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Détail d'un tag
*/
app.get("/tags/:tagId([0-9]*)/detail/", [checkUserTokenIsValid, checkUserIsAdmin, checkTagExists], function(request, response) {
    Tag.findById(request.params.tagId).then(function(tag) {
        response.status(200).json({
            "code": 200,
            "message": "",
            "data": {
                "tag": tag
            }
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Modifier un tag
*/
app.post("/tags/:tagId([0-9]*)/edit/", [checkUserTokenIsValid, checkUserIsAdmin, checkTagExists, checkTagIsNotProtected], function(request, response) {
    let data = request.body;

    // Vérification des données
    if (data.title == null || !data.title.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner un titre pour le nouveau tag."
        }).end();
        return;
    }

    // Mise à jour du tag
    Tag.findById(request.params.tagId, {
        "include": [{
            "model": Mesh
        }]
    }).then(function(tag) {
        tag.update({
            "title": data.title
        }).then(function(tag) {
            response.status(200).json({
                "code": 200,
                "message": "LE tag a été mis à jour avec succès.",
                "data": {
                    "tag": tag
                }
            }).end();
            return;
        });
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Supprimer un tag
*/
app.delete("/tags/:tagId([0-9]*)/delete/", [checkUserTokenIsValid, checkUserIsAdmin, checkTagExists, checkTagIsNotProtected], function(request, response) {
    Tag.findById(request.params.tagId).then(function(tag) {
        tag.destroy();
        response.status(200).json({
            "code": 200,
            "message": "Le tag a été supprimé avec succès."
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Inscription
*/
app.post("/register", function(request, response) {
    const data = request.body;

    // Vérification des données
    if (data.email == null || !data.email.length || !validator.validate(data.email)) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner une adresse e-mail valide."
        }).end();
        return;
    }
    if (data.password == null || !data.password.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner votre mot de passe."
        }).end();
        return;
    }
    if (data.password.length < 5) {
        response.status(500).json({
            "code": 500,
            "error": "Votre mot de passe doit comporter au moins 5 caractères."
        }).end();
        return;
    }
    if (data.password2 == null || !data.password2.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de confirmer votre mot de passe."
        }).end();
        return;
    }
    if (data.password !== data.password2) {
        response.status(500).json({
            "code": 500,
            "error": "Votre mot de passe et sa confirmation doivent être identiques."
        }).end();
        return;
    }

    // On vérifie qu'il n'y a pas déjà un user avec l'adresse e-mail renseignée
    User.count({
        "where": {
            "email": data.email
        }
    }).then(function(count) {
        if (count > 0) {
            // Il y a déjà un utilisateur avec l'adresse e-mail renseignée
            response.status(500).json({
                "code": 500,
                "error": "Cette adresse e-mail est déjà associée à un compte existant."
            }).end();
            return;
        } else {
            // Nouvelle adresse e-mail, on insère le nouvel utilisateur dans la base de données
            const salt = User.generateSalt();
            let o = {
                "email": data.email.toLocaleLowerCase().trim(),
                "salt": salt,
                "password": User.encryptPassword(data.password, salt)
            };
            if (data.firstname != null && data.firstname.length) {
                o.firstname = data.firstname.trim();
            }
            if (data.lastname != null && data.lastname.length) {
                o.lastname = data.lastname.toLocaleUpperCase().trim();
            }
            User.create(o).then(function() {
                response.status(200).json({
                    "code": 200,
                    "message": "Votre compte utilisateur a bien été créé."
                }).end();
                return;
            }).catch(function() {
                response.status(500).json({
                    "code": 500,
                    "error": "Une erreur s'est produite. Merci de réessayer l'opération."
                }).end();
                return;
            });
        }
    });
});


/**
* Connexion
*/
app.post("/login", function(request, response) {
    const data = request.body;

    // Vérification des données
    if (data.email == null || !data.email.length || !validator.validate(data.email)) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner une adresse e-mail valide."
        }).end();
        return;
    }
    if (data.password == null || !data.password.length) {
        response.status(500).json({
            "code": 500,
            "error": "Merci de renseigner votre mot de passe."
        }).end();
        return;
    }

    // Recherche de l'utilisateur dans la base de données
    User.findOne({
        "where": {
            "email": data.email
        }
    }).then(function(user) {
        // Utilisateur existant ?
        if (!user) {
            response.status(500).json({
                "code": 500,
                "error": "Cette adresse e-mail ne correspond à aucun compte existant."
            }).end();
            return;
        }
        // Utilisateur validé par un admin ?
        if (user.confirmed == null) {
            response.status(500).json({
                "code": 500,
                "error": "Ce compte n'a pas encore été activé."
            }).end();
            return;
        }
        // Utilisateur non supprimé par un admin ?
        if (user.deleted != null) {
            response.status(500).json({
                "code": 500,
                "error": "Ce compte a été désactivé."
            }).end();
            return;
        }
        // Mot de passe ok ?
        if (user.password != User.encryptPassword(data.password, user.salt)) {
            response.status(500).json({
                "code": 500,
                "error": "Mot de passe incorrect."
            }).end();
            return;
        }

        // Création d'un json web token
        // https://www.npmjs.com/package/jsonwebtoken
        const d = new Date();
        const payload = {
            "uid": user.id,
            "nbf": Math.round(d.getTime() / 1000),
            "iat": Math.round(d.getTime() / 1000),
            "exp": Math.round((d.getTime() / 1000) + (14 * 24 * 60 * 60)), // 14 jour
            "iss": "/"
        };
        const token = jwt.sign(payload, privateKey);
        response.status(200).json({
            "code": 200,
            "message": "Vous vous êtes connecté avec succès.",
            "data": {
                "createdAt": payload.nbf,
                "expiresAt": payload.exp,
                "token": token
            }
        }).end();
        return;
    }).catch(function() {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite. Merci de retenter l'opération."
        }).end();
        return;
    });
});

/**
* Permet l'obtention d'un nouveau token de connexion avant que celui qui est envoyé n'expire
*/
app.get("/user/revive", checkUserTokenIsValid, function(request, response) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    User.findById(payload.uid).then(function(user) {
        const d = new Date();
        const newPayload = {
            "uid": user.id,
            "nbf": Math.round(d.getTime() / 1000),
            "iat": Math.round(d.getTime() / 1000),
            "exp": Math.round((d.getTime() / 1000) + (14 * 24 * 60 * 60)), // 14 jour
            "iss": "/"
        };
        const newToken = jwt.sign(newPayload, privateKey);
        response.status(200).json({
            "code": 200,
            "message": "Le token de connexion a été régénéré avec succès.",
            "data": {
                "createdAt": newPayload.nbf,
                "expiresAt": newPayload.exp,
                "token": newToken
            }
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur inconnue s'est produite."
        }).end();
        return;
    });
});

app.delete("/users/:userId([0-9]*)/delete",[checkUserTokenIsValid, checkUserIsAdmin, checkUserExists, checkUserIsNotMe], function(request, response){
        User.findById(request.params.userId).then(function(user) {
        user.destroy();
        response.status(200).json({
            "code": 200,
            "message": "L'utilisateur a été supprimée avec succès"
        }).end();
        return;
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});   



/* ============================================================ */
/*                  LANCEMENT DU SERVEUR                        */
/* ============================================================ */

/**
* Lance le serveur
*/
app.listen(LISTEN_PORT, function() {
    console.log("Le serveur est lancé et écoute sur le port : "+LISTEN_PORT);
});
