const hash = require("hash.js");
const md5 = require("md5");
const uniqid = require("uniqid");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("maillage", "guillaume", "la pomme est verte", {
    "host": "localhost",
    "dialect": "postgres",
    "port": 5432,
    "timezone": "Europe/Paris"
});

// categories
const Category = sequelize.define("categories", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "title": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "protected": {
        "type": Sequelize.BOOLEAN,
        "allowNull": false,
        "defaultValue": false
    },
    "color": {
        "type": Sequelize.STRING(7),
        "allowNull": false,
        "defaultValue": "#e8e8e8"
    }
}, {
    "createdAt": "created",
    "updatedAt": "updated",
    "deletedAt": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "categories"
});

// tags
const Tag = sequelize.define("tags", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "categoriesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "categories_id"
    },
    "title": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "protected": {
        "type": Sequelize.BOOLEAN,
        "allowNull": false,
        "defaultValue": false
    }
}, {
    "createdAt": "created",
    "updatedAt": "updated",
    "deletedAt": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "tags"
});

// events
const Event = sequelize.define("events", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "usersId": {
        "type": Sequelize.INTEGER,
        "allowNull": true,
        "field": "users_id"
    },
    "anonymousUserCookie": {
        "type": Sequelize.TEXT,
        "allowNull": true,
        "field": "anonymous_user_cookie"
    },
    "meshesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "meshes_id"
    },
    "actionTypesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "action_types_id"
    }
}, {
    "createdAt": "created",
    "updatedAt": false,
    "deletedAt": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "events"
});

// action_types
const ActionType = sequelize.define("actionTypes", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "title": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "sentenceTitle": {
        "type": Sequelize.TEXT,
        "allowNull": false,
        "field": "sentence_title"
    }
}, {
    "timestamps": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "action_types"
});

// meshes
const Mesh = sequelize.define("meshes", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "usersId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "users_id"
    },
    "title": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "description": {
        "type": Sequelize.TEXT,
        "allowNull": true
    },
    "vertices": {
        "type": Sequelize.BIGINT,
        "allowNull": true
    },
    "cells": {
        "type": Sequelize.BIGINT,
        "allowNull": true
    },
    "filename": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "filepath": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "uri": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "filesize": {
        "type": Sequelize.BIGINT,
        "allowNull": false
    },
    "filetype": {
        "type": Sequelize.TEXT,
        "allowNull": false
    }
}, {
    "createdAt": "created",
    "updatedAt": "updated",
    "deletedAt": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "meshes"
});

// images
const Image = sequelize.define("images", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "meshesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "meshes_id"
    },
    "filepath": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "uri": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "thumbPath": {
        "type": Sequelize.TEXT,
        "allowNull": false,
        "field": "thumb_path"
    },
    "thumbUri": {
        "type": Sequelize.TEXT,
        "allowNull": false,
        "field": "thumb_uri"
    },
    "isDefault": {
        "type": Sequelize.BOOLEAN,
        "allowNull": false,
        "field": "is_default",
        "defaultValue": false
    }
}, {
    "timestamps": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "images"
});

// meshes_tags
const MeshTag = sequelize.define("meshesTags", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "tagsId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "tags_id"
    },
    "meshesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "meshes_id"
    },
}, {
    "timestamps": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "meshes_tags"
});

// roles
const Role = sequelize.define("roles", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "name": {
        "type": Sequelize.TEXT,
        "allowNull": false,
    },
    "title": {
        "type": Sequelize.TEXT,
        "allowNull": false,
    },
    "inherits": {
        "type": Sequelize.JSONB,
        "allowNull": true,
    }
}, {
    "timestamps": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "roles"
});

// users
const User = sequelize.define("users", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "email": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "password": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "salt": {
        "type": Sequelize.TEXT,
        "allowNull": false
    },
    "firstname": {
        "type": Sequelize.TEXT,
        "allowNull": true
    },
    "lastname": {
        "type": Sequelize.TEXT,
        "allowNull": true
    },
    "confirmed": {
        "type": Sequelize.DATE,
        "allowNull": true
    }
}, {
    "createdAt": "created",
    "updatedAt": "updated",
    "deletedAt": "deleted",
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "users"
});

// Génère un salt aléatoire basé sur l'heure du système
User.generateSalt = function() {
    return md5(uniqid());
};

// Hache le mot de passe avec le salt passé en paramètre
User.encryptPassword = function(text, salt) {
    return hash.sha512().update(text + "/" + salt).digest('hex');
};

// users_roles
const UserRole = sequelize.define("usersRoles", {
    "id": {
        "type": Sequelize.INTEGER,
        "primaryKey": true,
        "allowNull": false,
        "autoIncrement": true
    },
    "usersId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "users_id"
    },
    "rolesId": {
        "type": Sequelize.INTEGER,
        "allowNull": false,
        "field": "roles_id"
    }
}, {
    "timestamps": false,
    "paranoid": false,
    "freezeTableName": true,
    "tableName": "users_roles"
});

// Associations

Tag.belongsTo(Category, {
    "foreignKey": "categoriesId"
});
Category.hasMany(Tag, {
    "foreignKey": "categoriesId"
});
Event.belongsTo(User, {
    "foreignKey": "usersId"
});
User.hasMany(Event, {
    "foreignKey": "usersId"
});
Event.belongsTo(Mesh, {
    "foreignKey": "meshesId"
});
Mesh.hasMany(Event, {
    "foreignKey": "meshesId"
});
Event.belongsTo(ActionType, {
    "foreignKey": "actionTypesId"
});
ActionType.hasMany(Event, {
    "foreignKey": "actionTypesId"
});
Mesh.belongsTo(User, {
    "foreignKey": "usersId"
});
User.hasMany(Mesh, {
    "foreignKey": "usersId"
});
Mesh.belongsToMany(Tag, {
    "through": MeshTag,
    "foreignKey": "meshesId",
    "otherKey": "tagsId"
});
Tag.belongsToMany(Mesh, {
    "through": MeshTag,
    "foreignKey": "tagsId",
    "otherKey": "meshesId"
});
MeshTag.belongsTo(Mesh, {
    "foreignKey": "meshesId"
});
Mesh.hasMany(MeshTag, {
    "foreignKey": "meshesId"
});
MeshTag.belongsTo(Tag, {
    "foreignKey": "tagsId"
});
Mesh.hasMany(Image, {
    "foreignKey": "meshesId"
});
Image.belongsTo(Mesh, {
    "foreignKey": "meshesId"
});
Tag.hasMany(MeshTag, {
    "foreignKey": "tagsId"
});
User.belongsToMany(Role, {
    "through": UserRole,
    "foreignKey": "usersId",
    "otherKey": "rolesId"
});
Role.belongsToMany(User, {
    "through": UserRole,
    "foreignKey": "rolesId",
    "otherKey": "usersId"
});

module.exports = {
    "sequelize": sequelize,
    "Category": Category,
    "Tag": Tag,
    "Event": Event,
    "ActionType": ActionType,
    "Mesh": Mesh,
    "Image": Image,
    "MeshTag": MeshTag,
    "Role": Role,
    "User": User,
    "UserRole": UserRole
};
