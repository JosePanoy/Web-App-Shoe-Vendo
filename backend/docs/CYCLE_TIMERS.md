# Machine Cycle Timers (Standard vs Deep)

This backend exposes configurable cycle durations for the shoe machine. Durations apply when a service transaction is created and are surfaced via machine status/stream endpoints.

Configuration
- Set environment variables in `backend/.env`:
  - `STANDARD_DURATION_SEC` — seconds for standard clean (default 180)
  - `DEEP_DURATION_SEC` — seconds for deep sanitize (default 300)

How it works
- On service creation `POST /api/service/request`:
  - Duration is selected based on `serviceType`.
  - The transaction persists `durationSec` and `expectedCompleteAt`.
  - File reference: `backend/controllers/serviceController.js:1`
- Machine status/stream includes timers when in use:
  - `GET /api/machine/status` and `GET /api/machine/stream` add:
    - `expectedCompleteAt`: ISO timestamp
    - `remainingSec`: integer seconds remaining (0 if elapsed/unknown)
  - File reference: `backend/controllers/machineController.js:1`

API notes
- `transaction` objects now include `durationSec` and `expectedCompleteAt`.
- Machine endpoints only include timing when status is `in-use`.

Operational guidance
- Update `.env` and restart the backend to change durations.
- If durations need runtime edits without restart, consider moving to a settings collection.

