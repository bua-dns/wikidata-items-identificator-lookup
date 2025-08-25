# Reference Data Lookup Tool

This application allows you to search for **Wikidata IDs** and display their corresponding authority record references.  

The workflow consists of two main steps:

1. **Search input (SearchBox):** Queries the [Wikidata API](https://www.wikidata.org/w/api.php) for items based on a Wikidata ID and extracts their identifiers.  
2. **Display (AppView):** Shows the retrieved reference data, with the option to copy either the full URI of the reference entry or just the identifier itself.  

It is a **live-based solution**: no static dataset is used. All information is loaded in real time from Wikidata.

---

## Features
- Search by Wikidata Q-ID  
- Extraction of identifiers linked to the Wikidata item  
- Copy full URI or plain identifier  
- Simple and lightweight UI with expandable tool info  

---

## Demo

You can try the tool directly via GitHub Pages here:  
👉 [Live Demo](https://bua-dns.github.io/wikidata-items-identificator-lookup/)

---

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/reference-data-lookup.git
cd reference-data-lookup
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Author

Michael Müller, Digitales Netzwerk Sammlungen

---

## License

This project is licensed under the [MIT License](LICENSE).
