import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  /** Main title of the metric */
  title: string;
  /** Optional description */
  description?: string;
  /** Current metric value */
  value: string | number;
  /** Unit of measurement */
  unit?: string;
  /** Change from previous period */
  change?: number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Period for the change (e.g., "vs last month") */
  changePeriod?: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Icon color */
  iconColor?: string;
  /** Card size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Optional chart component to embed */
  chart?: React.ReactNode;
  /** Chart position relative to content */
  chartPosition?: 'top' | 'bottom' | 'right';
  /** Status indicator */
  status?: 'positive' | 'negative' | 'neutral' | 'warning';
  /** Custom badge content */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Additional CSS classes */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Data test ID for testing */
  'data-testid'?: string;
}

/**
 * MetricCard - Reusable card component for displaying metrics with charts
 * 
 * Features:
 * - Flexible layout options (horizontal/vertical)
 * - Support for embedded charts in different positions
 * - Trend indicators with color coding
 * - Status indicators and badges
 * - Multiple size variants
 * - Interactive capabilities
 * - Consistent styling across dashboards
 * - TypeScript interfaces for type safety
 * - Accessibility and testing support
 */
export function MetricCard({
  title,
  description,
  value,
  unit = '',
  change,
  trend,
  changePeriod,
  icon: Icon,
  iconColor,
  size = 'md',
  layout = 'vertical',
  chart,
  chartPosition = 'bottom',
  status,
  badge,
  badgeVariant = 'default',
  className,
  onClick,
  'data-testid': testId
}: MetricCardProps) {
  // Size configuration
  const sizeConfig = {
    sm: {
      card: 'p-4',
      title: 'text-sm font-medium',
      value: 'text-xl font-bold',
      description: 'text-xs',
      icon: 'h-4 w-4',
      change: 'text-xs'
    },
    md: {
      card: 'p-6',
      title: 'text-sm font-medium',
      value: 'text-3xl font-bold',
      description: 'text-sm',
      icon: 'h-8 w-8',
      change: 'text-sm'
    },
    lg: {
      card: 'p-8',
      title: 'text-base font-semibold',
      value: 'text-4xl font-bold',
      description: 'text-base',
      icon: 'h-10 w-10',
      change: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Determine colors based on status and trend
  const getStatusColors = () => {
    if (status) {
      switch (status) {
        case 'positive':
          return {
            value: 'text-green-600',
            icon: 'text-green-600'
          };
        case 'negative':
          return {
            value: 'text-red-600',
            icon: 'text-red-600'
          };
        case 'warning':
          return {
            value: 'text-orange-600',
            icon: 'text-orange-600'
          };
        default:
          return {
            value: 'text-gray-900',
            icon: iconColor || 'text-gray-600'
          };
      }
    }

    return {
      value: 'text-gray-900',
      icon: iconColor || 'text-gray-600'
    };
  };

  const colors = getStatusColors();

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!change || trend === 'neutral') return null;

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

    return (
      <div className={cn('flex items-center space-x-1', config.change)}>
        <TrendIcon className={cn('h-3 w-3', trendColor)} />
        <span className={trendColor}>
          {Math.abs(change).toFixed(1)}%
        </span>
        {changePeriod && (
          <span className="text-gray-500">
            {changePeriod}
          </span>
        )}
      </div>
    );
  };

  // Render main content
  const renderContent = () => (
    <div className={cn(
      layout === 'horizontal' ? 'flex items-center justify-between' : 'space-y-1'
    )}>
      <div className={cn(
        layout === 'horizontal' ? 'flex-1' : 'w-full'
      )}>
        <div className="flex items-center justify-between">
          <p className={cn('text-gray-600', config.title)}>{title}</p>
          {badge && (
            <Badge variant={badgeVariant} className="ml-2">
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="flex items-baseline space-x-1 mt-1">
          <p className={cn(colors.value, config.value)}>
            {value}
          </p>
          {unit && (
            <span className={cn('text-gray-500', config.change)}>
              {unit}
            </span>
          )}
        </div>

        {description && (
          <p className={cn('text-gray-500 mt-1', config.description)}>
            {description}
          </p>
        )}

        {(change !== undefined || trend) && (
          <div className="mt-2">
            {getTrendIndicator()}
          </div>
        )}
      </div>

      {Icon && layout === 'horizontal' && (
        <div className="ml-4">
          <Icon className={cn(config.icon, colors.icon)} />
        </div>
      )}
    </div>
  );

  // Render chart if provided
  const renderChart = () => {
    if (!chart) return null;
    
    return (
      <div className={cn(
        'w-full',
        chartPosition === 'top' && 'mb-4',
        chartPosition === 'bottom' && 'mt-4',
        chartPosition === 'right' && layout === 'horizontal' && 'ml-4 flex-1'
      )}>
        {chart}
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className={config.card}>
        {chartPosition === 'top' && renderChart()}
        
        <div className={cn(
          layout === 'horizontal' && chartPosition === 'right' ? 'flex items-center' : 'block'
        )}>
          {renderContent()}
          {layout === 'horizontal' && chartPosition === 'right' && renderChart()}
        </div>
        
        {Icon && layout === 'vertical' && (
          <div className="mt-3">
            <Icon className={cn(config.icon, colors.icon)} />
          </div>
        )}
        
        {chartPosition === 'bottom' && renderChart()}
      </CardContent>
    </Card>
  );
}

export default MetricCard;