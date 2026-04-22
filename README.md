# 💰 cost-cutting-ai-backend

> Solve inefficient expense management through automated financial optimization advice powered by Google Gemini AI and real-time Supabase data synchronization.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

### Table of Contents
- [🧩 Problem & Solution](#-problem--solution)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [📁 Project Structure](#-project-structure)
- [💻 Usage](#-usage)
- [🧪 Running Tests](#-running-tests)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

### 🧩 Problem & Solution

**The Problem:** Many users struggle with inefficient expense management and a lack of actionable insights into their spending habits. Manual tracking often fails to identify specific areas where costs can be reduced, leaving users without a clear path toward financial optimization.

**The Solution:** CostWise-AI provides an automated system that tracks expenses and generates intelligent cost-cutting advice. By combining a TypeScript Express backend with Google Gemini AI for deep analysis and Supabase for persistent data storage, the application transforms raw transaction data into real-time financial strategy.

### ✨ Features

- 🤖 **AI-powered financial analysis** using Google Gemini API to generate custom cost-cutting insights.
- 🔄 **Real-time data synchronization** utilizing Supabase subscriptions for immediate updates.
- 🔌 **WebSocket server implementation** for persistent, low-latency communication via the `ws` library.
- 🔐 **JWT-based authentication** middleware for secure API access and user data protection.
- 🗄️ **SQLite database integration** for efficient local data management and development.
- ⚛️ **React frontend component architecture** for structured and reusable expense reporting.
- 🎨 **Tailwind CSS integration** for a responsive and modern user interface design.

### 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Express | Web server framework for the API |
| **Backend** | ws | WebSocket support for real-time communication |
| **Backend** | jsonwebtoken | Token-based authentication and security |
| **AI & DB** | @supabase/supabase-js | Database client and real-time subscription management |
| **AI & DB** | @google/generative-ai | AI analysis for cost-cutting insights using Gemini |
| **Tools** | tsx | TypeScript execution for development |
| **Tools** | typescript | Static typing and language support |
| **Tools** | dotenv | Environment variable management |
| **Tools** | cors | Cross-origin resource sharing configuration |
| **Tools** | uuid | Generation of unique identifiers |

### 📋 Prerequisites

1. Node.js >= 18 [Download here](https://nodejs.org/)
2. npm (comes with Node.js)

### 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/owner/cost-cutting-ai-backend.git
cd cost-cutting-ai-backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

### ⚙️ Environment Variables

| Variable | Description | Required |
| :--- | :--- | :--- |
| VITE_SUPABASE_URL | The URL of your Supabase project | Yes |
| VITE_SUPABASE_ANON_KEY | Anonymous key for client-side Supabase access | Yes |
| VITE_GEMINI_API_KEY | API key for Google Gemini AI services | Yes |
| VITE_API_URL | The base URL for the backend API | Yes |
| GEMINI_API_KEY | Server-side API key for Google Gemini AI | Yes |

### 📁 Project Structure

```
.
├── backend/                  # Backend application source
│   ├── src/                  # Server logic and entry point
│   ├── scripts/              # Internal utility and test scripts
│   ├── supabase/             # Database configuration and migrations
│   └── database.sqlite       # Local database storage
├── src/                      # Frontend React application
│   ├── components/           # UI components
│   ├── hooks/                # Custom React logic
│   ├── lib/                  # Utility functions and API clients
│   └── main.tsx              # Application entry point
├── package.json              # Project dependencies and scripts
├── tailwind.config.js        # UI styling configuration
└── tsconfig.json             # TypeScript compiler settings
```

### 💻 Usage

**Development Mode**
Run the server with hot-reloading:
```bash
tsx watch src/server.ts
```

**Build for Production**
Compile TypeScript to JavaScript:
```bash
tsc
```

**Production Start**
Launch the compiled server:
```bash
node dist/server.js
```

### 🧪 Running Tests

Execute the test suite using the internal testing script:
```bash
tsx scripts/test.ts
```

### 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Ensure all new features include corresponding TypeScript types and pass the existing test suite.

### 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.