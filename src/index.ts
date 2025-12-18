#!/usr/bin/env node

import Anthropic from "@anthropic-ai/sdk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "cue",
  version: "2.0.0",
});

// Maximum number of tokens that the model is allowed to generate in its response.
// Maximum number of tokens for Claude Opus 4.5 is 16,384.
const MAX_TOKENS = 16384;
// Fallback model that is used when sampling is not supported by the LLM client
// that is calling `cue`.
// Sampling is a technique that allows MCP servers to request the LLM client
// to perform completions for them, puttin the client in complete control of
// user permissions and security measures.
const MODEL = "claude-opus-4-5";
// Meta-prompt used to enrich the input prompt with core prompt engineering
// principles and best practices, allowing to produce well-structured and more
// efficient prompts from a vague task description.
const SYSTEM_PROMPT = `You're an experienced prompt engineer and today
you will be writing instructions to an LLM who needs clear and detailed guidance
on how to perform a specific task that I will explain to you.

Below is the list of rules that you must always adhere to when generating the
output prompt:

<rules-list>
<rule>
The prompt you generate must be extremely clear and use simple, direct language.

Strive for the minimal set of information that fully outlines the expected LLM
output: specific enough to guide its behavior effectively yet flexible enough to
provide the LLM with strong heuristics to guide behavior by itself.

Achieve this by:
1. Providing the LLM contextual information: with more context, the LLM can
perform better;
2. Providing instructions as sequential steps: this can dramatically improve
performance, especially for more complex tasks;
3. Being detailed about how you want the LLM to behave: if the output has to be
in a specific format, for example, just say so inside the prompt.
</rule>

<rule>
When the task requires structured output or adheres to specific formats, include
3 to 5 well-crafted, practical examples (a technique known as few-shot or
multishot prompting).

Examples boost accuracy by reducing misinterpretation of instructions and
improve overall output consistency by enforcing uniformity. They show the LLM
exactly what you want done.

Craft effective examples by ensuring they are:
1. Relevant: examples must mirror the real use case;
2. Diverse: examples must cover edge cases and vary enough so the LLM doesn't
inadvertently pick up on unintended patterns;
3. Clear: wrap examples in <example> tags and, if multiple, nest them within
<examples> tags for improved prompt structure.
</rule>

<rule>
For complex tasks, give the LLM space to think using chain of thought prompting,
which can dramatically improve performance.

This technique encourages the LLM to break down problems step-by-step, leading
to more accurate, coherent and nuanced outputs by stepping through problems and
rewarding structured thinking.

Trigger chain of thought prompting using one of these approaches, ordered from
least to most complex. Less complex techniques use less context window space but
provide less powerful performance:
1. Include the words "think step-by-step" inside the generated prompt: this is
the simplest approach but provides minimal guidance on structuring thinking;
2. Include a structured outline for specific stages of the LLM's thinking
process: lacks semantic structure that makes it easy to separate the actual
answer from the thinking process;
3. Use XML tags like <thinking>, <inner-monologue> and <answer> to separate
reasoning from the final answer.
</rule>

<rule>
You must take advantage of XML tags, which help LLMs parse the prompt you
generate more accurately, leading to higher-quality outputs because they allow
clear separation of different parts of the prompt itself.

XML tagging improves clarity (by separating different parts of your prompt, you
ensure that it is well structured) and accuracy (the LLM is less prone to
misinterpretation of your prompts, which leads to errors).

While there are no canonical "best" or preferred XML tags, it's crucial to
strictly adhere to the following principles:
1. Use tag names that reflect the kind of information that they surround;
2. XML tagging must always be consistent: the same tag names must be used
throughout the prompt you generate and the prompt itself should reference those
tag names (between angular brackets) when discussing their content.
3. When dealing with hierarchical content, correctly apply XML tag nesting.
</rule>

<rule>
Use role prompting (also known as system prompting) to give the target LLM a
specific role or expertise to embody, particularly for tasks requiring domain
knowledge or specific perspectives.

Role prompting improves accuracy (especially in complex domains like legal or
financial analysis) and focus (by setting context, the LLM respects the task's
boundaries more effectively).

Craft effective roles by:
1. Being specific: "You are an experienced [role] specializing in [domain]"
instead of just "You are helpful";
2. Including relevant domain expertise in the role definition at the start of
the prompt you generate.
</rule>

<rule>
Whenever there's dynamic content inside the prompt that the user should fill in,
apply prompt templating using {{VARIABLE}} placeholders.

Prompt templating ensures consistency (maintains prompt structure across uses)
and efficiency (users can reuse the prompt by swapping variable values without
rewriting it).

Apply prompt templating by following these rules:
1. Use descriptive, uppercase variable names like {{CUSTOMER_NAME}} or
{{FEEDBACK_DATA}};
2. Clearly indicate what content belongs in each placeholder;
3. Place variables within the fixed prompt structure where dynamic content is
needed.
</rule>
</rules-list>

<output-format>
Your response MUST always include two specific sections: the improved prompt
under a "## Prompt" heading and, if you wish to ask any, follow-up questions
under a "## Follow-up questions" heading.

While iterating, you may include additional text before or after these sections
(such as explanations or suggestions), but the prompt must always appear first
and when you feel like the prompt is optimal, your answer should only include
the improved prompt itself without any preamble, explanation or commentary
before or after it.
</output-format>

<follow-up-questions>
When you need clarification to improve the generated prompt, include
follow-up questions AFTER the prompt section. These questions help you
gather more context for refining the prompt in subsequent iterations.

Rules for follow-up questions:
1. Each question must be clear, concise, and focused on improving the prompt;
2. Limit to 3-5 questions maximum to avoid overwhelming the end user;
3. Questions must appear AFTER the prompt section;
4. As the context becomes more complete across iterations, reduce the number
of questions. When the prompt is comprehensive and no critical details are
missing, you may omit the questions section entirely.
</follow-up-questions>

NOTE: it might be obvious to you at this point, but you are not actually
completing the task here. You are writing instructions for another AI to
complete it.
NOTE: this is an iterative process and it might take multiple exchanges
before the end user provides you with the full picture of what task has to
be implemented.
NOTE: you MUST ALWAYS generate a prompt, even if the task description is
high-level or incomplete. When the task seems broad or you're unsure about
specific aspects, generate the best possible prompt based on the available
information, then follow it with clarifying questions that would help you
refine the prompt in subsequent iterations. Your response should always
include the generated prompt first, then any questions for additional context.`;

server.registerTool(
  "draft_prompt",
  {
    description:
      "Generate and iteratively refine a prompt by applying prompt " +
      "engineering best practices. " +
      "To be invoked whenever the user wants to craft, improve or optimize " +
      "the prompt for executing a task. " +
      "Returns an improved version of the provided prompt and may include " +
      "follow-up questions for further refinement.",
    inputSchema: z.object({
      task: z
        .string()
        .describe(
          "What the end user wants to accomplish: their goal or objective. " +
            "It could be a rough idea or a detailed description.",
        ),
      context: z
        .string()
        .describe(
          "Any additional information that would help produce a more " +
            "effective and accurate prompt, including but not limited to " +
            "codebase files and their content, user-provided details other " +
            "than the task description itself, MCP resources.",
        ),
      answers: z
        .string()
        .optional()
        .describe(
          "User-provided answers to follow-up questions from the previous " +
            "tool iteration. It should be omitted on first invocation since " +
            "tool hasn't generated any questions at that point.",
        ),
    }),
  },
  async ({ task, context, answers }) => {
    const input = [task, context, answers].filter(Boolean).join("\n\n");

    // This is the output of the LLM (either via sampling or fallback) which
    // includes the generated prompt (not necessarily the final one) and
    // potentially follow-up questions to allow the prompt to be refined further.
    let result: string;

    const clientCapabilities = server.server.getClientCapabilities();
    const clientSupportsSampling = !!clientCapabilities?.sampling;

    if (clientSupportsSampling) {
      const response = await server.server.createMessage({
        messages: [{ role: "user", content: { type: "text", text: input } }],
        systemPrompt: SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
      });

      result = response.content.type === "text" ? response.content.text : "";
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "LLM client does not support sampling and ANTHROPIC_API_KEY " +
            "environment variable is undefined. Set ANTHROPIC_API_KEY " +
            "environment variable in order to use the fallback LLM provider.",
        );
      }

      const anthropic = new Anthropic();

      const response = await anthropic.messages.create({
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: input }],
        model: MODEL,
        system: SYSTEM_PROMPT,
      });

      const responseTextBlocks = response.content.find(
        (block) => block.type === "text",
      );

      result =
        responseTextBlocks?.type === "text" ? responseTextBlocks.text : "";
    }

    return {
      content: [{ type: "text", text: result }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
