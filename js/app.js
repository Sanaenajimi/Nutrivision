/* ══════════════════════════════════════════
   NUTRIVISION — app.js
   Contrôleur principal : Transformers.js + events
   ══════════════════════════════════════════ */

import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";

import {
  mapLabel, getNutrition, buildAnalyse,
  INGREDIENTS, CONSEILS, NUTRI_SCORE,
} from "./data.js";

import { setStep, showHome, renderResults, showError } from "./ui.js";

/* ── Config Transformers.js ── */
env.allowLocalModels = false;
env.useBrowserCache  = true;   // cache local après 1er téléchargement

/* ── Singleton classifier ── */
let classifier = null;

async function getClassifier() {
  if (!classifier) {
    classifier = await pipeline(
      "image-classification",
      "Xenova/vit-base-patch16-224"
    );
  }
  return classifier;
}

/* ── Pipeline principal ── */
async function runAnalysis(file) {
  // Transitions UI
  document.getElementById("heroSection").style.display  = "none";
  document.getElementById("uploadState").classList.add("hidden");
  document.getElementById("loadingState").classList.remove("hidden");
  document.getElementById("resultsState").classList.add("hidden");

  try {
    // Étape 1 — charger modèle
    setStep(1);
    const clf = await getClassifier();

    // Étape 2 — identifier le plat
    setStep(2);
    const imageURL = URL.createObjectURL(file);
    const rawResults = await clf(imageURL, { topk: 8 });
    URL.revokeObjectURL(imageURL);

    // Mapper + dédupliquer
    const seen   = new Set();
    const mapped = [];
    for (const r of rawResults) {
      const food = mapLabel(r.label);
      if (!seen.has(food)) {
        seen.add(food);
        mapped.push({ food, score: Math.round(r.score * 1000) / 10 });
      }
    }

    const topFood  = mapped[0].food;
    const topScore = mapped[0].score;

    // Étape 3 — macros
    setStep(3);
    const nutrition = getNutrition(topFood, 200);

    // Étape 4 — rapport NLP
    setStep(4);
    await new Promise(res => setTimeout(res, 500)); // pause visuelle

    // Image → base64
    const imgB64 = await fileToBase64(file);

    // Résultat complet
    const result = {
      food:        topFood,
      score:       topScore,
      allScores:   mapped.slice(0, 5),
      nutrition,
      ingredients: INGREDIENTS[topFood] ?? ["ingrédients variés"],
      nutri_score: NUTRI_SCORE[topFood]  ?? "C",
      analyse:     buildAnalyse(topFood, nutrition),
      conseil:     CONSEILS[topFood]     ?? "Consommer de façon équilibrée.",
      imgB64,
    };

    renderResults(result);

  } catch (err) {
    console.error("[NutriVision]", err);
    document.getElementById("loadingState").classList.add("hidden");
    showHome();
    showError(err.message ?? "Vérifie ta connexion et réessaie.");
  }
}

/* ── Reset global ── */
window.resetApp = function () {
  showHome();
};

/* ── Utilitaire ── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Event listeners ── */
const fileInput  = document.getElementById("fileInput");
const uploadZone = document.getElementById("uploadZone");

fileInput.addEventListener("change", e => {
  const f = e.target.files?.[0];
  if (f) runAnalysis(f);
});

uploadZone.addEventListener("dragover", e => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("drag-over");
});
uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  const f = e.dataTransfer?.files?.[0];
  if (f) runAnalysis(f);
});
