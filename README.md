# Maillages API

Ceci est l'API de l'application de gestion de fichiers de maillages développée par Sarah Pierson et Guillaume Peres. Cette API repose sur l'utilisation de NodeJS et stocke ses données dans Postgresql 9.6. Un serveur nginx est utilisé comme reverse proxy pour accéder aux fonctionnalités de l'api depuis internet sur le port 80, et supervisord la maintient active. 

# Documentation

## Routes

*** GET *** https://api.maillage.guillaumeperes.fr/categories/alltags/

*** GET *** https://api.maillage.guillaumeperes.fr/categories/list/

*** GET *** https://api.maillage.guillaumeperes.fr/users/list/

*** GET *** https://api.maillage.guillaumeperes.fr/meshes/sorts/

*** GET *** https://api.maillage.guillaumeperes.fr/meshes/search/

*** PUT *** https://api.maillage.guillaumeperes.fr/mesh/new/

*** GET *** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/view/

*** POST *** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/edit/

*** DELETE *** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/delete/

*** GET *** https://api.maillage.guillaumeperes.fr/mesh/(mesh_id)/download/

*** PUT *** https://api.maillage.guillaumeperes.fr/categories/new/

*** GET *** https://api.maillage.guillaumeperes.fr/categories/(category_id)/detail/

*** POST *** https://api.maillage.guillaumeperes.fr/categories/(category_id)/edit/

*** DELETE *** https://api.maillage.guillaumeperes.fr/categories/(category_id)/delete/

*** PUT *** https://api.maillage.guillaumeperes.fr/categories/(category_id)/tags/new/

*** GET *** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/detail/

*** POST *** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/edit/

*** DELETE *** https://api.maillage.guillaumeperes.fr/tags/(tag_id)/delete/

*** POST *** https://api.maillage.guillaumeperes.fr/register/

*** POST *** https://api.maillage.guillaumeperes.fr/login/

*** GET *** https://api.maillage.guillaumeperes.fr/user/revive/

*** DELETE *** https://api.maillage.guillaumeperes.fr/users/(user_id)/delete/

*** GET *** https://api.maillage.guillaumeperes.fr/user/roles/
