# UCSC.app

Born out of a Cruzhacks 2025 project, UCSC.app is a responsive, full-stack application for students that aggregates campus dining menus, news feeds, course information, events, and location data to help UCSC students navigate campus life efficiently.

## Features

- Class search
  - Add classes to your calendar with one click
- Dining Hall Menus
- News Feed
- Schedule Map
	- Interactive campus map that shows what classes take place in a building

## Getting Started

### Prerequisites
- Node.js and pnpm
- Python 3.8+ and uv

### Frontend Setup

1. Navigate to the project root and install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm run dev
```

3. Build for production:
```bash
pnpm build
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
uv sync
```

3. Run the development server:
```bash
uv run uvicorn server:api --reload --host 0.0.0.0
```

## Project Structure

```
ucsc.app/
├── src/                # Frontend React application
│   ├── common/           # Reusable UI components for all pages
│   ├── courses/          # Course search and display
│   ├── dashboard/        # Dashboard page
│   ├── menu/             # Dining menu pages
│   ├── news/             # News feed pages
│   ├── schedules/        # Schedule and map pages
│   ├── utils/            # Utility functions (schema, etc.)
│   └── hooks/            # Custom React hooks
└─ backend/             # FastAPI backend
   ├── endpoints/         # API route handlers
   ├── locations/         # Location and building data
   └── cache/             # Cached data
```