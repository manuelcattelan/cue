import fs from "fs";
import path from "path";

function getDirectoryFilesRecursive(
  currentDirectory: string,
  initialDirectory: string,
): string[] {
  const directoryFiles: string[] = [];

  try {
    const dirents = fs.readdirSync(currentDirectory, { withFileTypes: true });

    for (const dirent of dirents) {
      const direntFullPath = path.join(currentDirectory, dirent.name);
      const direntRelativePath = path.relative(
        initialDirectory,
        direntFullPath,
      );

      if (dirent.isDirectory()) {
        directoryFiles.push(
          ...getDirectoryFilesRecursive(direntFullPath, initialDirectory),
        );
      } else if (dirent.isFile()) {
        directoryFiles.push(direntRelativePath);
      }
    }
  } catch {
    /* tslint:disable:no-empty */
  }

  return directoryFiles;
}

export function getDirectoryFiles(directory: string): string[] {
  return getDirectoryFilesRecursive(directory, directory);
}

export function getContextFilesPaths(input: string): string[] {
  const matchPattern = /@([^\s\n]+)/g;
  const matches = input.matchAll(matchPattern);

  return Array.from(matches)
    .map((match) => match[1])
    .filter((path): path is string => path !== undefined);
}

export function readContextFileContent(contextFilePath: string): string | null {
  try {
    return fs.readFileSync(contextFilePath, "utf-8");
  } catch {
    return null;
  }
}
