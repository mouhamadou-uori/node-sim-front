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
      :connect-on-click="false"
    >
      <template #node-custom="nodeProps">
        <FlowNode v-bind="nodeProps" />
      </template>
      
      <template #edge-custom="edgeProps">
        <FlowEdge v-bind="edgeProps" />
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
        @click="executeSimulation"
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
    
    <!-- Composant de résultats de simulation -->
    <SimulationResults
      :is-visible="showResults"
      :loading="simulationLoading"
      :error="simulationError"
      :results="simulationResults"
      :simulation-type="simulationType"
      @close="closeResults"
    />

    <!-- Panneau de propriétés amélioré -->
    <div
      v-if="selectedNode"
      class="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] max-h-[80vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-gray-800">{{ selectedNode.data.label }}</h3>
        <button 
          @click="selectedNode = null"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            v-model="selectedNode.data.label"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Propriétés pour Source Modulée -->
        <template v-if="selectedNode.data.nodeType === 'source'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puissance de sortie (dBm)</label>
            <input
              v-model.number="selectedNode.data.power"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: -10 à 10 dBm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence (THz)</label>
            <input
              v-model.number="selectedNode.data.frequency"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 190 à 196 THz</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de modulation</label>
            <select
              v-model="selectedNode.data.modulationType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NRZ">NRZ</option>
              <option value="RZ">RZ</option>
              <option value="QPSK">QPSK</option>
              <option value="QAM">QAM</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Débit binaire (Gbps)</label>
            <select
              v-model="selectedNode.data.bitrate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 Gbps</option>
              <option value="40">40 Gbps</option>
              <option value="100">100 Gbps</option>
              <option value="400">400 Gbps</option>
            </select>
          </div>
        </template>

        <!-- Propriétés pour Amplificateur EDFA -->
        <template v-if="selectedNode.data.nodeType === 'amplifier'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puissance de pompe (mW)</label>
            <input
              v-model.number="selectedNode.data.pumpPower"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 10 à 500 mW</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longueur d'onde de pompe (nm)</label>
            <select
              v-model.number="selectedNode.data.pumpWavelength"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="980">980 nm</option>
              <option :value="1480">1480 nm</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longueur de fibre (m)</label>
            <input
              v-model.number="selectedNode.data.fiberLength"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 1 à 100 m</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Concentration Er (ppm)</label>
            <input
              v-model.number="selectedNode.data.erConcentration"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 100 à 5000 ppm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puissance de saturation (mW)</label>
            <input
              v-model.number="selectedNode.data.saturationPower"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 1 à 100 mW</p>
          </div>
        </template>
        
        <!-- Propriétés pour Générateur de signal -->
        <template v-if="selectedNode.data.nodeType === 'generator'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puissance d'entrée (dBm)</label>
            <input
              v-model.number="selectedNode.data.power"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: -50 à 10 dBm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longueur d'onde (nm)</label>
            <input
              v-model.number="selectedNode.data.wavelength"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 1530 à 1565 nm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Largeur de bande (nm)</label>
            <input
              v-model.number="selectedNode.data.bandwidth"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.01 à 10 nm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">État de polarisation</label>
            <select
              v-model="selectedNode.data.signalType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Aléatoire</option>
              <option value="linear">Linéaire</option>
              <option value="circular">Circulaire</option>
            </select>
          </div>
        </template>
        
        <!-- Propriétés pour Mesureur de Puissance -->
        <template v-if="selectedNode.data.nodeType === 'power_meter'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plage de mesure (dBm)</label>
            <div class="flex space-x-2">
              <input
                v-model.number="selectedNode.data.minPower"
                type="number"
                placeholder="Min"
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                v-model.number="selectedNode.data.maxPower"
                type="number"
                placeholder="Max"
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Plage: -60 à +10 dBm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Résolution (dB)</label>
            <select
              v-model="selectedNode.data.resolution"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.01">0.01 dB</option>
              <option value="0.1">0.1 dB</option>
              <option value="1">1 dB</option>
            </select>
          </div>
        </template>
        
        <!-- Propriétés pour Analyseur de Spectre -->
        <template v-if="selectedNode.data.nodeType === 'spectrum_analyzer'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Plage spectrale (nm)</label>
            <div class="flex space-x-2">
              <input
                v-model.number="selectedNode.data.minWavelength"
                type="number"
                placeholder="Min"
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                v-model.number="selectedNode.data.maxWavelength"
                type="number"
                placeholder="Max"
                class="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Plage: 1260 à 1640 nm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Résolution (nm)</label>
            <input
              v-model.number="selectedNode.data.resolution"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.01 à 2 nm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sensibilité (dBm)</label>
            <input
              v-model.number="selectedNode.data.sensitivity"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: -70 à -40 dBm</p>
          </div>
        </template>
        
        <!-- Propriétés pour Détecteur Optique -->
        <template v-if="selectedNode.data.nodeType === 'optical_detector'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sensibilité (A/W)</label>
            <input
              v-model.number="selectedNode.data.sensitivity"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.8 à 1.1 A/W</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Bande passante (GHz)</label>
            <input
              v-model.number="selectedNode.data.bandwidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 1 à 40 GHz</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Courant d'obscurité (nA)</label>
            <input
              v-model.number="selectedNode.data.darkCurrent"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.5 à 10 nA</p>
          </div>
        </template>
        
        <!-- Propriétés pour Générateur Laser -->
        <template v-if="selectedNode.data.nodeType === 'laser_generator'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Puissance de sortie (dBm)</label>
            <input
              v-model.number="selectedNode.data.power"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: -10 à 10 dBm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longueur d'onde (nm)</label>
            <input
              v-model.number="selectedNode.data.wavelength"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 1310 ou 1550 nm</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Largeur spectrale (MHz)</label>
            <input
              v-model.number="selectedNode.data.linewidth"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.1 à 10 MHz</p>
          </div>
        </template>
        
        <!-- Propriétés pour Fibre Optique -->
        <template v-if="selectedNode.data.nodeType === 'fiber'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longueur (km)</label>
            <input
              v-model.number="selectedNode.data.length"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.1 à 1000 km</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Coefficient d'atténuation (dB/km)</label>
            <input
              v-model.number="selectedNode.data.attenuationCoeff"
              type="number"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: 0.1 à 2 dB/km</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Coefficient de dispersion (ps/nm/km)</label>
            <input
              v-model.number="selectedNode.data.dispersionCoeff"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Plage: -50 à 50 ps/nm/km</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de fibre</label>
            <select
              v-model="selectedNode.data.fiberType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SMF">Monomode (SMF)</option>
              <option value="MMF">Multimode (MMF)</option>
              <option value="DSF">Dispersion décalée (DSF)</option>
            </select>
          </div>
        </template>
        
        <div class="pt-2">
          <button
            @click="saveNodeProperties"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Appliquer les changements
          </button>
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
import FlowEdge from './FlowEdge.vue'
import SimulationResults from './SimulationResults.vue'
import { runSimulation as executeBackendSimulation } from '@/services/simulationService'

// Add the sidebarOpen prop
const props = defineProps<{
  sidebarOpen: boolean
}>()

interface NodeData {
  label: string
  nodeType: string
  inputPorts?: number
  outputPorts?: number
  power?: number
  gain?: number
  length?: number
  frequency?: number
  modulationType?: string
  bitrate?: string
  dutyCycle?: number
  minPower?: number
  maxPower?: number
  resolution?: string
  minWavelength?: number
  maxWavelength?: number
  sensitivity?: number
  bandwidth?: number
  darkCurrent?: number
  wavelength?: number
  linewidth?: number
  amplitude?: number
  signalType?: string
  controlMode?: string
  saturationPower?: number
  noiseFactor?: number
  category?: string
  image?: string
  attenuationCoeff?: number
  dispersionCoeff?: number
  fiberType?: string
  pumpPower?: number
  pumpWavelength?: number
  fiberLength?: number
  erConcentration?: number
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
  type?: string
}

const elements = ref<(Node | Edge)[]>([])
const selectedNode = ref<Node | null>(null)
const simulationResults = ref<any>(null)
const simulationLoading = ref<boolean>(false)
const simulationError = ref<string | null>(null)
const showResults = ref<boolean>(false)
const simulationType = ref<string | null>(null)

const { screenToFlowCoordinate, project, addEdges } = useVueFlow()

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  if (!event.dataTransfer) return;
  const componentData = event.dataTransfer.getData('application/json')
  if (!componentData) return;
  try {
    const component = JSON.parse(componentData)
    const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
    const newNode: Node = {
      id: `${component.type}-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        label: component.label,
        nodeType: component.type,
        inputPorts: component.inputPorts || 0,
        outputPorts: component.outputPorts || 0,
        category: component.category || 'text',
        image: component.image || undefined,
        
        // Générateur Laser
        power: component.type === 'laser_generator' ? 10 : 
               component.type === 'source' ? 5 : 
               component.type === 'generator' ? -20 : undefined,
        wavelength: component.type === 'laser_generator' || component.type === 'generator' ? 1550 : undefined,
        linewidth: component.type === 'laser_generator' ? 0.1 : undefined,
        
        // Source Modulée
        modulationType: component.type === 'source' ? 'NRZ' : undefined,
        bitrate: component.type === 'source' ? '10' : undefined,
        
        // Fibre Optique
        length: component.type === 'fiber' ? 50 : undefined,
        attenuationCoeff: component.type === 'fiber' ? 0.2 : undefined,
        dispersionCoeff: component.type === 'fiber' ? 17 : undefined,
        
        // Détecteur Optique
        sensitivity: component.type === 'optical_detector' ? 0.8 : 
                     component.type === 'spectrum_analyzer' ? -80 : undefined,
        darkCurrent: component.type === 'optical_detector' ? 10 : undefined,
        bandwidth: component.type === 'optical_detector' ? 10 : 
                   component.type === 'generator' ? 0.1 : undefined,
        
        // Amplificateur EDFA
        pumpPower: component.type === 'amplifier' ? 100 : undefined,
        pumpWavelength: component.type === 'amplifier' ? 980 : undefined,
        fiberLength: component.type === 'amplifier' ? 10 : undefined,
        erConcentration: component.type === 'amplifier' ? 1000 : undefined,
        saturationPower: component.type === 'amplifier' ? 10 : undefined,
        
        // Analyseur de Spectre
        resolution: component.type === 'spectrum_analyzer' ? 0.01 : undefined,
        
        // Générateur de Signal (pour EDFA)
        signalType: component.type === 'generator' ? 'random' : undefined,
      }
    }
    elements.value.push(newNode)
    console.log('Node created:', newNode)
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
  // Vérifier si la connexion est valide (source -> target)
  if (!params.source || !params.target) return

  // Créer une nouvelle connexion
  const newEdge: Edge = {
    id: `edge-${params.source}-${params.target}-${Date.now()}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'custom'
  }
  
  // Ajouter la connexion aux éléments
  addEdges([newEdge])
  
  console.log('Connection created:', newEdge)
}

const onNodeDragStop = (event: any) => {
  // Update node position in the elements array
  const nodeId = event.node.id
  const nodeIndex = elements.value.findIndex((el) => 'id' in el && el.id === nodeId)
  if (nodeIndex !== -1) {
    const node = elements.value[nodeIndex] as Node
    node.position = event.node.position
  }
}

const clearWorkspace = () => {
  elements.value = []
  selectedNode.value = null
}

const executeSimulation = async () => {
  // Récupérer tous les nœuds et connexions
  const nodes = elements.value.filter(el => 'type' in el) as Node[]
  const edges = elements.value.filter(el => !('type' in el)) as Edge[]
  
  // Vérifier s'il y a au moins un nœud pour la simulation
  if (nodes.length === 0) {
    simulationError.value = 'Veuillez ajouter au moins un composant avant de lancer la simulation.';
    simulationLoading.value = false;
    showResults.value = true;
    return;
  }
  
  // Réinitialiser les résultats précédents
  simulationResults.value = null;
  simulationError.value = null;
  simulationLoading.value = true;
  showResults.value = true;
  
  try {
    // Appeler le service de simulation
    const response = await executeBackendSimulation(nodes, edges);
    
    if (response.success) {
      simulationResults.value = response.results;
      
      // Déterminer le type de simulation en fonction des nœuds
      const nodeTypes = nodes.map(node => node.data.nodeType);
      
      if (nodeTypes.includes('laser_generator') && nodeTypes.includes('optical_detector')) {
        simulationType.value = 'laser-transmission';
      } else if ((nodeTypes.includes('source') && nodeTypes.includes('spectrum_analyzer')) || 
                (nodeTypes.includes('source') && nodeTypes.includes('fiber') && nodeTypes.includes('spectrum_analyzer'))) {
        simulationType.value = 'fiber-dispersion';
      } else if (nodeTypes.includes('source') && nodeTypes.includes('amplifier')) {
        simulationType.value = 'edfa-amplifier';
      } else if (nodeTypes.includes('laser_generator')) {
        simulationType.value = 'laser-transmission';
      } else if (nodeTypes.includes('source')) {
        simulationType.value = 'fiber-dispersion';
      } else {
        simulationType.value = null;
      }
    } else {
      simulationError.value = response.error || 'Une erreur est survenue lors de la simulation.';
      console.error('Erreur de simulation:', response.error);
    }
  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
    simulationError.value = 'Erreur de connexion avec le backend.';
  } finally {
    simulationLoading.value = false;
  }
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

// Function to save node properties and call endpoint
const saveNodeProperties = () => {
  if (!selectedNode.value) return
  
  // Update the node in the elements array
  const nodeIndex = elements.value.findIndex(
    (el) => 'id' in el && el.id === selectedNode.value?.id
  )
  
  if (nodeIndex !== -1) {
    // Create a new reference to trigger reactivity
    elements.value = [
      ...elements.value.slice(0, nodeIndex),
      selectedNode.value,
      ...elements.value.slice(nodeIndex + 1)
    ]
  }
}

// Fermer le panneau des résultats
const closeResults = () => {
  showResults.value = false;
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
  stroke: #facc15;
  stroke-width: 2;
}

.vue-flow__edge.selected {
  stroke: #eab308;
  stroke-width: 3;
}

.vue-flow__edge-path {
  stroke: #facc15;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #eab308;
}

.vue-flow__controls {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.vue-flow__minimap {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
