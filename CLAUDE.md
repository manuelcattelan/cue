# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL: Maintaining This File

**MANDATORY REQUIREMENT**: Whenever you add new functionalities, make architectural changes, or modify significant aspects of this repository, you MUST update this CLAUDE.md file to reflect those changes. This is not optional.

### Your Responsibilities
- **After implementing new features**: Add or update relevant sections describing the new functionality, its location, and how it integrates with existing code
- **After architectural changes**: Update the Architecture section to accurately reflect the current structure
- **After modifying configuration**: Update the Configuration Management section with new options, flags, or behavior
- **After changing development workflows**: Update the Development Commands or Development Guidelines sections accordingly
- **When information becomes obsolete**: Remove or rewrite outdated information that no longer accurately describes the codebase

### How to Update
1. Before completing any substantial task, review this entire file
2. Identify sections that are now outdated or incomplete due to your changes
3. Update those sections with accurate, current information
4. Add new sections if you've introduced entirely new concepts or subsystems
5. Ensure the information is clear, concise, and helpful for future interactions

**The goal**: This file should always provide an accurate, current snapshot of the project so that you (Claude) can work effectively with the codebase in future sessions. Outdated or incomplete information here directly reduces your effectiveness.

## Project Overview

`cue` is a tool that allows to generate LLM-ready, effective prompts directly from the CLI.

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
- Command execution starts in the `Execute()` function in `cmd/root.go`
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
Configuration is initialized in the `PersistentPreRunE` hook of the root command in `cmd/root.go`:
- Sets environment variable prefix to "CUE" with `viper.SetEnvPrefix()`
- Enables automatic environment variable reading with `viper.AutomaticEnv()`
- Loads config from YAML file if found (non-fatal if missing)
- Binds command-line flags to Viper configuration

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
