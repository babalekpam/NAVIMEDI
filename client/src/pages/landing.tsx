import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/layout/public-header";
import navimedLogo from "@assets/JPG_1753663321927.jpg";
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
  
  // High-quality professional healthcare images
  const healthcareImages = [
    {
      url: "data:image/svg+xml,%3Csvg width='800' height='500' viewBox='0 0 800 500' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='800' height='500' fill='%2310b981'/%3E%3Crect x='80' y='60' width='640' height='380' rx='20' fill='white' fill-opacity='0.95'/%3E%3Ccircle cx='250' cy='200' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='250' cy='180' r='25' fill='%23ffffff'/%3E%3Ccircle cx='242' cy='175' r='3' fill='%23374151'/%3E%3Ccircle cx='258' cy='175' r='3' fill='%23374151'/%3E%3Cpath d='M245 185h10v5h-10z' fill='%23374151'/%3E%3Crect x='220' y='220' width='60' height='80' rx='8' fill='%23ffffff'/%3E%3Crect x='225' y='225' width='50' height='70' rx='4' fill='%2310b981'/%3E%3Ccircle cx='280' cy='180' r='15' fill='%23374151'/%3E%3Cpath d='M295 180L320 160Q325 155 330 160L335 165Q340 170 335 175L330 180Q325 185 320 180L315 175' stroke='%23374151' stroke-width='3' fill='none'/%3E%3Crect x='400' y='120' width='280' height='120' rx='12' fill='%23ffffff' stroke='%23e5e7eb' stroke-width='2'/%3E%3Ccircle cx='430' cy='150' r='8' fill='%2310b981'/%3E%3Crect x='450' y='145' width='180' height='10' rx='5' fill='%23e5e7eb'/%3E%3Ccircle cx='430' cy='170' r='8' fill='%233b82f6'/%3E%3Crect x='450' y='165' width='160' height='10' rx='5' fill='%23e5e7eb'/%3E%3Ccircle cx='430' cy='190' r='8' fill='%23ef4444'/%3E%3Crect x='450' y='185' width='200' height='10' rx='5' fill='%23e5e7eb'/%3E%3Crect x='400' y='280' width='280' height='80' rx='12' fill='%23ffffff' stroke='%23e5e7eb' stroke-width='2'/%3E%3Cellipse cx='540' cy='300' rx='40' ry='15' fill='%23f3f4f6'/%3E%3Ccircle cx='550' cy='285' r='15' fill='%23ffffff'/%3E%3Ccircle cx='545' cy='280' r='2' fill='%23374151'/%3E%3Ccircle cx='555' cy='280' r='2' fill='%23374151'/%3E%3Crect x='150' y='380' width='500' height='60' rx='12' fill='%23ffffff' stroke='%23e5e7eb' stroke-width='2'/%3E%3Crect x='170' y='400' width='100' height='20' rx='10' fill='%2310b981'/%3E%3Crect x='290' y='400' width='100' height='20' rx='10' fill='%233b82f6'/%3E%3Crect x='410' y='400' width='100' height='20' rx='10' fill='%23ec4899'/%3E%3Crect x='530' y='400' width='100' height='20' rx='10' fill='%23ef4444'/%3E%3Ctext x='220' y='415' text-anchor='middle' fill='white' font-family='sans-serif' font-size='12' font-weight='600'%3EDiagnose%3C/text%3E%3Ctext x='340' y='415' text-anchor='middle' fill='white' font-family='sans-serif' font-size='12' font-weight='600'%3ETreat%3C/text%3E%3Ctext x='460' y='415' text-anchor='middle' fill='white' font-family='sans-serif' font-size='12' font-weight='600'%3EFollow%3C/text%3E%3Ctext x='580' y='415' text-anchor='middle' fill='white' font-family='sans-serif' font-size='12' font-weight='600'%3EAlert%3C/text%3E%3C/svg%3E",
      alt: "Doctor Consultation",
      title: "Smart Healthcare Consultations",
      description: "Advanced diagnostic tools with real-time patient-doctor interactions"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImJnMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiMzYjgyZjYiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOWMzOWZmIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9InVybCgjYmcyKSIvPgo8cmVjdCB4PSI4MCIgeT0iNjAiIHdpZHRoPSI2NDAiIGhlaWdodD0iMzgwIiByeD0iMjQiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOTUiLz4KPHJlY3QgeD0iMTIwIiB5PSIxMDAiIHdpZHRoPSI1NjAiIGhlaWdodD0iMzAwIiByeD0iMTIiIGZpbGw9IiNmOGZhZmMiLz4KPHJlY3QgeD0iMTUwIiB5PSIxMzAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyNDAiIHJ4PSI4IiBmaWxsPSIjM2I4MmY2Ii8+CjxyZWN0IHg9IjIyMCIgeT0iMTYwIiB3aWR0aD0iNTAiIGhlaWdodD0iMjEwIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cmVjdCB4PSIyOTAiIHk9IjE4MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjE5MCIgcng9IjgiIGZpbGw9IiM5YzM5ZmYiLz4KPHJlY3QgeD0iMzYwIiB5PSIxNDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyMzAiIHJ4PSI4IiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjQzMCIgeT0iMTIwIiB3aWR0aD0iNTAiIGhlaWdodD0iMjUwIiByeD0iOCIgZmlsbD0iIzEwYjk4MSIvPgo8cmVjdCB4PSI1MDAiIHk9IjE3MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjIwMCIgcng9IjgiIGZpbGw9IiMzYjgyZjYiLz4KPHJlY3QgeD0iNTcwIiB5PSIxNTAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIyMjAiIHJ4PSI4IiBmaWxsPSIjOWMzOWZmIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjExMCIgcj0iOCIgZmlsbD0iIzNiODJmNiIvPgo8Y2lyY2xlIGN4PSIyNDUiIGN5PSIxNDAiIHI9IjgiIGZpbGw9IiMxMGI5ODEiLz4KPGNpcmNsZSBjeD0iMzE1IiBjeT0iMTYwIiByPSI4IiBmaWxsPSIjOWMzOWZmIi8+CjxjaXJjbGUgY3g9IjM4NSIgY3k9IjEyMCIgcj0iOCIgZmlsbD0iI2VmNDQ0NCIvPgo8Y2lyY2xlIGN4PSI0NTUiIGN5PSIxMDAiIHI9IjgiIGZpbGw9IiMxMGI5ODEiLz4KPGNpcmNsZSBjeD0iNTI1IiBjeT0iMTUwIiByPSI4IiBmaWxsPSIjM2I4MmY2Ii8+CjxjaXJjbGUgY3g9IjU5NSIgY3k9IjEzMCIgcj0iOCIgZmlsbD0iIzljMzlmZiIvPgo8dGV4dCB4PSI0MDAiIHk9IjQ1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzNEE1NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIj5BZHZhbmNlZCBBbmFseXRpY3M8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+UmVhbC10aW1lIGRhdGEgaW5zaWdodHMgZm9yIGJldHRlciBjYXJlPC90ZXh0Pgo8L3N2Zz4=",
      alt: "Healthcare Analytics",
      title: "Advanced Healthcare Analytics",
      description: "Real-time data insights and predictive analytics for better patient outcomes"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImJnMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiNlZjQ0NDQiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmJiZjI0Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9InVybCgjYmczKSIvPgo8cmVjdCB4PSIxMDAiIHk9IjgwIiB3aWR0aD0iNjAwIiBoZWlnaHQ9IjM0MCIgcng9IjIwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjk1Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyMCIgcj0iODAiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyMCIgcj0iNjAiIGZpbGw9IiNlZjQ0NDQiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyMCIgcj0iNDAiIGZpbGw9IiNlZjQ0NDQiLz4KPHBhdGggZD0iTTM4MCAyMDBoNDB2NDBoLTQweiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM5MCAyMDVoMjB2MzBoLTIweiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM5NSAyMTBoMTB2MjBoLTEweiIgZmlsbD0iI2VmNDQ0NCIvPgo8cmVjdCB4PSIyMDAiIHk9IjEzMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSI2MCIgcng9IjEwIiBmaWxsPSIjZmJiZjI0IiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8cmVjdCB4PSIyMTAiIHk9IjE0MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iI2VmNDQ0NCIvPgo8cmVjdCB4PSIyMTAiIHk9IjE1NSIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjIxMCIgeT0iMTcwIiB3aWR0aD0iOTAiIGhlaWdodD0iOCIgcng9IjQiIGZpbGw9IiNlZjQ0NDQiLz4KPHJlY3QgeD0iNDgwIiB5PSIxMzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiIHJ4PSIxMCIgZmlsbD0iI2ZiYmYyNCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPHJlY3QgeD0iNDkwIiB5PSIxNDAiIHdpZHRoPSIxMDAiIGhlaWdodD0iOCIgcng9IjQiIGZpbGw9IiNlZjQ0NDQiLz4KPHJlY3QgeD0iNDkwIiB5PSIxNTUiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4IiByeD0iNCIgZmlsbD0iI2VmNDQ0NCIvPgo8cmVjdCB4PSI0OTAiIHk9IjE3MCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjgiIHJ4PSI0IiBmaWxsPSIjZWY0NDQ0Ii8+CjxyZWN0IHg9IjI4MCIgeT0iMzEwIiB3aWR0aD0iMjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNlZjQ0NDQiLz4KPHRleHQgeD0iNDAwIiB5PSIzMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkVNRVJHRU5DWSBBTEVSVDwvdGV4dD4KPHRleHQgeD0iNDAwIiB5PSIzOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzMzRBNTUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iYm9sZCI+RW1lcmdlbmN5IEhlYWx0aGNhcmU8L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+MjQvNyBjcml0aWNhbCBjYXJlIGFuZCBlbWVyZ2VuY3kgc2VydmljZXM8L3RleHQ+CjxwYXRoIGQ9Ik0yMjAgMjcwaDI0djI0aC0yNHoiIGZpbGw9IiNlZjQ0NDQiLz4KPHBhdGggZD0iTTI2MCAyNzBoMjR2MjRoLTI0eiIgZmlsbD0iI2VmNDQ0NCIvPgo8cGF0aCBkPSJNNTAwIDI3MGgyNHYyNGgtMjR6IiBmaWxsPSIjZWY0NDQ0Ii8+CjxwYXRoIGQ9Ik01NDAgMjcwaDI0djI0aC0yNHoiIGZpbGw9IiNlZjQ0NDQiLz4KPC9zdmc+",
      alt: "Emergency Healthcare",
      title: "24/7 Emergency Healthcare",
      description: "Critical care systems with real-time monitoring and instant alerts"
    },
    {
      url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImJnNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIHN0b3AtY29sb3I9IiM4YjVjZjYiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZWM0ODk5Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9InVybCgjYmc0KSIvPgo8cmVjdCB4PSI4MCIgeT0iODAiIHdpZHRoPSI2NDAiIGhlaWdodD0iMzQwIiByeD0iMjAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOTUiLz4KPHJlY3QgeD0iMTIwIiB5PSIxMjAiIHdpZHRoPSI1NjAiIGhlaWdodD0iMjYwIiByeD0iMTIiIGZpbGw9IiNmOGZhZmMiLz4KPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjMwIiByPSI1MCIgZmlsbD0iIzhiNWNmNiIgZmlsbC1vcGFjaXR5PSIwLjIiLz4KPGNpcmNsZSBjeD0iMjQwIiBjeT0iMjMwIiByPSIzNSIgZmlsbD0iIzhiNWNmNiIvPgo8cGF0aCBkPSJNMjIwIDIxNWg0MHYzMGgtNDB6IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CjxwYXRoIGQ9Ik0yMjUgMjIwaDMwdjIwaC0zMHoiIGZpbGw9IiM4YjVjZjYiIG9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyMDAiIHI9IjUwIiBmaWxsPSIjZWM0ODk5IiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyMDAiIHI9IjM1IiBmaWxsPSIjZWM0ODk5Ii8+CjxwYXRoIGQ9Ik0zODAgMTg1aDQwdjMwaC00MHoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KPHBhdGggZD0iTTM4NSAxOTBoMzB2MjBoLTMweiIgZmlsbD0iI2VjNDg5OSIgb3BhY2l0eT0iMC4zIi8+CjxjaXJjbGUgY3g9IjU2MCIgY3k9IjI2MCIgcj0iNTAiIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4yIi8+CjxjaXJjbGUgY3g9IjU2MCIgY3k9IjI2MCIgcj0iMzUiIGZpbGw9IiMxMGI5ODEiLz4KPHBhdGggZD0iTTU0MCAyNDVoNDB2MzBoLTQweiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPgo8cGF0aCBkPSJNNTQ1IDI1MGgzMHYyMGgtMzB6IiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjMiLz4KPHBhdGggZD0iTTI4MCAyMDBMMzUwIDIzMEwyODAgMjYwIiBzdHJva2U9IiM4YjVjZjYiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNNDQwIDIzMEw1MTAgMjAwTDUxMCAyNjAiIHN0cm9rZT0iI2VjNDg5OSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+CjxyZWN0IHg9IjE2MCIgeT0iMzMwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMwIiByeD0iMTUiIGZpbGw9IiM4YjVjZjYiLz4KPHJlY3QgeD0iMzAwIiB5PSIzMzAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzAiIHJ4PSIxNSIgZmlsbD0iI2VjNDg5OSIvPgo8cmVjdCB4PSI0NDAiIHk9IjMzMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIzMCIgcng9IjE1IiBmaWxsPSIjMTBiOTgxIi8+Cjx0ZXh0IHg9IjIyMCIgeT0iMzUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5ET0NVTUVOVFM8L3RleHQ+Cjx0ZXh0IHg9IjM2MCIgeT0iMzUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5NRVNTQUdJTkc8L3RleHQ+Cjx0ZXh0IHg9IjUwMCIgeT0iMzUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5SRVBPUlRTPC90ZXh0Pgo8dGV4dCB4PSI0MDAiIHk9IjQwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzMzNEE1NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIj5UZWFtIENvbGxhYm9yYXRpb248L3RleHQ+Cjx0ZXh0IHg9IjQwMCIgeT0iNDMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhCIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+U2VhbWxlc3MgY29tbXVuaWNhdGlvbiBhY3Jvc3MgYWxsIGRlcGFydG1lbnRzPC90ZXh0Pgo8L3N2Zz4=",
      alt: "Team Collaboration",
      title: "Seamless Team Collaboration",
      description: "Integrated communication platform connecting all healthcare departments"
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
      {/* BRIGHT MARKETPLACE BANNER - IMPOSSIBLE TO MISS */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 text-center">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-4 text-lg font-bold">
            <Package className="w-6 h-6" />
            <span>🚀 NEW: MEDICAL DEVICE MARKETPLACE NOW LIVE! 🚀</span>
            <Link href="/advertisements">
              <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-2 ml-4">
                EXPLORE NOW →
              </Button>
            </Link>
          </div>
        </div>
      </div>

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
            
            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-slate-900">Healthcare Delivery</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Enterprise-grade healthcare management platform with real-time multilingual translation, 
              complete tenant isolation, and intelligent workflow automation.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl shadow-emerald-600/25 px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              {/* PROMINENT MARKETPLACE BUTTON */}
              <Link href="/advertisements">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-xl shadow-red-500/25 px-8 py-4 text-lg text-white font-bold">
                  <Package className="w-5 h-5 mr-2" />
                  🚀 MARKETPLACE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <a href="/api/login">
                <Button size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  <Monitor className="w-5 h-5 mr-2" />
                  Provider Login
                </Button>
              </a>
              <Link href="/supplier-register">
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg">
                  <Package className="w-5 h-5 mr-2" />
                  Supplier Register
                </Button>
              </Link>
              <Link href="/supplier-marketplace">
                <Button size="lg" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Supplier Marketplace
                </Button>
              </Link>
              <Link href="/patient-login">
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg">
                  <User className="w-5 h-5 mr-2" />
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

          <div className="text-center bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 text-white">
            <div className="mb-6">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Package className="w-4 h-4 mr-2" />
                NEW: Medical Device Marketplace
              </Badge>
              <h3 className="text-3xl font-bold mb-2">Discover Medical Solutions</h3>
              <p className="text-lg text-white/90 mb-6">
                Connect with leading medical device vendors and healthcare service providers. 
                Browse innovative solutions and streamline your procurement process.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/advertisements">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 shadow-xl px-8 py-4 text-lg font-semibold">
                  <Package className="w-5 h-5 mr-2" />
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                <Building2 className="w-5 h-5 mr-2" />
                Post Advertisement
              </Button>
            </div>
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
                  <h3 className="text-2xl font-bold text-slate-900">Real-Time Translation</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Instant multilingual support across 50+ languages with AI-powered medical terminology translation for global healthcare delivery.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Military-Grade Security</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Bank-level encryption, complete tenant isolation, and HIPAA compliance with comprehensive audit trails and access controls.
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
                  <h3 className="text-2xl font-bold text-slate-900">Cloud-Native Architecture</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Scalable, reliable infrastructure with 99.9% uptime SLA, automatic backups, and disaster recovery capabilities.
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
            <a href="/api/login">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8">
                <Heart className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
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
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Work Email</label>
                  <input type="email" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization</label>
                  <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Type</label>
                  <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <option>Select organization type</option>
                    <option>Hospital</option>
                    <option>Clinic</option>
                    <option>Pharmacy</option>
                    <option>Laboratory</option>
                    <option>Other</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 py-3 text-lg">
                  Schedule Demo
                  <Calendar className="w-5 h-5 ml-2" />
                </Button>
              </div>
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
            <p>&copy; 2025 NAVIMED By ARGILETTE Labs. All rights reserved. Built for healthcare organizations worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}