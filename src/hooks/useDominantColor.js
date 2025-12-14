import { useState, useEffect, useRef } from 'react';

/**
 * Extracts the dominant color from an image URL
 * Uses canvas sampling to find the most prominent color,
 * then creates a darker tint for border use
 */
const useDominantColor = (imageUrl) => {
  const [dominantColor, setDominantColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const processedRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || processedRef.current === imageUrl) return;

    const extractColor = async () => {
      setIsLoading(true);
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        // Create a small canvas for sampling (8x8 is enough for dominant color)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const sampleSize = 8;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        // Draw scaled image
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;

        // Build color buckets to find dominant color
        // Using reduced precision for better grouping (dividing by 32 = 8 levels per channel)
        const colorBuckets = {};
        let maxCount = 0;
        let dominantBucket = null;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip very dark or very light pixels (likely background)
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 235) continue;

          // Reduce precision for bucketing
          const bucketR = Math.floor(r / 32) * 32;
          const bucketG = Math.floor(g / 32) * 32;
          const bucketB = Math.floor(b / 32) * 32;
          const bucketKey = `${bucketR},${bucketG},${bucketB}`;

          if (!colorBuckets[bucketKey]) {
            colorBuckets[bucketKey] = { count: 0, r: 0, g: 0, b: 0 };
          }
          
          colorBuckets[bucketKey].count++;
          colorBuckets[bucketKey].r += r;
          colorBuckets[bucketKey].g += g;
          colorBuckets[bucketKey].b += b;

          if (colorBuckets[bucketKey].count > maxCount) {
            maxCount = colorBuckets[bucketKey].count;
            dominantBucket = colorBuckets[bucketKey];
          }
        }

        if (dominantBucket && maxCount > 0) {
          // Calculate average color for the dominant bucket
          const avgR = Math.round(dominantBucket.r / maxCount);
          const avgG = Math.round(dominantBucket.g / maxCount);
          const avgB = Math.round(dominantBucket.b / maxCount);

          // Create a darker tint for border (reduce brightness by 30-40%)
          const darkenFactor = 0.55;
          const borderR = Math.round(avgR * darkenFactor);
          const borderG = Math.round(avgG * darkenFactor);
          const borderB = Math.round(avgB * darkenFactor);

          setDominantColor(`rgb(${avgR}, ${avgG}, ${avgB})`);
          setBorderColor(`rgb(${borderR}, ${borderG}, ${borderB})`);
        } else {
          // Fallback to default
          setDominantColor(null);
          setBorderColor(null);
        }

        processedRef.current = imageUrl;
      } catch (error) {
        console.warn('Failed to extract color from image:', error);
        setDominantColor(null);
        setBorderColor(null);
      } finally {
        setIsLoading(false);
      }
    };

    extractColor();
  }, [imageUrl]);

  return { dominantColor, borderColor, isLoading };
};

export default useDominantColor;



