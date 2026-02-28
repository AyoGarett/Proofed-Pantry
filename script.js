// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.hidden = isOpen;
});

mobileMenu.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    mobileMenu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

// Contact form (front-end only)
const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formNote.textContent =
    "Message sent (demo). Next step is wiring this to email or a database.";
  form.reset();
});

// ------------------------------
// Search (app-style demo: product/brand/manufacturer) + clickable modal
// ------------------------------
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsEl = document.getElementById("results");
const searchCountEl = document.getElementById("searchCount");
const chipButtons = Array.from(document.querySelectorAll(".chip"));
const sortSelect = document.getElementById("sortSelect");

let activeFilter = "all";

// Modal elements
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalScore = document.getElementById("modalScore");
const modalScoreHint = document.getElementById("modalScoreHint");
const modalMayContain = document.getElementById("modalMayContain");
const modalMayContainHint = document.getElementById("modalMayContainHint");
const modalSeedOils = document.getElementById("modalSeedOils");
const modalSeedOilsHint = document.getElementById("modalSeedOilsHint");
const modalRecalls = document.getElementById("modalRecalls");
const modalRecallsHint = document.getElementById("modalRecallsHint");
const modalList = document.getElementById("modalList");
const modalIngredients = document.getElementById("modalIngredients");
const modalAllergens = document.getElementById("modalAllergens");
const reportForm = document.getElementById("reportForm");
const reportProductId = document.getElementById("reportProductId");
const reportType = document.getElementById("reportType");
const reportDetails = document.getElementById("reportDetails");
const reportEmail = document.getElementById("reportEmail");
const reportNote = document.getElementById("reportNote");
const modalFacility = document.getElementById("modalFacility");
// Demo products (replace with real data later)
const PRODUCTS = [
  {
    id: "gt-granola-bites",
    productName: "Almond Butter Granola Bites",
    brand: "GreenTrail",
    manufacturer: "GreenTrail Foods Co.",
    safetyScore: 87,
    mayContainRisk: "Low",
    mayContainWhy: "No recent cross-contact signals detected (demo).",
    seedOils: "Flagged",
    seedOilsWhy: "Contains canola and soybean oil (demo).",
    recalls: "None",
    recallsWhy: "No recalls found in the last 5 years (demo).",
    ingredients: [
      "Rolled oats",
      "Almond butter",
      "Honey",
      "Sea salt",
      "Natural flavors",
      "Canola oil",
      "Soybean oil"
    ],
    seedOilIngredients: ["canola oil", "soybean oil"],
    allergens: [
      { name: "Milk", status: "free", note: "No milk ingredients detected (demo)." },
      { name: "Egg", status: "unknown", note: "Facility data not available (demo)." },
      { name: "Peanut", status: "free", note: "No peanut ingredients detected (demo)." },
      { name: "Tree nuts", status: "contains", note: "Contains almond (demo)." },
      { name: "Soy", status: "may", note: "Soybean oil present; verify processing (demo)." },
      { name: "Wheat/Gluten", status: "may", note: "Shared lines possible (demo)." },
      { name: "Sesame", status: "unknown", note: "Not enough data (demo)." },
      { name: "Fish", status: "free", note: "No fish ingredients detected (demo)." },
      { name: "Shellfish", status: "free", note: "No shellfish ingredients detected (demo)." }
    ],
    facilityHistory: [
      { date: "2025-11", title: "Facility change", body: "Production moved to a new co-manufacturer (demo)." },
      { date: "2025-06", title: "Allergen protocol update", body: "Cleaning validation process improved (demo)." },
      { date: "2024-09", title: "No recalls recorded", body: "No relevant recall events found (demo)." }
    ]
  },
  {
    id: "sf-oat-bar-choc",
    productName: "Oat Snack Bar (Chocolate)",
    brand: "SunField",
    manufacturer: "SunField Manufacturing",
    safetyScore: 72,
    mayContainRisk: "Medium",
    mayContainWhy: "Mixed signals across similar SKUs (demo).",
    seedOils: "Not flagged",
    seedOilsWhy: "No seed oils detected in ingredients (demo).",
    recalls: "1 recall (last 5 yrs)",
    recallsWhy: "Single recall event in category history (demo).",
    ingredients: [
      "Oats",
      "Cocoa",
      "Cane sugar",
      "Sunflower lecithin",
      "Salt"
    ],
    seedOilIngredients: [],
    allergens: [
      { name: "Milk", status: "may", note: "Chocolate line may share equipment (demo)." },
      { name: "Egg", status: "free", note: "No egg ingredients detected (demo)." },
      { name: "Peanut", status: "may", note: "Shared facility warning (demo)." },
      { name: "Tree nuts", status: "may", note: "Shared facility warning (demo)." },
      { name: "Soy", status: "free", note: "No soy ingredients detected (demo)." },
      { name: "Wheat/Gluten", status: "may", note: "Oats may be processed near wheat (demo)." },
      { name: "Sesame", status: "unknown", note: "Not enough data (demo)." },
      { name: "Fish", status: "free", note: "No fish ingredients detected (demo)." },
      { name: "Shellfish", status: "free", note: "No shellfish ingredients detected (demo)." }
    ],
    facilityHistory: [
      { date: "2025-02", title: "Recall event", body: "Recall recorded for labeling issue (demo)." },
      { date: "2024-12", title: "Supplier change", body: "Cocoa supplier switched (demo)." }
    ]
  }
];

function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

function getSearchText(item, filter) {
  if (filter === "product") return item.productName;
  if (filter === "brand") return item.brand;
  if (filter === "manufacturer") return item.manufacturer;
  return `${item.productName} ${item.brand} ${item.manufacturer}`;
}

function computeRelevance(item, query) {
  const q = normalize(query);
  if (!q) return 0;

  const product = normalize(item.productName);
  const brand = normalize(item.brand);
  const mfg = normalize(item.manufacturer);

  let score = 0;
  if (product.startsWith(q)) score += 50;
  if (brand.startsWith(q)) score += 40;
  if (mfg.startsWith(q)) score += 30;

  if (product.includes(q)) score += 20;
  if (brand.includes(q)) score += 15;
  if (mfg.includes(q)) score += 10;

  return score;
}

function matchesFilter(item, query, filter) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(getSearchText(item, filter)).includes(q);
}

function sortItems(items, query) {
  const mode = sortSelect.value;

  if (mode === "scoreDesc") return [...items].sort((a, b) => b.safetyScore - a.safetyScore);
  if (mode === "scoreAsc") return [...items].sort((a, b) => a.safetyScore - b.safetyScore);
  if (mode === "nameAsc") return [...items].sort((a, b) => a.productName.localeCompare(b.productName));

  // relevance default
  return [...items].sort((a, b) => computeRelevance(b, query) - computeRelevance(a, query));
}

function scoreLabel(n) {
  if (n >= 85) return "Safe";
  if (n >= 70) return "Caution";
  return "Risk";
}

function renderResults(items, query) {
  if (items.length === 0) {
    resultsEl.innerHTML = `
      <div class="resultCard" role="button" tabindex="0">
        <div class="resultTitle">No results found</div>
        <div class="resultSub">Try a different keyword (product, brand, or manufacturer).</div>
      </div>
    `;
    searchCountEl.textContent = "0 results";
    return;
  }

  searchCountEl.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;

  resultsEl.innerHTML = items
    .map((p) => {
      const label = scoreLabel(p.safetyScore);
      return `
        <div class="resultCard" role="button" tabindex="0" data-id="${p.id}">
          <div class="resultTop">
            <div>
              <div class="resultTitle">${p.productName}</div>
              <div class="resultSub">
                Brand: <strong>${p.brand}</strong> • Manufacturer: <strong>${p.manufacturer}</strong>
              </div>
              <div class="badges">
                <span class="badge">“May contain” risk: ${p.mayContainRisk}</span>
                <span class="badge">Seed oils: ${p.seedOils}</span>
                <span class="badge">Recalls: ${p.recalls}</span>
              </div>
            </div>

            <div class="scorePill" title="Example Safety Score">
              <span class="n">${p.safetyScore}</span>
              <span class="t">${label}</span>
            </div>
          </div>

          <div class="miniGrid">
            <div class="miniBox">
              <div class="k">Tap for details</div>
              <div class="v">Full breakdown view</div>
            </div>
            <div class="miniBox">
              <div class="k">Next step</div>
              <div class="v">Connect real data</div>
            </div>
            <div class="miniBox">
              <div class="k">Roadmap</div>
              <div class="v">Filters + alerts</div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Modal helpers
function statusClass(status) {
  if (status === "contains") return "bad";
  if (status === "may") return "warn";
  if (status === "free") return "ok";
  return "unk";
}

function statusText(status) {
  if (status === "contains") return "Contains";
  if (status === "may") return "May contain";
  if (status === "free") return "Free from";
  return "Unknown";
}

function openModal(product) {
  modalTitle.textContent = product.productName;
  modalSub.textContent = `Brand: ${product.brand} • Manufacturer: ${product.manufacturer}`;

  modalScore.textContent = `${product.safetyScore} (${scoreLabel(product.safetyScore)})`;
  modalScoreHint.textContent = "Composite score (demo). Will reflect your real methodology.";

  modalMayContain.textContent = product.mayContainRisk;
  modalMayContainHint.textContent = product.mayContainWhy;

  modalSeedOils.textContent = product.seedOils;
  modalSeedOilsHint.textContent = product.seedOilsWhy;

  modalRecalls.textContent = product.recalls;
  modalRecallsHint.textContent = product.recallsWhy;

  // Ingredients chips (highlight seed oils)
  const seedSet = new Set((product.seedOilIngredients || []).map((s) => normalize(s)));
  modalIngredients.innerHTML = (product.ingredients || [])
    .map((ing) => {
      const isSeed = seedSet.has(normalize(ing));
      return `<span class="ing ${isSeed ? "seed" : ""}">${ing}</span>`;
    })
    .join("");

  // Allergen matrix
  modalAllergens.innerHTML = (product.allergens || [])
    .map((a) => {
      const cls = statusClass(a.status);
      return `
        <div class="allergenCard">
          <div class="allergenName">${a.name}</div>
          <div class="allergenStatus ${cls}">${statusText(a.status)}</div>
          <div class="allergenNote">${a.note || ""}</div>
        </div>
      `;
    })
    .join("");

  // Facility timeline
  modalFacility.innerHTML = (product.facilityHistory || [])
    .map((ev) => {
      return `
        <div class="event">
          <div class="eventTop">
            <div class="eventTitle">${ev.title}</div>
            <div class="eventDate">${ev.date}</div>
          </div>
          <div class="eventBody">${ev.body}</div>
        </div>
      `;
    })
    .join("");

  // Report form setup
  reportProductId.value = product.id;
  reportForm.reset();
  reportNote.textContent = "";

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  // click outside modal closes
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
});
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    productId: reportProductId.value,
    type: reportType.value,
    details: reportDetails.value,
    email: reportEmail.value || null,
    createdAt: new Date().toISOString(),
  };

  const existing = JSON.parse(localStorage.getItem("pp_reports") || "[]");
  existing.push(payload);
  localStorage.setItem("pp_reports", JSON.stringify(existing));

  reportNote.textContent = "Report submitted (saved locally for demo). Thank you!";
  reportForm.reset();
});
// Delegate clicks on results
resultsEl.addEventListener("click", (e) => {
  const card = e.target.closest(".resultCard[data-id]");
  if (!card) return;
  const id = card.dataset.id;
  const product = PRODUCTS.find((p) => p.id === id);
  if (product) openModal(product);
});

// Keyboard accessibility: Enter on focused card
resultsEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const card = e.target.closest(".resultCard[data-id]");
  if (!card) return;
  const product = PRODUCTS.find((p) => p.id === card.dataset.id);
  if (product) openModal(product);
});

function runSearch() {
  const q = searchInput.value;
  clearBtn.hidden = !q;

  const filtered = PRODUCTS.filter((p) => matchesFilter(p, q, activeFilter));
  const sorted = sortItems(filtered, q);
  renderResults(sorted, q);
}

// Chips
chipButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    chipButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    runSearch();
  });
});

// App-style: instant results
searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("input", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.hidden = true;
  runSearch();
});

sortSelect.addEventListener("change", runSearch);

// Initial render
renderResults(sortItems(PRODUCTS, ""), "");
searchCountEl.textContent = `${PRODUCTS.length} results`;
