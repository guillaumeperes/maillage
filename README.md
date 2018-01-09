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

**GET** https://api.maillage.guillaumeperes.fr/users/list/confirmed/

Liste des utilisateurs confirmés (utilisateur dont le champs confirmed n'est pas null) 

**GET** https://api.maillage.guillaumeperes.fr/users/list/pending/

Liste des utilisateurs en attente de confirmation par l'administrateur (utilisateur dont le champs confirmed est null)

**GET** https://api.maillage.guillaumeperes.fr/users/list/deleted/

Liste les utilisateurs effacés (utilisateur dont le champs deleted n'est pas null)


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

Recherche de fichiers de maillage en fonction de plusieurs paramêtres : 
- en focntion des facettes (query.filters)
- en fonction de la recherche full text (query.keyword)

Le résultat de la requête est trié en fonction de l'ordre de tri selectionné (query.sort)

**PUT** https://api.maillage.guillaumeperes.fr/mesh/new/

Crée un nouveau fichier de maillage dans la base de données. 
Les données saisies sont soumises à des vérifications de format.

**GET** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/view/

Retourne les données du fichier de maillage idendifié par l'entier positif mesh_id.

Retourne un objet json de la forme :

```json
{
    "id": 1,
    "usersId": 1,
    "title": "B1",
    "description": null,
    "vertices": "10935",
    "cells": "21870",
    "filename": "B1.mesh",
    "filepath": "\/web\/maillage_api.guillaumeperes.fr\/meshes\/B1.mesh",
    "filesize": "10000",
    "filetype": "mesh",
    "created": "2017-12-28T11:28:54.000Z",
    "updated": null,
    "tags": [
        {
            "id": 3,
            "categoriesId": 1,
            "title": "3D volumique",
            "protected": true,
            "created": "2017-12-28T11:28:47.000Z",
            "updated": null,
            "meshesTags": {
                "id": 1,
                "tagsId": 3,
                "meshesId": 1
            }
        },
        {
            "id": 4,
            "categoriesId": 2,
            "title": "Triangulaire",
            "protected": true,
            "created": "2017-12-28T11:28:47.000Z",
            "updated": null,
            "meshesTags": {
                "id": 2,
                "tagsId": 4,
                "meshesId": 1
            }
        }
    ],
    "images": [
        {
            "id": 1,
            "meshesId": 1,
            "path": "\/web\/maillage_api\/public\/up\/img\/B1.png",
            "uri": "\/up\/img\/B1.png",
            "thumbPath": "\/web\/maillage_api\/public\/up\/img\/B1_thumb.png",
            "thumbUri": "\/up\/img\/B1_thumb.png",
            "isDefault": true
        }
    ],
    "user": {
        "id": 1,
        "email": "gperes@mamasam.com",
        "password": "1ef54ab7f1ba61e3dbac9384f73a46a14edbd92326cfe30251ab1d8f3a3bda4b7769ab3f39104b5158d4cd4cd859ef67bc5cb97109db58ccf6219e12d6a7c22d",
        "salt": "df6bee8cfd4f1edd2a0a973355019886",
        "firstname": "Guillaume",
        "lastname": "Peres",
        "confirmed": "2017-12-28T11:28:54.000Z",
        "created": "2017-12-28T11:28:54.000Z",
        "updated": null
    },
    "tagsCategories": [
        {
            "id": 1,
            "title": "Plan",
            "protected": true,
            "color": "#e8e8e8",
            "created": "2017-12-28T11:28:47.000Z",
            "updated": null,
            "tags": [
                {
                    "id": 3,
                    "categoriesId": 1,
                    "title": "3D volumique",
                    "protected": true,
                    "created": "2017-12-28T11:28:47.000Z",
                    "updated": null
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
                    "updated": null
                }
            ]
        }
    ]
}
```

En cas d'erreur (si l'identifiant passé ne correspond à aucun contenu existant), un objet json de cette forme est retourné : 

```json
{
    "code": 404,
    "error": "Le fichier de maillage demandé n'a pas été trouvé."
}
```

**POST** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/edit/

Met à jour les données d'un fichier de maillage.
Les données saisies sont soumises à des vérifications de format.


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

Télécharge le fichier de maillage associé au fichier mesh en fonction du "mesh_id". 

**PUT** https://api.maillage.guillaumeperes.fr/categories/new/

Créer une nouvelle catégorie.
Il faut renseigner un titree et une couleurs.

**GET** https://api.maillage.guillaumeperes.fr/categories/(category_id)/detail/

Chercher les informations d'une catégorie données en fonction du champs categoryId

**POST** https://api.maillage.guillaumeperes.fr/categories/(category_id)/edit/

Modifier les valeures d'une catégorie (recherchée par le champs categoryId).
Les valeurs saisie sont soumis a des vérifications

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

Créer un tag sur une catégorie.
Le champs categoriesId de la table tag est allimenté par la valeur (category_id) de l'URL.

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
