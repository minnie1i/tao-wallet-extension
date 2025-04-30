# Chrome TAO Wallet Extension

A lightweight Chrome extension that serves as a crypto wallet for the Bittensor (TAO) network, supporting secure wallet creation and import with client-side encryption.

## 🌟 Features

- **Create Wallet**: Generate a new sr25519 keypair with a 12-word mnemonic phrase
- **Import Wallet**: Restore your wallet using an existing mnemonic
- **Strong Encryption**: Client-side AES-GCM encryption using the Web Crypto API
- **Secure Storage**: Encrypted data stored locally with no server communication
- **Password Protection**: PBKDF2 key derivation with proper salting

## 📋 Requirements

- Chrome browser (version 88+)
- Node.js (v14+) and npm/yarn for development

## 🚀 Installation

### Developer Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/tao-wallet-extension.git
   cd tao-wallet-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `build` folder from the project directory

## 🔐 Security Model

The extension implements the following security measures:

- **Client-side only**: No server interaction, all operations happen locally
- **Password-based key derivation**: Using PBKDF2 with 100,000+ iterations
- **AES-GCM encryption**: Strong authenticated encryption for wallet data
- **No stored passwords**: Passwords are never saved, only used to derive encryption keys
- **Secure random generation**: Cryptographically secure random number generation for seeds

### Encryption Implementation

1. When a user sets a password:
   - A random 16-byte salt is generated
   - PBKDF2-SHA256 with 100,000 iterations derives a 256-bit key
   - The key is used only in memory for encryption/decryption

2. For wallet data encryption:
   - AES-GCM mode is used with a random 12-byte IV (nonce)
   - Encrypted data is stored along with the salt and IV (but never the password or key)

## 💻 Usage Guide

### Creating a New Wallet

1. Click the extension icon in Chrome
2. Select "Create New Wallet"
3. Set a strong password
4. Save your 12-word mnemonic phrase in a secure location
   - **Important**: This is your only recovery method!
5. Verify your mnemonic phrase
6. Your wallet is ready to use

### Importing an Existing Wallet

1. Click the extension icon in Chrome
2. Select "Import Wallet"
3. Enter your 12-word mnemonic phrase
4. Set a new password for local encryption
5. Your wallet will be restored

### Security Best Practices

- **Never share your mnemonic phrase** or password with anyone
- Store your mnemonic phrase securely offline (paper backup in a safe location)
- Use a strong, unique password for the wallet
- Always lock your wallet when not in use

## 🛠️ Developer Notes

### Project Structure

```
tao-wallet-extension/
├── src/
│   ├── background/    # Chrome extension background script
│   ├── components/    # UI components
│   ├── popup/         # Extension popup UI
│   └── utils/         # Helper utilities
├── public/            # Static assets
```

### Key Dependencies

- [@polkadot/util-crypto](https://github.com/polkadot-js/common/tree/master/packages/util-crypto) - Cryptographic utilities for Substrate-based chains
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Native browser cryptography

### Build Process

We use webpack for bundling the extension:

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Run tests
npm test
```

## 🧪 Testing

To test the extension:

1. Follow the Developer Installation steps above

2. Test the wallet creation flow:
   - Open the extension popup
   - Click "Create Wallet"
   - Set a password and follow the prompts

3. Test the wallet import flow:
   - Open the extension popup
   - Click "Import Wallet"
   - Enter the mnemonic phrase from a previously created wallet
   - Set a password

## 🤝 Contributing

Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Security Warnings

- This is a client-side wallet. Your security depends entirely on your password strength and mnemonic phrase protection.
- There is no "forgot password" option. If you lose your password AND mnemonic phrase, your funds will be permanently inaccessible.
- Always verify you're using the legitimate extension from a trusted source.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Bittensor](https://bittensor.com/) - The TAO network
- [Polkadot.js](https://polkadot.js.org/) - For cryptographic libraries

## Upcoming Development

### Architecture

- [ ] Set up TypeScript with appropriate configs

### Security
- [ ] Password strength validator
- [ ] Auto-Lock after configurable inactivity period (default: 5 minutes)
- [ ] Progressive delay after failed password attempts

### UI Design

- [ ] Copy-to-clipboard functionality for mnemonic
- [ ] Loading indicators
- [ ] User feedback improvision
- [ ] Dark/light mode support
- [ ] Animations for transitions
- [ ] Responsive design for different popup sizes