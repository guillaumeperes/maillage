
-----------------------------------------------------------------
-- Initialisation des valeurs par défaut de la base de données --
-----------------------------------------------------------------


-- Rôles

INSERT INTO roles (id, title, name, inherits) VALUES
(1, 'Contributeur', 'contributor', NULL),
(2, 'Administrateur', 'administrator', '["contributor"]')
;
SELECT pg_catalog.setval('roles_id_seq', 2, true);

-- Catégories de tags

INSERT INTO categories (id, title, protected) VALUES
(1, 'Plan', TRUE),
(2, 'Type de maillage', TRUE),
(3, 'Type d''objet', TRUE)
;
SELECT pg_catalog.setval('categories_id_seq', 3, true);

-- Tags

INSERT INTO tags (id, categories_id, title, protected) VALUES
(1, 1, '2D', TRUE),
(2, 1, '3D surfacique', TRUE),
(3, 1, '3D volumique', TRUE),
(4, 2, 'Triangulaire', TRUE),
(5, 2, 'Tétraédrique', TRUE),
(6, 2, 'Quadrangulaire', TRUE),
(7, 2, 'Hexaédrique', TRUE),
(8, 2, 'Hybride', TRUE),
(9, 3, 'Voiture', TRUE),
(10, 3, 'Avion', TRUE),
(11, 3, 'Animal', TRUE),
(12, 3, 'Immeuble', TRUE)
;
SELECT pg_catalog.setval('tags_id_seq', 12, true);

-- Types d'action

INSERT INTO action_types (id, title, sentence_title) VALUES
(1, 'Consultation', 'a consulté'),
(2, 'Création', 'a créé'),
(3, 'Modification', 'a modifié'),
(4, 'Suppression', 'a supprimé')
;
SELECT pg_catalog.setval('action_types_id_seq', 4, true);
