# Timeo

A modern web-based time tracking and calendar application with offline support and dark mode.

## Features

- 📅 **Interactive Calendar** – Day, month, and year views
- ⏱️ **Time Tracking** – Detailed hour and time entries
- 🌙 **Dark Mode** – Automatic theme switching with system settings
- 💾 **Offline Support** – Data stored locally (IndexedDB & SQLite)
- 🔄 **Data Synchronization** – Import/Export functionality
- 📊 **Statistics** – KPI overviews and visualizations
- 🎨 **Modern UI** – Responsive design with SVG icons
- ⚡ **Fast Performance** – Vite-based build pipeline

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS with CSS variables, Sass
- **Database**:
  - SQLite (sql.js) for structured data
  - Dexie + IndexedDB for offline sync
- **UI Components**: Custom React components
- **Package Manager**: npm

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/timecal.git
cd timecal/timecal-vite

# Install dependencies
npm install

# Start development server
npm run dev
```

The server will be available at `http://localhost:5173`

## Usage

### Development

```bash
# Development server with Hot Module Replacement
npm run dev

# Check code quality
npm run lint

# Production build
npm run build

# Preview the production build
npm run preview
```

### Folder Structure

```
timecal-vite/
├── src/
│   ├── App.tsx              # Main component
│   ├── db.ts                # Database logic
│   ├── types.ts             # TypeScript definitions
│   ├── styles.css           # Global styles + theming
│   ├── styles.scss          # Sass stylesheets
│   ├── main.tsx             # App entry point
│   ├── restore.js           # Restore functionality
│   └── assets/              # SVG icons & assets
├── public/                  # Static assets
├── dist/                    # Production build output
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Features in Detail

### Calendar Views

- **Year View**: Quick overview of all months
- **Month View**: Detailed day entries and statistics
- **Day View**: Full time tracking and notes

### Time Tracking

- Enter and save hours
- Categorization (vacation, sick leave, holidays, etc.)
- Automatic calculation of expected vs. actual hours

### Data Management

- **Backup** – Export data
- **Restore** – Import data
- **Synchronization** – Automatically save offline changes
- **LocalStorage + IndexedDB** – Redundant storage

### Dark Mode

- Automatic adaptation to system settings
- Manual switching with theme toggle
- CSS filter-based icon color switching

## Development Tips

### Code Formatting

```bash
npm run lint  # Display ESLint errors
```

### TypeScript Compilation

```bash
npm run build  # Check TypeScript + build with Vite
```

### Assets/Icons

SVG icons are located in `src/assets/`. They are automatically imported into TypeScript and rendered as `<img>` tags with CSS classes:

- `.svg-icon-sm` – 16px (buttons)
- `.svg-icon-md` – 20px (header)
- `.svg-icon-lg` – 28px (breadcrumb)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Code splitting via Vite
- CSS filters instead of React SVG components (better performance)
- IndexedDB + SQLite hybrid for fast database access
- Service Worker for offline support

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/MyFeature`)
3. Commit your changes (`git commit -m 'Add MyFeature'`)
4. Push to the branch (`git push origin feature/MyFeature`)
5. Open a pull request

### Code Standards

- Use TypeScript for type safety
- Follow ESLint rules
- Component-based structure
- Meaningful commit messages

## Roadmap

- Online sync (planned): integrate a PostgreSQL-backed server API to provide centralized storage and multi-device synchronization.
  - Backend: Node.js + Express (or similar) with PostgreSQL
  - Sync strategy: server-side REST API with conflict resolution and optional background sync
  - Timeline: planning and PoC -> backend API -> secure auth and sync -> migration tool for existing local DBs
  - Notes: local IndexedDB/SQLite will remain the primary offline store; online sync will be opt-in.

## Author

Christopher Schick

---

**Note**: This is a Progressive Web App with offline functionality. First use or after cache clearing may take a moment while the IndexedDB database is initialized.
# timeo-workinghours
