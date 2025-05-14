# Changelog 📝

All notable changes to [send-prompt](https://github.com/paradite/send-prompt).

## [2.0.0] - 2025-05-14

### New Features ✨

- Support for tool calling with OpenRouter
- Support for DeepSeek provider

### Breaking Changes 💥

- 📝 Separate input parameters into `promptOptions` (`PromptOptions`) and `providerOptions` (`ProviderOptions`) for better TypeScript support
- 📝 Differentiate between `model` (Enum) and `customModel` (string) in `SendPromptOptions` for better TypeScript support

## [1.0.11] - 2025-05-14

### New Features ✨

- Support for Google Vertex AI provider
- Support for Fireworks AI provider
- Support for OpenRouter provider
- Support for custom providers with OpenAI-compatible API

### Improvements 🔧

- 📝 TypeScript type errors and improvements
