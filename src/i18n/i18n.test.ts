import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  translations,
  translate,
  interpolate,
  I18nProvider,
  useI18n,
  STORAGE_KEY,
} from './index';
import { LANGUAGES, SupportedLanguage } from '../types/i18n';

// In Node test environment, mock localStorage if not present
const storageStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    storageStore[key] = String(value);
  },
  removeItem: (key: string) => {
    delete storageStore[key];
  },
  clear: () => {
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key];
    }
  },
  key: (index: number) => Object.keys(storageStore)[index] ?? null,
  get length() {
    return Object.keys(storageStore).length;
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

describe('i18n Multilingual Engine', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Language metadata and registry', () => {
    it('defines all 6 supported languages with correct codes and flags', () => {
      const expectedCodes: SupportedLanguage[] = ['en', 'tl', 'ceb', 'ja', 'zh', 'vi'];
      expect(LANGUAGES.map((l) => l.code)).toEqual(expectedCodes);

      LANGUAGES.forEach((lang) => {
        expect(lang.code).toBeTruthy();
        expect(lang.name).toBeTruthy();
        expect(lang.nativeName).toBeTruthy();
        expect(lang.flag).toBeTruthy();
      });
    });

    it('has translation dictionaries for all 6 languages', () => {
      const langCodes: SupportedLanguage[] = ['en', 'tl', 'ceb', 'ja', 'zh', 'vi'];
      langCodes.forEach((code) => {
        expect(translations[code]).toBeDefined();
        expect(typeof translations[code]).toBe('object');
      });
    });
  });

  describe('Translation key completeness', () => {
    const requiredKeys = [
      'appTitle',
      'appSubtitle',
      'newTree',
      'sampleTree',
      'shareLink',
      'exportImage',
      'deployGuide',
      'language',
      'male',
      'female',
      'generation',
      'spouse',
      'addSpouse',
      'addChild',
      'addParents',
      'editProfile',
      'deleteMember',
      'deleteConfirmTitle',
      'deleteConfirmDesc',
      'name',
      'birthYear',
      'age',
      'deceased',
      'deceasedBadge',
      'notes',
      'titleRole',
      'cancel',
      'save',
      'close',
      'zoomIn',
      'zoomOut',
      'resetZoom',
      'fitView',
      'toggleGenerations',
      'undo',
      'redo',
      'theme',
      'themeMinimalist',
      'themeVintage',
      'themeNavy',
      'themeDark',
      'exportTitle',
      'exportFormat',
      'exportResolution',
      'exportTheme',
      'includeTitle',
      'includeGenerations',
      'includeLegend',
      'includeBorder',
      'downloadPng',
      'downloadSvg',
      'printPdf',
      'shareModalTitle',
      'shareModalDesc',
      'copyLink',
      'linkCopied',
      'downloadJson',
      'uploadJson',
      'deployGuideTitle',
      'deployVercel',
      'deployCloudflare',
      'deployGithub',
    ];

    const allLanguages: SupportedLanguage[] = ['en', 'tl', 'ceb', 'ja', 'zh', 'vi'];

    allLanguages.forEach((lang) => {
      it(`language "${lang}" contains all required brief keys`, () => {
        const dict = translations[lang];
        requiredKeys.forEach((key) => {
          expect(dict[key], `Missing key "${key}" in language "${lang}"`).toBeDefined();
          expect(dict[key].length).toBeGreaterThan(0);
        });
      });
    });

    it('all non-English dictionaries cover 100% of keys present in English dictionary', () => {
      const enKeys = Object.keys(translations.en);
      const otherLanguages: SupportedLanguage[] = ['tl', 'ceb', 'ja', 'zh', 'vi'];

      otherLanguages.forEach((lang) => {
        const dictKeys = new Set(Object.keys(translations[lang]));
        enKeys.forEach((key) => {
          expect(dictKeys.has(key), `Key "${key}" present in English but missing in "${lang}"`).toBe(true);
        });
      });
    });
  });

  describe('Pedigree specific translations match specification', () => {
    it('translates "male" accurately with square indicator across all 6 languages', () => {
      expect(translate('en', 'male')).toBe('Male (Square)');
      expect(translate('tl', 'male')).toBe('Lalaki (Kuwadrado)');
      expect(translate('ceb', 'male')).toBe('Lalaki (Kuwadrado)');
      expect(translate('ja', 'male')).toBe('男性（四角）');
      expect(translate('zh', 'male')).toBe('男性（方形）');
      expect(translate('vi', 'male')).toBe('Nam (Hình Vuông)');
    });

    it('translates "female" accurately with circle indicator across all 6 languages', () => {
      expect(translate('en', 'female')).toBe('Female (Circle)');
      expect(translate('tl', 'female')).toBe('Babae (Bilog)');
      expect(translate('ceb', 'female')).toBe('Babaye (Lingin)');
      expect(translate('ja', 'female')).toBe('女性（丸）');
      expect(translate('zh', 'female')).toBe('女性（圆形）');
      expect(translate('vi', 'female')).toBe('Nữ (Hình Tròn)');
    });

    it('translates "generation" across all 6 languages', () => {
      expect(translate('en', 'generation')).toBe('Generation');
      expect(translate('tl', 'generation')).toBe('Henerasyon');
      expect(translate('ceb', 'generation')).toBe('Henerasyon');
      expect(translate('ja', 'generation')).toBe('世代');
      expect(translate('zh', 'generation')).toBe('世代');
      expect(translate('vi', 'generation')).toBe('Thế hệ');
    });

    it('translates "spouse" across all 6 languages', () => {
      expect(translate('en', 'spouse')).toBe('Spouse');
      expect(translate('tl', 'spouse')).toBe('Asawa');
      expect(translate('ceb', 'spouse')).toBe('Bana/Asawa');
      expect(translate('ja', 'spouse')).toBe('配偶者');
      expect(translate('zh', 'spouse')).toBe('配偶');
      expect(translate('vi', 'spouse')).toBe('Bạn đời / Vợ chồng');
    });

    it('translates "+ Add Spouse" across all 6 languages', () => {
      expect(translate('en', 'addSpouse')).toBe('+ Add Spouse');
      expect(translate('tl', 'addSpouse')).toBe('+ Magdagdag ng Asawa');
      expect(translate('ceb', 'addSpouse')).toBe('+ Dugang Asawa');
      expect(translate('ja', 'addSpouse')).toBe('+ 配偶者を追加');
      expect(translate('zh', 'addSpouse')).toBe('+ 添加配偶');
      expect(translate('vi', 'addSpouse')).toBe('+ Thêm bạn đời');
    });

    it('translates "+ Add Child" across all 6 languages', () => {
      expect(translate('en', 'addChild')).toBe('+ Add Child');
      expect(translate('tl', 'addChild')).toBe('+ Magdagdag ng Anak');
      expect(translate('ceb', 'addChild')).toBe('+ Dugang Anak');
      expect(translate('ja', 'addChild')).toBe('+ 子供を追加');
      expect(translate('zh', 'addChild')).toBe('+ 添加子女');
      expect(translate('vi', 'addChild')).toBe('+ Thêm con');
    });

    it('translates "+ Add Parents" across all 6 languages', () => {
      expect(translate('en', 'addParents')).toBe('+ Add Parents');
      expect(translate('tl', 'addParents')).toBe('+ Magdagdag ng Magulang');
      expect(translate('ceb', 'addParents')).toBe('+ Dugang Ginikanan');
      expect(translate('ja', 'addParents')).toBe('+ 両親を追加');
      expect(translate('zh', 'addParents')).toBe('+ 添加父母');
      expect(translate('vi', 'addParents')).toBe('+ Thêm cha mẹ');
    });
  });

  describe('Interpolation and parameter replacement', () => {
    it('interpolates {{param}} in strings', () => {
      const result = interpolate('Hello {{name}}!', { name: 'Jaz' });
      expect(result).toBe('Hello Jaz!');
    });

    it('interpolates {param} in strings', () => {
      const result = interpolate('Hello {name}!', { name: 'Jaz' });
      expect(result).toBe('Hello Jaz!');
    });

    it('interpolates multiple params and numbers', () => {
      const result = interpolate('Generation {{gen}}: {{name}} is {{age}} years old', {
        gen: 2,
        name: 'Maria',
        age: 30,
      });
      expect(result).toBe('Generation 2: Maria is 30 years old');
    });

    it('replaces {{name}} in deleteConfirmDesc for all languages', () => {
      expect(translate('en', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        'Are you sure you want to delete Alex? This action cannot be undone.'
      );
      expect(translate('tl', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        'Sigurado ka bang nais mong burahin si Alex? Hindi na ito maibabalik.'
      );
      expect(translate('ceb', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        'Sigurado ka ba nga gusto nimong papason si Alex? Dili na kini mabalik.'
      );
      expect(translate('ja', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        '本当に Alex を削除しますか？この操作は取り消せません。'
      );
      expect(translate('zh', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        '您确定要删除 Alex 吗？此操作无法撤销。'
      );
      expect(translate('vi', 'deleteConfirmDesc', { name: 'Alex' })).toBe(
        'Bạn có chắc chắn muốn xóa Alex không? Hành động này không thể hoàn tác.'
      );
    });

    it('handles unsupplied parameters gracefully', () => {
      const template = 'Hello {{name}}!';
      expect(interpolate(template)).toBe(template);
      expect(interpolate(template, {})).toBe(template);
    });
  });

  describe('Fallback mechanisms', () => {
    it('falls back to English when a key is missing in another language', () => {
      const originalJaExport = translations.ja['customTestKey'];
      try {
        (translations.en as any)['customTestKey'] = 'Custom English Text';
        delete (translations.ja as any)['customTestKey'];

        const translated = translate('ja', 'customTestKey');
        expect(translated).toBe('Custom English Text');
      } finally {
        delete (translations.en as any)['customTestKey'];
        if (originalJaExport !== undefined) {
          (translations.ja as any)['customTestKey'] = originalJaExport;
        }
      }
    });

    it('returns the key itself if not found in language or English', () => {
      expect(translate('vi', 'non_existent_key_12345')).toBe('non_existent_key_12345');
    });
  });

  describe('I18nProvider and useI18n hook behavior', () => {
    it('provides default English translation without provider', () => {
      expect(translate('en', 'newTree')).toBe('New Tree');
    });

    it('renders with I18nProvider and custom initialLanguage', async () => {
      const { renderToString } = await import('react-dom/server');

      function TestConsumer() {
        const { t, currentLanguage } = useI18n();
        return React.createElement(
          'div',
          { id: 'test-wrapper' },
          React.createElement('span', { id: 'lang' }, currentLanguage),
          React.createElement('span', { id: 'title' }, t('appTitle'))
        );
      }

      const html = renderToString(
        React.createElement(
          I18nProvider,
          { initialLanguage: 'tl' },
          React.createElement(TestConsumer)
        )
      );

      expect(html).toContain('tl');
      expect(html).toContain('LoveJaz - Punongangkan ng Pamilya');
    });

    it('handles STORAGE_KEY and language persistence in localStorage', () => {
      globalThis.localStorage.setItem(STORAGE_KEY, 'vi');
      expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe('vi');

      globalThis.localStorage.setItem(STORAGE_KEY, 'ja');
      expect(globalThis.localStorage.getItem(STORAGE_KEY)).toBe('ja');
    });
  });
});
