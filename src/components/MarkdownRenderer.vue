<!-- components/MarkdownRenderer.vue -->
<template>
  <div v-html="compiledMarkdown" class="markdown-content"></div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // You can swap this for another style

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// Initialize markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch (_) {
        // fallback to plain highlighting
      }
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  }
})

const compiledMarkdown = computed(() => md.render(props.content))
</script>

<style lang="scss">
.markdown-content {
  line-height: 1.6;
  font-size: 1rem;
  margin-bottom: 2rem;

  p {
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  a {
    color: #007acc;
    text-decoration: underline;
  }

  ul {
    list-style: disc;
    padding-left: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;

    li {
      margin-bottom: 0.125rem;
    }
  }

  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
  }

  pre {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 6px;
    margin-bottom: 2rem;
  }

  pre code {
    display: block;
    background: none;
    color: inherit;
    padding: 0;
  }
}
</style>
