# Contributing to Pulse

Thank you for your interest in contributing to Pulse! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, device if mobile)

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why this feature would be useful
- Consider how it fits with the project's goals

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `pnpm install`
3. **Make your changes** following our coding standards
4. **Test your changes** thoroughly
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- Expo CLI
- Convex account
- Clerk account

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/pulse.git
cd pulse

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Fill in your Convex and Clerk credentials

# Start Convex backend
npx convex dev

# In another terminal, start the app
pnpm dev
```

## Coding Standards

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused

### Commit Messages

Write clear commit messages that explain *what* and *why*:

```
feat: add blood type filter to search

- Add filter chips for blood type selection
- Update search query to filter by blood type
- Add tests for filter logic
```

Use conventional commit prefixes:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Branch Naming

Use descriptive branch names:
- `feature/blood-type-filter`
- `fix/notification-not-showing`
- `docs/update-readme`

## Project Structure

```
pulse/
├── apps/
│   └── mobile/          # Expo React Native app
│       ├── app/         # Expo Router screens
│       ├── components/  # React components
│       ├── hooks/       # Custom hooks
│       ├── lib/         # Utility functions
│       └── theme/       # Design tokens
├── convex/              # Backend
│   ├── schema.ts        # Database schema
│   ├── *.ts             # Queries and mutations
│   └── lib/             # Shared backend utilities
└── packages/            # Shared packages
```

## Testing

Before submitting a PR:

1. Run linting: `pnpm lint`
2. Run type checking: `pnpm typecheck`
3. Test on both iOS and Android if possible
4. Test the feature manually

## Questions?

Feel free to open an issue for any questions about contributing. We're here to help!

## License

By contributing to Pulse, you agree that your contributions will be licensed under the MIT License.
