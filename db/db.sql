
------------------------
-- Création du schéma --
------------------------

CREATE TABLE "users" (
"id" serial4 NOT NULL,
"email" text NOT NULL,
"password" text NOT NULL,
"firstname" text DEFAULT NULL,
"lastname" text DEFAULT NULL,
"created" timestamp(0) NOT NULL DEFAULT now(),
"updated" timestamp(0) DEFAULT NULL,
"confirmed" timestamp(0) DEFAULT NULL,
"deleted" timestamp(0) DEFAULT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "roles" (
"id" serial4 NOT NULL,
"name" text NOT NULL,
"title" text NOT NULL,
"inherits" jsonb DEFAULT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "users_roles" (
"id" serial4 NOT NULL,
"users_id" int4 NOT NULL,
"roles_id" int4 NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "events" (
"id" serial4 NOT NULL,
"users_id" int4 DEFAULT NULL,
"anonymous_user_cookie" text DEFAULT NULL,
"meshes_id" int4 NOT NULL,
"action_types_id" int4 NOT NULL,
"created" timestamp(0) NOT NULL DEFAULT now(),
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "meshes" (
"id" serial4 NOT NULL,
"users_id" int4 NOT NULL,
"title" text NOT NULL,
"description" text DEFAULT NULL,
"vertices" int8 DEFAULT NULL,
"cells" int8 DEFAULT NULL,
"filename" text NOT NULL,
"filepath" text NOT NULL,
"uri" text NOT NULL,
"filesize" int8 NOT NULL,
"filetype" text NOT NULL,
"created" timestamp(0) NOT NULL DEFAULT now(),
"updated" timestamp(0) DEFAULT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "tags" (
"id" serial4 NOT NULL,
"categories_id" int4 NOT NULL,
"title" text NOT NULL,
"protected" bool NOT NULL DEFAULT false,
"created" timestamp(0) NOT NULL DEFAULT now(),
"updated" timestamp(0) DEFAULT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "meshes_tags" (
"id" serial4 NOT NULL,
"tags_id" int4 NOT NULL,
"meshes_id" int4 NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "categories" (
"id" serial4 NOT NULL,
"title" text NOT NULL,
"protected" bool NOT NULL DEFAULT false,
"created" timestamp(0) NOT NULL DEFAULT now(),
"updated" timestamp(0) DEFAULT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "action_types" (
"id" serial4 NOT NULL,
"title" text NOT NULL,
"sentence_title" text NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "images" (
"id" serial4 NOT NULL,
"meshes_id" int4 NOT NULL,
"filepath" text NOT NULL,
"uri" text NOT NULL,
"thumb_path" text NOT NULL,
"thumb_uri" text NOT NULL,
"is_default" bool NOT NULL DEFAULT false,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;


ALTER TABLE "users_roles" ADD CONSTRAINT "fk_users_roles_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users_roles" ADD CONSTRAINT "fk_users_roles_roles" FOREIGN KEY ("roles_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "fk_tags_categories" FOREIGN KEY ("categories_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meshes" ADD CONSTRAINT "fk_contents_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meshes_tags" ADD CONSTRAINT "fk_meshes_tags_tags" FOREIGN KEY ("tags_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meshes_tags" ADD CONSTRAINT "fk_meshes_tags_meshes" FOREIGN KEY ("meshes_id") REFERENCES "meshes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "fk_history_meshes" FOREIGN KEY ("meshes_id") REFERENCES "meshes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "fk_history_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "fk_history_action_types" FOREIGN KEY ("action_types_id") REFERENCES "action_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "images" ADD CONSTRAINT "fk_images_meshes" FOREIGN KEY ("meshes_id") REFERENCES "meshes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

