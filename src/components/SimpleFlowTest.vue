<template>
  <div class="h-full w-full">
    <!-- Zone de test simple -->
    <div class="p-4 bg-blue-100 mb-4">
      <h3 class="font-bold mb-2">Test Drag & Drop Simple</h3>
      <div class="flex space-x-2">
        <div
          class="px-3 py-2 bg-white border rounded cursor-move"
          draggable="true"
          @dragstart="onDragStart"
        >
          Test Component
        </div>
      </div>
    </div>

    <!-- Vue Flow simplifié -->
    <div class="h-96 border-2 border-dashed border-gray-300">
      <VueFlow
        v-model="elements"
        class="h-full w-full"
        @drop="onDrop"
        @dragover="onDragOver"
      >
        <Background />
      </VueFlow>
    </div>

    <!-- Logs -->
    <div class="mt-4 p-4 bg-gray-100">
      <h4 class="font-bold mb-2">Logs:</h4>
      <div class="text-sm font-mono max-h-32 overflow-y-auto">
        <div v-for="(log, index) in logs" :key="index" class="mb-1">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'

const elements = ref<any[]>([])
const logs = ref<string[]>([])

const addLog = (message: string) => {
  logs.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
  if (logs.value.length > 10) logs.value.shift()
}

const onDragStart = (event: DragEvent) => {
  addLog('Drag start triggered')
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', 'test-component')
    event.dataTransfer.effectAllowed = 'copy'
    addLog('Data set in dataTransfer')
  }
}

const onDrop = (event: any) => {
  addLog('Drop event triggered')
  addLog(`Event type: ${typeof event}`)
  addLog(`Event keys: ${Object.keys(event)}`)

  if (event.dataTransfer) {
    const data = event.dataTransfer.getData('text/plain')
    addLog(`Data received: ${data}`)

    // Créer un nœud simple
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Test Node' }
    }

    elements.value.push(newNode)
    addLog(`Node added: ${newNode.id}`)
  } else {
    addLog('No dataTransfer found')
  }
}

const onDragOver = (event: any) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}
</script>
