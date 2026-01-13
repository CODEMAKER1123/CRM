# Field Service CRM

A comprehensive CRM system designed for field service businesses (power washing, Christmas lights installation, gutter cleaning, etc.) with multi-tenant franchise support.

## Features

### Core Modules
- **Customer Management**: Residential and commercial accounts with full contact and address management
- **Job Management**: Complete lifecycle tracking with XState-powered state machine (Lead → Qualified → Scheduled → In Progress → Completed → Invoiced → Paid)
- **Estimate Builder**: Versioned estimates with digital signature capture and approval workflow
- **Invoice Management**: QuickBooks-synced invoicing with payment tracking
- **Crew Management**: Team assignment, skill tracking, and time entry
- **Route Optimization**: Daily route planning with geolocation support
- **Price Book**: Formula-based pricing with seasonal adjustments and discount management

### Integrations
- **QuickBooks Online**: Bi-directional sync for customers, invoices, and payments
- **CompanyCam**: Photo documentation with automatic project creation
- **Email**: Transactional (Resend/Postmark) and marketing (SendGrid) email support
- **SMS**: Telnyx integration for appointment reminders and notifications

### Marketing Automation
- Email and SMS campaign management
- Drip sequences with conditional branching
- Review request automation
- A/B testing support

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **ORM**: TypeORM
- **Queue**: BullMQ with Redis
- **State Machine**: XState v5
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Ant Design Pro
- **State Management**: Zustand + React Query
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ with PostGIS
- Redis 7+
- npm or yarn

### Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd CRM

# Start all services
docker-compose up -d

# The services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - API Docs: http://localhost:3001/api/docs
```

### Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## Project Structure

```
CRM/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── common/         # Shared utilities, decorators, guards
│   │   ├── config/         # Configuration files
│   │   └── modules/        # Feature modules
│   │       ├── accounts/   # Customer accounts
│   │       ├── auth/       # Authentication & RBAC
│   │       ├── contacts/   # Contact management
│   │       ├── addresses/  # Address & geolocation
│   │       ├── jobs/       # Job management with state machine
│   │       ├── estimates/  # Estimate builder
│   │       ├── invoices/   # Invoice management
│   │       ├── payments/   # Payment processing
│   │       ├── crews/      # Crew & time tracking
│   │       ├── routes/     # Route optimization
│   │       ├── price-book/ # Services & pricing
│   │       ├── marketing/  # Campaigns & automation
│   │       ├── integrations/
│   │       │   ├── quickbooks/
│   │       │   └── companycam/
│   │       └── webhooks/   # Webhook management
│   └── test/
│
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── dashboard/ # Main dashboard
│   │   │   ├── customers/ # Customer management
│   │   │   ├── jobs/      # Job management
│   │   │   └── ...
│   │   ├── components/    # React components
│   │   ├── lib/           # API client & utilities
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   └── public/
│
└── docker-compose.yml     # Docker orchestration
```

## API Documentation

The API documentation is available at `/api/docs` when running the backend. It provides:
- Interactive Swagger UI
- Request/Response schemas
- Authentication requirements
- Example requests

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_HOST` | PostgreSQL host | Yes |
| `DATABASE_PORT` | PostgreSQL port | Yes |
| `DATABASE_USERNAME` | Database user | Yes |
| `DATABASE_PASSWORD` | Database password | Yes |
| `DATABASE_NAME` | Database name | Yes |
| `REDIS_HOST` | Redis host | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLERK_SECRET_KEY` | Clerk authentication | Optional |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks OAuth | Optional |
| `COMPANYCAM_API_KEY` | CompanyCam API | Optional |
| `SENDGRID_API_KEY` | SendGrid marketing | Optional |
| `TELNYX_API_KEY` | Telnyx SMS | Optional |

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Optional |

## Database Schema

The database follows a multi-tenant architecture with Row-Level Security (RLS) for franchise isolation. Key entities:

- **tenants**: Franchise/company configuration
- **accounts**: Customer accounts (residential/commercial)
- **contacts**: Contact persons per account
- **addresses**: Service and billing addresses with geolocation
- **jobs**: Work orders with full lifecycle tracking
- **estimates**: Versioned quotes with approval workflow
- **invoices**: Billing with QuickBooks sync
- **payments**: Payment records and allocations
- **crews/crew_members**: Team management
- **routes/route_stops**: Daily scheduling
- **services/pricing_rules**: Dynamic pricing configuration

## Job State Machine

Jobs follow a defined lifecycle managed by XState:

```
Lead → Qualified → Estimate Sent → Estimate Approved → Scheduled → Dispatched → In Progress → Completed → Invoiced → Paid
                         ↓
                      [Lost]
```

Available transitions are calculated dynamically based on current state and business rules.

## Deployment

### Railway

The application is optimized for Railway deployment:

1. Create a new project in Railway
2. Add PostgreSQL and Redis services
3. Deploy backend from the `backend/` directory
4. Deploy frontend from the `frontend/` directory
5. Configure environment variables
6. Railway will automatically detect and build using Nixpacks

### Environment-Specific Configuration

- **Development**: Uses local PostgreSQL and Redis
- **Production**: Uses connection strings from Railway environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details
