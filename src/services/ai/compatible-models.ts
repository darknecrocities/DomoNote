import type { OllamaModel } from '../../types';

export type ModelTier = 'minimum' | 'standard' | 'pro' | 'advanced';

export interface ModelTierInfo {
  tier: ModelTier;
  rank: number;
  label: string;
  badge: string;
  minRam: string;
  targetHardware: string;
  description: string;
}

export const MODEL_TIERS: Record<ModelTier, ModelTierInfo> = {
  minimum: {
    tier: 'minimum',
    rank: 1,
    label: 'Minimal / Ultra-Light (1B – 2B)',
    badge: '⚡ Low RAM & Battery Friendly',
    minRam: '4 GB RAM',
    targetHardware: 'Budget laptops, older CPUs, low-spec virtual machines',
    description: 'Ultra-lean parameters designed for near-instant latency and tiny memory footprint. Ideal for quick note structuring and meeting transcripts on any hardware.',
  },
  standard: {
    tier: 'standard',
    rank: 2,
    label: 'Balanced / Standard (3B – 4B)',
    badge: '⭐ DomoNote Recommended Sweet Spot',
    minRam: '8 GB RAM',
    targetHardware: 'Modern laptops, MacBook Air, 8GB–16GB PCs',
    description: 'The golden balance between high-speed generation and strong analytical reasoning. Excels at document summaries, meeting action items, and Q&A.',
  },
  pro: {
    tier: 'pro',
    rank: 3,
    label: 'High Performance / Pro (7B – 8B)',
    badge: '🚀 Deep RAG & Synthesis',
    minRam: '16 GB RAM',
    targetHardware: 'Apple Silicon (M1/M2/M3/M4), dedicated GPUs, 16GB+ RAM PCs',
    description: 'Gold-standard open weights for deep knowledge retrieval, nuanced multi-speaker meeting breakdown, and complex cross-note synthesis.',
  },
  advanced: {
    tier: 'advanced',
    rank: 4,
    label: 'Advanced / Power (14B)',
    badge: '🧠 Maximum Rigor & Depth',
    minRam: '24+ GB RAM',
    targetHardware: 'Workstations, Mac Studio / Pro, 24GB+ Unified Memory / VRAM',
    description: 'Frontier-grade local synthesis with deep contextual awareness and complex multi-step logical deduction across large document archives.',
  },
};

export interface CompatibleModel {
  id: string; // primary Ollama pull tag
  aliases: string[]; // known alternative tags that resolve to this model
  name: string;
  provider: string;
  parameterSize: string;
  downloadSize: string;
  ramRequiredGb: number;
  tier: ModelTier;
  tierRank: number;
  speedRating: 'Fastest' | 'Very Fast' | 'Moderate' | 'Heavy';
  summary: string;
  recommendedFor: string;
  isAppDefault?: boolean;
}

/**
 * Curated catalog of models compatible with DomoNote,
 * strictly ordered from Minimum Tier (1B) to Higher Tiers (14B).
 */
export const COMPATIBLE_MODELS: CompatibleModel[] = [
  // --- TIER 1: MINIMUM / ULTRA-LIGHT (1B - 2B) ---
  {
    id: 'llama3.2:1b',
    aliases: ['llama3.2:1b', 'llama3.2:1b-instruct', 'llama3.2:1b-text'],
    name: 'Llama 3.2 (1B)',
    provider: 'Meta',
    parameterSize: '1.2B',
    downloadSize: '1.3 GB',
    ramRequiredGb: 4,
    tier: 'minimum',
    tierRank: 1,
    speedRating: 'Fastest',
    summary: 'Ultra-lightweight architecture with instantaneous reply speed. Runs smoothly on budget hardware and consumes negligible battery.',
    recommendedFor: 'Entry-level machines, fast note drafting, battery preservation',
  },
  {
    id: 'qwen2.5:1.5b',
    aliases: ['qwen2.5:1.5b', 'qwen2.5:1.5b-instruct'],
    name: 'Qwen 2.5 (1.5B)',
    provider: 'Alibaba',
    parameterSize: '1.5B',
    downloadSize: '1.0 GB',
    ramRequiredGb: 4,
    tier: 'minimum',
    tierRank: 1,
    speedRating: 'Fastest',
    summary: 'Remarkably nimble instruction adherence with multilingual fluency and high token throughput for quick summaries.',
    recommendedFor: 'Lightweight systems, multilingual notes, rapid summaries',
  },
  {
    id: 'gemma2:2b',
    aliases: ['gemma2:2b', 'gemma2:2b-instruct'],
    name: 'Gemma 2 (2B)',
    provider: 'Google',
    parameterSize: '2.6B',
    downloadSize: '1.6 GB',
    ramRequiredGb: 4,
    tier: 'minimum',
    tierRank: 1,
    speedRating: 'Fastest',
    summary: 'Google’s dense architecture offering clean formatting and coherent logical reasoning on machines with limited RAM.',
    recommendedFor: 'Clean note outlines, rapid meeting takeaways',
  },

  // --- TIER 2: BALANCED / STANDARD (3B - 4B) ---
  {
    id: 'llama3.2:3b',
    aliases: ['llama3.2:3b', 'llama3.2:latest', 'llama3.2'],
    name: 'Llama 3.2 (3B)',
    provider: 'Meta',
    parameterSize: '3.2B',
    downloadSize: '2.0 GB',
    ramRequiredGb: 8,
    tier: 'standard',
    tierRank: 2,
    speedRating: 'Very Fast',
    summary: '⭐ Official DomoNote Recommended Model. Outstanding sweet spot of high quality, structured Markdown generation, low memory overhead, and snappy execution.',
    recommendedFor: 'Most users, daily note taking, meeting transcripts, document search',
    isAppDefault: true,
  },
  {
    id: 'qwen2.5:3b',
    aliases: ['qwen2.5:3b', 'qwen2.5:3b-instruct'],
    name: 'Qwen 2.5 (3B)',
    provider: 'Alibaba',
    parameterSize: '3.1B',
    downloadSize: '2.0 GB',
    ramRequiredGb: 8,
    tier: 'standard',
    tierRank: 2,
    speedRating: 'Very Fast',
    summary: 'Exceptional structured tables, JSON extraction, and concise bulleted action item synthesis for meetings and manuals.',
    recommendedFor: 'Structured documentation, tabular data, task checklists',
  },
  {
    id: 'phi3.5:3.8b',
    aliases: ['phi3.5:3.8b', 'phi3.5:latest', 'phi3.5'],
    name: 'Phi 3.5 (3.8B)',
    provider: 'Microsoft',
    parameterSize: '3.8B',
    downloadSize: '2.2 GB',
    ramRequiredGb: 8,
    tier: 'standard',
    tierRank: 2,
    speedRating: 'Very Fast',
    summary: 'Strong multi-step logical chain-of-thought in a compact footprint. Highly effective for technical operation step guides.',
    recommendedFor: 'Step-by-step operation manuals, technical synthesis',
  },

  // --- TIER 3: HIGH PERFORMANCE / PRO (7B - 8B) ---
  {
    id: 'llama3.1:8b',
    aliases: ['llama3.1:8b', 'llama3.1:latest', 'llama3.1'],
    name: 'Llama 3.1 (8B)',
    provider: 'Meta',
    parameterSize: '8.0B',
    downloadSize: '4.7 GB',
    ramRequiredGb: 16,
    tier: 'pro',
    tierRank: 3,
    speedRating: 'Moderate',
    summary: '⭐ Pro Recommendation. The open-weights gold standard. Deep analytical synthesis, robust 128k context reasoning, and nuanced long meeting understanding.',
    recommendedFor: 'Apple Silicon Macs, 16GB+ RAM PCs, comprehensive RAG archives',
  },
  {
    id: 'qwen2.5:7b',
    aliases: ['qwen2.5:7b', 'qwen2.5:7b-instruct', 'qwen2.5-coder:7b'],
    name: 'Qwen 2.5 (7B)',
    provider: 'Alibaba',
    parameterSize: '7.6B',
    downloadSize: '4.5 GB',
    ramRequiredGb: 16,
    tier: 'pro',
    tierRank: 3,
    speedRating: 'Moderate',
    summary: 'State-of-the-art multilingual and technical synthesis with razor-sharp instruction compliance and expansive contextual comprehension.',
    recommendedFor: 'Technical documentation, large PDF analysis, multilingual RAG',
  },
  {
    id: 'mistral:7b',
    aliases: ['mistral:7b', 'mistral:latest', 'mistral'],
    name: 'Mistral (7B)',
    provider: 'Mistral AI',
    parameterSize: '7.2B',
    downloadSize: '4.1 GB',
    ramRequiredGb: 16,
    tier: 'pro',
    tierRank: 3,
    speedRating: 'Moderate',
    summary: 'Crisp prose and proven reliability for executive summaries, speech-to-text refinement, and note consolidation.',
    recommendedFor: 'Executive summaries, high-fidelity transcription polishing',
  },
  {
    id: 'gemma2:9b',
    aliases: ['gemma2:9b', 'gemma2:9b-instruct', 'gemma2:latest'],
    name: 'Gemma 2 (9B)',
    provider: 'Google',
    parameterSize: '9.2B',
    downloadSize: '5.5 GB',
    ramRequiredGb: 16,
    tier: 'pro',
    tierRank: 3,
    speedRating: 'Moderate',
    summary: 'Google’s heavyweight model delivering deep contextual reasoning and sophisticated knowledge base query responses.',
    recommendedFor: 'Complex research synthesis, high-accuracy Q&A',
  },

  // --- TIER 4: ADVANCED / POWER (14B) ---
  {
    id: 'qwen2.5:14b',
    aliases: ['qwen2.5:14b', 'qwen2.5:14b-instruct'],
    name: 'Qwen 2.5 (14B)',
    provider: 'Alibaba',
    parameterSize: '14.7B',
    downloadSize: '9.0 GB',
    ramRequiredGb: 24,
    tier: 'advanced',
    tierRank: 4,
    speedRating: 'Heavy',
    summary: 'Frontier-grade local intelligence with exceptional depth and nuanced reasoning across massive knowledge repositories.',
    recommendedFor: 'High-spec workstations, 24GB+ Unified Memory Apple Silicon, enterprise research',
  },
];

/**
 * System hardware detection profile
 */
export interface SystemHardwareProfile {
  cpuCores: number;
  memoryEstimateGb: number;
  gpuRenderer: string;
  isAppleSilicon: boolean;
  recommendedTier: ModelTier;
  recommendedModelId: string;
  recommendationTitle: string;
  recommendationReason: string;
}

/**
 * Detect client system specifications and determine the optimal model recommendation
 */
export function detectSystemHardware(): SystemHardwareProfile {
  const cpuCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const rawMemory = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 8 : 8;

  let gpuRenderer = '';
  let isAppleSilicon = false;

  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        }
      }
    } catch {
      // ignore
    }
  }

  const lowerGpu = gpuRenderer.toLowerCase();
  if (
    lowerGpu.includes('apple') ||
    lowerGpu.includes('m1') ||
    lowerGpu.includes('m2') ||
    lowerGpu.includes('m3') ||
    lowerGpu.includes('m4') ||
    (typeof navigator !== 'undefined' && /mac/i.test(navigator.platform) && cpuCores >= 8)
  ) {
    isAppleSilicon = true;
  }

  let recommendedTier: ModelTier = 'standard';
  let recommendedModelId = 'llama3.2:3b';
  let recommendationTitle = 'Llama 3.2 (3B) — Balanced Standard';
  let recommendationReason = 'Optimal sweet spot of rapid speed and high accuracy for your setup.';

  if (isAppleSilicon) {
    if (cpuCores >= 10 || rawMemory >= 16) {
      recommendedTier = 'pro';
      recommendedModelId = 'llama3.1:8b';
      recommendationTitle = 'Llama 3.1 (8B) — High Performance Pro';
      recommendationReason =
        'Apple Silicon with high compute detected. 8B parameter models run with near-instant token streaming and top-tier reasoning.';
    } else {
      recommendedTier = 'standard';
      recommendedModelId = 'llama3.2:3b';
      recommendationTitle = 'Llama 3.2 (3B) — Balanced Standard';
      recommendationReason =
        'Apple Silicon detected. Llama 3.2 (3B) delivers lightning-fast token streaming, minimal battery drain, and sharp note synthesis.';
    }
  } else if (rawMemory >= 16 || cpuCores >= 12) {
    recommendedTier = 'pro';
    recommendedModelId = 'llama3.1:8b';
    recommendationTitle = 'Llama 3.1 (8B) — High Performance Pro';
    recommendationReason =
      'High-thread CPU / 16GB+ memory profile detected. Ideal for 8B models with deep cross-document retrieval.';
  } else if (rawMemory <= 4 || cpuCores <= 4) {
    recommendedTier = 'minimum';
    recommendedModelId = 'llama3.2:1b';
    recommendationTitle = 'Llama 3.2 (1B) — Ultra-Lightweight Minimum';
    recommendationReason =
      'Entry hardware profile detected (≤4GB RAM / ≤4 Cores). 1B model guarantees snappy, zero-lag execution.';
  } else {
    recommendedTier = 'standard';
    recommendedModelId = 'llama3.2:3b';
    recommendationTitle = 'Llama 3.2 (3B) — Balanced Standard';
    recommendationReason =
      'Standard hardware profile detected (8GB+ RAM). 3B tier delivers the ideal balance between processing speed and comprehension.';
  }

  return {
    cpuCores,
    memoryEstimateGb: rawMemory,
    gpuRenderer: gpuRenderer || 'Standard Graphics Engine',
    isAppleSilicon,
    recommendedTier,
    recommendedModelId,
    recommendationTitle,
    recommendationReason,
  };
}

/**
 * Check if an installed Ollama model matches any compatible model in our catalog
 */
export function findMatchingCompatibleModel(
  installedName: string
): CompatibleModel | undefined {
  const norm = installedName.trim().toLowerCase();
  // Strip ':latest' if present for base comparison
  const baseName = norm.replace(/:latest$/, '');

  return COMPATIBLE_MODELS.find((m) => {
    if (m.id.toLowerCase() === norm) return true;
    if (m.id.toLowerCase().replace(/:latest$/, '') === baseName) return true;
    return m.aliases.some((alias) => {
      const aliasNorm = alias.toLowerCase();
      return norm === aliasNorm || baseName === aliasNorm.replace(/:latest$/, '');
    });
  });
}

/**
 * Check if a specific compatible model is installed in the local Ollama instance
 */
export function isModelInstalled(
  model: CompatibleModel,
  installedModels: OllamaModel[]
): boolean {
  return getInstalledOllamaModel(model, installedModels) !== undefined;
}

/**
 * Retrieve the matching installed OllamaModel record if available
 */
export function getInstalledOllamaModel(
  model: CompatibleModel,
  installedModels: OllamaModel[]
): OllamaModel | undefined {
  const targetId = model.id.toLowerCase();
  const baseTarget = targetId.replace(/:latest$/, '');

  return installedModels.find((m) => {
    const installedNorm = (m.name || m.model || '').toLowerCase();
    const installedBase = installedNorm.replace(/:latest$/, '');

    if (installedNorm === targetId || installedBase === baseTarget) return true;
    return model.aliases.some((alias) => {
      const aliasNorm = alias.toLowerCase();
      return installedNorm === aliasNorm || installedBase === aliasNorm.replace(/:latest$/, '');
    });
  });
}
