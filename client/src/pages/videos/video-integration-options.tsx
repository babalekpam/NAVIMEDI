import { ArrowLeft, Play, Upload, Youtube, Video, Cloud, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function VideoIntegrationOptions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/support/documentation">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <img src={navimedLogo} alt="NaviMed" className="h-8 w-auto" />
            <span className="text-lg font-semibold text-gray-900">Video Integration</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Real Video Integration Options</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            To add real video content to your healthcare platform, you'll need to integrate with video hosting services 
            or upload your own content. Here are the available options:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* YouTube Integration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Youtube className="w-8 h-8 text-red-600" />
                <div>
                  <CardTitle>YouTube Integration</CardTitle>
                  <Badge variant="outline" className="mt-1">Free Option</Badge>
                </div>
              </div>
              <CardDescription>
                Embed existing healthcare training videos from YouTube or create a dedicated channel for your content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <strong>Pros:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>Free hosting</li>
                    <li>Easy embedding</li>
                    <li>Automatic transcoding</li>
                    <li>Mobile optimization</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Cons:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>YouTube branding</li>
                    <li>Ads (unless premium)</li>
                    <li>Limited customization</li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.open('/videos/integration/youtube', '_blank')}
              >
                <Youtube className="w-4 h-4 mr-2" />
                Setup YouTube Integration
              </Button>
            </CardContent>
          </Card>

          {/* Vimeo Integration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Video className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle>Vimeo Business</CardTitle>
                  <Badge className="mt-1 bg-blue-100 text-blue-800">Professional</Badge>
                </div>
              </div>
              <CardDescription>
                Professional video hosting with customizable players, privacy controls, and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <strong>Pros:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>No ads</li>
                    <li>Custom branding</li>
                    <li>Privacy controls</li>
                    <li>HD quality</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Cost:</strong> $20-75/month
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.open('/videos/integration/vimeo', '_blank')}
              >
                <Video className="w-4 h-4 mr-2" />
                Setup Vimeo Integration
              </Button>
            </CardContent>
          </Card>

          {/* AWS S3 + CloudFront */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-8 h-8 text-orange-600" />
                <div>
                  <CardTitle>AWS Video Hosting</CardTitle>
                  <Badge className="mt-1 bg-green-100 text-green-800">Enterprise</Badge>
                </div>
              </div>
              <CardDescription>
                Self-hosted solution using AWS S3 for storage and CloudFront for global delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <strong>Pros:</strong>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    <li>Full control</li>
                    <li>HIPAA compliant</li>
                    <li>Scalable</li>
                    <li>Custom analytics</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Cost:</strong> Pay per usage (~$10-100/month)
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.open('/videos/integration/aws', '_blank')}
              >
                <Cloud className="w-4 h-4 mr-2" />
                Setup AWS Integration
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Next Steps to Add Real Videos</CardTitle>
            <CardDescription>Choose your preferred method and follow these implementation steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-900">1. Content Creation</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Record healthcare training videos</li>
                  <li>• Create professional scripts</li>
                  <li>• Add captions for accessibility</li>
                  <li>• Ensure HIPAA compliance</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-blue-900">2. Video Hosting Setup</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Choose hosting platform</li>
                  <li>• Upload and organize content</li>
                  <li>• Configure privacy settings</li>
                  <li>• Test video quality</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-900">3. Platform Integration</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Update video player URLs</li>
                  <li>• Test embedded playback</li>
                  <li>• Add progress tracking</li>
                  <li>• Enable user analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Demo Status */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Current Status: Demo Mode</h4>
                <p className="text-yellow-800 mb-4">
                  The video tutorial system is currently running in demo mode with simulated playback. 
                  To enable real videos, you'll need to:
                </p>
                <ol className="list-decimal list-inside text-yellow-800 space-y-1">
                  <li>Choose a video hosting solution above</li>
                  <li>Upload your healthcare training content</li>
                  <li>Update the video URLs in the platform</li>
                  <li>Test the integration</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}