# Local AI Navigator 🚀

Local AI Navigator is an AI-powered navigation assistant designed to help users discover and explore places using modern AI technologies.

The project combines location-based services, AI recommendations, and an interactive interface to create a smarter way of finding useful places around you.

## ✨ Features

- 🤖 AI-powered place recommendations
- 📍 Location-based navigation
- 🗺️ Explore nearby places
- 💬 Interactive AI assistant
- 📱 Telegram Mini App integration
- 🔎 Smart search and discovery experience

## 🛠️ Tech Stack

- **Frontend:** React / Next.js
- **Backend:** Node.js
- **AI Integration**
- **Telegram Mini Apps API**
- **Location Services**
- **Turborepo Monorepo**

## 📂 Project Structure

```
Local-Ai-Navigator/
│
├── apps/
│   └── miniapp/
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── pages/          # Application pages
│       │   ├── services/       # API and external services
│       │   ├── utils/          # Helper functions
│       │   └── styles/         # Global styles
│       │
│       ├── public/             # Static assets
│       ├── package.json        # Mini app dependencies
│       └── README.md
│
├── packages/
│   └── shared/                 # Shared code and utilities
│
├── .gitignore
├── package.json                # Root project configuration
├── turbo.json                  # Turborepo configuration
└── README.md
```

## 📁 Folder Description

| Folder | Description |
|--------|-------------|
| `apps/miniapp` | Main Telegram Mini App application |
| `src/components` | Reusable UI components |
| `src/hooks` | Custom React hooks and application logic |
| `src/services` | API communication and external services |
| `src/utils` | Helper functions and utilities |
| `packages/shared` | Shared code between applications |
| `public` | Static assets such as images and icons |

## Screenshots

![Home](screenshots/home.png)

![Telegram](screenshots/telegram.png)