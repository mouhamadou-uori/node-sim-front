<template>
  <div :class="['h-full relative', sidebarOpen ? '' : 'w-full']"
       @drop="onDrop"
       @dragover="onDragOver"
       style="overflow: hidden;">
    <VueFlow
      v-model="elements"
      :default-viewport="{ zoom: 1 }"
      :min-zoom="0.2"
      :max-zoom="4"
      class="h-full w-full bg-gray-50"
      @connect="onConnect"
      @node-drag-stop="onNodeDragStop"
      @node-click="onNodeClick"
    >
      <template #node-custom="nodeProps">
        <FlowNode
          :id="nodeProps.id"
          :type="nodeProps.type"
          :position="nodeProps.position"
          :data="nodeProps.data"
          @connect-start="onConnectStart"
        />
      </template>

      <Background pattern-color="#aaa" :gap="20" />
      <MiniMap />
      <Controls />
    </VueFlow>

    <div class="absolute top-4 left-4 z-10 flex space-x-2">
      <button
        @click="clearWorkspace"
        class="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
      >
        Clear
      </button>
      <button
        @click="runSimulation"
        class="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
      >
        Run Simulation
      </button>
      <button
        @click="saveProject"
        class="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
      >
        Save
      </button>
    </div>

    <!-- Panneau de propriétés -->
    <div
      v-if="selectedNode"
      class="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px]"
    >
      <h3 class="text-lg font-semibold text-gray-800 mb-3">Properties</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            v-model="selectedNode.data.label"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="selectedNode.data.nodeType === 'source'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Power (dBm)</label>
          <input
            v-model="selectedNode.data.power"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div v-if="selectedNode.data.nodeType === 'filter'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Gain (dB)</label>
          <input
            v-model="selectedNode.data.gain"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'
import FlowNode from './FlowNode.vue'

interface NodeData {
  label: string
  nodeType: string
  inputPorts?: number
  outputPorts?: number
  power?: number
  gain?: number
}

interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
}

interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

const elements = ref<(Node | Edge)[]>([])
const selectedNode = ref<Node | null>(null)

const { screenToFlowCoordinate } = useVueFlow()

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  if (!event.dataTransfer) return;
  const componentData = event.dataTransfer.getData('application/json')
  if (!componentData) return;
  try {
    const component = JSON.parse(componentData)
    const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
    const newNode: Node = {
      id: `${component.id}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: component.label,
        nodeType: component.nodeType,
        inputPorts: component.inputPorts,
        outputPorts: component.outputPorts,
        power: component.nodeType === 'source' ? 0 : undefined,
        gain: component.nodeType === 'filter' ? 0 : undefined
      }
    }
    elements.value.push(newNode)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error parsing component data:', error)
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const onConnect = (params: any) => {
  const newEdge: Edge = {
    id: `edge-${Date.now()}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle
  }
  elements.value.push(newEdge)
}

const onNodeDragStop = (event: any) => {
}

const onConnectStart = (event: MouseEvent, type: string, portIndex: number) => {
}

const clearWorkspace = () => {
  elements.value = []
  selectedNode.value = null
}

const runSimulation = () => {
  alert('Simulation started! Check console for details.')
}

const saveProject = () => {
  const projectData = {
    elements: elements.value,
    timestamp: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `optisystem-project-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const onNodeClick = (event: any) => {
  selectedNode.value = event.node
}
</script>

<style>
.vue-flow {
  background-color: #f9fafb;
}

.vue-flow__node {
  cursor: pointer;
}

.vue-flow__node.selected {
  box-shadow: 0 0 0 2px #3b82f6;
}

.vue-flow__edge {
  stroke: #6b7280;
  stroke-width: 2;
}

.vue-flow__edge.selected {
  stroke: #3b82f6;
  stroke-width: 3;
}

.vue-flow__controls {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.vue-flow__minimap {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
