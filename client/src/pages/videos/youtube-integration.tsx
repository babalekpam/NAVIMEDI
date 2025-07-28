import { useState } from "react";
import { ArrowLeft, Youtube, Copy, Check, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function YoutubeIntegration() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    if (!videoUrl) return;
    
    // Extract video ID from YouTube URL
    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId[1]}?rel=0&modestbranding=1&showinfo=0`;
      const code = `<iframe 
  width="100%" 
  height="400" 
  src="${embedUrl}" 
  frameborder="0" 
  allowfullscreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
</iframe>`;
      setEmbedCode(code);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/videos/integration">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Integration Options
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-auto" />
            <Youtube className="w-8 h-8 text-red-600" />
            <span className="text-lg font-semibold text-gray-900">YouTube Integration</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">YouTube Video Integration</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Embed YouTube videos directly into your healthcare training platform. Perfect for existing content or creating a dedicated healthcare channel.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                Setup Instructions
              </CardTitle>
              <CardDescription>Follow these steps to integrate YouTube videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-medium">Upload to YouTube</h4>
                    <p className="text-sm text-gray-600">Upload your healthcare training videos to YouTube or use existing videos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-medium">Copy Video URL</h4>
                    <p className="text-sm text-gray-600">Get the YouTube video URL from the address bar or share button</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-medium">Generate Embed Code</h4>
                    <p className="text-sm text-gray-600">Use the tool below to generate professional embed code</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <h4 className="font-medium">Update Platform</h4>
                    <p className="text-sm text-gray-600">Replace demo video URLs with real YouTube embed codes</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-900">Privacy Considerations</h5>
                    <p className="text-sm text-yellow-800 mt-1">
                      For healthcare content, consider setting videos to "Unlisted" for privacy while still allowing embed access.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video URL Input & Embed Generator */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code Generator</CardTitle>
              <CardDescription>Generate professional embed code for your YouTube videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">YouTube Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Paste any YouTube video URL (watch, share, or embed format)
                </p>
              </div>

              <Button onClick={generateEmbedCode} className="w-full" disabled={!videoUrl}>
                <Youtube className="w-4 h-4 mr-2" />
                Generate Embed Code
              </Button>

              {embedCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="embed-code">Generated Embed Code</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="h-8"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Textarea
                    id="embed-code"
                    value={embedCode}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Helpful Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://www.youtube.com/create" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">YouTube Creator Studio</div>
                    <div className="text-sm text-gray-600">Upload and manage videos</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://support.google.com/youtube/answer/171780" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">Privacy Settings</div>
                    <div className="text-sm text-gray-600">Configure video visibility</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://support.google.com/youtube/answer/2797370" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">Embed Settings</div>
                    <div className="text-sm text-gray-600">Advanced embed options</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-2">Ready to Implement</h4>
                <p className="text-green-800 mb-4">
                  The YouTube integration system is ready! You can now:
                </p>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  <li>Generate embed codes for any YouTube video</li>
                  <li>Copy and paste code directly into your platform</li>
                  <li>Customize embed settings for healthcare content</li>
                  <li>Maintain professional appearance with branding options</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}