/**
 * Fetches statements for multiple Wikidata Q-IDs via SPARQL.
 * Supports multi-valued properties (e.g., geonamesId).
 * Retrieves German and English labels into `label_de` and `label_en`.
 * 
 * @param {string[]} qids - e.g. ["Q64", "Q90"]
 * @param {string[]} propertyIds - e.g. ["P1566", "P646"]
 * @returns {Promise<Object[]>}
 */
export async function fetchWikidataStatements(qids, propertyIds) {
  if (!qids.length || !propertyIds.length) return [];

  const valuesBlock = qids.map(id => `wd:${id}`).join(' ');
  const optionalBlocks = propertyIds.map(pid => `OPTIONAL { ?item wdt:${pid} ?${pid} }`).join('\n  ');

  const query = `
    SELECT ?item ?itemLabel_de ?itemLabel_en ${propertyIds.map(pid => `?${pid}`).join(' ')} WHERE {
      VALUES ?item { ${valuesBlock} }
      ${optionalBlocks}
      SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "de" .
        ?item rdfs:label ?itemLabel_de .
      }
      SERVICE wikibase:label { 
        bd:serviceParam wikibase:language "en" .
        ?item rdfs:label ?itemLabel_en .
      }
    }
  `;

  const endpoint = 'https://query.wikidata.org/sparql';
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json'
      }
    });

    if (!response.ok) {
      throw new Error(`SPARQL request failed: ${response.status}`);
    }

    const data = await response.json();

    const grouped = new Map();

    data.results.bindings.forEach(binding => {
      const qid = binding.item.value.split('/').pop();
      const label_de = binding.itemLabel_de?.value || null;
      const label_en = binding.itemLabel_en?.value || null;

      if (!grouped.has(qid)) {
        grouped.set(qid, {
          id: qid,
          label_de,
          label_en,
          ...Object.fromEntries(propertyIds.map(pid => [pid, []]))
        });
      }

      const entry = grouped.get(qid);

      for (const pid of propertyIds) {
        if (binding[pid]) {
          const value = binding[pid].value;
          if (!entry[pid].includes(value)) {
            entry[pid].push(value);
          }
        }
      }
    });

    return Array.from(grouped.values());
  } catch (error) {
    console.error("Wikidata SPARQL error:", error);
    return [];
  }
}
