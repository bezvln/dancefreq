const SUPABASE_URL = "https://dkmssowizgbxfbhomkjf.supabase.co";
const SUPABASE_KEY = "sb_publishable_KfOm1lrpl0R55BwzhNzGmg_i1V8zzUO";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatChange(value) {
  if (value === null || value === undefined) return "—";
  const number = Number(value);
  return `${number >= 0 ? "+" : ""}${number.toFixed(1)}%`;
}

async function getJson(path) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json();
}

async function loadGenreIndex() {
  const hubGrid = document.querySelector("#hub-grid");
  const trendGrid = document.querySelector("#trend-grid");

  if (!hubGrid || !trendGrid) return;

  try {
    const [genres, trends] = await Promise.all([
      getJson("genres?select=id,name,hub,description&order=name.asc"),
      getJson("latest_genre_trends?select=*&order=overall_change_pct.desc.nullslast")
    ]);

    const hubs = [...new Set(genres.map(genre => genre.hub))];

    hubGrid.innerHTML = hubs
      .map(hub => {
        const slug = slugify(hub);
        return `
          <a class="hub-card" href="./genre-detail.html?genre=${slug}">
            <span>${hub}</span>
            <strong>Explore</strong>
          </a>
        `;
      })
      .join("");

    trendGrid.innerHTML = trends.length
      ? trends.slice(0, 6).map(trend => `
          <a class="trend-card" href="./genre-detail.html?genre=${slugify(trend.name)}">
            <div>
              <strong>${trend.name}</strong>
              <span>${trend.hub}</span>
            </div>
            <b>${formatChange(trend.overall_change_pct)}</b>
          </a>
        `).join("")
      : `<p class="empty-state">Trend data will appear here after the first metrics update.</p>`;
  } catch (error) {
    trendGrid.innerHTML = `<p class="empty-state">${error.message}</p>`;
  }
}

loadGenreIndex();
