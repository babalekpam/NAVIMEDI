import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

interface TrendChartDataPoint {
  [key: string]: string | number;
}

interface TrendChartProps {
  /** Chart data with consistent structure */
  data: TrendChartDataPoint[];
  /** Chart configuration for colors and labels */
  chartConfig: ChartConfig;
  /** Type of trend chart to render */
  chartType?: 'line' | 'area';
  /** Key field for x-axis (usually date/time) */
  xAxisKey: string;
  /** Array of data keys to plot */
  dataKeys: string[];
  /** Height of the chart container */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Enable gradient fills for area charts */
  enableGradients?: boolean;
  /** Enable stacked areas */
  enableStacking?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Custom curve type */
  curveType?: 'linear' | 'natural' | 'monotone' | 'step';
  /** Data test ID for testing */
  'data-testid'?: string;
}

/**
 * TrendChart - Reusable line/area chart component for displaying trends
 * 
 * Features:
 * - Support for line and area chart types
 * - Multiple data series with configurable colors
 * - Gradient fills and stacking for area charts
 * - Responsive design with proper tooltips
 * - TypeScript interfaces for type safety
 * - Accessibility and testing support
 */
export function TrendChart({
  data,
  chartConfig,
  chartType = 'line',
  xAxisKey,
  dataKeys,
  height = '300px',
  className,
  enableGradients = false,
  enableStacking = false,
  showGrid = true,
  curveType = 'monotone',
  'data-testid': testId
}: TrendChartProps) {
  // Generate unique gradient IDs for each data key
  const gradientIds = React.useMemo(() => 
    dataKeys.reduce((acc, key) => ({
      ...acc,
      [key]: `gradient-${key}-${Math.random().toString(36).substr(2, 9)}`
    }), {} as Record<string, string>),
    [dataKeys]
  );

  // Get colors from chart config
  const getColor = (key: string): string => {
    const config = chartConfig[key];
    if (config && 'color' in config && config.color) {
      return config.color;
    }
    return `hsl(var(--chart-${(dataKeys.indexOf(key) % 5) + 1}))`;
  };

  const renderGradients = () => {
    if (!enableGradients || chartType !== 'area') return null;
    
    return (
      <defs>
        {dataKeys.map((key) => {
          const color = getColor(key);
          return (
            <linearGradient key={key} id={gradientIds[key]} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          );
        })}
      </defs>
    );
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;

  return (
    <ChartContainer 
      config={chartConfig} 
      className={cn('w-full', className)} 
      style={{ height }}
      data-testid={testId}
    >
      <ChartComponent data={data}>
        {renderGradients()}
        
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
          />
        )}
        
        <XAxis 
          dataKey={xAxisKey}
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        
        <YAxis 
          className="text-xs" 
          tick={{ fontSize: 12 }} 
        />
        
        <ChartTooltip content={<ChartTooltipContent />} />
        
        {dataKeys.map((key, index) => {
          const color = getColor(key);
          const stackId = enableStacking ? "1" : undefined;
          
          if (chartType === 'area') {
            return (
              <Area
                key={key}
                type={curveType}
                dataKey={key}
                stackId={stackId}
                stroke={color}
                fill={enableGradients ? `url(#${gradientIds[key]})` : color}
                fillOpacity={enableGradients ? 1 : 0.6}
                strokeWidth={2}
              />
            );
          } else {
            return (
              <Line
                key={key}
                type={curveType}
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              />
            );
          }
        })}
      </ChartComponent>
    </ChartContainer>
  );
}

export default TrendChart;