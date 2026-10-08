/**
 * Demonstration catalogue: the products of the validated mockup. Everything here is fictional.
 * The data is deterministic: seeding twice gives the same catalogue.
 */

export const categories = [
  { slug: "huiles-d-olive", nameFr: "Huiles d'olive", nameEn: "Olive oils" },
  { slug: "olives-et-tapenades", nameFr: "Olives et tapenades", nameEn: "Olives and tapenades" },
  {
    slug: "vinaigres-et-condiments",
    nameFr: "Vinaigres et condiments",
    nameEn: "Vinegars and condiments",
  },
  { slug: "coffrets", nameFr: "Coffrets", nameEn: "Gift boxes" },
];

export const products = [
  {
    slug: "fruite-vert",
    category: "huiles-d-olive",
    nameFr: "Fruité vert",
    nameEn: "Green fruity",
    taglineFr: "Picholine",
    taglineEn: "Picholine",
    descriptionFr:
      "Des olives cueillies encore vertes, pressées dans la journée. Une huile nerveuse, à verser crue sur ce qui est simple : une tomate, un poisson, une tranche de pain.",
    descriptionEn:
      "Olives picked while still green and pressed the same day. A lively oil to pour raw over simple things: a tomato, a fish, a slice of bread.",
    tint: "sage",
    packshot: "bottle",
    labelFr: "fruité vert",
    labelEn: "green fruity",
    isNewHarvest: true,
    isFeatured: true,
    profile: { fruitiness: 5, bitterness: 3, pungency: 4 },
    variants: [
      { sku: "FV-25", format: "25 cl", volumeMl: 250, priceCents: 1400, stock: 40 },
      {
        sku: "FV-50",
        format: "50 cl",
        volumeMl: 500,
        priceCents: 2400,
        stock: 60,
        isDefault: true,
      },
      { sku: "FV-75", format: "75 cl", volumeMl: 750, priceCents: 3300, stock: 25 },
    ],
  },
  {
    slug: "fruite-mur",
    category: "huiles-d-olive",
    nameFr: "Fruité mûr",
    nameEn: "Ripe fruity",
    taglineFr: "Aglandau",
    taglineEn: "Aglandau",
    descriptionFr:
      "Des olives cueillies à pleine maturité. Une huile douce et ronde, aux notes de fruits secs et de pomme mûre, sans amertume.",
    descriptionEn:
      "Olives picked fully ripe. A soft, round oil with notes of dried fruit and ripe apple, and no bitterness.",
    tint: "zest",
    packshot: "bottle",
    labelFr: "fruité mûr",
    labelEn: "ripe fruity",
    isFeatured: true,
    profile: { fruitiness: 3, bitterness: 1, pungency: 1 },
    variants: [
      {
        sku: "FM-50",
        format: "50 cl",
        volumeMl: 500,
        priceCents: 2200,
        stock: 50,
        isDefault: true,
      },
      { sku: "FM-75", format: "75 cl", volumeMl: 750, priceCents: 3000, stock: 20 },
    ],
  },
  {
    slug: "fruite-noir",
    category: "huiles-d-olive",
    nameFr: "Fruité noir",
    nameEn: "Black fruity",
    taglineFr: "Olives maturées",
    taglineEn: "Matured olives",
    descriptionFr:
      "Des olives laissées à maturer quelques jours avant la presse, à l'ancienne. Olive confite, cacao, sous-bois : un goût profond, sans amertume ni ardence.",
    descriptionEn:
      "Olives left to mature for a few days before pressing, the old way. Candied olive, cocoa, undergrowth: a deep taste with no bitterness or pungency.",
    tint: "peach",
    packshot: "bottle-dark",
    labelFr: "fruité noir",
    labelEn: "black fruity",
    profile: { fruitiness: 4, bitterness: 1, pungency: 1 },
    variants: [
      {
        sku: "FN-50",
        format: "50 cl",
        volumeMl: 500,
        priceCents: 2600,
        stock: 30,
        isDefault: true,
      },
      // Out of stock on purpose: exercises the "unavailable" state of the product page.
      { sku: "FN-75", format: "75 cl", volumeMl: 750, priceCents: 3600, stock: 0 },
    ],
  },
  {
    slug: "le-bidon",
    category: "huiles-d-olive",
    nameFr: "Le bidon",
    nameEn: "The tin",
    taglineFr: "Fruité mûr",
    taglineEn: "Ripe fruity",
    descriptionFr:
      "Notre fruité mûr en bidon d'un litre, à l'abri de la lumière. Le format de la cuisine de tous les jours.",
    descriptionEn:
      "Our ripe fruity oil in a one-litre tin, protected from light. The format for everyday cooking.",
    tint: "sky",
    packshot: "tin",
    labelFr: "fruité mûr",
    labelEn: "ripe fruity",
    isFeatured: true,
    profile: { fruitiness: 3, bitterness: 1, pungency: 1 },
    variants: [
      {
        sku: "BI-100",
        format: "1 L",
        volumeMl: 1000,
        priceCents: 3600,
        stock: 35,
        isDefault: true,
      },
    ],
  },
  {
    slug: "huile-au-citron",
    category: "huiles-d-olive",
    nameFr: "Huile au citron",
    nameEn: "Lemon olive oil",
    taglineFr: "Olives et citrons pressés ensemble",
    taglineEn: "Olives and lemons pressed together",
    descriptionFr:
      "Des citrons entiers passent au moulin avec les olives. Rien d'ajouté après coup : le parfum vient du fruit.",
    descriptionEn:
      "Whole lemons go through the mill with the olives. Nothing is added afterwards: the scent comes from the fruit.",
    tint: "sky",
    packshot: "bottle",
    labelFr: "au citron",
    labelEn: "with lemon",
    variants: [
      {
        sku: "HC-25",
        format: "25 cl",
        volumeMl: 250,
        priceCents: 1400,
        stock: 45,
        isDefault: true,
      },
    ],
  },
  {
    slug: "olives-vertes-cassees",
    category: "olives-et-tapenades",
    nameFr: "Olives vertes cassées",
    nameEn: "Cracked green olives",
    taglineFr: "Au fenouil",
    taglineEn: "With fennel",
    descriptionFr:
      "Des olives vertes cassées une à une puis mises en saumure avec du fenouil. Croquantes, à peine amères.",
    descriptionEn:
      "Green olives cracked one by one, then brined with fennel. Crunchy and barely bitter.",
    tint: "zest",
    packshot: "jar",
    labelFr: "olives vertes",
    labelEn: "green olives",
    variants: [{ sku: "OV-200", format: "200 g", priceCents: 800, stock: 80, isDefault: true }],
  },
  {
    slug: "tapenade-noire",
    category: "olives-et-tapenades",
    nameFr: "Tapenade noire",
    nameEn: "Black olive tapenade",
    taglineFr: "Olives de Nyons",
    taglineEn: "Nyons olives",
    descriptionFr:
      "Des olives noires, des câpres, un filet d'huile. Hachée grossièrement, pour garder de la mâche.",
    descriptionEn: "Black olives, capers, a dash of oil. Coarsely chopped, to keep some bite.",
    tint: "sage",
    packshot: "jar-dark",
    labelFr: "tapenade noire",
    labelEn: "black tapenade",
    isFeatured: true,
    variants: [{ sku: "TN-180", format: "180 g", priceCents: 900, stock: 70, isDefault: true }],
  },
  {
    slug: "vinaigre-de-miel",
    category: "vinaigres-et-condiments",
    nameFr: "Vinaigre de miel",
    nameEn: "Honey vinegar",
    taglineFr: "Doux, vieilli en fût",
    taglineEn: "Mild, barrel-aged",
    descriptionFr:
      "Un vinaigre doux issu d'hydromel, vieilli en fût. Pour déglacer, ou pour réveiller une salade sans la brusquer.",
    descriptionEn:
      "A mild vinegar made from mead and aged in barrels. For deglazing, or to wake up a salad gently.",
    tint: "peach",
    packshot: "vinegar",
    labelFr: "vinaigre",
    labelEn: "vinegar",
    variants: [
      {
        sku: "VM-25",
        format: "25 cl",
        volumeMl: 250,
        priceCents: 1200,
        stock: 40,
        isDefault: true,
      },
    ],
  },
  {
    slug: "coffret-decouverte",
    category: "coffrets",
    nameFr: "Le coffret découverte",
    nameEn: "The discovery box",
    taglineFr: "Trois fruités",
    taglineEn: "Three fruity oils",
    descriptionFr:
      "Vert, mûr et noir en 25 cl, pour trouver le vôtre ou pour offrir. Trois fruités, trois caractères.",
    descriptionEn:
      "Green, ripe and black in 25 cl bottles, to find your own or to give. Three fruity oils, three characters.",
    tint: "zest",
    packshot: "box",
    labelFr: "le coffret",
    labelEn: "the box",
    variants: [
      {
        sku: "CD-3X25",
        format: "3 × 25 cl",
        volumeMl: 750,
        priceCents: 3900,
        stock: 15,
        isDefault: true,
      },
    ],
  },
];
