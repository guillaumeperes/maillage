# Maillages API

Ceci est l'API de l'application de gestion de fichiers de maillages développée par Sarah Pierson et Guillaume Peres. Cette API repose sur l'utilisation de NodeJS et stocke ses données dans Postgresql 9.6. Un serveur nginx est utilisé comme reverse proxy pour accéder aux fonctionnalités de l'api depuis internet sur le port 80, et supervisord la maintient active. 

# Documentation

## Routes

**GET** https://api.maillage.guillaumeperes.fr/categories/alltags/

Retourne la liste des catégories avec leurs tags associés.

Retourne 

```json
[
    {
        "id": 1,
        "title": "Plan",
        "protected": true,
        "color": "#e8e8e8",
        "created": "2017-12-28T11:28:47.000Z",
        "updated": null,
        "tags": [
            {
                "id": 1,
                "categoriesId": 1,
                "title": "2D",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "meshes": [
                    {
                        "id": 10,
                        "usersId": 1,
                        "title": "Porte étrange",
                        "description": "Porte, vraiment, très étrange",
                        "vertices": "321",
                        "cells": "123",
                        "filename": "C2.mesh",
                        "filepath": "\/home\/web\/maillage_api.guillaumeperes.fr\/meshes\/3d2901d0207b18089141b26c031643ef.mesh",
                        "filesize": "2442210",
                        "filetype": "mesh",
                        "created": "2017-12-28T11:49:43.000Z",
                        "updated": "2017-12-28T11:49:43.000Z",
                        "meshesTags": [
                            {
                                "id": 22,
                                "tagsId": 2,
                                "meshesId": 10
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```

**GET** https://api.maillage.guillaumeperes.fr/categories/list/

Moteur de recherche à facettes. Liste les catégories, avec leurs tags associés, qui correspondent aux fichiers de maillage retournés par les options de filtrage passées en paramètre.

Liste des options de filtrage : 

| Nom | Type | Exemple | Description |
|-----|------|---------|-------------|
| `filters` | Tableau d'entiers | `"filters[]=1&filters[]=2&filters[]=3"` | Liste des facettes déjà sélectionnées |
| `keyword` | Chaîne de caractères | `"ChineeseDragon"` | Mot-clé |

Retourne un objet json de la forme 

```json
[
    {
        "id": 1,
        "title": "Plan",
        "protected": true,
        "color": "#e8e8e8",
        "created": "2017-12-28T11:28:47.000Z",
        "updated": null,
        "tags": [
            {
                "id": 2,
                "categoriesId": 1,
                "title": "3D surfacique",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "occurences": "1"
            },
            {
                "id": 3,
                "categoriesId": 1,
                "title": "3D volumique",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "occurences": "9"
            }
        ]
    },
    {
        "id": 2,
        "title": "Type de maillage",
        "protected": true,
        "color": "#e8e8e8",
        "created": "2017-12-28T11:28:47.000Z",
        "updated": null,
        "tags": [
            {
                "id": 4,
                "categoriesId": 2,
                "title": "Triangulaire",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "occurences": "8"
            },
            {
                "id": 8,
                "categoriesId": 2,
                "title": "Hybride",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "occurences": "1"
            }
        ]
    },
    {
        "id": 3,
        "title": "Type d'objet",
        "protected": true,
        "color": "#e8e8e8",
        "created": "2017-12-28T11:28:47.000Z",
        "updated": null,
        "tags": [
            {
                "id": 12,
                "categoriesId": 3,
                "title": "Immeuble",
                "protected": true,
                "created": "2017-12-28T11:28:47.000Z",
                "updated": null,
                "occurences": "1"
            }
        ]
    }
]
``` 

En cas d'erreur ou d'absence de résultats, retourne un tableau json vide.

```json
[]
```

**GET** https://api.maillage.guillaumeperes.fr/users/list/

**GET** https://api.maillage.guillaumeperes.fr/meshes/sorts/

Liste les options de tri de la liste des fichiers de maillage supportés par l'API.

Retourne un objet json sous la forme : 

```json
[
    {
        "name": "title",
        "label": "Ordre alphabétique",
        "default": true
    },
    {
        "name": "title-reverse",
        "label": "Ordre alphabétique inverse",
        "default": false
    },
    {
        "name": "cells",
        "label": "Nombre de cellules : croissant",
        "default": false
    },
    {
        "name": "cells-reverse",
        "label": "Nombre de cellules : décroissant",
        "default": false
    },
    {
        "name": "vertices",
        "label": "Nombre de sommets : croissant",
        "default": false
    },
    {
        "name": "vertices-reverse",
        "label": "Nombre de sommets : décroissant",
        "default": false
    },
    {
        "name": "created",
        "label": "Du plus ancien au plus récent",
        "default": false
    },
    {
        "name": "created-reverse",
        "label": "Du plus récent au plus ancien",
        "default": false
    }
]
```

**GET** https://api.maillage.guillaumeperes.fr/meshes/search/

**PUT** https://api.maillage.guillaumeperes.fr/mesh/new/

**GET** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/view/

**POST** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/edit/

**DELETE** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/delete/

Supprime le fichier de maillage identifié par l'entier positif ```mesh_id``` ainsi que tous les fichiers qui lui sont associés (fichier physique et images).

En cas de succès, retourne l'object JSON suivant : 

```json
{
  "code": 200,
  "message": "Le fichier de maillage a été effacé avec succès."
}
```

En cas d'erreur, retourne : 

```json
{
  "code": 500,
  "error": "Une erreur s'est produite."
}
```

**GET** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/download/

**PUT** https://api.maillage.guillaumeperes.fr/categories/new/

**GET** https://api.maillage.guillaumeperes.fr/categories/(category_id)/detail/

**POST** https://api.maillage.guillaumeperes.fr/categories/(category_id)/edit/

**DELETE** https://api.maillage.guillaumeperes.fr/categories/(category_id)/delete/

Supprime la categorie de tags identifiée par l'entier positif ```category_id``` ainsi que tous ses tags associés.

En cas de succès, retourne l'object JSON suivant : 

```json
{
  "code": 200,
  "message": "La catégorie a été supprimée avec succès."
}
```

En cas d'erreur, retourne : 

```json
{
  "code": 500,
  "error": "Une erreur s'est produite."
}
```

**PUT** https://api.maillage.guillaumeperes.fr/categories/(category_id)/tags/new/

**GET** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/detail/

**POST** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/edit/

**DELETE** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/delete/

Supprime le tag associé à l'entier positif ```tag_id```. 

En cas de succès, retourne l'object JSON suivant : 

```json
{
  "code": 200,
  "message": "Le tag a été supprimé avec succès."
}
```

En cas d'erreur, retourne : 

```json
{
  "code": 500,
  "error": "Une erreur s'est produite."
}
```

**POST** https://api.maillage.guillaumeperes.fr/register/

**POST** https://api.maillage.guillaumeperes.fr/login/

**GET** https://api.maillage.guillaumeperes.fr/user/revive/

**DELETE** https://api.maillage.guillaumeperes.fr/users/(user_id)/delete/

**GET** https://api.maillage.guillaumeperes.fr/user/roles/
