import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    } else {
      console.log('PWA install dismissed');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowPrompt(false);
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 border-blue-500" data-testid="pwa-install-prompt">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1" data-testid="text-install-title">
                Install NaviMED App
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Install our app for a better experience with offline access and quick launch from your home screen.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 min-w-[120px]"
                  data-testid="button-install"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button 
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  data-testid="button-dismiss"
                >
                  Later
                </Button>
                <Button 
                  onClick={handleDismissPermanently}
                  variant="ghost"
                  size="sm"
                  data-testid="button-dismiss-permanent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* iOS Instructions */}
          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
            <p className="mb-1 font-semibold">For iOS users:</p>
            <p>
              Tap the Share button <span className="inline-block">📤</span> in Safari and select "Add to Home Screen"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
