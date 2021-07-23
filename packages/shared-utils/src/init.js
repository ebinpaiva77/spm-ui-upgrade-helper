const { createGitRepo, commitFiles } = require("./gitUtils");
const { removeOutputFolder, globAllFiles, copyFilesToOutputFolder, flipToOutputFiles } = require("./filesAndFolders");
const { removeIgnoredFiles } = require("./removeIgnoredFiles");

/**
 * The init step will wipe the output folder, create a git repo, glob up the input files, remove any
 * ignored files from the list, copy the files to the output folder, commit them, then add the
 * resulting file paths to the config object
 *
 * Tools MUST call the following code in their `execute` method:
 * ```
 * const execute = overrides => {
 *   const config = { ...utils.loadConfig(), ...overrides };
 *   utils.init(config);
 * ```
 * This way when a tool is run independently it will do all the setup itself, but when it is called
 * via the main tool the `init` code will be skipped, because the main tool has done it already.
 *
 * @param {*} config configuration object
 */
const init = config => {
  if(config.skipInit) {
    console.info("Skipping init step");
    return;
  }

  // Turn off info messages (typically used during unit tests)
  if(config.quiet) {
    console.info = () => {};
  }

  // Turn off debug messages by default
  if(!config.debug) {
    console.debug = () => {};
  }
  
  // Remove "./" paths as they will cause problems later when trying to ignore files
  config.inputFolder = config.inputFolder.startsWith("./")
    ? config.inputFolder.substring(2)
    : config.inputFolder;
  config.outputFolder = config.outputFolder.startsWith("./")
    ? config.outputFolder.substring(2)
    : config.outputFolder;

  console.info("Initializing output folder");
  removeOutputFolder(config);
  createGitRepo(config);
  let inputFiles = globAllFiles(config);
  inputFiles = removeIgnoredFiles(config, inputFiles);
  copyFilesToOutputFolder(config, inputFiles);
  commitFiles(config.outputFolder, "Initial commit");
  let files = flipToOutputFiles(config, inputFiles);
  config.files = files;
}

module.exports = { init };
