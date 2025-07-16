<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref, computed } from 'vue'
import SidebarPalette from '@/components/SidebarPalette.vue'
import FlowWorkspace from './components/FlowWorkspace.vue'

const sidebarOpen = ref(true)
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }

function onDrop(event: DragEvent) {
  event.preventDefault()
}

const sidebarWidth = 304
const mainStyle = computed(() => ({
  width: sidebarOpen.value ? `calc(100vw - ${sidebarWidth}px)` : '100vw',
  transition: 'width 0.4s cubic-bezier(.4,0,.2,1)'
}))
</script>

<template>
  <div class="flex h-screen w-full bg-gray-100 relative">
    <SidebarPalette :open="sidebarOpen" class="transition-transform duration-400">
      <template #toggle>
        <button
          v-if="sidebarOpen"
          @click="toggleSidebar"
          class="absolute z-30 top-4 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-xl border border-gray-200 hover:bg-blue-50 transition-all duration-300"
          aria-label="Fermer la sidebar"
        >
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 12L6 6"/></svg>
        </button>
      </template>
    </SidebarPalette>
    <div :style="mainStyle" class="flex-1 relative transition-all duration-400">
      <button
        v-if="!sidebarOpen"
        @click="toggleSidebar"
        class="sidebar-toggle-btn fixed z-30 top-6 left-2 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 hover:bg-blue-50 transition-all duration-300 group"
        aria-label="Ouvrir la sidebar"
      >
        <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 12L18 18"/></svg>
      </button>
      <div
        class="h-full w-full"
        @dragover.prevent
        @drop="onDrop"
      >
        <FlowWorkspace :sidebar-open="sidebarOpen" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-toggle-btn {
  box-shadow: 0 4px 24px 0 rgba(31, 41, 55, 0.18);
  transition: left 0.4s cubic-bezier(.4,0,.2,1), background 0.2s;
}
</style>
