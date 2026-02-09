import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth and tenant headers
    this.client.interceptors.request.use((config) => {
      if (this.tenantId) {
        config.headers['x-tenant-id'] = this.tenantId;
      }

      // Add auth token if available
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiClient();

// Type definitions for API responses
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Account API
export const accountsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Account>>('/accounts', { params }),
  getById: (id: string) => api.get<Account>(`/accounts/${id}`),
  create: (data: CreateAccountInput) => api.post<Account>('/accounts', data),
  update: (id: string, data: UpdateAccountInput) => api.patch<Account>(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
  search: (q: string, limit?: number) =>
    api.get<Account[]>('/accounts/search', { params: { q, limit } }),
};

// Jobs API
export const jobsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Job>>('/jobs', { params }),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`),
  create: (data: CreateJobInput) => api.post<Job>('/jobs', data),
  update: (id: string, data: UpdateJobInput) => api.patch<Job>(`/jobs/${id}`, data),
  transition: (id: string, data: JobTransitionInput) =>
    api.post<Job>(`/jobs/${id}/transition`, data),
  getAvailableTransitions: (id: string) =>
    api.get<string[]>(`/jobs/${id}/available-transitions`),
  getCalendarJobs: (startDate: string, endDate: string, crewId?: string) =>
    api.get<Job[]>('/jobs/calendar', { params: { startDate, endDate, crewId } }),
};

// Estimates API
export const estimatesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Estimate>>('/estimates', { params }),
  getById: (id: string) => api.get<Estimate>(`/estimates/${id}`),
  create: (data: CreateEstimateInput) => api.post<Estimate>('/estimates', data),
  update: (id: string, data: UpdateEstimateInput) => api.patch<Estimate>(`/estimates/${id}`, data),
  send: (id: string) => api.post<Estimate>(`/estimates/${id}/send`),
  approve: (id: string, signatureData: ApprovalSignatureInput) =>
    api.post<Estimate>(`/estimates/${id}/approve`, signatureData),
  createVersion: (id: string) => api.post<Estimate>(`/estimates/${id}/version`),
  convertToJob: (id: string) => api.post<Job>(`/estimates/${id}/convert`),
};

// Invoices API
export const invoicesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Invoice>>('/invoices', { params }),
  getById: (id: string) => api.get<Invoice>(`/invoices/${id}`),
  create: (data: CreateInvoiceInput) => api.post<Invoice>('/invoices', data),
  update: (id: string, data: UpdateInvoiceInput) => api.patch<Invoice>(`/invoices/${id}`, data),
  send: (id: string) => api.post<Invoice>(`/invoices/${id}/send`),
  recordPayment: (id: string, data: RecordPaymentInput) =>
    api.post<Payment>(`/invoices/${id}/payments`, data),
  void: (id: string, reason: string) => api.post<Invoice>(`/invoices/${id}/void`, { reason }),
};

// Crews API
export const crewsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Crew>>('/crews', { params }),
  getById: (id: string) => api.get<Crew>(`/crews/${id}`),
  create: (data: CreateCrewInput) => api.post<Crew>('/crews', data),
  update: (id: string, data: UpdateCrewInput) => api.patch<Crew>(`/crews/${id}`, data),
  getMembers: () => api.get<CrewMember[]>('/crew-members'),
  getMemberById: (id: string) => api.get<CrewMember>(`/crew-members/${id}`),
};

// Routes API
export const routesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Route>>('/routes', { params }),
  getById: (id: string) => api.get<Route>(`/routes/${id}`),
  getByDate: (date: string, crewId?: string) =>
    api.get<Route[]>('/routes/by-date', { params: { date, crewId } }),
  create: (data: CreateRouteInput) => api.post<Route>('/routes', data),
  optimize: (id: string) => api.post<Route>(`/routes/${id}/optimize`),
  startRoute: (id: string) => api.post<Route>(`/routes/${id}/start`),
  completeRoute: (id: string) => api.post<Route>(`/routes/${id}/complete`),
};

// Services/Price Book API
export const priceBookApi = {
  getServices: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Service>>('/services', { params }),
  getServiceById: (id: string) => api.get<Service>(`/services/${id}`),
  calculatePrice: (data: PriceCalculationInput) =>
    api.post<PriceCalculationResult>('/services/calculate-price', data),
  getDiscounts: () => api.get<Discount[]>('/discounts'),
};

// Leads API
export const leadsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Lead>>('/leads', { params }),
  getById: (id: string) => api.get<Lead>(`/leads/${id}`),
  create: (data: CreateLeadInput) => api.post<Lead>('/leads', data),
  update: (id: string, data: UpdateLeadInput) => api.patch<Lead>(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  transition: (id: string, data: LeadTransitionInput) =>
    api.post<Lead>(`/leads/${id}/transition`, data),
  getActivities: (id: string, params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Activity>>(`/leads/${id}/activities`, { params }),
  addActivity: (id: string, data: CreateActivityInput) =>
    api.post<Activity>(`/leads/${id}/activities`, data),
  getStageHistory: (id: string) =>
    api.get<LeadStageHistory[]>(`/leads/${id}/stage-history`),
  getPipelineStats: (params?: Record<string, unknown>) =>
    api.get<PipelineStatsResult>('/leads/pipeline-stats', { params }),
  convert: (id: string, data: ConvertLeadInput) =>
    api.post<{ account: Account; job?: Job }>(`/leads/${id}/convert`, data),
};

// Commissions API
export const commissionsApi = {
  // Commission Rules
  getRules: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<CommissionRule>>('/commissions/rules', { params }),
  getRuleById: (id: string) => api.get<CommissionRule>(`/commissions/rules/${id}`),
  createRule: (data: CreateCommissionRuleInput) =>
    api.post<CommissionRule>('/commissions/rules', data),
  updateRule: (id: string, data: UpdateCommissionRuleInput) =>
    api.patch<CommissionRule>(`/commissions/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/commissions/rules/${id}`),

  // Bonus Rules
  getBonusRules: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<BonusRule>>('/commissions/bonus-rules', { params }),
  getBonusRuleById: (id: string) => api.get<BonusRule>(`/commissions/bonus-rules/${id}`),
  createBonusRule: (data: CreateBonusRuleInput) =>
    api.post<BonusRule>('/commissions/bonus-rules', data),
  updateBonusRule: (id: string, data: UpdateBonusRuleInput) =>
    api.patch<BonusRule>(`/commissions/bonus-rules/${id}`, data),
  deleteBonusRule: (id: string) => api.delete(`/commissions/bonus-rules/${id}`),

  // Commission Records
  getRecords: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<CommissionRecord>>('/commissions/records', { params }),
  getRecordById: (id: string) => api.get<CommissionRecord>(`/commissions/records/${id}`),
  approveRecord: (id: string, notes?: string) =>
    api.post<CommissionRecord>(`/commissions/records/${id}/approve`, { notes }),
  rejectRecord: (id: string, notes?: string) =>
    api.post<CommissionRecord>(`/commissions/records/${id}/reject`, { notes }),

  // Bonus Records
  getBonusRecords: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<BonusRecord>>('/commissions/bonus-records', { params }),

  // Job Expenses
  getJobExpenses: (jobId: string) =>
    api.get<JobExpense[]>(`/commissions/jobs/${jobId}/expenses`),
  addJobExpense: (jobId: string, data: CreateJobExpenseInput) =>
    api.post<JobExpense>(`/commissions/jobs/${jobId}/expenses`, data),
  deleteJobExpense: (jobId: string, expenseId: string) =>
    api.delete(`/commissions/jobs/${jobId}/expenses/${expenseId}`),

  // Reports
  getReport: (params: CommissionReportParams) =>
    api.get<CommissionReport>('/commissions/reports', { params }),
  getPayPeriodSummary: (params: { userId?: string; payPeriodStart: string; payPeriodEnd: string }) =>
    api.get<PayPeriodSummary>('/commissions/reports/pay-period-summary', { params }),
};

// Automations API
export const automationsApi = {
  // Automation Rules
  getRules: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<AutomationRule>>('/automations/rules', { params }),
  getRuleById: (id: string) => api.get<AutomationRule>(`/automations/rules/${id}`),
  createRule: (data: CreateAutomationRuleInput) =>
    api.post<AutomationRule>('/automations/rules', data),
  updateRule: (id: string, data: UpdateAutomationRuleInput) =>
    api.patch<AutomationRule>(`/automations/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/automations/rules/${id}`),
  toggleRule: (id: string, isActive: boolean) =>
    api.patch<AutomationRule>(`/automations/rules/${id}/toggle`, { isActive }),

  // Executions
  getExecutions: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<AutomationExecution>>('/automations/executions', { params }),
  getExecutionById: (id: string) => api.get<AutomationExecution>(`/automations/executions/${id}`),

  // Follow-up Sequences
  getFollowUpSequences: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<FollowUpSequence>>('/automations/follow-up-sequences', { params }),
  getFollowUpSequenceById: (id: string) =>
    api.get<FollowUpSequence>(`/automations/follow-up-sequences/${id}`),
  createFollowUpSequence: (data: CreateFollowUpSequenceInput) =>
    api.post<FollowUpSequence>('/automations/follow-up-sequences', data),
  updateFollowUpSequence: (id: string, data: UpdateFollowUpSequenceInput) =>
    api.patch<FollowUpSequence>(`/automations/follow-up-sequences/${id}`, data),
  pauseFollowUpSequence: (id: string) =>
    api.post<FollowUpSequence>(`/automations/follow-up-sequences/${id}/pause`),
  resumeFollowUpSequence: (id: string) =>
    api.post<FollowUpSequence>(`/automations/follow-up-sequences/${id}/resume`),
  cancelFollowUpSequence: (id: string) =>
    api.post<FollowUpSequence>(`/automations/follow-up-sequences/${id}/cancel`),
};

// Types
export interface Account {
  id: string;
  name: string;
  displayName?: string;
  accountType: 'residential' | 'commercial';
  primaryEmail?: string;
  primaryPhone?: string;
  leadSource?: string;
  lifetimeValue: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  accountId: string;
  account?: Account;
  serviceAddressId: string;
  jobType: string;
  status: string;
  priority: string;
  title?: string;
  description?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  estimatedDurationMinutes?: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  accountId: string;
  account?: Account;
  status: string;
  version: number;
  totalAmount: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  accountId: string;
  account?: Account;
  status: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Crew {
  id: string;
  name: string;
  specialty: string;
  isActive: boolean;
  leadId?: string;
  lead?: CrewMember;
  members?: CrewMember[];
}

export interface CrewMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface Route {
  id: string;
  routeDate: string;
  crewId: string;
  crew?: Crew;
  status: string;
  stopCount: number;
  totalDistanceMiles?: number;
  totalDurationMinutes?: number;
}

export interface Service {
  id: string;
  name: string;
  code?: string;
  category?: string;
  pricingType: string;
  basePrice: number;
  unitOfMeasure?: string;
  isActive: boolean;
}

export interface Discount {
  id: string;
  code?: string;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  isActive: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate: string;
}

export interface Lead {
  id: string;
  source: string;
  sourceType: string;
  businessLine: string;
  pipeline: string;
  stage: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
  assignedRepId?: string;
  accountId?: string;
  propertyId?: string;
  lossReason?: string;
  lossNotes?: string;
  wonAt?: string;
  lostAt?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId?: string;
  accountId?: string;
  jobId?: string;
  type: string;
  direction?: string;
  subject?: string;
  body?: string;
  outcome?: string;
  createdBy: string;
  createdAt: string;
}

export interface LeadStageHistory {
  id: string;
  leadId: string;
  fromStage: string;
  toStage: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  roleType: string;
  businessLine: string;
  conditions: Record<string, unknown>;
  rate: number;
  base: string;
  trigger: string;
  deductibleExpenseCategories: string[];
  isActive: boolean;
  effectiveDate: string;
  endDate?: string;
  previousVersionId?: string;
}

export interface BonusRule {
  id: string;
  name: string;
  roleType: string;
  businessLine: string;
  metric: string;
  thresholdCents: number;
  bonusAmountCents: number;
  period: string;
  isActive: boolean;
}

export interface CommissionRecord {
  id: string;
  userId: string;
  jobId: string;
  ruleId: string;
  roleType: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossRevenueCents: number;
  deductionsCents: number;
  commissionBaseCents: number;
  commissionRate: number;
  commissionCents: number;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface BonusRecord {
  id: string;
  userId: string;
  ruleId: string;
  periodStart: string;
  periodEnd: string;
  metricValueCents: number;
  thresholdCents: number;
  bonusAmountCents: number;
  status: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  isActive: boolean;
  trigger: {
    event: string;
    conditions: Record<string, unknown>;
  };
  actions: AutomationAction[];
  constraints?: Record<string, unknown>;
  executionLog?: AutomationExecution[];
  testMode: boolean;
  description?: string;
}

export interface AutomationAction {
  type: string;
  config: Record<string, unknown>;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  entityType: string;
  entityId: string;
  triggerEvent: string;
  conditionsPassed: boolean;
  actionsTaken: { type: string; result: string }[];
  suppressionReason?: string;
  isTestMode: boolean;
  executedAt: string;
}

export interface FollowUpSequence {
  id: string;
  leadId: string;
  status: string;
  currentStep: number;
  steps: FollowUpStep[];
  nextStepAt?: string;
  startedAt: string;
  completedAt?: string;
  pausedAt?: string;
}

export interface FollowUpStep {
  stepNumber: number;
  type: string;
  delayMinutes: number;
  config: Record<string, unknown>;
  executedAt?: string;
  result?: string;
}

export interface JobExpense {
  id: string;
  jobId: string;
  category: string;
  description?: string;
  amountCents: number;
  createdAt: string;
}

export interface PipelineStatsResult {
  stages: { stage: string; count: number; valueCents: number }[];
  conversionRate: number;
  averageDaysInPipeline: number;
}

export interface CommissionReport {
  records: CommissionRecord[];
  totalCommissionCents: number;
  totalBonusCents: number;
  totalPayoutCents: number;
}

export interface PayPeriodSummary {
  userId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  commissionRecords: CommissionRecord[];
  bonusRecords: BonusRecord[];
  totalCommissionCents: number;
  totalBonusCents: number;
  totalPayoutCents: number;
}

// Input types
export interface CreateAccountInput {
  name: string;
  accountType: 'residential' | 'commercial';
  primaryEmail?: string;
  primaryPhone?: string;
  leadSource?: string;
}

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  isActive?: boolean;
}

export interface CreateJobInput {
  accountId: string;
  serviceAddressId: string;
  jobType: string;
  title?: string;
  description?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  estimatedDurationMinutes?: number;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export interface JobTransitionInput {
  action: string;
  scheduledDate?: string;
  invoiceId?: string;
  reason?: string;
}

export interface CreateEstimateInput {
  accountId: string;
  serviceAddressId: string;
  title?: string;
  lineItems?: EstimateLineItemInput[];
}

export interface UpdateEstimateInput extends Partial<CreateEstimateInput> {}

export interface EstimateLineItemInput {
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface ApprovalSignatureInput {
  signerName: string;
  signerEmail: string;
  signatureData: string;
}

export interface CreateInvoiceInput {
  accountId: string;
  jobId?: string;
  lineItems?: InvoiceLineItemInput[];
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {}

export interface InvoiceLineItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface RecordPaymentInput {
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  notes?: string;
}

export interface CreateCrewInput {
  name: string;
  specialty: string;
  leadId?: string;
}

export interface UpdateCrewInput extends Partial<CreateCrewInput> {
  isActive?: boolean;
}

export interface CreateRouteInput {
  routeDate: string;
  crewId: string;
  jobIds: string[];
}

export interface PriceCalculationInput {
  serviceId: string;
  quantity: number;
  accountType?: string;
  modifiers?: Record<string, unknown>;
}

export interface PriceCalculationResult {
  basePrice: number;
  adjustments: { name: string; amount: number }[];
  totalPrice: number;
}

// Lead Input Types
export interface CreateLeadInput {
  source: string;
  sourceType: string;
  businessLine: string;
  pipeline?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  companyName?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zip?: string;
  assignedRepId?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {}

export interface LeadTransitionInput {
  stage: string;
  reason?: string;
  lossReason?: string;
  lossNotes?: string;
}

export interface CreateActivityInput {
  type: string;
  direction?: string;
  subject?: string;
  body?: string;
  outcome?: string;
}

export interface ConvertLeadInput {
  createJob?: boolean;
  jobType?: string;
  serviceAddressId?: string;
  notes?: string;
}

// Commission Input Types
export interface CreateCommissionRuleInput {
  name: string;
  roleType: string;
  businessLine: string;
  conditions: Record<string, unknown>;
  rate: number;
  base: string;
  trigger: string;
  deductibleExpenseCategories?: string[];
  effectiveDate: string;
  endDate?: string;
}

export interface UpdateCommissionRuleInput extends Partial<CreateCommissionRuleInput> {
  isActive?: boolean;
}

export interface CreateBonusRuleInput {
  name: string;
  roleType: string;
  businessLine: string;
  metric: string;
  thresholdCents: number;
  bonusAmountCents: number;
  period: string;
}

export interface UpdateBonusRuleInput extends Partial<CreateBonusRuleInput> {
  isActive?: boolean;
}

export interface CreateJobExpenseInput {
  category: string;
  description?: string;
  amountCents: number;
}

export interface CommissionReportParams {
  userId?: string;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  roleType?: string;
  businessLine?: string;
  status?: string;
}

// Automation Input Types
export interface CreateAutomationRuleInput {
  name: string;
  trigger: {
    event: string;
    conditions: Record<string, unknown>;
  };
  actions: AutomationAction[];
  constraints?: Record<string, unknown>;
  testMode?: boolean;
  description?: string;
}

export interface UpdateAutomationRuleInput extends Partial<CreateAutomationRuleInput> {}

export interface CreateFollowUpSequenceInput {
  leadId: string;
  steps: {
    stepNumber: number;
    type: string;
    delayMinutes: number;
    config: Record<string, unknown>;
  }[];
}

export interface UpdateFollowUpSequenceInput {
  steps?: {
    stepNumber: number;
    type: string;
    delayMinutes: number;
    config: Record<string, unknown>;
  }[];
  currentStep?: number;
  nextStepAt?: string;
}

export default api;
