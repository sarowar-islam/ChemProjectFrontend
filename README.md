# Research Hub

A modern academic research portal built with React, TypeScript, and Spring Boot.

## Features

- **Team Directory** - Browse and search team members with their research interests and publications
- **Publications** - Automatic Google Scholar integration for fetching latest publications
- **Projects** - Showcase ongoing and completed research projects
- **Notices & Announcements** - Keep up with the latest news and events
- **Admin Dashboard** - Manage team members, projects, and site settings
- **Member Dashboard** - Team members can manage their profiles
- **Responsive Design** - Fully optimized for mobile, tablet, and desktop devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Spring Boot (Java)
- **Deployment**: Netlify (Frontend) + Your preferred backend hosting

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- Spring Boot backend running

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/research-hub.git
cd research-hub
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your backend API URL:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Run the development server:

```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   ├── layout/    # Layout components (Header, Footer)
│   └── auth/      # Authentication components
├── contexts/      # React contexts (Auth)
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and API client
├── pages/         # Page components
└── services/      # API service layer
```

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Build settings are auto-configured via `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard:
   - `VITE_API_BASE_URL` - Your production backend API URL

### Environment Variables

| Variable            | Description          | Required |
| ------------------- | -------------------- | -------- |
| `VITE_API_BASE_URL` | Backend API base URL | Yes      |

## Available Routes

- `/` - Home page
- `/team` - Team directory
- `/publications` - Research publications
- `/projects` - Research projects
- `/news` - News articles
- `/notices` - Announcements
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard (protected)
- `/teamlogin` - Team member login
- `/member/dashboard` - Member dashboard (protected)
- `/member/profile` - Member profile (protected)

## License

This project is licensed under the MIT License.
