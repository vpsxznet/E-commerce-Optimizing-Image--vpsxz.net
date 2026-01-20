import { Language, SceneOption, Translation } from './types';
import { Upload, Home, Sun, Coffee, Monitor, ChefHat, BedDouble } from 'lucide-react';

export const SCENE_OPTIONS: SceneOption[] = [
  { 
    id: 'auto', 
    labelEn: '✨ Auto Detect', 
    labelZh: '✨ 智能判断', 
    prompt: 'Analyze the product and background, determine the most suitable realistic setting for a Malaysian household or lifestyle context.' 
  },
  { 
    id: 'living_room', 
    labelEn: 'Modern Condo Living Room', 
    labelZh: '现代公寓客厅', 
    prompt: 'Place the product in a modern, stylish Malaysian condo living room. Good natural lighting, comfortable atmosphere.' 
  },
  { 
    id: 'outdoor', 
    labelEn: 'Tropical Garden/Outdoor', 
    labelZh: '热带户外/花园', 
    prompt: 'Place the product in a lush tropical garden or outdoor patio setting suitable for Malaysia. Bright sunlight, greenery.' 
  },
  { 
    id: 'bedroom', 
    labelEn: 'Minimalist Bedroom', 
    labelZh: '极简卧室', 
    prompt: 'Place the product in a cozy, minimalist bedroom. Soft lighting, relaxing vibes.' 
  },
  { 
    id: 'kitchen', 
    labelEn: 'Kitchen & Dining', 
    labelZh: '厨房与餐厅', 
    prompt: 'Place the product in a clean, modern kitchen or dining area. Domestic setting.' 
  },
  { 
    id: 'office', 
    labelEn: 'Office/Study Desk', 
    labelZh: '办公桌', 
    prompt: 'Place the product on a neat office desk or study table. Professional yet accessible look.' 
  },
];

export const TRANSLATIONS: Record<Language, Translation> = {
  en: {
    title: 'TikTok Shop MY Image Optimizer',
    subtitle: 'AI-powered enhancement for higher conversion rates',
    uploadTitle: 'Upload Product Images',
    uploadDesc: 'Supports JPG, PNG, WEBP. Max 10 images.',
    uploadButton: 'Select Images',
    sceneLabel: 'Select Scene',
    autoDetect: 'Auto Detect',
    generateBtn: 'Start Generation',
    processing: 'Processing...',
    clearAll: 'Clear All',
    resultTitle: 'Results',
    download: 'Download',
    downloadAll: 'Download All',
    retry: 'Re-roll',
    original: 'Original',
    optimized: 'AI Optimized',
    failed: 'Failed',
    delete: 'Delete',
    dragDrop: 'or drag and drop here',
    productDescriptionLabel: 'Product Name (Optional)',
    productDescriptionPlaceholder: 'e.g. Red Lipstick'
  },
  zh: {
    title: 'TikTok Shop 马来西亚图片优化助手',
    subtitle: 'AI 驱动，提升电商转化率',
    uploadTitle: '上传产品图片',
    uploadDesc: '支持 JPG, PNG, WEBP。最多 10 张。',
    uploadButton: '选择图片',
    sceneLabel: '选择场景',
    autoDetect: '智能判断',
    generateBtn: '开始生成',
    processing: '处理中...',
    clearAll: '清空列表',
    resultTitle: '处理结果',
    download: '下载',
    downloadAll: '一键下载',
    retry: '重新生成',
    original: '原图',
    optimized: 'AI 优化图',
    failed: '处理失败',
    delete: '删除',
    dragDrop: '或拖拽图片到此处',
    productDescriptionLabel: '产品名称 (选填)',
    productDescriptionPlaceholder: '例如：红色口红'
  }
};

export const MAX_FILES = 10;
export const MAX_SIZE_MB = 10;