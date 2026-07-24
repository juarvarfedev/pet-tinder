CREATE TABLE "pets" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"species" text NOT NULL,
	"breed" text NOT NULL,
	"age_months" integer NOT NULL,
	"gender" text NOT NULL,
	"bio" text NOT NULL,
	"traits" jsonb NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"photo" text NOT NULL,
	"adoption_fee" integer NOT NULL
);
