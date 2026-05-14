import { Employee } from '../../models/Employee';
import { Order } from '../../models/Order';
import { Team } from '../../models/Team';

export interface SalesRepPerformanceReport {
  employeeId: string;
  employeeName: string;
  position: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    revenue: number;
    revenueTarget: number;
    revenueAchievement: number;
    transactions: number;
    transactionTarget: number;
    averageOrderValue: number;
    itemsPerTransaction: number;
    returns: number;
    returnRate: number;
    customerSatisfaction: number;
    upsellRate: number;
    crossSellRate: number;
  };
  dailyBreakdown: Array<{
    date: Date;
    revenue: number;
    transactions: number;
    averageOrderValue: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  ranking: {
    rank: number;
    totalReps: number;
    percentile: number;
    previousRank?: number;
    rankChange: number;
  };
  commission: {
    earned: number;
    projected: number;
    rate: number;
    breakdown: Array<{
      product: string;
      quantity: number;
      commission: number;
    }>;
  };
}

export interface TeamPerformanceReport {
  teamId: string;
  teamName: string;
  managerId: string;
  managerName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalRevenue: number;
    revenueTarget: number;
    achievement: number;
    totalTransactions: number;
    averageOrderValue: number;
    teamSize: number;
    averagePerRep: number;
    topPerformer: string;
    bottomPerformer: string;
  };
  members: Array<{
    employeeId: string;
    employeeName: string;
    revenue: number;
    achievement: number;
    contribution: number;
    rank: number;
  }>;
  trends: {
    revenueGrowth: number;
    productivityTrend: 'improving' | 'stable' | 'declining';
    collaborationScore: number;
    teamMomentum: number;
  };
  benchmarking: {
    vsOtherTeams: Array<{
      teamName: string;
      revenue: number;
      difference: number;
      ranking: number;
    }>;
    vsHistorical: Array<{
      period: string;
      revenue: number;
      growth: number;
    }>;
  };
  recommendations: Array<{
    type: 'training' | 'incentives' | 'staffing' | 'process';
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: number;
  }>;
}

export interface StaffProductivityAnalysis {
  period: {
    startDate: Date;
    endDate: Date;
  };
  employees: Array<{
    employeeId: string;
    employeeName: string;
    position: string;
    department: string;
    productivity: {
      transactionsPerHour: number;
      revenuePerHour: number;
      itemsPerHour: number;
      averageProcessingTime: number;
      accuracy: number;
      customerSatisfaction: number;
    };
    performance: {
      efficiency: number;
      quality: number;
      speed: number;
      overall: number;
      ranking: number;
      percentile: number;
    };
    trends: {
      productivityTrend: 'improving' | 'stable' | 'declining';
      learningCurve: number;
      peakHours: Array<number>;
      lowProductivityPeriods: Array<{
        start: Date;
        end: Date;
        reason?: string;
      }>;
    };
    development: {
      trainingNeeds: Array<string>;
      skillGaps: Array<string>;
      careerPath: string;
      promotionReadiness: number;
    };
  }>;
  departmentAnalysis: Array<{
    department: string;
    averageProductivity: number;
    topPerformer: string;
    bottomPerformer: string;
    variance: number;
    improvementOpportunities: Array<string>;
  }>;
  scheduling: {
    optimalShiftPatterns: Array<{
      shift: string;
      recommendedStaff: number;
      expectedProductivity: number;
    }>;
    underutilizedPeriods: Array<{
      period: string;
      currentStaff: number;
      recommendedStaff: number;
      potentialSavings: number;
    }>;
    peakPeriodAnalysis: Array<{
      period: string;
      demand: number;
      currentCapacity: number;
      gap: number;
      recommendation: string;
    }>;
  };
  insights: {
    topPerformers: Array<{
      employeeId: string;
      employeeName: string;
      strength: string;
      recommendation: string;
    }>;
    improvementCandidates: Array<{
      employeeId: string;
      employeeName: string;
      areas: Array<string>;
      actionPlan: string;
    }>;
    retentionRisks: Array<{
      employeeId: string;
      employeeName: string;
      riskFactors: Array<string>;
      mitigation: string;
    }>;
  };
}

export class EmployeeReportsService {
  // Generate Sales Representative Performance Report
  async generateSalesRepPerformanceReport(params: {
    employeeId: string;
    startDate: Date;
    endDate: Date;
    includeDailyBreakdown?: boolean;
    includeCommission?: boolean;
    includeRanking?: boolean;
  }): Promise<SalesRepPerformanceReport> {
    // Get employee information
    const employee = await this.getEmployeeById(params.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Get employee orders for the period
    const orders = await this.getEmployeeOrders(params.employeeId, params.startDate, params.endDate);
    
    // Get employee targets
    const targets = await this.getEmployeeTargets(params.employeeId, params.startDate, params.endDate);
    
    // Calculate basic metrics
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const transactions = orders.length;
    const averageOrderValue = transactions > 0 ? revenue / transactions : 0;
    const itemsPerTransaction = orders.length > 0 ? 
      orders.reduce((sum, order) => sum + order.items.length, 0) / transactions : 0;
    
    // Calculate returns
    const returns = orders.filter(order => order.status === 'returned').length;
    const returnRate = transactions > 0 ? (returns / transactions) * 100 : 0;
    
    // Get customer satisfaction scores
    const customerSatisfaction = await this.getEmployeeCustomerSatisfaction(params.employeeId, params.startDate, params.endDate);
    
    // Calculate upsell and cross-sell rates
    const upsellRate = await this.calculateUpsellRate(orders);
    const crossSellRate = await this.calculateCrossSellRate(orders);
    
    // Calculate achievement percentages
    const revenueAchievement = targets.revenueTarget > 0 ? (revenue / targets.revenueTarget) * 100 : 0;
    const transactionAchievement = targets.transactionTarget > 0 ? (transactions / targets.transactionTarget) * 100 : 0;
    
    // Generate daily breakdown if requested
    let dailyBreakdown: any[] = [];
    if (params.includeDailyBreakdown) {
      dailyBreakdown = await this.generateDailyBreakdown(params.employeeId, params.startDate, params.endDate);
    }
    
    // Get top products
    const topProducts = await this.getEmployeeTopProducts(orders, 10);
    
    // Get ranking information if requested
    let ranking: any = null;
    if (params.includeRanking) {
      ranking = await this.getEmployeeRanking(params.employeeId, revenue, params.startDate, params.endDate);
    }
    
    // Calculate commission if requested
    let commission: any = null;
    if (params.includeCommission) {
      commission = await this.calculateEmployeeCommission(params.employeeId, orders, targets);
    }
    
    return {
      employeeId: employee.employeeId,
      employeeName: employee.name,
      position: employee.position,
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      metrics: {
        revenue,
        revenueTarget: targets.revenueTarget,
        revenueAchievement,
        transactions,
        transactionTarget: targets.transactionTarget,
        averageOrderValue,
        itemsPerTransaction,
        returns,
        returnRate,
        customerSatisfaction,
        upsellRate,
        crossSellRate
      },
      dailyBreakdown,
      topProducts,
      ranking,
      commission
    };
  }
  
  // Generate Team Performance Report
  async generateTeamPerformanceReport(params: {
    teamId: string;
    startDate: Date;
    endDate: Date;
    includeBenchmarking?: boolean;
    includeRecommendations?: boolean;
  }): Promise<TeamPerformanceReport> {
    // Get team information
    const team = await this.getTeamById(params.teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Get team members
    const teamMembers = await this.getTeamMembers(params.teamId);
    
    // Get team targets
    const teamTargets = await this.getTeamTargets(params.teamId, params.startDate, params.endDate);
    
    // Calculate individual member performance
    const members = await Promise.all(teamMembers.map(async (member: any) => {
      const orders = await this.getEmployeeOrders(member.employeeId, params.startDate, params.endDate);
      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const achievement = teamTargets.revenueTarget > 0 ? (revenue / (teamTargets.revenueTarget / teamMembers.length)) * 100 : 0;
      const contribution = revenue; // Would calculate percentage contribution
      
      return {
        employeeId: member.employeeId,
        employeeName: member.name,
        revenue,
        achievement,
        contribution,
        rank: 0 // Would calculate actual rank
      };
    }));
    
    // Sort members by revenue and assign ranks
    members.sort((a, b) => b.revenue - a.revenue);
    members.forEach((member, index) => {
      member.rank = index + 1;
    });
    
    // Calculate team summary metrics
    const totalRevenue = members.reduce((sum, member) => sum + member.revenue, 0);
    const totalTransactions = members.reduce((sum, member) => sum + (member.transactions || 0), 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const averagePerRep = members.length > 0 ? totalRevenue / members.length : 0;
    const achievement = teamTargets.revenueTarget > 0 ? (totalRevenue / teamTargets.revenueTarget) * 100 : 0;
    
    const topPerformer = members.length > 0 ? members[0].employeeName : '';
    const bottomPerformer = members.length > 0 ? members[members.length - 1].employeeName : '';
    
    // Analyze trends
    const trends = await this.analyzeTeamTrends(params.teamId, params.startDate, params.endDate);
    
    // Generate benchmarking if requested
    let benchmarking: any = null;
    if (params.includeBenchmarking) {
      benchmarking = await this.generateTeamBenchmarking(params.teamId, totalRevenue, params.startDate, params.endDate);
    }
    
    // Generate recommendations if requested
    let recommendations: any[] = [];
    if (params.includeRecommendations) {
      recommendations = await this.generateTeamRecommendations(members, trends, achievement);
    }
    
    return {
      teamId: team.teamId,
      teamName: team.name,
      managerId: team.managerId,
      managerName: team.managerName,
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      summary: {
        totalRevenue,
        revenueTarget: teamTargets.revenueTarget,
        achievement,
        totalTransactions,
        averageOrderValue,
        teamSize: members.length,
        averagePerRep,
        topPerformer,
        bottomPerformer
      },
      members,
      trends,
      benchmarking,
      recommendations
    };
  }
  
  // Generate Staff Productivity Analysis
  async generateStaffProductivityAnalysis(params: {
    startDate: Date;
    endDate: Date;
    departmentId?: string;
    includeScheduling?: boolean;
    includeInsights?: boolean;
  }): Promise<StaffProductivityAnalysis> {
    // Get employees
    const employees = await this.getEmployees(params.departmentId);
    
    // Calculate productivity metrics for each employee
    const employeeData = await Promise.all(employees.map(async (employee: any) => {
      const productivity = await this.calculateEmployeeProductivity(employee.employeeId, params.startDate, params.endDate);
      const performance = await this.calculateEmployeePerformance(productivity);
      const trends = await this.analyzeEmployeeProductivityTrends(employee.employeeId, params.startDate, params.endDate);
      const development = await this.analyzeEmployeeDevelopment(employee.employeeId);
      
      return {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        position: employee.position,
        department: employee.department,
        productivity,
        performance,
        trends,
        development
      };
    }));
    
    // Generate department analysis
    const departmentAnalysis = await this.generateDepartmentAnalysis(employeeData);
    
    // Generate scheduling analysis if requested
    let scheduling: any = null;
    if (params.includeScheduling) {
      scheduling = await this.generateSchedulingAnalysis(employeeData, params.startDate, params.endDate);
    }
    
    // Generate insights if requested
    let insights: any = null;
    if (params.includeInsights) {
      insights = await this.generateProductivityInsights(employeeData);
    }
    
    return {
      period: {
        startDate: params.startDate,
        endDate: params.endDate
      },
      employees: employeeData,
      departmentAnalysis,
      scheduling,
      insights
    };
  }
  
  // Helper methods
  private async getEmployeeById(employeeId: string): Promise<any> {
    // Mock implementation - would query actual employee from database
    return {
      employeeId,
      name: 'Jane Smith',
      position: 'Sales Representative'
    };
  }
  
  private async getEmployeeOrders(employeeId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Mock implementation - would query actual orders from database
    return [];
  }
  
  private async getEmployeeTargets(employeeId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would query actual targets from database
    return {
      revenueTarget: 50000,
      transactionTarget: 100
    };
  }
  
  private async getEmployeeCustomerSatisfaction(employeeId: string, startDate: Date, endDate: Date): Promise<number> {
    // Mock implementation - would calculate actual satisfaction score
    return 4.5; // Scale of 1-5
  }
  
  private async calculateUpsellRate(orders: any[]): Promise<number> {
    // Mock implementation - would calculate actual upsell rate
    return 25.5; // Percentage
  }
  
  private async calculateCrossSellRate(orders: any[]): Promise<number> {
    // Mock implementation - would calculate actual cross-sell rate
    return 18.2; // Percentage
  }
  
  private async generateDailyBreakdown(employeeId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Mock implementation - would generate actual daily breakdown
    const breakdown = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOrders = await this.getEmployeeOrders(employeeId, new Date(currentDate), new Date(currentDate));
      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const transactions = dayOrders.length;
      const averageOrderValue = transactions > 0 ? revenue / transactions : 0;
      
      breakdown.push({
        date: new Date(currentDate),
        revenue,
        transactions,
        averageOrderValue
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return breakdown;
  }
  
  private async getEmployeeTopProducts(orders: any[], limit: number): Promise<any[]> {
    // Mock implementation - would calculate actual top products
    return [
      {
        productId: 'prod1',
        name: 'Premium Coffee',
        quantity: 150,
        revenue: 7500
      },
      {
        productId: 'prod2',
        name: 'Espresso Machine',
        quantity: 25,
        revenue: 12500
      }
    ];
  }
  
  private async getEmployeeRanking(employeeId: string, revenue: number, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would calculate actual ranking
    return {
      rank: 3,
      totalReps: 15,
      percentile: 80,
      previousRank: 5,
      rankChange: 2
    };
  }
  
  private async calculateEmployeeCommission(employeeId: string, orders: any[], targets: any): Promise<any> {
    // Mock implementation - would calculate actual commission
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const commissionRate = 0.05; // 5% commission rate
    const earned = totalRevenue * commissionRate;
    
    return {
      earned,
      projected: targets.revenueTarget * commissionRate,
      rate: commissionRate * 100,
      breakdown: [
        {
          product: 'Premium Coffee',
          quantity: 150,
          commission: 375
        },
        {
          product: 'Espresso Machine',
          quantity: 25,
          commission: 625
        }
      ]
    };
  }
  
  private async getTeamById(teamId: string): Promise<any> {
    // Mock implementation - would query actual team from database
    return {
      teamId,
      name: 'Sales Team A',
      managerId: 'mgr1',
      managerName: 'John Manager'
    };
  }
  
  private async getTeamMembers(teamId: string): Promise<any[]> {
    // Mock implementation - would query actual team members
    return [
      {
        employeeId: 'emp1',
        name: 'Jane Smith'
      },
      {
        employeeId: 'emp2',
        name: 'Bob Johnson'
      }
    ];
  }
  
  private async getTeamTargets(teamId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would query actual team targets
    return {
      revenueTarget: 200000,
      transactionTarget: 400
    };
  }
  
  private async analyzeTeamTrends(teamId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would analyze actual team trends
    return {
      revenueGrowth: 15.5,
      productivityTrend: 'improving' as const,
      collaborationScore: 8.2,
      teamMomentum: 0.75
    };
  }
  
  private async generateTeamBenchmarking(teamId: string, revenue: number, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would generate actual benchmarking
    return {
      vsOtherTeams: [
        {
          teamName: 'Sales Team B',
          revenue: 180000,
          difference: 20000,
          ranking: 1
        },
        {
          teamName: 'Sales Team C',
          revenue: 160000,
          difference: 40000,
          ranking: 2
        }
      ],
      vsHistorical: [
        {
          period: 'Previous Month',
          revenue: 170000,
          growth: 5.8
        },
        {
          period: 'Previous Quarter',
          revenue: 480000,
          growth: 8.3
        }
      ]
    };
  }
  
  private async generateTeamRecommendations(members: any[], trends: any, achievement: number): Promise<any[]> {
    const recommendations = [];
    
    if (achievement < 80) {
      recommendations.push({
        type: 'training' as const,
        priority: 'high' as const,
        description: 'Team underperforming - consider additional training',
        expectedImpact: 15
      });
    }
    
    if (trends.collaborationScore < 7) {
      recommendations.push({
        type: 'process' as const,
        priority: 'medium' as const,
        description: 'Low collaboration score - implement team building activities',
        expectedImpact: 10
      });
    }
    
    return recommendations;
  }
  
  private async getEmployees(departmentId?: string): Promise<any[]> {
    // Mock implementation - would query actual employees
    return [
      {
        employeeId: 'emp1',
        name: 'Jane Smith',
        position: 'Sales Representative',
        department: 'Sales'
      },
      {
        employeeId: 'emp2',
        name: 'Bob Johnson',
        position: 'Sales Representative',
        department: 'Sales'
      }
    ];
  }
  
  private async calculateEmployeeProductivity(employeeId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would calculate actual productivity metrics
    return {
      transactionsPerHour: 8.5,
      revenuePerHour: 425.50,
      itemsPerHour: 15.2,
      averageProcessingTime: 7.5, // minutes
      accuracy: 98.5, // percentage
      customerSatisfaction: 4.3 // scale 1-5
    };
  }
  
  private async calculateEmployeePerformance(productivity: any): Promise<any> {
    // Mock implementation - would calculate performance scores
    return {
      efficiency: 85.5,
      quality: 92.3,
      speed: 78.9,
      overall: 85.6,
      ranking: 3,
      percentile: 75
    };
  }
  
  private async analyzeEmployeeProductivityTrends(employeeId: string, startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would analyze actual trends
    return {
      productivityTrend: 'improving' as const,
      learningCurve: 0.85,
      peakHours: [10, 14, 16],
      lowProductivityPeriods: [
        {
          start: new Date('2024-01-15T13:00:00Z'),
          end: new Date('2024-01-15T14:00:00Z'),
          reason: 'Lunch break'
        }
      ]
    };
  }
  
  private async analyzeEmployeeDevelopment(employeeId: string): Promise<any> {
    // Mock implementation - would analyze development needs
    return {
      trainingNeeds: ['Advanced sales techniques', 'Product knowledge'],
      skillGaps: ['Negotiation skills'],
      careerPath: 'Senior Sales Representative',
      promotionReadiness: 0.75
    };
  }
  
  private async generateDepartmentAnalysis(employees: any[]): Promise<any[]> {
    // Mock implementation - would generate actual department analysis
    return [
      {
        department: 'Sales',
        averageProductivity: 82.5,
        topPerformer: 'Jane Smith',
        bottomPerformer: 'Bob Johnson',
        variance: 12.3,
        improvementOpportunities: ['Cross-training', 'Mentorship program']
      }
    ];
  }
  
  private async generateSchedulingAnalysis(employees: any[], startDate: Date, endDate: Date): Promise<any> {
    // Mock implementation - would generate actual scheduling analysis
    return {
      optimalShiftPatterns: [
        {
          shift: 'Morning (9AM-1PM)',
          recommendedStaff: 3,
          expectedProductivity: 88.5
        },
        {
          shift: 'Afternoon (1PM-5PM)',
          recommendedStaff: 4,
          expectedProductivity: 85.2
        }
      ],
      underutilizedPeriods: [
        {
          period: 'Tuesday 2PM-4PM',
          currentStaff: 4,
          recommendedStaff: 2,
          potentialSavings: 150
        }
      ],
      peakPeriodAnalysis: [
        {
          period: 'Friday 4PM-6PM',
          demand: 6,
          currentCapacity: 4,
          gap: 2,
          recommendation: 'Add 2 staff members'
        }
      ]
    };
  }
  
  private async generateProductivityInsights(employees: any[]): Promise<any> {
    // Mock implementation - would generate actual insights
    return {
      topPerformers: [
        {
          employeeId: 'emp1',
          employeeName: 'Jane Smith',
          strength: 'High customer satisfaction',
          recommendation: 'Consider for team lead position'
        }
      ],
      improvementCandidates: [
        {
          employeeId: 'emp2',
          employeeName: 'Bob Johnson',
          areas: ['Sales conversion', 'Product knowledge'],
          actionPlan: 'Enroll in advanced sales training program'
        }
      ],
      retentionRisks: [
        {
          employeeId: 'emp3',
          employeeName: 'Mike Wilson',
          riskFactors: ['Low performance', 'High absenteeism'],
          mitigation: 'Performance improvement plan and regular check-ins'
        }
      ]
    };
  }
}
