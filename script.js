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
const modalProductImage = document.getElementById("modalProductImage");
const modalSnapshot = document.getElementById("modalSnapshot");
const modalProcessing = document.getElementById("modalProcessing");
const modalNutrition = document.getElementById("modalNutrition");
const modalSafetyDetails = document.getElementById("modalSafetyDetails");
const modalCompany = document.getElementById("modalCompany");
const modalNews = document.getElementById("modalNews");
// Demo products (replace with real data later)
const PRODUCTS = [
  {
    id: "built-coconut-puff",
    productName: "Coconut Puff",
    brand: "BUILT",
    manufacturer: "BUILT Brands, LLC",
    image: "built-coconut-puff.png",
    keywords: "protein bar protein puff coconut coconut puff built bar snack whey collagen",

    ingredients: [
      "Premium Collagen Protein Blend (Partially Hydrolyzed Whey Protein Isolate, Collagen)",
      "Glycerin",
      "Sugar",
      "Water",
      "Palm and Palm Kernel Oil",
      "Cocoa Processed With Alkali",
      "Gelatin",
      "Natural Flavors",
      "Cultured Dextrose",
      "Nonfat Milk",
      "Soy Lecithin"
    ],

    seedOilIngredients: [],

    allergens: [
      { name: "Milk", status: "contains", note: "Official ingredient list includes nonfat milk and whey protein isolate." },
      { name: "Egg", status: "free", note: "No egg ingredient listed." },
      { name: "Peanut", status: "may", note: "Official label says may contain peanuts." },
      { name: "Tree nuts", status: "may", note: "Official label says may contain tree nuts." },
      { name: "Soy", status: "contains", note: "Official ingredient list includes soy lecithin." },
      { name: "Wheat/Gluten", status: "free", note: "No wheat ingredient listed on the product page." },
      { name: "Sesame", status: "unknown", note: "No sesame statement found on the product page." },
      { name: "Fish", status: "free", note: "No fish ingredient listed." },
      { name: "Shellfish", status: "free", note: "No shellfish ingredient listed." }
    ],

    facilityHistory: [
      { date: "2022-06", title: "Company recall event", body: "FDA posted a Built Brands recall for Banana Cream Pie Puffs due to possible E. coli risk; the recall was later terminated." }
    ],

    snapshotMetrics: [
      { name: "Protein", value: "17g", note: "Official macro listing." },
      { name: "Calories", value: "140", note: "Official macro listing." },
      { name: "Sugar", value: "6g", note: "Official macro listing." },
    ],

    processingMetrics: [
      { name: "Ultra-processed level", value: "NOVA 4", note: "Based on protein isolates, emulsifier, flavoring, and confection-style formulation." },
      { name: "Additive load", value: "Moderate", note: "Natural flavors, cultured dextrose, soy lecithin, glycerin, and alkali-processed cocoa add formulation complexity." },
      { name: "Refined vs whole ratio", value: "Mostly refined/isolated", note: "No obvious whole-food base; formula relies mainly on isolates and processed ingredients." },
      { name: "Seed oil presence / type", value: "No major seed oils", note: "Palm and palm kernel oil are present; soy lecithin is present." },
      { name: "Calorie density", value: "Add grams later", }
    ],

    nutritionMetrics: [
      { name: "Satiety", value: "Moderate", note: "17g protein helps, but the sweet marshmallow-style format may be less filling than less processed options." },
      { name: "Protein quality", value: "Mixed", note: "Whey isolate is high quality; collagen is incomplete, so the blend is less complete than pure whey." },
      { name: "Leucine per serving", value: "~1.2–1.6g est."}
    ],

    safetyMetrics: [
      { name: "Heavy metal risk category", value: "Low", note: "No known warning found from reviewed sources; cocoa-based products can still warrant monitoring." },
      { name: "Recall history/frequency", value: "Limited but non-zero", note: "Public FDA recall found for another Built Puff flavor in 2022." }
    ],

    companyMetrics: [
      { name: "Family-owned / founder-led", value: "Founder-led",},
      { name: "Animal welfare standards", value: "No claim found", note: "No cage-free, pasture-raised, GAP, or similar claims" },
      { name: "Parent company mapping", value: "BUILT Brands, LLC"}
    ],

    newsHistory: [
      { date: "2025-11", title: "New Utah facility", body: "Recent company expansion news highlighted added production and distribution capacity." },
      { date: "2024-08", title: "Founder visibility", body: "Nick Greer was publicly identified as co-founder/CEO in external coverage." },
      { date: "2022-06", title: "Recall history", body: "FDA recall posted for Banana Cream Pie Puffs; not this exact coconut SKU." }
    ]
  }
];

function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

function getSearchText(item, filter) {
  if (filter === "product") return `${item.productName} ${item.keywords || ""}`;
  if (filter === "brand") return item.brand;
  if (filter === "manufacturer") return item.manufacturer;
  return `${item.productName} ${item.brand} ${item.manufacturer} ${item.keywords || ""}`;
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

  if (mode === "nameAsc") return [...items].sort((a, b) => a.productName.localeCompare(b.productName));

  // relevance default
  return [...items].sort((a, b) => computeRelevance(b, query) - computeRelevance(a, query));
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
    return `
      <div class="resultCard" role="button" tabindex="0" data-id="${p.id}">
        <div class="resultTop">
          <div>
            <div class="resultTitle">${p.productName}</div>
            <div class="resultSub">
              Brand: <strong>${p.brand}</strong> • Manufacturer: <strong>${p.manufacturer}</strong>
            </div>
          </div>
        </div>

        <div class="miniGrid">
          <div class="miniBox">
            <div class="k">Open product page</div>
            <div class="v">See full breakdown</div>
          </div>
          <div class="miniBox">
            <div class="k">Includes</div>
            <div class="v">Ingredients + allergens</div>
          </div>
          <div class="miniBox">
            <div class="k">Also includes</div>
            <div class="v">Company + recall history</div>
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
function renderMetricCards(items = []) {
  return items
    .map((item) => {
      return `
        <div class="metricCard">
          <div class="metricName">${item.name}</div>
          <div class="metricValue">${item.value}</div>
          <div class="metricNote">${item.note || ""}</div>
        </div>
      `;
    })
    .join("");
}
function openModal(product) {
  modalTitle.textContent = product.productName;
  modalSub.textContent = `Brand: ${product.brand} • Manufacturer: ${product.manufacturer}`;

  // Ingredients chips (highlight seed oils)
  const seedSet = new Set((product.seedOilIngredients || []).map((s) => normalize(s)));
  modalIngredients.innerHTML = (product.ingredients || [])
    .map((ing) => {
      const isSeed = seedSet.has(normalize(ing));
      return `<span class="ing ${isSeed ? "seed" : ""}">${ing}</span>`;
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
modalProductImage.src = product.image || "";
modalProductImage.alt = product.productName || "Product image";

modalSnapshot.innerHTML = renderMetricCards(product.snapshotMetrics || []);
modalProcessing.innerHTML = renderMetricCards(product.processingMetrics || []);
modalNutrition.innerHTML = renderMetricCards(product.nutritionMetrics || []);
modalSafetyDetails.innerHTML = renderMetricCards(product.safetyMetrics || []);
modalCompany.innerHTML = renderMetricCards(product.companyMetrics || []);

modalNews.innerHTML = (product.newsHistory || [])
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
  modalOverlay.hidden = false;
document.body.classList.add("modal-open");
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
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
