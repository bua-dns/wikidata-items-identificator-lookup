<template>
    <label class="switch">
      <input type="checkbox" v-model="checked" @change="emitChange">
      <span class="slider round"></span>
    </label>
  </template>
  
  <script setup>
  import { ref, watchEffect } from 'vue';
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    }
  });
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'change']);
  
  // Local state that reflects the prop's value
  const checked = ref(props.modelValue);
  
  // Update the local state when the prop changes
  watchEffect(() => {
    checked.value = props.modelValue;
  });
  
  // Emit changes when the checkbox is toggled
  function emitChange() {
    emit('update:modelValue', checked.value);
    emit('change', checked.value);
  }
  </script>
  
  <style scoped lang="scss">
.switch {
  position: relative;
  display: inline-block;
  width: 2.375rem;   /* ≈38px (50 × 0.75 = 37.5px, rounded to 38px) */
  height: 1.125rem;  /* 18px */
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;            /* Smooth transition */
  border-radius: 1.125rem;    /* = height for full oval */
}

.slider:before {
  position: absolute;
  content: "";
  height: 0.875rem;  /* 14px */
  width: 0.875rem;   /* 14px */
  left: 0.125rem;    /* 2px */
  bottom: 0.125rem;  /* 2px */
  background-color: white;
  transition: .3s;   /* Smooth transition */
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  transform: translateX(1.25rem); /* 20px */
}

.round {
  border-radius: 1.125rem;  /* Full roundness to match the new height */
}
</style>
