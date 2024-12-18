# Speech to Text Application

A cross-platform speech-to-text application built with Electron and Python, supporting real-time transcription and batch processing.

## Features

- Real-time speech-to-text transcription
- Offline batch processing of audio files
- Support for online/offline speech models
- Speaker diarization support
- RAG-enhanced smart summarization
- Cross-platform support (Windows & macOS)

## System Requirements

- Node.js 16+
- Python 3.8+
- 8GB+ RAM
- NVIDIA GPU (recommended but not required)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/speech-to-text-app.git
cd speech-to-text-app
```

2. Install dependencies:

For Node.js dependencies:
```bash
npm install
```

For Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the application:

In development mode (requires three terminal windows):

Terminal 1 (Python backend):
```bash
npm run start-api
```

Terminal 2 (Vite dev server):
```bash
npm run dev
```

Terminal 3 (Electron app):
```bash
npm run electron:dev
```

For production:
```bash
npm run build:electron
npm start
```

## Development

### Project Structure

```
speech-to-text-app/
├── src/
│   ├── main/           # Electron main process
│   ├── renderer/       # React frontend
│   └── python/         # Python backend
├── dist/               # Built files
└── scripts/           # Build and start scripts
```

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build the React frontend
- `npm run build:electron` - Build the Electron app
- `npm run start-api` - Start the Python backend
- `npm run electron:dev` - Start Electron in development mode

## Troubleshooting

Common issues:

1. WebSocket Connection Error:
   - Make sure the Python backend is running (`npm run start-api`)
   - Check if port 8000 is available

2. Build Errors:
   - Clear the dist directory: `npm run build:electron`
   - Make sure all dependencies are installed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
