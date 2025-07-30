// /stores/useIdentifiersStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIdentifiersStore = defineStore('identifiers', () => {
  const identifiers = ref([
    { label: 'VIAF-Clusterkennung', pid: 'P214', handle: 'viaf', use: true },
    { label: 'GND-Kennung', pid: 'P227', handle: 'gnd', use: true },
    { label: 'GeoNames ID', pid: 'P1566', handle: 'geonames', use: true },
    { label: 'Art & Architecture Thesaurus', pid: 'P1014', handle: 'aat', use: true },

    // Add more identifiers as needed
  ])

  const test = 'test'

  return {
    test,
    identifiers,
  }
})
