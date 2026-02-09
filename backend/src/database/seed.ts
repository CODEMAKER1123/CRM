/**
 * Seed script for Rolling Suds + Penn Holiday Lights CRM
 * Per spec Appendix B: 1 org, 5 territories, 3 crews, 6 users, 50+ customers, etc.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/database/seed.ts
 *
 * Or add to package.json scripts:
 *   "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts"
 */

import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const tenantId = uuid();
const now = new Date();

function randomDate(daysBack: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cents(dollars: number): number {
  return Math.round(dollars * 100);
}

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------
const userIds = {
  owner: uuid(),
  opsManager: uuid(),
  salesRep1: uuid(),
  salesRep2: uuid(),
  crewLead1: uuid(),
  crewLead2: uuid(),
  crewLead3: uuid(),
  crewMember1: uuid(),
  crewMember2: uuid(),
  crewMember3: uuid(),
};

const crewIds = {
  alpha: uuid(),
  beta: uuid(),
  gamma: uuid(),
};

const territoryIds = Array.from({ length: 5 }, () => uuid());

// ---------------------------------------------------------------------------
// Data arrays
// ---------------------------------------------------------------------------
const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'Robert', 'Lisa', 'David', 'Jennifer', 'James', 'Amanda',
  'Chris', 'Rebecca', 'Brian', 'Maria', 'Kevin', 'Ashley', 'Daniel', 'Nicole', 'Matthew', 'Stephanie',
  'Andrew', 'Laura', 'Joshua', 'Karen', 'Ryan', 'Melissa', 'Brandon', 'Michelle', 'Tyler', 'Heather',
  'Jason', 'Kimberly', 'Justin', 'Donna', 'Mark', 'Sandra', 'Patrick', 'Susan', 'Sean', 'Carol',
  'Eric', 'Angela', 'Adam', 'Dorothy', 'Timothy', 'Helen', 'Jeremy', 'Samantha', 'Joseph', 'Catherine'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Birch Way', 'Walnut Ct',
  'Cherry Blvd', 'Spruce Pl', 'Willow Rd', 'Ash Ln', 'Poplar Ave', 'Hickory St', 'Chestnut Dr'];

const cities = ['Springfield', 'Riverside', 'Lakeview', 'Oakdale', 'Fairview',
  'Georgetown', 'Madison', 'Franklin', 'Clinton', 'Arlington'];

const states = ['PA', 'NJ', 'DE'];
const zips = ['19001', '19002', '19003', '19004', '19005', '08001', '08002', '08003', '19801', '19802'];

const leadSources = ['google_lsa', 'facebook', 'website', 'referral', 'door_hanger', 'google_ads',
  'nextdoor', 'thumbtack', 'yelp', 'yard_sign', 'phone_call', 'repeat_customer'];

const jobTypes = ['house_wash', 'roof_wash', 'concrete_cleaning', 'gutter_cleaning',
  'window_cleaning', 'building_wash', 'dumpster_pad', 'surface_sealing',
  'christmas_lights_install', 'christmas_lights_removal'];

const residentialStages = ['new', 'contacted', 'estimate_sent', 'follow_up', 'won', 'lost'];
const commercialStages = ['new', 'contacted', 'site_visit_scheduled', 'proposal_sent', 'follow_up', 'won', 'lost'];

// ---------------------------------------------------------------------------
// Build seed SQL
// ---------------------------------------------------------------------------
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'crm',
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  const qr = dataSource.createQueryRunner();

  console.log('Seeding database...');

  try {
    await qr.startTransaction();

    // 1. Tenant
    await qr.query(
      `INSERT INTO tenants (id, name, slug, plan, settings, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [tenantId, 'Rolling Suds + Penn Holiday Lights', 'rolling-suds', 'enterprise', JSON.stringify({
        businessLines: ['power_wash', 'holiday_lights'],
        defaultPipeline: 'residential',
        defaultBusinessLine: 'power_wash',
        speedToLeadTargetMinutes: 15,
        depositRequired: true,
        defaultDepositPercent: 50,
      })],
    );

    // 2. Users (inserted into the users table as basic records)
    const users = [
      { id: userIds.owner, email: 'owner@rollingsuds.com', first: 'Tony', last: 'Martino', role: 'owner' },
      { id: userIds.opsManager, email: 'ops@rollingsuds.com', first: 'Maria', last: 'Chen', role: 'ops_manager' },
      { id: userIds.salesRep1, email: 'sales1@rollingsuds.com', first: 'Jake', last: 'Thompson', role: 'sales_rep' },
      { id: userIds.salesRep2, email: 'sales2@rollingsuds.com', first: 'Olivia', last: 'Davis', role: 'sales_rep' },
      { id: userIds.crewLead1, email: 'crew1@rollingsuds.com', first: 'Carlos', last: 'Rivera', role: 'crew_lead' },
      { id: userIds.crewLead2, email: 'crew2@rollingsuds.com', first: 'Derek', last: 'Watson', role: 'crew_lead' },
      { id: userIds.crewLead3, email: 'crew3@rollingsuds.com', first: 'Raj', last: 'Patel', role: 'crew_lead' },
      { id: userIds.crewMember1, email: 'member1@rollingsuds.com', first: 'Miguel', last: 'Santos', role: 'crew_member' },
      { id: userIds.crewMember2, email: 'member2@rollingsuds.com', first: 'Kyle', last: 'Brooks', role: 'crew_member' },
      { id: userIds.crewMember3, email: 'member3@rollingsuds.com', first: 'Tyler', last: 'Green', role: 'crew_member' },
    ];

    for (const u of users) {
      await qr.query(
        `INSERT INTO users (id, tenant_id, email, first_name, last_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [u.id, tenantId, u.email, u.first, u.last, u.role],
      );
    }

    // 3. Service territories
    for (let i = 0; i < 5; i++) {
      await qr.query(
        `INSERT INTO service_territories (id, tenant_id, name, zip_codes, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [territoryIds[i], tenantId, `Territory ${i + 1}`, JSON.stringify(zips.slice(i * 2, i * 2 + 2))],
      );
    }

    // 4. Crews
    const crewData = [
      { id: crewIds.alpha, name: 'Team Alpha', specialty: 'power_washing', leadId: userIds.crewLead1 },
      { id: crewIds.beta, name: 'Team Beta', specialty: 'power_washing', leadId: userIds.crewLead2 },
      { id: crewIds.gamma, name: 'Team Gamma', specialty: 'christmas_lights', leadId: userIds.crewLead3 },
    ];

    for (const c of crewData) {
      await qr.query(
        `INSERT INTO crews (id, tenant_id, name, specialty, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, true, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [c.id, tenantId, c.name, c.specialty],
      );
    }

    // 5. Accounts (50 customers)
    const accountIds: string[] = [];
    for (let i = 0; i < 50; i++) {
      const id = uuid();
      accountIds.push(id);
      const fn = firstNames[i];
      const ln = lastNames[i];
      const acctType = i < 40 ? 'residential' : 'commercial';
      const lifecycle = pick(['active', 'recurring', 'lead', 'qualified', 'at_risk']);

      await qr.query(
        `INSERT INTO accounts (id, tenant_id, name, display_name, account_type, primary_email, primary_phone,
         lead_source, lifecycle_stage, is_active, lifetime_value, outstanding_balance, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, tenantId,
          `${fn} ${ln}`,
          acctType === 'commercial' ? `${fn} ${ln} LLC` : `${fn} ${ln}`,
          acctType,
          `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
          `555-${String(1000 + i).padStart(4, '0')}`,
          pick(leadSources),
          lifecycle,
          Math.floor(Math.random() * 50000),
          Math.floor(Math.random() * 5000),
          randomDate(365),
        ],
      );
    }

    // 6. Leads (30 active leads in various stages)
    const leadIds: string[] = [];
    for (let i = 0; i < 30; i++) {
      const id = uuid();
      leadIds.push(id);
      const isCommercial = i % 5 === 0;
      const pipeline = isCommercial ? 'commercial' : 'residential';
      const stages = isCommercial ? commercialStages : residentialStages;
      const stage = pick(stages);
      const fn = pick(firstNames);
      const ln = pick(lastNames);

      await qr.query(
        `INSERT INTO leads (id, tenant_id, source, source_type, business_line, pipeline, stage,
         contact_name, contact_email, contact_phone, address_line_1, city, state, zip,
         assigned_rep_id, territory_id,
         created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, tenantId,
          pick(leadSources),
          pick(['self_generated', 'company_generated']),
          isCommercial ? 'power_wash' : pick(['power_wash', 'holiday_lights']),
          pipeline, stage,
          `${fn} ${ln}`,
          `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
          `555-${String(2000 + i).padStart(4, '0')}`,
          `${100 + Math.floor(Math.random() * 900)} ${pick(streets)}`,
          pick(cities), pick(states), pick(zips),
          pick([userIds.salesRep1, userIds.salesRep2]),
          pick(territoryIds),
          randomDate(60),
        ],
      );
    }

    // 7. Jobs (40 jobs at various statuses)
    const jobIds: string[] = [];
    const jobStatuses = ['unscheduled', 'scheduled', 'in_progress', 'complete', 'complete', 'complete'];

    for (let i = 0; i < 40; i++) {
      const id = uuid();
      jobIds.push(id);
      const acctId = pick(accountIds);
      const status = pick(jobStatuses);
      const jt = pick(jobTypes);
      const priceDollars = 200 + Math.floor(Math.random() * 3000);

      await qr.query(
        `INSERT INTO jobs (id, tenant_id, job_number, account_id, job_type, status, priority,
         title, total_amount, total_price_cents, business_line,
         scheduled_date, estimated_duration_minutes,
         created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, tenantId,
          `JOB-2026-${String(i + 1).padStart(4, '0')}`,
          acctId, jt, status,
          pick(['normal', 'high', 'urgent']),
          `${jt.replace(/_/g, ' ')} service`,
          priceDollars,
          cents(priceDollars),
          jt.includes('christmas') ? 'holiday_lights' : 'power_wash',
          randomDate(30),
          60 + Math.floor(Math.random() * 180),
          randomDate(90),
        ],
      );
    }

    // 8. Estimates (25 estimates)
    for (let i = 0; i < 25; i++) {
      const id = uuid();
      const acctId = pick(accountIds);
      const status = pick(['draft', 'sent', 'viewed', 'approved', 'approved', 'declined', 'expired']);
      const totalDollars = 300 + Math.floor(Math.random() * 5000);

      await qr.query(
        `INSERT INTO estimates (id, tenant_id, estimate_number, account_id, status, version,
         total_amount, subtotal_cents, total_cents, business_line,
         created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $7, $8, $9, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, tenantId,
          `EST-2026-${String(i + 1).padStart(4, '0')}`,
          acctId, status,
          totalDollars,
          cents(totalDollars),
          pick(['power_wash', 'holiday_lights']),
          randomDate(45),
        ],
      );
    }

    // 9. Invoices (20 invoices)
    for (let i = 0; i < 20; i++) {
      const id = uuid();
      const acctId = pick(accountIds);
      const jobId = pick(jobIds);
      const status = pick(['sent', 'viewed', 'partial', 'paid', 'paid', 'paid', 'overdue']);
      const totalDollars = 200 + Math.floor(Math.random() * 4000);
      const paidDollars = status === 'paid' ? totalDollars : Math.floor(totalDollars * Math.random());

      await qr.query(
        `INSERT INTO invoices (id, tenant_id, invoice_number, account_id, job_id, status,
         total_amount, amount_paid, balance_due,
         total_cents, amount_paid_cents, balance_due_cents,
         due_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, tenantId,
          `INV-2026-${String(i + 1).padStart(4, '0')}`,
          acctId, jobId, status,
          totalDollars, paidDollars, totalDollars - paidDollars,
          cents(totalDollars), cents(paidDollars), cents(totalDollars - paidDollars),
          randomDate(-30), // future due date
          randomDate(60),
        ],
      );
    }

    // 10. Commission rules
    const crewRuleId = uuid();
    const salesRuleId = uuid();

    await qr.query(
      `INSERT INTO commission_rules (id, tenant_id, name, role_type, rate, base, trigger, is_active, effective_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [crewRuleId, tenantId, 'Crew 12% on Gross Revenue', 'crew', 0.12, 'gross_revenue', 'on_job_complete'],
    );

    await qr.query(
      `INSERT INTO commission_rules (id, tenant_id, name, role_type, rate, base, trigger, is_active, effective_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [salesRuleId, tenantId, 'Sales Rep 10% on Gross', 'sales_rep', 0.10, 'gross_revenue', 'on_invoice_paid'],
    );

    // 11. Bonus rules
    await qr.query(
      `INSERT INTO bonus_rules (id, tenant_id, name, role_type, metric, threshold_cents, bonus_amount_cents, period, is_active, effective_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [uuid(), tenantId, 'Monthly Revenue Bonus $500', 'sales_rep', 'monthly_revenue', cents(10000), cents(500), 'monthly'],
    );

    // 12. Automation rules
    await qr.query(
      `INSERT INTO automation_rules (id, tenant_id, name, is_active, trigger, actions, constraints, test_mode, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, $5, $6, false, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        uuid(), tenantId,
        'Follow-up SMS after 48h no response',
        JSON.stringify({ event: 'lead.no_response', conditions: [{ field: 'hours_since_contact', op: 'gt', value: 48 }] }),
        JSON.stringify([{ type: 'send_sms', config: { template: 'follow_up_48h' }, delay_minutes: 0 }]),
        JSON.stringify({ cooldown_minutes: 1440, quiet_hours_start: '20:00', quiet_hours_end: '08:00', business_days_only: true }),
      ],
    );

    await qr.query(
      `INSERT INTO automation_rules (id, tenant_id, name, is_active, trigger, actions, constraints, test_mode, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, $5, $6, false, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        uuid(), tenantId,
        'Welcome email on new lead',
        JSON.stringify({ event: 'lead.created', conditions: [] }),
        JSON.stringify([{ type: 'send_email', config: { template: 'welcome_lead' }, delay_minutes: 0 }]),
        JSON.stringify({ max_fires_per_entity: 1 }),
      ],
    );

    await qr.query(
      `INSERT INTO automation_rules (id, tenant_id, name, is_active, trigger, actions, constraints, test_mode, created_at, updated_at)
       VALUES ($1, $2, $3, true, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        uuid(), tenantId,
        'Manager alert on high-value lead (TEST)',
        JSON.stringify({ event: 'lead.created', conditions: [{ field: 'pipeline', op: 'eq', value: 'commercial' }] }),
        JSON.stringify([{ type: 'notify', config: { channel: 'slack', message: 'New commercial lead!' }, delay_minutes: 0 }]),
        JSON.stringify({}),
      ],
    );

    // 13. Activities (for some leads)
    const activityTypes = ['call', 'text', 'email', 'note', 'site_visit'];
    for (let i = 0; i < 50; i++) {
      await qr.query(
        `INSERT INTO activities (id, tenant_id, lead_id, type, direction, subject, body, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          uuid(), tenantId,
          pick(leadIds),
          pick(activityTypes),
          pick(['inbound', 'outbound']),
          pick(['Initial contact', 'Follow-up call', 'Quote discussion', 'Schedule confirmation', 'Pricing inquiry']),
          'Activity details logged here.',
          pick([userIds.salesRep1, userIds.salesRep2, userIds.opsManager]),
          randomDate(30),
        ],
      );
    }

    await qr.commitTransaction();
    console.log('Seed complete!');
    console.log(`  Tenant ID: ${tenantId}`);
    console.log(`  Users: ${users.length}`);
    console.log(`  Accounts: ${accountIds.length}`);
    console.log(`  Leads: ${leadIds.length}`);
    console.log(`  Jobs: ${jobIds.length}`);
    console.log(`  Estimates: 25`);
    console.log(`  Invoices: 20`);
    console.log(`  Commission Rules: 2`);
    console.log(`  Bonus Rules: 1`);
    console.log(`  Automation Rules: 3`);
    console.log(`  Activities: 50`);
  } catch (err) {
    await qr.rollbackTransaction();
    console.error('Seed failed:', err);
    throw err;
  } finally {
    await qr.release();
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
