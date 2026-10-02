/* ══════════════════════════════════════════
   NUTRIVISION — ui.js
   ══════════════════════════════════════════ */

import { SCORE_COLORS, SCORE_LABELS } from "./data.js";

/* ── Helpers ── */

/** Génère un SVG donut pour la répartition macros */
export function donutSVG(prot, lip, gluc) {
  const total = prot + lip + gluc || 1;
  const circ  = 2 * Math.PI * 54;

  function arc(pct, offset, color) {
    const d   = (circ * pct) / 100;
    const off = -((circ * offset) / 100);
    return `<circle cx="70" cy="70" r="54" fill="none"
      stroke="${color}" stroke-width="14" stroke-linecap="round"
      stroke-dasharray="${d.toFixed(1)} ${circ.toFixed(1)}"
      stroke-dashoffset="${off.toFixed(1)}"
      transform="rotate(-90 70 70)"/>`;
  }

  const p1 = (prot / total) * 100;
  const p2 = (lip  / total) * 100;
  const p3 = (gluc / total) * 100;

  return `
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r="54" fill="none" stroke="#F0F0F0" stroke-width="14"/>
      ${arc(p1, 0,       "#4CAF50")}
      ${arc(p2, p1,      "#FF7043")}
      ${arc(p3, p1 + p2, "#FFB347")}
    </svg>`;
}

/** Active un step du loading */
export function setStep(n) {
  document.querySelectorAll(".ls-step").forEach((s, i) => {
    s.classList.remove("active", "done");
    if (i + 1 <  n) s.classList.add("done");
    if (i + 1 === n) s.classList.add("active");
  });
}

/** Affiche / cache les sections principales */
export function showSection(name) {
  const sections = {
    hero:    document.getElementById("heroSection"),
    upload:  document.getElementById("uploadState"),
    loading: document.getElementById("loadingState"),
    results: document.getElementById("resultsState"),
  };
  for (const [key, el] of Object.entries(sections)) {
    if (!el) continue;
    if (key === name) {
      el.classList.remove("hidden");
      // Le hero reprend display:grid
      if (key === "hero") el.style.display = "grid";
    } else {
      el.classList.add("hidden");
    }
  }
}

/** Réinitialise l'affichage vers l'état initial */
export function showHome() {
  const hero   = document.getElementById("heroSection");
  const upload = document.getElementById("uploadState");
  if (hero)   { hero.classList.remove("hidden"); hero.style.display = "grid"; }
  if (upload) { upload.classList.remove("hidden"); }
  document.getElementById("loadingState")?.classList.add("hidden");
  document.getElementById("resultsState")?.classList.add("hidden");
  document.getElementById("fileInput").value = "";
  document.querySelectorAll(".error-card").forEach(e => e.remove());
}

/* ── Rendu des résultats ── */

export function renderResults(r) {
  const scolor = SCORE_COLORS[r.nutri_score] ?? "#4CAF50";
  const slabel = SCORE_LABELS[r.nutri_score] ?? "";

  // Score segments A→E
  const segs = ["A","B","C","D","E"].map(s => `
    <div class="sbar-seg" style="background:${SCORE_COLORS[s]};opacity:${s === r.nutri_score ? 1 : 0.18}"></div>
  `).join("");

  // Chips ingrédients
  const chips = r.ingredients.map(i => `<span class="chip">${i}</span>`).join("");

  // Barres ViT
  const clipBars = r.allScores.slice(0, 5).map(item => `
    <div class="ci-item">
      <div class="ci-head">
        <span class="ci-name">${capitalize(item.food)}</span>
        <span class="ci-pct">${item.score}%</span>
      </div>
      <div class="ci-bg">
        <div class="ci-fill" style="width:0%"
             data-target="${Math.min(item.score, 100)}%"></div>
      </div>
    </div>`).join("");

  // Macro cards
  const macroData = [
    { icon:"🔥", key:"calories",  label:"Calories",  unit:"kcal", color:"#4CAF50" },
    { icon:"💪", key:"proteines", label:"Protéines", unit:"g",    color:"#56B356" },
    { icon:"🌾", key:"glucides",  label:"Glucides",  unit:"g",    color:"#FFB347" },
    { icon:"🫒", key:"lipides",   label:"Lipides",   unit:"g",    color:"#FF7043" },
    { icon:"🥦", key:"fibres",    label:"Fibres",    unit:"g",    color:"#4DB6AC" },
  ];
  const macroMax = { calories:800, proteines:50, glucides:100, lipides:40, fibres:15 };
  const macroCards = macroData.map(m => {
    const val = r.nutrition[m.key];
    const pct = Math.min((val / macroMax[m.key]) * 100, 100);
    return `
      <div class="card macro-card">
        <div class="macro-icon">${m.icon}</div>
        <div class="macro-val">${val}</div>
        <div class="macro-unit">${m.unit}</div>
        <div class="macro-name">${m.label}</div>
        <div class="macro-bar-bg">
          <div class="macro-bar-fill"
               style="width:0%;background:${m.color}"
               data-target="${pct}%"></div>
        </div>
      </div>`;
  }).join("");

  const n = r.nutrition;
  const foodLabel = capitalize(r.food);
  const imgTag = r.imgB64
    ? `<img class="dish-img" src="${r.imgB64}" alt="${foodLabel}">`
    : `<div class="dish-img-ph">🍽️</div>`;

  document.getElementById("resultsContent").innerHTML = `
    <div class="r-grid-top">

      <div class="card">
        ${imgTag}
        <div class="card-pad">
          <div class="dish-name">${foodLabel}</div>
          <div class="dish-conf">ViT · ${r.score}% de confiance</div>
          <div class="chips">${chips}</div>
        </div>
      </div>

      <div class="card score-card" style="background:${scolor}18">
        <div class="score-eyebrow">Nutri-Score</div>
        <div class="score-letter" style="color:${scolor}">${r.nutri_score}</div>
        <div class="score-label">${slabel}</div>
        <div class="score-bar">${segs}</div>
      </div>

      <div class="card card-pad">
        <div class="clip-section-label">RÉPARTITION MACROS</div>
        <div class="donut-wrap">${donutSVG(n.proteines, n.lipides, n.glucides)}</div>
        <div class="donut-legend">
          <div class="dl-item"><span class="dl-dot" style="background:#4CAF50"></span>Protéines ${n.proteines}g</div>
          <div class="dl-item"><span class="dl-dot" style="background:#FF7043"></span>Lipides ${n.lipides}g</div>
          <div class="dl-item"><span class="dl-dot" style="background:#FFB347"></span>Glucides ${n.glucides}g</div>
        </div>
      </div>

    </div>

    <div class="r-grid-mid">${macroCards}</div>

    <div class="r-grid-bot">

      <div class="card card-pad">
        <div class="analyse-head">
          <div class="ah-dot"></div>
          <div class="ah-lbl">Analyse nutritionnelle</div>
        </div>
        <div class="analyse-text">${r.analyse}</div>
      </div>

      <div class="card conseil-card">
        <div class="cc-icon">💡</div>
        <div class="cc-label">Conseil santé</div>
        <div class="cc-text">${r.conseil}</div>
      </div>

      <div class="card card-pad">
        <div class="clip-section-label">SCORES VIT</div>
        ${clipBars}
      </div>

    </div>
  `;

  // Cacher loading, afficher résultats
  document.getElementById("loadingState").classList.add("hidden");
  document.getElementById("resultsState").classList.remove("hidden");

  // Animer les barres
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-target]").forEach(el => {
      const target = el.dataset.target;
      el.style.transition = "width 1s cubic-bezier(0.34,1.2,0.64,1)";
      el.style.width = target;
    });
  });
}

/** Affiche une erreur sous la zone upload */
export function showError(msg) {
  document.querySelectorAll(".error-card").forEach(e => e.remove());
  const el = document.createElement("div");
  el.className = "error-card";
  el.innerHTML = `
    <h3>Erreur lors de l'analyse</h3>
    <p>${msg}</p>`;
  document.getElementById("uploadZone").insertAdjacentElement("beforebegin", el);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
