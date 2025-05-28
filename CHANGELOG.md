# Changelog 📝

All notable changes to [send-prompt](https://github.com/paradite/send-prompt).

## [2.3.0] - 2025-05-28

### New Features ✨

- Support for streaming responses across all providers
- Added `stream` parameter in prompt options to enable real-time content streaming
- Added `onStreamingContent` callback function to handle streaming content chunks
- Complete response is still returned at the end with usage statistics and duration

### Limitations ⚠️

- Streaming cannot be used with function calling (`tools` parameter)

## [2.2.1] - 2025-05-28

### New Features ✨

- Support for optional `temperature` parameter in prompt options
- Temperature parameter is supported across all providers (OpenAI, Anthropic, Google, OpenRouter, Fireworks, DeepSeek, Azure OpenAI, and custom providers)
- Temperature ranges from 0 to 2, where lower values make output more focused and deterministic, while higher values make it more random and creative
- Added comprehensive tests for temperature parameter with major providers

## [2.1.3] - 2025-05-20

### New Features ✨

- Support for `usage.thoughtsTokens` in response for OpenRouter

## [2.1.2] - 2025-05-17

### New Features ✨

- Support for image input
- Image input is supported in OpenAI, Anthropic, Google, and OpenRouter providers
- Support for Azure OpenAI provider
- Support for `anthropicMaxTokens` in prompt options
- Support for automatic reasoning extraction for DeepSeek, OpenRouter, and Fireworks
- Support for `usage` in response
- Support for `durationMs` in response

### Bug Fixes 🐛

- Fixed Azure OpenAI model type to be string

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
