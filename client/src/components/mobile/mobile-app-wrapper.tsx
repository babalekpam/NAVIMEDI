import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Download, X } from "lucide-react";

interface MobileAppWrapperProps {
  children: React.ReactNode;
}

export default function MobileAppWrapper({ children }: MobileAppWrapperProps) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running as PWA
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone ||
                          document.referrer.includes('android-app://');
      setIsStandalone(isStandalone);
    };

    checkStandalone();

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      } else {
        console.log('PWA installation declined');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  return (
    <div className="relative">
      {children}
      
      {/* PWA Install Banner */}
      {showInstallPrompt && !isStandalone && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <Card className="bg-blue-600 text-white border-blue-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Install NaviMed App</h3>
                    <p className="text-xs text-blue-100">
                      Install our app for quick access to your health info
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={handleInstallClick}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Install
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setShowInstallPrompt(false)}
                    className="text-white hover:bg-white hover:bg-opacity-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}