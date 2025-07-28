import { useState } from "react";
import { ArrowLeft, Video, Copy, Check, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function VimeoIntegration() {
  const [videoUrl, setVideoUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    if (!videoUrl) return;
    
    // Extract video ID from Vimeo URL
    const videoId = videoUrl.match(/(?:vimeo\.com\/)(\d+)/);
    
    if (videoId) {
      const embedUrl = `https://player.vimeo.com/video/${videoId[1]}?badge=0&autopause=0&player_id=0&app_id=58479`;
      const code = `<iframe 
  src="${embedUrl}" 
  width="100%" 
  height="400" 
  frameborder="0" 
  allow="autoplay; fullscreen; picture-in-picture" 
  allowfullscreen
  title="Healthcare Training Video">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
            <Video className="w-8 h-8 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Vimeo Business Integration</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Vimeo Business Integration</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional video hosting with custom branding, privacy controls, and analytics perfect for healthcare training content.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pricing & Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Vimeo Business Plans
              </CardTitle>
              <CardDescription>Choose the right plan for your healthcare organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Starter</h4>
                    <Badge variant="outline">$20/month</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 250 GB storage</li>
                    <li>• Custom player</li>
                    <li>• Privacy controls</li>
                    <li>• Basic analytics</li>
                  </ul>
                </div>

                <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">Standard</h4>
                    <Badge className="bg-blue-600">$33/month - Recommended</Badge>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 1 TB storage</li>
                    <li>• Advanced privacy</li>
                    <li>• Team collaboration</li>
                    <li>• Detailed analytics</li>
                    <li>• Password protection</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Advanced</h4>
                    <Badge variant="outline">$75/month</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5 TB storage</li>
                    <li>• Enterprise features</li>
                    <li>• API access</li>
                    <li>• Advanced security</li>
                  </ul>
                </div>
              </div>

              <Button className="w-full" asChild>
                <a href="https://vimeo.com/upgrade" target="_blank" rel="noopener noreferrer">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Start Vimeo Business Trial
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Process</CardTitle>
              <CardDescription>Step-by-step integration guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-medium">Create Vimeo Account</h4>
                    <p className="text-sm text-gray-600">Sign up for Vimeo Business (recommended: Standard plan)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-medium">Upload Healthcare Videos</h4>
                    <p className="text-sm text-gray-600">Upload training content with professional quality settings</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-medium">Configure Privacy</h4>
                    <p className="text-sm text-gray-600">Set appropriate privacy levels for healthcare content</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <h4 className="font-medium">Customize Player</h4>
                    <p className="text-sm text-gray-600">Brand the video player with your organization's colors</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                  <div>
                    <h4 className="font-medium">Generate Embed Code</h4>
                    <p className="text-sm text-gray-600">Use the tool below to create professional embeds</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-900">HIPAA Compliance</h5>
                    <p className="text-sm text-blue-800 mt-1">
                      Vimeo Business offers enterprise-grade security features suitable for healthcare organizations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embed Generator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vimeo Embed Generator</CardTitle>
            <CardDescription>Generate professional embed code for your Vimeo videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vimeo-url">Vimeo Video URL</Label>
                <Input
                  id="vimeo-url"
                  placeholder="https://vimeo.com/123456789"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Paste any Vimeo video URL
                </p>
              </div>

              <div className="flex items-end">
                <Button onClick={generateEmbedCode} className="w-full" disabled={!videoUrl}>
                  <Video className="w-4 h-4 mr-2" />
                  Generate Embed Code
                </Button>
              </div>
            </div>

            {embedCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vimeo-embed">Generated Embed Code</Label>
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
                  id="vimeo-embed"
                  value={embedCode}
                  readOnly
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Why Choose Vimeo for Healthcare?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-900">Security & Privacy</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Password protection for sensitive content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Domain-specific embedding restrictions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Enterprise-grade security infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>GDPR compliant data handling</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-900">Professional Features</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Custom branded video player</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Detailed video analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>No advertising or Vimeo branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>4K and HDR video support</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}