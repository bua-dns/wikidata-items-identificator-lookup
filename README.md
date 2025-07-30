# GeoNames Lookup Tool

This web-based tool allows users to search for **place names** using a type-ahead input box that dynamically queries the **Wikidata Search API**. Upon selecting a place, the tool enriches the result using a SPARQL query to retrieve related metadata — specifically the **GeoNames ID** (P1566) — and presents it for further use, including clipboard copying.

> Developed as part of the **Data Management Lab** of the  
> [Digitales Netzwerk Sammlungen](https://berlin-university-collections.de/)

💻 A demo version is available at:  
> [https://bua-dns.github.io/geonames-lookup-tool/](https://bua-dns.github.io/geographical-terms-lookup-tool/)

---

## ✨ Features

- 🔍 **Live search with autosuggestions** via the Wikidata Search API
- 🌐 **GeoNames ID lookup** using SPARQL enrichment for selected results
- 📋 **One-click copy buttons** for GeoNames IDs
- 💬 **Integrated markdown help and usage hints**
- ⚡ Built with modern frontend tools for fast performance

---

## 📦 Installation

```bash
pnpm install
pnpm run dev
```

---

## 📁 Project Structure

- `App.vue`: Root component managing layout and display logic
- `components/SearchBox.vue`: Input with live suggestions
- `stores/useTermsStore.js`: Shared store for selected term
- `use/useCallWikidataSearchApi.js`: Handles search and enrichment
- `content/tool-info.md`: User instructions (rendered in sidebar)

---

## 📄 Data Source and Enrichment

The tool uses **live queries to Wikidata**, not a prebuilt dataset.

### APIs used:
- **Wikidata Search API** (`action=wbsearchentities`)
- **Wikidata SPARQL endpoint** for enrichment (`wdt:P1566` for GeoNames ID)

---

## 📋 Example Use

1. Start typing a place name (e.g., `Berlin`, `Prague`, `Mailand`)
2. Select a matching suggestion from the list
3. View the enriched metadata such as GeoNames ID
4. Use the copy button to store the ID for further reference

---

## 🛠 Technologies Used

- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Wikidata APIs](https://www.wikidata.org/wiki/Wikidata:Data_access)
- [Markdown-it](https://github.com/markdown-it/markdown-it)
- [highlight.js](https://highlightjs.org/)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
