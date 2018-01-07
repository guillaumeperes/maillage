const Sequelize = require("sequelize");
const express = require("express");
const validator = require("email-validator");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const md5 = require("md5");
const uniqid = require("uniqid");
const fs = require("fs");
const sharp = require("sharp");
const normalize = require("normalize-strings");
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

/**
* Paramétrage du répertoire de destination des fichiers uploadés
*/
const uploadStorage = multer.diskStorage({
    "destination": function(request, file, cb) {
        cb(null, __dirname + "/tmp");
    },
    "filename": function(request, file, cb) {
        cb(null, md5(uniqid()) + "-" + Date.now());
    }
});

/**
* Paramétrage de l'upload des images
*/
const upload = multer({
    "storage": uploadStorage,
    "limits": {
        "fileSize": 104857600
    }
});

/* ============================================================ */
/*                      UTILIRAIRES                             */
/* ============================================================ */

/**
* Nettoie les éventuels fichiers uploadés lors d'une requête
*/
const cleanUploadedFiles = function(files) {
    files.forEach(function(file) {
        fs.unlink(file.path, function(err) {
            // Do nothing even if an error occured
        });
    });
};

/* ============================================================ */
/*                      MIDDLEWARES                             */
/* ============================================================ */

/**
* Vérifie que le fichier de maillage identifié par "mesh_id" existe dans la base de données
*/
const checkMeshExists = function(request, response, next) {
    Mesh.findById(request.params.mesh_id).then(function(mesh) {
        if (!mesh) {
            if (request.files != null) {
                cleanUploadedFiles(request.files);
            }
            response.status(404).json({
                "code": 404,
                "error": "Le fichier de maillage demandé n'a pas été trouvé."
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        if (request.files != null) {
            cleanUploadedFiles(request.files);
        }
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
        if (request.files != null) {
            cleanUploadedFiles(request.files);
        }
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
                if (request.files != null) {
                    cleanUploadedFiles(request.files);
                }
                response.status(500).json({
                    "code": 500,
                    "error": "Le token de connexion est invalide."
                }).end();
                return;
            } else {
                next();
            }
        }).catch(function(error) {
            if (request.files != null) {
                cleanUploadedFiles(request.files);
            }
            response.status(500).json({
                "code": 500,
                "error": "Le token de connexion est invalide."
            }).end();
            return;
        });
    } catch (error) {
        if (request.files != null) {
            cleanUploadedFiles(request.files);
        }
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
            if (request.files != null) {
                cleanUploadedFiles(request.files);
            }
            response.status(403).json({
                "code": 403, 
                "error": "Vous n'avez pas les permissions suffisantes pour accéder à cette page"
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        if (request.files != null) {
            cleanUploadedFiles(request.files);
        }
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
            if (request.files != null) {
                cleanUploadedFiles(request.files);
            }
            response.status(403).json({
                "code": 403, 
                "error": "Vous n'avez pas les permissions suffisantes pour accéder à cette page"
            }).end();
            return;
        } else {
            next();
        }
    }).catch(function(error) {
        if (request.files != null) {
            cleanUploadedFiles(request.files);
        }
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
            "error": "Il est impossible de supprimer son propre compte."
        }).end();
        return;
    } else {
        next();
    }
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
    const buildSubquery = function(filters, keyword, isForCountingMeshes) {
        let wheres = [];

        // Recherche à facettes
        if (filters != null && filters.length > 0) {
            const filtersBaseQuery = "(SELECT DISTINCT meshes.id FROM meshes INNER JOIN meshes_tags ON meshes.id = meshes_tags.meshes_id WHERE meshes_tags.tags_id = ?)";
            const filtersQueryArr = filters.map(function(filter) {
                return filtersBaseQuery.replace("?", filter);
            });
            const filtersQuery = filtersQueryArr.join(" INTERSECT ");
            wheres.push("meshes.id IN (" + filtersQuery + ")");
        }

        // Recherche fulltext
        if (keyword != null && keyword.length > 0) {
            const keywords = normalize(keyword).replace(/[^a-z0-9\s]/i, " ").replace(/\s+/, " ").toLowerCase().trim().split(" ");
            let ors = [];
            keywords.forEach(function(keyword) {
                ors.push("trim(regexp_replace(regexp_replace(unaccent(lower(meshes.title)), '[^a-z0-9\\s]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE " + sequelize.escape("%" + keyword + "%"));
                ors.push("trim(regexp_replace(regexp_replace(unaccent(lower(meshes.description)), '[^a-z0-9\\s]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE " + sequelize.escape("%" + keyword + "%"));
            });
            wheres.push("(" + ors.join(" OR ") + ")");
        }

        // Construction de la sous-requête
        let subquery = "SELECT DISTINCT meshes.id FROM meshes";
        if (wheres.length > 0) {
            subquery += " WHERE " + wheres.join(" AND ");
        }
        return isForCountingMeshes ? subquery : "SELECT DISTINCT tags_id FROM meshes_tags WHERE meshes_id IN (" + subquery + ")";
    };

    let filters = [];
    if (typeof request.query.filters === "object" && request.query.filters.length > 0) {
        filters = request.query.filters.map(function(filter) {
            return parseInt(filter, 10) || 0;
        });
        filters = filters.filter(function(filter) {
            return filter > 0;
        });
    }
    let keyword = null;
    if (request.query.keyword != null && request.query.keyword.length > 0) {
        keyword = request.query.keyword;
    }

    Category.findAll({
        "include": [{
            "model": Tag,
            "where": {
                "id": {
                    $in: sequelize.literal("(" + buildSubquery(filters, keyword, false) + ")")
                }
            }
        }],
        "order": [
            ["title", "ASC"],
            ["id", "ASC"],
            [Tag, "title", "ASC"],
            [Tag, "id", "ASC"]
        ]
    }).then(function(categories) {
        let out = {};
        categories.forEach(function(category) {
            out[category.id] = {};
        });
        const promises = categories.map(function(category) {
            let tags = {};
            category.tags.forEach(function(tag) {
                tags[tag.id] = {};
            });
            const promises = category.tags.map(function(tag) {
                const nextFilters = [].concat(filters, [tag.id]);
                return sequelize.query("SELECT COUNT(DISTINCT meshes.id) AS count FROM meshes WHERE meshes.id IN (" + buildSubquery(nextFilters, keyword, true) + ")", {type: sequelize.QueryTypes.SELECT}).then(function(result) {
                    tag = tag.toJSON();
                    tag.occurences = result[0].count;
                    tags[tag.id] = tag;
                });
            });
            return Promise.all(promises).then(function() {
                category = category.toJSON();
                category.tags = Object.keys(tags).map(function(key) {
                    return tags[key];
                });
                out[category.id] = category;
            });
        });
        Promise.all(promises).then(function() {
            out = Object.keys(out).map(function(key) {
                return out[key];
            });
            response.status(200).json(out).end();
            return;
        }).catch(function(error) {
            response.status(500).json([]).end();
            return;
        });
    }).catch(function(error) {
        response.status(500).json([]).end();
        return;
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

app.set("meshesSorts", {
    "title": {
        "label": "Ordre alphabétique",
        "column": "title",
        "reverse": false,
        "default": true
    },
    "title-reverse": {
        "label": "Ordre alphabétique inverse",
        "column": "title",
        "reverse": true
    },
    "cells": {
        "label": "Nombre de cellules : croissant",
        "column": "cells",
        "reverse": false
    },
    "cells-reverse": {
        "label": "Nombre de cellules : décroissant",
        "column": "cells",
        "reverse": true
    },
    "vertices": {
        "label": "Nombre de sommets : croissant",
        "column": "vertices",
        "reverse": false
    },
    "vertices-reverse": {
        "label": "Nombre de sommets : décroissant",
        "column": "vertices",
        "reverse": true
    },
    "created": {
        "label": "Du plus ancien au plus récent",
        "column": "created",
        "reverse": false
    },
    "created-reverse": {
        "label": "Du plus récent au plus ancien",
        "column": "created",
        "reverse": true
    }
});

/**
* Options disponibles pour trier les fichiers de maillage
*/
app.get("/meshes/sorts/", function(request, response) {
    const sorts = app.get("meshesSorts");
    const keys = Object.keys(sorts);
    const out = keys.map(function(key) {
        return {
            "name": key,
            "label": sorts[key].label,
            "default": sorts[key].default ? true : false
        };
    });
    response.status(200).json(out).end();
    return;
});

/**
* Recherche de fichiers de maillage
*/
app.get("/meshes/search/", function(request, response) {
    const page = parseInt(request.query.page, 10) || 1;
    const pageSize = parseInt(request.query.pageSize, 10) || 20;
    let wheres = {};

    // Recherche à facettes

    if (typeof request.query.filters === "object" && request.query.filters.length > 0) {
        let filters = request.query.filters.map(function(filter) {
            return parseInt(filter, 10) || 0;
        });
        filters = filters.filter(function(filter) {
            return filter > 0;
        });
        if (filters.length > 0) {
            const filtersBaseQuery = "(SELECT DISTINCT meshes.id FROM meshes INNER JOIN meshes_tags ON meshes.id = meshes_tags.meshes_id WHERE meshes_tags.tags_id = ?)";
            const filtersQueryArr = filters.map(function(filter) {
                return filtersBaseQuery.replace("?", filter);
            });
            const filtersQuery = filtersQueryArr.join(" INTERSECT ");
            wheres.id = {
                $in: sequelize.literal("(" + filtersQuery + ")")
            };
        }
    }

    // Recherche fulltext

    if (request.query.keyword != null && request.query.keyword.length > 0) {
        const keywords = normalize(request.query.keyword).replace(/[^a-z0-9\s]/i, " ").replace(/\s+/, " ").toLowerCase().trim().split(" ");
        let ors = [];
        keywords.forEach(function(keyword) {
            ors.push(sequelize.literal("trim(regexp_replace(regexp_replace(unaccent(lower(meshes.title)), '[^a-z0-9\\s]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE " + sequelize.escape("%" + keyword + "%")));
            ors.push(sequelize.literal("trim(regexp_replace(regexp_replace(unaccent(lower(meshes.description)), '[^a-z0-9\\s]', ' ', 'g'), '\\s+', ' ', 'g')) LIKE " + sequelize.escape("%" + keyword + "%")));
        });
        wheres = Object.assign({}, wheres, {
            $or: ors
        });
    }

    // Order by
    let selectedSort = request.query.sort || "title";
    if (app.get("meshesSorts")[selectedSort] == null) {
        selectedSort = "title";
    }
    const sort = app.get("meshesSorts")[selectedSort];
    const orderColumn = sort.column;
    const orderDirection = sort.reverse ? "DESC" : "ASC";

    let res = {};
    let promises = [];
    
    // Nombre de résultats
    promises[0] = Mesh.count({
        "where": wheres,
    }).then(function(count) {
        res.count = count;
    });
    // Données
    promises[1] = Mesh.findAll({
        "where": wheres,
        "offset": (page - 1) * pageSize,
        "limit": pageSize,
        "include": [{
            "model": Tag,
            "include": [{
                "model": Category
            }]
        }, {
            "model": Image,
            "where": {
                "isDefault": true
            }
        }],
        "order": [
            [orderColumn, orderDirection],
            ["id", "ASC"],
            [Tag, "title", "ASC"],
            [Tag, "id", "ASC"]
        ]
    }).then(function(meshes) {
        res.results = meshes;
    });

    Promise.all(promises).then(function() {
        response.status(200).json(res).end();
        return;
    }).catch(function() {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Crée un nouveau fichier de maillage dans la base de données
*/
app.put("/mesh/new/", [checkUserTokenIsValid, checkUserIsContributor, upload.any()], function(request, response) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    User.findById(payload.uid).then(function(user) {
        const data = request.body;

        // Vérification des données requises

        if (data.title == null || !data.title.length) {
            cleanUploadedFiles(request.files);
            response.status(500).json({
                "code": 500,
                "error": "Le titre n'est pas renseigné ou n'est pas valide."
            }).end();
            return;
        }
        if (data.vertices == null || !data.vertices.length || /^(0|[1-9]\d*)$/.test(data.vertices) === false) {
            cleanUploadedFiles(request.files);
            response.status(500).json({
                "code": 500,
                "error": "Le nombre de sommets n'est pas renseigné ou n'est pas valide."
            }).end();
            return;
        }
        if (data.cells == null || !data.cells.length || /^(0|[1-9]\d*)$/.test(data.cells) === false) {
            cleanUploadedFiles(request.files);
            response.status(500).json({
                "code": 500,
                "error": "Le nombre de cellules n'est pas renseigné ou n'est pas valide."
            }).end();
            return;
        }
        const meshfile = request.files.find(function(file) {
            return file.fieldname == "newMesh";
        });
        if (meshfile == null) {
            cleanUploadedFiles(request.files);
            response.status(500).json({
                "code": 500,
                "error": "Le fichier de maillage n'est pas renseigné."
            }).end();
            return;
        }

        let createdMesh = null; // Mesh nouvellement créé
        
        // Traitement des données

        const extension = meshfile.originalname.split(".").pop();
        const newPath = __dirname + "/meshes/" + md5(uniqid()) + "." + extension;
        fs.rename(meshfile.path, newPath, function(error) {
            if (error) {
                cleanUploadedFiles(request.files);
                response.status(500).json({
                    "code": 500,
                    "error": "Merci de renseigner un fichier de maillage."
                }).end();
                return;
            }
            let content = {
                "usersId": user.id,
                "title": data.title,
                "vertices": data.vertices,
                "cells": data.cells,
                "filename": meshfile.originalname,
                "filepath": newPath,
                "filesize": meshfile.size,
                "filetype": extension,
                "description": (data.description != null && data.description.length > 0) ? data.description : null 
            };

            let createdFiles = []; // liste des fichiers créés (pour un éventuel nettoyage)
            sequelize.transaction(function(t) {
                return Mesh.create(content, {"transaction": t}).then(function(mesh) {
                    createdMesh = mesh; // Sauvegarde du mesh créé
                    // Tags
                    let promises = [];
                    if (request.body.tags != null) {
                        const tags = request.body.tags.split(",");
                        promises = tags.map(function(tag) {
                            return MeshTag.create({
                                "tagsId": tag,
                                "meshesId": mesh.id
                            }, {"transaction": t});
                        });
                    }
                    return Promise.all(promises).then(function() {
                        // Images
                        const authorizedMimetypes = ["image/jpeg", "image/gif", "image/png"];
                        const promises = request.files.map(function(file, i) {
                            if (file.fieldname == "newImage" && authorizedMimetypes.indexOf(file.mimetype) != -1) {
                                let promises = [];
                                // Miniature
                                const thumbname = md5(uniqid()) + ".jpg";
                                const thumbpath = __dirname + "/public/up/img/" + thumbname;
                                createdFiles.push(thumbpath);
                                const thumb = sharp(file.path);
                                thumb.resize(90, 90);
                                thumb.crop(sharp.gravity.center);
                                thumb.toColorspace("srgb");
                                thumb.jpeg({"quality": 90});
                                promises.push(thumb.toFile(thumbpath));
                                // Grand format
                                const name = md5(uniqid()) + ".jpg";
                                const path = __dirname + "/public/up/img/" + name;
                                createdFiles.push(path);
                                const img = sharp(file.path);
                                img.resize(500, 500);
                                img.crop(sharp.gravity.center);
                                img.toColorspace("srgb");
                                img.jpeg({"quality": 90});
                                promises.push(img.toFile(path));
                                // Sauvegarde
                                return Promise.all(promises).then(function() {
                                    return Image.create({
                                        "meshesId": mesh.id,
                                        "type": "image/jpeg",
                                        "path": path,
                                        "uri": "/up/img/" + name,
                                        "thumbPath": thumbpath,
                                        "thumbUri": "/up/img/" + thumbname,
                                        "isDefault": i == 0 ? true : false
                                    }, 
                                    {"transaction": t});
                                });
                            }
                        });
                        return Promise.all(promises);
                    });
                });
            }).then(function(result) {
                cleanUploadedFiles(request.files);
                Mesh.findById(createdMesh.id, {
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
                }).then(function(mesh) {
                    response.status(200).json({
                        "code": 200,
                        "message": "Le fichier de maillage a été ajouté avec succès",
                        "data": {
                            "mesh": mesh
                        }
                    }).end();
                    return;
                });
            }).catch(function(error) {
                cleanUploadedFiles(request.files);
                fs.unlink(newPath, function() {
                    // Do nothing
                });
                createdFiles.forEach(function(createdFile) {
                    fs.unlink(createdFile, function() {
                        // Do nothing
                    });
                });
                response.status(500).json({
                    "code": 500,
                    "error": "Une erreur s'est produite."
                }).end();
                return;
            });
        });
    }).catch(function(error) {
        cleanUploadedFiles(request.files);
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
});

/**
* Récupère les données d'un fichier de maillage
*/
app.get("/mesh/:mesh_id([0-9]*)/view/", checkMeshExists, function(request, response) {
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
app.post("/mesh/:mesh_id([0-9]*)/edit/", [checkUserTokenIsValid, checkUserIsContributor, checkMeshExists], function(request, response) {
    // TODO
});

/**
* Supprime un fichier de maillage
*/
app.delete("/mesh/:mesh_id([0-9]*)/delete/", [checkUserTokenIsValid, checkUserIsContributor, checkMeshExists], function(request, response) {
    Mesh.findById(request.params.mesh_id, {
        "include": [{
            "model": Image
        }]
    }).then(function(mesh) {
        let promises = [];
        promises.push(fs.unlink(mesh.filepath, function(err) { /* Do nothing */ }));
        mesh.images.forEach(function(image) {
            promises.push(fs.unlink(image.path, function(err) { /* Do nothing */ }));
            promises.push(fs.unlink(image.thumbPath, function(err) { /* Do nothing */ }));
        });
        Promise.all(promises).then(function() {
            mesh.destroy().then(function() {
                response.status(200).json({
                    "code": 200,
                    "message": "Le fichier de maillage a été effacé avec succès."
                }).end();
                return;
            }).catch(function() {
                response.status(500).json({
                    "code": 500,
                    "error": "Une erreur s'est produite."
                }).end();
                return;
            });
        }).catch(function() {
            response.status(500).json({
                "code": 500,
                "error": "Une erreur s'est produite."
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
* Télécharge le fichier associé au message "mesh_id".
*/
app.get("/mesh/:mesh_id([0-9]*)/download/", checkMeshExists, function(request, response) {
    Mesh.findById(request.params.mesh_id).then(function(mesh) {
        if (request.query.check != null && request.query.check == 1) {
            fs.access(mesh.filepath, fs.constants.R_OK, function(err) {
                if (err) {
                    response.status(500).json({
                        "code": 500,
                        "error": "Une erreur s'est produite."
                    }).end();
                } else {
                    response.status(200).end();
                }
            });
        } else {
            fs.access(mesh.filepath, fs.constants.R_OK, function(err) {
                if (err) {
                    response.status(500).end();
                } else {
                    response.status(200).download(mesh.filepath, mesh.filename);
                }
            });
        }
    }).catch(function(error) {
        response.status(500).json({
            "code": 500,
            "error": "Une erreur s'est produite."
        }).end();
        return;
    });
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
            "error": "L'adresse e-mail n'est pas renseignée ou n'est pas valide."
        }).end();
        return;
    }
    if (data.password == null || !data.password.length) {
        response.status(500).json({
            "code": 500,
            "error": "Le mot de passe n'est pas renseigné."
        }).end();
        return;
    }
    if (data.password.length < 5) {
        response.status(500).json({
            "code": 500,
            "error": "Le mot de passe fait moins de 5 caractères."
        }).end();
        return;
    }
    if (data.password2 == null || !data.password2.length) {
        response.status(500).json({
            "code": 500,
            "error": "La confirmation du mot de passe est absente."
        }).end();
        return;
    }
    if (data.password !== data.password2) {
        response.status(500).json({
            "code": 500,
            "error": "Le mot de passe et sa confirmation ne sont pas identiques."
        }).end();
        return;
    }

    // On vérifie qu'il n'y a pas déjà un user avec l'adresse e-mail renseignée
    User.count({
        "where": {
            "email": data.email.toLowerCase()
        }
    }).then(function(count) {
        if (count > 0) {
            // Il y a déjà un utilisateur avec l'adresse e-mail renseignée
            response.status(500).json({
                "code": 500,
                "error": "Cette adresse e-mail est déjà associée à un compte."
            }).end();
            return;
        } else {
            // Nouvelle adresse e-mail, on insère le nouvel utilisateur dans la base de données
            const salt = User.generateSalt();
            let o = {
                "email": data.email.toLowerCase(),
                "salt": salt,
                "password": User.encryptPassword(data.password, salt)
            };
            if (data.firstname != null && data.firstname.length) {
                o.firstname = data.firstname;
            }
            if (data.lastname != null && data.lastname.length) {
                o.lastname = data.lastname.toLocaleUpperCase();
            }
            User.create(o).then(function() {
                response.status(200).json({
                    "code": 200,
                    "message": "Le compte utilisateur a bien été créé."
                }).end();
                return;
            }).catch(function() {
                response.status(500).json({
                    "code": 500,
                    "error": "Une erreur s'est produite."
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
            "error": "L'adresse e-mail n'est pas renseignée ou n'est pas valide."
        }).end();
        return;
    }
    if (data.password == null || !data.password.length) {
        response.status(500).json({
            "code": 500,
            "error": "Le mot de passe n'est pas renseigné."
        }).end();
        return;
    }

    // Recherche de l'utilisateur dans la base de données
    User.findOne({
        "where": {
            "email": data.email.toLowerCase()
        }
    }).then(function(user) {
        // Utilisateur existant ?
        if (!user) {
            response.status(500).json({
                "code": 500,
                "error": "L'adresse e-mail renseignée ne correspond à aucun compte."
            }).end();
            return;
        }
        // Utilisateur validé par un admin ?
        if (user.confirmed == null) {
            response.status(500).json({
                "code": 500,
                "error": "Ce compte n'est pas encore activé."
            }).end();
            return;
        }
        // Utilisateur non supprimé par un admin ?
        if (user.deleted != null) {
            response.status(500).json({
                "code": 500,
                "error": "Ce compte est désactivé."
            }).end();
            return;
        }
        // Mot de passe ok ?
        if (user.password != User.encryptPassword(data.password, user.salt)) {
            response.status(500).json({
                "code": 500,
                "error": "Le mot de passe est incorrect."
            }).end();
            return;
        }

        // Création d'un json web token
        // https://www.npmjs.com/package/jsonwebtoken
        const d = new Date();
        const payload = {
            "uid": user.id,
            "nbf": Math.round(d.getTime() / 1000) - 10,
            "iat": Math.round(d.getTime() / 1000),
            "exp": Math.round((d.getTime() / 1000) + (14 * 24 * 60 * 60)), // 14 jour
            "iss": "/"
        };
        const token = jwt.sign(payload, privateKey);
        response.status(200).json({
            "code": 200,
            "message": "Connexion réussie.",
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
            "error": "Une erreur s'est produite."
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

/**
* Efface un utilisateur de la base de données
*/
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

/**
* Liste les rôles de l'utilisateur identifié par le token de connexion
*/
app.get("/user/roles/", [checkUserTokenIsValid], function(request, response) {
    const token = request.body.token || request.query.token || request.headers["x-access-token"];
    const payload = jwt.verify(token, privateKey);
    User.findById(payload.uid, {
        "include": [{
            "model": Role
        }]
    }).then(function(user) {
        const roles = user.roles.map(function(role) {
            return {
                "id": role.id,
                "name": role.name,
                "title": role.title
            };
        });
        response.status(200).json(roles).end();
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
