import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Rocket,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  Server,
  Cloud,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../i18n';

export type DeployTabId = 'vercel' | 'cloudflare' | 'github' | 'customDomain';

export interface DeployStep {
  stepNumber: number;
  title: string;
  description: string;
  command?: string;
}

export interface DeployProviderConfig {
  id: DeployTabId;
  name: string;
  badge?: string;
  title: string;
  description: string;
  steps: DeployStep[];
}

export const DEPLOY_PROVIDERS: Record<DeployTabId, DeployProviderConfig> = {
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    badge: 'Recommended',
    title: 'Deploy to Vercel in 30 Seconds',
    description:
      'The fastest, most seamless way to deploy LoveJaz globally with zero configuration, free automated SSL, and ultra-fast edge CDN delivery.',
    steps: [
      {
        stepNumber: 1,
        title: 'Push your repository to GitHub',
        description: 'Initialize git if needed, add your remote repository, and push the project code.',
        command:
          'git remote add origin https://github.com/your-username/lovejaz.git\ngit branch -M main\ngit push -u origin main',
      },
      {
        stepNumber: 2,
        title: 'Import Project on Vercel',
        description:
          'Go to vercel.com, log in with GitHub, click "Add New... > Project", and select your lovejaz repository.',
      },
      {
        stepNumber: 3,
        title: 'Automatic Zero-Config Build',
        description:
          'Vercel automatically detects Vite. Build command is "npm run build" and output directory is "dist". Click "Deploy".',
      },
      {
        stepNumber: 4,
        title: 'Live Worldwide with Global Edge CDN',
        description:
          'Your family pedigree tree is now live at https://your-tree.vercel.app with instant 100% free global distribution and automatic preview deployments on every git commit.',
      },
    ],
  },
  cloudflare: {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    badge: 'Unlimited Bandwidth',
    title: 'Deploy to Cloudflare Pages',
    description:
      'Benefit from Cloudflare’s 300+ worldwide edge locations, completely free with unlimited bandwidth and zero egress fees.',
    steps: [
      {
        stepNumber: 1,
        title: 'Connect GitHub in Cloudflare Dashboard',
        description:
          'Navigate to Cloudflare Dashboard > Workers & Pages > Create Application > Pages > Connect to Git, and authorize your repository.',
      },
      {
        stepNumber: 2,
        title: 'Set Vite Build Settings',
        description: 'Configure your build settings in the Cloudflare deployment prompt:',
        command:
          '# Framework preset: Vite\n# Build command: npm run build\n# Build output directory: dist',
      },
      {
        stepNumber: 3,
        title: 'Deploy Worldwide Instantly',
        description:
          'Click "Save and Deploy". Cloudflare builds and publishes your static assets in under 60 seconds with DDoS mitigation and lightning-fast DNS.',
      },
    ],
  },
  github: {
    id: 'github',
    name: 'GitHub Pages',
    badge: 'Pure Git Native',
    title: 'Host Directly on GitHub Pages',
    description:
      'Keep everything in a single place directly on your GitHub repository with zero third-party accounts.',
    steps: [
      {
        stepNumber: 1,
        title: 'Build the Production Bundle',
        description: 'Compile the optimized static bundle into the dist/ directory:',
        command: 'npm run build',
      },
      {
        stepNumber: 2,
        title: 'Deploy via gh-pages or GitHub Actions',
        description:
          'Push the dist folder to the "gh-pages" branch or enable GitHub Pages in your repository Settings > Pages > Source > GitHub Actions.',
        command: 'npx gh-pages -d dist',
      },
      {
        stepNumber: 3,
        title: 'Accessible at your github.io domain',
        description:
          'Your pedigree tree will be served immediately from https://your-username.github.io/lovejaz/.',
      },
    ],
  },
  customDomain: {
    id: 'customDomain',
    name: 'Custom Domain & Zero Cost',
    badge: '100% Free Forever',
    title: 'Custom Domains & Why LoveJaz is 100% Free Forever',
    description:
      'Connect your own family domain (e.g. tree.ourfamily.com) or use free cloud domains at exactly $0 cost.',
    steps: [
      {
        stepNumber: 1,
        title: 'Add Custom Domain in Provider Settings',
        description:
          'In Vercel or Cloudflare Pages, open Settings > Domains, and enter your custom domain (e.g. family.delacruz.ph or tree.myfamily.org).',
      },
      {
        stepNumber: 2,
        title: 'Configure CNAME DNS Record',
        description:
          'At your domain registrar (GoDaddy, Namecheap, Google Domains, Cloudflare DNS), add the required CNAME record:',
        command:
          'Type:  CNAME\nName:  tree (or @ for root)\nValue: cname.vercel-dns.com (or your provider target)',
      },
      {
        stepNumber: 3,
        title: 'Automatic Free SSL / HTTPS Certificate',
        description:
          'Your provider automatically issues and auto-renews a free Let’s Encrypt SSL certificate within a few minutes.',
      },
    ],
  },
};

export interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: DeployTabId;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'vercel',
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<DeployTabId>(initialTab);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCopiedIndex(null);
    }
  }, [isOpen, initialTab]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleCopyCommand = async (command: string, index: number) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = command;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  };

  const activeProvider = DEPLOY_PROVIDERS[activeTab] || DEPLOY_PROVIDERS.vercel;

  return (
    <div
      data-testid="deploy-guide-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-guide-title"
        data-testid="deploy-guide-modal"
        className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="deploy-guide-title"
                className="text-lg font-bold text-white tracking-tight flex items-center gap-2"
              >
                {t('deployGuideTitle') || 'Free Global Deployment Guide'}
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Free Forever
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Deploy your family tree in under 60 seconds with zero server fees, global edge CDN, and automatic SSL.
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="deploy-guide-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-6 pt-4 pb-2 border-b border-slate-800 bg-slate-950/40">
          {(
            [
              { id: 'vercel', label: 'Vercel', badge: 'Recommended', testId: 'deploy-tab-vercel' },
              { id: 'cloudflare', label: 'Cloudflare Pages', badge: 'Unlimited Bandwidth', testId: 'deploy-tab-cloudflare' },
              { id: 'github', label: 'GitHub Pages', badge: 'Pure Git', testId: 'deploy-tab-github' },
              { id: 'customDomain', label: 'Custom Domain & Zero-Cost', badge: '$0 Forever', testId: 'deploy-tab-custom-domain' },
            ] as const
          ).map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={tab.testId}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-200 border-sky-500/40 shadow-sm'
                    : 'bg-slate-800/40 text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-sky-400/30 text-sky-100'
                        : 'bg-slate-700/60 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Provider Overview Card */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">{activeProvider.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {activeProvider.description}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Server Costs</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Step-by-Step Walkthrough
            </h4>

            <div className="space-y-3">
              {activeProvider.steps.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700/70 transition-all space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1 space-y-1">
                      <h5 className="text-xs font-bold text-white">{step.title}</h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {step.command && (
                    <div
                      data-testid="deploy-code-block"
                      className="relative mt-2 ml-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs text-sky-300"
                    >
                      <pre className="p-3 overflow-x-auto text-[11px] leading-5 whitespace-pre">
                        {step.command}
                      </pre>
                      <button
                        type="button"
                        data-testid="deploy-copy-btn"
                        onClick={() => handleCopyCommand(step.command!, idx)}
                        className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-sans font-semibold text-slate-200 border border-slate-700 transition-colors shadow-sm"
                        aria-label="Copy command snippet"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Zero-Cost Technical Architecture Breakdown */}
          <div
            data-testid="zero-cost-breakdown"
            className="p-4 rounded-xl bg-gradient-to-r from-sky-950/30 via-slate-900 to-indigo-950/30 border border-sky-900/40 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Why LoveJaz Is 100% Free Forever
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                  <Server className="w-3.5 h-3.5" />
                  <span>No Database Hosting</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  All family records are compressed directly into URL hashes and client localStorage. No costly PostgreSQL or MongoDB instances to pay for.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Static Global CDN</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Pure static HTML, JS, and SVG assets are cached globally across 300+ edge locations with unlimited free bandwidth on Vercel and Cloudflare.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Zero Maintenance</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  No server patching, no database migrations, no monthly subscription renewals. Share your tree with confidence for decades to come.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Built for families worldwide • Open source & private
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 transition-all"
          >
            {t('close') || 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployGuideModal;
