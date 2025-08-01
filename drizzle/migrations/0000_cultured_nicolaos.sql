CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"descriptions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"descriptions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "space" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"alternateNames" text[] DEFAULT '{}'::text[],
	"activities" text[] DEFAULT '{}'::text[],
	"descriptions" text,
	"historical_context" text,
	"architectural_style" varchar(100),
	"operatingHours" jsonb DEFAULT '{}'::jsonb,
	"entranceFee" jsonb DEFAULT '{}'::jsonb,
	"contactInfo" jsonb DEFAULT '{}'::jsonb,
	"accessibility" jsonb DEFAULT '{}'::jsonb,
	"submittedBy" uuid NOT NULL,
	"typeId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "space_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "space_to_categories" (
	"space_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "space_to_categories_space_id_category_id_pk" PRIMARY KEY("space_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "space_to_features" (
	"space_id" text NOT NULL,
	"feature_id" text NOT NULL,
	CONSTRAINT "space_to_features_space_id_feature_id_pk" PRIMARY KEY("space_id","feature_id")
);
--> statement-breakpoint
CREATE TABLE "space_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"descriptions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "space_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profilePicture" text,
	"bio" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_submittedBy_users_id_fk" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space" ADD CONSTRAINT "space_typeId_space_type_id_fk" FOREIGN KEY ("typeId") REFERENCES "public"."space_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_to_categories" ADD CONSTRAINT "space_to_categories_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_to_categories" ADD CONSTRAINT "space_to_categories_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_to_features" ADD CONSTRAINT "space_to_features_space_id_space_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_to_features" ADD CONSTRAINT "space_to_features_feature_id_feature_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."feature"("id") ON DELETE cascade ON UPDATE no action;