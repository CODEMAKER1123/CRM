// Customer / Account Types
export enum AccountType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  PROPERTY_MGMT = 'property_mgmt',
  HOA = 'hoa',
  GOVERNMENT = 'government',
  FLEET = 'fleet',
}

// Customer Lifecycle Stage
export enum LifecycleStage {
  LEAD = 'lead',
  QUALIFIED = 'qualified',
  QUOTED = 'quoted',
  WON = 'won',
  ACTIVE = 'active',
  RECURRING = 'recurring',
  AT_RISK = 'at_risk',
  LOST = 'lost',
}

// Business Line
export enum BusinessLine {
  POWER_WASH = 'power_wash',
  HOLIDAY_LIGHTS = 'holiday_lights',
}

// Pipeline Type
export enum PipelineType {
  COMMERCIAL = 'commercial',
  RESIDENTIAL = 'residential',
  HOLIDAY_LIGHTS = 'holiday_lights',
}

// Lead Source Type (for commission calculations)
export enum LeadSourceType {
  SELF_GENERATED = 'self_generated',
  COMPANY_GENERATED = 'company_generated',
}

// Contact Method
export enum ContactMethod {
  PHONE = 'phone',
  TEXT = 'text',
  EMAIL = 'email',
}

// Property Type
export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  MULTI_FAMILY = 'multi_family',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  MUNICIPAL = 'municipal',
}

// Job Types
export enum JobType {
  POWER_WASHING = 'power_washing',
  HOUSE_WASH = 'house_wash',
  ROOF_WASH = 'roof_wash',
  CONCRETE_CLEANING = 'concrete_cleaning',
  GUTTER_CLEANING = 'gutter_cleaning',
  WINDOW_CLEANING = 'window_cleaning',
  FLEET_WASH = 'fleet_wash',
  DUMPSTER_PAD = 'dumpster_pad',
  BUILDING_WASH = 'building_wash',
  SURFACE_SEALING = 'surface_sealing',
  CHRISTMAS_LIGHTS_INSTALL = 'christmas_lights_install',
  CHRISTMAS_LIGHTS_REMOVAL = 'christmas_lights_removal',
  OTHER = 'other',
}

// Job Status - follows state machine lifecycle
export enum JobStatus {
  UNSCHEDULED = 'unscheduled',
  SCHEDULED = 'scheduled',
  EN_ROUTE = 'en_route',
  ON_SITE = 'on_site',
  IN_PROGRESS = 'in_progress',
  COMPLETE = 'complete',
  CALLBACK = 'callback',
  CANCELLED = 'cancelled',
}

// Job Priority
export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Deposit Status
export enum DepositStatus {
  DEPOSIT_PENDING = 'deposit_pending',
  DEPOSIT_PAID = 'deposit_paid',
  PREPAID = 'prepaid',
  NOT_REQUIRED = 'not_required',
}

// Holiday Job Type
export enum HolidayJobType {
  INSTALL = 'install',
  TAKEDOWN = 'takedown',
}

// Estimate Status
export enum EstimateStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  APPROVED = 'approved',
  DECLINED = 'declined',
  SAVE_OFFERED = 'save_offered',
  SAVE_ACCEPTED = 'save_accepted',
  REJECTED = 'rejected',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
}

// Estimate Tier
export enum EstimateTier {
  GOOD = 'good',
  BETTER = 'better',
  BEST = 'best',
}

// Discount Type
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

// Save Offer Approval Status
export enum ApprovalStatus {
  AUTO_APPROVED = 'auto_approved',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  DENIED = 'denied',
}

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VOID = 'void',
}

// Invoice Type
export enum InvoiceType {
  STANDARD = 'standard',
  DEPOSIT = 'deposit',
  BALANCE = 'balance',
}

// Payment Method
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  ACH = 'ach',
  CHECK = 'check',
  CASH = 'cash',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

// Sync Status (for QuickBooks)
export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  ERROR = 'error',
  NOT_APPLICABLE = 'not_applicable',
}

// Crew Specialty
export enum CrewSpecialty {
  POWER_WASHING = 'power_washing',
  CHRISTMAS_LIGHTS = 'christmas_lights',
  GENERAL = 'general',
}

// Crew Member Role
export enum CrewMemberRole {
  LEAD = 'lead',
  MEMBER = 'member',
}

// Route Stop Status
export enum RouteStopStatus {
  PENDING = 'pending',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

// Address Type
export enum AddressType {
  SERVICE = 'service',
  BILLING = 'billing',
  BOTH = 'both',
}

// Lead Source
export enum LeadSource {
  GOOGLE_LSA = 'google_lsa',
  FACEBOOK = 'facebook',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  DOOR_HANGER = 'door_hanger',
  MANUAL = 'manual',
  GOOGLE_ADS = 'google_ads',
  INSTAGRAM = 'instagram',
  NEXTDOOR = 'nextdoor',
  THUMBTACK = 'thumbtack',
  ANGIS_LIST = 'angis_list',
  YELP = 'yelp',
  DIRECT_MAIL = 'direct_mail',
  YARD_SIGN = 'yard_sign',
  REPEAT_CUSTOMER = 'repeat_customer',
  PHONE_CALL = 'phone_call',
  OTHER = 'other',
}

// Season
export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  HOLIDAY = 'holiday',
}

// Pricing Type
export enum PricingType {
  FIXED = 'fixed',
  PER_SQFT = 'per_sqft',
  PER_LINEAR_FT = 'per_linear_ft',
  HOURLY = 'hourly',
  FORMULA = 'formula',
}

// User Role (maps to spec Section 6)
export enum UserRole {
  OWNER = 'owner',
  OPS_MANAGER = 'ops_manager',
  SALES_REP = 'sales_rep',
  OFFICE_ADMIN = 'office_admin',
  CREW_LEAD = 'crew_lead',
  CREW_MEMBER = 'crew_member',
}

// Activity Type
export enum ActivityType {
  CALL = 'call',
  TEXT = 'text',
  EMAIL = 'email',
  NOTE = 'note',
  MEETING = 'meeting',
  SITE_VISIT = 'site_visit',
}

// Activity Direction
export enum ActivityDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

// Photo Tag
export enum PhotoTag {
  BEFORE = 'before',
  DURING = 'during',
  AFTER = 'after',
}

// Time Entry Type
export enum TimeEntryType {
  SHIFT = 'shift',
  JOB = 'job',
  BREAK = 'break',
}

// Commission Role Type
export enum CommissionRoleType {
  CREW = 'crew',
  SALES_REP = 'sales_rep',
}

// Commission Base
export enum CommissionBase {
  GROSS_REVENUE = 'gross_revenue',
  NET_OF_EXPENSES = 'net_of_expenses',
  CUSTOM = 'custom',
}

// Commission Trigger
export enum CommissionTrigger {
  ON_JOB_COMPLETE = 'on_job_complete',
  ON_INVOICE_PAID = 'on_invoice_paid',
}

// Commission Status
export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
}

// Bonus Metric
export enum BonusMetric {
  MONTHLY_REVENUE = 'monthly_revenue',
  CONTRACT_SIGNED = 'contract_signed',
}

// Bonus Period
export enum BonusPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  PER_OCCURRENCE = 'per_occurrence',
}

// Marketing Campaign Type
export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  DRIP_SEQUENCE = 'drip_sequence',
}

// Marketing Campaign Status
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Automation Trigger Type
export enum AutomationTriggerType {
  EVENT = 'event',
  TIME = 'time',
  BEHAVIOR = 'behavior',
}

// Automation Action Type
export enum AutomationActionType {
  SEND_EMAIL = 'send_email',
  SEND_SMS = 'send_sms',
  WAIT = 'wait',
  CONDITION = 'condition',
  UPDATE_FIELD = 'update_field',
  CREATE_TASK = 'create_task',
  NOTIFY = 'notify',
}

// Enrollment Status
export enum EnrollmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  EXITED = 'exited',
  FAILED = 'failed',
}

// Lead Pipeline Stages
export enum CommercialPipelineStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  SITE_VISIT_SCHEDULED = 'site_visit_scheduled',
  SITE_VISIT_COMPLETED = 'site_visit_completed',
  PROPOSAL_SENT = 'proposal_sent',
  FOLLOW_UP = 'follow_up',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
}

export enum ResidentialPipelineStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  ESTIMATE_SENT = 'estimate_sent',
  FOLLOW_UP = 'follow_up',
  WON = 'won',
  LOST = 'lost',
}

export enum HolidayLightsPipelineStage {
  NEW = 'new',
  CONSULTED = 'consulted',
  DESIGN_PROPOSAL_SENT = 'design_proposal_sent',
  APPROVED = 'approved',
  INSTALL_SCHEDULED = 'install_scheduled',
  INSTALLED = 'installed',
  TAKEDOWN_SCHEDULED = 'takedown_scheduled',
  COMPLETE = 'complete',
  LOST = 'lost',
}

// Loss Reason
export enum LossReason {
  PRICE = 'price',
  TIMING = 'timing',
  COMPETITOR = 'competitor',
  NO_RESPONSE = 'no_response',
  NOT_QUALIFIED = 'not_qualified',
  OTHER = 'other',
}
