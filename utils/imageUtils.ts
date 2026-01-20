export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64 string'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const compressImage = async (file: File, maxWidth = 1536, quality = 0.8): Promise<File> => {
  if (file.size < 1024 * 1024 * 1) { // If less than 1MB, don't compress aggressively
     return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg', // Force convert to jpeg for better compression
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (error) => reject(error);
  });
};
