import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Header } from './Header';
import { ShareModal } from './ShareModal';
import { DeployGuideModal, DEPLOY_PROVIDERS } from './DeployGuideModal';
import { I18nProvider } from '../i18n';
import { getSampleFamilyTree } from '../utils/sampleData';
import { encodeTreeToUrl } from '../utils/share';

describe('Header Component Rendering & Actions', () => {
  const sampleTree = getSampleFamilyTree();

  it('renders brand emblem and name LoveJaz', () => {
    const html = renderToString(<Header />);
    expect(html).toContain('data-testid="header-brand"');
    expect(html).toContain('LoveJaz');
    expect(html).toContain('data-testid="header-tree-logo"');
  });

  it('renders tree title and subtitle inputs with default values', () => {
    const html = renderToString(
      <Header
        title="My Family Pedigree"
        subtitle="Heritage and line of descent"
      />
    );
    expect(html).toContain('data-testid="header-title-input"');
    expect(html).toContain('value="My Family Pedigree"');
    expect(html).toContain('data-testid="header-subtitle-input"');
    expect(html).toContain('value="Heritage and line of descent"');
  });

  it('renders tree title and subtitle from tree prop if provided', () => {
    const html = renderToString(<Header tree={sampleTree} />);
    expect(html).toContain('data-testid="header-title-input"');
    expect(html).toContain('value="The Dela Cruz &amp; Santos Heritage"');
    expect(html).toContain('data-testid="header-subtitle-input"');
    expect(html).toContain('value="Three Generations of Strength, Heritage &amp; Family Legacy"');
  });

  it('falls back to default title and subtitle when no props provided', () => {
    const html = renderToString(<Header />);
    expect(html).toContain('data-testid="header-title-input"');
    expect(html).toContain('value="My Family Pedigree"');
    expect(html).toContain('data-testid="header-subtitle-input"');
    expect(html).toContain('value="Heritage &amp; Line of Descent"');
  });

  it('accepts and applies custom className', () => {
    const html = renderToString(<Header className="custom-header-class" />);
    expect(html).toContain('custom-header-class');
  });

  it('renders all required action buttons', () => {
    const html = renderToString(
      <Header
        tree={sampleTree}
        onLoadSampleTree={vi.fn()}
        onNewTree={vi.fn()}
        onImportJson={vi.fn()}
        onExportJson={vi.fn()}
        onOpenShare={vi.fn()}
        onOpenExport={vi.fn()}
        onOpenDeployGuide={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="header-sample-tree-btn"');
    expect(html).toContain('data-testid="header-new-tree-btn"');
    expect(html).toContain('data-testid="header-import-json-btn"');
    expect(html).toContain('data-testid="header-export-json-btn"');
    expect(html).toContain('data-testid="header-share-btn"');
    expect(html).toContain('data-testid="header-export-image-btn"');
    expect(html).toContain('data-testid="header-deploy-guide-btn"');
    expect(html).toContain('data-testid="header-file-input"');
  });

  it('renders 6-language switcher button with current language flag', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="en">
        <Header />
      </I18nProvider>
    );

    expect(html).toContain('data-testid="header-language-selector"');
    expect(html).toContain('data-testid="header-language-btn"');
    expect(html).toContain('🇺🇸');
  });

  it('renders translated button labels in Japanese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ja">
        <Header />
      </I18nProvider>
    );

    expect(html).toContain('新規家系図'); // newTree
    expect(html).toContain('サンプル家系図'); // sampleTree
    expect(html).toContain('リンクを共有'); // shareLink
    expect(html).toContain('エクスポート'); // exportImage
    expect(html).toContain('デプロイ手順'); // deployGuide
  });

  it('renders translated button labels in Tagalog when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="tl">
        <Header />
      </I18nProvider>
    );

    expect(html).toContain('Bagong Puno'); // newTree
    expect(html).toContain('Sampol na Puno'); // sampleTree
    expect(html).toContain('Ibahagi ang Link'); // shareLink
    expect(html).toContain('Gabay sa Pag-deploy'); // deployGuide
  });

  it('renders translated button labels in Chinese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="zh">
        <Header />
      </I18nProvider>
    );

    expect(html).toContain('新建谱系'); // newTree
    expect(html).toContain('示例家谱'); // sampleTree
    expect(html).toContain('分享链接'); // shareLink
    expect(html).toContain('部署指南'); // deployGuide
  });
});

describe('ShareModal Component Rendering & Controls', () => {
  const sampleTree = getSampleFamilyTree();

  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <ShareModal
        isOpen={false}
        tree={sampleTree}
        onClose={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders modal dialog when isOpen is true with accessibility attributes', () => {
    const html = renderToString(
      <ShareModal
        isOpen={true}
        tree={sampleTree}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="share-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="share-close-btn"');
    expect(html).toContain('data-testid="share-modal-backdrop"');
  });

  it('displays generated share link with tree hash and one-click copy button', () => {
    const expectedUrl = encodeTreeToUrl(sampleTree);
    const html = renderToString(
      <ShareModal
        isOpen={true}
        tree={sampleTree}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="share-url-input"');
    expect(html).toContain(expectedUrl);
    expect(html).toContain('data-testid="share-copy-btn"');
  });

  it('renders serverless zero-cost privacy explainer note', () => {
    const html = renderToString(
      <ShareModal
        isOpen={true}
        tree={sampleTree}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="share-privacy-note"');
    // Explains that data stays in URL hash, zero server storage
    expect(html).toMatch(/serverless|private|zero-cost|database|URL/i);
  });

  it('renders backup and restore JSON file controls', () => {
    const html = renderToString(
      <ShareModal
        isOpen={true}
        tree={sampleTree}
        onClose={vi.fn()}
        onDownloadJson={vi.fn()}
        onImportJson={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="share-download-json-btn"');
    expect(html).toContain('data-testid="share-upload-json-btn"');
    expect(html).toContain('data-testid="share-file-input"');
  });

  it('renders localized modal text in Vietnamese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="vi">
        <ShareModal
          isOpen={true}
          tree={sampleTree}
          onClose={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('Chia sẻ cây phả hệ'); // shareModalTitle
    expect(html).toContain('Sao chép liên kết'); // copyLink
    expect(html).toContain('Tải tệp sao lưu (JSON)'); // downloadJson
    expect(html).toContain('Khôi phục từ JSON'); // uploadJson
  });

  it('renders localized modal text in Chinese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="zh">
        <ShareModal
          isOpen={true}
          tree={sampleTree}
          onClose={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('分享家谱'); // shareModalTitle
    expect(html).toContain('复制链接'); // copyLink
    expect(html).toContain('下载备份文件 (JSON)'); // downloadJson
    expect(html).toContain('从 JSON 恢复'); // uploadJson
  });
});

describe('DeployGuideModal Component Rendering & Providers', () => {
  it('renders nothing when isOpen is false', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders modal dialog when isOpen is true with accessibility attributes', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="deploy-guide-modal"');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('data-testid="deploy-guide-close-btn"');
    expect(html).toContain('data-testid="deploy-guide-backdrop"');
  });

  it('renders tabs for all 4 deployment sections', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="deploy-tab-vercel"');
    expect(html).toContain('data-testid="deploy-tab-cloudflare"');
    expect(html).toContain('data-testid="deploy-tab-github"');
    expect(html).toContain('data-testid="deploy-tab-custom-domain"');
  });

  it('renders Vercel deployment instructions with copyable code blocks by default', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
        initialTab="vercel"
      />
    );

    expect(html).toContain('Vercel');
    expect(html).toContain('data-testid="deploy-code-block"');
    expect(html).toContain('data-testid="deploy-copy-btn"');
    expect(html).toContain('git push');
  });

  it('renders Cloudflare Pages instructions when initialTab is cloudflare', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
        initialTab="cloudflare"
      />
    );

    expect(html).toContain('Cloudflare Pages');
    expect(html).toContain('npm run build');
    expect(html).toContain('dist');
  });

  it('renders GitHub Pages instructions when initialTab is github', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
        initialTab="github"
      />
    );

    expect(html).toContain('GitHub Pages');
    expect(html).toContain('gh-pages');
  });

  it('renders custom domain and zero-cost explainer when initialTab is customDomain', () => {
    const html = renderToString(
      <DeployGuideModal
        isOpen={true}
        onClose={vi.fn()}
        initialTab="customDomain"
      />
    );

    expect(html).toContain('Custom Domain');
    expect(html).toMatch(/CNAME|DNS|100% Free Forever/i);
    expect(html).toContain('data-testid="zero-cost-breakdown"');
  });

  it('exposes DEPLOY_PROVIDERS configuration with valid provider metadata', () => {
    expect(DEPLOY_PROVIDERS).toBeDefined();
    expect(DEPLOY_PROVIDERS.vercel).toBeDefined();
    expect(DEPLOY_PROVIDERS.cloudflare).toBeDefined();
    expect(DEPLOY_PROVIDERS.github).toBeDefined();
    expect(DEPLOY_PROVIDERS.customDomain).toBeDefined();

    expect(DEPLOY_PROVIDERS.vercel.name).toBe('Vercel');
    expect(DEPLOY_PROVIDERS.vercel.badge).toBe('Recommended');
    expect(DEPLOY_PROVIDERS.vercel.steps.length).toBeGreaterThan(0);
    expect(DEPLOY_PROVIDERS.cloudflare.steps.length).toBeGreaterThan(0);
    expect(DEPLOY_PROVIDERS.github.steps.length).toBeGreaterThan(0);
    expect(DEPLOY_PROVIDERS.customDomain.steps.length).toBeGreaterThan(0);
  });

  it('renders localized modal text in Bisaya when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ceb">
        <DeployGuideModal
          isOpen={true}
          onClose={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('Libre nga Giya sa Pag-deploy sa Kalibutan'); // deployGuideTitle
  });

  it('renders localized modal text in Japanese when wrapped in I18nProvider', () => {
    const html = renderToString(
      <I18nProvider initialLanguage="ja">
        <DeployGuideModal
          isOpen={true}
          onClose={vi.fn()}
        />
      </I18nProvider>
    );

    expect(html).toContain('無料グローバル公開・デプロイ手順'); // deployGuideTitle
  });
});
