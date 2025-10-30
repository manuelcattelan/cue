package config

import (
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

const (
	ConfigDirectoryName = "cue"
	ConfigFileName      = "config"
	ConfigFileType      = "yaml"
)

func GetConfigDirectory() (string, error) {
	userConfigDirectory, userConfigDirectoryError := os.UserConfigDir()
	if userConfigDirectoryError != nil {
		return "", userConfigDirectoryError
	}

	return filepath.Join(userConfigDirectory, ConfigDirectoryName), nil
}

func GetDefaultConfigFilePath() (string, error) {
	configDirectory, configDirectoryError := GetConfigDirectory()
	if configDirectoryError != nil {
		return "", configDirectoryError
	}

	return filepath.Join(configDirectory, ConfigFileName+"."+ConfigFileType), nil
}

func GetConfigFilePath() (string, error) {
	configFile := viper.ConfigFileUsed()
	if configFile == "" {
		return GetDefaultConfigFilePath()
	}

	return configFile, nil
}

func WriteConfig(keys []string) (string, error) {
	configFile, configFileError := GetConfigFilePath()
	if configFileError != nil {
		return "", configFileError
	}

	configFileError = os.MkdirAll(filepath.Dir(configFile), 0755)
	if configFileError != nil {
		return "", configFileError
	}

	configWriter := viper.New()
	configWriter.SetConfigFile(configFile)
	configWriter.SetConfigType(ConfigFileType)

	_ = configWriter.ReadInConfig()
	for _, configKey := range keys {
		if viper.IsSet(configKey) {
			configWriter.Set(configKey, viper.Get(configKey))
		}
	}

	configFileError = configWriter.WriteConfigAs(configFile)
	if configFileError != nil {
		return "", configFileError
	}

	return configFile, nil
}
