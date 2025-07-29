# 12 - Monthly Planning

## Monthly Planning Feature Overview
Implement advanced monthly planning functionality for project cost calculation with variable hours, ramp-up periods, and milestone tracking.

## Core Requirements
- Monthly breakdown of project costs
- Variable working hours per month
- Team member ramp-up and ramp-down periods
- Milestone tracking and cost allocation
- Resource allocation optimization
- Budget forecasting and tracking

## Implementation Details

### Monthly Planning Data Structure
```typescript
interface MonthlyPlan {
  id: string;
  projectId: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalMonths: number;
  currency: string;
  budget: number;
  months: MonthlyBreakdown[];
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

interface MonthlyBreakdown {
  month: number; // 1, 2, 3, etc.
  year: number;
  monthName: string; // January, February, etc.
  workingDays: number;
  teamMembers: MonthlyTeamMember[];
  totalCost: number;
  budget: number;
  variance: number;
  notes: string;
}

interface MonthlyTeamMember {
  userId: string;
  roleId: string;
  roleName: string;
  hourlyRate: number;
  allocation: number; // 0-100% (full-time = 100)
  hours: number;
  rampUp: RampUpPeriod;
  subtotal: number;
  notes: string;
}

interface RampUpPeriod {
  startMonth: number;
  endMonth: number;
  startAllocation: number; // Starting allocation percentage
  endAllocation: number; // Final allocation percentage
  type: 'linear' | 'exponential' | 'step';
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetMonth: number;
  targetDate: Date;
  cost: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  deliverables: string[];
  dependencies: string[]; // Other milestone IDs
}
```

### Monthly Planning Service
```typescript
class MonthlyPlanningService {
  calculateMonthlyBreakdown(plan: MonthlyPlan): MonthlyBreakdown[] {
    const months: MonthlyBreakdown[] = [];
    const startDate = new Date(plan.startDate);
    
    for (let i = 0; i < plan.totalMonths; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      
      const monthBreakdown: MonthlyBreakdown = {
        month: i + 1,
        year: currentDate.getFullYear(),
        monthName: currentDate.toLocaleString('default', { month: 'long' }),
        workingDays: this.calculateWorkingDays(currentDate),
        teamMembers: [],
        totalCost: 0,
        budget: plan.budget / plan.totalMonths,
        variance: 0,
        notes: ''
      };

      // Calculate team member costs for this month
      plan.months.forEach(month => {
        if (month.month === i + 1) {
          monthBreakdown.teamMembers = month.teamMembers.map(member => {
            const allocation = this.calculateAllocation(member.rampUp, i + 1);
            const hours = this.calculateHours(monthBreakdown.workingDays, allocation, member.allocation);
            const subtotal = hours * member.hourlyRate;
            
            return {
              ...member,
              allocation,
              hours,
              subtotal
            };
          });
          
          monthBreakdown.totalCost = monthBreakdown.teamMembers.reduce((sum, member) => sum + member.subtotal, 0);
          monthBreakdown.variance = monthBreakdown.budget - monthBreakdown.totalCost;
        }
      });

      months.push(monthBreakdown);
    }

    return months;
  }

  private calculateWorkingDays(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      
      // Exclude weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  private calculateAllocation(rampUp: RampUpPeriod, currentMonth: number): number {
    if (currentMonth < rampUp.startMonth) {
      return 0;
    }
    
    if (currentMonth > rampUp.endMonth) {
      return rampUp.endAllocation;
    }

    const totalRampMonths = rampUp.endMonth - rampUp.startMonth + 1;
    const currentRampMonth = currentMonth - rampUp.startMonth + 1;
    const progress = currentRampMonth / totalRampMonths;

    switch (rampUp.type) {
      case 'linear':
        return rampUp.startAllocation + (rampUp.endAllocation - rampUp.startAllocation) * progress;
      
      case 'exponential':
        const exponentialProgress = Math.pow(progress, 2);
        return rampUp.startAllocation + (rampUp.endAllocation - rampUp.startAllocation) * exponentialProgress;
      
      case 'step':
        return progress < 0.5 ? rampUp.startAllocation : rampUp.endAllocation;
      
      default:
        return rampUp.startAllocation;
    }
  }

  private calculateHours(workingDays: number, allocation: number, baseAllocation: number): number {
    const standardHoursPerDay = 8;
    const effectiveAllocation = (allocation / 100) * (baseAllocation / 100);
    return workingDays * standardHoursPerDay * effectiveAllocation;
  }

  generateForecast(plan: MonthlyPlan): ForecastData {
    const monthlyBreakdowns = this.calculateMonthlyBreakdown(plan);
    
    const cumulativeCost = monthlyBreakdowns.reduce((acc, month) => {
      acc.push((acc[acc.length - 1] || 0) + month.totalCost);
      return acc;
    }, [] as number[]);

    const budgetBurn = monthlyBreakdowns.map((month, index) => {
      const plannedBudget = (plan.budget / plan.totalMonths) * (index + 1);
      return (cumulativeCost[index] / plannedBudget) * 100;
    });

    return {
      monthlyBreakdowns,
      cumulativeCost,
      budgetBurn,
      totalForecastedCost: cumulativeCost[cumulativeCost.length - 1],
      variance: plan.budget - cumulativeCost[cumulativeCost.length - 1]
    };
  }
}
```

### React Component Implementation
```typescript
// MonthlyPlanner.tsx
import React, { useState, useEffect } from 'react';
import { MonthlyPlanningService } from '../lib/monthlyPlanningService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const MonthlyPlanner: React.FC = () => {
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [editingMember, setEditingMember] = useState<MonthlyTeamMember | null>(null);

  const planningService = new MonthlyPlanningService();

  useEffect(() => {
    if (plan) {
      const forecastData = planningService.generateForecast(plan);
      setForecast(forecastData);
    }
  }, [plan]);

  const addTeamMember = () => {
    if (!plan) return;

    const newMember: MonthlyTeamMember = {
      userId: '',
      roleId: '',
      roleName: '',
      hourlyRate: 0,
      allocation: 100,
      hours: 0,
      rampUp: {
        startMonth: 1,
        endMonth: 1,
        startAllocation: 0,
        endAllocation: 100,
        type: 'linear'
      },
      subtotal: 0,
      notes: ''
    };

    const updatedPlan = {
      ...plan,
      months: plan.months.map(month => ({
        ...month,
        teamMembers: [...month.teamMembers, newMember]
      }))
    };

    setPlan(updatedPlan);
  };

  const updateTeamMember = (monthIndex: number, memberIndex: number, updates: Partial<MonthlyTeamMember>) => {
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      months: plan.months.map((month, mIndex) => {
        if (mIndex === monthIndex) {
          return {
            ...month,
            teamMembers: month.teamMembers.map((member, memIndex) => {
              if (memIndex === memberIndex) {
                return { ...member, ...updates };
              }
              return member;
            })
          };
        }
        return month;
      })
    };

    setPlan(updatedPlan);
  };

  const addMilestone = () => {
    if (!plan) return;

    const newMilestone: Milestone = {
      id: Date.now().toString(),
      name: '',
      description: '',
      targetMonth: 1,
      targetDate: new Date(),
      cost: 0,
      status: 'planned',
      deliverables: [],
      dependencies: []
    };

    const updatedPlan = {
      ...plan,
      milestones: [...plan.milestones, newMilestone]
    };

    setPlan(updatedPlan);
  };

  const chartData = forecast ? {
    labels: forecast.monthlyBreakdowns.map(m => m.monthName),
    datasets: [
      {
        label: 'Cumulative Cost',
        data: forecast.cumulativeCost,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      },
      {
        label: 'Budget Burn Rate (%)',
        data: forecast.budgetBurn,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Cost ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Budget Burn Rate (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monthly Planning</h2>
        <div className="flex space-x-2">
          <button onClick={addTeamMember} className="btn-primary">
            Add Team Member
          </button>
          <button onClick={addMilestone} className="btn-secondary">
            Add Milestone
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Total Duration</h3>
          <p className="text-2xl font-bold">{plan?.totalMonths || 0} months</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Total Budget</h3>
          <p className="text-2xl font-bold">${plan?.budget?.toLocaleString() || 0}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Forecasted Cost</h3>
          <p className="text-2xl font-bold">${forecast?.totalForecastedCost?.toLocaleString() || 0}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-gray-700">Variance</h3>
          <p className={`text-2xl font-bold ${forecast?.variance && forecast.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${forecast?.variance?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Forecast</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input-field"
          >
            {plan?.months.map(month => (
              <option key={month.month} value={month.month}>
                {month.monthName} {month.year}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4">
          {plan?.months.find(m => m.month === selectedMonth) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Working Days</label>
                  <p className="text-lg font-semibold">
                    {plan.months.find(m => m.month === selectedMonth)?.workingDays}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                  <p className="text-lg font-semibold">
                    ${plan.months.find(m => m.month === selectedMonth)?.totalCost?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Budget</label>
                  <p className="text-lg font-semibold">
                    ${plan.months.find(m => m.month === selectedMonth)?.budget?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variance</label>
                  <p className={`text-lg font-semibold ${
                    plan.months.find(m => m.month === selectedMonth)?.variance && 
                    plan.months.find(m => m.month === selectedMonth)!.variance < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${plan.months.find(m => m.month === selectedMonth)?.variance?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h4 className="font-semibold mb-2">Team Members</h4>
                <div className="space-y-2">
                  {plan.months.find(m => m.month === selectedMonth)?.teamMembers.map((member, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <input
                          type="text"
                          value={member.roleName}
                          onChange={(e) => updateTeamMember(selectedMonth - 1, index, { roleName: e.target.value })}
                          placeholder="Role"
                          className="input-field"
                        />
                        <input
                          type="number"
                          value={member.hourlyRate}
                          onChange={(e) => updateTeamMember(selectedMonth - 1, index, { hourlyRate: parseFloat(e.target.value) || 0 })}
                          placeholder="Rate"
                          className="input-field"
                        />
                        <input
                          type="number"
                          value={member.allocation}
                          onChange={(e) => updateTeamMember(selectedMonth - 1, index, { allocation: parseFloat(e.target.value) || 0 })}
                          placeholder="Allocation %"
                          className="input-field"
                        />
                        <input
                          type="number"
                          value={member.hours}
                          onChange={(e) => updateTeamMember(selectedMonth - 1, index, { hours: parseFloat(e.target.value) || 0 })}
                          placeholder="Hours"
                          className="input-field"
                        />
                        <span className="font-medium">
                          ${member.subtotal?.toLocaleString()}
                        </span>
                        <button
                          onClick={() => {
                            const updatedMembers = plan.months.find(m => m.month === selectedMonth)!.teamMembers.filter((_, i) => i !== index);
                            updateTeamMember(selectedMonth - 1, index, { ...member, userId: 'deleted' });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <h3 className="text-lg font-semibold p-4 border-b">Milestones</h3>
        <div className="p-4">
          <div className="space-y-4">
            {plan?.milestones.map(milestone => (
              <div key={milestone.id} className="border rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Milestone</label>
                    <input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => {
                        const updatedMilestones = plan.milestones.map(m => 
                          m.id === milestone.id ? { ...m, name: e.target.value } : m
                        );
                        setPlan({ ...plan, milestones: updatedMilestones });
                      }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Month</label>
                    <input
                      type="number"
                      value={milestone.targetMonth}
                      onChange={(e) => {
                        const updatedMilestones = plan.milestones.map(m => 
                          m.id === milestone.id ? { ...m, targetMonth: parseInt(e.target.value) || 1 } : m
                        );
                        setPlan({ ...plan, milestones: updatedMilestones });
                      }}
                      className="input-field"
                      min="1"
                      max={plan.totalMonths}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost</label>
                    <input
                      type="number"
                      value={milestone.cost}
                      onChange={(e) => {
                        const updatedMilestones = plan.milestones.map(m => 
                          m.id === milestone.id ? { ...m, cost: parseFloat(e.target.value) || 0 } : m
                        );
                        setPlan({ ...plan, milestones: updatedMilestones });
                      }}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={milestone.status}
                      onChange={(e) => {
                        const updatedMilestones = plan.milestones.map(m => 
                          m.id === milestone.id ? { ...m, status: e.target.value as any } : m
                        );
                        setPlan({ ...plan, milestones: updatedMilestones });
                      }}
                      className="input-field"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Features
- **Monthly Cost Breakdown**: Detailed cost analysis by month
- **Team Member Allocation**: Variable allocation percentages
- **Ramp-up Periods**: Gradual team member onboarding
- **Milestone Tracking**: Project milestones with cost allocation
- **Budget Forecasting**: Predict total project costs
- **Variance Analysis**: Compare planned vs actual costs
- **Resource Optimization**: Optimize team allocation

## Integration Points
- **Project Calculator**: Integrate with main calculator
- **Role Catalog**: Use predefined roles and rates
- **Project Management**: Save and load monthly plans
- **Reporting**: Generate monthly reports and forecasts

## Advanced Features
- **Resource Leveling**: Balance workload across team members
- **Critical Path Analysis**: Identify project dependencies
- **Risk Assessment**: Evaluate schedule and cost risks
- **Scenario Planning**: Compare different planning scenarios
- **Export Functionality**: Export plans to Excel/PDF 