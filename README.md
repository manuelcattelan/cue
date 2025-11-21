# cue

Generate LLM-ready, effective prompts directly from your CLI.

`cue` is an AI-powered prompt engineering assistant that helps you craft high-quality, effective prompts for LLMs. It acts as an experienced prompt engineer, transforming your task descriptions into well-structured, comprehensive prompts that follow established patterns.

## Features

- **Intelligent prompt generation**: `cue` leverages prompt engineering best practices to produce an effective prompt for your LLM;
- **Interactive follow-up questions**: `cue` will ask clarifying questions to refine and improve the generated prompt;
- **File context integration**: you can easily include local files and directories into your input using the `@` syntax;
- **Copy-ready output**: you can easily export the generated prompt for use inside your LLM workflows.

## Prerequisites

- npm package manager
- [Anthropic API key](https://console.anthropic.com/)
  
## Installation

`cue` is available both inside the [npm registry](https://www.npmjs.com/package/@manuelcattelan/cue) and the [GitHub registry](https://github.com/manuelcattelan/cue/pkgs/npm/cue). You can install it globally with:

```bash
npm install -g @manuelcattelan/cue
```

## Configuration

Before running `cue`, you need to set up your Anthropic API key and the easiest way to do so is to append:

```bash
export CUE_PROVIDER_API_KEY=your_anthropic_api_key
```

to your shell configuration file (e.g. `.bashrc`, `.zshrc` or whatever gets loaded when you run your shell).
