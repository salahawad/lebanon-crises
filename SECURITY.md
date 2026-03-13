# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report it by emailing the project maintainers or using GitHub's private vulnerability reporting feature:

1. Go to the repository's **Security** tab
2. Click **Report a vulnerability**
3. Provide a description of the issue, steps to reproduce, and any potential impact

We will acknowledge your report within 48 hours and work with you to understand and address the issue.

## Scope

This policy applies to the Lebanon Relief codebase. It does not cover the Firebase infrastructure or third-party services used by the project.

## Security Best Practices for Deployers

- **Change all default credentials** before deploying to production (see seed script defaults)
- **Never commit `.env` files** — use `.env.example` as a template
- **Rotate Firebase API keys** if they have ever been exposed publicly
- **Deploy Firestore security rules** (`firebase deploy --only firestore:rules`) to enforce access control
- **Enable reCAPTCHA** to protect public forms from abuse
- **Review admin access** regularly in the `admins` Firestore collection

## Supported Versions

As this is an early-stage humanitarian project, security fixes are applied to the latest version on `main`. We recommend always running the latest version.
