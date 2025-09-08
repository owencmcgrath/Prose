# Prose

A minimalist Markdown editor designed for focused writing with AI-powered assistance and real-time preview capabilities.

## Features

### Core Functionality
- **Clean Markdown Editor** - Distraction-free writing environment with auto-resizing text area
- **Real-time Preview** - Toggle between edit and preview modes with live Markdown rendering
- **Document Management** - Create, save, rename, and delete documents with SQLite storage
- **Auto-save** - Automatic document saving after 3 seconds of inactivity
- **Dark/Light Mode** - System-responsive theme with manual toggle
- **Rich Text Toolbar** - Quick formatting buttons for common Markdown elements

### AI Integration
- **Writing Suggestions** - Generate AI-powered improvements for your content
- **Interactive Q&A** - Ask questions about your document and get contextual answers
- **OpenAI Integration** - Uses GPT-3.5-turbo for intelligent writing assistance

### Technical Features
- **Responsive Design** - Optimized for desktop writing workflows
- **Syntax Highlighting** - Code blocks with highlight.js support
- **GitHub Flavored Markdown** - Full GFM support including tables, strikethrough, and more
- **Document Persistence** - SQLite database with automatic backups to localStorage

## Technology Stack

- **Frontend**: React 19 with React Router v7
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite with hot module replacement
- **Backend**: Express.js server with REST API
- **Database**: Better SQLite3 for document storage
- **Markdown**: react-markdown with remark-gfm and rehype-highlight
- **AI**: OpenAI GPT-3.5-turbo integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nathan-a-king/Prose.git
   cd Prose
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional)**
   ```bash
   # Create .env file for OpenAI integration
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   *Note: If not provided, the app will prompt for the API key when using AI features*

4. **Start development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```
   Production server runs on `http://localhost:8080`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm start` | Run Express production server |

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── layout/Layout.jsx          # Main layout wrapper
│   └── ui/ThemeToggle.jsx         # Dark/light mode toggle
├── contexts/
│   └── ThemeContext.jsx           # Theme state management
├── pages/
│   └── HomePage.jsx               # Main editor interface
├── services/
│   └── documentApi.js             # API client for documents
├── styles/
│   ├── index.css                  # Global styles
│   └── editor.css                 # Editor-specific styles
├── App.jsx                        # Root component with routing
└── main.jsx                       # Application entry point
```

### Backend Structure
```
├── server.js                      # Express server with API routes
├── database.js                    # SQLite database setup and operations
└── build/                         # Production build output
```

### Key Features Implementation

- **Document Management**: SQLite database with prepared statements for performance
- **Real-time Autosave**: React useEffect with debounced saving
- **AI Integration**: Direct OpenAI API calls with error handling
- **Markdown Rendering**: ReactMarkdown with custom components for styling
- **Theme System**: React Context with localStorage persistence
- **Responsive Layout**: CSS-in-JS with Tailwind for consistent styling

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/documents` | Get all documents |
| `GET` | `/api/documents/:id` | Get specific document |
| `POST` | `/api/documents` | Create new document |
| `PUT` | `/api/documents/:id` | Update document |
| `DELETE` | `/api/documents/:id` | Delete document |

## Configuration

### Vite Configuration
- Development server on port 3000
- API proxy to backend on port 8080
- Optimized builds with vendor/router code splitting

### Tailwind Customization
- Custom color palette (primary blue shades)
- Avenir/Avenir Next font stack
- Custom animations (fade-in, slide-up)
- Dark mode via class strategy

## AI Features Setup

The AI features require an OpenAI API key. You can provide it in three ways:

1. **Environment Variable** (recommended)
   ```bash
   VITE_OPENAI_API_KEY=your_key_here
   ```

2. **Runtime Prompt** - The app will ask for your key when first using AI features

3. **localStorage** - Your key is saved locally after first use for convenience

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React 19 and modern web technologies
- Markdown rendering powered by react-markdown
- Code highlighting by highlight.js
- AI features powered by OpenAI GPT-3.5-turbo
- Styled with Tailwind CSS custom design system