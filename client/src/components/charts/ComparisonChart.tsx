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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

interface ComparisonDataPoint {
  [key: string]: string | number;
}

interface ComparisonChartProps {
  /** Chart data with consistent structure */
  data: ComparisonDataPoint[];
  /** Chart configuration for colors and labels */
  chartConfig: ChartConfig;
  /** Chart orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Key field for labels (category axis) */
  categoryKey: string;
  /** Array of data keys to plot as bars */
  dataKeys: string[];
  /** Height of the chart container */
  height?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Stack bars on top of each other */
  enableStacking?: boolean;
  /** Bar style variant */
  barStyle?: 'rounded' | 'square';
  /** Custom bar radius for rounded bars */
  barRadius?: number;
  /** Enable data labels on bars */
  showDataLabels?: boolean;
  /** Maximum width for category axis labels */
  categoryLabelWidth?: number;
  /** Data test ID for testing */
  'data-testid'?: string;
}

/**
 * ComparisonChart - Reusable bar chart component for comparisons
 * 
 * Features:
 * - Support for horizontal and vertical orientations
 * - Multiple data series with configurable colors
 * - Stacked and grouped bar layouts
 * - Rounded or square bar styles
 * - Interactive tooltips and legends
 * - Responsive design with proper axis formatting
 * - TypeScript interfaces for type safety
 * - Accessibility and testing support
 */
export function ComparisonChart({
  data,
  chartConfig,
  orientation = 'vertical',
  categoryKey,
  dataKeys,
  height = '300px',
  className,
  showGrid = true,
  showLegend = true,
  enableStacking = false,
  barStyle = 'rounded',
  barRadius = 4,
  showDataLabels = false,
  categoryLabelWidth = 100,
  'data-testid': testId
}: ComparisonChartProps) {
  // Get colors from chart config
  const getColor = (key: string): string => {
    const config = chartConfig[key];
    if (config && 'color' in config && config.color) {
      return config.color;
    }
    return `hsl(var(--chart-${(dataKeys.indexOf(key) % 5) + 1}))`;
  };

  // Calculate bar radius based on style
  const getBarRadius = () => {
    if (barStyle === 'square') return 0;
    if (typeof barRadius === 'number') return barRadius;
    return 4;
  };

  // Custom label formatter for data labels
  const renderDataLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const labelX = orientation === 'vertical' ? x + width / 2 : x + width + 5;
    const labelY = orientation === 'vertical' ? y - 5 : y + height / 2;
    
    return (
      <text
        x={labelX}
        y={labelY}
        fill="currentColor"
        textAnchor={orientation === 'vertical' ? 'middle' : 'start'}
        dominantBaseline={orientation === 'vertical' ? 'auto' : 'central'}
        className="text-xs fill-muted-foreground"
      >
        {value}
      </text>
    );
  };

  // Render bars with proper stacking
  const renderBars = () => {
    return dataKeys.map((key, index) => {
      const color = getColor(key);
      const stackId = enableStacking ? 'stack' : undefined;
      const radius = getBarRadius();
      
      // For horizontal charts, radius array is [topLeft, topRight, bottomRight, bottomLeft]
      // For vertical charts, radius array is [topLeft, topRight, bottomRight, bottomLeft]
      let radiusArray: [number, number, number, number] = [0, 0, 0, 0];
      
      if (barStyle === 'rounded') {
        if (orientation === 'horizontal') {
          radiusArray = [0, radius, radius, 0]; // Rounded on right side
        } else {
          radiusArray = [radius, radius, 0, 0]; // Rounded on top
        }
      }

      return (
        <Bar
          key={key}
          dataKey={key}
          stackId={stackId}
          fill={color}
          radius={radiusArray}
          {...(showDataLabels && { label: renderDataLabel })}
        />
      );
    });
  };

  return (
    <ChartContainer 
      config={chartConfig} 
      className={cn('w-full', className)}
      style={{ height }}
      data-testid={testId}
    >
      <BarChart 
        data={data}
        layout={orientation === 'horizontal' ? 'horizontal' : undefined}
        margin={{
          top: 20,
          right: 30,
          left: orientation === 'horizontal' ? categoryLabelWidth : 20,
          bottom: 5,
        }}
      >
        {showGrid && (
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-muted" 
          />
        )}
        
        {orientation === 'vertical' ? (
          <>
            <XAxis 
              dataKey={categoryKey}
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs" 
              tick={{ fontSize: 12 }} 
            />
          </>
        ) : (
          <>
            <XAxis 
              type="number"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="category"
              dataKey={categoryKey}
              className="text-xs" 
              tick={{ fontSize: 10 }}
              width={categoryLabelWidth}
            />
          </>
        )}
        
        <ChartTooltip content={<ChartTooltipContent />} />
        
        {showLegend && dataKeys.length > 1 && (
          <ChartLegend 
            content={<ChartLegendContent />}
            verticalAlign="top"
            height={36}
          />
        )}
        
        {renderBars()}
      </BarChart>
    </ChartContainer>
  );
}

export default ComparisonChart;