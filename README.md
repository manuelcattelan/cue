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

## Usage

Example configuration:

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
