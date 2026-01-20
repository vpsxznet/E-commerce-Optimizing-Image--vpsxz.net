import React, { useState } from 'react';
import { ProcessedImage, Translation } from '../types';
import { Download, RefreshCw, Trash2, Maximize2, XCircle, ArrowRight, Tag } from 'lucide-react';

interface ImageCardProps {
  image: ProcessedImage;
  t: Translation;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, t, onDelete, onRetry, onUpdateDescription }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  // Helper to trigger download
  const handleDownload = () => {
    if (!image.processedUrl) return;
    const link = document.createElement('a');
    link.href = image.processedUrl;
    link.download = `tiktok-opt-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isEditable = image.status === 'idle' || image.status === 'error';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Image Display Area */}
      <div className="relative aspect-square bg-slate-100 group">
        
        {image.status === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-slate-600 animate-pulse">{t.processing}</p>
          </div>
        )}

        {image.status === 'error' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4 text-center">
             <XCircle className="w-10 h-10 text-red-500 mb-2" />
             <p className="text-sm font-medium text-red-700">{t.failed}</p>
             <p className="text-xs text-red-500 mt-1 line-clamp-2">{image.error}</p>
             <button 
               onClick={() => onRetry(image.id)}
               className="mt-3 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs rounded-lg hover:bg-red-50 font-medium"
             >
               {t.retry}
             </button>
           </div>
        )}

        {/* The Image Itself */}
        {image.status === 'done' && image.processedUrl ? (
             <img 
               src={showOriginal ? image.originalPreviewUrl : image.processedUrl} 
               alt="Product" 
               className="w-full h-full object-cover transition-opacity duration-300"
             />
        ) : (
          // If not done (idle/compressing/processing/error w/o processedUrl), show original
          <img 
            src={image.originalPreviewUrl} 
            alt="Original Product" 
            className={`w-full h-full object-cover ${image.status === 'processing' ? 'opacity-50' : ''}`}
          />
        )}
        
        {/* Toggle Button for Done State */}
        {image.status === 'done' && (
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-md hover:bg-black/90 transition-colors cursor-pointer select-none z-20"
          >
            {showOriginal ? t.original : t.optimized}
          </button>
        )}
        
         {/* Delete Button (Always visible on hover) */}
        <button 
          onClick={() => onDelete(image.id)}
          className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-500 rounded-full hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title={t.delete}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Info & Action Area */}
      <div className="p-3 flex-1 flex flex-col gap-3">
         {/* Top Info Row */}
         <div>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {image.status === 'done' ? (image.sceneUsed === 'auto' ? 'Auto Detected' : 'Manual Scene') : 'Pending'}
                </span>
                {image.status === 'done' && (
                   <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                     Ready
                   </span>
                )}
            </div>
            
             {/* Filename */}
            <p className="text-xs text-slate-400 mt-1 truncate" title={image.originalFile.name}>
              {image.originalFile.name}
            </p>
         </div>

         {/* Product Description Input */}
         <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-slate-400">
               <Tag size={12} />
            </div>
            <input 
              type="text" 
              value={image.productDescription || ''}
              onChange={(e) => onUpdateDescription(image.id, e.target.value)}
              disabled={!isEditable}
              placeholder={t.productDescriptionPlaceholder}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 placeholder:text-slate-400"
            />
         </div>

         {/* Action Buttons (Only when done) */}
         {image.status === 'done' && (
           <div className="flex gap-2 mt-auto">
              <button 
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-white text-xs font-medium py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Download size={14} />
                {t.download}
              </button>
              <button 
                onClick={() => onRetry(image.id)}
                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                title={t.retry}
              >
                <RefreshCw size={14} />
              </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default ImageCard;
