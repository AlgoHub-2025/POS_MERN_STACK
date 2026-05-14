import { Customer, ICustomer } from '../models/Customer';
import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  category: 'marketing' | 'transactional' | 'notification' | 'promotional';
  isActive: boolean;
}

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  category: 'marketing' | 'transactional' | 'notification' | 'promotional';
  isActive: boolean;
}

export interface PushNotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  variables: string[];
  category: 'marketing' | 'transactional' | 'notification' | 'promotional';
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'omni';
  templateId: string;
  targetAudience: {
    segments?: string[];
    tags?: string[];
    customerTiers?: string[];
    customFilter?: any;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    sendAt?: Date;
    recurringPattern?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      dayOfWeek?: number;
      dayOfMonth?: number;
      time: string;
    };
  };
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'cancelled';
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    unsubscribed: number;
  };
  createdAt: Date;
  createdBy: string;
}

export interface CommunicationPreferences {
  email: {
    marketing: boolean;
    transactional: boolean;
    newsletters: boolean;
    promotions: boolean;
    updates: boolean;
  };
  sms: {
    marketing: boolean;
    transactional: boolean;
    promotions: boolean;
    alerts: boolean;
  };
  push: {
    marketing: boolean;
    transactional: boolean;
    promotions: boolean;
    updates: boolean;
  };
  frequency: {
    maxEmailsPerDay: number;
    maxSMSPerDay: number;
    maxPushPerDay: number;
    quietHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

class CommunicationService extends EventEmitter {
  private emailTemplates: Map<string, EmailTemplate> = new Map();
  private smsTemplates: Map<string, SMSTemplate> = new Map();
  private pushTemplates: Map<string, PushNotificationTemplate> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private emailTransporter: nodemailer.Transporter;
  private smsClient: twilio.Twilio;

  constructor() {
    super();
    this.initializeEmailTransporter();
    this.initializeSMSClient();
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter(): void {
    // Configure with environment variables
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Initialize SMS client
   */
  private initializeSMSClient(): void {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  /**
   * Initialize default templates
   */
  private initializeDefaultTemplates(): void {
    // Email templates
    const emailTemplates: EmailTemplate[] = [
      {
        id: 'welcome_email',
        name: 'Welcome Email',
        subject: 'Welcome to Our Loyalty Program!',
        htmlBody: `
          <h1>Welcome {{firstName}}!</h1>
          <p>Thank you for joining our loyalty program. You've been enrolled as a {{loyaltyTier}} member.</p>
          <p>You currently have {{loyaltyPoints}} points.</p>
          <p>Start earning more points with every purchase!</p>
        `,
        textBody: 'Welcome {{firstName}}! Thank you for joining our loyalty program.',
        variables: ['firstName', 'loyaltyTier', 'loyaltyPoints'],
        category: 'transactional',
        isActive: true
      },
      {
        id: 'birthday_offer',
        name: 'Birthday Offer',
        subject: 'Happy Birthday {{firstName}}! 🎂',
        htmlBody: `
          <h1>Happy Birthday {{firstName}}!</h1>
          <p>As a special birthday treat, we've added {{birthdayPoints}} bonus points to your account!</p>
          <p>Use them on your next purchase for amazing rewards.</p>
        `,
        textBody: 'Happy Birthday {{firstName}}! We\'ve added {{birthdayPoints}} bonus points to your account!',
        variables: ['firstName', 'birthdayPoints'],
        category: 'promotional',
        isActive: true
      },
      {
        id: 'points_expiring',
        name: 'Points Expiring Soon',
        subject: 'Your Points Are Expiring Soon',
        htmlBody: `
          <p>Hi {{firstName}},</p>
          <p>You have {{expiringPoints}} points that will expire on {{expiryDate}}.</p>
          <p>Don't let them go to waste! Use them on your next purchase.</p>
        `,
        textBody: 'Hi {{firstName}}, you have {{expiringPoints}} points expiring on {{expiryDate}}.',
        variables: ['firstName', 'expiringPoints', 'expiryDate'],
        category: 'notification',
        isActive: true
      }
    ];

    // SMS templates
    const smsTemplates: SMSTemplate[] = [
      {
        id: 'order_confirmation',
        name: 'Order Confirmation',
        body: 'Your order #{{orderId}} has been confirmed! Total: ${{orderAmount}}. Thank you for your purchase!',
        variables: ['orderId', 'orderAmount'],
        category: 'transactional',
        isActive: true
      },
      {
        id: 'points_earned',
        name: 'Points Earned',
        body: 'Great news! You earned {{pointsEarned}} points from your recent purchase. Current balance: {{totalPoints}} points.',
        variables: ['pointsEarned', 'totalPoints'],
        category: 'notification',
        isActive: true
      },
      {
        id: 'promotion_alert',
        name: 'Promotion Alert',
        body: 'Limited time offer! Get {{discount}} off your next purchase. Use code: {{promoCode}}. Valid until {{validUntil}}.',
        variables: ['discount', 'promoCode', 'validUntil'],
        category: 'promotional',
        isActive: true
      }
    ];

    // Push notification templates
    const pushTemplates: PushNotificationTemplate[] = [
      {
        id: 'new_reward',
        name: 'New Reward Available',
        title: 'New Reward Available!',
        body: 'Hi {{firstName}}! A new reward "{{rewardName}}" is available for {{pointsCost}} points.',
        variables: ['firstName', 'rewardName', 'pointsCost'],
        category: 'promotional',
        isActive: true
      },
      {
        id: 'tier_upgrade',
        name: 'Tier Upgrade',
        title: 'Congratulations! 🎉',
        body: 'You\'ve been upgraded to {{newTier}} tier! Enjoy exclusive benefits.',
        variables: ['newTier'],
        category: 'notification',
        isActive: true
      }
    ];

    emailTemplates.forEach(template => {
      this.emailTemplates.set(template.id, template);
    });

    smsTemplates.forEach(template => {
      this.smsTemplates.set(template.id, template);
    });

    pushTemplates.forEach(template => {
      this.pushTemplates.set(template.id, template);
    });
  }

  /**
   * Send email to customer
   */
  async sendEmail(
    customerId: string,
    templateId: string,
    variables: Record<string, any> = {},
    options: {
      priority?: 'high' | 'normal' | 'low';
      sendAt?: Date;
      trackOpens?: boolean;
      trackClicks?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check email consent
      if (!customer.emailConsent) {
        return {
          success: false,
          error: 'Customer has not consented to emails'
        };
      }

      const template = this.emailTemplates.get(templateId);
      if (!template || !template.isActive) {
        throw new Error('Email template not found or inactive');
      }

      // Check category consent
      if (!this.checkCategoryConsent(customer, 'email', template.category)) {
        return {
          success: false,
          error: `Customer has not consented to ${template.category} emails`
        };
      }

      // Process template variables
      const processedSubject = this.processTemplate(template.subject, { ...variables, ...this.getCustomerVariables(customer) });
      const processedHtmlBody = this.processTemplate(template.htmlBody, { ...variables, ...this.getCustomerVariables(customer) });
      const processedTextBody = this.processTemplate(template.textBody, { ...variables, ...this.getCustomerVariables(customer) });

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@algohub.com',
        to: customer.email,
        subject: processedSubject,
        html: processedHtmlBody,
        text: processedTextBody,
        headers: {
          'X-Priority': options.priority === 'high' ? '1' : options.priority === 'low' ? '5' : '3',
          'X-Customer-ID': customerId,
          'X-Template-ID': templateId
        }
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      // Add to communication history
      await customer.addCommunication(
        'email',
        processedSubject,
        'outbound',
        'system',
        processedTextBody.substring(0, 100)
      );

      // Emit event
      this.emit('emailSent', {
        customer,
        templateId,
        messageId: result.messageId,
        variables
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send SMS to customer
   */
  async sendSMS(
    customerId: string,
    templateId: string,
    variables: Record<string, any> = {},
    options: {
      priority?: 'high' | 'normal' | 'low';
      sendAt?: Date;
    } = {}
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Check SMS consent
      if (!customer.smsConsent) {
        return {
          success: false,
          error: 'Customer has not consented to SMS'
        };
      }

      const template = this.smsTemplates.get(templateId);
      if (!template || !template.isActive) {
        throw new Error('SMS template not found or inactive');
      }

      // Check category consent
      if (!this.checkCategoryConsent(customer, 'sms', template.category)) {
        return {
          success: false,
          error: `Customer has not consented to ${template.category} SMS`
        };
      }

      // Process template variables
      const processedBody = this.processTemplate(template.body, { ...variables, ...this.getCustomerVariables(customer) });

      if (!this.smsClient) {
        throw new Error('SMS client not configured');
      }

      const message = await this.smsClient.messages.create({
        body: processedBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone
      });

      // Add to communication history
      await customer.addCommunication(
        'sms',
        processedBody,
        'outbound',
        'system'
      );

      // Emit event
      this.emit('smsSent', {
        customer,
        templateId,
        messageId: message.sid,
        variables
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send push notification to customer
   */
  async sendPushNotification(
    customerId: string,
    templateId: string,
    variables: Record<string, any> = {},
    deviceTokens?: string[]
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const template = this.pushTemplates.get(templateId);
      if (!template || !template.isActive) {
        throw new Error('Push template not found or inactive');
      }

      // Check category consent
      if (!this.checkCategoryConsent(customer, 'push', template.category)) {
        return {
          success: false,
          error: `Customer has not consented to ${template.category} push notifications`
        };
      }

      // Process template variables
      const processedTitle = this.processTemplate(template.title, { ...variables, ...this.getCustomerVariables(customer) });
      const processedBody = this.processTemplate(template.body, { ...variables, ...this.getCustomerVariables(customer) });

      // This would integrate with FCM, APNS, or other push services
      // For now, we'll just log it
      console.log(`Push notification to ${customerId}: ${processedTitle} - ${processedBody}`);

      // Add to communication history
      await customer.addCommunication(
        'push',
        `${processedTitle}: ${processedBody}`,
        'outbound',
        'system'
      );

      // Emit event
      this.emit('pushNotificationSent', {
        customer,
        templateId,
        title: processedTitle,
        body: processedBody,
        variables
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check category consent
   */
  private checkCategoryConsent(customer: ICustomer, channel: 'email' | 'sms' | 'push', category: string): boolean {
    const preferences = customer.notificationPreferences;

    switch (channel) {
      case 'email':
        if (category === 'marketing' && !preferences.promotions) return false;
        if (category === 'transactional' && !preferences.orderUpdates) return false;
        if (category === 'notification' && !preferences.loyaltyUpdates) return false;
        if (category === 'promotional' && !preferences.promotions) return false;
        break;
      case 'sms':
        // SMS consent is simpler - just check overall consent
        return customer.smsConsent;
      case 'push':
        // Push consent is simpler - just check overall consent
        return true; // Assuming push is always allowed for now
    }

    return true;
  }

  /**
   * Process template variables
   */
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  /**
   * Get customer variables for templates
   */
  private getCustomerVariables(customer: ICustomer): Record<string, any> {
    return {
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      loyaltyTier: customer.loyaltyTier,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      orderCount: customer.orderCount,
      lastPurchaseAt: customer.lastPurchaseAt,
      createdAt: customer.createdAt
    };
  }

  /**
   * Create campaign
   */
  async createCampaign(
    campaignData: Omit<Campaign, 'id' | 'status' | 'metrics' | 'createdAt'>
  ): Promise<Campaign> {
    const campaign: Campaign = {
      ...campaignData,
      id: new Date().getTime().toString(),
      status: 'draft',
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
        unsubscribed: 0
      },
      createdAt: new Date()
    };

    this.campaigns.set(campaign.id, campaign);
    this.emit('campaignCreated', campaign);

    return campaign;
  }

  /**
   * Execute campaign
   */
  async executeCampaign(campaignId: string): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be executed');
      }

      campaign.status = 'running';

      // Get target customers
      const targetCustomers = await this.getTargetCustomers(campaign.targetAudience);

      let sent = 0;
      let failed = 0;

      for (const customer of targetCustomers) {
        try {
          let result;
          switch (campaign.type) {
            case 'email':
              result = await this.sendEmail(customer.customerId, campaign.templateId);
              break;
            case 'sms':
              result = await this.sendSMS(customer.customerId, campaign.templateId);
              break;
            case 'push':
              result = await this.sendPushNotification(customer.customerId, campaign.templateId);
              break;
          }

          if (result.success) {
            sent++;
            campaign.metrics.sent++;
          } else {
            failed++;
            campaign.metrics.failed++;
          }
        } catch (error) {
          failed++;
          campaign.metrics.failed++;
        }
      }

      campaign.status = 'completed';
      this.emit('campaignCompleted', campaign);

      return {
        success: true,
        message: `Campaign completed. Sent: ${sent}, Failed: ${failed}`,
        results: { sent, failed }
      };
    } catch (error) {
      const campaign = this.campaigns.get(campaignId);
      if (campaign) {
        campaign.status = 'failed';
      }
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get target customers for campaign
   */
  private async getTargetCustomers(targetAudience: Campaign['targetAudience']): Promise<ICustomer[]> {
    const query: any = {};

    if (targetAudience.segments && targetAudience.segments.length > 0) {
      query['segments.segmentId'] = { $in: targetAudience.segments };
    }

    if (targetAudience.tags && targetAudience.tags.length > 0) {
      query.tags = { $in: targetAudience.tags };
    }

    if (targetAudience.customerTiers && targetAudience.customerTiers.length > 0) {
      query.loyaltyTier = { $in: targetAudience.customerTiers };
    }

    if (targetAudience.customFilter) {
      Object.assign(query, targetAudience.customFilter);
    }

    return await Customer.find(query);
  }

  /**
   * Send automated birthday messages
   */
  async sendBirthdayMessages(): Promise<{
    sent: number;
    failed: number;
  }> {
    const today = new Date();
    const customers = await Customer.find({
      dateOfBirth: {
        $exists: true
      }
    });

    let sent = 0;
    let failed = 0;

    for (const customer of customers) {
      if (this.isCustomerBirthday(customer, today)) {
        try {
          const result = await this.sendEmail(customer.customerId, 'birthday_offer', {
            birthdayPoints: this.getBirthdayBonus(customer.loyaltyTier)
          });

          if (result.success) {
            sent++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Send automated anniversary messages
   */
  async sendAnniversaryMessages(): Promise<{
    sent: number;
    failed: number;
  }> {
    const today = new Date();
    const customers = await Customer.find({
      loyaltyMemberSince: {
        $exists: true
      }
    });

    let sent = 0;
    let failed = 0;

    for (const customer of customers) {
      if (this.isCustomerAnniversary(customer, today)) {
        try {
          const result = await this.sendEmail(customer.customerId, 'anniversary_reward', {
            anniversaryPoints: this.getAnniversaryBonus(customer.loyaltyTier)
          });

          if (result.success) {
            sent++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }
    }

    return { sent, failed };
  }

  /**
   * Check if it's customer's birthday
   */
  private isCustomerBirthday(customer: ICustomer, date: Date): boolean {
    if (!customer.dateOfBirth) return false;
    
    const dob = new Date(customer.dateOfBirth);
    return dob.getMonth() === date.getMonth() && dob.getDate() === date.getDate();
  }

  /**
   * Check if it's customer's anniversary
   */
  private isCustomerAnniversary(customer: ICustomer, date: Date): boolean {
    if (!customer.loyaltyMemberSince) return false;
    
    const anniversary = new Date(customer.loyaltyMemberSince);
    return anniversary.getMonth() === date.getMonth() && anniversary.getDate() === date.getDate();
  }

  /**
   * Get birthday bonus based on tier
   */
  private getBirthdayBonus(tier: string): number {
    const bonuses = {
      bronze: 50,
      silver: 100,
      gold: 200,
      platinum: 500,
      none: 0
    };
    return bonuses[tier] || 0;
  }

  /**
   * Get anniversary bonus based on tier
   */
  private getAnniversaryBonus(tier: string): number {
    const bonuses = {
      bronze: 25,
      silver: 50,
      gold: 100,
      platinum: 250,
      none: 0
    };
    return bonuses[tier] || 0;
  }

  /**
   * Get communication analytics
   */
  async getCommunicationAnalytics(dateFrom?: Date, dateTo?: Date): Promise<{
    totalSent: number;
    emailSent: number;
    smsSent: number;
    pushSent: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
    campaignsCompleted: number;
    topPerformingTemplates: any[];
  }> {
    try {
      // This would typically query a communication analytics database
      // For now, we'll return mock data
      return {
        totalSent: 1250,
        emailSent: 800,
        smsSent: 350,
        pushSent: 100,
        openRate: 0.45,
        clickRate: 0.12,
        deliveryRate: 0.95,
        campaignsCompleted: 15,
        topPerformingTemplates: [
          { templateId: 'welcome_email', sent: 200, opens: 180, clicks: 45 },
          { templateId: 'birthday_offer', sent: 150, opens: 135, clicks: 60 },
          { templateId: 'points_earned', sent: 300, opens: 120, clicks: 30 }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get communication analytics: ${error.message}`);
    }
  }

  /**
   * Update customer communication preferences
   */
  async updateCommunicationPreferences(
    customerId: string,
    preferences: Partial<CommunicationPreferences>
  ): Promise<ICustomer> {
    try {
      const customer = await Customer.findOne({ customerId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Update notification preferences
      if (preferences.email) {
        customer.notificationPreferences.promotions = preferences.email.marketing;
        customer.notificationPreferences.orderUpdates = preferences.email.transactional;
        customer.notificationPreferences.newsletters = preferences.email.newsletters;
      }

      if (preferences.sms) {
        customer.smsConsent = preferences.sms.marketing || preferences.sms.transactional;
      }

      customer.updatedBy = 'system';
      await customer.save();

      this.emit('preferencesUpdated', { customer, preferences });

      return customer;
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Get all templates
   */
  getTemplates(): {
    email: EmailTemplate[];
    sms: SMSTemplate[];
    push: PushNotificationTemplate[];
  } {
    return {
      email: Array.from(this.emailTemplates.values()),
      sms: Array.from(this.smsTemplates.values()),
      push: Array.from(this.pushTemplates.values())
    };
  }

  /**
   * Get all campaigns
   */
  getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Add email template
   */
  addEmailTemplate(template: EmailTemplate): void {
    this.emailTemplates.set(template.id, template);
    this.emit('emailTemplateAdded', template);
  }

  /**
   * Add SMS template
   */
  addSMSTemplate(template: SMSTemplate): void {
    this.smsTemplates.set(template.id, template);
    this.emit('smsTemplateAdded', template);
  }

  /**
   * Add push template
   */
  addPushTemplate(template: PushNotificationTemplate): void {
    this.pushTemplates.set(template.id, template);
    this.emit('pushTemplateAdded', template);
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
