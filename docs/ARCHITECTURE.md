# Library Management System - Architectural Documentation

## System Architecture Overview

```
                          +-----------------------------------+
                          |      Client Browser / Next.js     |
                          |  React 19 / Tailwind CSS UI Pages |
                          +-----------------------------------+
                                            |
                                  REST API / HTTP-Only JWT
                                            v
                          +-----------------------------------+
                          |     Next.js API Route Handlers    |
                          |    (Server-side RBAC & Zod)       |
                          +-----------------------------------+
                                            |
                                            v
                          +-----------------------------------+
                          |     Central Policy & Services     |
                          | (Book, Member, Loan, Fine, Audit) |
                          +-----------------------------------+
                                            |
                                     ACID Transactions
                                            v
                          +-----------------------------------+
                          |     Prisma ORM Data Layer         |
                          +-----------------------------------+
                                            |
                                            v
                          +-----------------------------------+
                          |     PostgreSQL / SQLite Database  |
                          +-----------------------------------+
```

## Security Architecture & RBAC Flow
1. **Authentication**: Credentials are verified against PBKDF2/bcrypt salted hashes.
2. **Session Handling**: Successful login sets an HTTP-Only, SameSite cookie containing an HMAC SHA-256 signed JWT session token.
3. **Server-Side Authorization**: API routes invoke `authenticateRequest` and `authorizeRoles` to ensure role constraints (`ADMIN`, `LIBRARIAN`, `MEMBER`) are strictly enforced at the API layer.

## Data Model & ER Relationships
- `User` 1 : 1 `MemberProfile`
- `Book` 1 : N `BookCopy`
- `Book` N : M `Author` (via `BookAuthor`)
- `Category` 1 : N `Book`
- `MemberProfile` 1 : N `Loan`
- `BookCopy` 1 : N `Loan`
- `Loan` 1 : 0..1 `Fine`
- `Fine` 1 : N `FinePayment`
- `User` 1 : N `AuditLog`
- `User` 1 : N `Notification`
