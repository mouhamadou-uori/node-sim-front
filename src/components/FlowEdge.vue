<script setup lang="ts">
import { computed } from 'vue'
import type { EdgeProps } from '@vue-flow/core'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <BaseEdge 
    :path="path[0]" 
    :style="{ 
      stroke: props.selected ? '#eab308' : '#facc15', 
      strokeWidth: props.selected ? 3 : 2 
    }" 
  />

  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
      }"
      class="nodrag nopan"
    >
      <button class="edgebutton" @click="removeEdges(props.id)">×</button>
    </div>
  </EdgeLabelRenderer>
</template>

<style>
.edgebutton {
  width: 20px;
  height: 20px;
  background: white;
  border: 1px solid #facc15;
  color: #eab308;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.edgebutton:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
}
</style> 