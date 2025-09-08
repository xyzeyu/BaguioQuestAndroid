// tools/geocode-pois.js
// Node 18+ required (global fetch). Run: node tools/geocode-pois.js

const fs = require("fs/promises");

// Center of Baguio (approx City Hall); used to pick the closest hit if multiple
const BAGUIO_CENTER = { lat: 16.4138, lng: 120.5950 };

// A generous bounding box around Baguio + immediate surroundings (La Trinidad / Kennon / Asin)
const VIEWBOX = {
  minLon: 120.45,
  minLat: 16.30,
  maxLon: 120.70,
  maxLat: 16.52,
};

const PLACES = [
  "Burnham Park",
  "Baguio Cathedral",
  "Session Road",
  "Mines View Park",
  "Baguio Botanical Garden",
  "Wright Park",
  "SM City Baguio",
  "Camp John Hay",
  "The Mansion",
  "Baguio Public Market",
  "Lion's Head",
  "Teachers Camp",
  "Strawberry Farm",
  "Tam-awan Village",
  "Bencab Museum",
  "Asin Hot Springs",
  "Baguio Country Club",
  "Mirador Jesuit Villa",
  "Good Shepherd Convent",
  "Lourdes Grotto",
  "Baguio Flower Festival Park",
  "Diplomat Hotel",
  "Café by the Ruins",
  "Oh My Gulay",
  "Lemon and Olives Greek Taverna",
  "Hill Station",
  "The Original Good Taste Cafe & Restaurant",
  "Agara Ramen",
  "Amare La Cucina",
  "Canto Bogchi Joint",
  "Chaya",
  "Balajadia Kitchenette",
  "50's Diner Baguio",
  "The Manor at Camp John Hay",
  "The Forest Lodge at Camp John Hay",
  "Sotogrande Hotel Baguio",
  "Microtel by Wyndham Baguio",
  "Hotel Elizabeth Baguio",
  "G1 Lodge Design Hotel",
  "Grand Sierra Pines Hotel",
  "Kamiseta Hotel",
  "Casa Vallejo",
  "Maharlika Livelihood Center",
  "Session Road Sunday Market",
  "Harrison Road Night Market",
  "Easter Weaving, Inc.",
  "Mt. Cloud Bookshop",
  "Redzel's Baguio",
  "Shell – Abanao Road",
  "Shell – Marcos Highway (KM 4)",
  "Caltex – Brower Road",
  "Caltex – Chanum Street",
  "Petron – Worcester Road",
  "JCQ Gas Station – Kennon Road",
];

// polite delay for Nominatim (please respect usage policy)
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const dist2 = (a, b) => {
  const dy = a.lat - b.lat;
  const dx = a.lng - b.lng;
  return dy * dy + dx * dx;
};

// Keep only likely POI-ish classes
const ACCEPTABLE_CLASSES = new Set([
  "amenity", "tourism", "leisure", "shop",
  "natural", "place", "highway", "building",
]);

async function searchNominatim(q, opts = {}) {
  const params = new URLSearchParams({
    format: "jsonv2",
    q,
    addressdetails: "0",
    extratags: "1",
    namedetails: "0",
    limit: "5",
  });

  if (opts.viewbox) {
    const { minLon, minLat, maxLon, maxLat } = opts.viewbox;
    params.set("viewbox", `${minLon},${maxLat},${maxLon},${minLat}`); // left,top,right,bottom
    params.set("bounded", "1");
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "BaguioQuest/1.0 (dev script)",
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for ${q}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function pickBest(candidates) {
  const filtered = candidates.filter((c) => ACCEPTABLE_CLASSES.has(c.class));
  const pool = filtered.length ? filtered : candidates;
  if (!pool.length) return null;

  // Score: prefer within ~Baguio, closer to center, and higher importance if present
  const scored = pool.map((c) => {
    const lat = +c.lat, lng = +c.lon;
    const d2 = dist2({ lat, lng }, BAGUIO_CENTER);
    const importance = typeof c.importance === "number" ? c.importance : 0;
    const score = importance * 10 - d2; // simple heuristic
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].c;
}

async function geocodeOne(name) {
  // Try bounded in Baguio first
  const queries = [
    `${name}, Baguio, Philippines`,
    `${name}, Benguet, Philippines`,
    `${name}, Philippines`,
  ];

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const useViewbox = i === 0; // only bound the first attempt
    const results = await searchNominatim(q, useViewbox ? { viewbox: VIEWBOX } : {});
    if (results.length) {
      const best = pickBest(results);
      if (best) {
        return {
          name,
          query: q,
          lat: +best.lat,
          lng: +best.lon,
          class: best.class,
          type: best.type,
          display_name: best.display_name,
          osm_type: best.osm_type,
          osm_id: best.osm_id,
        };
      }
    }
  }
  return { name, lat: null, lng: null, note: "not_found" };
}

async function main() {
  const out = [];
  for (const name of PLACES) {
    try {
      const r = await geocodeOne(name);
      out.push(r);
      console.log(
        r.lat != null
          ? `✓ ${name}  =>  ${r.lat.toFixed(6)}, ${r.lng.toFixed(6)}`
          : `✗ ${name}  =>  NOT FOUND`
      );
    } catch (e) {
      console.error(`! ${name} ERROR:`, e.message);
      out.push({ name, lat: null, lng: null, error: String(e) });
    }
    await delay(1200); // throttle ~1.2s per request
  }

  // Write JSON dump
  await fs.writeFile("poi_coords.json", JSON.stringify(out, null, 2));

  // Also write a TS mapping you can import in the app
  const records = out
    .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
    .map(
      (r) =>
        `  ${JSON.stringify(r.name)}: { lat: ${r.lat}, lng: ${r.lng} }`
    )
    .join(",\n");

  const ts = `// app/mocks/poi_coords.ts
// Generated by tools/geocode-pois.js
export const poiCoords: Record<string, { lat: number; lng: number }> = {
${records}
};
`;
  await fs.mkdir("app/mocks", { recursive: true });
  await fs.writeFile("app/mocks/poi_coords.ts", ts, "utf8");

  console.log("\nWrote:");
  console.log(" - poi_coords.json (full raw results)");
  console.log(" - app/mocks/poi_coords.ts (name → {lat,lng} map)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



