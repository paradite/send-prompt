# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

send-prompt is a unified TypeScript library for AI model interactions with standardized interfaces and function calling. It provides a single `sendPrompt` function that works across multiple AI providers (OpenAI, Anthropic, Google, DeepSeek, Fireworks, XAI, OpenRouter, Azure OpenAI, and custom providers) with consistent input/output formats.

## Development Commands

- **Build**: `npm run build` or `npm run compile` - Uses tsup to compile TypeScript to both ESM and CommonJS formats
- **Test**: `npm test` - Runs Jest tests with ESM support (requires `NODE_OPTIONS="--experimental-vm-modules"`)
- **Test (CI)**: `npm run test:ci` - Runs tests in silent mode for CI environments
- **Pre-publish**: `npm run prepublishOnly` - Cleans dist folder and rebuilds before publishing

## Architecture Overview

### Core Structure
- **Main entry**: `src/index.ts` - Contains the primary `sendPrompt` function and all type definitions
- **Utilities**: `src/utils/` - Helper functions for image processing and reasoning extraction
- **Tests**: `src/tests/` - Comprehensive test suite covering all providers and features

### Key Architectural Patterns

1. **Provider Abstraction**: The library uses a unified interface where each provider (OpenAI, Anthropic, Google, etc.) is handled through a common `sendPrompt` function, with provider-specific transformations handled internally.

2. **Message Transformation**: Messages are transformed to each provider's specific format via `transformMessagesForProvider()` function which converts between standardized input format and provider-specific formats (OpenAI, Anthropic, Google).

3. **Response Standardization**: All provider responses are transformed to a consistent `StandardizedResponse` format with fields: `message`, `tool_calls`, `usage`, `reasoning`, and `durationMs`.

4. **Type Safety**: Extensive TypeScript types for messages, provider options, and responses ensure type safety across all providers.

### Provider Support

- **First-party providers**: OpenAI, Anthropic, Google (with direct API keys)
- **Third-party providers**: OpenRouter, Fireworks, DeepSeek, XAI (with custom base URLs)
- **Enterprise providers**: Azure OpenAI, Google Vertex AI
- **Custom providers**: Any OpenAI-compatible API

### Special Features

- **Streaming**: Supported across all providers with unified callback interface
- **Function calling**: Standardized tool/function calling interface that works with all compatible providers
- **Image input**: Support for base64 and URL image formats
- **Multi-round conversations**: Special handling for Google's function calling flow
- **Reasoning extraction**: Support for models that provide reasoning (like DeepSeek and XAI's Grok models)

## Key Implementation Details

- Uses ESM modules with Jest configured for ESM support
- TypeScript with strict type checking enabled
- Provider-specific SDK usage (OpenAI SDK, Anthropic SDK, Google GenAI SDK)
- Handles provider-specific quirks (like Anthropic's required max_tokens, Google's function calling format)
- Comprehensive error handling and response transformation