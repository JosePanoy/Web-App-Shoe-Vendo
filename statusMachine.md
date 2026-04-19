# Machine Statistics Guide

This document explains what the backend needs so the **Machine Usage Statistics** chart can display real data.

## Current Statistics APIs

### 1. Get chart data

```http
GET /api/admin/stats/usage?period=week
```

Allowed `period` values:

```txt
day
week
month
year
```

This API is used by the admin statistics chart.

It returns data like:

```json
{
  "period": "week",
  "tz": "Asia/Manila",
  "buckets": [
    {
      "label": "Apr 19",
      "total": 3,
      "standard": 2,
      "deep": 1
    }
  ],
  "totals": {
    "total": 3,
    "standard": 2,
    "deep": 1
  }
}
```

### 2. Realtime chart refresh

```http
GET /api/admin/audit/stream?token=ADMIN_TOKEN
```

This does not create statistics.

It only tells the frontend to refresh when a new audit log is created.

## Where The Chart Gets Data

The chart reads from the MongoDB collection:

```txt
AuditLog
```

The statistics API counts only audit logs where:

```js
recipe: 'standard'
```

or:

```js
recipe: 'deep'
```

If there are no audit logs with those `recipe` values, the chart will show `0`.

## What The Backend Must Do

Whenever a machine cleaning cycle starts or completes, the backend should insert an audit log.

Minimum required fields:

```js
{
  action: 'CLEAN_START',
  recipe: 'standard',
  amount: 10
}
```

For deep cleaning:

```js
{
  action: 'CLEAN_START',
  recipe: 'deep',
  amount: 20
}
```

`createdAt` is automatically added by MongoDB/Mongoose timestamps. The chart uses `createdAt` to group data by day, week, month, or year.

## What The Backend Expects From The Machine

The backend needs the machine to report a cleaning event.

The most important value is the cleaning type:

```txt
standard
deep
```

Recommended machine event payload:

```json
{
  "machineId": "SV-01",
  "status": "in-use",
  "event": "cleaning_started",
  "recipe": "standard",
  "amount": 10,
  "paymentType": "coin",
  "timestamp": "2026-04-19T10:30:00.000Z"
}
```

For deep cleaning:

```json
{
  "machineId": "SV-01",
  "status": "in-use",
  "event": "cleaning_started",
  "recipe": "deep",
  "amount": 20,
  "paymentType": "coin",
  "timestamp": "2026-04-19T10:30:00.000Z"
}
```

The backend should convert that machine event into an `AuditLog`.

Example conversion:

```js
{
  action: 'CLEAN_START',
  recipe: machineEvent.recipe,
  amount: machineEvent.amount,
  target: machineEvent.machineId,
  details: {
    status: machineEvent.status,
    paymentType: machineEvent.paymentType,
    event: machineEvent.event
  }
}
```

## Minimum Machine Data Needed For Statistics

The statistics chart does not need temperature, humidity, or current machine status.

For statistics, the backend only needs:

```json
{
  "recipe": "standard",
  "amount": 10
}
```

or:

```json
{
  "recipe": "deep",
  "amount": 20
}
```

Optional but recommended:

```json
{
  "machineId": "SV-01",
  "paymentType": "coin",
  "status": "in-use",
  "event": "cleaning_started"
}
```

## Current Gap

The current statistics API is already reading from `AuditLog`.

But the backend still needs a place where the machine cleaning event is received and saved as an audit log.

Without that insert, the machine can work normally but the chart will still show `0`.

## Example Audit Log

```json
{
  "actorId": "661f...",
  "actorRole": "athlete",
  "actorName": "Juan Dela Cruz",
  "action": "CLEAN_START",
  "recipe": "standard",
  "amount": 10,
  "target": "SV-01",
  "details": {
    "machineId": "SV-01",
    "paymentType": "coin"
  }
}
```

## Recommended Flow

1. User selects Standard or Deep cleaning.
2. Payment or voucher is accepted.
3. Machine starts cleaning.
4. Backend inserts an `AuditLog` with `recipe`.
5. Statistics API counts that log.
6. Admin chart updates.

## Important Notes

- Machine status APIs only show current machine state.
- Machine status does not update statistics by itself.
- Statistics will update only if `AuditLog` receives records with `recipe: 'standard'` or `recipe: 'deep'`.
- The `recipe` value must match exactly: lowercase `standard` or lowercase `deep`.

## Related APIs

Machine status:

```http
GET /api/machine/status
GET /api/machine/stream
```

These are for machine monitoring only.

Statistics:

```http
GET /api/admin/stats/usage?period=week
GET /api/admin/audit/stream?token=ADMIN_TOKEN
```

These are for the Machine Usage Statistics chart.
