# Context Manager - Multi-Model AI Chat Shell

A sophisticated frontend application for managing conversations across multiple LLM providers (OpenAI, Anthropic, Google). This is the **Shell** component—a polished UI that handles all user interactions, API calls, and manual context management, leaving intelligent automation for future "Core" systems.

## Features

- **Multi-Model Support**: Seamlessly switch between GPT-4, Claude, and Gemini models
- **Conversation Management**: Create, load, and delete conversations with full history
- **Manual Context Controls**: 
  - Summarize conversations
  - Start fresh with summaries
  - Export conversations as JSON
- **Token Tracking**: Visual progress bar showing context window usage
- **Beautiful UI**: Dark theme with smooth animations using Framer Motion
- **Local Storage**: All data persists in your browser
- **Markdown Support**: Rich text rendering with syntax highlighting

## Tech Stack

- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **react-markdown** with syntax highlighting
- **shadcn/ui** components

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Configuration

### API Keys

1. Click the settings icon in the top-right corner
2. Enter your API keys:
   - **OpenAI**: For GPT models (get from [OpenAI Platform](https://platform.openai.com/api-keys))
   - **Anthropic**: For Claude models (get from [Anthropic Console](https://console.anthropic.com/))
   - **Google**: For Gemini models (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

Your API keys are stored locally in your browser's localStorage and are never sent anywhere except directly to the respective AI provider's API.

### Environment Variables (Optional)

For development, you can create a `.env.local` file:

```env
# Not required - keys can be set in UI
VITE_OPENAI_API_KEY=your_key_here
VITE_ANTHROPIC_API_KEY=your_key_here
VITE_GOOGLE_API_KEY=your_key_here
```

## Usage

### Starting a Conversation

1. Click "New Conversation" in the sidebar
2. Select your preferred model from the dropdown
3. Type your message and press Enter (Shift+Enter for new line)

### Managing Context

- **Token Usage**: Monitor the progress bar in the bottom panel
- **Summarize**: Generate a summary of the current conversation
- **Fresh Start**: Create a new conversation that includes the summary as context
- **Export**: Download the conversation as a JSON file

### Switching Models

You can switch models mid-conversation. The app will warn you that different models may respond differently to the same context.

## Project Structure

```
src/
├── components/       # React components
│   ├── ChatView.tsx      # Main chat display
│   ├── Sidebar.tsx       # Conversation list
│   ├── Message.tsx       # Individual message
│   ├── InputBox.tsx      # Message input
│   ├── ContextPanel.tsx  # Context controls
│   ├── ModelSwitcher.tsx # Model selection
│   └── SettingsModal.tsx # API configuration
├── services/         # API and storage services
│   ├── api.ts           # Multi-model API wrapper
│   └── storage.ts       # LocalStorage utilities
├── hooks/           # Custom React hooks
│   └── useAppState.ts   # Main state management
├── types/           # TypeScript definitions
│   └── index.ts
└── App.tsx          # Main application
```

## Architecture: Shell vs Core

This application is built as the **Shell**—the user-facing interface and basic plumbing. It intentionally does NOT include:

- Automatic context summarization
- Intelligent message pruning
- Vector search or RAG
- Quality metrics or AI-driven optimizations

These features belong to the **Core**—a separate system that will provide intelligent automation. The Shell provides manual controls that the Core can eventually trigger automatically.

## Available Models

### OpenAI
- GPT-4 (8K context)
- GPT-4 Turbo (128K context)
- GPT-3.5 Turbo (16K context)

### Anthropic
- Claude 3 Opus (200K context)
- Claude 3 Sonnet (200K context)
- Claude 3.5 Sonnet (200K context)

### Google
- Gemini Pro (32K context)

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## License

MIT

## Contributing

This is the Shell component. Contributions should focus on UI/UX improvements, additional manual controls, or bug fixes. Do not add intelligent automation—that belongs in the Core system.
