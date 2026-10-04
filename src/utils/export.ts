import { ExportOptions, ExportFormat, ExportResolution, VisualThemeId } from '../types/theme';
import { THEMES, applyThemeToSvg } from '../engine/themes';

/**
 * Sanitizes and generates standardized export filenames.
 * e.g., LoveJaz-Dela-Cruz-Family-Tree-Vintage-4K.png
 *       LoveJaz-Royal-Dynasty-Navy.svg
 */
export function generateExportFilename(
  rawTitle: string,
  themeId: VisualThemeId,
  format: ExportFormat,
  resolution?: ExportResolution
): string {
  const sanitizedTitle = (rawTitle || 'Family-Tree')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50) || 'Family-Tree';

  const capitalizedTheme = themeId.charAt(0).toUpperCase() + themeId.slice(1);

  if (format === 'png') {
    let resSuffix = '1x';
    if (resolution === 4) resSuffix = '4K';
    else if (resolution === 2) resSuffix = '2K';
    return `LoveJaz-${sanitizedTitle}-${capitalizedTheme}-${resSuffix}.png`;
  }

  if (format === 'svg') {
    return `LoveJaz-${sanitizedTitle}-${capitalizedTheme}.svg`;
  }

  return `LoveJaz-${sanitizedTitle}-${capitalizedTheme}.pdf`;
}

/**
 * Programmatically triggers file download in the browser.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  if (a.style) {
    a.style.display = 'none';
  }
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Fallback download mechanism using DataURL string.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  if (a.style) {
    a.style.display = 'none';
  }
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 150);
}

/**
 * Exports family tree SVG element as a standalone, styled vector SVG file.
 */
export function exportToSvg(svgElement: SVGSVGElement, options: ExportOptions): void {
  const theme = THEMES[options.theme] || THEMES.minimalist;
  let themedSvgString = applyThemeToSvg(svgElement, theme, options);

  if (!themedSvgString.startsWith('<?xml')) {
    themedSvgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + themedSvgString;
  }

  const blob = new Blob([themedSvgString], { type: 'image/svg+xml;charset=utf-8' });
  const filename = generateExportFilename(
    options.treeTitle,
    options.theme,
    'svg',
    options.resolution
  );

  triggerBlobDownload(blob, filename);
}

/**
 * Exports family tree as high-resolution raster image up to 4K resolution (4x pixelRatio).
 */
export async function exportToPng(
  svgElement: SVGSVGElement,
  options: ExportOptions
): Promise<void> {
  const theme = THEMES[options.theme] || THEMES.minimalist;
  const themedSvgString = applyThemeToSvg(svgElement, theme, options);

  // Extract base dimensions
  const widthMatch = themedSvgString.match(/width="(\d+)"/);
  const heightMatch = themedSvgString.match(/height="(\d+)"/);
  const baseWidth = widthMatch ? parseInt(widthMatch[1], 10) : 1000;
  const baseHeight = heightMatch ? parseInt(heightMatch[1], 10) : 700;

  const pixelRatio = options.resolution || 1;
  const targetWidth = Math.round(baseWidth * pixelRatio);
  const targetHeight = Math.round(baseHeight * pixelRatio);

  const svgBlob = new Blob([themedSvgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        }

        URL.revokeObjectURL(url);

        const filename = generateExportFilename(
          options.treeTitle,
          options.theme,
          'png',
          options.resolution
        );

        if (typeof canvas.toBlob === 'function') {
          canvas.toBlob((blob) => {
            if (blob) {
              triggerBlobDownload(blob, filename);
              resolve();
            } else {
              const dataUrl = canvas.toDataURL('image/png');
              downloadDataUrl(dataUrl, filename);
              resolve();
            }
          }, 'image/png');
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          downloadDataUrl(dataUrl, filename);
          resolve();
        }
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Opens an optimized print window with @media print landscape CSS formatting.
 */
export function exportToPrintPdf(
  svgElement: SVGSVGElement,
  options: ExportOptions
): void {
  const theme = THEMES[options.theme] || THEMES.minimalist;
  const themedSvgString = applyThemeToSvg(svgElement, theme, options);
  const title = (options.treeTitle || 'LoveJaz Family Pedigree').replace(/[<>&"]/g, '');

  const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page {
      size: landscape;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: ${theme.background};
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      overflow: hidden;
    }
    svg {
      width: 100%;
      height: 100%;
      max-width: 100vw;
      max-height: 100vh;
      object-fit: contain;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${themedSvgString}
</body>
</html>`;

  try {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // Ignore print dialog dismissal
        }
      }, 300);
      return;
    }
  } catch {
    // Popup might be blocked
  }

  // Fallback to hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  if (iframe.contentDocument) {
    iframe.contentDocument.open();
    iframe.contentDocument.write(printHtml);
    iframe.contentDocument.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }, 300);
  }
}
