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
console.log('Identifiers in searchBox:', JSON.stringify(identifiers.value, null, 2))

const vars = identifiers.value
    .filter(identifier => identifier.use)
    .map(identifier => identifier.handle)
    .map(v => `?${v}`)
    .join(' ');

let optionals = identifiers.value.map(i => {
        if (!i.use) return null;
        return `OPTIONAL { ?item wdt:${i.pid} ?${i.handle} }`
    })
    .filter(Boolean)
    .join(' ');

const termsStore = useTermsStore()

const isValidQid = computed(() => /^Q\d+$/.test(input.value.trim()))

async function handleSubmit() {
    if (!isValidQid.value) {
        console.error('Invalid Q-ID:', input.value)
        return
    }
    termsStore.setSelectedTerm(input.value.trim())

    await useGetWikidataItem(input.value.trim(), vars, optionals)
    const item = await useGetWikidataItem(input.value.trim(), vars, optionals)
    if (item) {
        wikidataStore.item = item
    } else {
        console.error('No item found for Q-ID:', input.value)
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
                <input v-model="input" type="text" :placeholder="placeholder" class="search-input" />
                <button type="submit" class="submit-button" :disabled="!isValidQid">
                    {{ submitButtonText }}
                </button>
            </form>
        </div>
        <h2>Identifikatoren</h2>
        <div class="identifiers-row">
            <label v-for="identifier in identifiersStore.identifiers" :key="identifier.pId" class="checkbox-label">
                <input type="checkbox" :checked="identifier.use" @change="toggleIdentifier(identifier)" />
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
        // Optional debug border
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
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: flex-start;

        .checkbox-label {
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
