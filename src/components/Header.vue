<!-- File: src/components/Header.vue -->
<script setup>
import { ref } from 'vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import markdownRaw from '../content/tool-info.md?raw'


const isExpanded = ref(false)
const toggleContent = () => {
  isExpanded.value = !isExpanded.value
}
const toolInfo = markdownRaw
</script>

<template>
  <header class="app-header">
    <div class="header-main" @click="toggleContent">
      <h1>Referenzdaten-Lookup: Referenzdaten-IDs (Identifikatoren) zu Wikidata-Items</h1>
      <nav>
        <ul>
          <li>über dieses Tool</li>
        </ul>
      </nav>
    </div>

    <!-- Always rendered here for demo; replace `true || isExpanded` with just `isExpanded` when you wire up the toggle -->
    <div class="info-box-content" v-if="isExpanded">
      <MarkdownRenderer :content="toolInfo" />
    </div>
    <div v-if="isExpanded" class="collapse-icon" @click="toggleContent">
      <img src="@/assets/icons/chevron-up_white.svg" alt="Collapse Info" />
    </div>
  </header>
</template>

<style scoped lang="scss">
p {
  margin: 0;
}
.app-header {
  display: flex;
  flex-direction: column;

  background-color: hsl(265, 45%, 18%);
  color: white;
  padding: 1rem 2rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  nav {
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      gap: 1rem; 
    }
    li {
      cursor: pointer; /* Indicate clickable items */
    }
  }
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.info-box-content {
  margin-top: 1rem;
  background-color: hsl(210, 31%, 32%);
  padding: 0.75rem 0 0 .75rem;
  font-size: 0.875rem;
  a {
    color: #b2d3e9;
    text-decoration: none;
  }
}
.collapse-icon {
  cursor: pointer;
  img {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    margin: 0.5rem auto;
  }

}
</style>
