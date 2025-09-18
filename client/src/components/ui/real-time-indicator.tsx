/**
 * REAL-TIME UPDATE INDICATORS
 * 
 * Subtle UI components to show users when dashboards are 
 * refreshing with fresh data, providing feedback on the
 * real-time update system.
 */

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";

// ================================
// REAL-TIME STATUS INDICATOR
// ================================

interface RealTimeStatusProps {
  /** Dashboard type for specific styling */
  dashboardType?: 'admin' | 'receptionist' | 'pharmacy' | 'laboratory' | 'super-admin';
  /** Additional CSS classes */
  className?: string;
  /** Show detailed status text */
  showText?: boolean;
}

export function RealTimeStatus({ 
  dashboardType = 'admin', 
  className, 
  showText = false 
}: RealTimeStatusProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor active queries for this dashboard
  const isFetching = useIsFetching({ queryKey: [`/api/analytics/${dashboardType}`] });
  const isUpdating = isFetching > 0;

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track successful updates
  useEffect(() => {
    if (!isUpdating && lastUpdateTime) {
      setUpdateCount(prev => prev + 1);
    }
    if (isUpdating) {
      setLastUpdateTime(new Date());
    }
  }, [isUpdating, lastUpdateTime]);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (isUpdating) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (isUpdating) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isUpdating) return 'Updating...';
    return 'Live';
  };

  const getDetailedStatus = () => {
    if (!isOnline) return 'Dashboard is offline - updates paused';
    if (isUpdating) return `Refreshing ${dashboardType} dashboard data...`;
    if (lastUpdateTime) {
      const timeSince = Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000);
      if (timeSince < 60) return `Updated ${timeSince}s ago`;
      const minutesSince = Math.floor(timeSince / 60);
      return `Updated ${minutesSince}m ago`;
    }
    return 'Dashboard is live and up-to-date';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center space-x-2 text-xs", 
            getStatusColor(),
            className
          )}>
            {getStatusIcon()}
            {showText && (
              <span className="font-medium">
                {getStatusText()}
              </span>
            )}
            {updateCount > 0 && !showText && (
              <Badge variant="outline" className="px-1 py-0 text-xs h-4">
                {updateCount}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{getDetailedStatus()}</p>
          {updateCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {updateCount} updates received
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ================================
// DASHBOARD UPDATE BANNER
// ================================

interface DashboardUpdateBannerProps {
  /** Whether dashboard is currently updating */
  isUpdating: boolean;
  /** Last successful update time */
  lastUpdate?: Date;
  /** Dashboard name for display */
  dashboardName?: string;
  /** Callback for manual refresh */
  onManualRefresh?: () => void;
}

export function DashboardUpdateBanner({ 
  isUpdating, 
  lastUpdate, 
  dashboardName = 'Dashboard',
  onManualRefresh 
}: DashboardUpdateBannerProps) {
  if (!isUpdating && !lastUpdate) return null;

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 rounded-lg border transition-all duration-200",
      isUpdating 
        ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200" 
        : "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
    )}>
      <div className="flex items-center space-x-3">
        {isUpdating ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <div>
              <p className="font-medium text-sm">Updating {dashboardName}</p>
              <p className="text-xs opacity-75">Fetching latest data...</p>
            </div>
          </>
        ) : lastUpdate ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <div>
              <p className="font-medium text-sm">{dashboardName} Updated</p>
              <p className="text-xs opacity-75">Last update: {formatLastUpdate(lastUpdate)}</p>
            </div>
          </>
        ) : null}
      </div>
      
      {onManualRefresh && !isUpdating && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onManualRefresh}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      )}
    </div>
  );
}

// ================================
// LIVE DATA INDICATOR
// ================================

interface LiveDataIndicatorProps {
  /** Whether data is live/real-time */
  isLive?: boolean;
  /** Polling interval in seconds */
  pollingInterval?: number;
  /** Custom styling */
  variant?: 'subtle' | 'prominent';
  className?: string;
}

export function LiveDataIndicator({ 
  isLive = true, 
  pollingInterval = 30,
  variant = 'subtle',
  className 
}: LiveDataIndicatorProps) {
  const [pulse, setPulse] = useState(false);
  
  // Pulse animation effect for live updates
  useEffect(() => {
    if (!isLive) return;
    
    // Don't run pulse animation if user is not authenticated
    const token = localStorage.getItem('auth_token');
    if (!token || token === 'null' || token === 'undefined') return;
    
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 200);
    }, pollingInterval * 1000);
    
    return () => clearInterval(interval);
  }, [isLive, pollingInterval]);

  const formatPollingInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  if (variant === 'prominent') {
    return (
      <div className={cn(
        "flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
        isLive 
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        pulse && "scale-105",
        className
      )}>
        <div className={cn(
          "w-2 h-2 rounded-full transition-all duration-200",
          isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
        )} />
        <span>
          {isLive ? `Live (${formatPollingInterval(pollingInterval)})` : 'Paused'}
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center space-x-1",
            className
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              isLive ? "bg-green-500" : "bg-gray-400",
              isLive && pulse && "animate-ping"
            )} />
            <Activity className={cn(
              "h-3 w-3 transition-colors duration-200",
              isLive ? "text-green-600" : "text-gray-400"
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isLive 
              ? `Live data updates every ${formatPollingInterval(pollingInterval)}`
              : 'Real-time updates paused'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ================================
// QUICK STATS UPDATE INDICATOR
// ================================

interface QuickStatsUpdateProps {
  /** Current value */
  value: number;
  /** Previous value for comparison */
  previousValue?: number;
  /** Whether the stat is currently updating */
  isUpdating?: boolean;
  /** Label for the statistic */
  label: string;
  /** Format function for the value */
  formatValue?: (value: number) => string;
}

export function QuickStatsUpdate({ 
  value, 
  previousValue, 
  isUpdating = false,
  label,
  formatValue = (val) => val.toString()
}: QuickStatsUpdateProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const hasChanged = previousValue !== undefined && previousValue !== value;
  const isIncreasing = previousValue !== undefined && value > previousValue;
  
  useEffect(() => {
    if (hasChanged) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasChanged]);

  return (
    <div className="relative">
      <div className={cn(
        "transition-all duration-300",
        isAnimating && "transform scale-105",
        isUpdating && "opacity-75"
      )}>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
        <p className={cn(
          "text-2xl font-bold transition-colors duration-300",
          hasChanged && isIncreasing && "text-green-600 dark:text-green-400",
          hasChanged && !isIncreasing && "text-blue-600 dark:text-blue-400"
        )}>
          {formatValue(value)}
        </p>
      </div>
      
      {/* Change indicator */}
      {hasChanged && (
        <div className={cn(
          "absolute -top-1 -right-1 flex items-center",
          isAnimating ? "animate-bounce" : "animate-pulse"
        )}>
          {isIncreasing ? (
            <Zap className="h-3 w-3 text-green-500" />
          ) : (
            <Activity className="h-3 w-3 text-blue-500" />
          )}
        </div>
      )}
      
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 rounded flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}