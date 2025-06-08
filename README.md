# 🎙️ Prosodify Studio

> Professional Text-to-Speech Generator with Azure AI Integration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/prosodify-studio)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://prosodify-studio.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, professional-grade text-to-speech application that leverages Azure Cognitive Services to generate high-quality audio from text. Built with Next.js 14, TypeScript, and Tailwind CSS.

![Prosodify Studio Screenshot](https://via.placeholder.com/800x400/1e40af/ffffff?text=Prosodify+Studio+Interface)

## ✨ Features

### 🎯 Core Functionality
- **Professional TTS Generation** - Convert text to high-quality MP3 audio
- **Real-time Audio Preview** - Test voice settings before generating full audio
- **247+ Neural Voices** - Access to Azure's complete English voice library
- **Advanced Voice Controls** - Precise control over speech rate, pitch, and volume
- **Style & Emotion Support** - Cheerful, sad, excited, and 15+ other voice styles

### 🔍 Smart Voice Discovery
- **Real-time Search** - Find voices instantly by name or characteristics
- **Language Filtering** - Filter by English variants (US, UK, AU, CA, etc.)
- **Gender Filtering** - Browse male and female voices separately
- **Dynamic Style Loading** - See available styles for each voice automatically

### 📁 Audio Management
- **Audio File Manager** - Organize and manage generated audio files
- **Preview vs Full Audio** - Clear distinction between test and production files
- **One-click Downloads** - Instant MP3 downloads with smart file naming
- **Batch Operations** - Clear all files or manage individual recordings

### 🎨 Professional Interface
- **Modern Design** - Clean, gradient-based UI with Tailwind CSS
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback** - Live character counts, cost estimation, and status updates
- **Accessibility** - Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Azure Cognitive Services Speech API key
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prosodify-studio.git
   cd prosodify-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Azure credentials to `.env.local`:
   ```env
   AZURE_SPEECH_KEY=your_azure_speech_key_here
   AZURE_SPEECH_REGION=your_azure_region
   AZURE_SPEECH_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **API Routes**: Next.js API Routes
- **Speech Service**: Azure Cognitive Services
- **Audio Processing**: Web Audio API
- **File Handling**: Blob API

### Deployment
- **Platform**: Vercel (recommended)
- **Database**: None required (stateless)
- **CDN**: Vercel Edge Network
- **Domain**: Custom domain support

## 📦 Project Structure

```
prosodify-studio/
├── app/                          # Next.js 14 app directory
│   ├── components/              # Reusable UI components
│   │   ├── VoiceSettings.tsx   # Voice selection and filtering
│   │   └── AudioFileManager.tsx # Audio file management
│   ├── api/                    # API routes
│   │   ├── voices/             # Azure voices endpoint
│   │   └── text-to-speech/     # TTS generation endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application page
├── public/                     # Static assets
├── types/                      # TypeScript type definitions
└── README.md                   # Project documentation
```

## 🎛️ API Endpoints

### GET /api/voices
Fetches available voices from Azure Speech Service

**Response:**
```json
{
  "success": true,
  "voices": [...],
  "groupedByLocale": {...},
  "totalCount": 247,
  "totalStyles": 15
}
```

### POST /api/text-to-speech
Generates audio from text using specified voice parameters

**Request:**
```json
{
  "text": "Hello, world!",
  "voice": "en-US-JennyNeural", 
  "style": "cheerful",
  "rate": 1.0,
  "pitch": 1.0,
  "volume": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_mp3_data",
  "format": "mp3"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZURE_SPEECH_KEY` | Azure Speech Service API key | `abc123...` |
| `AZURE_SPEECH_REGION` | Azure region | `eastus` |
| `AZURE_SPEECH_ENDPOINT` | Azure endpoint URL | `https://eastus.api.cognitive.microsoft.com/` |

### Voice Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `rate` | 0.5x - 3.0x | 1.0x | Speech speed |
| `pitch` | 0.5x - 1.5x | 1.0x | Voice pitch |
| `volume` | 0.2x - 1.5x | 1.0x | Audio volume |
| `style` | varies | default | Voice emotion/style |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect GitHub repository**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/prosodify-studio)

2. **Add environment variables** in Vercel dashboard
3. **Deploy automatically** on every push

### Deploy to Other Platforms

- **Netlify**: `npm run build && npm run export`
- **Azure Static Web Apps**: Direct GitHub integration
- **AWS Amplify**: Connect repository and deploy

## 💰 Pricing & Usage

### Azure Speech Service Costs
- **Standard voices**: $4 per 1M characters
- **Neural voices**: $16 per 1M characters  
- **Free tier**: 5M characters/month for neural voices

### Estimated Costs for Users
- **Average article (1000 chars)**: ~$0.016
- **Long content (5000 chars)**: ~$0.08
- **Very cost-effective** for most use cases

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly** 
5. **Submit a pull request**

### Code Style

- **ESLint**: Follow the included configuration
- **Prettier**: Format code automatically
- **TypeScript**: Use proper typing throughout
- **Components**: Keep components focused and reusable

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run all checks
npm run check-all
```

## 📋 Roadmap

### Version 2.0 (Q2 2025)
- [ ] **User Authentication** - Account management and history
- [ ] **Subscription Plans** - Monthly/yearly pricing tiers
- [ ] **Voice Cloning** - Custom voice training
- [ ] **SSML Editor** - Advanced markup editing
- [ ] **API Access** - Developer API with rate limiting

### Version 2.1 (Q3 2025)
- [ ] **Multi-language Support** - Beyond English voices
- [ ] **Batch Processing** - Upload documents for processing
- [ ] **Team Collaboration** - Shared workspaces
- [ ] **Advanced Analytics** - Usage tracking and insights

### Version 3.0 (Q4 2025)
- [ ] **Real-time Streaming** - Live voice generation
- [ ] **Voice Mixing** - Combine multiple voices
- [ ] **AI Voice Enhancement** - Automatic quality improvement
- [ ] **Mobile Apps** - iOS and Android applications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Azure Cognitive Services** - Powering the speech synthesis
- **Vercel** - Providing excellent hosting platform
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Beautiful utility-first CSS framework
- **Lucide** - Clean and consistent icons

## 📞 Support

- **Documentation**: [Link to docs]
- **Email**: support@prosodify.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/prosodify-studio/issues)
- **Discord**: [Join our community](https://discord.gg/prosodify)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/prosodify-studio&type=Date)](https://star-history.com/#yourusername/prosodify-studio&Date)

---

<div align="center">

**Made with ❤️ by [Your Name](https://github.com/yourusername)**

[Website](https://prosodify.com) • [Demo](https://app.prosodify.com) • [Documentation](https://docs.prosodify.com)

</div>
