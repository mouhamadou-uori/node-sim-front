<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ open: boolean }>()

// Nœuds textuels
const textBlocks = [
  { 
    type: 'source', 
    label: 'Source Modulée',
    inputPorts: 0,
    outputPorts: 1,
    category: 'text'
  },
  { 
    type: 'amplifier', 
    label: 'Amplificateur EDFA',
    inputPorts: 1,
    outputPorts: 1,
    category: 'text'
  },
  { 
    type: 'generator', 
    label: 'Générateur de signal',
    inputPorts: 0,
    outputPorts: 1,
    category: 'text'
  },
  { 
    type: 'fiber', 
    label: 'Fibre Optique',
    inputPorts: 1,
    outputPorts: 1,
    category: 'text'
  }
]

// Nœuds basés sur des images
const imageBlocks = [
  {
    type: 'power_meter',
    label: 'Mesureur de Puissance',
    image: 'Mesureur_Puissance.jpg',
    inputPorts: 1,
    outputPorts: 0,
    category: 'image'
  },
  {
    type: 'spectrum_analyzer',
    label: 'Analyseur de Spectre',
    image: 'Analyseur_Spectre.jpg',
    inputPorts: 1,
    outputPorts: 0,
    category: 'image'
  },
  {
    type: 'optical_detector',
    label: 'Détecteur Optique',
    image: 'detecteur_optique.jpg',
    inputPorts: 1,
    outputPorts: 0,
    category: 'image'
  },
  {
    type: 'laser_generator',
    label: 'Générateur Laser',
    image: 'generateur_laser.jpg',
    inputPorts: 0,
    outputPorts: 1,
    category: 'image'
  }
]

// Tous les blocs combinés
const blocks = [...textBlocks, ...imageBlocks]

function onDragStart(event: DragEvent, block: any) {
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" fill="#2563eb"/><rect x="7" y="7" width="10" height="10" rx="2" fill="#fff"/></svg>
        </span>
        <h2 class="text-xl font-extrabold text-gray-800 tracking-tight">Composants</h2>
      </div>
      <slot name="toggle"></slot>
    </header>
    <div class="border-b border-gray-200 mb-4"></div>
    
    <!-- Section des composants textuels -->
    <h3 class="text-sm font-semibold text-gray-600 mb-3 pl-2">Composants standards</h3>
    <div class="flex-1 space-y-4 mb-6">
      <transition-group name="card-fade" tag="div" class="flex flex-col gap-4">
        <div
          v-for="block in textBlocks"
          :key="block.type"
          class="block-card flex items-center space-x-3 p-4 rounded-xl shadow-md bg-white cursor-move transition-all duration-300 border-2 border-transparent hover:shadow-xl hover:-translate-y-1 group"
          :class="{
            'hover:border-blue-400': block.type === 'source',
            'hover:border-green-400': block.type === 'amplifier',
            'hover:border-purple-400': block.type === 'generator'
          }"
          draggable="true"
          @dragstart="onDragStart($event, block)"
        >
          <span v-if="block.type === 'source'" class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 24 24"><path d="M2 12 Q6 2 12 12 T22 12" stroke="#2563eb" stroke-width="2" fill="none"/></svg>
          </span>
          <span v-else-if="block.type === 'amplifier'" class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 18 L8 18 L12 6 L16 18 L20 18" stroke="#16a34a" stroke-width="2" fill="none"/></svg>
          </span>
          <span v-else-if="block.type === 'generator'" class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shadow">
            <svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 12 L8 8 L12 12 L16 16 L20 12" stroke="#9333ea" stroke-width="2" fill="none"/></svg>
          </span>
          <span class="font-semibold text-gray-800 text-sm">{{ block.label }}</span>
        </div>
      </transition-group>
    </div>
    
    <!-- Section des composants avec images -->
    <h3 class="text-sm font-semibold text-gray-600 mb-3 pl-2">Instruments</h3>
    <div class="flex-1 space-y-4">
      <transition-group name="card-fade" tag="div" class="flex flex-col gap-4">
        <div
          v-for="block in imageBlocks"
          :key="block.type"
          class="block-card p-3 rounded-xl shadow-md bg-white cursor-move transition-all duration-300 border-2 border-transparent hover:shadow-xl hover:-translate-y-1"
          draggable="true"
          @dragstart="onDragStart($event, block)"
        >
          <div class="flex flex-col items-center">
            <div class="instrument-image-container">
              <img :src="`/src/assets/${block.image}`" :alt="block.label" class="instrument-image" />
            </div>
            <span class="font-semibold text-gray-800 text-sm text-center mt-2">{{ block.label }}</span>
          </div>
        </div>
      </transition-group>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  min-width: 18rem;
  max-width: 20rem;
  overflow-y: auto;
  overflow-x: hidden;
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

/* Styles pour les cartes d'instruments avec images */
.block-card .w-full.h-24 {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-card img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.instrument-image-container {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f8fafc;
  padding: 4px;
}

.instrument-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
