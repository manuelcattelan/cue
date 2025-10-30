# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`cue` is a tool that allows to generate LLM-ready, effective prompts directly from the CLI.

## Development Guidelines

### Code Quality Standards
- Write idiomatic Go code following language best practices and conventions
- Follow established patterns and best practices for all dependencies and libraries
- Use proper naming conventions (e.g., exported vs unexported identifiers, receiver names, etc.)
- Apply industry-standard design patterns where appropriate
- Prioritize code clarity and maintainability

### Organization and Structure
- Maintain a clean, organized folder structure with no unused files
- Write clear, readable code that prioritizes readability over performance optimizations
- Apply separation of concerns: keep distinct responsibilities in separate functions, files, and packages
- Keep files focused and cohesive in their purpose
- Remove dead code and unused imports

### Comments and Documentation
- Only write comments to explain WHY code exists or why a specific approach was chosen
- Do not write comments that simply describe WHAT the code does (the code itself should be self-documenting)
- Focus comments on rationale, context, trade-offs, and non-obvious decisions

### Code Formatting
- Follow Go's standard formatting using `gofmt` and `go fmt`
- Adhere to Go community conventions for code style and structure

### Implementation Philosophy
- Focus on correct, clean first implementations
- Avoid premature optimization and "nice-to-have" features
- Build for current requirements, not hypothetical future needs
- Refactor when actual needs emerge, not anticipated ones
