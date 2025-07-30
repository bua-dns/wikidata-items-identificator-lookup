export function useMapForCsvDownload(item) {
    const data = {
        place: item.infoLabel || '',
        placeDescription: item.locationDescription || '',
        gndId: item.wikidataData.gndId || '',
        gndLink: item.gndId ? `https://d-nb.info/gnd/${item.wikidataData.gndId}` : '',
        geonamesId: item.geonameId || '',
        geonamesLink: item.geonameId ? `https://www.geonames.org/${item.geonameId}` : '',
        wikidataId: item.wikidataData?.id || '',
        wikidataLink: item.wikidataData?.id ? `https://www.wikidata.org/wiki/${item.wikidataData.id}` : '',
        mindatLocationId: item.wikidataData.mindatLocationId || '',
        mindatLink: item.wikidataData.mindatLocationId ? `https://www.mindat.org/loc-${item.wikidataData.mindatLocationId}.html` : '',
        deweyId: item.wikidataData.deweyId || '',
        latitude: item.geonamesData?.lat || '',
        longitude: item.geonamesData?.lng || '',
        country: item.geonamesData?.countryCode || '',
    };
    return data;
}
