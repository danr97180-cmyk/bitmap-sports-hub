# BITMAP — Stage 8: sports API input hardening

- Validate actual calendar dates, not just YYYY-MM-DD formatting. Invalid dates are rejected before network calls.
- Keep the 10-second abort timer active through response body parsing, not just the initial fetch.
- Add regression coverage for impossible calendar dates.

Verification: static inspection only; dependencies unavailable locally. No deployment or GitHub commit.
