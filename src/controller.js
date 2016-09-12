let ipkg     = require('./ipkg/ipkg')
let commands = require('./idris/commands')
let vscode   = require('vscode')

let getCommands = () => {
  return [
    ['idris.typecheck', runCommand(commands.typecheckFile)],
    ['idris.type-of', runCommand(commands.typeForWord)],
    ['idris.docs-for', runCommand(commands.docsForWord)],
    ['idris.print-definition', runCommand(commands.printDefinition)],
    ['idris.show-holes', runCommand(commands.showHoles)],
    ['idris.add-clause', runCommand(commands.addClause)],
    ['idris.case-split', runCommand(commands.caseSplit)],
    ['idris.proof-search', runCommand(commands.proofSearch)],
    ['idris.make-with', runCommand(commands.makeWith)],
    ['idris.make-case', runCommand(commands.makeCase)],
    ['idris.make-lemma', runCommand(commands.makeLemma)],
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
