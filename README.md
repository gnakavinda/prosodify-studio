# 🎙️ Prosodify Studio

> Professional Text-to-Speech Generator with Azure AI Integration & User Authentication

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/gnakavinda/prosodify-studio)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://prosodify-studio.vercel.app)
[![Backend API](https://img.shields.io/badge/backend-azure-blue)](https://prosodify-api-v2.azurewebsites.net)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, professional-grade text-to-speech application with full user authentication and usage tracking. Built with Next.js 14, TypeScript, and Tailwind CSS, powered by Azure Cognitive Services and a dedicated Node.js backend API.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure User Accounts** - Email/password registration and login
- **JWT Authentication** - Secure token-based authentication
- **Protected Routes** - Access control for authenticated users
- **Usage Tracking** - Real-time character usage monitoring
- **Subscription Management** - Free, Premium, and Enterprise plans

### 🎯 Core TTS Functionality
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

### 🎨 Modern Interface
- **Claude-Inspired Design** - Clean, modern authentication UI
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Real-time Feedback** - Live character counts, usage tracking, and status updates
- **Accessibility** - Keyboard navigation and screen reader support

## 🏗️ Architecture

### Full-Stack Application
- **Frontend**: Next.js 14 (React) - Deployed on Azure Static Web Apps
- **Backend**: Node.js Express API - Deployed on Azure App Service
- **Database**: Azure SQL Database with user management and usage tracking
- **Authentication**: JWT tokens with secure session management

### Backend API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification
- `GET /api/dashboard` - User dashboard data
- `POST /api/text-to-speech` - TTS generation with usage tracking
- `GET /api/voices` - Available voices from Azure

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Git
- Backend API running (or use production: `https://prosodify-api-v2.azurewebsites.net`)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/gnakavinda/prosodify-studio.git
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
   
   Add your backend API URL to `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://prosodify-api-v2.azurewebsites.net
   # Or for local backend development:
   # NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Create an account**
   - Click "Sign In" to open the authentication modal
   - Register a new account or login with existing credentials
   - Start generating text-to-speech audio!

## 🛠️ Tech Stack

### Frontend (This Repository)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context + Hooks
- **Authentication**: JWT token management
- **Theme**: Dark/Light mode support

### Backend (Separate Repository)
- **Runtime**: Node.js + Express
- **Database**: Azure SQL Database
- **Authentication**: JWT + bcrypt
- **Speech Service**: Azure Cognitive Services
- **Deployment**: Azure App Service
- **CORS**: Configured for frontend domain

### Deployment
- **Frontend**: Azure Static Web Apps
- **Backend**: Azure App Service
- **Database**: Azure SQL Database
- **CDN**: Azure CDN
- **Domain**: Custom domain support

## 📦 Project Structure

```
prosodify-studio/
├── app/                          # Next.js 14 app directory
│   ├── components/              # Reusable UI components
│   │   ├── AuthModal.tsx       # Claude-inspired authentication UI
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── UserHeader.tsx      # User info and theme toggle
│   │   ├── ThemeToggle.tsx     # Dark/light mode switcher
│   │   ├── VoiceSettings.tsx   # Voice selection and filtering
│   │   └── AudioFileManager.tsx # Audio file management
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── services/               # API service layers
│   │   └── ttsService.ts       # TTS API communication
│   ├── globals.css            # Global styles with dark mode
│   ├── layout.tsx             # Root layout with auth provider
│   └── page.tsx               # Main application (protected)
├── public/                     # Static assets
├── types/                      # TypeScript type definitions
└── README.md                   # This file
```

## 🔐 Authentication Flow

### User Registration
1. User fills registration form (name, email, password)
2. Frontend sends request to `/api/auth/register`
3. Backend creates user account with hashed password
4. JWT token returned and stored in localStorage
5. User redirected to main application

### User Login
1. User enters credentials in login form
2. Frontend sends request to `/api/auth/login`
3. Backend verifies credentials and returns JWT token
4. Token stored locally and used for subsequent requests
5. User gains access to protected routes

### Protected Routes
- All main application routes require authentication
- JWT token automatically sent with API requests
- Token expiration handled gracefully with re-authentication

## 📊 Usage Tracking

### Subscription Plans
| Plan | Monthly Characters | Price | Features |
|------|-------------------|-------|----------|
| **Free** | 10,000 | $0 | Basic TTS, Standard voices |
| **Premium** | 100,000 | $19/mo | Neural voices, All styles |
| **Enterprise** | 1,000,000 | $99/mo | Priority support, API access |

### Usage Monitoring
- Real-time character counting
- Monthly usage limits enforcement
- Usage reset on billing cycle
- Visual progress indicators

## 🌐 Backend Integration

### API Communication
- All TTS generation routed through backend API
- User authentication required for all operations
- Usage tracking integrated with each generation
- Error handling for network issues and API limits

### Data Flow
1. **Frontend** → User inputs text and voice settings
2. **Frontend** → Sends authenticated request to backend
3. **Backend** → Validates user and checks usage limits
4. **Backend** → Calls Azure Speech Service
5. **Backend** → Updates usage tracking in database
6. **Backend** → Returns audio data to frontend
7. **Frontend** → Plays audio and updates UI

## 🎨 UI/UX Features

### Authentication Experience
- **Claude-inspired design** with two-panel layout
- **Smooth animations** and transitions
- **Real-time form validation** with helpful error messages
- **Google Sign-In ready** (placeholder for future implementation)

### Main Application
- **Clean header** with user info and theme toggle
- **Tabbed interface** for voice settings and audio management
- **Responsive design** adapting to all screen sizes
- **Loading states** and error handling throughout

### Theme Support
- **System preference detection** on first visit
- **Persistent theme choice** saved to localStorage
- **Smooth transitions** between light and dark modes
- **Complete theme coverage** across all components

## 🚀 Deployment

### Automatic Deployment
- **Frontend**: Automatically deploys to Azure Static Web Apps on push to main
- **Backend**: Deployed separately on Azure App Service
- **Database**: Azure SQL Database with automated backups

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Azure Static Web Apps**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

3. **Configure Custom Domain** (Optional)
   - Add CNAME record pointing to Azure endpoint
   - Configure SSL certificate

## 💰 Pricing & Usage

### Azure Speech Service Costs
- **Neural voices**: $16 per 1M characters  
- **Standard voices**: $4 per 1M characters
- **Free tier**: 5M characters/month for neural voices

### User-Facing Pricing
- **Free Plan**: 10,000 characters/month ($0)
- **Premium Plan**: 100,000 characters/month ($19)
- **Enterprise Plan**: 1,000,000 characters/month ($99)

### Cost Efficiency
- **Average article (1000 chars)**: Uses 1% of free plan
- **Long content (5000 chars)**: Uses 5% of free plan
- **Very accessible** for most users

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test authentication flow thoroughly** 
5. **Submit a pull request**

### Code Style

- **ESLint**: Follow the included configuration
- **Prettier**: Format code automatically
- **TypeScript**: Use proper typing throughout
- **Components**: Keep components focused and reusable
- **Authentication**: Always test login/logout flows

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Run all checks
npm run check-all
```

### Authentication Testing
- Test user registration with various inputs
- Verify login/logout functionality
- Check protected route access control
- Test usage tracking and limits

## 📋 Roadmap

### Version 2.0 (Q2 2025) ✅ **COMPLETED**
- [x] **User Authentication** - Account management and JWT security
- [x] **Usage Tracking** - Real-time character counting and limits
- [x] **Backend Integration** - Dedicated API with database
- [x] **Modern UI** - Claude-inspired design with dark mode

### Version 2.1 (Q3 2025)
- [ ] **Google OAuth** - Social login integration
- [ ] **Password Reset** - Email-based password recovery
- [ ] **User Profiles** - Avatar upload and profile management
- [ ] **Audio History** - Permanent storage of generated audio
- [ ] **Subscription Management** - Stripe integration for payments

### Version 2.2 (Q4 2025)
- [ ] **SSML Editor** - Advanced markup editing with live preview
- [ ] **Voice Favorites** - Save and organize preferred voices
- [ ] **Batch Processing** - Upload documents for processing
- [ ] **Team Collaboration** - Shared workspaces and permissions

### Version 3.0 (Q1 2026)
- [ ] **Multi-language Support** - Beyond English voices
- [ ] **Voice Cloning** - Custom voice training
- [ ] **API Access** - Developer API with rate limiting
- [ ] **Real-time Streaming** - Live voice generation
- [ ] **Mobile Apps** - iOS and Android applications

## 🔒 Security

### Authentication Security
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token generation and validation
- **CORS Protection**: Configured for frontend domain only
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks

### Data Protection
- **Encrypted Storage**: Passwords never stored in plain text
- **Secure Transmission**: HTTPS for all API communication
- **Token Expiration**: Automatic logout on token expiry
- **Privacy First**: Minimal data collection and retention

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Azure Cognitive Services** - Powering the speech synthesis
- **Azure Cloud Platform** - Hosting backend and database
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Beautiful utility-first CSS framework
- **Lucide** - Clean and consistent icons
- **Claude AI** - Design inspiration for authentication UI

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/gnakavinda/prosodify-studio/wiki)
- **Email**: support@prosodify.com
- **GitHub Issues**: [Create an issue](https://github.com/gnakavinda/prosodify-studio/issues)
- **Frontend Demo**: [Live Application](https://prosodify-studio.vercel.app)
- **Backend API**: [API Status](https://prosodify-api-v2.azurewebsites.net/api/health)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=gnakavinda/prosodify-studio&type=Date)](https://star-history.com/#gnakavinda/prosodify-studio&Date)

---

<div align="center">

**Made with ❤️ by [Kavinda Madushan](https://github.com/gnakavinda)**

[Website](https://prosodify.com) • [Demo](https://app.prosodify.com) • [Backend API](https://prosodify-api-v2.azurewebsites.net)

**Full-Stack • Authenticated • Production-Ready**

</div>