# cue

MCP server designed to front-load prompt engineering for agentic workflows.

## Installation

```bash
npm install -g @manuelcattelan/cue
# or
pnpm add -g @manuelcattelan/cue
# or
yarn global add @manuelcattelan/cue
```

## Configuration

Example JSON configuration:

> [!NOTE]
> The `env` field is only required if your client does not support MCP sampling as `cue` will fallback to using Anthropic models (specifically, `claude-opus-4-5`) in order to perform its task. You can generate a valid API key [here](https://console.anthropic.com/settings/keys).

```json
{
  "mcpServers": {
    "cue": {
      "command": "cue",
      "env": {
        "ANTHROPIC_API_KEY": "<your-anthropic-api-key>"
      }
    }
  }
}
```

> [!IMPORTANT]  
> Configuration may vary depending on the client, but any client that supports the MCP protocol should work. Refer to the documentation of your preferred client for more information.

## Usage

`cue` exposes a single MCP prompt called `improve_prompt`.

### `improve_prompt`

This prompt takes a vague task description and transforms it into a well-structured, optimized prompt by applying core prompt engineering principles.

#### Invocation

Refer to the documentation of your preferred client for details on how to invoke `improve_prompt`. Most clients that support MCP prompts allow you to reference them using a `/` prefix:

```
/cue:improve_prompt <prompt>
```

The output of the MCP server (the improved prompt) is automatically injected into your local conversation, ready for the LLM to execute.
