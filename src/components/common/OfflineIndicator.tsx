import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, X, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Offline / Online Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
          title={isOnline ? 'Online — Assets precached locally' : 'Offline First — All features fully functional without internet'}
        >
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Cached & Ready' : 'Offline Mode'}</span>
        </div>

        {/* Install App button if not standalone */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30 hover:bg-[#a3e635]/25 transition active:scale-95"
            title="Install 30FIT App on Mac or Android"
          >
            <Download size={12} />
            <span>Install App</span>
          </button>
        )}
      </div>

      {/* Install Guidance Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#16191f] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#a3e635]/10 text-[#a3e635] flex items-center justify-center border border-[#a3e635]/20">
                <Download size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">How to Install 30FIT</h3>
                <p className="text-xs text-white/50">Full offline standalone experience</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-white/80">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="font-semibold text-white mb-1">On MacBook / Desktop (Chrome, Edge, Safari):</p>
                <ol className="list-decimal list-inside space-y-1 text-white/70">
                  <li>In Chrome: click the <strong>Install</strong> icon in the address bar (right side).</li>
                  <li>In Safari: File → <strong>Add to Dock</strong>.</li>
                  <li>Enjoy dedicated desktop window without browser bars.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="font-semibold text-white mb-1">On Android (Chrome):</p>
                <ol className="list-decimal list-inside space-y-1 text-white/70">
                  <li>Tap the three dots (<strong>⋮</strong>) in the top-right corner.</li>
                  <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Launch directly from your home screen anytime without data.</li>
                </ol>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-[#a3e635]/90 bg-[#a3e635]/10 p-2.5 rounded-xl border border-[#a3e635]/20">
                <CheckCircle size={15} className="shrink-0 mt-0.5" />
                <span>Once installed, all exercises, workouts, and timers run 100% offline with zero data usage.</span>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#a3e635] text-black font-bold text-xs hover:bg-[#bef264] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
