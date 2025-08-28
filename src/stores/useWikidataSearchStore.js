// src/stores/useWikidataSearchStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

const API_BASE =
  'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*'

export const useWikidataSearchStore = defineStore('wikidataSearch', () => {
  const suggestions = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastQuery = ref('')
  const selectedId = ref(null)

  async function search(term, { language = 'en', limit = 10, type = 'item' } = {}) {
    error.value = null
    isLoading.value = true
    lastQuery.value = term

    if (!term || term.trim().length === 0) {
      suggestions.value = []
      isLoading.value = false
      return
    }

    const url = `${API_BASE}&search=${encodeURIComponent(term)}&language=${language}&uselang=${language}&limit=${limit}&type=${type}`

    try {
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      // Normalize results
      suggestions.value = (json.search || []).map((r) => ({
        id: r.id,                 // e.g. Q42
        label: r.label || '',
        description: r.description || '',
        match: r.match || null,   // sometimes includes matched text
        url: r.concepturi || `https://www.wikidata.org/wiki/${r.id}`,
      }))
    } catch (e) {
      error.value = e.message || String(e)
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    suggestions.value = []
    error.value = null
    lastQuery.value = ''
    isLoading.value = false
  }

  return {
    // state
    suggestions,
    isLoading,
    error,
    lastQuery,
    selectedId,
    // actions
    search,
    clear,
  }
})
