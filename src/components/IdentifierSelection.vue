<script setup>
import { ref, computed } from 'vue'
import { useIdentifiersStore } from '@/stores/useIdentifiersStore'
import { storeToRefs } from 'pinia'

const identifiersStore = useIdentifiersStore()
const { identifiers } = storeToRefs(identifiersStore)

function toggleIdentifier(identifier) {
  identifier.use = !identifier.use
}
</script>

<template>
  <div class="search-box">

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
