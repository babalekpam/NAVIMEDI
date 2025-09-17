import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label
} from 'recharts';
import { cn } from '@/lib/utils';

interface DistributionDataPoint {
  /** Category name */
  name: string;
  /** Numeric value */
  value: number;
  /** Optional custom color (overrides config) */
  fill?: string;
  /** Optional percentage (calculated if not provided) */
  percentage?: number;
}

interface DistributionChartProps {
  /** Chart data with name, value, and optional fill */
  data: DistributionDataPoint[];
  /** Chart configuration for colors and labels */
  chartConfig: ChartConfig;
  /** Type of distribution chart */
  chartType?: 'pie' | 'donut';
  /** Height of the chart container */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Inner radius for donut charts (percentage) */
  innerRadius?: number;
  /** Outer radius (percentage) */
  outerRadius?: number;
  /** Padding angle between segments */
  paddingAngle?: number;
  /** Center label for donut charts */
  centerLabel?: string;
  /** Center value for donut charts */
  centerValue?: string | number;
  /** Enable percentage labels on segments */
  showPercentageLabels?: boolean;
  /** Data test ID for testing */
  'data-testid'?: string;
}

/**
 * DistributionChart - Reusable pie/donut chart component for status distributions
 * 
 * Features:
 * - Support for pie and donut chart types
 * - Customizable colors via chartConfig or data.fill
 * - Center labels for donut charts
 * - Interactive legend and tooltips
 * - Automatic percentage calculation
 * - Responsive design
 * - TypeScript interfaces for type safety
 * - Accessibility and testing support
 */
export function DistributionChart({
  data,
  chartConfig,
  chartType = 'pie',
  height = '300px',
  className,
  showLegend = true,
  legendPosition = 'bottom',
  innerRadius = chartType === 'donut' ? 60 : 0,
  outerRadius = 100,
  paddingAngle = 5,
  centerLabel,
  centerValue,
  showPercentageLabels = false,
  'data-testid': testId
}: DistributionChartProps) {
  // Calculate total for percentage calculations
  const total = React.useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  );

  // Enhance data with percentages and colors
  const enhancedData = React.useMemo(() => 
    data.map((item, index) => ({
      ...item,
      percentage: item.percentage ?? Math.round((item.value / total) * 100),
      fill: item.fill ?? getColorFromConfig(item.name, index)
    })),
    [data, total]
  );

  function getColorFromConfig(name: string, index: number): string {
    // Try to find color in config by name (case-insensitive)
    const configKey = Object.keys(chartConfig).find(key => 
      key.toLowerCase() === name.toLowerCase()
    );
    
    if (configKey && chartConfig[configKey] && 'color' in chartConfig[configKey]) {
      return chartConfig[configKey].color!;
    }
    
    // Fallback to default chart colors
    const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))'
    ];
    
    return chartColors[index % chartColors.length];
  }

  const renderCenterLabel = () => {
    if (chartType !== 'donut' || (!centerLabel && !centerValue)) return null;
    
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
        {centerLabel && (
          <tspan x="50%" dy="-0.5em" className="text-sm font-medium fill-muted-foreground">
            {centerLabel}
          </tspan>
        )}
        {centerValue && (
          <tspan x="50%" dy="1.2em" className="text-2xl font-bold fill-foreground">
            {centerValue}
          </tspan>
        )}
      </text>
    );
  };

  const renderCustomLabel = (entry: any) => {
    if (!showPercentageLabels) return null;
    return `${entry.percentage}%`;
  };

  const formatLegendValue = (value: string, entry: any) => (
    <span style={{ color: entry.color }}>
      {value}: {entry.payload?.value || 0} ({entry.payload?.percentage || 0}%)
    </span>
  );

  return (
    <ChartContainer 
      config={chartConfig} 
      className={cn('w-full', className)}
      style={{ height }}
      data-testid={testId}
    >
      <PieChart>
        <Pie
          data={enhancedData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={paddingAngle}
          dataKey="value"
          label={showPercentageLabels ? renderCustomLabel : false}
          labelLine={false}
        >
          {enhancedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill} 
            />
          ))}
          
          {/* Center label for donut charts */}
          {chartType === 'donut' && (centerLabel || centerValue) && (
            <Label
              content={renderCenterLabel}
              position="center"
            />
          )}
        </Pie>
        
        <ChartTooltip 
          content={<ChartTooltipContent />}
        />
        
        {showLegend && (
          <ChartLegend
            content={<ChartLegendContent />}
            verticalAlign={legendPosition === 'top' || legendPosition === 'bottom' ? legendPosition : 'bottom'}
            height={36}
            formatter={formatLegendValue}
          />
        )}
      </PieChart>
    </ChartContainer>
  );
}

export default DistributionChart;