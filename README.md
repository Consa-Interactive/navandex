# Navand Express

A modern e-commerce platform built with Next.js 14, Tailwind CSS, and Prisma.

## Features

- 🔐 Phone number-based authentication
- 📱 Responsive dashboard for order management
- 🎨 Modern UI with dark mode support
- 🔄 Real-time order tracking
- 👤 User profiles and settings
- 🌙 Dark mode support
- 📊 Order statistics and analytics

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT, Cookies
- **State Management:** React Context
- **UI Components:** Lucide Icons, Headless UI

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/navand-express.git
cd navand-express
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/navand"
JWT_SECRET="your-secret-key"
```

5. Run database migrations:

```bash
pnpm prisma migrate dev
```

6. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
navand-express/
├── client/                # Frontend application
│   ├── app/              # Next.js 14 app directory
│   ├── components/       # Reusable components
│   ├── providers/        # Context providers
│   └── public/           # Static assets
├── server/               # Backend application
│   ├── prisma/          # Database schema and migrations
│   └── src/             # Server source code
└── shared/              # Shared types and utilities
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm prisma:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@consainteractive.com or join our Slack channel.
