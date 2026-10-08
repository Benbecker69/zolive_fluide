/**
 * Loads the demonstration catalogue. One-off administration command (pnpm db:seed):
 * it replaces the catalogue in a single transaction, so running it twice gives the same result.
 * With --if-empty, it does nothing when a catalogue is already there.
 */
import pg from "pg";

import { categories, products } from "./seed-data.mjs";

/**
 * @param {string} connectionString
 * @param {{ ifEmpty?: boolean }} [options] With `ifEmpty`, an existing catalogue is left untouched.
 */
export async function seed(connectionString, options = {}) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    if (options.ifEmpty) {
      const existing = await client.query("select count(*)::int as n from products");
      if (existing.rows[0].n > 0) return { skipped: true, categories: 0, products: 0 };
    }

    await client.query("begin");
    await client.query("truncate table variants, products, categories restart identity cascade");

    const categoryIds = new Map();
    for (const [position, category] of categories.entries()) {
      const { rows } = await client.query(
        "insert into categories (slug, name_fr, name_en, position) values ($1, $2, $3, $4) returning id",
        [category.slug, category.nameFr, category.nameEn, position],
      );
      categoryIds.set(category.slug, rows[0].id);
    }

    for (const [position, product] of products.entries()) {
      const { rows } = await client.query(
        `insert into products (
           slug, category_id, name_fr, name_en, tagline_fr, tagline_en, description_fr, description_en,
           tint, packshot, label_fr, label_en, is_new_harvest, is_featured,
           fruitiness, bitterness, pungency, position
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         returning id`,
        [
          product.slug,
          categoryIds.get(product.category),
          product.nameFr,
          product.nameEn,
          product.taglineFr,
          product.taglineEn,
          product.descriptionFr,
          product.descriptionEn,
          product.tint,
          product.packshot,
          product.labelFr,
          product.labelEn,
          product.isNewHarvest ?? false,
          product.isFeatured ?? false,
          product.profile?.fruitiness ?? null,
          product.profile?.bitterness ?? null,
          product.profile?.pungency ?? null,
          position,
        ],
      );
      for (const [variantPosition, variant] of product.variants.entries()) {
        await client.query(
          `insert into variants (product_id, sku, format, volume_ml, price_cents, stock, is_default, position)
           values ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            rows[0].id,
            variant.sku,
            variant.format,
            variant.volumeMl ?? null,
            variant.priceCents,
            variant.stock,
            variant.isDefault ?? false,
            variantPosition,
          ],
        );
      }
    }

    await client.query("commit");
    return { skipped: false, categories: categories.length, products: products.length };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

// Run only when called directly, not when imported by the tests.
if (process.argv[1]?.endsWith("seed.mjs")) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is missing");
    process.exit(1);
  }
  const result = await seed(url, { ifEmpty: process.argv.includes("--if-empty") });
  console.log(
    result.skipped
      ? "Catalogue already present: nothing seeded"
      : `Seeded ${result.categories} categories and ${result.products} products`,
  );
}
