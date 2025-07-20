<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bibliothèque de composants</h3>
      <div class="space-y-1">
        <div
          v-for="component in mainComponents"
          :key="component.id"
          class="flex items-center p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-move transition-colors"
          draggable="true"
          @dragstart="onDragStart($event, component)"
        >
          <div
            class="w-3 h-3 rounded-full mr-2"
            :class="{
              'bg-blue-500': component.nodeType === 'source',
              'bg-yellow-500': component.nodeType === 'modulator',
              'bg-yellow-400': component.nodeType === 'fiber'
            }"
          ></div>
          <span class="text-sm text-gray-700">{{ component.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Component {
  id: string
  label: string
  type: string
  nodeType: string
  inputPorts: number
  outputPorts: number
}

const emit = defineEmits<{
  componentDragStart: [component: Component]
}>()

const mainComponents = ref<Component[]>([
  { id: 'source', label: 'Source de données', type: 'custom', nodeType: 'source', inputPorts: 0, outputPorts: 1 },
  { id: 'modulator', label: 'Modulateur', type: 'custom', nodeType: 'modulator', inputPorts: 1, outputPorts: 1 },
  { id: 'fiber', label: 'Fibre optique', type: 'custom', nodeType: 'fiber', inputPorts: 1, outputPorts: 1 }
])

const onDragStart = (event: DragEvent, component: Component) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(component))
    event.dataTransfer.setData('text/plain', component.label)
    event.dataTransfer.effectAllowed = 'copy'
    // Image de drag optionnelle
    const dragImage = new Image()
    dragImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHRleHQgeD0iNTAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj5Db21wb25lbnQ8L3RleHQ+PC9zdmc+'
    event.dataTransfer.setDragImage(dragImage, 50, 25)
  }
  emit('componentDragStart', component)
}
</script>
