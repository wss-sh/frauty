# Frauty - Website Safety Checker Extension

<div align="center">
  <img src="extension/icons/icon128.png" alt="Frauty Logo" width="128" height="128">
  <h3>Protect yourself from online fraud with advanced website safety checks</h3>
</div>

## 🚀 Features

- **Real-time Safety Checks**: Get instant domain safety scores while browsing
- **Comprehensive Analysis**: Evaluates DNS security, SSL certificates, domain age, and more
- **Blacklist Detection**: Cross-references domains with known scam databases
- **Community Trust Ratings**: Benefit from aggregated user experiences
- **Privacy First**: Your browsing data stays private and secure

## 📦 Installation

### Chrome Web Store (Recommended)
The easiest way to install Frauty is through the [Chrome Web Store](https://chrome.google.com/webstore/detail/frauty).

### Manual Installation (Latest Build)
1. Download the latest build from our [releases page](https://github.com/wss-sh/frauty/releases)
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Drag and drop the downloaded `.zip` file into the extensions page

### Development Build
```bash
# Clone the repository
git clone https://github.com/wss-sh/frauty.git

# Install dependencies
cd frauty
npm install

# Build the extension
npm run build

# The built extension will be in the dist/ directory
```

## 🛠️ Development

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Setup
```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure
```
frauty/
├── extension/           # Extension source code
│   ├── background.js   # Background script
│   ├── popup/          # Popup UI components
│   ├── content/        # Content scripts
│   └── icons/          # Extension icons
├── dist/               # Built extension files
├── tests/              # Test files
└── scripts/            # Build and utility scripts
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy

Frauty takes your privacy seriously. We don't collect any personal browsing data. All domain checks are done through secure API calls, and no personally identifiable information is ever stored. See our [Privacy Policy](https://frauty.com/legal/privacy) for more details.

## 📫 Contact

- Website: [frauty.com](https://frauty.com)
- Email: support@frauty.com
- Twitter: [@frauty](https://twitter.com/frauty)

## ⭐ Support

If you find Frauty useful, please consider giving us a star on GitHub! It helps others discover the project. 
