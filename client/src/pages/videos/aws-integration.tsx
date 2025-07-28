import { useState } from "react";
import { ArrowLeft, Cloud, Copy, Check, AlertCircle, ExternalLink, Shield, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

export default function AWSIntegration() {
  const [bucketName, setBucketName] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = () => {
    if (!bucketName || !videoPath) return;
    
    const videoUrl = `https://${bucketName}.s3.amazonaws.com/${videoPath}`;
    const code = `<video 
  width="100%" 
  height="400" 
  controls 
  preload="metadata"
  poster="https://${bucketName}.s3.amazonaws.com/thumbnails/${videoPath.replace(/\.[^/.]+$/, '')}_thumb.jpg">
  <source src="${videoUrl}" type="video/mp4">
  <p>Your browser doesn't support HTML video. <a href="${videoUrl}">Download the video</a> instead.</p>
</video>`;
    setEmbedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
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
            <Cloud className="w-8 h-8 text-orange-600" />
            <span className="text-lg font-semibold text-gray-900">AWS Video Hosting</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AWS Enterprise Video Hosting</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Self-hosted solution using AWS S3 for storage and CloudFront for global delivery. Perfect for HIPAA-compliant healthcare organizations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* AWS Services Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-600" />
                Required AWS Services
              </CardTitle>
              <CardDescription>Essential AWS components for video hosting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">S3 Storage</h4>
                    <Badge variant="outline">$0.023/GB/month</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Secure, scalable object storage for video files</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">CloudFront CDN</h4>
                    <Badge variant="outline">$0.085/GB transfer</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Global content delivery network for fast streaming</p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">AWS IAM</h4>
                    <Badge className="bg-green-100 text-green-800">Free</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Identity and access management for security</p>
                </div>

                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">MediaConvert (Optional)</h4>
                    <Badge className="bg-blue-600">$0.015/minute</Badge>
                  </div>
                  <p className="text-sm text-blue-800">Professional video transcoding for multiple formats</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-900">HIPAA Compliance</h5>
                    <p className="text-sm text-green-800 mt-1">
                      AWS offers BAA (Business Associate Agreement) for healthcare organizations requiring HIPAA compliance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Steps</CardTitle>
              <CardDescription>Complete AWS video hosting setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-medium">Create AWS Account</h4>
                    <p className="text-sm text-gray-600">Sign up for AWS with healthcare BAA if needed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-medium">Setup S3 Bucket</h4>
                    <p className="text-sm text-gray-600">Create secure bucket with proper permissions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-medium">Configure CloudFront</h4>
                    <p className="text-sm text-gray-600">Setup CDN for global video delivery</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <h4 className="font-medium">Upload Videos</h4>
                    <p className="text-sm text-gray-600">Upload healthcare training content</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                  <div>
                    <h4 className="font-medium">Generate Embed Code</h4>
                    <p className="text-sm text-gray-600">Use the tool below for professional implementation</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-orange-900">Cost Estimation</h5>
                    <p className="text-sm text-orange-800 mt-1">
                      For 100GB storage + 1TB monthly transfer: ~$45/month
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Embed Generator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AWS Video Embed Generator</CardTitle>
            <CardDescription>Generate HTML5 video embed code for AWS-hosted videos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bucket-name">S3 Bucket Name</Label>
                <Input
                  id="bucket-name"
                  placeholder="my-healthcare-videos"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your AWS S3 bucket name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-path">Video File Path</Label>
                <Input
                  id="video-path"
                  placeholder="training/patient-care-basics.mp4"
                  value={videoPath}
                  onChange={(e) => setVideoPath(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Path to video file in your bucket
                </p>
              </div>
            </div>

            <Button onClick={generateEmbedCode} className="w-full" disabled={!bucketName || !videoPath}>
              <Cloud className="w-4 h-4 mr-2" />
              Generate AWS Embed Code
            </Button>

            {embedCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aws-embed">Generated HTML5 Video Code</Label>
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
                  id="aws-embed"
                  value={embedCode}
                  readOnly
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* AWS Resources */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Helpful AWS Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://aws.amazon.com/s3/" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">AWS S3 Documentation</div>
                    <div className="text-sm text-gray-600">Object storage setup guide</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://aws.amazon.com/cloudfront/" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">CloudFront CDN</div>
                    <div className="text-sm text-gray-600">Content delivery setup</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://aws.amazon.com/compliance/hipaa-compliance/" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">HIPAA on AWS</div>
                    <div className="text-sm text-gray-600">Healthcare compliance guide</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="https://calculator.aws/" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-medium">AWS Pricing Calculator</div>
                    <div className="text-sm text-gray-600">Estimate your costs</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Features */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Why AWS for Healthcare Video?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-900">Enterprise Security</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>HIPAA Business Associate Agreement available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>256-bit encryption at rest and in transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Granular access controls with IAM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Audit logging with CloudTrail</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-orange-900">Scalability & Performance</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>99.999999999% (11 9's) data durability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Global CDN with 400+ edge locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Unlimited storage capacity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Pay only for what you use</span>
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