<template>
  <div
    :class="[
      'px-3 py-2 shadow-lg rounded-lg border-2 cursor-move select-none',
      'bg-white border-gray-200 hover:border-blue-300 transition-colors',
      'min-w-[120px] text-center',
      'relative'
    ]"
    :style="{
      width: `${width}px`,
      height: `${height}px`
    }"
  >
    <div class="flex items-center justify-center space-x-2">
      <!-- Icône selon le type de nœud -->
      <span v-if="props.data.nodeType === 'source'">
        <!-- Source de données : onde -->
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 12 Q6 2 12 12 T22 12" stroke="#2563eb" stroke-width="2" fill="none"/></svg>
      </span>
      <span v-else-if="props.data.nodeType === 'modulator' || props.data.nodeType === 'filter'">
        <!-- Modulateur : sinus -->
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 12 Q6 2 12 12 T22 12" stroke="#eab308" stroke-width="2" fill="none"/></svg>
      </span>
      <span v-else-if="props.data.nodeType === 'fiber'">
        <!-- Fibre optique : trait jaune avec bouts bleus -->
        <svg width="32" height="12" viewBox="0 0 32 12"><line x1="4" y1="6" x2="28" y2="6" stroke="#facc15" stroke-width="4"/><circle cx="4" cy="6" r="4" fill="#2563eb"/><circle cx="28" cy="6" r="4" fill="#2563eb"/></svg>
      </span>
      <span v-else>
        <!-- Nœud par défaut -->
        <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#a3a3a3"/></svg>
      </span>
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
    </div>

    <!-- Ports d'entrée -->
    <div class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
      <div
        v-for="(port, index) in inputPorts"
        :key="`input-${index}`"
        class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm cursor-crosshair"
        :style="{ top: `${(index + 1) * 20}px` }"
        @mousedown="onConnectStart($event, 'input', index)"
      ></div>
    </div>

    <!-- Ports de sortie -->
    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
      <div
        v-for="(port, index) in outputPorts"
        :key="`output-${index}`"
        class="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm cursor-crosshair"
        :style="{ top: `${(index + 1) * 20}px` }"
        @mousedown="onConnectStart($event, 'output', index)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    label: string
    nodeType: string
    inputPorts?: number
    outputPorts?: number
  }
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 120,
  height: 60,
  data: () => ({
    label: 'Node',
    nodeType: 'default',
    inputPorts: 1,
    outputPorts: 1
  })
})

const emit = defineEmits<{
  connectStart: [event: MouseEvent, type: string, portIndex: number]
}>()

const label = computed(() => props.data.label)
const inputPorts = computed(() => Array(props.data.inputPorts || 1).fill(null))
const outputPorts = computed(() => Array(props.data.outputPorts || 1).fill(null))

const getNodeColor = () => {
  const colors = {
    source: 'bg-blue-500',
    filter: 'bg-yellow-500',
    sink: 'bg-red-500',
    default: 'bg-gray-500'
  }
  return colors[props.data.nodeType as keyof typeof colors] || colors.default
}

const onConnectStart = (event: MouseEvent, type: string, portIndex: number) => {
  event.stopPropagation()
  emit('connectStart', event, type, portIndex)
}
</script>

<style scoped>
/* Styles pour les ports de connexion */
.port {
  transition: all 0.2s ease;
}

.port:hover {
  transform: scale(1.2);
}
</style>