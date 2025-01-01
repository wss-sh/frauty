# Frauty Browser Extension

<div align="center">
  <img src="icons/icon128.png" alt="Frauty Logo" width="128" height="128">
  <h3>Browser extension for instant website safety checks</h3>
</div>

## Overview

Frauty is a browser extension that helps protect users from online fraud by providing real-time safety checks for websites. It analyzes various security aspects including DNS security, SSL certificates, domain age, and blacklist status to generate a comprehensive safety score.

## Features

- Real-time domain safety scoring
- SSL certificate verification
- Domain age checking
- Blacklist cross-referencing
- Community-driven trust ratings
- Instant visual warnings for suspicious sites

## Installation

### From Chrome Web Store
Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/frauty) and click "Add to Chrome"

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Development

The extension is built with vanilla JavaScript and uses the Chrome Extension APIs.

### Files
- `background.js` - Main background script for the extension
- `popup.js` - Handles the extension popup UI and interactions
- `popup.html` - Popup interface HTML
- `warning.js` - Manages warning banners for unsafe sites
- `exceptions.js` - Handles domain exceptions and whitelisting
- `manifest.json` - Extension configuration and permissions

### API Integration
The extension communicates with the Frauty API to retrieve domain safety scores. API documentation is available at [docs.frauty.com](https://docs.frauty.com).

## Contributing

If you'd like to contribute to the development of Frauty:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please ensure your code follows our style guidelines and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [Official Website](https://frauty.com)
- [Documentation](https://docs.frauty.com)
- [Support](mailto:support@frauty.com) 
