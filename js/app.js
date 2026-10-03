/* ══════════════════════════════════════════
   NUTRIVISION — app.js
   Pipeline : ViT (classification) + BLIP (description) + parser NLP
   100% gratuit — Hugging Face Inference API
   ══════════════════════════════════════════ */

import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";

import {
  mapLabel, getNutrition, buildAnalyse,
  INGREDIENTS, CONSEILS, NUTRI_SCORE,
} from "./data.js";

import { setStep, showHome, renderResults, showError } from "./ui.js";

/* ── Hugging Face — clé publique  ── */
const HF_TOKEN = "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"; 
const HF_BLIP  = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large";

/* ── Config Transformers.js ── */
env.allowLocalModels = false;
env.useBrowserCache  = true;

/* ── Singleton ViT ── */
let classifier = null;
async function getClassifier() {
  if (!classifier) {
    classifier = await pipeline("image-classification", "Xenova/vit-base-patch16-224");
  }
  return classifier;
}

/* ══════════════════════════════════════════
   BLIP — description visuelle de l'image
   ══════════════════════════════════════════ */
async function describeWithBLIP(imageBlob) {
  const response = await fetch(HF_BLIP, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: imageBlob,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`BLIP erreur ${response.status}: ${err}`);
  }

  const data = await response.json();
  /* BLIP retourne [{ generated_text: "a bowl with salmon and rice..." }] */
  return Array.isArray(data) ? data[0]?.generated_text ?? "" : data?.generated_text ?? "";
}

/* ══════════════════════════════════════════
   PARSER — extrait les ingrédients du texte BLIP
   ══════════════════════════════════════════ */
const INGREDIENT_MAP = {
  /* Protéines */
  salmon:   "saumon",      fish:      "poisson",    chicken:   "poulet",
  beef:     "boeuf",       shrimp:    "crevettes",  tuna:      "thon",
  egg:      "oeuf",        eggs:      "oeufs",      tofu:      "tofu",
  /* Féculents */
  rice:     "riz",         pasta:     "pâtes",      bread:     "pain",
  noodle:   "nouilles",    noodles:   "nouilles",   potato:    "pomme de terre",
  quinoa:   "quinoa",      couscous:  "couscous",
  /* Légumes */
  tomato:   "tomate",      tomatoes:  "tomates",    lettuce:   "laitue",
  corn:     "maïs",        avocado:   "avocat",     broccoli:  "brocoli",
  spinach:  "épinards",    cucumber:  "concombre",  carrot:    "carotte",
  onion:    "oignon",      pepper:    "poivron",    mushroom:  "champignon",
  mushrooms:"champignons", zucchini:  "courgette",  eggplant:  "aubergine",
  /* Produits laitiers */
  cheese:   "fromage",     mozzarella:"mozzarella", cream:     "crème",
  yogurt:   "yaourt",
  /* Sauces / condiments */
  sauce:    "sauce",       dressing:  "vinaigrette",olive:     "olives",
  /* Fruits */
  lemon:    "citron",      cherry:    "cerise",     berries:   "fruits rouges",
  apple:    "pomme",       banana:    "banane",     mango:     "mangue",
  /* Herbes */
  basil:    "basilic",     parsley:   "persil",     herbs:     "herbes",
  chives:   "ciboulette",
};

function parseIngredients(caption) {
  const words       = caption.toLowerCase().split(/\W+/);
  const found       = [];
  const seen        = new Set();
  for (const word of words) {
    if (INGREDIENT_MAP[word] && !seen.has(INGREDIENT_MAP[word])) {
      found.push(INGREDIENT_MAP[word]);
      seen.add(INGREDIENT_MAP[word]);
    }
  }
  return found.length > 0 ? found : null;
}

/* ══════════════════════════════════════════
   NUTRITION depuis les ingrédients détectés
   ══════════════════════════════════════════ */
const INGREDIENT_NUTRITION = {
  saumon:    { kcal: 208, prot: 20, gluc: 0,  lip: 13, fib: 0  },
  poulet:    { kcal: 165, prot: 31, gluc: 0,  lip: 4,  fib: 0  },
  boeuf:     { kcal: 250, prot: 26, gluc: 0,  lip: 17, fib: 0  },
  oeuf:      { kcal: 155, prot: 13, gluc: 1,  lip: 11, fib: 0  },
  oeufs:     { kcal: 155, prot: 13, gluc: 1,  lip: 11, fib: 0  },
  riz:       { kcal: 130, prot: 3,  gluc: 28, lip: 0,  fib: 1  },
  pâtes:     { kcal: 220, prot: 8,  gluc: 43, lip: 2,  fib: 2  },
  avocat:    { kcal: 160, prot: 2,  gluc: 9,  lip: 15, fib: 7  },
  tomate:    { kcal: 18,  prot: 1,  gluc: 4,  lip: 0,  fib: 1  },
  tomates:   { kcal: 18,  prot: 1,  gluc: 4,  lip: 0,  fib: 1  },
  maïs:      { kcal: 86,  prot: 3,  gluc: 19, lip: 1,  fib: 2  },
  fromage:   { kcal: 350, prot: 20, gluc: 2,  lip: 28, fib: 0  },
  pain:      { kcal: 265, prot: 9,  gluc: 49, lip: 3,  fib: 3  },
  laitue:    { kcal: 15,  prot: 1,  gluc: 2,  lip: 0,  fib: 1  },
  concombre: { kcal: 16,  prot: 1,  gluc: 4,  lip: 0,  fib: 1  },
};

function nutritionFromIngredients(ingredients) {
  const known = ingredients.filter(i => INGREDIENT_NUTRITION[i]);
  if (known.length === 0) return null;
  /* Moyenne pondérée simple sur les ingrédients connus */
  const sum = { kcal:0, prot:0, gluc:0, lip:0, fib:0 };
  known.forEach(i => {
    const n = INGREDIENT_NUTRITION[i];
    sum.kcal += n.kcal; sum.prot += n.prot;
    sum.gluc += n.gluc; sum.lip  += n.lip; sum.fib += n.fib;
  });
  const k = known.length;
  return {
    calories:  Math.round(sum.kcal / k * 2),   /* ×2 pour portion 200g */
    proteines: Math.round(sum.prot / k * 10) / 10,
    glucides:  Math.round(sum.gluc / k * 10) / 10,
    lipides:   Math.round(sum.lip  / k * 10) / 10,
    fibres:    Math.round(sum.fib  / k * 10) / 10,
  };
}

function nutriScoreFromIngredients(ingredients, vitFood) {
  const hasVeg    = ingredients.some(i => ["laitue","tomate","tomates","concombre","épinards","brocoli","courgette","carotte"].includes(i));
  const hasFish   = ingredients.some(i => ["saumon","thon","poisson","crevettes"].includes(i));
  const hasWhole  = ingredients.some(i => ["quinoa","riz","couscous"].includes(i));
  const hasFat    = ingredients.some(i => ["fromage","crème"].includes(i));
  const hasProcess= ingredients.some(i => ["pain"].includes(i));
  if ((hasVeg && hasFish) || (hasVeg && hasWhole)) return "A";
  if (hasVeg || hasFish || hasWhole) return "B";
  if (hasFat && hasVeg) return "C";
  if (hasFat || hasProcess) return "D";
  return NUTRI_SCORE[vitFood] ?? "C";
}

/* ══════════════════════════════════════════
   PIPELINE PRINCIPAL
   ══════════════════════════════════════════ */
async function runAnalysis(file) {
  document.getElementById("heroSection").style.display  = "none";
  document.getElementById("uploadState").classList.add("hidden");
  document.getElementById("loadingState").classList.remove("hidden");
  document.getElementById("resultsState").classList.add("hidden");

  try {
    /* Étape 1 — ViT : classification générale */
    setStep(1);
    const clf        = await getClassifier();
    const imageURL   = URL.createObjectURL(file);
    const rawResults = await clf(imageURL, { topk: 8 });
    URL.revokeObjectURL(imageURL);

    const seen = new Set(); const mapped = [];
    for (const r of rawResults) {
      const food = mapLabel(r.label);
      if (!seen.has(food)) { seen.add(food); mapped.push({ food, score: Math.round(r.score * 1000) / 10 }); }
    }
    const vitFood  = mapped[0].food;
    const vitScore = mapped[0].score;

    /* Étape 2 — Préparer l'image */
    setStep(2);
    const imgB64 = await fileToBase64(file);

    /* Étape 3 — BLIP : description visuelle */
    setStep(3);
    let caption      = "";
    let ingredients  = null;
    let nutrition    = null;
    let nutri_score  = NUTRI_SCORE[vitFood] ?? "C";
    let usedBLIP     = false;

    try {
      caption     = await describeWithBLIP(file);
      console.log("[BLIP] Caption:", caption);
      ingredients = parseIngredients(caption);
      if (ingredients && ingredients.length > 0) {
        nutrition   = nutritionFromIngredients(ingredients);
        nutri_score = nutriScoreFromIngredients(ingredients, vitFood);
        usedBLIP    = true;
      }
    } catch (blipErr) {
      console.warn("[BLIP] Fallback:", blipErr.message);
    }

    /* Fallback données locales si BLIP échoue */
    if (!ingredients || ingredients.length === 0) {
      ingredients = INGREDIENTS[vitFood] ?? ["ingrédients variés"];
    }
    if (!nutrition) {
      nutrition = getNutrition(vitFood, 200);
    }

    /* Étape 4 — Construire le nom du plat depuis la caption BLIP */
    setStep(4);
    await new Promise(res => setTimeout(res, 300));

    /* Nom du plat : on garde la caption BLIP si disponible, sinon vitFood */
    let foodName = vitFood;
    if (caption) {
      /* Nettoyer la caption BLIP : "a photo of a bowl with salmon..." → "Bowl saumon" */
      const cleaned = caption
        .replace(/^(a photo of |a picture of |an image of |a )/i, "")
        .replace(/\b(photo|picture|image|plate|dish|food)\b/gi, "")
        .replace(/\s+/g, " ").trim();
      foodName = cleaned.length > 3 ? cleaned : vitFood;
    }

    const result = {
      food:        foodName,
      score:       vitScore,
      allScores:   mapped.slice(0, 5),
      nutrition,
      ingredients,
      nutri_score,
      analyse:     buildAnalyse(foodName, nutrition),
      conseil:     CONSEILS[vitFood] ?? "Consommer de façon équilibrée et variée.",
      imgB64,
      source:      usedBLIP ? "blip" : "local",
    };

    renderResults(result);

  } catch (err) {
    console.error("[NutriVision]", err);
    document.getElementById("loadingState").classList.add("hidden");
    showHome();
    showError(err.message ?? "Vérifie ta connexion et réessaie.");
  }
}

/* ── Reset ── */
window.resetApp = function () { showHome(); };

/* ── Utilitaire ── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Events ── */
const fileInput  = document.getElementById("fileInput");
const uploadZone = document.getElementById("uploadZone");

fileInput.addEventListener("change", e => { const f = e.target.files?.[0]; if (f) runAnalysis(f); });
uploadZone.addEventListener("dragover",  e => { e.preventDefault(); uploadZone.classList.add("drag-over"); });
uploadZone.addEventListener("dragleave", ()  => uploadZone.classList.remove("drag-over"));
uploadZone.addEventListener("drop", e => {
  e.preventDefault(); uploadZone.classList.remove("drag-over");
  const f = e.dataTransfer?.files?.[0]; if (f) runAnalysis(f);
});
