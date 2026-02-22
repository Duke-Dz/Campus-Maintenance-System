# Email Production Checklist

Use this checklist before going live with real users.

## Application Controls (implemented)

- Password reset does not send email for unknown addresses.
- Forgot-password and verification resend endpoints use generic responses.
- Minimum response delay added for public auth email endpoints to reduce timing enumeration.
- Verification code attempts are capped.
- Reset/verification requests have cooldown windows.
- Reset tokens are stored hashed (SHA-256) and are single-use with expiry.
- Password reset increments user token version, invalidating older JWTs.
- Scheduled cleanup removes expired/old used auth tokens.

## Infrastructure Controls (you must configure)

- Configure SPF, DKIM, and DMARC for your sender domain.
- Use a dedicated transactional email provider or properly secured SMTP account.
- Monitor bounces, complaints, and send reputation.
- Set `APP_EMAIL_ENABLED=true` only after SMTP credentials are validated.
- Keep `JWT_SECRET` and SMTP secrets in a secret manager (not plain git files).

## Optional Hardening

- Add CAPTCHA on `forgot-password` and `resend-verification` endpoints.
- Add distributed rate limiting (Redis/API gateway) for multi-instance deployments.
- Use an outbox queue + worker for resilient email retries.
