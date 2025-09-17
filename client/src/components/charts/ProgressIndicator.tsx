import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  /** Current value */
  value: number;
  /** Target value to compare against */
  target: number;
  /** Display label for the metric */
  label: string;
  /** Unit of measurement (%, hours, etc.) */
  unit?: string;
  /** Whether higher values are better */
  goalDirection?: 'higher_is_better' | 'lower_is_better';
  /** Visual style variant */
  variant?: 'progress' | 'gauge' | 'minimal';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show target value */
  showTarget?: boolean;
  /** Show percentage achieved */
  showPercentage?: boolean;
  /** Show status icon */
  showStatusIcon?: boolean;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Previous value for trend calculation */
  previousValue?: number;
  /** Additional CSS classes */
  className?: string;
  /** Data test ID for testing */
  'data-testid'?: string;
}

type PerformanceStatus = 'excellent' | 'good' | 'warning' | 'critical';

/**
 * ProgressIndicator - Reusable component for KPI progress bars and metrics
 * 
 * Features:
 * - Support for different goal directions (higher/lower is better)
 * - Multiple visual styles (progress bar, gauge, minimal)
 * - Automatic color coding based on performance
 * - Trend indicators and status icons
 * - Flexible sizing and customization
 * - TypeScript interfaces for type safety
 * - Accessibility and testing support
 */
export function ProgressIndicator({
  value,
  target,
  label,
  unit = '',
  goalDirection = 'higher_is_better',
  variant = 'progress',
  size = 'md',
  showTarget = true,
  showPercentage = true,
  showStatusIcon = true,
  showTrend = false,
  previousValue,
  className,
  'data-testid': testId
}: ProgressIndicatorProps) {
  // Calculate percentage achieved and performance status
  const { percentage, status, isOnTarget } = React.useMemo(() => {
    let percentage: number;
    let isOnTarget: boolean;
    
    if (goalDirection === 'lower_is_better') {
      // For metrics like turnaround time, lower current values are better
      percentage = Math.min((target / value) * 100, 150); // Cap at 150% for display
      isOnTarget = value <= target;
    } else {
      // For metrics like quality score, higher current values are better
      percentage = (value / target) * 100;
      isOnTarget = value >= target;
    }
    
    // Determine status based on percentage
    let status: PerformanceStatus;
    if (percentage >= 100) status = 'excellent';
    else if (percentage >= 85) status = 'good';
    else if (percentage >= 70) status = 'warning';
    else status = 'critical';
    
    return { percentage, status, isOnTarget };
  }, [value, target, goalDirection]);

  // Calculate trend if previous value is provided
  const trend = React.useMemo(() => {
    if (!showTrend || previousValue === undefined) return null;
    
    const change = value - previousValue;
    const changePercentage = Math.abs((change / previousValue) * 100);
    
    let direction: 'up' | 'down' | 'neutral' = 'neutral';
    if (Math.abs(change) > 0.01) { // Threshold for meaningful change
      direction = change > 0 ? 'up' : 'down';
    }
    
    return { direction, change, changePercentage };
  }, [value, previousValue, showTrend]);

  // Get colors based on status
  const getStatusColors = (status: PerformanceStatus) => {
    switch (status) {
      case 'excellent':
        return {
          text: 'text-green-600',
          bg: 'bg-green-100',
          border: 'border-green-200',
          progress: 'bg-green-500'
        };
      case 'good':
        return {
          text: 'text-blue-600',
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          progress: 'bg-blue-500'
        };
      case 'warning':
        return {
          text: 'text-orange-600',
          bg: 'bg-orange-100',
          border: 'border-orange-200',
          progress: 'bg-orange-500'
        };
      case 'critical':
        return {
          text: 'text-red-600',
          bg: 'bg-red-100',
          border: 'border-red-200',
          progress: 'bg-red-500'
        };
    }
  };

  const colors = getStatusColors(status);

  // Get status icon
  const StatusIcon = React.useMemo(() => {
    switch (status) {
      case 'excellent':
        return CheckCircle;
      case 'good':
        return Target;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
    }
  }, [status]);

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'space-y-1',
      label: 'text-xs',
      value: 'text-lg font-semibold',
      progress: 'h-1',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'space-y-2',
      label: 'text-sm',
      value: 'text-2xl font-bold',
      progress: 'h-2',
      icon: 'h-4 w-4'
    },
    lg: {
      container: 'space-y-3',
      label: 'text-base',
      value: 'text-3xl font-bold',
      progress: 'h-3',
      icon: 'h-5 w-5'
    }
  };

  const sizeClass = sizeClasses[size];

  const renderMinimalVariant = () => (
    <div className={cn('flex items-center justify-between', className)} data-testid={testId}>
      <div className="flex items-center space-x-2">
        {showStatusIcon && <StatusIcon className={cn(sizeClass.icon, colors.text)} />}
        <span className={cn('font-medium text-gray-700', sizeClass.label)}>{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={cn(colors.text, sizeClass.value)}>
          {value}{unit}
        </span>
        {showTrend && trend && (
          <div className="flex items-center space-x-1">
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className="text-xs text-gray-500">
              {trend.changePercentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderProgressVariant = () => (
    <div className={cn(sizeClass.container, className)} data-testid={testId}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showStatusIcon && <StatusIcon className={cn(sizeClass.icon, colors.text)} />}
          <span className={cn('font-medium text-gray-700', sizeClass.label)}>{label}</span>
        </div>
        <span className={cn(colors.text, sizeClass.value)}>
          {value}{unit}
        </span>
      </div>
      
      <div className="space-y-1">
        <Progress 
          value={Math.min(percentage, 100)} 
          className={cn(sizeClass.progress, colors.progress)}
        />
        <div className="flex justify-between text-xs text-gray-500">
          {showTarget && <span>Target: {target}{unit}</span>}
          {showPercentage && <span>{percentage.toFixed(1)}%</span>}
        </div>
      </div>
      
      {showTrend && trend && (
        <div className="flex items-center space-x-1 text-xs">
          {trend.direction === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend.direction === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
          <span className="text-gray-500">
            {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}{unit} vs previous
          </span>
        </div>
      )}
    </div>
  );

  const renderGaugeVariant = () => (
    <div className={cn('text-center', sizeClass.container, className)} data-testid={testId}>
      {/* Simplified gauge representation using circular progress */}
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(percentage, 100) / 100)}`}
            className={colors.text}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={cn(colors.text, 'text-lg font-bold')}>
              {value}{unit}
            </div>
            {showPercentage && (
              <div className="text-xs text-gray-500">
                {percentage.toFixed(0)}%
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-2">
        <span className={cn('font-medium', sizeClass.label)}>{label}</span>
        {showTarget && (
          <div className="text-xs text-gray-500 mt-1">
            Target: {target}{unit}
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'minimal') return renderMinimalVariant();
  if (variant === 'gauge') return renderGaugeVariant();
  return renderProgressVariant();
}

export default ProgressIndicator;