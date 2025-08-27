// src/stores/useWikidataSearchStore.js
import { defineStore } from 'pinia'

const API_BASE =
  'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*'

export const useWikidataSearchStore = defineStore('wikidataSearch', {
  state: () => ({
    suggestions: [],
    isLoading: false,
    error: null,
    lastQuery: '',
  }),
  actions: {
    async search(term, { language = 'en', limit = 10, type = 'item' } = {}) {
      this.error = null
      this.isLoading = true
      this.lastQuery = term

      if (!term || term.trim().length === 0) {
        this.suggestions = []
        this.isLoading = false
        return
      }

      const url = `${API_BASE}&search=${encodeURIComponent(term)}&language=${language}&uselang=${language}&limit=${limit}&type=${type}`

      try {
        const res = await fetch(url, { method: 'GET' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        // Normalize results
        this.suggestions = (json.search || []).map((r) => ({
          id: r.id,                 // e.g. Q42
          label: r.label || '',
          description: r.description || '',
          match: r.match || null,   // sometimes includes matched text
          url: r.concepturi || `https://www.wikidata.org/wiki/${r.id}`,
        }))
      } catch (e) {
        this.error = e.message || String(e)
        this.suggestions = []
      } finally {
        this.isLoading = false
      }
    },
    clear() {
      this.suggestions = []
      this.error = null
      this.lastQuery = ''
      this.isLoading = false
    },
  },
})
