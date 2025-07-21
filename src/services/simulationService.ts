/**
 * Service pour gérer les appels API au backend de simulation
 */

import axios from 'axios';

// URL de base du backend
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Interface pour les résultats de simulation laser-transmission
 */
interface LaserTransmissionResult {
  power_received: number;
  snr: number;
  ber: number;
  power_vs_distance_graph: string;
}

/**
 * Interface pour les résultats de simulation fiber-dispersion
 */
interface FiberDispersionResult {
  temporal_broadening: number;
  attenuation: number;
  output_power: number;
  eye_diagram: string;
  spectrum: string;
}

/**
 * Interface pour les résultats de simulation edfa-amplifier
 */
interface EDFAAmplifierResult {
  gain_db: number;
  output_power_dbm: number;
  noise_figure_db: number;
  gain_spectrum: string;
}

/**
 * Interface pour les réponses de l'API
 */
interface ApiResponse<T> {
  success: boolean;
  results?: T;
  error?: string;
}

/**
 * Vérifie l'état du backend
 * @returns Promise avec le statut du backend
 */
export async function checkBackendHealth(): Promise<{ status: string; message: string }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du backend:', error);
    throw new Error('Impossible de se connecter au backend');
  }
}

/**
 * Exécute une simulation de transmission laser
 * @param nodes Les nœuds du circuit
 * @param connections Les connexions entre les nœuds
 * @returns Promise avec les résultats de la simulation
 */
export async function simulateLaserTransmission(nodes: any[], connections: any[]): Promise<ApiResponse<LaserTransmissionResult>> {
  try {
    // Trouver le générateur laser et le détecteur optique
    const laserNode = nodes.find(node => node.type === 'laser_generator');
    const detectorNode = nodes.find(node => node.type === 'optical_detector');
    
    // Si le générateur laser est manquant, on ne peut pas faire la simulation
    if (!laserNode) {
      return {
        success: false,
        error: 'Un générateur laser est nécessaire pour cette simulation.'
      };
    }
    
    // Créer un détecteur optique par défaut si manquant
    const defaultDetectorConfig = {
      sensitivity: { value: 0.8 },
      dark_current: { value: 10 },
      bandwidth: { value: 10 },
      noise_temperature: { value: 300 },
      active_area: { value: 100 }
    };
    
    // Préparer les données pour le backend
    const formattedData = {
      nodes: [
        {
          id: laserNode.id,
          type: 'laser_source', // Type attendu par le backend
          config: laserNode.config
        },
        {
          id: detectorNode ? detectorNode.id : 'default_detector',
          type: 'photodetector', // Type attendu par le backend
          config: detectorNode ? detectorNode.config : defaultDetectorConfig
        }
      ],
      connections: [
        {
          id: connections.length > 0 ? connections[0].id : 'default_connection',
          source: laserNode.id,
          target: detectorNode ? detectorNode.id : 'default_detector',
          config: {
            distance: { value: 1000 },
            medium: { value: "fiber" }
          }
        }
      ]
    };
    
    console.log('Données formatées pour la simulation laser:', formattedData);
    
    const response = await axios.post(`${API_BASE_URL}/simulate/laser-transmission`, formattedData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la simulation de transmission laser:', error);
    return { success: false, error: error.response?.data?.error || 'Erreur lors de la simulation' };
  }
}

/**
 * Exécute une simulation de dispersion de fibre
 * @param nodes Les nœuds du circuit
 * @param connections Les connexions entre les nœuds
 * @returns Promise avec les résultats de la simulation
 */
export async function simulateFiberDispersion(nodes: any[], connections: any[]): Promise<ApiResponse<FiberDispersionResult>> {
  try {
    // Trouver les nœuds nécessaires
    const sourceNode = nodes.find(node => node.type === 'source');
    const fiberNode = nodes.find(node => node.type === 'fiber');
    const analyzerNode = nodes.find(node => node.type === 'spectrum_analyzer');
    
    // Si la source est manquante, on ne peut pas faire la simulation
    if (!sourceNode) {
      return {
        success: false,
        error: 'Une source modulée est nécessaire pour cette simulation.'
      };
    }
    
    // Créer une fibre optique par défaut si manquante
    const defaultFiberConfig = {
      length: { value: 50 },
      attenuation_coeff: { value: 0.2 },
      dispersion_coeff: { value: 17 },
      nonlinear_coeff: { value: 1.3 },
      core_diameter: { value: 9 },
      numerical_aperture: { value: 0.14 }
    };
    
    // Créer un analyseur de spectre par défaut si manquant
    const defaultAnalyzerConfig = {
      resolution: { value: 0.01 },
      frequency_range: { value: 50 },
      sensitivity: { value: -80 },
      measurement_type: { value: "power_spectrum" }
    };
    
    // Préparer les données pour le backend
    const formattedData = {
      nodes: [
        {
          id: sourceNode.id,
          type: 'modulated_light_source', // Type attendu par le backend
          config: sourceNode.config
        },
        {
          id: fiberNode ? fiberNode.id : 'default_fiber',
          type: 'single_mode_fiber', // Type attendu par le backend
          config: fiberNode ? fiberNode.config : defaultFiberConfig
        },
        {
          id: analyzerNode ? analyzerNode.id : 'default_analyzer',
          type: 'optical_spectrum_analyzer', // Type attendu par le backend
          config: analyzerNode ? analyzerNode.config : defaultAnalyzerConfig
        }
      ],
      connections: connections.length > 0 ? connections : [
        {
          id: 'default_connection_1',
          source: sourceNode.id,
          target: fiberNode ? fiberNode.id : 'default_fiber',
          config: {
            distance: { value: 0 },
            medium: { value: "fiber" }
          }
        },
        {
          id: 'default_connection_2',
          source: fiberNode ? fiberNode.id : 'default_fiber',
          target: analyzerNode ? analyzerNode.id : 'default_analyzer',
          config: {
            distance: { value: 0 },
            medium: { value: "fiber" }
          }
        }
      ]
    };
    
    console.log('Données formatées pour la simulation de dispersion:', formattedData);
    
    const response = await axios.post(`${API_BASE_URL}/simulate/fiber-dispersion`, formattedData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la simulation de dispersion de fibre:', error);
    return { success: false, error: error.response?.data?.error || 'Erreur lors de la simulation' };
  }
}

/**
 * Exécute une simulation d'amplificateur EDFA
 * @param nodes Les nœuds du circuit
 * @param connections Les connexions entre les nœuds
 * @returns Promise avec les résultats de la simulation
 */
export async function simulateEDFAAmplifier(nodes: any[], connections: any[]): Promise<ApiResponse<EDFAAmplifierResult>> {
  try {
    // Trouver les nœuds nécessaires
    const generatorNode = nodes.find(node => node.type === 'generator');
    const amplifierNode = nodes.find(node => node.type === 'amplifier');
    const powerMeterNode = nodes.find(node => node.type === 'power_meter');
    
    // Si le générateur ou l'amplificateur est manquant, on ne peut pas faire la simulation
    if (!generatorNode) {
      return {
        success: false,
        error: 'Un générateur de signal est nécessaire pour cette simulation.'
      };
    }
    
    if (!amplifierNode) {
      return {
        success: false,
        error: 'Un amplificateur EDFA est nécessaire pour cette simulation.'
      };
    }
    
    // Créer un mesureur de puissance par défaut si manquant
    const defaultPowerMeterConfig = {
      wavelength_range: { value: [1530, 1565] },
      power_range: { value: [-60, 30] },
      accuracy: { value: 0.1 },
      measurement_mode: { value: "average" },
      integration_time: { value: 1 }
    };
    
    // Préparer les données pour le backend
    const formattedData = {
      nodes: [
        {
          id: generatorNode.id,
          type: 'weak_optical_source', // Type attendu par le backend
          config: generatorNode.config
        },
        {
          id: amplifierNode.id,
          type: 'erbium_doped_fiber_amplifier', // Type attendu par le backend
          config: amplifierNode.config
        }
      ],
      connections: connections.length > 0 ? connections : [
        {
          id: 'default_connection',
          source: generatorNode.id,
          target: amplifierNode.id,
          config: {
            distance: { value: 0 },
            medium: { value: "fiber" }
          }
        }
      ]
    };
    
    // Ajouter le mesureur de puissance s'il existe
    if (powerMeterNode) {
      formattedData.nodes.push({
        id: powerMeterNode.id,
        type: 'optical_power_meter',
        config: powerMeterNode.config
      });
      
      // Ajouter une connexion entre l'amplificateur et le mesureur de puissance
      formattedData.connections.push({
        id: 'default_connection_2',
        source: amplifierNode.id,
        target: powerMeterNode.id,
        config: {
          distance: { value: 0 },
          medium: { value: "fiber" }
        }
      });
    }
    
    console.log('Données formatées pour la simulation d\'amplificateur EDFA:', formattedData);
    
    const response = await axios.post(`${API_BASE_URL}/simulate/edfa-amplifier`, formattedData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la simulation d\'amplificateur EDFA:', error);
    return { success: false, error: error.response?.data?.error || 'Erreur lors de la simulation' };
  }
}

/**
 * Formate les données du nœud pour le backend
 * @param nodeData Les données du nœud
 * @returns Les données formatées pour le backend
 */
function formatNodeConfig(nodeData: any): any {
  const config: any = {};

  // Formatage en fonction du type de nœud
  switch (nodeData.nodeType) {
    // Générateur Laser (pour simulation de transmission laser)
    case 'laser_generator':
      config.optical_power = { value: nodeData.power || 10 };
      config.wavelength = { value: nodeData.wavelength || 1550 };
      config.spectral_width = { value: nodeData.linewidth ? nodeData.linewidth / 1000 : 0.1 };
      config.polarization = { value: "linear" };
      config.beam_divergence = { value: 1.2 };
      break;
    
    // Détecteur Optique (pour simulation de transmission laser)
    case 'optical_detector':
      config.sensitivity = { value: nodeData.sensitivity || 0.8 };
      config.dark_current = { value: nodeData.darkCurrent || 10 };
      config.bandwidth = { value: nodeData.bandwidth || 10 };
      config.noise_temperature = { value: 300 };
      config.active_area = { value: 100 };
      break;
    
    // Source Modulée (pour simulation de fibre optique avec dispersion)
    case 'source':
      config.carrier_wavelength = { value: 1550 };
      config.optical_power = { value: nodeData.power || 5 };
      config.bit_rate = { value: parseInt(nodeData.bitrate || '10') };
      config.modulation_type = { value: nodeData.modulationType || 'NRZ' };
      config.extinction_ratio = { value: 10 };
      config.rise_time = { value: 20 };
      break;
    
    // Fibre Optique (pour simulation de fibre optique avec dispersion)
    case 'fiber':
      config.length = { value: nodeData.length || 50 };
      config.attenuation_coeff = { value: nodeData.attenuationCoeff || 0.2 };
      config.dispersion_coeff = { value: nodeData.dispersionCoeff || 17 };
      config.nonlinear_coeff = { value: 1.3 };
      config.core_diameter = { value: 9 };
      config.numerical_aperture = { value: 0.14 };
      break;
    
    // Analyseur de Spectre (pour simulation de fibre optique avec dispersion)
    case 'spectrum_analyzer':
      config.resolution = { value: nodeData.resolution || 0.01 };
      config.frequency_range = { value: 50 };
      config.sensitivity = { value: nodeData.sensitivity || -80 };
      config.measurement_type = { value: "power_spectrum" };
      break;
      
    // Générateur de Signal (pour simulation d'amplificateur EDFA - signal faible)
    case 'generator':
      config.input_power = { value: nodeData.power || -20 };
      config.wavelength = { value: nodeData.wavelength || 1550 };
      config.signal_bandwidth = { value: nodeData.bandwidth || 0.1 };
      config.polarization_state = { value: "random" };
      config.noise_figure = { value: 3 };
      break;
      
    // Amplificateur EDFA
    case 'amplifier':
      config.pump_power = { value: nodeData.pumpPower || 100 };
      config.pump_wavelength = { value: nodeData.pumpWavelength || 980 };
      config.fiber_length = { value: nodeData.fiberLength || 10 };
      config.er_concentration = { value: nodeData.erConcentration || 1000 };
      config.core_radius = { value: 2.5 };
      config.numerical_aperture = { value: 0.24 };
      config.background_loss = { value: 0.1 };
      config.saturation_power = { value: nodeData.saturationPower || 10 };
      break;
      
    // Mesureur de Puissance
    case 'power_meter':
      config.wavelength_range = { value: [1530, 1565] };
      config.power_range = { value: [-60, 30] };
      config.accuracy = { value: 0.1 };
      config.measurement_mode = { value: "average" };
      config.integration_time = { value: 1 };
      break;
  }

  return config;
}

/**
 * Vérifie si les attributs requis pour un nœud sont présents et valides
 * @param node Le nœud à vérifier
 * @returns Un objet contenant le résultat de la validation et un message d'erreur éventuel
 */
function validateNodeAttributes(node: any): { isValid: boolean; error?: string } {
  const nodeType = node.data.nodeType;
  
  switch (nodeType) {
    case 'laser_generator':
      if (node.data.power === undefined || node.data.wavelength === undefined) {
        return { 
          isValid: false, 
          error: `Le générateur laser "${node.data.label}" nécessite une puissance et une longueur d'onde.` 
        };
      }
      break;
      
    case 'optical_detector':
      if (node.data.sensitivity === undefined || node.data.bandwidth === undefined) {
        return { 
          isValid: false, 
          error: `Le détecteur optique "${node.data.label}" nécessite une sensibilité et une bande passante.` 
        };
      }
      break;
      
    case 'source':
      if (node.data.power === undefined || node.data.modulationType === undefined || node.data.bitrate === undefined) {
        return { 
          isValid: false, 
          error: `La source modulée "${node.data.label}" nécessite une puissance, un type de modulation et un débit.` 
        };
      }
      break;
      
    case 'fiber':
      if (node.data.length === undefined || node.data.attenuationCoeff === undefined || node.data.dispersionCoeff === undefined) {
        return { 
          isValid: false, 
          error: `La fibre optique "${node.data.label}" nécessite une longueur, un coefficient d'atténuation et un coefficient de dispersion.` 
        };
      }
      break;
  }
  
  return { isValid: true };
}

/**
 * Détermine le type de simulation à exécuter en fonction des nœuds présents
 * @param nodes Les nœuds du circuit
 * @param connections Les connexions entre les nœuds
 * @returns Promise avec les résultats de la simulation appropriée
 */
export async function runSimulation(nodes: any[], connections: any[]): Promise<ApiResponse<any>> {
  // Convertir les nœuds et connexions au format attendu par le backend
  const formattedNodes = nodes.map(node => ({
    id: node.id,
    type: node.data.nodeType,
    config: formatNodeConfig(node.data)
  }));

  const formattedConnections = connections.map(conn => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    config: {
      // Valeurs par défaut pour les connexions
      distance: { value: 1000 }, // 1000m par défaut
      medium: { value: "fiber" } // fibre par défaut
    }
  }));

  // Afficher les données pour le débogage
  console.log('Nœuds formatés:', formattedNodes);
  console.log('Connexions formatées:', formattedConnections);

  // Déterminer le type de simulation en fonction des nœuds présents
  const nodeTypes = formattedNodes.map(node => node.type);
  console.log('Types de nœuds détectés:', nodeTypes);

  // Scénario 1: Générateur laser + Détecteur optique
  if (nodeTypes.includes('laser_generator') && nodeTypes.includes('optical_detector')) {
    console.log('Simulation de transmission laser détectée');
    return simulateLaserTransmission(formattedNodes, formattedConnections);
  } 
  // Scénario 2: Source modulée + Fibre optique + Analyseur de spectre
  else if (nodeTypes.includes('source') && nodeTypes.includes('fiber') && nodeTypes.includes('spectrum_analyzer')) {
    console.log('Simulation de dispersion de fibre détectée');
    return simulateFiberDispersion(formattedNodes, formattedConnections);
  } 
  // Scénario 3: Source + Amplificateur EDFA
  else if (nodeTypes.includes('source') && nodeTypes.includes('amplifier')) {
    console.log('Simulation d\'amplificateur EDFA détectée');
    return simulateEDFAAmplifier(formattedNodes, formattedConnections);
  } 
  // Scénario 2 alternatif: Source modulée + Analyseur de spectre (sans fibre explicite)
  else if (nodeTypes.includes('source') && nodeTypes.includes('spectrum_analyzer')) {
    console.log('Simulation de dispersion de fibre détectée (sans fibre explicite)');
    return simulateFiberDispersion(formattedNodes, formattedConnections);
  }
  // Si on a un générateur laser, on tente la simulation de transmission laser
  else if (nodeTypes.includes('laser_generator')) {
    console.log('Tentative de simulation de transmission laser (détecteur manquant)');
    return simulateLaserTransmission(formattedNodes, formattedConnections);
  }
  // Si on a une source modulée, on tente la simulation de dispersion
  else if (nodeTypes.includes('source')) {
    console.log('Tentative de simulation de dispersion (analyseur manquant)');
    return simulateFiberDispersion(formattedNodes, formattedConnections);
  }
  else {
    console.log('Configuration non reconnue');
    return { 
      success: false, 
      error: 'Configuration non reconnue. Veuillez ajouter au moins un générateur laser ou une source modulée.' 
    };
  }
} 