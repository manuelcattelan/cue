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

`cue` exposes a single MCP tool called `draft_prompt`.

### `draft_prompt`

This tool takes a task description and transforms it into a well-structured, optimized prompt by applying prompt engineering best practices. It supports iterative refinement through follow-up questions and it makes sure the relevant context from the current session is included in the payload to the server.

> [!NOTE]
> Since `draft_prompt` is exposed as a tool, there is no way to manually invoke it. The client LLM decides when to invoke it based on the tool description and other factors. If the client doesn't invoke it automatically, phrases like "Help me craft a prompt for..." or "Improve this prompt" will help trigger it more reliably.

#### Input parameters

| Parameter | Required | Description                                                                                                                                                                                                                          |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `task`    | Yes      | What the end user wants to accomplish: their goal or objective. It could be a rough idea or a detailed description.                                                                                                                  |
| `context` | Yes      | Any additional information that would help produce a more effective and accurate prompt, including but not limited to codebase files and their content, user-provided details other than the task description itself, MCP resources. |
| `answers` | No       | User-provided answers to follow-up questions from the previous tool iteration. It should be omitted on first invocation since the tool hasn't generated any questions at that point.                                                 |

#### Usage tips

- **Use a dedicated session for prompt crafting**: the iterative back-and-forth with `cue` may add unwanted noise to the conversation context and increase the context size itself. By crafting prompts in a separate session, you keep your main working conversation clean and focused.

- **Copy only the final prompt**: once you're satisfied with the generated prompt, copy it to a fresh session where the LLM can execute the task. This avoids polluting the working context with the prompt refinement history and ensures the LLM is focused on executing the required task.
