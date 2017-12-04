
---------------------
-- Données de test --
---------------------

INSERT INTO users (id, email, password, salt, firstname, lastname, confirmed) VALUES
(1, 'guillaumeperes10@gmail.com', 'xxx', 'salt', 'Guillaume', 'Peres', now())
;
SELECT pg_catalog.setval('users_id_seq', 1, true);

INSERT INTO users_roles (id, users_id, roles_id) VALUES
(1, 1, 1),
(2, 1, 2)
;
SELECT pg_catalog.setval('users_roles_id_seq', 2, true);

INSERT INTO meshes (id, users_id, title, vertices, cells, filename, filepath, uri, filesize, filetype) VALUES
(1, 1, 'B1', 10935, 21870, 'B1.mesh', '/web/maillage_api/public/up/meshes/originals/B1.mesh', '/up/meshes/originals/B1.mesh', 10000, 'mesh'),
(2, 1, 'C2', 19416, 38832, 'C2.mesh', '/web/maillage_api/public/up/meshes/originals/C2.mesh', '/up/meshes/originals/C2.mesh', 10000, 'mesh'),
(3, 1, 'C3', 44904, 67465, 'C3.mesh', '/web/maillage_api/public/up/meshes/originals/C3.mesh', '/up/meshes/originals/C3.mesh', 10000, 'mesh'),
(4, 1, 'ChineseDragon', 2502, 5000, 'Chinese_dragon.off', '/web/maillage_api/public/up/meshes/originals/Chinese_dragon.off', '/up/meshes/originals/Chinese_dragon.off', 10000, 'off'),
(5, 1, 'fusee', 28727, 132966, 'fusee.mesh', '/web/maillage_api/public/up/meshes/originals/fusee.mesh', '/up/meshes/originals/fusee.mesh', 10000, 'mesh'),
(6, 1, 'M8', 39116, 197998, 'M8.vtk', '/web/maillage_api/public/up/meshes/originals/M8.vtk', '/up/meshes/originals/M8.vtk', 10000, 'vtk'),
(7, 1, 'M11', 66606, 344767, 'M11.mesh', '/web/maillage_api/public/up/meshes/originals/M11.mesh', '/up/meshes/originals/M11.mesh', 10000, 'mesh'),
(8, 1, 'Q1', 44904, 67465, 'Q1.mesh', '/web/maillage_api/public/up/meshes/originals/Q1.mesh', '/up/meshes/originals/Q1.mesh', 10000, 'mesh')
;
SELECT pg_catalog.setval('meshes_id_seq', 8, true);

INSERT INTO meshes_tags (id, tags_id, meshes_id) VALUES
(1, 3, 1),
(2, 4, 1),
(3, 3, 2),
(4, 4, 2),
(5, 3, 3),
(6, 4, 3),
(7, 3, 4),
(8, 4, 4),
(9, 3, 5),
(10, 4, 5),
(11, 3, 6),
(12, 4, 6),
(13, 3, 7),
(14, 4, 7),
(15, 3, 8),
(16, 4, 8)
;
SELECT pg_catalog.setval('meshes_tags_id_seq', 16, true);

INSERT INTO images (id, meshes_id, filepath, uri, thumb_path, thumb_uri, is_default) VALUES
(1, 1, '/web/maillage_api/public/up/meshes/img/B1.png', '/up/meshes/img/B1.png', '/web/maillage_api/public/up/meshes/img/B1_thumb.png', '/up/meshes/img/B1_thumb.png', TRUE),
(2, 2, '/web/maillage_api/public/up/meshes/img/C2.png', '/up/meshes/img/C2.png', '/web/maillage_api/public/up/meshes/img/C2_thumb.png', '/up/meshes/img/C2_thumb.png', TRUE),
(3, 3, '/web/maillage_api/public/up/meshes/img/C3_view1.png', '/up/meshes/img/C3_view1.png', '/web/maillage_api/public/up/meshes/img/C3_view1_thumb.png', '/up/meshes/img/C3_view1_thumb.png', TRUE),
(4, 3, '/web/maillage_api/public/up/meshes/img/C3_view2.png', '/up/meshes/img/C3_view2.png', '/web/maillage_api/public/up/meshes/img/C3_view2_thumb.png', '/up/meshes/img/C3_view2_thumb.png', FALSE),
(5, 3, '/web/maillage_api/public/up/meshes/img/C3_view3.png', '/up/meshes/img/C3_view3.png', '/web/maillage_api/public/up/meshes/img/C3_view3_thumb.png', '/up/meshes/img/C3_view3_thumb.png', FALSE),
(6, 4, '/web/maillage_api/public/up/meshes/img/Chinese_dragon.png', '/up/meshes/img/Chinese_dragon.png', '/web/maillage_api/public/up/meshes/img/Chinese_dragon_thumb.png', '/up/meshes/img/Chinese_dragon_thumb.png', TRUE),
(7, 5, '/web/maillage_api/public/up/meshes/img/fusee.png', '/up/meshes/img/fusee.png', '/web/maillage_api/public/up/meshes/img/fusee_thumb.png', '/up/meshes/img/fusee_thumb.png', TRUE),
(8, 6, '/web/maillage_api/public/up/meshes/img/M8.png', '/up/meshes/img/M8.png', '/web/maillage_api/public/up/meshes/img/M8_thumb.png', '/up/meshes/img/M8_thumb.png', TRUE),
(9, 7, '/web/maillage_api/public/up/meshes/img/M11.png', '/up/meshes/img/M11.png', '/web/maillage_api/public/up/meshes/img/M11_thumb.png', '/up/meshes/img/M11_thumb.png', TRUE),
(10, 8, '/web/maillage_api/public/up/meshes/img/Q1_view.png', '/up/meshes/img/Q1_view.png', '/web/maillage_api/public/up/meshes/img/Q1_view_thumb.png', '/up/meshes/img/Q1_view_thumb.png', TRUE),
(11, 8, '/web/maillage_api/public/up/meshes/img/Q1_view_2.png', '/up/meshes/img/Q1_view_2.png', '/web/maillage_api/public/up/meshes/img/Q1_view_2_thumb.png', '/up/meshes/img/Q1_view_2_thumb.png', FALSE),
(12, 8, '/web/maillage_api/public/up/meshes/img/Q1_view_X.png', '/up/meshes/img/Q1_view_X.png', '/web/maillage_api/public/up/meshes/img/Q1_view_X_thumb.png', '/up/meshes/img/Q1_view_X_thumb.png', FALSE),
(13, 8, '/web/maillage_api/public/up/meshes/img/Q1_view_Y.png', '/up/meshes/img/Q1_view_Y.png', '/web/maillage_api/public/up/meshes/img/Q1_view_Y_thumb.png', '/up/meshes/img/Q1_view_Y_thumb.png', FALSE),
(14, 8, '/web/maillage_api/public/up/meshes/img/Q1_view_Z.png', '/up/meshes/img/Q1_view_Z.png', '/web/maillage_api/public/up/meshes/img/Q1_view_Z_thumb.png', '/up/meshes/img/Q1_view_Z_thumb.png', FALSE)
;
SELECT pg_catalog.setval('images_id_seq', 14, true);
