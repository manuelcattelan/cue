# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`cue` is a CLI-first tool that generates LLM-ready prompts optimized to get the most out of your agentic buddy. The project is written in Go and uses the Cobra framework for CLI commands and Viper for configuration management.

## Development Commands

### Building
```bash
go build -o cue
```

### Running
```bash
./cue
# Or with go run
go run main.go
```

### Testing
```bash
# Run all tests
go test ./...

# Run tests with verbose output
go test -v ./...

# Run tests for a specific package
go test ./cmd

# Run a specific test
go test -run TestName ./...
```

### Dependencies
```bash
# Download dependencies
go mod download

# Tidy dependencies
go mod tidy
```

## Architecture

### Project Structure
- `main.go`: Entry point that calls `cmd.Execute()`
- `cmd/root.go`: Contains the root Cobra command and configuration initialization logic

### CLI Framework (Cobra)
The CLI is built using the Cobra framework:
- Root command is defined in `cmd/root.go` with the `rootCommand` variable
- Command execution starts in the `Execute()` function (cmd/root.go:27)
- New subcommands should be added to the `cmd/` package and registered in the `init()` function

### Configuration Management (Viper)
Configuration is managed through Viper with the following hierarchy:
1. **Environment variables**: Prefixed with `CUE_` (e.g., `CUE_ANTHROPIC_API_KEY`)
2. **Config file**: Searched in order:
   - File specified via `--config` flag
   - `./config.yaml` (current directory)
   - `$USER_CONFIG_DIR/cue/config.yaml` (platform-specific user config directory)
3. **Command-line flags**: Bound to Viper after parsing

#### Configuration Initialization
The `initializeConfig()` function (cmd/root.go:38) is called in the `PersistentPreRunE` hook of the root command:
- Sets environment variable prefix to "CUE"
- Replaces `.` and `-`with `*` in environment variable names
- Loads config from YAML file if found (non-fatal if missing)
- Binds command-line flags to Viper

#### Adding New Configuration
To add new configuration options:
1. Define flags in the appropriate command's `init()` function
2. Access values via `viper.GetString()`, `viper.GetInt()`, etc.
3. Environment variables will automatically work with `CUE_` prefix
4. Config file keys should match the flag names (in snake_case or kebab-case)

### Key Dependencies
- `github.com/spf13/cobra`: CLI framework
- `github.com/spf13/viper`: Configuration management
- Go version: 1.25.3

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
