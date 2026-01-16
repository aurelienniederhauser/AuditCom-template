// === CONFIG API (selon les instructions du projet) ===
const BASE_URL = "https://auditcom.onrender.com";
const API_ENDPOINTS = {
    pdfs: `${BASE_URL}/api/pdfs`,
};

// === Helpers du template (équivalents "fillGlobals" + "buildLogoUrl") ===
function fillGlobals(globals) {
    Object.entries(globals).forEach(([key, value]) => {
        document.querySelectorAll(`[data-bind-global="${key}"]`).forEach((el) => {
            el.textContent = value ?? "";
        });
    });
}

function buildLogoUrl(logoUrl) {
    if (!logoUrl) return "";
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) return logoUrl;
    // logoUrl est souvent un chemin relatif côté API
    return `${BASE_URL}${logoUrl}`;
}

function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function showMessage(msg, type = "error") {
    const box = document.getElementById("messageContainer");
    if (!box) return;
    box.textContent = msg;
    box.style.color = type === "error" ? "crimson" : "green";
}

// === Carousel dynamique ===
export async function loadClubsCarousel() {
    const track = document.getElementById("clubCarousel");
    if (!track) return;

    try {
        const res = await fetch(API_ENDPOINTS.pdfs);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        // Selon le projet: payload.count + payload.pdfs
        const items = Array.isArray(payload.pdfs) ? payload.pdfs : [];

        fillGlobals({ count: payload.count ?? items.length });

        track.innerHTML = "";
        if (!items.length) return;

        const makeCard = (item) => {
            // Champs attendus par l'API du projet :
            // teamName (nom club), author (auteurs), logoUrl (logo)
            const name = item.teamName ?? item.title ?? "—";
            const author = item.author ?? "—";
            const logo = buildLogoUrl(item.logoUrl ?? "");

            const card = document.createElement("div");
            card.className = "club-card";
            card.innerHTML = `
            <img src="${logo}" alt="Logo ${escapeHtml(name)}" loading="lazy">
            <h4>${escapeHtml(name)}</h4>
            <p>${escapeHtml(author)}</p>
          `;
            return card;
        };

        // 1) Ajout de la série
        const cards = items.map(makeCard);
        cards.forEach((c) => track.appendChild(c));

        // 2) Duplication => scroll infini fluide
        cards.forEach((c) => track.appendChild(c.cloneNode(true)));

        // Durée auto selon nb de clubs
        const duration = Math.max(18, Math.min(70, items.length * 2.5));
        track.style.setProperty("--club-scroll-duration", `${duration}s`);
    } catch (e) {
        console.error(e);
        showMessage("Erreur lors du chargement des clubs (API).", "error");
    }
}

// Lance le chargement quand le DOM est prêt
