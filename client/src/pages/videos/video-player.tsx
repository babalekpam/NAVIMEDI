import { ArrowLeft, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import { useState, useEffect } from "react";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface VideoContent {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  category: string;
  chapters: Array<{
    title: string;
    timestamp: string;
    description: string;
  }>;
  relatedVideos: string[];
}

const videoLibrary: Record<string, VideoContent> = {
  "platform-overview-setup": {
    id: "platform-overview-setup",
    title: "Platform Overview & Setup",
    description: "Comprehensive introduction to the NAVIMED healthcare platform, covering core features, navigation, and initial setup procedures for new organizations.",
    duration: "12:45",
    level: "Beginner",
    category: "Getting Started",
    chapters: [
      { title: "Platform Introduction", timestamp: "0:00", description: "Overview of NAVIMED's capabilities" },
      { title: "Navigation Basics", timestamp: "2:30", description: "Understanding the interface and menus" },
      { title: "Initial Setup", timestamp: "5:15", description: "Organization configuration steps" },
      { title: "User Roles", timestamp: "8:30", description: "Setting up team roles and permissions" },
      { title: "First Steps", timestamp: "10:45", description: "Completing your initial setup" }
    ],
    relatedVideos: ["patient-registration", "appointment-scheduling"]
  },
  "patient-registration": {
    id: "patient-registration",
    title: "Patient Registration",
    description: "Step-by-step guide to registering new patients, collecting medical history, insurance information, and setting up comprehensive patient profiles.",
    duration: "8:30",
    level: "Beginner",
    category: "Patient Management",
    chapters: [
      { title: "Registration Form", timestamp: "0:00", description: "Completing patient demographics" },
      { title: "Medical History", timestamp: "2:45", description: "Collecting health background" },
      { title: "Insurance Setup", timestamp: "5:30", description: "Processing insurance information" },
      { title: "Profile Completion", timestamp: "7:15", description: "Finalizing patient record" }
    ],
    relatedVideos: ["electronic-health-records", "appointment-scheduling"]
  },
  "appointment-scheduling": {
    id: "appointment-scheduling",
    title: "Basic Appointment Scheduling",
    description: "Learn to schedule appointments, manage calendars, handle conflicts, and optimize scheduling workflows for maximum efficiency.",
    duration: "15:20",
    level: "Beginner",
    category: "Scheduling",
    chapters: [
      { title: "Calendar Overview", timestamp: "0:00", description: "Understanding the scheduling interface" },
      { title: "Booking Appointments", timestamp: "3:20", description: "Creating new appointments" },
      { title: "Managing Conflicts", timestamp: "7:45", description: "Resolving scheduling conflicts" },
      { title: "Recurring Appointments", timestamp: "11:30", description: "Setting up regular visits" },
      { title: "Best Practices", timestamp: "13:50", description: "Optimization tips" }
    ],
    relatedVideos: ["patient-registration", "clinical-documentation"]
  },
  "electronic-health-records": {
    id: "electronic-health-records",
    title: "Electronic Health Records",
    description: "Complete guide to managing electronic health records, updating patient information, tracking medical history, and maintaining HIPAA compliance.",
    duration: "22:15",
    level: "Intermediate",
    category: "Clinical",
    chapters: [
      { title: "EHR Basics", timestamp: "0:00", description: "Introduction to electronic health records" },
      { title: "Patient Charts", timestamp: "4:30", description: "Navigating patient medical charts" },
      { title: "Medical History", timestamp: "9:15", description: "Recording and updating medical history" },
      { title: "Clinical Notes", timestamp: "14:20", description: "Writing comprehensive clinical notes" },
      { title: "Compliance", timestamp: "18:45", description: "HIPAA and regulatory compliance" }
    ],
    relatedVideos: ["clinical-documentation", "prescription-management"]
  },
  "prescription-management": {
    id: "prescription-management",
    title: "Prescription Management",
    description: "Digital prescription workflows, e-prescribing, pharmacy integration, and medication management for comprehensive patient care.",
    duration: "14:30",
    level: "Intermediate",
    category: "Clinical",
    chapters: [
      { title: "E-Prescribing", timestamp: "0:00", description: "Digital prescription creation" },
      { title: "Drug Interactions", timestamp: "3:45", description: "Checking for medication conflicts" },
      { title: "Pharmacy Integration", timestamp: "7:20", description: "Sending prescriptions to pharmacies" },
      { title: "Refills & Renewals", timestamp: "10:30", description: "Managing prescription renewals" },
      { title: "Medication History", timestamp: "12:45", description: "Tracking patient medications" }
    ],
    relatedVideos: ["electronic-health-records", "laboratory-integration"]
  },
  "laboratory-integration": {
    id: "laboratory-integration",
    title: "Laboratory Integration",
    description: "Ordering lab tests, integrating with laboratory systems, tracking results, and incorporating findings into patient care decisions.",
    duration: "16:45",
    level: "Intermediate",
    category: "Clinical",
    chapters: [
      { title: "Lab Orders", timestamp: "0:00", description: "Creating laboratory orders" },
      { title: "Test Selection", timestamp: "4:15", description: "Choosing appropriate tests" },
      { title: "Results Tracking", timestamp: "8:30", description: "Monitoring lab results" },
      { title: "Clinical Integration", timestamp: "12:20", description: "Using results in care decisions" },
      { title: "Reporting", timestamp: "15:00", description: "Lab result reporting" }
    ],
    relatedVideos: ["electronic-health-records", "clinical-documentation"]
  },
  "insurance-claims-processing": {
    id: "insurance-claims-processing",
    title: "Insurance Claims Processing",
    description: "Complete insurance workflow from verification to claims submission, tracking payments, and managing denials and appeals.",
    duration: "18:45",
    level: "Advanced",
    category: "Billing",
    chapters: [
      { title: "Insurance Verification", timestamp: "0:00", description: "Verifying patient coverage" },
      { title: "Claims Creation", timestamp: "5:30", description: "Building insurance claims" },
      { title: "Submission Process", timestamp: "9:45", description: "Submitting claims electronically" },
      { title: "Payment Tracking", timestamp: "13:20", description: "Monitoring claim payments" },
      { title: "Denials & Appeals", timestamp: "16:30", description: "Handling claim denials" }
    ],
    relatedVideos: ["system-administration", "billing-revenue-cycle"]
  },
  "system-administration": {
    id: "system-administration",
    title: "System Administration",
    description: "Advanced system configuration, user management, security settings, and organizational administration for healthcare IT professionals.",
    duration: "25:30",
    level: "Advanced",
    category: "Administration",
    chapters: [
      { title: "User Management", timestamp: "0:00", description: "Managing system users and roles" },
      { title: "Security Settings", timestamp: "6:45", description: "Configuring security policies" },
      { title: "System Configuration", timestamp: "12:30", description: "Advanced system settings" },
      { title: "Data Management", timestamp: "18:15", description: "Backup and data management" },
      { title: "Performance Monitoring", timestamp: "22:45", description: "System performance optimization" }
    ],
    relatedVideos: ["hipaa-compliance-security", "insurance-claims-processing"]
  },
  "hipaa-compliance-security": {
    id: "hipaa-compliance-security",
    title: "HIPAA Compliance & Security",
    description: "Comprehensive guide to HIPAA compliance, data security, audit trails, and maintaining regulatory compliance in healthcare environments.",
    duration: "19:20",
    level: "Advanced",
    category: "Compliance",
    chapters: [
      { title: "HIPAA Overview", timestamp: "0:00", description: "Understanding HIPAA requirements" },
      { title: "Data Protection", timestamp: "4:30", description: "Protecting patient information" },
      { title: "Access Controls", timestamp: "8:45", description: "Managing data access" },
      { title: "Audit Trails", timestamp: "13:15", description: "Maintaining compliance logs" },
      { title: "Incident Response", timestamp: "16:30", description: "Handling security incidents" }
    ],
    relatedVideos: ["system-administration", "electronic-health-records"]
  }
};

export default function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [progress, setProgress] = useState(0);
  
  const video = videoId ? videoLibrary[videoId] : null;

  useEffect(() => {
    if (isPlaying && video) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 0;
          }
          // Update time display based on progress
          const totalSeconds = parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1]);
          const currentSeconds = Math.floor((newProgress / 100) * totalSeconds);
          const minutes = Math.floor(currentSeconds / 60);
          const seconds = currentSeconds % 60;
          setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          return newProgress;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, video]);

  if (!video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/support/documentation">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Documentation
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h2>
              <p className="text-gray-600 mb-6">The requested video tutorial could not be found.</p>
              <Link href="/support/documentation">
                <Button>Return to Documentation</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <span className="text-lg font-semibold text-gray-900">Video Tutorial</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Video Player */}
                <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                  {/* Video Content Area */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-emerald-600 to-purple-600">
                    {/* Simulated Video Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        {isPlaying ? (
                          <div className="space-y-4">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                              <Pause className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-lg font-semibold">▶ Now Playing: {video.title}</div>
                              <div className="text-sm text-gray-200">Professional Healthcare Training Video</div>
                              <div className="text-xs text-gray-300 bg-black/30 px-3 py-1 rounded-full inline-block">
                                🎥 Demo Mode - Video Content Available in Full Version
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div 
                              className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-emerald-500 transition-colors"
                              onClick={() => setIsPlaying(true)}
                            >
                              <Play className="w-10 h-10 ml-1" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-lg font-semibold">{video.title}</div>
                              <div className="text-sm text-gray-200">Duration: {video.duration}</div>
                              <div className="text-xs text-gray-300 bg-black/30 px-3 py-1 rounded-full inline-block">
                                Click Play to Start Demo
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Professional Video Overlay Elements */}
                    {isPlaying && (
                      <>
                        <div className="absolute top-4 left-4">
                          <div className="bg-black/60 text-white px-3 py-1 rounded text-sm">
                            🔴 LIVE DEMO
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/60 text-white px-3 py-1 rounded text-sm">
                            HD Quality
                          </div>
                        </div>
                        <div className="absolute bottom-20 left-4 right-4">
                          <div className="bg-black/80 text-white p-3 rounded">
                            <div className="text-sm font-medium mb-1">Current Chapter: {video.chapters[0]?.title}</div>
                            <div className="text-xs text-gray-300">{video.chapters[0]?.description}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => {
                          setIsPlaying(!isPlaying);
                          if (!isPlaying && progress === 0) {
                            setCurrentTime("0:00");
                          }
                        }}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex-1 bg-white/20 h-1 rounded cursor-pointer">
                        <div 
                          className="bg-emerald-500 h-1 rounded transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      
                      <span className="text-white text-sm">{currentTime} / {video.duration}</span>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h1>
                      <p className="text-gray-600 mb-4">{video.description}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline">{video.category}</Badge>
                        <Badge className={`${
                          video.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          video.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {video.level}
                        </Badge>
                        <span className="text-sm text-gray-500">{video.duration}</span>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">Demo Video Player</h4>
                            <p className="text-sm text-blue-700 mb-3">
                              This is a demonstration of the video tutorial interface. In the full version, 
                              you would see actual healthcare training videos with real content from medical professionals.
                            </p>
                            <Link href="/videos/integration">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Add Real Videos
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Chapters */}
            <Card>
              <CardHeader>
                <CardTitle>Video Chapters</CardTitle>
                <CardDescription>Jump to specific sections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {video.chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                    >
                      <span className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        {chapter.timestamp}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{chapter.title}</p>
                        <p className="text-xs text-gray-600">{chapter.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Videos */}
            <Card>
              <CardHeader>
                <CardTitle>Related Videos</CardTitle>
                <CardDescription>Continue your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {video.relatedVideos.map(relatedId => {
                    const relatedVideo = videoLibrary[relatedId];
                    if (!relatedVideo) return null;
                    
                    return (
                      <Link key={relatedId} href={`/videos/${relatedId}`}>
                        <div className="p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer transition-colors">
                          <p className="font-medium text-sm mb-1">{relatedVideo.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{relatedVideo.category}</Badge>
                            <span className="text-xs text-gray-500">{relatedVideo.duration}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                <Link href="/support/documentation">
                  <Button variant="outline" className="w-full mt-4">
                    View All Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}