import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
import healthcareTeam from "@assets/image_1754352574197.png";
import medicalImaging from "@assets/image_1754352599331.png";
import healthAssessment from "@assets/image_1754352626174.png";
import healthcareManagement from "@assets/image_1754352650858.png";
import healthcareSecurity from "@assets/image_1754352725355.png";
import medicalSupply from "@assets/image_1754352767570.png";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { 
  Heart, 
  Shield, 
  Users, 
  User,
  Bolt, 
  Globe, 
  Building2, 
  Stethoscope, 
  Pill, 
  TestTube, 
  FileText,
  Lock,
  Languages,
  Activity,
  Calendar,
  UserCheck,
  Database,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Award,
  Zap,
  TrendingUp,
  Clock,
  Smartphone,
  Cloud,
  Brain,
  Monitor,
  Headphones,
  Rocket,
  MessageCircle,
  Phone,
  Mail,
  Megaphone,
  ShoppingCart,
  Package,
  Laptop
} from "lucide-react";

// Professional healthcare platform branding
const brandName = "NAVIMED";
const tagline = "Next-Generation Healthcare Management Platform";

// Interfaces
interface PlatformStats {
  organizations: number;
  users: number;
  uptime: string;
  languages: number;
  responseTime: string;
  support: string;
}

interface PlatformData {
  platform: string;
  statistics: PlatformStats;
  status: string;
  timestamp: string;
}

// Professional Healthcare Image Carousel Component
function ImageCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Professional healthcare photographs provided by the user
  const healthcareImages = [
    {
      url: "/src/assets/image_1754352574197.png",
      alt: "Healthcare Team Meeting",
      title: "Professional Healthcare Team",
      description: "Collaborative healthcare professionals working together for better patient outcomes"
    },
    {
      url: "/src/assets/image_1754352599331.png",
      alt: "Medical Imaging Analysis",
      title: "Advanced Medical Imaging",
      description: "Cutting-edge diagnostic technology with brain scan analysis and medical expertise"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImVtZXJnZW5jeSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiNlZjQ0NDQiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmJiZjI0Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxyYWRpYWxHcmFkaWVudCBpZD0iZ2xvdzMiIGN4PSIwLjUiIGN5PSIwLjUiIHI9IjAuNyI+CjxzdG9wIHN0b3AtY29sb3I9IndoaXRlIiBzdG9wLW9wYWNpdHk9IjAuNSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IndoaXRlIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNlbWVyZ2VuY3kpIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjI1MCIgcj0iMjAwIiBmaWxsPSJ1cmwoI2dsb3czKSIgb3BhY2l0eT0iMC42Ii8+CjxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI2MDAiIGhlaWdodD0iMzQwIiByeD0iMzIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOTgiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIzIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjI0MCIgcj0iOTAiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjI0MCIgcj0iNzAiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjI0MCIgcj0iNTAiIGZpbGw9IiNlZjQ0NDQiLz4KPHJlY3QgeD0iMzc1IiB5PSIyMDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI4MCIgcng9IjgiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjM4NSIgeT0iMjEwIiB3aWR0aD0iMzAiIGhlaWdodD0iNjAiIHJ4PSI0IiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjM5NSIgeT0iMjE1IiB3aWR0aD0iMTAiIGhlaWdodD0iNTAiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjM5MCIgeT0iMjMwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIGZpbGw9IllhGhpdGUiLz4KPHJlY3QgeD0iMjAwIiB5PSIxNDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iNzAiIHJ4PSIxMiIgZmlsbD0iI2ZiYmYyNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPHJlY3QgeD0iMjEwIiB5PSIxNTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iMjEwIiB5PSIxNjgiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjYiLz4KPHJlY3QgeD0iMjEwIiB5PSIxODYiIHdpZHRoPSIxMTAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iNDUwIiB5PSIxNDAiIHdpZHRoPSIxNDAiIGhlaWdodD0iNzAiIHJ4PSIxMiIgZmlsbD0iI2ZiYmYyNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPHJlY3QgeD0iNDYwIiB5PSIxNTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iNDYwIiB5PSIxNjgiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjYiLz4KPHJlY3QgeD0iNDYwIiB5PSIxODYiIHdpZHRoPSIxMTAiIGhlaWdodD0iMTAiIHJ4PSI1IiBmaWxsPSIjZWY0NDQ0IiBvcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iMjgwIiB5PSIzMzAiIHdpZHRoPSIyNDAiIGhlaWdodD0iNDAiIHJ4PSIyMCIgZmlsbD0iI2VmNDQ0NCIvPgo8dGV4dCB4PSI0MDAiIHk9IjM1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9IjcwMCI+RU1FUkdFTkNZIEFMRVJUPC90ZXh0Pgo8Y2lyY2xlIGN4PSIyNDAiIGN5PSIyODAiIHI9IjE2IiBmaWxsPSIjZWY0NDQ0Ii8+CjxwYXRoIGQ9Ik0yMzIgMjc0aDEzdjEzaC0xM3oiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjU2MCIgY3k9IjI4MCIgcj0iMTYiIGZpbGw9IiNlZjQ0NDQiLz4KPHBhdGggZD0iTTU1MiAyNzRoMTN2MTNoLTEzeiIgZmlsbD0id2hpdGUiLz4KPHRleHQgeD0iNDAwIiB5PSI0NTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzFiMmIiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjcwMCI+RW1lcmdlbmN5IENhcmU8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDc4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNGEzMzM5IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI1MDAiPjI0LzcgY3JpdGljYWwgY2FyZSBhbmQgZW1lcmdlbmN5IHNlcnZpY2VzPC90ZXh0Pgo8L3N2Zz4=",
      alt: "Emergency Healthcare",
      title: "Emergency Care",
      description: "24/7 critical care and emergency services with instant alerts"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InRlYW0iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBzdG9wLWNvbG9yPSIjOGI1Y2Y2Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2VjNDg5OSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8cmFkaWFsR3JhZGllbnQgaWQ9Imdsb3c0IiBjeD0iMC41IiBjeT0iMC41IiByPSIwLjgiPgo8c3RvcCBzdG9wLWNvbG9yPSJ3aGl0ZSIgc3RvcC1vcGFjaXR5PSIwLjMiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9InVybCgjdGVhbSkiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iMjUwIiByPSIzNTAiIGZpbGw9InVybCgjZ2xvdzQpIiBvcGFjaXR5PSIwLjQiLz4KPHJlY3QgeD0iMTAwIiB5PSI4MCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzNDAiIHJ4PSIzMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45OCIgc3Ryb2tlPSIjOGI1Y2Y2IiBzdHJva2Utd2lkdGg9IjMiLz4KPHJlY3QgeD0iMTQwIiB5PSIxMjAiIHdpZHRoPSI1MjAiIGhlaWdodD0iMjYwIiByeD0iMTYiIGZpbGw9IiNmY2ZkZmYiLz4KPGNpcmNsZSBjeD0iMjYwIiBjeT0iMjMwIiByPSI1NSIgZmlsbD0iIzhiNWNmNiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPGNpcmNsZSBjeD0iMjYwIiBjeT0iMjMwIiByPSI0MCIgZmlsbD0iIzhiNWNmNiIvPgo8Y2lyY2xlIGN4PSIyNjAiIGN5PSIyMTAiIHI9IjE4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyNTQiIGN5PSIyMDciIHI9IjMiIGZpbGw9IiM0NzQ3NTMiLz4KPGNpcmNsZSBjeD0iMjY2IiBjeT0iMjA3IiByPSIzIiBmaWxsPSIjNDc0NzUzIi8+CjxlbGxpcHNlIGN4PSIyNjAiIGN5PSIyMTgiIHJ4PSI4IiByeT0iNSIgZmlsbD0iIzQ3NDc1MyIvPgo8cmVjdCB4PSIyMzAiIHk9IjI1MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iMjAwIiByPSI1NSIgZmlsbD0iI2VjNDg5OSIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iMjAwIiByPSI0MCIgZmlsbD0iI2VjNDg5OSIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIxODAiIHI9IjE4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIzOTQiIGN5PSIxNzciIHI9IjMiIGZpbGw9IiM0NzQ3NTMiLz4KPGNpcmNsZSBjeD0iNDA2IiBjeT0iMTc3IiByPSIzIiBmaWxsPSIjNDc0NzUzIi8+CjxlbGxpcHNlIGN4PSI0MDAiIGN5PSIxODgiIHJ4PSI4IiByeT0iNSIgZmlsbD0iIzQ3NDc1MyIvPgo8cmVjdCB4PSIzNzAiIHk9IjIyMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNTQwIiBjeT0iMjYwIiByPSI1NSIgZmlsbD0iIzEwYjk4MSIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPGNpcmNsZSBjeD0iNTQwIiBjeT0iMjYwIiByPSI0MCIgZmlsbD0iIzEwYjk4MSIvPgo8Y2lyY2xlIGN4PSI1NDAiIGN5PSIyNDAiIHI9IjE4IiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSI1MzQiIGN5PSIyMzciIHI9IjMiIGZpbGw9IiM0NzQ3NTMiLz4KPGNpcmNsZSBjeD0iNTQ2IiBjeT0iMjM3IiByPSIzIiBmaWxsPSIjNDc0NzUzIi8+CjxlbGxpcHNlIGN4PSI1NDAiIGN5PSIyNDgiIHJ4PSI4IiByeT0iNSIgZmlsbD0iIzQ3NDc1MyIvPgo8cmVjdCB4PSI1MTAiIHk9IjI4MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMwMCAyMDBMMzYwIDIyMEwzMDAgMjQwIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik00NDAgMjMwTDUwMCAyMDBMNTAwIDI2MCIgc3Ryb2tlPSIjZWM0ODk5IiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cmVjdCB4PSIxODAiIHk9IjM0MCIgd2lkdGg9IjExMCIgaGVpZ2h0PSIyNiIgcng9IjEzIiBmaWxsPSIjOGI1Y2Y2Ii8+CjxyZWN0IHg9IjMxMCIgeT0iMzQwIiB3aWR0aD0iMTEwIiBoZWlnaHQ9IjI2IiByeD0iMTMiIGZpbGw9IiNlYzQ4OTkiLz4KPHJlY3QgeD0iNDQwIiB5PSIzNDAiIHdpZHRoPSIxMTAiIGhlaWdodD0iMjYiIHJ4PSIxMyIgZmlsbD0iIzEwYjk4MSIvPgo8dGV4dCB4PSIyMzUiIHk9IjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCI+TUTQ+VU1FTlRTPC90ZXh0Pgo8dGV4dCB4PSIzNjUiIHk9IjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCI+TUVTU0FHSU5HPC90ZXh0Pgo8dGV4dCB4PSI0OTUiIHk9IjM1NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZm9udC13ZWlnaHQ9IjYwMCI+UkVQT1JUUzwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSI0NTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMyZDE3NTUiIGZmbnQtZmFtaWx5PSJzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzNCIgZm9udC13ZWlnaHQ9IjcwMCI+VGVhbSBDb2xsYWJvcmF0aW9uPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjQ3OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzU2NDI2YyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iNTAwIj5TZWFtbGVzcyBjb21tdW5pY2F0aW9uIGFjcm9zcyBhbGwgZGVwYXJ0bWVudHM8L3RleHQ+Cjwvc3ZnPg==",
      alt: "Team Collaboration",
      title: "Team Collaboration",
      description: "Seamless communication across all healthcare departments"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9Im1hcmtldCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiMwNmI2ZDQiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzY2OGY0Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjxyYWRpYWxHcmFkaWVudCBpZD0iZ2xvdzUiIGN4PSIwLjUiIGN5PSIwLjUiIHI9IjAuNyI+CjxzdG9wIHN0b3AtY29sb3I9IndndSF0ZSIgc3RvcC1vcGFjaXR5PSIwLjMiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSJ3aGl0ZSIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9Ijc4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSJ1cmwoI21hcmtldCkiLz4KPGNpcmNsZSBjeD0iNDAwIiBjeT0iMjUwIiByPSIzMDAiIGZpbGw9InVybCgjZ2xvdzUpIiBvcGFjaXR5PSIwLjUiLz4KPHJlY3QgeD0iMTAwIiB5PSI4MCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSIzNDAiIHJ4PSIzMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45OCIgc3Ryb2tlPSIjMDZiNmQ0IiBzdHJva2Utd2lkdGg9IjMiLz4KPHJlY3QgeD0iMTQwIiB5PSIxMjAiIHdpZHRoPSI1MjAiIGhlaWdodD0iMjYwIiByeD0iMTYiIGZpbGw9IiNmY2ZkZmYiLz4KPHJlY3QgeD0iMTgwIiB5PSIxNjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iIzA2YjZkNCIgZmlsbC1vcGFjaXR5PSIwLjEiIHN0Um9rZT0iIzA2YjZkNCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjIzMCIgY3k9IjE4MCIgcj0iMTIiIGZpbGw9IiMwNmI2ZDQiLz4KPHJlY3QgeD0iMTkwIiB5PSIyMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iIzA2YjZkNCIgb3BhY2l0eT0iMC42Ii8+CjxyZWN0IHg9IjE5MCIgeT0iMjE1IiB3aWR0aD0iNjAiIGhlaWdodD0iOCIgcng9IjQiIGZpbGw9IiMwNmI2ZDQiIG9wYWNpdHk9IjAuNCIvPgo8cmVjdCB4PSIzMDAiIHk9IjE2MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4MCIgcng9IjEyIiBmaWxsPSIjMzY2OGY0IiBmaWxsLW9wYWNpdHk9IjAuMSIgc3Ryb2tlPSIjMzY2OGY0IiBzdHJva2Utd2lkdGg9IjIiLz4KPGNpcmNsZSBjeD0iMzUwIiBjeT0iMTgwIiByPSIxMiIgZmlsbD0iIzM2NjhmNCIvPgo8cmVjdCB4PSIzMTAiIHk9IjIwMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjMzY2OGY0IiBvcGFjaXR5PSIwLjYiLz4KPHJlY3QgeD0iMzEwIiB5PSIyMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iIzM2NjhmNCIgb3BhY2l0eT0iMC40Ii8+CjxyZWN0IHg9IjQyMCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjgwIiByeD0iMTIiIGZpbGw9IiMxMGI5ODEiIGZPbGwtb3BhY2l0eT0iMC4xIiBzdHJva2U9IiMxMGI5ODEiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSI0NzAiIGJ5PSIxODAiIHI9IjEyIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjQzMCIgeT0iMjAwIiB3aWR0aD0iODAiIGhlaWdodD0iOCIgcng9IjQiIGZpbGw9IiMxMGI5ODEiIG9wYWNpdHk9IjAuNiIvPgo8cmVjdCB4PSI0MzAiIHk9IjIxNSIgd2lkdGg9IjYwIiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjQiLz4KPHJlY3QgeD0iNTQwIiB5PSIxNjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iODAiIHJ4PSIxMiIgZmlsbD0iI2Y1OWUwYiIgZmlsbC1vcGFjaXR5PSIwLjEiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjU5MCIgY3k9IjE4MCIgcj0iMTIiIGZpbGw9IiNmNTllMGIiLz4KPHJlY3QgeD0iNTUwIiB5PSIyMDAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iI2Y1OWUwYiIgb3BhY2l0eT0iMC42Ii8+CjxyZWN0IHg9IjU1MCIgeT0iMjE1IiB3aWR0aD0iNjAiIGhlaWdodD0iOCIgcng9IjQiIGZpbGw9IiNmNTllMGIiIG9wYWNpdHk9IjAuNCIvPgo8cmVjdCB4PSIyMDAiIHk9IjI2MCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MCIgcng9IjE2IiBmaWxsPSIjZjhmYWZjIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIzNDAiIGN5PSIyOTAiIHI9IjEyIiBmaWxsPSIjMTBiOTgxIi8+CjxyZWN0IHg9IjM2MCIgeT0iMjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iIzEwYjk4MSIgb3BhY2l0eT0iMC4zIi8+CjxyZWN0IHg9IjM2MCIgeT0iMjk1IiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iIzEwYjk4MSIgb3BhY2l0eT0iMC4yIi8+CjxyZWN0IHg9IjE4MCIgeT0iMzQwIiB3aWR0aD0iNDQwIiBoZWlnaHQ9IjMwIiByeD0iMTUiIGZpbGw9IiMwNmI2ZDQiLz4KPHRleHQgeD0iNDAwIiB5PSIzNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTciIGZvbnQtd2VpZ2h0PSI2MDAiPk1FRElDQUwgTUFSS0VUUExBQ0U8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMjkzNzQ0IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzQiIGZvbnQtd2VpZ2h0PSI3MDAiPk1lZGljYWwgTWFya2V0cGxhY2U8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDc4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxml9IiM0Y2ZjVjIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI1MDAiPkNvbm5lY3RpbmcgcHJvdmlkZXJzIHdpdGggbWVkaWNhbCBzdXBwbGllcnM8L3RleHQ+Cjwvc3ZnPg==",
      alt: "Medical Marketplace",
      title: "Medical Marketplace",
      description: "Connecting healthcare providers with medical suppliers and equipment"
    }
  ];

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % healthcareImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [healthcareImages.length]);

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Main Image Display */}
      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
        {healthcareImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {/* Overlay with gradient and text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
              <div className="p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                <p className="text-lg text-white/90">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {healthcareImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-emerald-600 w-8'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* Thumbnail Navigation */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {healthcareImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`relative h-20 rounded-lg overflow-hidden transition-all duration-300 ${
              index === currentImageIndex
                ? 'ring-2 ring-emerald-600 ring-offset-2'
                : 'hover:opacity-80'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 transition-opacity ${
              index === currentImageIndex ? 'bg-emerald-600/20' : 'bg-black/20'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  // Fetch platform statistics from backend
  const { data: platformData, isLoading } = useQuery<PlatformData>({
    queryKey: ['/api/platform/stats'],
    queryFn: async () => {
      const response = await fetch('/api/platform/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch platform statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const stats = platformData?.statistics || {
    organizations: 0,
    users: 1,
    uptime: "99.9%",
    languages: 50,
    responseTime: "<2s",
    support: "24/7"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/30">


      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            {/* Trust Badge */}
            <Badge className="mb-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              HIPAA Compliant • SOC 2 Type II • FDA 21 CFR Part 11
            </Badge>
            
            {/* Main Headline - Benefit-Focused */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Reduce Healthcare
              </span>
              <br />
              <span className="text-slate-900">Admin Burden by 40%</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Streamline hospital operations with NaviMED's complete healthcare management platform. 
              HIPAA-compliant solution trusted by 200+ healthcare facilities worldwide.
            </p>

            {/* Social Proof Numbers */}
            <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">200+</div>
                <div className="text-sm text-slate-600">Healthcare facilities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
                <div className="text-sm text-slate-600">Patient records daily</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">99.9%</div>
                <div className="text-sm text-slate-600">Uptime guarantee</div>
              </div>
            </div>
            
            {/* Multiple CTA Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Book a Demo
              </Button>

              <Button size="lg" variant="ghost" className="text-slate-600 hover:text-slate-800 px-8 py-4 text-lg">
                <Monitor className="w-5 h-5 mr-2" />
                See Platform Tour
              </Button>
            </div>

            {/* Urgency Element */}
            <div className="mb-8">
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Limited Time: Free implementation for next 10 sign-ups
              </Badge>
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 text-sm">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <Monitor className="w-4 h-4 mr-2" />
                  Provider Login
                </Button>
              </Link>
              <Link href="/patient-login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <User className="w-4 h-4 mr-2" />
                  Patient Portal
                </Button>
              </Link>
            </div>
            
            {/* Stats - Connected to Backend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? "..." : stats.uptime}
                </div>
                <div className="text-slate-600 font-medium">Uptime SLA</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? "..." : `${stats.languages}+`}
                </div>
                <div className="text-slate-600 font-medium">Languages</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? "..." : stats.responseTime}
                </div>
                <div className="text-slate-600 font-medium">Response Time</div>
              </div>
              <div className="space-y-3">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? "..." : stats.support}
                </div>
                <div className="text-slate-600 font-medium">Expert Support</div>
              </div>
            </div>
            
            {/* Live Platform Status Indicator */}
            {platformData && (
              <div className="mt-12 flex items-center justify-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Platform Status: {platformData.status}</span>
                </div>
                <div className="text-slate-500">
                  {stats.organizations} organizations • {stats.users} users active
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Advertisement Marketplace Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <Megaphone className="w-4 h-4 mr-2" />
              New Feature Launch
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Medical Device <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Advertisement Marketplace</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover and showcase cutting-edge medical devices, healthcare services, and innovative solutions 
              from trusted vendors and service providers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Stethoscope className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Medical Equipment</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Browse advanced diagnostic equipment, surgical instruments, and cutting-edge medical technology from certified vendors.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Healthcare Services</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Connect with specialized healthcare service providers, consultants, and professional support services.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Zap className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Innovation Hub</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Discover the latest healthcare innovations, research partnerships, and technology solutions for modern medicine.
                </p>
              </CardContent>
            </Card>
          </div>


        </div>
      </section>

      {/* Professional Image Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Trusted by Healthcare <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Professionals Worldwide</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how healthcare organizations are transforming patient care with our platform
            </p>
          </div>
          
          <ImageCarousel />
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Brain className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
              Enterprise-Grade <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Healthcare Platform</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Complete healthcare management ecosystem with AI-powered insights, real-time translation, 
              and military-grade security for modern healthcare organizations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Languages className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Serve diverse communities in 25+ languages</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Break down language barriers with instant multilingual support and AI-powered medical terminology translation for global healthcare delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Bank-level encryption for patient data</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Military-grade security with complete tenant isolation, HIPAA compliance, and comprehensive audit trails for ultimate data protection.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Brain className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">AI-Powered Insights</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Advanced analytics and predictive insights for patient care optimization, resource planning, and clinical decision support.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Stethoscope className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Complete EHR/EMR</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Comprehensive electronic health records with patient management, clinical workflows, and seamless provider collaboration.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-blue-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl transition-colors">
                    <Cloud className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Scale securely as you grow</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Cloud-native architecture with 99.9% uptime SLA, automatic backups, and disaster recovery for seamless expansion.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Smartphone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Mobile-First Design</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Responsive design optimized for all devices with offline capabilities and real-time synchronization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <TrendingUp className="w-4 h-4 mr-2" />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              Real Results from Healthcare <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Leaders</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how healthcare organizations achieved measurable improvements with NaviMED
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dr. Sarah Chen</h4>
                    <p className="text-sm text-slate-600">CIO, Metro General Hospital</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "NaviMED reduced our prescription processing time by 60% and eliminated medication errors completely. The multi-language support has been a game-changer for our diverse patient community."
                </blockquote>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  60% faster processing • Zero medication errors
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Pill className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Michael Rodriguez</h4>
                    <p className="text-sm text-slate-600">Director, MediCare Pharmacy</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "The unified platform streamlined our entire workflow. We're now serving 40% more patients with the same staff, and patient satisfaction scores increased to 98%."
                </blockquote>
                <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                  <Users className="w-4 h-4" />
                  40% more capacity • 98% satisfaction
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 bg-white">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dr. Priya Patel</h4>
                    <p className="text-sm text-slate-600">Lab Director, Advanced Diagnostics</p>
                  </div>
                </div>
                <blockquote className="text-slate-700 italic mb-4">
                  "Lab result turnaround time dropped from 3 days to 8 hours. The real-time notifications and automated reporting saved us countless hours of manual work."
                </blockquote>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  8-hour turnaround • Automated reporting
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Monitor className="w-4 h-4 mr-2" />
              Platform Preview
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              See NaviMED in <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore our intuitive dashboard designed for healthcare professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Dashboard Screenshot */}
            <Card className="group border-slate-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-emerald-50 to-blue-50 rounded-t-lg p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-lg shadow-lg p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="h-8 bg-emerald-100 rounded flex items-center px-3">
                        <div className="w-4 h-4 bg-emerald-600 rounded mr-2"></div>
                        <div className="text-xs text-emerald-700">Hospital Dashboard - Live View</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-blue-50 rounded p-2">
                          <div className="text-xs text-blue-600 mb-1">Appointments</div>
                          <div className="text-lg font-bold text-blue-800">47</div>
                        </div>
                        <div className="h-16 bg-emerald-50 rounded p-2">
                          <div className="text-xs text-emerald-600 mb-1">Prescriptions</div>
                          <div className="text-lg font-bold text-emerald-800">23</div>
                        </div>
                        <div className="h-16 bg-orange-50 rounded p-2">
                          <div className="text-xs text-orange-600 mb-1">Lab Results</div>
                          <div className="text-lg font-bold text-orange-800">12</div>
                        </div>
                      </div>
                      <div className="h-12 bg-slate-50 rounded p-2">
                        <div className="text-xs text-slate-500 mb-1">Recent Activity</div>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <div className="text-xs text-slate-600">Live updates</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Dashboard</h3>
                  <p className="text-slate-600">Comprehensive overview of hospital operations with live metrics and instant notifications.</p>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Interface Screenshot */}
            <Card className="group border-slate-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-emerald-50 rounded-t-lg p-8 flex items-center justify-center">
                  <div className="w-32 h-48 bg-white rounded-2xl shadow-xl p-2 flex flex-col">
                    <div className="h-4 bg-slate-100 rounded-full mb-2 flex items-center justify-center">
                      <div className="w-8 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-blue-100 rounded flex items-center px-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
                        <div className="text-xs text-blue-700">Patient Portal</div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 bg-emerald-50 rounded px-1 flex items-center">
                          <div className="text-xs text-emerald-600">Appointments</div>
                        </div>
                        <div className="h-4 bg-blue-50 rounded px-1 flex items-center">
                          <div className="text-xs text-blue-600">Prescriptions</div>
                        </div>
                        <div className="h-4 bg-orange-50 rounded px-1 flex items-center">
                          <div className="text-xs text-orange-600">Lab Results</div>
                        </div>
                      </div>
                      <div className="h-8 bg-emerald-100 rounded p-1">
                        <div className="text-xs text-emerald-700">Quick Actions</div>
                        <div className="flex gap-1 mt-1">
                          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                          <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Mobile-First Design</h3>
                  <p className="text-slate-600">Optimized for healthcare professionals on the go with intuitive touch interfaces.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              Trusted by Healthcare Organizations Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of healthcare professionals who rely on our platform for secure, efficient patient care.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-slate-600 font-medium">Healthcare Organizations</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-slate-600 font-medium">Patient Records Managed</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
              <div className="text-slate-600 font-medium">Customer Satisfaction</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center border-0 shadow-lg">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">HIPAA Compliant</h4>
              <p className="text-slate-600 text-sm">Full healthcare compliance certification</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">SOC 2 Type II</h4>
              <p className="text-slate-600 text-sm">Enterprise security standards</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">Global Ready</h4>
              <p className="text-slate-600 text-sm">Multi-language, multi-region support</p>
            </Card>
            <Card className="p-6 text-center border-0 shadow-lg">
              <Headphones className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-bold text-slate-900 mb-2">24/7 Support</h4>
              <p className="text-slate-600 text-sm">Expert healthcare IT support</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Healthcare Solutions */}
      <section id="solutions" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Comprehensive Healthcare Ecosystem
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Supporting all healthcare organizations with specialized workflows and integrations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hospitals & Clinics</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Patient Management System
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Electronic Health Records
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Appointment Scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Clinical Workflows
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pill className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pharmacies</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Prescription Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Inventory Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Drug Interaction Checking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    Insurance Integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TestTube className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Laboratories</h3>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Lab Order Management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Results Processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Quality Control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    LIMS Integration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Built with security-first architecture and comprehensive compliance standards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">End-to-End Encryption</h3>
              <p className="text-slate-600 dark:text-slate-300">256-bit AES encryption for all data at rest and in transit</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Role-Based Access</h3>
              <p className="text-slate-600 dark:text-slate-300">Granular permissions and healthcare-specific role management</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Audit Trails</h3>
              <p className="text-slate-600 dark:text-slate-300">Complete activity logging for HIPAA compliance and forensics</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Compliance Ready</h3>
              <p className="text-slate-600 dark:text-slate-300">HIPAA, HITECH, and international healthcare standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Healthcare Organization?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Join leading healthcare organizations using NAVIMED to deliver better patient care 
            with secure, multilingual, and compliant healthcare management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8">
                <Heart className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <a href="#contact" className="inline-block">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Users className="w-5 h-5 mr-2" />
                Schedule Demo
              </Button>
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-emerald-100">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Trusted by 500+ Healthcare Organizations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-300" />
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-300" />
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Independent Organizations Registration */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-green-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Register as Independent Organization
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join the NAVIMED network as an independent healthcare service provider and expand your reach
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                    <TestTube className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Laboratory Services</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Join as an independent diagnostic laboratory with comprehensive testing capabilities and seamless result integration with healthcare providers across the network.
                </p>
                <div className="mb-6">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Receive lab orders from multiple healthcare providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Automated result reporting and integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Quality control and compliance tracking
                    </li>
                  </ul>
                </div>
                <Link href="/laboratory-registration">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Register Laboratory
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <Pill className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pharmacy Services</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Register as an independent pharmacy to receive prescriptions from healthcare providers and manage patient medication needs with complete insurance processing and delivery management.
                </p>
                <div className="mb-6">
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Receive prescriptions from multiple healthcare providers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Insurance claim processing and approval workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-500" />
                      Delivery management and patient communication
                    </li>
                  </ul>
                </div>
                <Link href="/pharmacy-registration">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Register Pharmacy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Medical Device Marketplace */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
              Medical Device Marketplace
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Browse certified medical equipment from approved suppliers with transparent pricing and seamless ordering
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <Card className="border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Diagnostic Equipment</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Digital stethoscopes, ultrasound machines, and advanced diagnostic tools from certified manufacturers
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>FDA Approved</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                    <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Surgical Instruments</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Premium surgical instrument sets, precision tools, and sterile equipment for medical procedures
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>CE Certified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <Laptop className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Patient Monitoring</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Advanced patient monitoring systems, vital sign equipment, and real-time tracking devices
                </p>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>ISO 13485</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                For Medical Device Suppliers
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Join our marketplace as a certified medical device supplier and reach healthcare organizations nationwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/supplier-portal">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    <Building2 className="w-5 h-5 mr-2" />
                    Supplier Portal
                  </Button>
                </Link>
                <a href="/supplier-login-direct" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Supplier Login
                  </Button>
                </a>
                <a href="/supplier-dashboard-direct" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8">
                    <Megaphone className="w-5 h-5 mr-2" />
                    Advertiser Dashboard
                  </Button>
                </a>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                New suppliers: Register to join our marketplace • Existing suppliers: Login to manage products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-700">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Ready to Transform Your Healthcare Operations?
            </h2>
            <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
              Join the future of healthcare management with our enterprise-grade platform. 
              Start your 14-day free trial today - no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl px-8 py-4 text-lg font-semibold">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#contact" className="px-8 py-4 text-lg font-semibold text-white border-2 border-white hover:bg-white hover:text-emerald-600 transition-all duration-300 rounded-lg inline-flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Schedule Demo
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-white/90">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">14-Day Free Trial</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-200" />
                <span className="font-medium">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Let's Build the Future of Healthcare Together
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Our healthcare technology experts are ready to help you implement 
                the perfect solution for your organization's unique needs.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Sales Team</div>
                    <div className="text-slate-300">314-472-3839</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Enterprise Sales</div>
                    <div className="text-slate-300">info@argilette.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">24/7 Technical Support</div>
                    <div className="text-slate-300">Available for all Enterprise customers</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="bg-white text-slate-900 p-8">
              <h3 className="text-2xl font-bold mb-6">Schedule Your Personal Demo</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const organization = formData.get('organization');
                alert('Demo request submitted for ' + firstName + ' ' + lastName + ' from ' + organization + '. We will contact you within 24 hours!');
                form.reset();
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input name="firstName" type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input name="lastName" type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Work Email</label>
                  <input name="email" type="email" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input name="organization" type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Type</label>
                  <select name="organizationType" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option value="">Select organization type</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                    <option value="pharmacy">Pharmacy</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 py-3 text-lg">
                  Schedule Demo
                  <Calendar className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={navimedLogo} alt="NaviMed" className="h-10 w-10 rounded-lg object-contain" />
                <span className="text-xl font-bold text-white">{brandName}</span>
              </div>
              <p className="text-slate-400">
                Next-generation healthcare management platform with multilingual support and enterprise security.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="/features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="/security" className="hover:text-emerald-400 transition-colors">Security</a></li>
                <li><a href="/integrations" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                <li><a href="/api-docs" className="hover:text-emerald-400 transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="/solutions/hospitals" className="hover:text-emerald-400 transition-colors">Hospitals</a></li>
                <li><a href="/solutions/clinics" className="hover:text-emerald-400 transition-colors">Clinics</a></li>
                <li><a href="/solutions/pharmacies" className="hover:text-emerald-400 transition-colors">Pharmacies</a></li>
                <li><a href="/solutions/laboratories" className="hover:text-emerald-400 transition-colors">Laboratories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/support/documentation" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="/support/help-center" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="/support/contact" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><a href="/support/status" className="hover:text-emerald-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 NAVIMED by ARGILETTE Lab. All rights reserved. Next-Generation Healthcare Management Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}