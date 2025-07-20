<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ open: boolean }>()

const blocks = [
  { type: 'source', label: 'Source de données' },
  { type: 'modulator', label: 'Modulateur' },
  { type: 'fiber', label: 'Fibre optique' }
]

function onDragStart(event: DragEvent, block: { type: string, label: string }) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(block))
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<template>
  <aside
    class="sidebar improved-sidebar bg-gradient-to-b from-white to-gray-100 rounded-r-2xl shadow-2xl p-6 w-72 h-full flex flex-col transition-transform duration-400 z-20 mx-2 my-3 border border-gray-200 hover:shadow-3xl group relative"
    :class="{ 'sidebar-hidden': !open }"
  >
    <header class="flex items-center justify-between mb-4 relative">
      <div class="flex items-center gap-2">
        <span class="text-blue-500 text-2xl">
          <!-- Icône cube -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill="#2563eb"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#fff"/></svg>
        </span>
        <h2 class="text-xl font-extrabold text-gray-800 tracking-tight">Palette de blocs</h2>
      </div>
      <slot name="toggle"></slot>
    </header>
    <div class="border-b border-gray-200 mb-4"></div>
    <div class="flex-1 space-y-6">
      <transition-group name="card-fade" tag="div" class="flex flex-col gap-6">
        <div
          v-for="block in blocks"
          :key="block.type"
          class="block-card flex items-center space-x-3 p-4 rounded-2xl shadow-md bg-white cursor-move transition-all duration-300 border-2 border-transparent hover:shadow-xl hover:-translate-y-1 group"
          :class="{
            'hover:border-blue-400': block.type === 'source',
            'hover:border-orange-400': block.type === 'modulator',
            'hover:border-yellow-400': block.type === 'fiber'
          }"
          draggable="true"
          @dragstart="onDragStart($event, block)"
        >
          <span v-if="block.type === 'source'" class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#2563eb" /></svg>
          </span>
          <span v-else-if="block.type === 'modulator'" class="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 20 20"><rect x="4" y="8" width="12" height="4" fill="#f59e42" /></svg>
          </span>
          <span v-else-if="block.type === 'fiber'" class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 20 20"><line x1="2" y1="10" x2="18" y2="10" stroke="#eab308" stroke-width="3" /><circle cx="2" cy="10" r="2" fill="#2563eb" /><circle cx="18" cy="10" r="2" fill="#2563eb" /></svg>
          </span>
          <span class="font-semibold text-gray-800 text-lg">{{ block.label }}</span>
        </div>
      </transition-group>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  min-width: 18rem;
  max-width: 20rem;
}
.sidebar-hidden {
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(.4,0,.2,1);
}
.improved-sidebar {
  box-shadow: 0 8px 32px 0 rgba(31, 41, 55, 0.18), 0 1.5px 4px 0 rgba(31, 41, 55, 0.10);
  transition: box-shadow 0.3s, transform 0.4s cubic-bezier(.4,0,.2,1);
}
.improved-sidebar:hover {
  box-shadow: 0 12px 40px 0 rgba(31, 41, 55, 0.22), 0 2px 8px 0 rgba(31, 41, 55, 0.13);
}
.card-fade-enter-active, .card-fade-leave-active {
  transition: all 0.4s cubic-bezier(.4,0,.2,1);
}
.card-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.card-fade-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.block-card {
  box-shadow: 0 2px 8px 0 rgba(31, 41, 55, 0.10);
}
.block-card:hover {
  box-shadow: 0 8px 24px 0 rgba(31, 41, 55, 0.18);
}
</style>
