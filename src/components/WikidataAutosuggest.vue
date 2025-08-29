<!-- src/components/WikidataAutosuggest.vue -->
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useWikidataSearchStore } from '@/stores/useWikidataSearchStore'
import { useWikidataItemStore } from '@/stores/useWikidataItemStore'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search Wikidata (label, Q-ID, …)' },
  language: { type: String, default: 'en' },
  limit: { type: Number, default: 10 },
  type: { type: String, default: 'item' }, // item, property, lexeme
  minChars: { type: Number, default: 2 },
  debounceMs: { type: Number, default: 250 },
  showDescriptions: { type: Boolean, default: true },
})

const emit = defineEmits([
  'update:modelValue',
  'select',          // payload: { id, label, description, url }
  'enter',           // when user presses Enter with free text
  'clear'
])

const store = useWikidataSearchStore()
const itemStore = useWikidataItemStore()

// local input state mirrors v-model
const input = ref(props.modelValue)
watch(() => props.modelValue, (v) => { if (v !== input.value) input.value = v })

function updateModel(v) {
  emit('update:modelValue', v)
}

// --- normalization helper: add "Q" if value is digits-only; normalize "q123" -> "Q123"
// Only trim when digits-only or Q-id, leave text inputs as-is
function normalizeQidOnDigits(value) {
  const str = String(value ?? '')
  if (/^\d+$/.test(str.trim())) {
    return 'Q' + str.trim()
  }
  if (/^\s*[qQ]\d+\s*$/.test(str)) {
    return 'Q' + str.trim().slice(1)
  }
  return str
}

let debounceTimer = null
let blurTimer = null
const isOpen = ref(false)
const activeIndex = ref(-1) // highlighted suggestion

const suggestions = computed(() => store.suggestions || [])
const isLoading = computed(() => store.isLoading)
const hasSuggestions = computed(() => suggestions.value.length > 0)

function open() {
  if (!isOpen.value) isOpen.value = true
}
function close() {
  isOpen.value = false
  activeIndex.value = -1
}

function debouncedSearch(term) {
  clearTimeout(debounceTimer)
  if (term.trim().length < props.minChars) {
    store.clear()
    return
  }
  debounceTimer = setTimeout(() => {
    store.search(term, { language: props.language, limit: props.limit, type: props.type })
  }, props.debounceMs)
}

function onInput(e) {
  const raw = e.target.value
  const val = normalizeQidOnDigits(raw)
  input.value = val
  updateModel(val)
  open()
  debouncedSearch(val)
}

function onFocus() {
  open()
  if (input.value.trim().length >= props.minChars && !hasSuggestions.value) {
    debouncedSearch(input.value)
  }
}

async function selectSuggestion(item) {
  input.value = `${item.label} (${item.id})` || item.id
  updateModel(input.value)
  emit('select', item)
  close()
  await store.selectBySuggestion(item, { language: 'en' })
}

function onKeydown(e) {
  if (!isOpen.value && ['ArrowDown','ArrowUp'].includes(e.key)) {
    open()
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!hasSuggestions.value) return
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
    scrollActiveIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!hasSuggestions.value) return
    activeIndex.value = (activeIndex.value - 1 + suggestions.value.length) % suggestions.value.length
    scrollActiveIntoView()
  } else if (e.key === 'Enter') {
    if (isOpen.value && activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
      e.preventDefault()
      selectSuggestion(suggestions.value[activeIndex.value])
    } else {
      emit('enter', input.value)
      close()
    }
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

const listRef = ref(null)
function scrollActiveIntoView() {
  const list = listRef.value
  if (!list) return
  const items = list.querySelectorAll('[role="option"]')
  if (!items.length) return
  const el = items[activeIndex.value]
  if (el) el.scrollIntoView({ block: 'nearest' })
}

function onBlur() {
  // small delay so click can register
  clearTimeout(blurTimer)
  blurTimer = setTimeout(() => close(), 120)
}

function clearInput() {
  input.value = ''
  updateModel('')
  store.clear()
  emit('clear')
  open()
  itemStore.clearItem()
}

onMounted(() => {
  document.addEventListener('scroll', close, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('scroll', close, true)
  clearTimeout(debounceTimer)
  clearTimeout(blurTimer)
})
</script>

<template>
  <div class="wd-autosuggest" @keydown="onKeydown" @focusout="onBlur">
    <div class="field">
      <input
        :placeholder="placeholder"
        :value="input"
        @input="onInput"
        @focus="onFocus"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isOpen"
        :aria-controls="'wd-suggest-list'"
        :aria-activedescendant="activeIndex >= 0 ? `wd-opt-${activeIndex}` : undefined"
      />
      <button v-if="input" class="clear-btn" type="button" @click="clearInput" aria-label="Clear">×</button>
      <div v-if="isLoading" class="spinner" aria-hidden="true"></div>
    </div>

    <ul
      v-show="isOpen && (hasSuggestions || isLoading)"
      class="suggestions"
      :id="'wd-suggest-list'"
      role="listbox"
      ref="listRef"
    >
      <li v-if="!isLoading && !hasSuggestions" class="empty">No results</li>

      <li
        v-for="(item, i) in suggestions"
        :key="item.id + i"
        role="option"
        :id="`wd-opt-${i}`"
        :aria-selected="i === activeIndex"
        class="option"
        :class="{ active: i === activeIndex }"
        @mousedown.prevent="selectSuggestion(item)"
        @mousemove="activeIndex = i"
      >
        <div class="label-line">
          <span class="label">{{ item.label || item.id }}</span>
          <span class="qid">{{ item.id }}</span>
        </div>
        <div v-if="showDescriptions && item.description" class="desc">{{ item.description }}</div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.wd-autosuggest {
  position: relative;
  max-width: 640px;

  .field {
    position: relative;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.65rem 2.5rem 0.65rem 0.75rem;
    border: 1px solid #d0d5dd;
    border-radius: 10px;
    outline: none;
    font-size: 1rem;
    transition: border-color 120ms ease;

    &:focus {
      border-color: #8a9;
      box-shadow: 0 0 0 3px rgba(30, 160, 120, 0.12);
    }
  }

  .clear-btn {
    position: absolute;
    right: 0.5rem;
    top: 0.4rem;
    height: 2rem;
    width: 2rem;
    border: none;
    background: transparent;
    font-size: 1.25rem;
    cursor: pointer;
    line-height: 1;
    opacity: 0.6;

    &:hover { opacity: 1; }
  }

  .spinner {
    position: absolute;
    right: 2.4rem;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border: 2px solid #ccd;
    border-top-color: #556;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

  .suggestions {
    margin: 0.25rem 0 0 0;
    padding: 0.25rem 0;
    position: absolute;
    z-index: 20;
    width: 100%;
    max-height: 300px;
    overflow: auto;
    list-style: none;
    background: #fff;
    border: 1px solid #e4e7ec;
    border-radius: 10px;
    box-shadow:
      0 10px 15px -3px rgba(0,0,0,.1),
      0 4px 6px -2px rgba(0,0,0,.05);

    .empty {
      padding: 0.75rem;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .option {
      padding: 0.5rem 0.75rem;
      cursor: pointer;

      &.active {
        background: #f3f4f6;
      }

      .label-line {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;

        .label {
          font-weight: 600;
        }
        .qid {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.85rem;
          color: #6b7280;
        }
      }

      .desc {
        font-size: 0.9rem;
        color: #4b5563;
        margin-top: 0.15rem;
      }
    }
  }
}
</style>
