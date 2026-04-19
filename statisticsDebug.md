# Statistics Debug Report

## Summary

The statistics API is working and returning data successfully.

The problem is that all statistics values are `0` because there are no machine cleaning logs saved in `AuditLog`.

## Backend Checked

Production backend:

```txt
https://back.shoenitize.shop
```

Health check result:

```txt
Backend is running
```

## Login Test

Admin login endpoint used:

```http
POST /api/auth/login
```

Test body:

```json
{
  "pincode": "191919",
  "password": "[REDACTED]",
  "role": "admin"
}
```

Result:

```txt
Login successful. Admin token was received.
```

## Statistics Endpoint Test

Endpoint tested:

```http
GET /api/admin/stats/usage?period=week
```

Result:

```json
{
  "period": "week",
  "tz": "Asia/Manila",
  "totals": {
    "total": 0,
    "standard": 0,
    "deep": 0
  }
}
```

The API returned weekly buckets from April 12 to April 19, but every bucket has:

```json
{
  "total": 0,
  "standard": 0,
  "deep": 0
}
```

## Audit Log Test

Endpoint tested:

```http
GET /api/admin/audit?limit=20
```

Result:

The latest audit logs contain only:

```txt
ADMIN_LOGIN
ADMIN LOGOUT
ADMIN_PROFILE_UPDATE
ATHLETE LOGIN
```

All returned logs have:

```json
{
  "recipe": "",
  "amount": 0
}
```

## Finding

The statistics chart reads from `AuditLog`.

It only counts records with:

```json
{
  "recipe": "standard"
}
```

or:

```json
{
  "recipe": "deep"
}
```

Currently, no audit logs contain those values.

## Main Problem

The machine usage data is not being saved into the web backend `AuditLog`.

This means either:

1. The machine is not sending cleaning usage data to the web backend.
2. Or the backend receives it but does not save it as an `AuditLog`.

## Expected Missing Data

When a standard cleaning starts, the backend should save:

```json
{
  "action": "CLEAN_START",
  "recipe": "standard",
  "amount": 10,
  "target": "SV-01"
}
```

When a deep cleaning starts, the backend should save:

```json
{
  "action": "CLEAN_START",
  "recipe": "deep",
  "amount": 20,
  "target": "SV-01"
}
```

## Conclusion

The statistics API and admin authentication are working.

The chart shows `0` because the backend has no machine cleaning records in `AuditLog`.

Developers should check the machine-to-backend integration and make sure every cleaning cycle creates an `AuditLog` record with `recipe: "standard"` or `recipe: "deep"`.
