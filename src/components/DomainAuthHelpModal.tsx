import React, { useState } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { ShieldAlert, Copy, Check, ExternalLink, X, CheckCircle2 } from 'lucide-react';

export const DomainAuthHelpModal: React.FC = () => {
  const { showDomainHelp, setShowDomainHelp } = useChallenge();
  const [copied, setCopied] = useState(false);

  if (!showDomainHelp) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDomain).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-sm bg-[#FAF7F2] dark:bg-[#1C151B] rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] dark:border-[#382833] space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-2 border-b border-[#E8DFC8] dark:border-[#2D1F27]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2C221E] dark:text-[#F5EBE6]">
                Domínio Não Autorizado no Google
              </h3>
              <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890]">
                auth/unauthorized-domain
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDomainHelp(false)}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#7A6A60] dark:text-[#A89890]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#FAF0E6] dark:bg-[#251820] border border-[#E8DFC8] dark:border-[#3E2533] rounded-2xl p-3 text-xs text-[#5A4940] dark:text-[#D5C6BF] space-y-1.5">
          <p className="font-bold text-[#2C221E] dark:text-[#F5EBE6] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Seus dados continuam 100% salvos!
          </p>
          <p className="text-[11px] leading-relaxed">
            Seus depósitos e configurações estão salvos no seu aparelho e sincronizando no banco de dados.
            O login Google é apenas para vincular seu perfil oficial.
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <p className="font-bold text-[#2C221E] dark:text-[#F5EBE6]">
            Como autorizar o Google Login em 3 passos:
          </p>

          <div className="bg-white dark:bg-[#231A21] border border-[#E8DFC8] dark:border-[#382833] rounded-xl p-2.5 flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-[#2C221E] dark:text-[#F5EBE6] truncate">
              {currentDomain}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-[#8B263E] dark:bg-[#C23E5D] text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar Domínio'}
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#6B5A50] dark:text-[#B8A6A0] pl-1">
            <li>Acesse o <strong>Firebase Console</strong> do seu projeto.</li>
            <li>Vá em <strong>Authentication</strong> &gt; aba <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.</li>
            <li>Clique em <strong>Add domain</strong> e cole o domínio copiado acima.</li>
          </ol>
        </div>

        <button
          onClick={() => setShowDomainHelp(false)}
          className="w-full py-2.5 rounded-xl bg-[#8B263E] dark:bg-[#C23E5D] text-white font-bold text-xs hover:opacity-95 transition-all active:scale-95 shadow-sm"
        >
          Entendi, continuar usando
        </button>
      </div>
    </div>
  );
};
