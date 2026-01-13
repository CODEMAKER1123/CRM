// Account Types
export enum AccountType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
}

// Job Types
export enum JobType {
  POWER_WASHING = 'power_washing',
  CHRISTMAS_LIGHTS_INSTALL = 'christmas_lights_install',
  CHRISTMAS_LIGHTS_REMOVAL = 'christmas_lights_removal',
  GUTTER_CLEANING = 'gutter_cleaning',
  WINDOW_CLEANING = 'window_cleaning',
  ROOF_CLEANING = 'roof_cleaning',
  OTHER = 'other',
}

// Job Status - follows state machine lifecycle
export enum JobStatus {
  LEAD = 'lead',
  QUALIFIED = 'qualified',
  ESTIMATE_SENT = 'estimate_sent',
  ESTIMATE_APPROVED = 'estimate_approved',
  SCHEDULED = 'scheduled',
  DISPATCHED = 'dispatched',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INVOICED = 'invoiced',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  LOST = 'lost',
}

// Job Priority
export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Estimate Status
export enum EstimateStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
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
  WRITTEN_OFF = 'written_off',
}

// Payment Method
export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ACH = 'ach',
  STRIPE = 'stripe',
  QUICKBOOKS_PAYMENT = 'quickbooks_payment',
  OTHER = 'other',
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
  ASSISTANT = 'assistant',
  TRAINEE = 'trainee',
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
  WEBSITE = 'website',
  REFERRAL = 'referral',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  NEXTDOOR = 'nextdoor',
  THUMBTACK = 'thumbtack',
  HOMEADVISOR = 'homeadvisor',
  ANGIS_LIST = 'angis_list',
  YELP = 'yelp',
  DIRECT_MAIL = 'direct_mail',
  DOOR_HANGER = 'door_hanger',
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

// User Role
export enum UserRole {
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
  OFFICE_DISPATCH = 'office_dispatch',
  FIELD_CREW = 'field_crew',
  FRANCHISE_LEADERSHIP = 'franchise_leadership',
  CUSTOMER = 'customer',
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
