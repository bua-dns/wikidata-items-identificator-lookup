<script setup>
import { ref, computed } from "vue"
import { storeToRefs } from 'pinia'
import SearchBoxStatic from './components/SearchBoxStatic.vue'
import WikidataAutosuggest from './components/WikidataAutosuggest.vue'
import { useTermsStore } from './stores/useTermsStore.js'
import { useWikidataItemStore } from './stores/useWikidataItemStore.js'
import { useIdentifiersStore } from './stores/useIdentifiersStore'


import IdGroup from "./components/IdGroup.vue"
import BooleanSwitch from "./components/BooleanSwitch.vue"
import CsvDownloader from "./components/CsvDownloader.vue"
import Header from "./components/Header.vue"

// DEV only:
const showRawData = ref(false)

// Wikidata Autosuggest
const term = ref('')
function onSelect(entity) {
  // entity: { id, label, description, url }
  console.log('Selected:', entity)
}

const sampleCsv = `geonamesId,locationDescription,lat,lng
123456,Sample Location,12.34567,34.56789
789012,Another Location,23.45678,45.67890`

const copyIdOnly = ref(false) // This is used to toggle between copying full URI or just ID

const termsStore = useTermsStore()
const wikidataStore = useWikidataItemStore()
const identifiersStore = useIdentifiersStore()

const { identifiers } = storeToRefs(identifiersStore)
const { item } = storeToRefs(wikidataStore)

const identifiersOfItem = computed(() => {
  return identifiers.value.filter(identifier => {
    return  identifier.use &&
            item.value && 
            item.value[identifier.handle] && 
            item.value[identifier.handle].value
  })
})

function addToItemsList(item) {
  termsStore.addToItemsList(item)
}
function removeFromList(item) {
  termsStore.removeFromList(item)
}
function toggleListItem(item) {
  if (termsStore.isInList(item)) {
    removeFromList(item)
  } else {
    addToItemsList(item)
  }
}

const selectedTerm = computed(() => termsStore.selectedTerm)

function getItemsDownloadList() {
  const mappedData = termsStore.itemsList.map(item => useMapForCsvDownload(item))
  return mappedData
}

function clearSelectedTerm() {
  termsStore.setSelectedTerm(null)
}

function clearListOfItems() {
  termsStore.clearItemsList()
}
</script>

<template>
  <Header />
  <div class="content-container">
    <aside>
      <WikidataAutosuggest
        v-model="term"
        language="de"
        :limit="12"
        @select="onSelect"
      />
      <SearchBoxStatic placeholder="Wikidata-Id (Q-Nummer)" submitButtonText="Identifikatoren anzeigen" />
    </aside>

    <main>
      <div class="controls" v-if="selectedTerm">
        <div class="boolean-switch-container">
          <BooleanSwitch v-model="copyIdOnly" value="" />
          <div class="option">Nur ID kopieren</div>
        </div>
      </div>
      <div class="feedback" v-if="item">
        Das Wikidata-Item <strong>{{ item.label_de.value }}</strong> mit der ID 
        <strong>{{ item.id }}</strong> wurde gefunden.
        <div v-if="identifiersOfItem.length === 0">Ihm ist keiner der ausgewählten Identifikatoren zugeordnet.
        </div>
      </div>
      <div class="selected-term" v-if="true">
        <div class="item-content" v-if="item && identifiersOfItem.length">
              <div class="data-box" v-for="identifier in identifiersOfItem">
                <pre v-if="false">{{ identifier }}</pre>
                <IdGroup v-if="item[identifier.handle]" 
                  :id="item[identifier.handle].value" 
                  :label="identifier.label"
                  :link="`${identifier.baseUrl}/${item[identifier.handle].value}`" 
                  :copyIdOnly />
              </div>
              
            </div>

          </div>
          <pre v-if="false">{{ item }}</pre>
          <pre v-if="false">{{ selectedTerm }}</pre>
          <pre v-if="false">{{ wikidataStore.item }}</pre>

      <div class="controls" v-if="false">
        <button v-if="termsStore.selectedTerm" @click="clearSelectedTerm" class="clear-button">
          <img src="./assets/icons/x-circle.svg" alt="Clear Selection" />
          Zurücksetzen
        </button>
      </div>
    </main>
  </div>
</template>

<style lang="scss">
@use './assets/styles/base.scss' as *;
@use './assets/styles/main.scss' as *;
@import 'leaflet/dist/leaflet.css';

main,
aside {
  min-height: calc(100vh - 8rem);
}

main,
aside,
header {
  background-color: hsla(0, 0%, 100%, .94);
  padding: 1.25rem;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.0rem;

  h1 {
    font-size: 1.75rem;
    margin-bottom: .5rem;

    @media screen and (max-width: 768px) {
      font-size: 1.125rem;
    }
  }

  .info {
    flex: 0 0 18rem;
    max-width: 18rem;
    margin-left: 1rem;

    @media screen and (max-width: 768px) {
      flex: 1;
      max-width: none;
    }
  }
}

.content-container {
  position: relative;
  display: flex;
  gap: 2rem;
  flex-direction: row;

  aside {
    flex: 0 0 32rem;
    overflow-y: auto;

    .info-box {
      margin-top: 1rem;
    }
  }

  main {
    flex: 1;

    .hint {
      font-size: .85rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }
  }
}

.controls {
  margin: 1rem 0;

  .boolean-switch-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.items {
  .item {
    margin-bottom: 1.5rem;

    .add-to-list {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem 0;

      img {
        width: 1.25rem;
        height: 1.25rem;
      }
    }

    .item-content {
      display: flex;
      justify-content: space-between; // Ensures left-right layout with spacing
      align-items: flex-start;
      gap: 1rem; // Optional: space between boxes

      .data-box {
        flex: 1; // takes remaining space
        padding: 0.75rem;
        background-color: #f8f9fa;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.875rem;
        word-break: break-word; // prevent overflow
      }

      .map-box {
        width: 36rem;
        height: 24remx;
        border-radius: 8px;
        overflow: hidden;

        // optional: box shadow for visual hierarchy
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
  }
}


.search {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: 20rem;

  .search-box {
    position: relative;
    z-index: 1000;

    input[type="text"] {
      width: 12rem;
      padding: 0.5rem;
      border: 1px solid #efefef;
      border-radius: 4px;
      font-size: 1rem;
    }

    .suggestions {
      position: absolute;
      top: 100%;
      margin-top: 1rem;
      padding: 0.51rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f9f9f9;
      width: 20rem;

      .suggestion {
        display: flex;
        align-items: center;
        padding: 0.25rem;
        border-bottom: 1px solid #efefef;

        &:last-child {
          border-bottom: none;
        }

        .suggestion-list-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;

          input[type="checkbox"] {
            cursor: pointer;
          }

          .label {
            font-size: 1rem;
            color: #333;
            transition: color 0.2s ease-in-out;

            &:hover {
              color: #007bff;
            }
          }
        }
      }
    }
  }
}

// responsive styles
@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
    gap: 1rem;

    main,
    aside {
      min-height: unset;
      width: 100%;
    }

    aside {
      flex: none;

      .info-box {
        display: none;
      }
    }

    .term-id {
      max-width: 100%;
    }
  }
}

//DEV only
.raw-data-toggle {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 0.5rem;
  width: 13rem;
  padding: 0.25 0.5rem;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 1.25rem;
  color: #888;

  &:hover {
    border-color: #333;
    color: #333;
  }
}

// itemslisting
.listing {
  margin-top: 1rem;
  .download-controls {


    .icon-button {
      width: 2.5rem;
      height: 2.5rem;
      background-color: transparent;
      border: none;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .items-list {
    margin-top: 1rem;
    padding: .5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    max-width: 100%;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .item {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.25rem 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    .item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .item-title {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow: hidden;

        .label {
          font-size: 1rem;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .description {
          font-size: 0.75rem;
          color: #777;
          margin-top: 0.2rem;
          line-height: 1.2;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }

      .icon-button {
        flex-shrink: 0; // prevent it from shrinking
        width: 2.5rem;
        height: 2.5rem;
      }
    }
  }
}
strong {
  color: #333;
}

.feedback {
  margin: 1rem 0;
  color: #555;
}
</style>
