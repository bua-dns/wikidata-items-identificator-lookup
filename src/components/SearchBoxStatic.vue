<script setup>
import { ref, computed } from 'vue'
import { useWikidataItemStore } from '@/stores/useWikidataItemStore'
import { useGetWikidataItem } from '@/use/useGetWikidataItem'
import { useTermsStore } from '@/stores/useTermsStore'
import { useIdentifiersStore } from '@/stores/useIdentifiersStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Enter Wikidata Q-ID',
  },
  submitButtonText: {
    type: String,
    default: 'Look up',
  },
})

const input = ref('')
const wikidataStore = useWikidataItemStore()
const identifiersStore = useIdentifiersStore()
const { identifiers } = storeToRefs(identifiersStore)
const termsStore = useTermsStore()

/** Ensure the value looks like `Q123` if it’s numeric or q-prefixed */
function normalizeQid(str) {
  const t = String(str || '').trim()
  if (/^[Qq]\d+$/.test(t)) return 'Q' + t.slice(1)          // force uppercase Q
  if (/^\d+$/.test(t)) return 'Q' + t                        // add Q if only digits
  return t
}

const normalizedInput = computed(() => normalizeQid(input.value))
const isValidQid = computed(() => /^Q\d+$/.test(normalizedInput.value))

async function handleSubmit() {
  const qid = normalizedInput.value

  if (!/^Q\d+$/.test(qid)) {
    console.error('Invalid Q-ID:', input.value)
    return
  }

  // reflect normalization back into the input field
  input.value = qid

  // build SPARQL var list and OPTIONALS from enabled identifiers
  const vars = identifiers.value
    .filter(i => i.use)
    .map(i => `?${i.handle}`)
    .join(' ')

  const optionals = identifiers.value
    .filter(i => i.use)
    .map(i => `OPTIONAL { ?item wdt:${i.pid} ?${i.handle} }`)
    .join(' ')

  termsStore.setSelectedTerm(qid)

  const item = await useGetWikidataItem(qid, vars, optionals)
  if (item) {
    wikidataStore.item = item
  } else {
    console.error('No item found for Q-ID:', qid)
  }
}

function toggleIdentifier(identifier) {
  identifier.use = !identifier.use
}
</script>

<template>
  <div class="search-box">
    <div class="search">
      <form @submit.prevent="handleSubmit">
        <input
          v-model="input"
          type="text"
          :placeholder="placeholder"
          class="search-input"
          autocomplete="off"
          spellcheck="false"
          inputmode="text"
          @keydown.enter.prevent="handleSubmit"
          :aria-invalid="!isValidQid"
          aria-label="Wikidata Q-ID"
        />
        <button type="submit" class="submit-button" :disabled="!isValidQid">
          {{ submitButtonText }}
        </button>
      </form>
    </div>

    <h2>Identifikatoren</h2>
    <div class="identifiers-row">
      <label
        v-for="identifier in identifiers"
        :key="identifier.pid"
        class="checkbox-label"
      >
        <input
          type="checkbox"
          :checked="identifier.use"
          @change="toggleIdentifier(identifier)"
        />
        {{ identifier.label }}
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 👇 KEEPING YOUR MODIFIED STYLING */

.search-box {
  width: 100%;

  .search {
    width: 100%;

    form {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%; // ensures full width
    }

    .search-input {
      flex: 1; // makes input grow to fill space
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    .submit-button {
      flex-shrink: 0; // prevents button from shrinking
      padding: 0.5rem 1.2rem;
      font-size: 1rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover:enabled {
        background-color: #2563eb;
      }

      &:disabled {
        background-color: #cbd5e1; // Tailwind gray-300
        cursor: not-allowed;
      }

      &:focus:enabled {
        outline: 2px solid #93c5fd;
        outline-offset: 2px;
      }
    }
  }

  .identifiers-row {
    margin-top: 1rem;

    .checkbox-label {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.95rem;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
