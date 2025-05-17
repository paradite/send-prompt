# Changelog 📝

All notable changes to [send-prompt](https://github.com/paradite/send-prompt).

## [2.1.0] - 2025-05-18

### New Features ✨

- Support for image input in messages for OpenAI, Anthropic, and Google providers

## [2.0.4] - 2025-05-17

### New Features ✨

- Make `durationMs` mandatory type in response

## [2.0.3] - 2025-05-17

### New Features ✨

- Support for Azure OpenAI provider
- Support for `anthropicMaxTokens` in prompt options

## [2.0.2] - 2025-05-17

### New Features ✨

- Support for reasoning extraction for DeepSeek via `reasoning` in response
- Support for `usage` in response
- Support for `durationMs` in response

## [2.0.1] - 2025-05-14

### New Features ✨

- Support for `headers` in provider options

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
