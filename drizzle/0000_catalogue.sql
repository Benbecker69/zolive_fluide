CREATE TYPE "public"."packshot_kind" AS ENUM('bottle', 'bottle-dark', 'tin', 'jar', 'jar-dark', 'vinegar', 'box');--> statement-breakpoint
CREATE TYPE "public"."tint" AS ENUM('sage', 'zest', 'sky', 'peach');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category_id" uuid NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"tagline_fr" text NOT NULL,
	"tagline_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"tint" "tint" NOT NULL,
	"packshot" "packshot_kind" NOT NULL,
	"label_fr" text NOT NULL,
	"label_en" text NOT NULL,
	"is_new_harvest" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"fruitiness" smallint,
	"bitterness" smallint,
	"pungency" smallint,
	"position" integer NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_profile_range" CHECK (("products"."fruitiness" is null or "products"."fruitiness" between 1 and 5)
        and ("products"."bitterness" is null or "products"."bitterness" between 1 and 5)
        and ("products"."pungency" is null or "products"."pungency" between 1 and 5))
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"format" text NOT NULL,
	"volume_ml" integer,
	"price_cents" integer NOT NULL,
	"stock" integer NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "variants_price_positive" CHECK ("variants"."price_cents" > 0),
	CONSTRAINT "variants_stock_not_negative" CHECK ("variants"."stock" >= 0),
	CONSTRAINT "variants_volume_positive" CHECK ("variants"."volume_ml" is null or "variants"."volume_ml" > 0)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");