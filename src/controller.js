let ipkg     = require('./ipkg/ipkg')
let commands = require('./idris/commands')
let vscode   = require('vscode')

let getCommands = () => {
  return [
    ['idris.typecheck', runCommand(commands.typecheckFile)],
    ['idris.type-of', runCommand(commands.typeForWord)],
    ['idris.docs-for', runCommand(commands.docsForWord)],
    ['idris.print-definition', runCommand(commands.printDefinition)],
    ['idris.run-repl', runCommand(commands.runREPL)]
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
