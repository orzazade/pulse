# Pulse

A blood donation matching platform connecting donors with seekers. Built with React Native (Expo), Convex, and Clerk.

## Overview

Pulse helps people in urgent need of blood donations connect with compatible donors nearby. The platform prioritizes privacy by requiring donor consent before sharing contact information, and uses real-time notifications to ensure time-sensitive requests reach donors quickly.

### Key Features

- **Blood Type Matching** - Automatic compatibility matching across all 8 blood types
- **Privacy-First Design** - Donor contact info shared only after explicit consent
- **Real-Time Notifications** - Instant alerts for compatible blood requests
- **Location-Based Search** - Find nearby donors by city or precise location
- **Eligibility Tracking** - 56-day donation cycle reminders
- **Emergency Broadcasts** - Urgent requests with wider reach

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | [Expo](https://expo.dev/) (React Native) |
| Backend | [Convex](https://convex.dev/) |
| Authentication | [Clerk](https://clerk.com/) |
| Geospatial | [@convex-dev/geospatial](https://www.convex.dev/components/geospatial) |
| Monorepo | [Turborepo](https://turbo.build/) |
| Package Manager | [pnpm](https://pnpm.io/) |

## Project Structure

```
pulse/
├── apps/
│   └── mobile/          # Expo React Native app
├── convex/              # Convex backend (schema, queries, mutations)
├── packages/            # Shared packages
├── turbo.json           # Turborepo configuration
└── package.json         # Root workspace config
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Convex account](https://convex.dev/)
- [Clerk account](https://clerk.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/orzazade/pulse.git
   cd pulse
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your credentials:

   ```env
   # Convex - get from running `npx convex dev`
   EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   CONVEX_DEPLOYMENT=your-deployment-name

   # Clerk - get from Clerk Dashboard → API Keys
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_ISSUER_URL=https://your-clerk-instance.clerk.accounts.dev
   ```

4. **Initialize Convex**

   ```bash
   npx convex dev
   ```

   This will prompt you to create a new project or link an existing one.

5. **Configure Clerk with Convex**

   Follow the [Clerk + Convex integration guide](https://docs.convex.dev/auth/clerk) to:
   - Create a JWT template in Clerk for Convex
   - Add the issuer URL to your environment variables

### Running the App

**Development mode (all platforms):**

```bash
pnpm dev
```

**Mobile app only:**

```bash
cd apps/mobile
pnpm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Blood Type Compatibility

The platform implements standard blood type compatibility rules:

| Recipient | Compatible Donors |
|-----------|-------------------|
| O- | O- |
| O+ | O-, O+ |
| A- | O-, A- |
| A+ | O-, O+, A-, A+ |
| B- | O-, B- |
| B+ | O-, O+, B-, B+ |
| AB- | O-, A-, B-, AB- |
| AB+ | All types (universal recipient) |

O- is the universal donor. AB+ is the universal recipient.

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Clean build artifacts |

### Convex Commands

```bash
# Start Convex development server
npx convex dev

# Deploy to production
npx convex deploy

# View dashboard
npx convex dashboard
```

### Code Style

This project uses:
- [ESLint](https://eslint.org/) for linting
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Prettier](https://prettier.io/) for formatting (recommended)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

If you discover a security vulnerability, please review our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Convex](https://convex.dev/) for the real-time backend infrastructure
- [Clerk](https://clerk.com/) for authentication
- [Expo](https://expo.dev/) for the React Native framework
- Blood donation research from [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10563464/) for feature insights

---

**Made with care for the blood donation community**
