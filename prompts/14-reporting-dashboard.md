# 14 - Reporting & Dashboard

## Reporting & Dashboard Feature Overview
Implement comprehensive reporting and dashboard functionality for project cost calculator with data visualization, trend analysis, and export capabilities.

## Core Requirements
- Interactive dashboards with real-time data
- Custom report generation
- Data visualization with charts and graphs
- Export functionality (PDF, Excel, CSV)
- Trend analysis and forecasting
- Comparative analysis tools

## Implementation Details

### Dashboard Data Structure
```typescript
interface DashboardData {
  id: string;
  userId: string;
  name: string;
  type: 'project' | 'financial' | 'resource' | 'custom';
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // minutes
  lastUpdated: Date;
  isPublic: boolean;
  sharedWith: string[];
}

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'trend';
  title: string;
  dataSource: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  metrics?: string[];
  dimensions?: string[];
  filters?: Record<string, any>;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  timeRange?: TimeRange;
  comparison?: boolean;
}

interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetSize {
  width: number;
  height: number;
}

interface DashboardFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  label: string;
}

interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year';
}
```

### Report Generation Service
```typescript
class ReportGenerationService {
  async generateReport(config: ReportConfig): Promise<ReportResult> {
    const data = await this.fetchReportData(config);
    const charts = await this.generateCharts(data, config.charts);
    const summary = this.generateSummary(data, config.summary);
    const exports = await this.generateExports(data, config.exports);

    return {
      id: Date.now().toString(),
      config,
      data,
      charts,
      summary,
      exports,
      generatedAt: new Date()
    };
  }

  private async fetchReportData(config: ReportConfig): Promise<any> {
    const { dataSource, filters, timeRange, dimensions, metrics } = config;

    let query = supabase.from(dataSource).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(field, value);
        }
      });
    }

    // Apply time range
    if (timeRange) {
      query = query.gte('created_at', timeRange.start.toISOString())
                   .lte('created_at', timeRange.end.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch report data: ${error.message}`);
    }

    return this.processData(data, dimensions, metrics);
  }

  private processData(data: any[], dimensions: string[], metrics: string[]): any {
    if (!dimensions || dimensions.length === 0) {
      return data;
    }

    // Group by dimensions and aggregate metrics
    const grouped = data.reduce((acc, row) => {
      const key = dimensions.map(dim => row[dim]).join('|');
      
      if (!acc[key]) {
        acc[key] = {
          ...dimensions.reduce((obj, dim) => ({ ...obj, [dim]: row[dim] }), {}),
          ...metrics.reduce((obj, metric) => ({ ...obj, [metric]: 0 }), {})
        };
      }

      metrics.forEach(metric => {
        acc[key][metric] += row[metric] || 0;
      });

      return acc;
    }, {});

    return Object.values(grouped);
  }

  private async generateCharts(data: any[], chartConfigs: ChartConfig[]): Promise<ChartResult[]> {
    const charts: ChartResult[] = [];

    for (const config of chartConfigs) {
      const chartData = this.prepareChartData(data, config);
      
      charts.push({
        id: config.id,
        type: config.type,
        title: config.title,
        data: chartData,
        options: this.getChartOptions(config)
      });
    }

    return charts;
  }

  private prepareChartData(data: any[], config: ChartConfig): any {
    switch (config.type) {
      case 'line':
      case 'bar':
        return {
          labels: data.map(row => row[config.xAxis]),
          datasets: [{
            label: config.yAxis,
            data: data.map(row => row[config.yAxis]),
            borderColor: config.color || '#3B82F6',
            backgroundColor: config.color || '#3B82F6'
          }]
        };

      case 'pie':
      case 'doughnut':
        return {
          labels: data.map(row => row[config.labelField]),
          datasets: [{
            data: data.map(row => row[config.valueField]),
            backgroundColor: this.generateColors(data.length)
          }]
        };

      default:
        return data;
    }
  }

  private getChartOptions(config: ChartConfig): any {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const
        },
        title: {
          display: true,
          text: config.title
        }
      }
    };

    switch (config.type) {
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: config.xAxis
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: config.yAxis
              }
            }
          }
        };

      case 'bar':
        return {
          ...baseOptions,
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: config.xAxis
              }
            },
            y: {
              type: 'linear',
              title: {
                display: true,
                text: config.yAxis
              }
            }
          }
        };

      default:
        return baseOptions;
    }
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];

    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    return result;
  }

  private generateSummary(data: any[], summaryConfig: SummaryConfig): SummaryResult {
    const summary: SummaryResult = {
      totalRecords: data.length,
      metrics: {},
      insights: []
    };

    // Calculate metrics
    summaryConfig.metrics.forEach(metric => {
      const values = data.map(row => row[metric.field] || 0);
      
      switch (metric.aggregation) {
        case 'sum':
          summary.metrics[metric.name] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          summary.metrics[metric.name] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'count':
          summary.metrics[metric.name] = values.filter(val => val !== null && val !== undefined).length;
          break;
        case 'min':
          summary.metrics[metric.name] = Math.min(...values);
          break;
        case 'max':
          summary.metrics[metric.name] = Math.max(...values);
          break;
      }
    });

    // Generate insights
    summary.insights = this.generateInsights(data, summaryConfig);

    return summary;
  }

  private generateInsights(data: any[], config: SummaryConfig): string[] {
    const insights: string[] = [];

    // Top performers
    if (config.metrics.some(m => m.field === 'total_cost')) {
      const sortedByCost = [...data].sort((a, b) => b.total_cost - a.total_cost);
      insights.push(`Highest cost project: ${sortedByCost[0]?.name || 'N/A'} ($${sortedByCost[0]?.total_cost?.toLocaleString()})`);
    }

    // Trends
    if (data.length > 1 && config.metrics.some(m => m.field === 'created_at')) {
      const sortedByDate = [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, row) => sum + (row.total_cost || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, row) => sum + (row.total_cost || 0), 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) {
        insights.push('Costs are trending upward (+10% increase)');
      } else if (secondAvg < firstAvg * 0.9) {
        insights.push('Costs are trending downward (-10% decrease)');
      }
    }

    return insights;
  }

  private async generateExports(data: any[], exportConfig: ExportConfig): Promise<ExportResult[]> {
    const exports: ExportResult[] = [];

    for (const config of exportConfig) {
      switch (config.format) {
        case 'csv':
          exports.push({
            format: 'csv',
            filename: `${config.filename}.csv`,
            data: this.generateCSV(data, config.columns),
            url: await this.uploadFile(`${config.filename}.csv`, this.generateCSV(data, config.columns))
          });
          break;

        case 'excel':
          exports.push({
            format: 'excel',
            filename: `${config.filename}.xlsx`,
            data: null,
            url: await this.generateExcel(data, config)
          });
          break;

        case 'pdf':
          exports.push({
            format: 'pdf',
            filename: `${config.filename}.pdf`,
            data: null,
            url: await this.generatePDF(data, config)
          });
          break;
      }
    }

    return exports;
  }

  private generateCSV(data: any[], columns: string[]): string {
    const headers = columns.join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  private async generateExcel(data: any[], config: ExportConfig): Promise<string> {
    // In real implementation, use a library like xlsx
    // For now, return a placeholder
    return `https://example.com/exports/${config.filename}.xlsx`;
  }

  private async generatePDF(data: any[], config: ExportConfig): Promise<string> {
    // In real implementation, use a library like jsPDF
    // For now, return a placeholder
    return `https://example.com/exports/${config.filename}.pdf`;
  }

  private async uploadFile(filename: string, content: string): Promise<string> {
    // In real implementation, upload to cloud storage
    // For now, return a placeholder
    return `https://example.com/exports/${filename}`;
  }
}
```

### Dashboard Component Implementation
```typescript
// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { DashboardData, DashboardWidget } from '../types/dashboard';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export const Dashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Mock dashboard data - in real implementation, fetch from API
      const mockDashboard: DashboardData = {
        id: '1',
        userId: 'user1',
        name: 'Project Cost Overview',
        type: 'project',
        widgets: [
          {
            id: '1',
            type: 'metric',
            title: 'Total Projects',
            dataSource: 'projects',
            config: {
              metrics: ['count'],
              aggregation: 'count'
            },
            position: { x: 0, y: 0, width: 2, height: 1 },
            size: { width: 2, height: 1 }
          },
          {
            id: '2',
            type: 'chart',
            title: 'Cost Trend',
            dataSource: 'projects',
            config: {
              chartType: 'line',
              metrics: ['total_cost'],
              dimensions: ['created_at'],
              aggregation: 'sum'
            },
            position: { x: 2, y: 0, width: 4, height: 2 },
            size: { width: 4, height: 2 }
          },
          {
            id: '3',
            type: 'chart',
            title: 'Cost by Category',
            dataSource: 'projects',
            config: {
              chartType: 'pie',
              metrics: ['total_cost'],
              dimensions: ['category'],
              aggregation: 'sum'
            },
            position: { x: 6, y: 0, width: 3, height: 2 },
            size: { width: 3, height: 2 }
          }
        ],
        filters: [],
        refreshInterval: 5,
        lastUpdated: new Date(),
        isPublic: false,
        sharedWith: []
      };

      setDashboard(mockDashboard);
      await loadWidgetData(mockDashboard.widgets);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetData = async (widgets: DashboardWidget[]) => {
    const data: Record<string, any> = {};

    for (const widget of widgets) {
      try {
        const widgetData = await fetchWidgetData(widget);
        data[widget.id] = widgetData;
      } catch (error) {
        console.error(`Failed to load widget ${widget.id}:`, error);
        data[widget.id] = null;
      }
    }

    setWidgetData(data);
  };

  const fetchWidgetData = async (widget: DashboardWidget): Promise<any> => {
    // Mock data fetching - in real implementation, call actual API
    switch (widget.id) {
      case '1':
        return { count: 25 };

      case '2':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Total Cost',
            data: [120000, 150000, 180000, 200000, 220000],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }]
        };

      case '3':
        return {
          labels: ['Development', 'Design', 'Management', 'Testing'],
          datasets: [{
            data: [45, 25, 20, 10],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
          }]
        };

      default:
        return null;
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const data = widgetData[widget.id];

    if (!data) {
      return (
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      );
    }

    switch (widget.type) {
      case 'metric':
        return (
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-sm font-medium text-gray-700">{widget.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{data.count || data.value || 0}</p>
          </div>
        );

      case 'chart':
        const chartType = widget.config.chartType;
        const chartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const
            },
            title: {
              display: true,
              text: widget.title
            }
          }
        };

        switch (chartType) {
          case 'line':
            return (
              <div className="bg-white rounded-lg p-4 shadow">
                <Line data={data} options={chartOptions} height={200} />
              </div>
            );

          case 'bar':
            return (
              <div className="bg-white rounded-lg p-4 shadow">
                <Bar data={data} options={chartOptions} height={200} />
              </div>
            );

          case 'pie':
            return (
              <div className="bg-white rounded-lg p-4 shadow">
                <Pie data={data} options={chartOptions} height={200} />
              </div>
            );

          case 'doughnut':
            return (
              <div className="bg-white rounded-lg p-4 shadow">
                <Doughnut data={data} options={chartOptions} height={200} />
              </div>
            );

          default:
            return <div>Unsupported chart type: {chartType}</div>;
        }

      default:
        return <div>Unsupported widget type: {widget.type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dashboard.name}</h1>
          <p className="text-sm text-gray-600">
            Last updated: {dashboard.lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn-secondary"
          >
            {editMode ? 'Save' : 'Edit'}
          </button>
          <button className="btn-primary">
            Export
          </button>
          <button className="btn-secondary">
            Share
          </button>
        </div>
      </div>

      {/* Filters */}
      {dashboard.filters.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filters</h3>
          <div className="flex space-x-4">
            {dashboard.filters.map(filter => (
              <div key={filter.field} className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">{filter.label}:</label>
                <input
                  type="text"
                  defaultValue={filter.value}
                  className="input-field text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-12 gap-4">
        {dashboard.widgets.map(widget => (
          <div
            key={widget.id}
            className={`col-span-${widget.size.width} row-span-${widget.size.height}`}
            style={{
              gridColumn: `span ${widget.size.width}`,
              gridRow: `span ${widget.size.height}`
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Widget Library (Edit Mode) */}
      {editMode && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Add Widget</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button className="p-2 border rounded hover:bg-gray-50">
              <div className="text-sm font-medium">Metric</div>
            </button>
            <button className="p-2 border rounded hover:bg-gray-50">
              <div className="text-sm font-medium">Line Chart</div>
            </button>
            <button className="p-2 border rounded hover:bg-gray-50">
              <div className="text-sm font-medium">Bar Chart</div>
            </button>
            <button className="p-2 border rounded hover:bg-gray-50">
              <div className="text-sm font-medium">Pie Chart</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Features
- **Interactive Dashboards**: Drag-and-drop widget placement
- **Real-time Data**: Auto-refresh with configurable intervals
- **Custom Widgets**: Multiple chart types and metrics
- **Filtering**: Apply filters to dashboard data
- **Export Functionality**: Export to PDF, Excel, CSV
- **Sharing**: Share dashboards with team members
- **Responsive Design**: Works on all device sizes

## Widget Types
- **Metrics**: Single value displays
- **Line Charts**: Trend analysis
- **Bar Charts**: Comparison data
- **Pie Charts**: Distribution analysis
- **Tables**: Detailed data views
- **Gauges**: Progress indicators

## Integration Points
- **Project Data**: Connect with project calculator
- **User Management**: Role-based dashboard access
- **Export Services**: Generate reports and exports
- **Real-time Updates**: Live data synchronization
- **Analytics**: Track dashboard usage

## Advanced Features
- **Custom Reports**: User-defined report templates
- **Scheduled Reports**: Automated report generation
- **Drill-down Analysis**: Click-through data exploration
- **Alerting**: Set up data-driven alerts
- **Mobile Optimization**: Touch-friendly interface 