# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Pulse seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab of this repository
2. **Email**: [Create a GitHub issue requesting contact information for security reports]

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes (if you have them)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical issues as quickly as possible
- **Credit**: We will credit you in our release notes (unless you prefer to remain anonymous)

## Security Best Practices for Contributors

When contributing to Pulse, please follow these security practices:

### Authentication & Authorization
- Never commit API keys, tokens, or credentials
- Use environment variables for all sensitive configuration
- Validate all user input on the backend

### Data Protection
- Never log sensitive user information
- Use secure connections (HTTPS) for all external requests
- Follow the principle of least privilege

### Dependencies
- Keep dependencies updated
- Review security advisories for dependencies
- Use `pnpm audit` to check for known vulnerabilities

## Security Features

Pulse implements the following security measures:

- **Authentication**: Clerk handles all authentication securely
- **Data Privacy**: Contact information is only shared after explicit donor consent
- **Input Validation**: All user inputs are validated on the Convex backend
- **Environment Isolation**: Sensitive keys are stored in environment variables

## Acknowledgments

We appreciate the security research community's efforts in helping keep Pulse and its users safe.
