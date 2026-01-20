import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ImageCard from './components/ImageCard';
import { SCENE_OPTIONS, TRANSLATIONS, MAX_FILES } from './constants';
import { Language, ProcessedImage, SceneOption, SceneType } from './types';
import { compressImage, fileToBase64 } from './utils/imageUtils';
import { generateOptimizedImage } from './services/geminiService';
import { Upload, Sparkles, Image as ImageIcon, AlertCircle, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';

// Simple UUID generator if uuid package not available, but using uuidv4 here as placeholder concept
const generateId = () => Math.random().toString(36).substring(2, 15);

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [selectedSceneId, setSelectedSceneId] = useState<SceneType>('auto');
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];
  const selectedScene = SCENE_OPTIONS.find(s => s.id === selectedSceneId) || SCENE_OPTIONS[0];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ProcessedImage[] = [];
    // Explicitly type filesArray as File[] to resolve TS errors regarding 'unknown' type
    const filesArray: File[] = (Array.from(files) as File[]).slice(0, MAX_FILES - images.length);

    for (const file of filesArray) {
      if (!file.type.match('image.*')) continue;
      
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        id: generateId(),
        originalFile: file,
        originalPreviewUrl: previewUrl,
        status: 'idle',
      });
    }

    setImages(prev => [...prev, ...newImages]);
    
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const handleDescriptionUpdate = (id: string, description: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, productDescription: description } : img));
  };

  const handleDownloadAll = async () => {
    const completedImages = images.filter(img => img.status === 'done' && img.processedUrl);
    if (completedImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("tiktok-shop-optimized");

    completedImages.forEach((img, index) => {
      if (img.processedUrl && folder) {
         // processedUrl is "data:image/png;base64,..."
         const base64Data = img.processedUrl.split(',')[1];
         // Clean filename
         const originalName = img.originalFile.name.substring(0, img.originalFile.name.lastIndexOf('.')) || img.originalFile.name;
         const fileName = `optimized-${originalName}-${index + 1}.png`;
         
         folder.file(fileName, base64Data, { base64: true });
      }
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "tiktok-shop-images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Failed to generate zip", error);
    }
  };

  const processSingleImage = async (image: ProcessedImage, scene: SceneOption) => {
    // Update status to compressing/processing
    setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: 'processing', error: undefined } : img));

    try {
      // 1. Compress
      const compressedFile = await compressImage(image.originalFile);
      
      // 2. Convert to Base64
      const base64Data = await fileToBase64(compressedFile);
      
      // 3. Call API
      const resultBase64 = await generateOptimizedImage(
        base64Data, 
        compressedFile.type, 
        scene, 
        image.productDescription
      );
      
      // 4. Update result
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              status: 'done', 
              processedUrl: resultBase64, 
              sceneUsed: scene.id 
            } 
          : img
      ));

    } catch (error: any) {
      console.error("Processing failed for image", image.id, error);
      setImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              status: 'error', 
              error: error.message || 'Unknown error occurred'
            } 
          : img
      ));
    }
  };

  const handleGenerateAll = async () => {
    if (images.length === 0) return;
    setIsGlobalProcessing(true);

    const pendingImages = images.filter(img => img.status === 'idle' || img.status === 'error');
    
    // Process in parallel but could limit concurrency if needed. 
    // For now, let's do all at once as Gemini limits are generous for demos, but strict for production.
    // For safety, let's process 3 at a time.
    const batchSize = 3;
    for (let i = 0; i < pendingImages.length; i += batchSize) {
        const batch = pendingImages.slice(i, i + batchSize);
        await Promise.all(batch.map(img => processSingleImage(img, selectedScene)));
    }

    setIsGlobalProcessing(false);
  };

  const handleRetry = (id: string) => {
    const image = images.find(img => img.id === id);
    if (image) {
      processSingleImage(image, selectedScene);
    }
  };

  const hasCompletedImages = images.some(img => img.status === 'done');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Upload Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center transition-all hover:border-blue-400 hover:shadow-md">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
               <Upload size={32} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{t.uploadTitle}</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">{t.uploadDesc}</p>
            <span className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium shadow-lg shadow-slate-200 group-hover:shadow-xl group-hover:bg-slate-800 transition-all">
              {t.uploadButton}
            </span>
            <p className="text-xs text-slate-400 mt-4">{t.dragDrop}</p>
          </label>
        </section>

        {/* Controls Section */}
        {images.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Scene Selection */}
                <div className="flex-1">
                   <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                     <ImageIcon size={16} />
                     {t.sceneLabel}
                   </label>
                   <div className="relative">
                     <select
                       value={selectedSceneId}
                       onChange={(e) => setSelectedSceneId(e.target.value as SceneType)}
                       disabled={isGlobalProcessing}
                       className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {SCENE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                             {language === 'en' ? opt.labelEn : opt.labelZh}
                          </option>
                        ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                     </div>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">
                     {language === 'zh' ? '当前模式: ' : 'Mode: '}
                     <span className="font-medium text-blue-600">
                        {language === 'en' ? selectedScene.labelEn : selectedScene.labelZh}
                     </span>
                   </p>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-3 flex-wrap sm:flex-nowrap">
                   {/* Download All Button */}
                   {hasCompletedImages && (
                     <button
                       onClick={handleDownloadAll}
                       disabled={isGlobalProcessing}
                       className="px-4 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 border border-transparent"
                     >
                       <Download size={18} />
                       {t.downloadAll}
                     </button>
                   )}

                   <button
                     onClick={handleClearAll}
                     disabled={isGlobalProcessing}
                     className="px-4 py-3 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-red-500 transition-colors text-sm font-medium disabled:opacity-50"
                   >
                     {t.clearAll}
                   </button>
                   <button
                     onClick={handleGenerateAll}
                     disabled={isGlobalProcessing || images.every(i => i.status === 'done')}
                     className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-white font-medium shadow-lg flex items-center justify-center gap-2 transition-all min-w-[160px] ${
                        isGlobalProcessing || images.every(i => i.status === 'done')
                        ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 hover:scale-105 active:scale-95'
                     }`}
                   >
                     {isGlobalProcessing ? (
                       <>
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         {t.processing}
                       </>
                     ) : (
                       <>
                         <Sparkles size={18} />
                         {t.generateBtn}
                       </>
                     )}
                   </button>
                </div>
             </div>
          </section>
        )}

        {/* Gallery Grid */}
        {images.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map(image => (
              <div key={image.id}>
                <ImageCard 
                  image={image} 
                  t={t} 
                  onDelete={handleDelete}
                  onRetry={handleRetry}
                  onUpdateDescription={handleDescriptionUpdate}
                />
              </div>
            ))}
          </section>
        )}

        {/* Empty State / Features */}
        {images.length === 0 && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center opacity-60">
              <div className="p-4">
                 <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500">
                    <Sparkles size={24} />
                 </div>
                 <h3 className="font-semibold text-slate-700">Smart AI Scenes</h3>
                 <p className="text-sm text-slate-500 mt-1">Automatically detects product type or use presets.</p>
              </div>
              <div className="p-4">
                 <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500">
                    <span className="text-lg font-bold">EN</span>
                 </div>
                 <h3 className="font-semibold text-slate-700">English Copywriting</h3>
                 <p className="text-sm text-slate-500 mt-1">Generates localized English marketing text overlay.</p>
              </div>
              <div className="p-4">
                 <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-500">
                    <ImageIcon size={24} />
                 </div>
                 <h3 className="font-semibold text-slate-700">Realistic Results</h3>
                 <p className="text-sm text-slate-500 mt-1">Photo-realistic outputs suitable for Malaysia.</p>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}

export default App;