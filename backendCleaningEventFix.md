# Backend Cleaning Event Fix

## Problem

The admin statistics chart was showing `0` because the machine cleaning events were not being saved in the website backend.

The machine may clean the shoes successfully, but if the backend does not save that event, the statistics chart has nothing to count.

## What Has Been Fixed

The website backend now has a new endpoint where the machine can send cleaning event data.

When the backend receives a valid cleaning event, it saves it into `AuditLog`.

The statistics chart already reads from `AuditLog`, so it can now count:

```txt
standard cleaning
deep cleaning
```

## New Endpoint

```http
POST /api/device/cleaning-event
```

Also available:

```http
POST /api/device/cleaning-start
```

## New Files

- `backend/controllers/deviceController.js`
- `backend/routes/deviceRoute.js`
- `backendCleaningEventFix.md`

## Modified Files

- `backend/index.js`
- `backend/models/auditLog.js`

## Data Needed From The Machine

The machine should send this data to the website backend when cleaning starts.

For standard cleaning:

```json
{
  "machineId": "SV-01",
  "sessionId": "standard-001",
  "recipe": "standard",
  "amount": 10,
  "paymentType": "coin",
  "status": "in-use",
  "event": "cleaning_started"
}
```

For deep cleaning:

```json
{
  "machineId": "SV-01",
  "sessionId": "deep-001",
  "recipe": "deep",
  "amount": 20,
  "paymentType": "coin",
  "status": "in-use",
  "event": "cleaning_started"
}
```

Most important field:

```txt
recipe
```

Allowed values:

```txt
standard
deep
```

The backend uses this value so the admin statistics chart knows what type of cleaning happened.
