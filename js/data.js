/* ══════════════════════════════════════════
   NUTRIVISION — data.js
   Base de données nutritionnelle + mappings
   ══════════════════════════════════════════ */

export const NUTRITION_DB = {
  pizza:    { kcal: 266, prot: 11, gluc: 33, lip: 10, fib: 2 },
  burger:   { kcal: 295, prot: 17, gluc: 24, lip: 14, fib: 1 },
  salade:   { kcal: 45,  prot: 3,  gluc: 7,  lip: 2,  fib: 3 },
  pates:    { kcal: 220, prot: 8,  gluc: 43, lip: 2,  fib: 2 },
  riz:      { kcal: 130, prot: 3,  gluc: 28, lip: 0,  fib: 1 },
  soupe:    { kcal: 55,  prot: 3,  gluc: 8,  lip: 2,  fib: 2 },
  sushi:    { kcal: 150, prot: 6,  gluc: 28, lip: 1,  fib: 1 },
  sandwich: { kcal: 250, prot: 12, gluc: 30, lip: 8,  fib: 2 },
  steak:    { kcal: 271, prot: 26, gluc: 0,  lip: 18, fib: 0 },
  poulet:   { kcal: 165, prot: 31, gluc: 0,  lip: 4,  fib: 0 },
  poisson:  { kcal: 140, prot: 25, gluc: 0,  lip: 4,  fib: 0 },
  omelette: { kcal: 154, prot: 11, gluc: 1,  lip: 12, fib: 0 },
  crepe:    { kcal: 200, prot: 6,  gluc: 28, lip: 7,  fib: 1 },
  gateau:   { kcal: 380, prot: 5,  gluc: 52, lip: 18, fib: 1 },
  fruit:    { kcal: 60,  prot: 1,  gluc: 14, lip: 0,  fib: 3 },
  legumes:  { kcal: 40,  prot: 2,  gluc: 8,  lip: 0,  fib: 4 },
  fromage:  { kcal: 350, prot: 20, gluc: 2,  lip: 28, fib: 0 },
  yaourt:   { kcal: 90,  prot: 5,  gluc: 10, lip: 3,  fib: 0 },
  smoothie: { kcal: 80,  prot: 2,  gluc: 16, lip: 1,  fib: 2 },
};

export const INGREDIENTS = {
  pizza:    ["farine", "tomate", "mozzarella", "huile d'olive"],
  burger:   ["pain", "viande", "salade", "tomate", "fromage"],
  salade:   ["laitue", "tomate", "concombre", "vinaigrette"],
  pates:    ["pâtes", "sauce tomate", "parmesan", "basilic"],
  riz:      ["riz", "légumes", "épices"],
  soupe:    ["bouillon", "légumes", "sel", "poivre"],
  sushi:    ["riz", "poisson cru", "algue nori", "wasabi"],
  sandwich: ["pain", "jambon", "fromage", "moutarde"],
  steak:    ["boeuf", "sel", "poivre", "beurre"],
  poulet:   ["poulet", "herbes", "citron", "huile"],
  poisson:  ["poisson", "citron", "herbes", "huile"],
  omelette: ["oeufs", "sel", "beurre", "fines herbes"],
  crepe:    ["farine", "oeufs", "lait", "beurre", "sucre"],
  gateau:   ["farine", "sucre", "oeufs", "beurre", "chocolat"],
  fruit:    ["vitamines", "fibres", "sucres naturels"],
  legumes:  ["fibres", "vitamines", "minéraux"],
  fromage:  ["lait", "sel", "ferments lactiques"],
  yaourt:   ["lait", "ferments", "probiotiques"],
  smoothie: ["fruits", "lait végétal", "graines"],
};

export const CONSEILS = {
  pizza:    "Consommer avec modération. Préférer une pâte fine avec des légumes.",
  burger:   "Riche en graisses saturées. Limiter à 1 fois par semaine.",
  salade:   "Excellent choix. Riche en fibres et vitamines. Attention aux sauces.",
  pates:    "Bonne source d'énergie. Préférer les pâtes complètes.",
  riz:      "Index glycémique modéré. Favoriser le riz complet ou basmati.",
  soupe:    "Très bon choix. Hydratant et peu calorique.",
  sushi:    "Riche en oméga-3. Attention au sel de la sauce soja.",
  sandwich: "Équilibré si bien garni. Attention au pain blanc et aux sauces.",
  steak:    "Excellente source de protéines et de fer. Limiter à 2-3 fois par semaine.",
  poulet:   "Protéines maigres idéales. Très bon choix nutritionnel.",
  poisson:  "Riche en oméga-3. Consommer 2-3 fois par semaine.",
  omelette: "Bonne source de protéines. Riche en vitamines B.",
  crepe:    "Énergie rapide. Préférer des garnitures légères.",
  gateau:   "Plaisir occasionnel. Riche en sucres et graisses.",
  fruit:    "Excellent. Source naturelle de vitamines et antioxydants.",
  legumes:  "Parfait. La base de toute alimentation équilibrée.",
  fromage:  "Riche en calcium. Consommer 30g par jour maximum.",
  yaourt:   "Bon pour la flore intestinale. Préférer nature sans sucre ajouté.",
  smoothie: "Attention aux sucres. Préférer les versions maison sans sucre ajouté.",
};

export const NUTRI_SCORE = {
  pizza: "C", burger: "D", salade: "A", pates: "B", riz: "B",
  soupe: "A", sushi: "B", sandwich: "C", steak: "C", poulet: "A",
  poisson: "A", omelette: "B", crepe: "C", gateau: "E", fruit: "A",
  legumes: "A", fromage: "D", yaourt: "B", smoothie: "B",
};

export const SCORE_COLORS = {
  A: "#4CAF50", B: "#8BC34A", C: "#FFC107", D: "#FF7043", E: "#F44336",
};

export const SCORE_LABELS = {
  A: "Excellent", B: "Bon", C: "Correct", D: "Limité", E: "À éviter",
};

/** Mapping labels ViT (anglais) → nos catégories FR */
export const VIT_MAP = {
  pizza:         "pizza",
  cheeseburger:  "burger",    hamburger:   "burger",
  "caesar salad":"salade",    "green salad":"salade", salad: "salade",
  spaghetti:     "pates",     carbonara:   "pates",   pasta: "pates", noodle: "pates",
  "fried rice":  "riz",       pilaf:       "riz",     rice:  "riz",
  soup:          "soupe",     minestrone:  "soupe",
  sushi:         "sushi",     sashimi:     "sushi",
  sandwich:      "sandwich",
  steak:         "steak",     "beef steak":"steak",
  chicken:       "poulet",    "fried chicken":"poulet", "roast chicken":"poulet",
  fish:          "poisson",   salmon:      "poisson",
  omelette:      "omelette",  egg:         "omelette",
  crepe:         "crepe",
  cake:          "gateau",    chocolate:   "gateau",
  banana:        "fruit",     apple:       "fruit",    fruit: "fruit",
  broccoli:      "legumes",   vegetable:   "legumes",  avocado: "legumes",
  cheese:        "fromage",
  yogurt:        "yaourt",
  smoothie:      "smoothie",
};

/**
 * Mappe un label ViT vers une de nos catégories.
 * @param {string} label
 * @returns {string}
 */
export function mapLabel(label) {
  const l = label.toLowerCase();
  for (const [key, val] of Object.entries(VIT_MAP)) {
    if (l.includes(key)) return val;
  }
  return "salade"; // défaut
}

/**
 * Calcule les valeurs nutritionnelles pour une portion donnée.
 * @param {string} key - clé de NUTRITION_DB
 * @param {number} portionG - portion en grammes
 * @returns {{ calories, proteines, glucides, lipides, fibres }}
 */
export function getNutrition(key, portionG = 200) {
  const base = NUTRITION_DB[key] ?? NUTRITION_DB["salade"];
  const r = portionG / 100;
  return {
    calories:  Math.round(base.kcal * r),
    proteines: Math.round(base.prot * r * 10) / 10,
    glucides:  Math.round(base.gluc * r * 10) / 10,
    lipides:   Math.round(base.lip  * r * 10) / 10,
    fibres:    Math.round(base.fib  * r * 10) / 10,
  };
}

/**
 * Génère une description nutritionnelle en langage naturel (NLP règles).
 * @param {string} food
 * @param {{ calories, proteines, fibres, lipides }} n
 * @returns {string}
 */
export function buildAnalyse(food, n) {
  const calMsg  = n.calories < 200 ? "peu calorique"
                : n.calories < 400 ? "modérément calorique"
                : "calorique";
  const protMsg = n.proteines >= 20
    ? `excellente source de protéines (${n.proteines}g)`
    : `apport en protéines de ${n.proteines}g`;
  const fibMsg  = n.fibres >= 3
    ? `riche en fibres (${n.fibres}g)`
    : `fibres limitées (${n.fibres}g)`;
  const lipMsg  = n.lipides >= 15
    ? `lipides élevés (${n.lipides}g) — attention aux graisses saturées`
    : `lipides modérés (${n.lipides}g)`;
  const integMsg = n.calories < 400 ? "facilement" : "avec modération";

  return `Pour une portion de 200g, ce plat est ${calMsg} (${n.calories} kcal). ` +
         `Il présente une ${protMsg}, est ${fibMsg}, et contient des ${lipMsg}. ` +
         `Il s'intègre ${integMsg} dans une alimentation équilibrée.`;
}
