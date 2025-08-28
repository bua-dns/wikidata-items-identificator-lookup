// /stores/useWikidataItemStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useGetWikidataItem } from '@/use/useGetWikidataItem.js'

export const useWikidataItemStore = defineStore('wikidataItem', () => {
  const item = ref(null)
  const error = ref(null)

  function clearItem() {
    item.value = null
    error.value = null
  }

  return {
    item,
    clearItem,
  }
})
