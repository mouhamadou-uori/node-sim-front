<template>
  <div v-if="isVisible" class="results-panel">
    <div class="results-header">
      <h3>Résultats de simulation</h3>
      <button @click="close" class="close-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Calcul en cours...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="results" class="results-content">
      <!-- Résultats de transmission laser -->
      <div v-if="simulationType === 'laser-transmission'" class="result-section">
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Puissance reçue</span>
            <span class="metric-value">{{ formatNumber(results.power_received) }} mW</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">SNR</span>
            <span class="metric-value">{{ formatNumber(results.snr) }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">BER</span>
            <span class="metric-value">{{ formatExponential(results.ber) }}</span>
          </div>
        </div>
        
        <div class="graph-container">
          <h4>Puissance vs Distance</h4>
          <img :src="'data:image/png;base64,' + results.power_vs_distance_graph" alt="Graphique puissance vs distance" class="result-graph" />
        </div>
      </div>
      
      <!-- Résultats de dispersion de fibre -->
      <div v-else-if="simulationType === 'fiber-dispersion'" class="result-section">
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Élargissement temporel</span>
            <span class="metric-value">{{ formatNumber(results.temporal_broadening) }} ps</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Atténuation</span>
            <span class="metric-value">{{ formatNumber(results.attenuation) }} dB</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Puissance de sortie</span>
            <span class="metric-value">{{ formatNumber(results.output_power) }} mW</span>
          </div>
        </div>
        
        <div class="graph-container">
          <h4>Diagramme de l'œil</h4>
          <img :src="'data:image/png;base64,' + results.eye_diagram" alt="Diagramme de l'œil" class="result-graph" />
        </div>
        
        <div class="graph-container">
          <h4>Spectre optique</h4>
          <img :src="'data:image/png;base64,' + results.spectrum" alt="Spectre optique" class="result-graph" />
        </div>
      </div>
      
      <!-- Résultats d'amplificateur EDFA -->
      <div v-else-if="simulationType === 'edfa-amplifier'" class="result-section">
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Gain</span>
            <span class="metric-value">{{ formatNumber(results.gain_db) }} dB</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Puissance de sortie</span>
            <span class="metric-value">{{ formatNumber(results.output_power_dbm) }} dBm</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Figure de bruit</span>
            <span class="metric-value">{{ formatNumber(results.noise_figure_db) }} dB</span>
          </div>
        </div>
        
        <div class="graph-container">
          <h4>Spectre de gain</h4>
          <img :src="'data:image/png;base64,' + results.gain_spectrum" alt="Spectre de gain" class="result-graph" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  loading: boolean;
  error: string | null;
  results: any | null;
  simulationType: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};

// Formatage des nombres pour l'affichage
const formatNumber = (value: number): string => {
  if (value === undefined || value === null) return 'N/A';
  return value.toFixed(4);
};

// Formatage en notation scientifique pour les très petits nombres
const formatExponential = (value: number): string => {
  if (value === undefined || value === null) return 'N/A';
  if (value < 0.0001) {
    return value.toExponential(4);
  }
  return value.toFixed(6);
};
</script>

<style scoped>
.results-panel {
  position: absolute;
  top: 70px;
  right: 20px;
  width: 450px;
  max-height: calc(100vh - 100px);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.results-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  color: #ef4444;
}

.error-icon {
  margin-bottom: 12px;
}

.results-content {
  padding: 20px;
}

.result-section {
  margin-bottom: 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.metric-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.graph-container {
  margin-top: 20px;
}

.graph-container h4 {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 12px;
}

.result-graph {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
</style> 