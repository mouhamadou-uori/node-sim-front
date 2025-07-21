<template>
  <div :class="['custom-node', getNodeClass(), { selected: selected }]">
    <!-- Input Handles (left side) -->
    <template v-for="(_, index) in inputPorts" :key="`input-${index}`">
      <Handle
        :id="`input-${index}`"
        type="target"
        :position="Position.Left"
        :style="{ top: `${(index + 1) * 20 + 10}px` }"
        class="input-handle"
      />
    </template>

    <!-- Output Handles (right side) -->
    <template v-for="(_, index) in outputPorts" :key="`output-${index}`">
      <Handle
        :id="`output-${index}`"
        type="source"
        :position="Position.Right"
        :style="{ top: `${(index + 1) * 20 + 10}px` }"
        class="output-handle"
      />
    </template>

    <!-- Contenu du nœud - texte ou image -->
    <div v-if="!isImageNode" class="node-content">
      <!-- Icônes pour les nœuds textuels -->
      <span v-if="props.data.nodeType === 'source'" class="node-icon source-icon">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M2 12 Q6 2 12 12 T22 12" stroke="#2563eb" stroke-width="2" fill="none"/></svg>
      </span>
      <span v-else-if="props.data.nodeType === 'amplifier'" class="node-icon amplifier-icon">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 18 L8 18 L12 6 L16 18 L20 18" stroke="#16a34a" stroke-width="2" fill="none"/></svg>
      </span>
      <span v-else-if="props.data.nodeType === 'generator'" class="node-icon generator-icon">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M4 12 L8 8 L12 12 L16 16 L20 12" stroke="#9333ea" stroke-width="2" fill="none"/></svg>
      </span>
      <span class="node-label">{{ props.data.label }}</span>
    </div>

    <!-- Nœuds basés sur des images -->
    <div v-else class="node-image-content">
      <img 
        v-if="props.data.image" 
        :src="`/src/assets/${props.data.image}`" 
        :alt="props.data.label"
        class="node-image"
      />
      <span class="node-label image-label">{{ props.data.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

interface Props {
  id: string
  type: string
  selected: boolean
  data: {
    label: string
    nodeType: string
    inputPorts?: number
    outputPorts?: number
    power?: number
    gain?: number
    length?: number
    frequency?: number
    amplitude?: number
    signalType?: string
    dutyCycle?: number
    noiseLevel?: number
    bandwidth?: number
    resolution?: number
    sensitivity?: number
    category?: string
    image?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    label: 'Node',
    nodeType: 'default',
    inputPorts: 1,
    outputPorts: 1,
    category: 'text'
  })
})

const inputPorts = computed(() => Array(props.data.inputPorts || 0).fill(null))
const outputPorts = computed(() => Array(props.data.outputPorts || 0).fill(null))

const getNodeClass = () => {
  const classes = {
    source: 'node-source',
    amplifier: 'node-amplifier',
    generator: 'node-generator',
    power_meter: 'node-power-meter',
    spectrum_analyzer: 'node-spectrum-analyzer',
    optical_detector: 'node-optical-detector',
    laser_generator: 'node-laser-generator',
    default: 'node-default'
  }
  return classes[props.data.nodeType as keyof typeof classes] || classes.default
}

const isImageNode = computed(() => props.data.category === 'image')
</script>

<style scoped>
.custom-node {
  min-width: 120px;
  min-height: 60px;
  padding: 10px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.2s ease;
}

.custom-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.node-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.node-image-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.node-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
}

.image-label {
  font-size: 12px;
  text-align: center;
  margin-top: 4px;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Node type specific styles */
.node-source {
  border-color: #2563eb;
  background-color: rgba(219, 234, 254, 0.5);
}

.node-amplifier {
  border-color: #16a34a;
  background-color: rgba(220, 252, 231, 0.5);
}

.node-generator {
  border-color: #9333ea;
  background-color: rgba(243, 232, 255, 0.5);
}

.node-power-meter, 
.node-spectrum-analyzer, 
.node-optical-detector, 
.node-laser-generator {
  border-color: #f59e0b;
  background-color: rgba(254, 243, 199, 0.5);
  width: 160px;
  height: auto;
}

/* Handle styles */
:deep(.input-handle) {
  width: 10px;
  height: 10px;
  background-color: #3b82f6;
  border: 2px solid white;
  transition: all 0.2s ease;
}

:deep(.output-handle) {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border: 2px solid white;
  transition: all 0.2s ease;
}

:deep(.input-handle:hover),
:deep(.output-handle:hover) {
  transform: scale(1.3);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>