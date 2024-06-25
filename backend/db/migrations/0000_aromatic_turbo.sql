CREATE TABLE IF NOT EXISTS "daps" (
	"dbid" serial PRIMARY KEY NOT NULL,
	"id" varchar(255) NOT NULL,
	"did" varchar(255) NOT NULL,
	"handle" varchar(64) NOT NULL,
	"proof" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daps_id_unique" UNIQUE("id"),
	CONSTRAINT "daps_did_unique" UNIQUE("did"),
	CONSTRAINT "daps_handle_unique" UNIQUE("handle")
);
