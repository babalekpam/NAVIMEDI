/**
 * Chart Components for Dashboard Shared Metrics
 * 
 * This module provides reusable chart components that can be shared across
 * different dashboards to ensure consistency and reduce code duplication.
 * 
 * All components are built with:
 * - TypeScript for type safety
 * - Responsive design principles
 * - Accessibility features
 * - Testing support with data-testid attributes
 * - Dark mode compatibility
 * - Consistent styling with shadcn/ui
 */

// Main chart components
export { default as TrendChart } from './TrendChart';
export { default as DistributionChart } from './DistributionChart';
export { default as ProgressIndicator } from './ProgressIndicator';
export { default as ComparisonChart } from './ComparisonChart';
export { default as MetricCard } from './MetricCard';

// Type definitions that can be useful when using these components
export type { ChartConfig } from '@/components/ui/chart';

/**
 * Usage Examples:
 * 
 * import { TrendChart, MetricCard, DistributionChart } from '@/components/charts';
 * 
 * // Trend Chart for revenue over time
 * <TrendChart
 *   data={revenueData}
 *   chartConfig={revenueConfig}
 *   chartType="area"
 *   xAxisKey="month"
 *   dataKeys={["revenue", "profit"]}
 *   enableGradients
 * />
 * 
 * // Metric Card with embedded chart
 * <MetricCard
 *   title="Monthly Revenue"
 *   value="$127,450"
 *   change={18.7}
 *   trend="up"
 *   icon={DollarSign}
 *   chart={<TrendChart ... />}
 * />
 * 
 * // Distribution Chart for status breakdown
 * <DistributionChart
 *   data={statusData}
 *   chartConfig={statusConfig}
 *   chartType="donut"
 *   centerLabel="Total"
 *   centerValue="247"
 * />
 */