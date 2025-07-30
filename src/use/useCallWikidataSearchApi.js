import { fetchWikidataStatements } from './useFetchWikidataStatements.js';

const P_GEONAMES = 'P1566';

function buildWikidataSearchUrl(query, config = {}) {
  const defaultParams = {
    action: "wbsearchentities",
    search: query,
    language: "en",
    limit: 100,
    format: "json",
    origin: "*",
  };

  const params = new URLSearchParams({ ...defaultParams, ...config });
  return `https://www.wikidata.org/w/api.php?${params.toString()}`;
}

export async function fetchWikidataSearchResults(query = "berlin", config = {}) {
  const url = buildWikidataSearchUrl(query, config);

  try {
    // Step 1: Search base entities
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const baseResults = data.search.map(item => ({
      id: item.id,
      description: item.description || '',
    }));

    const qids = baseResults.map(r => r.id);

    // Step 2: Fetch geonamesId(s) and labels via SPARQL
    const enrichedData = await fetchWikidataStatements(qids, [P_GEONAMES]);
    const enrichedMap = Object.fromEntries(enrichedData.map(e => [e.id, e]));

    // Step 3: Merge, compute display label, and filter
    const finalResults = baseResults
      .map(result => {
        const enriched = enrichedMap[result.id] || {};
        const label_en = enriched.label_en || '';
        const label_de = enriched.label_de || '';
        const label = (label_en === label_de || !label_de)
          ? label_en
          : `${label_en} (${label_de})`;

        return {
          ...result,
          label,
          label_en,
          label_de,
          geonamesId: enriched[P_GEONAMES] || [],
        };
      })
      .filter(result => result.geonamesId.length > 0); // only include if GeoNames ID exists

    return finalResults;
  } catch (error) {
    console.error("Wikidata API error:", error);
    return [];
  }
}
