package cmd

import (
	"os"

	"github.com/spf13/cobra"
)

var rootCommand = &cobra.Command{
	Use:   "cue",
	Short: "CLI-first tool that generates LLM-ready prompts optimized to get the most out of your agentic buddy.",
}

func Execute() {
	err := rootCommand.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {}
