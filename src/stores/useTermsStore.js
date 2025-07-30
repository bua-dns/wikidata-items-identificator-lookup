import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTermsStore = defineStore('terms', () => {
  const terms = ref([])
  const selectedTerm = ref(null)

  async function setSelectedTerm(newTerm) {
    if (!newTerm) {
      selectedTerm.value = null
      return
    }
    selectedTerm.value = newTerm
  }

  const itemsList = ref([])

  function isInList(item) {
    return itemsList.value.includes(item)
  }

  function addToItemsList(item) {
    if (!itemsList.value.includes(item)) {
      itemsList.value.push(item)
    }
  }

  function removeFromList(item) {
    const index = itemsList.value.indexOf(item)
    if (index !== -1) {
      itemsList.value.splice(index, 1)
    }
  }

  function clearItemsList() {
    itemsList.value = []
  }

  // // Use infoLabel as the unique identifier
  // const visitedTermsMap = ref(new Map())

  // function addVisitedTerm(term) {
  //   const key = term?.infoLabel
  //   if (typeof key !== 'string' || !key.length) return
  //   visitedTermsMap.value.set(key, term)
  // }

  // function getVisitedTerms() {
  //   return Array.from(visitedTermsMap.value.values())
  // }

  return {
    terms,
    selectedTerm,
    setSelectedTerm,
    itemsList,
    isInList,
    addToItemsList,
    removeFromList,
    clearItemsList,
    // visitedTermsMap,
    // addVisitedTerm,
    // getVisitedTerms,
  }
})
