// /stores/useIdentifiersStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIdentifiersStore = defineStore('identifiers', () => {
  const identifiers = ref([
    { label: 'VIAF-Clusterkennung', pid: 'P214', handle: 'viaf', baseUrl: 'https://viaf.org/viaf', use: true },
    { label: 'GND-Kennung', pid: 'P227', handle: 'gnd', baseUrl: 'https://d-nb.info/gnd', use: true },
    { label: 'GeoNames ID', pid: 'P1566', handle: 'geonames', baseUrl: 'https://www.geonames.org', use: true },
    { label: 'Art & Architecture Thesaurus', pid: 'P1014', handle: 'aat', baseUrl: 'http://vocab.getty.edu/page/aat', use: true },
    // Add more identifiers as needed
  ])

  const test = 'test'

  return {
    test,
    identifiers,
  }
})
