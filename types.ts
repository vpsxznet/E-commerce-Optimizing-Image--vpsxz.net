export type Language = 'en' | 'zh';

export type SceneType = 'auto' | 'living_room' | 'outdoor' | 'bedroom' | 'kitchen' | 'office';

export interface SceneOption {
  id: SceneType;
  labelEn: string;
  labelZh: string;
  prompt: string;
}

export type ProcessingStatus = 'idle' | 'compressing' | 'uploading' | 'processing' | 'done' | 'error';

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalPreviewUrl: string;
  processedUrl?: string;
  status: ProcessingStatus;
  error?: string;
  sceneUsed?: string;
  productDescription?: string;
}

export interface Translation {
  title: string;
  subtitle: string;
  uploadTitle: string;
  uploadDesc: string;
  uploadButton: string;
  sceneLabel: string;
  autoDetect: string;
  generateBtn: string;
  processing: string;
  clearAll: string;
  resultTitle: string;
  download: string;
  downloadAll: string;
  retry: string;
  original: string;
  optimized: string;
  failed: string;
  delete: string;
  dragDrop: string;
  productDescriptionLabel: string;
  productDescriptionPlaceholder: string;
}