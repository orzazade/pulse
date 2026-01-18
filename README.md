<div align="center">

# 🩸 Pulse

### Connect Blood Donors with Those in Need

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)](https://expo.dev/)
[![Convex](https://img.shields.io/badge/Convex-Backend-FF6B6B?logo=convex)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A privacy-first mobile platform that connects blood donors with seekers through real-time matching and location-based search.**

[Get Started](#-quick-start) · [Features](#-features) · [Documentation](#-documentation) · [Contributing](#-contributing)

---

</div>

## 🎯 The Problem We Solve

Every 2 seconds, someone needs blood. Yet finding compatible donors quickly remains a challenge. Pulse bridges this gap by:

- **Instant Matching** — Connect with compatible donors in your area within minutes
- **Privacy Protection** — Your contact info stays private until you choose to share
- **Real-Time Alerts** — Get notified immediately when someone needs your blood type

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔬 Smart Blood Matching
Automatic compatibility matching across all 8 blood types using medically accurate rules. O- universal donor, AB+ universal recipient.

### 🔔 Real-Time Notifications
Instant push notifications when compatible requests are posted. Never miss an urgent need.

### 📍 Location-Based Search
Find donors nearby using city-level or precise geospatial search powered by Convex.

</td>
<td width="50%">

### 🔒 Privacy-First Design
Contact information is shared only after explicit donor consent. You control your visibility.

### 🚨 Emergency Broadcasts
Urgent requests reach more donors with priority notifications and wider search radius.

### 📊 Eligibility Tracking
56-day donation cycle reminders help you know when you can donate again.

</td>
</tr>
</table>

## 📱 Screenshots

<div align="center">
<i>Screenshots coming soon</i>

<!--
Add your screenshots here:
<img src="docs/screenshots/home.png" width="200" />
<img src="docs/screenshots/search.png" width="200" />
<img src="docs/screenshots/request.png" width="200" />
-->

</div>

## 🛠 Tech Stack

<div align="center">

| | Technology | Purpose |
|:---:|:---|:---|
| 📱 | **[Expo](https://expo.dev/)** | React Native framework |
| ⚡ | **[Convex](https://convex.dev/)** | Real-time backend & database |
| 🔐 | **[Clerk](https://clerk.com/)** | Authentication |
| 🌍 | **[@convex-dev/geospatial](https://www.convex.dev/components/geospatial)** | Location queries |
| 🏗 | **[Turborepo](https://turbo.build/)** | Monorepo build system |
| 📦 | **[pnpm](https://pnpm.io/)** | Package manager |

</div>

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# Clone the repository
git clone https://github.com/orzazade/pulse.git
cd pulse

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Configure Services

<details>
<summary><b>1. Set up Convex</b></summary>

```bash
npx convex dev
```

This creates a new Convex project and adds your deployment URL to `.env.local`.

</details>

<details>
<summary><b>2. Set up Clerk</b></summary>

1. Create a [Clerk account](https://clerk.com/)
2. Create a new application
3. Go to **API Keys** and copy your publishable key
4. Follow the [Clerk + Convex guide](https://docs.convex.dev/auth/clerk) to create a JWT template
5. Add credentials to `.env.local`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
```

</details>

### Run the App

```bash
# Start the development server
pnpm dev

# Or run just the mobile app
cd apps/mobile && pnpm start
```

Scan the QR code with Expo Go to see it on your phone!

## 📁 Project Structure

```
pulse/
├── 📱 apps/
│   └── mobile/              # Expo React Native app
│       ├── app/             # Screens (Expo Router)
│       ├── components/      # UI components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities
│       └── theme/           # Design tokens
├── ⚡ convex/                # Backend
│   ├── schema.ts            # Database schema
│   ├── *.ts                 # Queries & mutations
│   └── lib/                 # Shared utilities
├── 📦 packages/             # Shared packages
└── ⚙️ config files          # turbo.json, tsconfig, etc.
```

## 🩸 Blood Type Compatibility

<div align="center">

| Recipient | Can Receive From |
|:---------:|:-----------------|
| **O−** | O− |
| **O+** | O−, O+ |
| **A−** | O−, A− |
| **A+** | O−, O+, A−, A+ |
| **B−** | O−, B− |
| **B+** | O−, O+, B−, B+ |
| **AB−** | O−, A−, B−, AB− |
| **AB+** | All types ✓ |

*O− is the universal donor • AB+ is the universal recipient*

</div>

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Clean all build artifacts |

## 📖 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** — How to contribute to this project
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community guidelines
- **[Security Policy](SECURITY.md)** — Reporting vulnerabilities
- **[Convex Docs](https://docs.convex.dev/)** — Backend documentation
- **[Expo Docs](https://docs.expo.dev/)** — Mobile framework documentation

## 🤝 Contributing

We love contributions! Whether it's:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Improving documentation
- 🔧 Submitting pull requests

Please read our **[Contributing Guide](CONTRIBUTING.md)** to get started.

### Quick Contribution Steps

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/pulse.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m 'Add amazing feature'

# Push and open a PR
git push origin feature/amazing-feature
```

## 💖 Support the Project

If Pulse helps you or you believe in the mission:

- ⭐ **Star this repository** — It helps others discover the project
- 🐛 **Report issues** — Help us improve
- 📢 **Spread the word** — Share with others who might benefit
- 🤝 **Contribute** — Code, docs, or ideas are all welcome

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Convex](https://convex.dev/) — Real-time backend infrastructure
- [Clerk](https://clerk.com/) — Authentication made simple
- [Expo](https://expo.dev/) — React Native, supercharged
- Research from [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10563464/) — Feature insights

---

<div align="center">

**Made with ❤️ for the blood donation community**

Every donation counts. Every life matters.

<br />

[⬆ Back to Top](#-pulse)

</div>
