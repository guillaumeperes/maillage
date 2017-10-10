ALTER TABLE "users_roles" DROP CONSTRAINT "fk_users_roles_users";
ALTER TABLE "users_roles" DROP CONSTRAINT "fk_users_roles_roles";
ALTER TABLE "tags" DROP CONSTRAINT "fk_tags_categories";
ALTER TABLE "contents" DROP CONSTRAINT "fk_contents_users";
ALTER TABLE "contents_tags" DROP CONSTRAINT "fk_contents_tags_tags_id";
ALTER TABLE "contents_tags" DROP CONSTRAINT "fk_contents_tags_contents";
ALTER TABLE "history" DROP CONSTRAINT "fk_history_contents";
ALTER TABLE "history" DROP CONSTRAINT "fk_history_users";
ALTER TABLE "history" DROP CONSTRAINT "fk_history_type";

DROP TABLE "users";
DROP TABLE "roles";
DROP TABLE "users_roles";
DROP TABLE "history";
DROP TABLE "contents";
DROP TABLE "tags";
DROP TABLE "contents_tags";
DROP TABLE "categories";
DROP TABLE "action_types";

CREATE TABLE "users" (
"id" int4 NOT NULL,
"email" text NOT NULL,
"password" text NOT NULL,
"firstname" text,
"lastname" text,
"created" timestamp(0) NOT NULL,
"updated" timestamp(0),
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "roles" (
"id" int4 NOT NULL,
"title" text,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "users_roles" (
"id" int4 NOT NULL,
"users_id" int4,
"roles_id" int4,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "history" (
"id" int4 NOT NULL,
"users_id" int4 NOT NULL,
"contents_id" int4 NOT NULL,
"action_type_id" int4,
"created" timestamp(255) NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "contents" (
"id" int4 NOT NULL,
"users_id" int4 NOT NULL,
"title" text NOT NULL,
"description" text,
"filename" text NOT NULL,
"path" text NOT NULL,
"size" float8 NOT NULL,
"type" text NOT NULL,
"created" timestamp(255) NOT NULL,
"updated" timestamp(0),
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "tags" (
"id" int4 NOT NULL,
"title" text,
"categories_id" int4,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "contents_tags" (
"id" int4 NOT NULL,
"tags_id" int4 NOT NULL,
"contents_id" int4 NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "categories" (
"id" int4 NOT NULL,
"title" text NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;

CREATE TABLE "action_types" (
"id" int4 NOT NULL,
"title" text NOT NULL,
PRIMARY KEY ("id") 
)
WITHOUT OIDS;


ALTER TABLE "users_roles" ADD CONSTRAINT "fk_users_roles_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users_roles" ADD CONSTRAINT "fk_users_roles_roles" FOREIGN KEY ("roles_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tags" ADD CONSTRAINT "fk_tags_categories" FOREIGN KEY ("categories_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contents" ADD CONSTRAINT "fk_contents_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contents_tags" ADD CONSTRAINT "fk_contents_tags_tags_id" FOREIGN KEY ("tags_id") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contents_tags" ADD CONSTRAINT "fk_contents_tags_contents" FOREIGN KEY ("contents_id") REFERENCES "contents" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "history" ADD CONSTRAINT "fk_history_contents" FOREIGN KEY ("contents_id") REFERENCES "contents" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "history" ADD CONSTRAINT "fk_history_users" FOREIGN KEY ("users_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "history" ADD CONSTRAINT "fk_history_type" FOREIGN KEY ("action_type_id") REFERENCES "action_types" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

