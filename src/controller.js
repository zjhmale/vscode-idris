const ipkg = require('./ipkg/ipkg')
const commands = require('./idris/commands')
const common = require('./analysis/common')
const vscode = require('vscode')
const fs = require('fs');

const IDRIS_MODE = [
  { language: 'idris', scheme: 'file' },
  { language: 'lidris', scheme: 'file' }
]

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
    ['idris.apropos', runCommand(commands.apropos)],
    ['idris.eval-selection', runCommand(commands.evalSelection)],
    ['idris.start-refresh-repl', runCommand(commands.startREPL)],
    ['idris.send-selection-repl', runCommand(commands.sendREPL)],
    ['idris.cleanup-ibc', runCommand(cleanupIbc)]
  ]
}

let cleanupIbc = (_) => {
  common.getAllFiles('ibc').forEach((file) => {
    fs.unlinkSync(file)
  })
}

let getCompilerOptsPromise = () => {
  let compilerOptions = ipkg.compilerOptions(common.getSafeRoot())
  return compilerOptions
}

let reInitialize = () => {
  getCompilerOptsPromise().subscribe((compilerOptions) => {
    commands.reInitialize(compilerOptions)
  })
}

let withCompilerOptions = (callback) => {
  let document = vscode.window.activeTextEditor.document
  if (!IDRIS_MODE.map((mode) => { return mode.language }).includes(document.languageId)) return
  let uri = document.uri.fsPath

  getCompilerOptsPromise().subscribe((compilerOptions) => {
    commands.initialize(compilerOptions)
    callback(uri)
  })
}

let typeCheckOnSave = () => {
  withCompilerOptions(commands.typecheckFile)
  withCompilerOptions(commands.buildIPKG)
  withCompilerOptions(commands.checkTotality)
}

let runCommand = (command) => {
  return (_) => {
    withCompilerOptions(command)
  }
}

module.exports = {
  getCommands,
  destroy: commands.destroy,
  tcDiagnosticCollection: commands.tcDiagnosticCollection,
  buildDiagnosticCollection: commands.buildDiagnosticCollection,
  nonTotalDiagnosticCollection: commands.nonTotalDiagnosticCollection,
  withCompilerOptions: withCompilerOptions,
  typeCheckOnSave: typeCheckOnSave,
  reInitialize: reInitialize,
  getCompilerOptsPromise: getCompilerOptsPromise,
  IDRIS_MODE: IDRIS_MODE
}
