# AGENTIC AI SYSTEM INSTRUCTION: PROJECT VELMONT RESTO

## 1. Project Metadata & Tech Stack

### Project Metadata

| Field | Value |
|---|---|
| Project Name | Velmont Resto Internal Management System |
| Target Outlets | Velmont Lakehouse & Velmont Seaside |
| Developer | TEPE ZHAVAREZ [FSNK] |
| Objective | Build a unified web platform integrating HR, inventory, finance, payroll, and event bookings. |

### Tech Stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL |
| ORM | Prisma |
| Backend Framework | Express.js + Node.js |
| Backend Language | TypeScript |
| Authentication | JWT-based authentication |
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Password Hashing | bcrypt |
| API Style | REST API |

---

## 2. System Architecture & Folder Structure

Use a monorepo structure to organize the frontend and backend clearly.

```text
/apps
  /frontend
    /src
      /pages
      /components
      /routes
      /lib
      /types
      /hooks
      /services
      /layouts

  /backend
    /src
      /routes
      /controllers
      /middleware
      /services
      /utils
      /types
      /prisma
        schema.prisma
        seed.ts

README.md
.env.example
package.json
```

### Development Command Requirement

The root project should support:

```bash
npm run dev
```

This command should run both frontend and backend during development.

---

## 3. Role-Based Access Control (RBAC)

### Role & Salary Matrix

| Level | Role Name | Basic Salary (IDR) | Notes |
|---:|---|---:|---|
| 0 | Intern | 0 | Fixed salary, not incomplete |
| 1 | Chef | 500,000 | Base role |
| 2 | Senior Chef | 750,000 | Base role |
| 3 | Staff | NULL | No seed data for V1 |
| 4 | SVP | 1,000,000 | Supervisor-level access |
| 5 | Manajer | 1,200,000 | Management access |
| 6 | CEO | NULL | Full admin access |

### Data Disambiguation Rules

- Role Level 4 official internal name is `SVP`.
- `SVP` represents Supervisor-level access.
- Role Level 3 `Staff` has no seed data in V1. Return empty arrays or null where relevant.
- `Jessica` appears twice in seed data. Treat them as two separate user entities:
  - Jessica as SVP
  - Jessica as Senior Chef
- `Sylas Veyron` and `Silas Veyron` are distinct users.
- Do not invent new roles outside the Level 0-6 hierarchy.

### Permission Matrix

| Module | Level 0-3 | Level 4 / SVP | Level 5 / Manajer | Level 6 / CEO |
|---|---|---|---|---|
| Attendance - Own Records | CRUD own | CRUD own | CRUD own | CRUD own |
| Attendance - All Records | No | No | Read | Read |
| Warlok Inventory | Read/Write | Read/Write | Read/Write | Read/Write |
| Supplier Inventory | No | Read/Write | Read/Write | Read/Write |
| Finance | No | No | CRUD | CRUD |
| Booking Forms | No | CRUD | CRUD | CRUD |
| Payroll | No | No | Read | Read |
| Admin Users | No | No | No | CRUD |

### RBAC Implementation Rules

- Enforce RBAC in backend middleware.
- Enforce frontend route guards based on authenticated user role.
- Frontend guards are only UX helpers. Backend authorization is the source of truth.
- Do not trust `roleLevel` from client-side payloads.
- Every protected API route must validate the JWT token first.
- Every role-restricted route must validate the authenticated user’s `roleLevel`.

---

## 4. Database Schema Requirements

### Required Prisma Enums

```prisma
enum OutletName {
  Lakehouse
  Seaside
}

enum InventorySource {
  Warlok
  Supplier
}

enum InventoryMovementType {
  IN
  OUT
}

enum FinanceRecordType {
  CAPITAL
  INCOME
  EXPENSE
}
```

### Users Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| fullName | String | Required |
| username | String | Unique, required |
| passwordHash | String | Required, never exposed in API responses |
| outletName | Enum | `Lakehouse` or `Seaside` |
| roleLevel | Integer | Required, 0-6 |
| roleName | String | Required |
| salary | Integer | Nullable |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

### Attendance Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| userId | UUID | Foreign Key to Users |
| clockInAt | DateTime | Required |
| clockOutAt | DateTime | Nullable |
| autoClockedOut | Boolean | Default false |
| manualAdjustmentHours | Decimal | Nullable |
| notes | Text | Nullable |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

### Inventory Items Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| source | Enum | `Warlok` or `Supplier` |
| itemName | String | Required |
| quantity | Integer | Default 0, cannot be negative |
| isActive | Boolean | Default true |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

### Inventory Movements Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| itemId | UUID | Foreign Key to Inventory Items |
| userId | UUID | Foreign Key to Users |
| movementType | Enum | `IN` or `OUT` |
| quantityChange | Integer | Must be greater than 0 |
| timestamp | DateTime | Default now |
| notes | Text | Nullable |

### Finance Records Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| type | Enum | `CAPITAL`, `INCOME`, or `EXPENSE` |
| amount | Integer | Must be greater than 0 |
| description | Text | Required |
| recordedByUserId | UUID | Foreign Key to Users |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

### Catering Bookings Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| fullName | String | Required |
| job | String | Required |
| cid | String | Required |
| phone | String | Required |
| bookingDate | DateTime | Cannot be in the past |
| packageCount | Integer | Minimum 10 |
| createdByUserId | UUID | Foreign Key to Users |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

### Venue Bookings Table

| Field | Type | Rule |
|---|---|---|
| id | UUID | Primary Key |
| fullName | String | Required |
| job | String | Required |
| cid | String | Required |
| phone | String | Required |
| bookingDate | DateTime | Cannot be in the past |
| createdByUserId | UUID | Foreign Key to Users |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Auto-update |

---

## 5. Database Seeding

### Seed Login Rules

- Generate username from lowercase `fullName`.
- Replace spaces with dots.
- Preserve unique usernames by appending a suffix if needed.
- Example:
  - `Moza Leonardo` -> `moza.leonardo`
  - `Nathan Algren Murphylaw` -> `nathan.algren.murphylaw`
- All seeded users use this temporary password:

```text
Velmont123!
```

- Passwords must be hashed using bcrypt during seed.
- Login must verify hashed passwords using bcrypt.
- Never store or return plaintext passwords.

### Velmont Lakehouse User Seed

All users below belong to `Velmont Lakehouse`.

#### CEO - Level 6

| Full Name | Role | Level | Salary |
|---|---|---:|---:|
| Moza Leonardo | CEO | 6 | NULL |
| Leticia Alaric | CEO | 6 | NULL |

#### Manajer - Level 5

| Full Name | Role | Level | Salary |
|---|---|---:|---:|
| Valerie Swan | Manajer | 5 | 1,200,000 |
| Jizel Marvane | Manajer | 5 | 1,200,000 |
| Anthony Giorgio | Manajer | 5 | 1,200,000 |
| Sylas Veyron | Manajer | 5 | 1,200,000 |

#### SVP - Level 4

| Full Name | Role | Level | Salary |
|---|---|---:|---:|
| Kael Percival | SVP | 4 | 1,000,000 |
| Stefan Morgan | SVP | 4 | 1,000,000 |
| Nathan Algren Murphylaw | SVP | 4 | 1,000,000 |
| Jessica | SVP | 4 | 1,000,000 |

#### Senior Chef - Level 2

| Full Name | Role | Level | Salary |
|---|---|---:|---:|
| Sloane Alvis | Senior Chef | 2 | 750,000 |
| Silas Veyron | Senior Chef | 2 | 750,000 |
| Finicty Yanhuang | Senior Chef | 2 | 750,000 |
| Noah Armenter | Senior Chef | 2 | 750,000 |
| Ren Sykes | Senior Chef | 2 | 750,000 |
| Endo Reeves | Senior Chef | 2 | 750,000 |
| North Lorelei | Senior Chef | 2 | 750,000 |
| Daryl Caera | Senior Chef | 2 | 750,000 |
| GojoS Alaric | Senior Chef | 2 | 750,000 |
| Reijii | Senior Chef | 2 | 750,000 |
| Jessica | Senior Chef | 2 | 750,000 |
| Xiao Fei | Senior Chef | 2 | 750,000 |
| Randy Rain | Senior Chef | 2 | 750,000 |
| Akira Tsai | Senior Chef | 2 | 750,000 |
| Velisse Moongrave | Senior Chef | 2 | 750,000 |
| Tsai Rowles Ackrov | Senior Chef | 2 | 750,000 |

#### Intern - Level 0

| Full Name | Role | Level | Salary |
|---|---|---:|---:|
| Lance El Sailor | Intern | 0 | 0 |
| Ell Roccianera | Intern | 0 | 0 |
| Jireh Navarro | Intern | 0 | 0 |
| Aras Leonarddo | Intern | 0 | 0 |
| Lewis De Laurance | Intern | 0 | 0 |
| Gavin Nathaniel | Intern | 0 | 0 |
| Yasa Abraham | Intern | 0 | 0 |
| Rosella Carmenita | Intern | 0 | 0 |
| Willowy Cordelia | Intern | 0 | 0 |
| Shiloh Faye | Intern | 0 | 0 |
| Erisa Signora | Intern | 0 | 0 |
| Mentari S Jeruk | Intern | 0 | 0 |
| Alexa Kim | Intern | 0 | 0 |

### Velmont Seaside Seed Rule

- Do not create fake Velmont Seaside staff data.
- For V1, Velmont Seaside staff-related queries should return an empty array or null where appropriate.

### Initial Inventory Seed

#### Warlok Items

| Item Name | Initial Quantity |
|---|---:|
| ES BATU | 0 |
| GULA | 0 |
| GARAM | 0 |
| KEMASAN ANGGUR | 0 |
| KEMASAN AYAM | 0 |
| KEMASAN BERAS | 0 |
| KEMASAN JERUK | 0 |
| KEMASAN KOPI | 0 |
| KEMASAN SAPI | 0 |
| KEMASAN TEH | 0 |
| TELUR AYAM | 0 |

#### Supplier Items

| Item Name | Initial Quantity |
|---|---:|
| KEMASAN ANGGUR | 0 |
| KEMASAN AYAM | 0 |
| KEMASAN BERAS | 0 |
| KEMASAN JERUK | 0 |
| KEMASAN KOPI | 0 |
| KEMASAN SAPI | 0 |
| KEMASAN TEH | 0 |
| TELUR AYAM | 0 |

---

## 6. REST API Requirements

### Standard API Response Format

#### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource"
  }
}
```

### Auth & Users API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login using username and password |
| GET | `/api/users/me` | Authenticated | Get current user profile |
| GET | `/api/users` | Level 6 | List all users |
| POST | `/api/users` | Level 6 | Create user |
| PATCH | `/api/users/:id` | Level 6 | Update user |
| DELETE | `/api/users/:id` | Level 6 | Delete or deactivate user |

### Attendance API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/attendance/clock-in` | Level 0-6 | Clock in current user |
| POST | `/api/attendance/clock-out` | Level 0-6 | Clock out current user |
| GET | `/api/attendance/me` | Level 0-6 | Get current user attendance logs |
| GET | `/api/attendance/all` | Level 5-6 | Get all attendance logs |
| PATCH | `/api/attendance/:id/manual-adjustment` | Owner or Level 5-6 | Add manual adjustment |

### Inventory API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/inventory?source=warlok` | Level 0-6 | List Warlok inventory |
| GET | `/api/inventory?source=supplier` | Level 4-6 | List Supplier inventory |
| POST | `/api/inventory/movement` | Based on source permission | Add or deduct stock |
| POST | `/api/inventory/items` | Level 4-6 | Create inventory item |
| PATCH | `/api/inventory/items/:id` | Level 4-6 | Update inventory item |
| DELETE | `/api/inventory/items/:id` | Level 4-6 | Soft delete or disable inventory item |

### Finance API

All Finance API routes require Level 5-6.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/finance` | Level 5-6 | List finance records |
| POST | `/api/finance` | Level 5-6 | Create finance record |
| PATCH | `/api/finance/:id` | Level 5-6 | Update finance record |
| DELETE | `/api/finance/:id` | Level 5-6 | Delete finance record |

### Booking API

All Booking API routes require Level 4-6.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/bookings/catering` | Level 4-6 | List catering bookings |
| POST | `/api/bookings/catering` | Level 4-6 | Create catering booking |
| GET | `/api/bookings/venue` | Level 4-6 | List venue bookings |
| POST | `/api/bookings/venue` | Level 4-6 | Create venue booking |

### Payroll API

All Payroll API routes require Level 5-6.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/payroll` | Level 5-6 | List payroll data |
| GET | `/api/payroll/:userId` | Level 5-6 | View payroll data for a user |

---

## 7. Frontend Requirements

### Frontend Routes

| Route | Access |
|---|---|
| `/login` | Public |
| `/dashboard` | Level 0-6 |
| `/attendance` | Level 0-6 |
| `/inventory/warlok` | Level 0-6 |
| `/inventory/supplier` | Level 4-6 |
| `/finance` | Level 5-6 |
| `/bookings/catering` | Level 4-6 |
| `/bookings/venue` | Level 4-6 |
| `/payroll` | Level 5-6 |
| `/admin/users` | Level 6 |

### UI/UX Direction

- Dark mode by default.
- Modern futuristic high-tech aesthetic.
- Glassmorphism cards:
  - translucent backgrounds
  - soft borders
  - subtle blur
  - rounded corners
- Neon blue or purple accent colors.
- Responsive sidebar navigation.
- Dashboard cards with summary stats.
- Use Tailwind CSS strictly.
- Avoid external heavy UI libraries unless absolutely necessary.
- Frontend should gracefully hide inaccessible navigation items based on user role.
- Unauthorized page access should show a clear “Forbidden” or “Access Denied” state.

### Suggested Pages

#### Login Page

- Username input
- Password input
- Submit button
- Error state for invalid credentials

#### Dashboard Page

- User role summary
- Attendance summary
- Inventory summary
- Finance summary for Level 5-6 only
- Payroll summary for Level 5-6 only

#### Attendance Page

- Clock in button
- Clock out button
- Current active session status
- Attendance history
- Manual adjustment form with notes

#### Inventory Pages

- Inventory table
- Add stock movement form
- Create item form for Level 4-6
- Prevent negative stock update

#### Finance Page

- Finance record table
- Create finance record form
- Filter by finance type

#### Booking Pages

- Catering booking form
- Venue booking form
- Booking table
- Validation states

#### Payroll Page

- Payroll table
- Salary display
- Incomplete salary warning for nullable salary roles

#### Admin Users Page

- User table
- Create user form
- Edit user form
- Deactivate/delete user action

---

## 8. Business Logic, Validation & Edge Cases

### Authentication Rules

- Login uses `username` and `password`.
- Passwords must be hashed with bcrypt.
- JWT must be returned after successful login.
- JWT must include the authenticated user id and role level.
- Do not include `passwordHash` in API responses.

### Attendance Rules

- Users cannot clock in twice without clocking out.
- Users can only have one active attendance session at a time.
- Auto clock-out should happen after 18 hours.
- Auto clock-out can be implemented through:
  - CRON/background job, or
  - logical check when attendance data is accessed.
- If auto clock-out happens, set `autoClockedOut` to `true`.
- Manual adjustment requires notes.
- Level 0-4 can only adjust their own attendance records.
- Level 5-6 can adjust any user attendance record.
- Level 5-6 can view all attendance records.
- Level 0-4 can only view their own attendance records.

### Inventory Rules

- Warlok inventory is accessible by Level 0-6.
- Supplier inventory is accessible only by Level 4-6.
- Quantity cannot become negative.
- Every stock change must create an Inventory Movement record.
- `quantityChange` must be greater than 0.
- For `IN`, add quantity.
- For `OUT`, deduct quantity.
- Item deletion should use soft delete or disable behavior if movement history exists.
- Do not permanently remove inventory history.

### Finance Rules

- Finance access is restricted to Level 5-6.
- Finance amount must be greater than 0.
- Finance type must be one of:
  - `CAPITAL`
  - `INCOME`
  - `EXPENSE`
- Each finance record must store the user who created it.

### Booking Rules

- Booking access is restricted to Level 4-6.
- `fullName`, `job`, `cid`, `phone`, and `bookingDate` are required.
- `bookingDate` cannot be in the past.
- Catering `packageCount` must be at least 10.
- Venue booking does not require package count.
- Each booking record must store the user who created it.

### Payroll Rules

- Payroll access is restricted to Level 5-6.
- Salary must be derived from the role matrix.
- If salary is `NULL`, display `Not configured`.
- For calculation purposes, `NULL` salary returns 0.
- UI must flag `NULL` salary as incomplete.
- Intern salary is fixed at 0 and must not be flagged as incomplete.

---

## 9. Security Rules

- Never store plaintext passwords.
- Never expose `passwordHash` in API responses.
- Protect all API routes except `/api/auth/login`.
- Validate JWT on all secure routes.
- Validate RBAC server-side.
- Validate all request bodies before writing to the database.
- Return consistent error responses.
- Do not rely only on frontend route guards.
- Sanitize and validate user input.
- Use environment variables for secrets.
- Do not commit real `.env` files.

---

## 10. Required Environment Variables

Create `.env.example` with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/velmont_resto"
JWT_SECRET="replace-with-secure-secret"
JWT_EXPIRES_IN="7d"
PORT=4000
VITE_API_BASE_URL="http://localhost:4000"
```

---

## 11. Build Order

Implement the project in this order:

1. Scaffold monorepo project.
2. Setup Vite + React frontend.
3. Setup Express + Node.js + TypeScript backend.
4. Setup PostgreSQL database.
5. Setup Prisma schema.
6. Create database migrations.
7. Create seed script for users and inventory.
8. Implement JWT authentication.
9. Implement RBAC backend middleware.
10. Implement frontend route guards.
11. Build Attendance module.
12. Build Inventory module.
13. Build Finance module.
14. Build Booking Forms module.
15. Build Payroll Dashboard.
16. Build Admin Users page.
17. Add README setup instructions.
18. Add `.env.example`.
19. Verify application runs with `npm run dev`.

---

## 12. Out of Scope for Prototype V1

Do not build logic for the following modules in V1:

- Reimbursement form
- HR metadata module
- Discord integration
- SOP module
- Recipes module
- Real Velmont Seaside staff data

For these modules, return safe empty arrays, null values, or TODO comments where necessary.

---

## 13. Definition of Done

The project is considered complete when:

- Application starts cleanly using `npm run dev` at the root.
- Backend API runs successfully.
- Frontend runs successfully.
- Database migrates successfully.
- Seed script runs successfully.
- Login works with seeded users.
- RBAC prevents unauthorized API access.
- Frontend route guards prevent unauthorized page access.
- All 5 core modules are functional end-to-end:
  - Attendance
  - Inventory
  - Finance
  - Booking Forms
  - Payroll
- Admin Users page is functional for CEO.
- Seaside-related staff data returns empty array or null.
- Out-of-scope modules are not implemented.
- README includes setup, migration, seed, and run instructions.
- `.env.example` is included.

---

## 14. Expected AI Output

The AI coding agent must generate:

- Complete working monorepo codebase.
- Prisma schema file.
- Prisma migration-ready models.
- Prisma seed script.
- Backend REST API.
- Backend auth middleware.
- Backend RBAC middleware.
- Frontend pages.
- Frontend route guards.
- Shared TypeScript types where useful.
- README.md.
- `.env.example`.

When business logic is ambiguous, do not invent rules. Add a clear `// TODO:` comment instead.

---

## 15. Final Instruction to AI Agent

Build the Prototype V1 only.

Do not over-engineer the system.

Prioritize correctness, RBAC safety, working CRUD flows, clean code structure, and clear setup instructions.
