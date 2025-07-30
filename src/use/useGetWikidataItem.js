export async function useGetWikidataItem(qid, vars, opt) {

  const endpointUrl = 'https://query.wikidata.org/sparql';

  const query = `
  SELECT ?label_de ?label_en ?desc_de ?desc_en ${vars}  WHERE {
  VALUES ?item { wd:${qid} }

  ?item rdfs:label ?label_de FILTER (lang(?label_de) = "de").
  ?item rdfs:label ?label_en FILTER (lang(?label_en) = "en").

  OPTIONAL { ?item schema:description ?desc_de FILTER (lang(?desc_de) = "de") }
  OPTIONAL { ?item schema:description ?desc_en FILTER (lang(?desc_en) = "en") }
  ${opt}
  
}
LIMIT 1
`.trim();
  const url = endpointUrl + '?query=' + encodeURIComponent(query);

  const headers = {
    'Accept': 'application/sparql-results+json',
  };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`SPARQL query failed: ${response.statusText}`);
  }

  const data = await response.json();
  const bindings = data.results.bindings[0];

  if (!bindings) {
    return null;
  }

  // Assemble result
  const result = {
    id: qid,
    label: {
      de: bindings.label_de?.value || '',
      en: bindings.label_en?.value || '',
    },
    description: {
      de: bindings.desc_de?.value || '',
      en: bindings.desc_en?.value || '',
    },
    identifiers: {}
  };

  return bindings;
}
