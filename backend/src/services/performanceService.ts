import { Employee, IEmployee } from '../models/Employee';
import mongoose from 'mongoose';
import { EventEmitter } from 'events';

export interface PerformanceReviewTemplate {
  id: string;
  name: string;
  description: string;
  reviewType: 'annual' | 'semi_annual' | 'quarterly' | 'probation' | 'exit' | 'promotion' | 'project_based';
  categories: Array<{
    name: string;
    weight: number; // percentage of total score
    questions: Array<{
      id: string;
      question: string;
      type: 'rating' | 'yes_no' | 'text' | 'multiple_choice';
      required: boolean;
      options?: string[];
      minRating?: number;
      maxRating?: number;
    }>;
  }>;
  overallRatingScale: {
    min: number;
    max: number;
    labels: Array<{
      value: number;
      label: string;
      description: string;
    }>;
  };
  goalsSection: {
    enabled: boolean;
    required: boolean;
    maxGoals: number;
  };
  commentsSection: {
    enabled: boolean;
    required: boolean;
    includeEmployeeComments: boolean;
  };
  approvalWorkflow: Array<{
    role: string;
    order: number;
    required: boolean;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedBy: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  templateId: string;
  reviewPeriod: {
    startDate: Date;
    endDate: Date;
  };
  reviewType: 'annual' | 'semi_annual' | 'quarterly' | 'probation' | 'exit' | 'promotion' | 'project_based';
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'employee_acknowledged';
  overallRating: number;
  categoryScores: Array<{
    categoryName: string;
    score: number;
    weight: number;
    weightedScore: number;
    comments?: string;
  }>;
  responses: Array<{
    categoryId: string;
    questionId: string;
    response: any;
    score?: number;
  }>;
  goals: Array<{
    id: string;
    description: string;
    category: string;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    progress: number; // 0-100
    completedAt?: Date;
    notes?: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: Array<{
    area: string;
    actions: string[];
    resources: string[];
    timeline: string;
    responsible: string;
  }>;
  compensationRecommendation: {
    salaryIncrease?: number;
    bonus?: number;
    promotion?: boolean;
    newPosition?: string;
    effectiveDate?: Date;
    justification?: string;
  };
  comments: {
    reviewerComments: string;
    employeeComments?: string;
    hrComments?: string;
  };
  signatures: Array<{
    role: 'employee' | 'reviewer' | 'hr' | 'manager';
    name: string;
    signedAt: Date;
    status: 'signed' | 'declined';
  }>;
  workflowHistory: Array<{
    action: string;
    performedBy: string;
    performedAt: Date;
    comments?: string;
  }>;
  scheduledCompletionDate: Date;
  actualCompletionDate?: Date;
  isLate: boolean;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  category: 'performance' | 'development' | 'career' | 'project' | 'behavioral';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'overdue';
  progress: number; // 0-100
  dueDate: Date;
  createdDate: Date;
  completedDate?: Date;
  assignedBy: string;
  assignee: string;
  reviewers: Array<{
    employeeId: string;
    name: string;
    role: string;
  }>;
  keyResults: Array<{
    description: string;
    target: string;
    current: string;
    unit: string;
    achieved: boolean;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    completed: boolean;
    completedAt?: Date;
  }>;
  resources: Array<{
    type: 'training' | 'tool' | 'budget' | 'mentorship' | 'other';
    description: string;
    provided: boolean;
    providedAt?: Date;
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    isPrivate: boolean;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  linkedReviews: string[]; // Review IDs
  parentGoalId?: string;
  childGoalIds: string[];
  weight: number; // For calculating overall goal achievement
  isCompanyWide: boolean;
  department?: string;
  tags: string[];
}

export interface Feedback {
  id: string;
  employeeId: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  relationship: 'manager' | 'peer' | 'direct_report' | 'self' | 'client' | 'customer';
  type: 'praise' | 'constructive' | 'suggestion' | 'concern' | 'achievement';
  category: 'performance' | 'behavior' | 'teamwork' | 'leadership' | 'communication' | 'initiative' | 'problem_solving' | 'other';
  content: string;
  isAnonymous: boolean;
  isPrivate: boolean;
  rating?: number; // 1-5 scale
  tags: string[];
  linkedGoals?: string[];
  linkedProjects?: string[];
  date: Date;
  status: 'pending' | 'acknowledged' | 'addressed' | 'archived';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DevelopmentPlan {
  id: string;
  employeeId: string;
  name: string;
  description: string;
  type: 'individual' | 'team' | 'leadership' | 'technical' | 'soft_skills';
  status: 'draft' | 'active' | 'completed' | 'on_hold';
  createdDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  managerId: string;
  mentorId?: string;
  objectives: Array<{
    id: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: 'not_started' | 'in_progress' | 'completed';
    dueDate: Date;
    completedAt?: Date;
    evidence?: string[];
  }>;
  trainingPrograms: Array<{
    id: string;
    name: string;
    provider: string;
    type: 'online' | 'classroom' | 'workshop' | 'conference' | 'certification';
    startDate: Date;
    endDate: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    cost?: number;
    certificate?: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: Date;
    achieved: boolean;
    achievedAt?: Date;
    evidence?: string;
  }>;
  resources: Array<{
    type: 'book' | 'course' | 'mentor' | 'tool' | 'budget' | 'other';
    name: string;
    description: string;
    provided: boolean;
    providedAt?: Date;
    cost?: number;
  }>;
  progress: number; // 0-100
  lastUpdated: Date;
  nextReviewDate: Date;
  notes: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
  }>;
}

export interface PerformanceMetrics {
  employeeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  productivity: {
    tasksCompleted: number;
    tasksOnTime: number;
    qualityScore: number;
    efficiency: number;
  };
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    tardyCount: number;
    overtimeHours: number;
  };
  goals: {
    totalGoals: number;
    completedGoals: number;
    overdueGoals: number;
    averageProgress: number;
  };
  feedback: {
    feedbackCount: number;
    averageRating: number;
    positiveFeedback: number;
    constructiveFeedback: number;
  };
  development: {
    trainingHours: number;
    certificationsEarned: number;
    skillsAcquired: number;
    mentorshipSessions: number;
  };
  overallScore: number;
  trend: 'improving' | 'stable' | 'declining';
  rankInDepartment: number;
  rankInCompany: number;
}

class PerformanceService extends EventEmitter {
  private reviewTemplates: Map<string, PerformanceReviewTemplate> = new Map();
  private reviews: Map<string, PerformanceReview> = new Map();
  private goals: Map<string, Goal> = new Map();
  private feedback: Map<string, Feedback> = new Map();
  private developmentPlans: Map<string, DevelopmentPlan> = new Map();
  private metrics: Map<string, PerformanceMetrics[]> = new Map();

  constructor() {
    super();
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default review templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: PerformanceReviewTemplate[] = [
      {
        id: 'annual_review',
        name: 'Annual Performance Review',
        description: 'Comprehensive annual performance evaluation',
        reviewType: 'annual',
        categories: [
          {
            name: 'Job Knowledge',
            weight: 20,
            questions: [
              {
                id: 'jk1',
                question: 'Demonstrates understanding of job requirements and responsibilities',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'jk2',
                question: 'Maintains up-to-date knowledge of industry trends and best practices',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Quality of Work',
            weight: 25,
            questions: [
              {
                id: 'qw1',
                question: 'Work is accurate, thorough, and meets quality standards',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'qw2',
                question: 'Attention to detail and error prevention',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Productivity',
            weight: 20,
            questions: [
              {
                id: 'pr1',
                question: 'Completes work assignments in a timely manner',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'pr2',
                question: 'Manages workload effectively and prioritizes tasks',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Initiative',
            weight: 15,
            questions: [
              {
                id: 'in1',
                question: 'Takes initiative to identify and solve problems',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'in2',
                question: 'Seeks opportunities for improvement and innovation',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Teamwork',
            weight: 10,
            questions: [
              {
                id: 'tw1',
                question: 'Collaborates effectively with team members',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'tw2',
                question: 'Contributes positively to team environment',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Communication',
            weight: 10,
            questions: [
              {
                id: 'cm1',
                question: 'Communicates clearly and effectively',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'cm2',
                question: 'Listens actively and responds appropriately',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          }
        ],
        overallRatingScale: {
          min: 1,
          max: 5,
          labels: [
            { value: 1, label: 'Needs Improvement', description: 'Performance does not meet expectations' },
            { value: 2, label: 'Below Expectations', description: 'Performance occasionally meets expectations' },
            { value: 3, label: 'Meets Expectations', description: 'Performance consistently meets expectations' },
            { value: 4, label: 'Exceeds Expectations', description: 'Performance frequently exceeds expectations' },
            { value: 5, label: 'Outstanding', description: 'Performance consistently exceeds expectations' }
          ]
        },
        goalsSection: {
          enabled: true,
          required: true,
          maxGoals: 5
        },
        commentsSection: {
          enabled: true,
          required: true,
          includeEmployeeComments: true
        },
        approvalWorkflow: [
          { role: 'manager', order: 1, required: true },
          { role: 'hr', order: 2, required: true }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      },
      {
        id: 'probation_review',
        name: 'Probation Review',
        description: 'Evaluation for employees completing probation period',
        reviewType: 'probation',
        categories: [
          {
            name: 'Job Performance',
            weight: 40,
            questions: [
              {
                id: 'jp1',
                question: 'Ability to perform job duties as required',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'jp2',
                question: 'Quality and consistency of work',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Adaptability',
            weight: 30,
            questions: [
              {
                id: 'ad1',
                question: 'Ability to learn and adapt to company processes',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'ad2',
                question: 'Integration with team and company culture',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          },
          {
            name: 'Potential',
            weight: 30,
            questions: [
              {
                id: 'po1',
                question: 'Demonstrated potential for growth',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              },
              {
                id: 'po2',
                question: 'Alignment with company values and goals',
                type: 'rating',
                required: true,
                minRating: 1,
                maxRating: 5
              }
            ]
          }
        ],
        overallRatingScale: {
          min: 1,
          max: 5,
          labels: [
            { value: 1, label: 'Not Suitable', description: 'Does not meet probation requirements' },
            { value: 2, label: 'Needs Development', description: 'Requires additional support' },
            { value: 3, label: 'Meets Requirements', description: 'Satisfies probation expectations' },
            { value: 4, label: 'Exceeds Requirements', description: 'Shows strong potential' },
            { value: 5, label: 'Exceptional', description: 'Outstanding performance during probation' }
          ]
        },
        goalsSection: {
          enabled: true,
          required: true,
          maxGoals: 3
        },
        commentsSection: {
          enabled: true,
          required: true,
          includeEmployeeComments: true
        },
        approvalWorkflow: [
          { role: 'manager', order: 1, required: true },
          { role: 'hr', order: 2, required: true }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedBy: 'system'
      }
    ];

    defaultTemplates.forEach(template => {
      this.reviewTemplates.set(template.id, template);
    });
  }

  /**
   * Create performance review
   */
  async createReview(reviewData: {
    employeeId: string;
    templateId: string;
    reviewPeriod: { startDate: Date; endDate: Date };
    reviewerId: string;
    scheduledCompletionDate: Date;
  }): Promise<PerformanceReview> {
    try {
      const template = this.reviewTemplates.get(reviewData.templateId);
      if (!template) {
        throw new Error('Review template not found');
      }

      const employee = await Employee.findOne({ employeeId: reviewData.employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const reviewer = await Employee.findOne({ employeeId: reviewData.reviewerId, isDeleted: false });
      if (!reviewer) {
        throw new Error('Reviewer not found');
      }

      const review: PerformanceReview = {
        id: new Date().getTime().toString(),
        employeeId: reviewData.employeeId,
        templateId: reviewData.templateId,
        reviewPeriod: reviewData.reviewPeriod,
        reviewType: template.reviewType,
        reviewerId: reviewData.reviewerId,
        reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
        reviewerRole: reviewer.employment.position,
        status: 'draft',
        overallRating: 0,
        categoryScores: [],
        responses: [],
        goals: [],
        strengths: [],
        areasForImprovement: [],
        developmentPlan: [],
        compensationRecommendation: {},
        comments: {
          reviewerComments: ''
        },
        signatures: [],
        workflowHistory: [{
          action: 'created',
          performedBy: reviewData.reviewerId,
          performedAt: new Date(),
          comments: 'Performance review created'
        }],
        scheduledCompletionDate: reviewData.scheduledCompletionDate,
        isLate: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.reviews.set(review.id, review);
      this.emit('reviewCreated', review);

      return review;
    } catch (error) {
      throw new Error(`Failed to create review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Submit performance review
   */
  async submitReview(
    reviewId: string,
    reviewData: {
      responses: Array<{
        categoryId: string;
        questionId: string;
        response: any;
        score?: number;
      }>;
      goals: Array<{
        description: string;
        category: string;
        dueDate: Date;
        priority: 'low' | 'medium' | 'high';
      }>;
      strengths: string[];
      areasForImprovement: string[];
      developmentPlan: Array<{
        area: string;
        actions: string[];
        resources: string[];
        timeline: string;
        responsible: string;
      }>;
      compensationRecommendation?: {
        salaryIncrease?: number;
        bonus?: number;
        promotion?: boolean;
        newPosition?: string;
        effectiveDate?: Date;
        justification?: string;
      };
      reviewerComments: string;
    },
    submittedBy: string
  ): Promise<PerformanceReview> {
    try {
      const review = this.reviews.get(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      if (review.status !== 'draft') {
        throw new Error('Review is not in draft status');
      }

      const template = this.reviewTemplates.get(review.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Update review data
      review.responses = reviewData.responses;
      review.goals = reviewData.goals.map((goal, index) => ({
        id: `goal_${index + 1}`,
        ...goal,
        status: 'pending',
        progress: 0
      }));
      review.strengths = reviewData.strengths;
      review.areasForImprovement = reviewData.areasForImprovement;
      review.developmentPlan = reviewData.developmentPlan;
      review.compensationRecommendation = reviewData.compensationRecommendation || {};
      review.comments.reviewerComments = reviewData.reviewerComments;

      // Calculate category scores and overall rating
      const calculatedScores = this.calculateReviewScores(review, template);
      review.categoryScores = calculatedScores.categoryScores;
      review.overallRating = calculatedScores.overallRating;

      // Update status and workflow
      review.status = 'submitted';
      review.actualCompletionDate = new Date();
      review.workflowHistory.push({
        action: 'submitted',
        performedBy: submittedBy,
        performedAt: new Date(),
        comments: 'Review submitted for approval'
      });

      review.updatedAt = new Date();
      this.reviews.set(reviewId, review);

      // Emit events
      this.emit('reviewSubmitted', review);
      this.emit('reviewScoresCalculated', { review, scores: calculatedScores });

      return review;
    } catch (error) {
      throw new Error(`Failed to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate review scores
   */
  private calculateReviewScores(
    review: PerformanceReview,
    template: PerformanceReviewTemplate
  ): { categoryScores: any[]; overallRating: number } {
    const categoryScores: any[] = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const category of template.categories) {
      const categoryResponses = review.responses.filter(r => 
        template.categories.some(c => 
          c.name === category.name && c.questions.some(q => q.id === r.questionId)
        )
      );

      if (categoryResponses.length > 0) {
        const categoryScore = categoryResponses.reduce((sum, response) => {
          return sum + (response.score || 0);
        }, 0) / categoryResponses.length;

        const weightedScore = categoryScore * (category.weight / 100);

        categoryScores.push({
          categoryName: category.name,
          score: categoryScore,
          weight: category.weight,
          weightedScore
        });

        totalWeightedScore += weightedScore;
        totalWeight += category.weight;
      }
    }

    const overallRating = totalWeight > 0 ? totalWeightedScore / (totalWeight / 100) : 0;

    return { categoryScores, overallRating };
  }

  /**
   * Approve performance review
   */
  async approveReview(
    reviewId: string,
    approverId: string,
    approverRole: string,
    comments?: string
  ): Promise<PerformanceReview> {
    try {
      const review = this.reviews.get(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      if (review.status !== 'submitted' && review.status !== 'under_review') {
        throw new Error('Review is not ready for approval');
      }

      // Add signature
      review.signatures.push({
        role: approverRole as 'employee' | 'reviewer' | 'hr' | 'manager',
        name: approverId, // Would fetch actual name
        signedAt: new Date(),
        status: 'signed'
      });

      // Update workflow
      review.workflowHistory.push({
        action: 'approved',
        performedBy: approverId,
        performedAt: new Date(),
        comments: comments || 'Review approved'
      });

      // Check if all required approvals are received
      const template = this.reviewTemplates.get(review.templateId);
      const requiredApprovals = template?.approvalWorkflow.filter(w => w.required) || [];
      const receivedApprovals = review.signatures.filter(s => 
        requiredApprovals.some(w => w.role === s.role)
      );

      if (receivedApprovals.length >= requiredApprovals.length) {
        review.status = 'approved';
        this.emit('reviewFullyApproved', review);
      } else {
        review.status = 'under_review';
      }

      review.updatedAt = new Date();
      this.reviews.set(reviewId, review);

      this.emit('reviewApproved', { review, approverId, approverRole });

      return review;
    } catch (error) {
      throw new Error(`Failed to approve review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create goal
   */
  async createGoal(goalData: {
    employeeId: string;
    title: string;
    description: string;
    category: 'performance' | 'development' | 'career' | 'project' | 'behavioral';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate: Date;
    assignedBy: string;
    assignee: string;
    keyResults?: Array<{
      description: string;
      target: string;
      unit: string;
    }>;
    parentGoalId?: string;
    weight?: number;
    isCompanyWide?: boolean;
    department?: string;
    tags?: string[];
  }): Promise<Goal> {
    try {
      const employee = await Employee.findOne({ employeeId: goalData.employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const goal: Goal = {
        id: new Date().getTime().toString(),
        ...goalData,
        status: 'draft',
        progress: 0,
        createdDate: new Date(),
        reviewers: [],
        keyResults: goalData.keyResults?.map((kr, index) => ({
          ...kr,
          current: '0',
          achieved: false
        })) || [],
        milestones: [],
        resources: [],
        notes: [],
        attachments: [],
        linkedReviews: [],
        childGoalIds: [],
        weight: goalData.weight || 1,
        isCompanyWide: goalData.isCompanyWide || false,
        tags: goalData.tags || []
      };

      this.goals.set(goal.id, goal);
      this.emit('goalCreated', goal);

      return goal;
    } catch (error) {
      throw new Error(`Failed to create goal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    progress: number,
    updates: {
      status?: 'draft' | 'active' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled' | 'overdue';
      notes?: string;
      keyResults?: Array<{
        description: string;
        current: string;
        achieved: boolean;
      }>;
      milestones?: Array<{
        id: string;
        completed: boolean;
        completedAt?: Date;
      }>;
    },
    updatedBy: string
  ): Promise<Goal> {
    try {
      const goal = this.goals.get(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      goal.progress = Math.max(0, Math.min(100, progress));

      if (updates.status) {
        goal.status = updates.status;
        if (updates.status === 'completed') {
          goal.completedDate = new Date();
          goal.progress = 100;
        }
      }

      if (updates.keyResults) {
        goal.keyResults = updates.keyResults;
      }

      if (updates.milestones) {
        updates.milestones.forEach(milestoneUpdate => {
          const milestone = goal.milestones.find(m => m.id === milestoneUpdate.id);
          if (milestone) {
            milestone.completed = milestoneUpdate.completed;
            if (milestoneUpdate.completed) {
              milestone.completedAt = milestoneUpdate.completedAt || new Date();
            }
          }
        });
      }

      if (updates.notes) {
        goal.notes.push({
          id: new Date().getTime().toString(),
          content: updates.notes,
          createdBy: updatedBy,
          createdAt: new Date(),
          isPrivate: false
        });
      }

      this.goals.set(goalId, goal);
      this.emit('goalProgressUpdated', { goal, progress, updatedBy });

      return goal;
    } catch (error) {
      throw new Error(`Failed to update goal progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add feedback
   */
  async addFeedback(feedbackData: {
    employeeId: string;
    fromEmployeeId: string;
    relationship: 'manager' | 'peer' | 'direct_report' | 'self' | 'client' | 'customer';
    type: 'praise' | 'constructive' | 'suggestion' | 'concern' | 'achievement';
    category: 'performance' | 'behavior' | 'teamwork' | 'leadership' | 'communication' | 'initiative' | 'problem_solving' | 'other';
    content: string;
    isAnonymous?: boolean;
    isPrivate?: boolean;
    rating?: number;
    tags?: string[];
    linkedGoals?: string[];
    linkedProjects?: string[];
  }): Promise<Feedback> {
    try {
      const fromEmployee = await Employee.findOne({ employeeId: feedbackData.fromEmployeeId, isDeleted: false });
      if (!fromEmployee) {
        throw new Error('Feedback provider not found');
      }

      const feedback: Feedback = {
        id: new Date().getTime().toString(),
        ...feedbackData,
        fromEmployeeName: `${fromEmployee.firstName} ${fromEmployee.lastName}`,
        isAnonymous: feedbackData.isAnonymous || false,
        isPrivate: feedbackData.isPrivate || false,
        tags: feedbackData.tags || [],
        linkedGoals: feedbackData.linkedGoals || [],
        linkedProjects: feedbackData.linkedProjects || [],
        date: new Date(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.feedback.set(feedback.id, feedback);
      this.emit('feedbackAdded', feedback);

      return feedback;
    } catch (error) {
      throw new Error(`Failed to add feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create development plan
   */
  async createDevelopmentPlan(planData: {
    employeeId: string;
    name: string;
    description: string;
    type: 'individual' | 'team' | 'leadership' | 'technical' | 'soft_skills';
    targetCompletionDate: Date;
    managerId: string;
    mentorId?: string;
    objectives?: Array<{
      description: string;
      category: string;
      priority: 'low' | 'medium' | 'high';
      dueDate: Date;
    }>;
  }): Promise<DevelopmentPlan> {
    try {
      const employee = await Employee.findOne({ employeeId: planData.employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      const plan: DevelopmentPlan = {
        id: new Date().getTime().toString(),
        ...planData,
        status: 'draft',
        createdDate: new Date(),
        objectives: planData.objectives?.map((obj, index) => ({
          id: `obj_${index + 1}`,
          ...obj,
          status: 'not_started'
        })) || [],
        trainingPrograms: [],
        milestones: [],
        resources: [],
        progress: 0,
        lastUpdated: new Date(),
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: []
      };

      this.developmentPlans.set(plan.id, plan);
      this.emit('developmentPlanCreated', plan);

      return plan;
    } catch (error) {
      throw new Error(`Failed to create development plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate performance metrics
   */
  async calculatePerformanceMetrics(
    employeeId: string,
    period: { startDate: Date; endDate: Date }
  ): Promise<PerformanceMetrics> {
    try {
      const employee = await Employee.findOne({ employeeId, isDeleted: false });
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get reviews for the period
      const periodReviews = Array.from(this.reviews.values()).filter(r =>
        r.employeeId === employeeId &&
        r.reviewPeriod.startDate >= period.startDate &&
        r.reviewPeriod.endDate <= period.endDate &&
        r.status === 'approved'
      );

      // Get goals for the period
      const periodGoals = Array.from(this.goals.values()).filter(g =>
        g.employeeId === employeeId &&
        g.createdDate >= period.startDate &&
        g.createdDate <= period.endDate
      );

      // Get feedback for the period
      const periodFeedback = Array.from(this.feedback.values()).filter(f =>
        f.employeeId === employeeId &&
        f.date >= period.startDate &&
        f.date <= period.endDate
      );

      // Calculate metrics
      const productivity = {
        tasksCompleted: 0, // Would integrate with task management system
        tasksOnTime: 0,
        qualityScore: periodReviews.length > 0 ? 
          periodReviews.reduce((sum, r) => sum + r.overallRating, 0) / periodReviews.length : 0,
        efficiency: 0 // Would calculate based on output vs input
      };

      const attendance = {
        daysPresent: 0, // Would integrate with attendance system
        daysAbsent: 0,
        tardyCount: 0,
        overtimeHours: employee.totalOvertimeHours || 0
      };

      const goals = {
        totalGoals: periodGoals.length,
        completedGoals: periodGoals.filter(g => g.status === 'completed').length,
        overdueGoals: periodGoals.filter(g => g.status === 'overdue').length,
        averageProgress: periodGoals.length > 0 ?
          periodGoals.reduce((sum, g) => sum + g.progress, 0) / periodGoals.length : 0
      };

      const feedback = {
        feedbackCount: periodFeedback.length,
        averageRating: periodFeedback.filter(f => f.rating).length > 0 ?
          periodFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / periodFeedback.filter(f => f.rating).length : 0,
        positiveFeedback: periodFeedback.filter(f => f.type === 'praise' || f.type === 'achievement').length,
        constructiveFeedback: periodFeedback.filter(f => f.type === 'constructive' || f.type === 'suggestion').length
      };

      const development = {
        trainingHours: employee.trainingRecords
          .filter(tr => tr.startDate >= period.startDate && tr.startDate <= period.endDate && tr.status === 'completed')
          .reduce((sum, tr) => {
            const duration = tr.endDate ? (tr.endDate.getTime() - tr.startDate.getTime()) / (1000 * 60 * 60) : 0;
            return sum + duration;
          }, 0),
        certificationsEarned: employee.skills.filter(s => 
          s.certified && s.certificationDetails?.issueDate && 
          s.certificationDetails.issueDate >= period.startDate && 
          s.certificationDetails.issueDate <= period.endDate
        ).length,
        skillsAcquired: 0, // Would track new skills acquired
        mentorshipSessions: 0 // Would track mentorship activities
      };

      // Calculate overall score
      const overallScore = (
        productivity.qualityScore * 0.3 +
        (goals.averageProgress / 100) * 0.3 +
        feedback.averageRating * 0.2 +
        (development.trainingHours / 40) * 0.2 // Assuming 40 hours is ideal
      );

      const metrics: PerformanceMetrics = {
        employeeId,
        period,
        productivity,
        attendance,
        goals,
        feedback,
        development,
        overallScore,
        trend: 'stable', // Would calculate based on historical data
        rankInDepartment: 0, // Would calculate based on department comparison
        rankInCompany: 0 // Would calculate based on company comparison
      };

      // Store metrics
      const employeeMetrics = this.metrics.get(employeeId) || [];
      employeeMetrics.push(metrics);
      this.metrics.set(employeeId, employeeMetrics);

      this.emit('metricsCalculated', metrics);

      return metrics;
    } catch (error) {
      throw new Error(`Failed to calculate performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get performance reviews
   */
  getReviews(options: {
    employeeId?: string;
    reviewerId?: string;
    status?: string;
    reviewType?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): PerformanceReview[] {
    let reviews = Array.from(this.reviews.values());

    if (options.employeeId) {
      reviews = reviews.filter(r => r.employeeId === options.employeeId);
    }

    if (options.reviewerId) {
      reviews = reviews.filter(r => r.reviewerId === options.reviewerId);
    }

    if (options.status) {
      reviews = reviews.filter(r => r.status === options.status);
    }

    if (options.reviewType) {
      reviews = reviews.filter(r => r.reviewType === options.reviewType);
    }

    if (options.startDate) {
      reviews = reviews.filter(r => r.reviewPeriod.startDate >= options.startDate!);
    }

    if (options.endDate) {
      reviews = reviews.filter(r => r.reviewPeriod.endDate <= options.endDate!);
    }

    return reviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get goals
   */
  getGoals(options: {
    employeeId?: string;
    status?: string;
    category?: string;
    priority?: string;
    assignedBy?: string;
    isCompanyWide?: boolean;
    department?: string;
  } = {}): Goal[] {
    let goals = Array.from(this.goals.values());

    if (options.employeeId) {
      goals = goals.filter(g => g.employeeId === options.employeeId);
    }

    if (options.status) {
      goals = goals.filter(g => g.status === options.status);
    }

    if (options.category) {
      goals = goals.filter(g => g.category === options.category);
    }

    if (options.priority) {
      goals = goals.filter(g => g.priority === options.priority);
    }

    if (options.assignedBy) {
      goals = goals.filter(g => g.assignedBy === options.assignedBy);
    }

    if (options.isCompanyWide !== undefined) {
      goals = goals.filter(g => g.isCompanyWide === options.isCompanyWide);
    }

    if (options.department) {
      goals = goals.filter(g => g.department === options.department);
    }

    return goals.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * Get feedback
   */
  getFeedback(options: {
    employeeId?: string;
    fromEmployeeId?: string;
    type?: string;
    category?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Feedback[] {
    let feedback = Array.from(this.feedback.values());

    if (options.employeeId) {
      feedback = feedback.filter(f => f.employeeId === options.employeeId);
    }

    if (options.fromEmployeeId) {
      feedback = feedback.filter(f => f.fromEmployeeId === options.fromEmployeeId);
    }

    if (options.type) {
      feedback = feedback.filter(f => f.type === options.type);
    }

    if (options.category) {
      feedback = feedback.filter(f => f.category === options.category);
    }

    if (options.status) {
      feedback = feedback.filter(f => f.status === options.status);
    }

    if (options.startDate) {
      feedback = feedback.filter(f => f.date >= options.startDate!);
    }

    if (options.endDate) {
      feedback = feedback.filter(f => f.date <= options.endDate!);
    }

    return feedback.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get development plans
   */
  getDevelopmentPlans(options: {
    employeeId?: string;
    managerId?: string;
    status?: string;
    type?: string;
  } = {}): DevelopmentPlan[] {
    let plans = Array.from(this.developmentPlans.values());

    if (options.employeeId) {
      plans = plans.filter(p => p.employeeId === options.employeeId);
    }

    if (options.managerId) {
      plans = plans.filter(p => p.managerId === options.managerId);
    }

    if (options.status) {
      plans = plans.filter(p => p.status === options.status);
    }

    if (options.type) {
      plans = plans.filter(p => p.type === options.type);
    }

    return plans.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }

  /**
   * Get review templates
   */
  getReviewTemplates(): PerformanceReviewTemplate[] {
    return Array.from(this.reviewTemplates.values());
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalReviews: number;
    completedReviews: number;
    averageRating: number;
    ratingDistribution: any;
    goalsByStatus: any;
    feedbackByType: any;
    developmentPlansByStatus: any;
    topPerformers: any;
    improvementNeeded: any;
  }> {
    const reviews = this.getReviews({ startDate: dateFrom, endDate: dateTo });
    const goals = this.getGoals();
    const feedback = this.getFeedback({ startDate: dateFrom, endDate: dateTo });
    const plans = this.getDevelopmentPlans();

    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === 'approved').length;
    const averageRating = completedReviews > 0 ? 
      reviews.reduce((sum, r) => sum + r.overallRating, 0) / completedReviews : 0;

    // Rating distribution
    const ratingDistribution: any = {};
    reviews.forEach(review => {
      const rating = Math.round(review.overallRating);
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Goals by status
    const goalsByStatus: any = {};
    goals.forEach(goal => {
      goalsByStatus[goal.status] = (goalsByStatus[goal.status] || 0) + 1;
    });

    // Feedback by type
    const feedbackByType: any = {};
    feedback.forEach(f => {
      feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
    });

    // Development plans by status
    const developmentPlansByStatus: any = {};
    plans.forEach(plan => {
      developmentPlansByStatus[plan.status] = (developmentPlansByStatus[plan.status] || 0) + 1;
    });

    // Top performers (employees with highest ratings)
    const employeeRatings: any = {};
    reviews.forEach(review => {
      if (!employeeRatings[review.employeeId]) {
        employeeRatings[review.employeeId] = { total: 0, count: 0 };
      }
      employeeRatings[review.employeeId].total += review.overallRating;
      employeeRatings[review.employeeId].count++;
    });

    const topPerformers = Object.entries(employeeRatings)
      .map(([employeeId, data]: [string, any]) => ({
        employeeId,
        averageRating: data.total / data.count,
        reviewCount: data.count
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);

    // Improvement needed (employees with lowest ratings)
    const improvementNeeded = topPerformers.slice(-10).reverse();

    return {
      totalReviews,
      completedReviews,
      averageRating,
      ratingDistribution,
      goalsByStatus,
      feedbackByType,
      developmentPlansByStatus,
      topPerformers,
      improvementNeeded
    };
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
