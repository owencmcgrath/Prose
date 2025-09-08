# App Template

A modern React application template with Tailwind CSS, dark mode support, and production-ready configuration.

## Features

- ⚡ **Vite** - Lightning fast development
- ⚛️ **React 19** - Latest React version
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Responsive** - Mobile-first design
- 🚀 **Production Ready** - Express server included

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens the app at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Production Server

```bash
npm start
```

Runs the Express server on port 8080

## Project Structure

```
app-template/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   │   ├── layout/  # Layout components
│   │   └── ui/      # UI components
│   ├── contexts/    # React contexts
│   ├── pages/       # Page components
│   ├── styles/      # CSS files
│   ├── App.jsx      # Main app component
│   └── main.jsx     # Entry point
├── server.js        # Express server
└── vite.config.js   # Vite configuration
```

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Fonts

The template uses Inter for body text and JetBrains Mono for code. Update the font imports in `src/styles/index.css` to change them.

## License

MIT