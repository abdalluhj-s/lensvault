export async function createWatermarkedPreview(
  sourceImage: HTMLImageElement | Blob | string,
  maxWidth = 1400,
  watermarkText = 'LENSVAULT PREVIEW'
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      let img: HTMLImageElement;

      if (typeof sourceImage === 'string') {
        img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = sourceImage;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });
      } else if (sourceImage instanceof Blob) {
        img = new Image();
        const url = URL.createObjectURL(sourceImage);
        img.src = url;
        await new Promise((res, rej) => {
          img.onload = () => {
            URL.revokeObjectURL(url);
            res(true);
          };
          img.onerror = rej;
        });
      } else {
        img = sourceImage;
      }

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context initialization failed');

      ctx.drawImage(img, 0, 0, width, height);

      ctx.save();
      const vignette = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.rotate((-30 * Math.PI) / 180);

      const fontSize = Math.max(18, Math.round(width / 32));
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const stepX = fontSize * 14;
      const stepY = fontSize * 4.5;
      const diagonalBound = Math.sqrt(width * width + height * height) * 1.5;

      for (let x = -diagonalBound; x < diagonalBound; x += stepX) {
        for (let y = -diagonalBound; y < diagonalBound; y += stepY) {
          ctx.fillText(watermarkText, x, y);
        }
      }
      ctx.restore();

      ctx.save();
      const barHeight = Math.max(28, Math.round(height * 0.04));
      ctx.fillStyle = 'rgba(9, 9, 11, 0.75)';
      ctx.fillRect(0, height - barHeight, width, barHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${Math.max(11, Math.round(barHeight * 0.45))}px sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `🛡️ LensVault Verified Authentic Camera Capture • Original Unwatermarked Available on Purchase`,
        16,
        height - barHeight / 2
      );
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate watermarked blob'));
        },
        'image/jpeg',
        0.85
      );
    } catch (err) {
      reject(err);
    }
  });
}
