import React, { useState, useEffect } from 'react';

interface CrystalBeadProps {
  colorHex: string;
  name: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

// 全局 Base64 圖片快取，避免重複渲染
const beadImageCache = new Map<string, string>();

// 預加載模板圖片
let templateImage: HTMLImageElement | null = null;
const loadTemplate = (): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (templateImage && templateImage.complete) {
      resolve(templateImage);
      return;
    }
    const img = new Image();
    img.src = '/assets/crystals/template.png';
    img.onload = () => {
      templateImage = img;
      resolve(img);
    };
    img.onerror = (e) => reject(e);
  });
};

export const CrystalBead: React.FC<CrystalBeadProps> = ({
  colorHex,
  name,
  size = 600,
  style,
  className,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    const cacheKey = `${colorHex}-${size}`;
    if (beadImageCache.has(cacheKey)) {
      setImageSrc(beadImageCache.get(cacheKey) || '');
      return;
    }

    let isMounted = true;

    loadTemplate()
      .then((img) => {
        if (!isMounted) return;

        // 建立離屏 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. 繪製原始高光與陰影模板
        ctx.drawImage(img, 0, 0);

        // 2. 進行圓圈剪裁 (僅對水晶球主體進行染色，保留背景純白與底部陰影)
        ctx.save();
        ctx.beginPath();
        // 模板中水晶珠中心在 (300, 300)，半徑大約是 206 像素
        ctx.arc(300, 300, 206, 0, Math.PI * 2);
        ctx.clip();

        // 3. 使用 'color' 混合模式將色調染上去，保留明暗細節 (Luminosity)
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, 600, 600);

        // 4. 使用 'multiply' 混合模式加深顏色飽和度
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = colorHex;
        ctx.globalAlpha = 0.35; // 35% 的色彩濃度疊加
        ctx.fillRect(0, 0, 600, 600);
        ctx.globalAlpha = 1.0;

        // 5. 使用 'screen' 模式重新疊加高光，增強光源反射質感
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.15; // 15% 亮度亮點
        ctx.drawImage(img, 0, 0);
        ctx.globalAlpha = 1.0;

        ctx.restore();

        // 導出 Base64
        const dataUrl = canvas.toDataURL('image/png');
        beadImageCache.set(cacheKey, dataUrl);
        setImageSrc(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate colored crystal bead:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [colorHex, size]);

  // 加載中時顯示一個優雅的極簡圓形骨架屏
  if (!imageSrc) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#fafafa',
          border: '1.5px solid var(--border-light)',
          display: 'inline-block',
          ...style,
        }}
        className={className}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={name}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...style,
      }}
      className={className}
    />
  );
};
