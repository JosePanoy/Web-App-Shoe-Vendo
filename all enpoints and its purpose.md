# API Endpoints and Purpose

This document lists the endpoints used in the application, what they do, required auth, expected payloads, and key notes. It separates endpoints that are already implemented from ones that are planned for device integration.

## Conventions
- Base URL (frontend env): `VITE_API_BASE_URL` (e.g., `http://localhost:8000`)
- All JSON bodies use `Content-Type: application/json`.
- Auth header when required: `Authorization: Bearer <token>`.
- SSE (Server‑Sent Events) streams accept token in the query param `?token=<JWT>` when headers are not available.

## Implemented Endpoints (Web Backend)

- Auth (web)
  - POST `/api/auth/login`
    - Purpose: Admin/User login by pincode + password and role.
    - Body: `{ pincode, password, role: 'admin'|'user' }`
    - Returns: `{ token, role, fname, lname }`
    - Audit: `ADMIN_LOGIN` or `USER_LOGIN`.
  - POST `/api/auth/logout` (auth)
    - Purpose: Invalidate session on the client; logs audit.
    - Returns: `{ message }`
    - Audit: `ADMIN LOGOUT` (or `USER LOGOUT`).
  - POST `/api/auth/athlete/login`
    - Purpose: Athlete login by 6‑digit ID and 4‑digit pincode.
    - Body: `{ idNumber, pincode }`
    - Returns: `{ token, role:'athlete', fname, lname, idNumber, firstLogin }`
    - Audit: `ATHLETE LOGIN`.
  - POST `/api/auth/athlete/logout` (auth)
    - Purpose: Athlete logout.
    - Returns: `{ message }`
    - Audit: `ATHLETE LOGOUT`.
  - POST `/api/auth/change-pincode`
    - Purpose: Athlete changes pincode.
    - Body: `{ idNumber, oldPincode, newPincode }`
    - Returns: `{ message }`

- Admin profile and account management (auth: admin)
  - GET `/api/admin/me`
    - Purpose: Fetch current admin profile.
    - Returns: `{ fname, lname, email, pincode, role }`
  - PUT `/api/admin/me`
    - Purpose: Update profile and optional password.
    - Body: `{ fname?, lname?, email?, currentPassword?, newPassword? }`
    - Returns: `{ message, fname, lname, email }`
    - Audit: `ADMIN_PROFILE_UPDATE`.
  - POST `/api/admin/users`
    - Purpose: Create a new admin account (requires authorization policy).
    - Body: `{ fname, lname, email, pincode, password }`
    - Returns: `{ message, admin: { id, fname, lname, email, pincode } }`
    - Audit: `ADMIN_CREATE`.

- Admin dashboard summary (auth: admin)
  - GET `/api/admin/dashboard/summary`
    - Purpose: Registered athlete stats for the overview cards.
    - Returns: `{ registeredAthletes: number }`

- Admin audit log (auth: admin)
  - GET `/api/admin/audit`
    - Purpose: Paginated audit entries (newest first).
    - Query: `limit<=20`, `before=<_id>` (cursor), `since=<ISO>`, optional `action`, `actorRole`.
    - Returns: `{ items: [...], nextCursor }`
  - GET `/api/admin/audit/stream`
    - Purpose: Real‑time audit updates via SSE.
    - Query: `?token=<JWT>` (or `Authorization` header in some clients).
    - Returns: SSE events `data: { ...auditEntry }`.

- Admin usage statistics (auth: admin)
  - GET `/api/admin/stats/usage`
    - Purpose: Usage aggregates for charts (line + scatter).
    - Query: `period=day|week|month|year`
    - Returns: `{ period, buckets: [{ ts, label, total, standard, deep }], totals }`

- Athletes (auth patterns depend on routes; used by admin UI)
  - GET `/api/athletes`
    - Purpose: List athletes for User Config page.
    - Returns: `[{ idNumber, fname, lname, ... }]`
  - POST `/api/athletes/register`
    - Purpose: Register new athlete by ID number.
    - Body: `{ idNumber }`
    - Returns: `{ athlete }` or message.
  - DELETE `/api/athletes/:idNumber`
    - Purpose: Remove athlete from roster.
    - Returns: `{ message }`

- Machine (auth: admin; streaming accepts token param)
  - GET `/api/machine/status`
    - Purpose: Current machine status and metrics.
    - Returns: `{ status, operation, temperature|null, humidity|null, lastMaintenance|null, updatedAt|null }`
  - GET `/api/machine/stream`
    - Purpose: Real‑time machine status via SSE (5s updates + heartbeats).
    - Query: `?token=<JWT>` (if Authorization header not set by client).
    - Returns: SSE events `data: { status, operation, temperature, humidity, ... }`

## Planned/Device‑Side Endpoints (to be provided by the machine or implemented later)

These are called by the athlete flow and/or expected from the device integration. They are not part of the current backend unless you add a mock.

- Web app → Machine control
  - POST `/machine/check-for-shoes`
    - Purpose: Capture an image and run model to detect shoe presence.
    - Returns: `{ found: boolean, imageUrl?: string }`
  - POST `/machine/wait-for-coin`
    - Purpose: Activate coin slot, wait for one coin, and return its value.
    - Returns: `{ value: number }` (e.g., 10 or 20).
  - POST `/machine/start-basic-cleaning`
    - Purpose: Start standard sanitize recipe.
    - Returns: `{ status: 'started' }`
  - POST `/machine/start-deep-cleaning`
    - Purpose: Start deep sanitize recipe.
    - Returns: `{ status: 'started' }`
  - GET `/machine/check-temps`
    - Purpose: Read current temperature and humidity.
    - Returns: `{ temperature: number, humidity: number }`

- Device → Web app (callbacks/webhooks)
  - POST `/api/device/coin-drop`
    - Purpose: Notify the web backend of the coin value read by the machine.
    - Body: `{ sessionId, value }`
  - POST `/api/device/cleaning-complete`
    - Purpose: Notify completion of a cleaning cycle.
    - Body: `{ sessionId, recipe: 'basic'|'deep', ok: boolean }`

- Usage/Vouchers (optional web backend endpoints)
  - GET `/api/usage/me`
    - Purpose: Return usage count and voucher balance for the logged‑in athlete.
    - Returns: `{ totalUses, vouchers, stamps }`
  - POST `/api/usage/record`
    - Purpose: Record a completed cleaning and update stamps/vouchers.
    - Body: `{ sessionId, recipe, usedVoucher }`
  - POST `/api/vouchers/redeem`
    - Purpose: Redeem a free clean voucher for a session.
    - Body: `{ sessionId, recipe }`

## Notes & Best Practices
- Always send the JWT in the `Authorization` header for protected endpoints; for SSE, pass `?token=<JWT>` if headers aren’t available.
- Audit entries exist for key actions: admin/user/athlete logins/logouts, profile updates, and admin creation.
- Machine streaming endpoint is read‑only and safe to poll; it maps unknown metrics to `null` so the UI can display `N/A`.
- Keep `limit` to `<= 20` for audit pagination to avoid backend load.

## Quick Reference
- Auth: `/api/auth/*`
- Admin: `/api/admin/*` (profile, users, dashboard, audit, stats)
- Athletes: `/api/athletes/*`
- Machine: `/api/machine/*` (status, stream)
- Device callbacks (planned): `/api/device/*`

