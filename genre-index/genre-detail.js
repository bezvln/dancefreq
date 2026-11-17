const SUPABASE_URL = "https://dkmssowizgbxfbhomkjf.supabase.co";
const SUPABASE_KEY = "sb_publishable_KfOm1lrpl0R55BwzhNzGmg_i1V8zzUO";

const params = new URLSearchParams(window.location.search);
const requestedSlug = params.get("genre");

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

function renderMetric(label, value) {
  return `
    <div class="metric-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function renderHistory(history) {
  if (!history.length) {
    return `<p class="empty-state">Historical metrics will appear here once data collection begins.</p>`;
  }

  const values = history
    .map(item => Number(item.overall_score || 0))
    .filter(value => Number.isFinite(value));

  const max = Math.max(...values, 100);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return `
    <div class="chart-wrap">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Genre trend history">
        <polyline points="${points}" />
      </svg>
    </div>
  `;
}

async function loadGenreDetail() {
  const container = document.querySelector("#genre-detail");

  try {
    const genres = await getJson(
      "genres?select=id,name,hub,description&order=name.asc"
    );

    const genre = genres.find(item => slugify(item.name) === requestedSlug);

    if (!genre) {
      container.innerHTML = `
        <h1>Genre not found</h1>
        <p class="empty-state">The requested genre could not be located.</p>
      `;
      return;
    }

    const trends = await getJson(
      `latest_genre_trends?genre_id=eq.${genre.id}&select=*`
    );

    const history = await getJson(
      `genre_trend_history?genre_id=eq.${genre.id}&select=*&order=metric_date.asc`
    );

    const trend = trends[0];

    document.title = `${genre.name} · DanceFreq`;

    container.innerHTML = `
      <div class="genre-detail-heading">
        <div>
          <p class="parent-label">${genre.hub}</p>
          <h1>${genre.name}</h1>
          <p class="genre-description">
            ${genre.description || "Explore how this genre is developing across DJs, producers, scenes, and listeners."}
          </p>
        </div>

        <div class="trend-status">
          ${trend?.trend_label || "Awaiting data"}
        </div>
      </div>

      <section class="metric-grid">
        ${renderMetric("DJ Momentum", formatChange(trend?.dj_change_pct))}
        ${renderMetric("Listener Momentum", formatChange(trend?.listener_change_pct))}
        ${renderMetric("Overall Signal", formatChange(trend?.overall_change_pct))}
        ${renderMetric("Confidence", trend?.confidence_score ? `${trend.confidence_score}%` : "—")}
      </section>

      <section class="trend-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">HISTORICAL SIGNAL</p>
            <h2>How this genre has been moving</h2>
          </div>
          <span>Daily index</span>
        </div>

        ${renderHistory(history)}
      </section>

      <p class="data-note">
        Metrics will become more detailed as DanceFreq connects verified listener,
        DJ, release, festival, and setlist sources.
      </p>
    `;
  } catch (error) {
    container.innerHTML = `
      <h1>Unable to load genre data</h1>
      <p class="empty-state">${error.message}</p>
    `;
  }
}

loadGenreDetail();
