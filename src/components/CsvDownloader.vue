<script setup>
import { ref } from 'vue'
const props = defineProps({
  itemsList: {
    type: Object,
    required: true,
  },
  filename: {
    type: String,
    default: 'reference-data.csv',
  }
})

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(field => {
        const val = row[field] ?? ''
        const escaped = String(val).replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    )
  ]
  return csvRows.join('\r\n')
}

const csvString = convertToCSV(props.itemsList)

function downloadCSV() {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = props.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // optional: revoke object URL to free memory
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="download-list">
    <button @click="downloadCSV()" class="text-icon-button" title="download List as CSV">
      <div class="icon">
        <img src="../assets/icons/download.svg" alt="download list as CSV" />
      </div>
      
      <span>Liste herunterladen</span>
    </button>

  </div>
</template>

<style lang="scss">
.download-list {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 0.5rem;


}

</style>
