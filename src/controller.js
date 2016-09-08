let ipkg     = require('./ipkg/ipkg')
let commands = require('./idris/commands')
let vscode   = require('vscode')

let getCommands = () => {
  return [
    ['idris.typecheck', runCommand(commands.typecheckFile)],
    ['idris.typeof', runCommand(commands.typeForWord)],
    ['idris.docsfor', runCommand(commands.docsForWord)]
  ]
}

let runCommand = (command) => {
  return (_) => {
    let root = vscode.workspace.rootPath
    let compilerOptions = ipkg.compilerOptions(root)
    let uri = vscode.window.activeTextEditor.document.uri.path

    compilerOptions.subscribe((compilerOptions) => {
      commands.initialize(compilerOptions)
      command(uri)
    })
  }
}

module.exports = {
  getCommands,
  destroy: commands.destroy,
  diagnosticCollection: commands.diagnosticCollection
}
