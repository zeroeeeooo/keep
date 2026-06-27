<template>
  <span class="pushpin" :class="[colorClass]" :style="pinStyle">
    <svg :width="size" :height="size * 1.25" viewBox="0 0 16 20" fill="none">
      <ellipse cx="8" cy="5" rx="5" ry="4" :fill="pinColor" :stroke="pinStroke" stroke-width="0.5"/>
      <rect x="7.2" y="9" width="1.6" height="10" rx="0.8" :fill="pinStroke"/>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: { type: String, default: 'silver' },
  size: { type: Number, default: 16 },
  rotate: { type: String, default: '0deg' }
})

const colorClass = computed(() => `pin-${props.color}`)

const pinColor = computed(() => {
  const map = { silver: '#c0c0c0', gold: '#d4a017', red: '#e74c3c', blue: '#5b8def' }
  return map[props.color] || '#c0c0c0'
})

const pinStroke = computed(() => {
  const map = { silver: '#999', gold: '#b8890f', red: '#c0392b', blue: '#4a7de8' }
  return map[props.color] || '#999'
})

const pinStyle = computed(() => ({
  transform: `rotate(${props.rotate})`
}))
</script>

<style scoped>
.pushpin {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
  transition: transform 0.2s ease, filter 0.2s ease;
}
.pushpin:hover {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}
</style>
