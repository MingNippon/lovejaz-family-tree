import LZString from 'lz-string';
import { FamilyTreeData } from '../types/family';

// Interop helper to support ESM / CommonJS bundler nuances
const compressUri =
  LZString?.compressToEncodedURIComponent ??
  (LZString as unknown as { default?: typeof LZString })?.default?.compressToEncodedURIComponent;

const decompressUri =
  LZString?.decompressFromEncodedURIComponent ??
  (LZString as unknown as { default?: typeof LZString })?.default?.decompressFromEncodedURIComponent;

/**
 * Encodes a FamilyTreeData structure into an lz-string compressed URL hash string.
 * Uses window.location when available in a browser environment, or falls back to a clean full URL.
 */
export function encodeTreeToUrl(tree: FamilyTreeData): string {
  const json = JSON.stringify(tree);
  const compressed = compressUri ? compressUri(json) : LZString.compressToEncodedURIComponent(json);

  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    const pathname = window.location.pathname || '';
    return `${window.location.origin}${pathname}#tree=${compressed}`;
  }

  return `https://lovejaz.app/#tree=${compressed}`;
}

/**
 * Decodes a FamilyTreeData structure from the current URL hash or an explicitly provided hash / URL string.
 * Returns null if the hash is missing, malformed, or fails validation.
 */
export function decodeTreeFromUrl(hash?: string): FamilyTreeData | null {
  try {
    let target = hash;
    if (target === undefined && typeof window !== 'undefined' && window.location) {
      target = window.location.hash || window.location.href;
    }

    if (!target) return null;

    let compressed = '';
    if (target.includes('#tree=')) {
      compressed = target.split('#tree=')[1];
    } else if (target.includes('tree=')) {
      compressed = target.split('tree=')[1];
    } else if (target.startsWith('#')) {
      compressed = target.slice(1);
    } else {
      compressed = target;
    }

    // Strip any trailing hash or query params if present (e.g. #tree=XYZ&theme=dark)
    if (compressed.includes('&')) {
      compressed = compressed.split('&')[0];
    }

    if (!compressed) return null;

    const decompressFn = decompressUri ?? LZString.decompressFromEncodedURIComponent;
    const json = decompressFn(compressed);
    if (!json) return null;

    const data = JSON.parse(json);
    if (
      !data ||
      typeof data !== 'object' ||
      typeof data.title !== 'string' ||
      typeof data.rootPersonId !== 'string' ||
      !data.persons ||
      typeof data.persons !== 'object' ||
      !data.unions ||
      typeof data.unions !== 'object'
    ) {
      return null;
    }

    return data as FamilyTreeData;
  } catch (err) {
    console.error('Failed to parse tree from URL', err);
    return null;
  }
}

/**
 * Copies the compressed share URL of the family tree to the user's clipboard.
 * Gracefully falls back to execCommand('copy') in non-navigator.clipboard environments.
 */
export async function copyShareUrlToClipboard(tree: FamilyTreeData): Promise<boolean> {
  const url = encodeTreeToUrl(tree);

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(url);
      return true;
    }

    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }

    return false;
  } catch (err) {
    console.error('Failed to copy share URL to clipboard', err);
    return false;
  }
}
