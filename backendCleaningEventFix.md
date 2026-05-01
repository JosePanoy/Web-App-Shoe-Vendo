# Backend Cleaning Event Fix

## Issue

The admin statistics chart was showing `0` usage because the backend had no saved cleaning records.

The statistics API already reads from the `AuditLog` collection, but before this fix there was no backend endpoint where the machine could send cleaning events.

In simple terms:

```txt
Machine cleaned shoes
but
Website backend did not record it
so
Admin statistics stayed at 0
```

## What Was Fixed

A new backend endpoint was added so the machine can report when a cleaning cycle starts.

When the backend receives that event, it saves an `AuditLog` record with:

```txt
recipe: standard
```

or:

```txt
recipe: deep
```

The admin statistics chart already counts those values, so the chart can now show real machine usage after the machine sends data.

## New Endpoint

```http
POST /api/device/cleaning-event
```

Alias endpoint:

```http
POST /api/device/cleaning-start
```

Both endpoints do the same thing.

## Expected Data From The Machine

For standard cleaning, the machine should send:

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

For deep cleaning, the machine should send:

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

## Required Fields

The most important field is:

```txt
recipe
```

Allowed values:

```txt
standard
deep
```

If `amount` is missing, the backend will automatically use:

```txt
standard = 10
deep = 20
```

## Recommended Fields

These fields are recommended because they make the records easier to trace:

```txt
machineId
sessionId
recipe
amount
paymentType
status
event
```

`sessionId` is useful because the backend uses it to avoid duplicate `CLEAN_START` records for the same cleaning session.

## What The Backend Saves

The backend saves an audit log similar to this:

```json
{
  "actorRole": "machine",
  "actorName": "SV-01",
  "action": "CLEAN_START",
  "sessionId": "standard-001",
  "target": "SV-01",
  "recipe": "standard",
  "amount": 10,
  "details": {
    "machineId": "SV-01",
    "event": "cleaning_started",
    "paymentType": "coin",
    "status": "in-use"
  }
}
```

This is the data that the statistics API counts.

## Security Option

The endpoint supports an optional device secret.

If this environment variable is set:

```txt
DEVICE_EVENT_SECRET
```

then the machine must send the secret using either:

```http
x-device-secret: YOUR_SECRET
```

or:

```http
Authorization: Bearer YOUR_SECRET
```

If `DEVICE_EVENT_SECRET` is not set, the endpoint accepts requests without a device secret.

## Modified Files

### `backend/index.js`

Added the device route import and registered it under:

```txt
/api/device
```

### `backend/models/auditLog.js`

Added an index for:

```txt
sessionId + action
```

This helps the backend check if the same cleaning session was already recorded.

## New Files

### `backend/controllers/deviceController.js`

Handles the machine cleaning event.

Main responsibilities:

- validate the device secret if configured
- accept only `standard` or `deep`
- set default amount if missing
- prevent duplicate logs when `sessionId` is provided
- save the cleaning event into `AuditLog`
- notify the real-time audit stream

### `backend/routes/deviceRoute.js`

Defines the new device endpoints:

```txt
POST /api/device/cleaning-event
POST /api/device/cleaning-start
```

## Final Flow

```txt
Athlete starts cleaning
Machine starts Standard or Deep cycle
Machine sends cleaning event to website backend
Backend saves AuditLog
Statistics API counts AuditLog
Admin chart updates
```

## Verification Done

Syntax checks passed for:

```txt
backend/controllers/deviceController.js
backend/routes/deviceRoute.js
backend/index.js
```

No syntax errors were found.
