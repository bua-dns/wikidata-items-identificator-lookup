// src/stores/useWikidataSearchStore.js
import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useGetWikidataItem } from '@/use/useGetWikidataItem'
import { useIdentifiersStore } from '@/stores/useIdentifiersStore'
import { useWikidataItemStore } from '@/stores/useWikidataItemStore'
// If you want to mirror SearchBoxStatic’s side-effect, uncomment:
// import { useTermsStore } from '@/stores/useTermsStore'

const SEARCH_API =
  'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*'

function normalizeQid(str) {
  const t = String(str || '').trim()
  if (/^[Qq]\d+$/.test(t)) return 'Q' + t.slice(1)   // force uppercase Q
  if (/^\d+$/.test(t)) return 'Q' + t                // add Q if only digits
  return t
}

export const useWikidataSearchStore = defineStore('wikidataSearch', () => {
  // --- search state ---
  const suggestions = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const lastQuery = ref('')

  // --- selection state ---
  const selectedId = ref(null)
  const selectedItem = ref(null)
  const isLoadingItem = ref(false)
  const itemError = ref(null)

  // instantiate other stores *inside* the Pinia store
  const identifiersStore = useIdentifiersStore()
  const { identifiers } = storeToRefs(identifiersStore)
  const wikidataStore = useWikidataItemStore()
  // const termsStore = useTermsStore() // optional

  async function search(term, { language = 'en', limit = 10, type = 'item' } = {}) {
    error.value = null
    isLoading.value = true
    lastQuery.value = term

    if (!term || term.trim().length === 0) {
      suggestions.value = []
      isLoading.value = false
      return
    }

    const url =
      `${SEARCH_API}` +
      `&search=${encodeURIComponent(term)}` +
      `&language=${language}` +
      `&uselang=${language}` +
      `&limit=${limit}` +
      `&type=${type}`

    try {
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()

      suggestions.value = (json.search || []).map((r) => ({
        id: r.id,                 // Q42
        label: r.label || '',
        description: r.description || '',
        match: r.match || null,
        url: r.concepturi || `https://www.wikidata.org/wiki/${r.id}`,
      }))
    } catch (e) {
      error.value = e.message || String(e)
      suggestions.value = []
    } finally {
      isLoading.value = false
    }
  }

  // --- fetch full entity by Q-ID (mirrors SearchBoxStatic.vue logic) ---
  async function selectById(id) {
    const qid = normalizeQid(id)
    selectedId.value = qid
    selectedItem.value = null
    itemError.value = null
    isLoadingItem.value = true

    try {
      const vars = (identifiers.value || [])
        .filter(i => i.use)
        .map(i => `?${i.handle}`)
        .join(' ')

      const optionals = (identifiers.value || [])
        .filter(i => i.use)
        .map(i => `OPTIONAL { ?item wdt:${i.pid} ?${i.handle} }`)
        .join(' ')

      // If you want to also mirror the terms store side-effect:
      // termsStore.setSelectedTerm(qid)

      const item = await useGetWikidataItem(qid, vars, optionals)

      if (item) {
        // keep both: local selectedItem and your existing wikidataStore.item
        selectedItem.value = item
        wikidataStore.item = item
      } else {
        throw new Error(`No item found for Q-ID: ${qid}`)
      }
    } catch (e) {
      itemError.value = e.message || String(e)
      selectedItem.value = null
    } finally {
      isLoadingItem.value = false
    }
  }

  // convenience: select using a suggestion object
  async function selectBySuggestion(suggestion) {
    if (!suggestion || !suggestion.id) return
    await selectById(suggestion.id)
  }

  function clear() {
    // search state
    suggestions.value = []
    error.value = null
    lastQuery.value = ''
    isLoading.value = false
    // selection state
    selectedId.value = null
    selectedItem.value = null
    itemError.value = null
    isLoadingItem.value = false
  }

  return {
    // search state
    suggestions,
    isLoading,
    error,
    lastQuery,
    // selection state
    selectedId,
    selectedItem,
    isLoadingItem,
    itemError,
    // actions
    search,
    selectById,
    selectBySuggestion,
    clear,
  }
})
