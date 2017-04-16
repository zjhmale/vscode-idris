const vscode = require('vscode')
const controller = require('./controller')
const idrisCompletion = require('./providers/idris/completionProvider')
const idrisHover = require('./providers/idris/hoverProvider')
const idrisDefinition = require('./providers/idris/definitionProvider')
const idrisDocumentSymbol = require('./providers/idris/documentSymbolProvider')
const idrisWorkspaceSymbol = require('./providers/idris/workspaceSymbolProvider')
const idrisReference = require('./providers/idris/referenceProvider')
const idrisRename = require('./providers/idris/renameProvider')
const ipkgDefinition = require('./providers/ipkg/definitionProvider')
const ipkgCompletion = require('./providers/ipkg/completionProvider')

let idrisExecutablePath = vscode.workspace.getConfiguration('idris').get('executablePath');

let triggers = []
for (let i = 0; i < 26; i++) {
  triggers.push(String.fromCharCode(97 + i))
  triggers.push(String.fromCharCode(65 + i))
}

function activate(context) {
  vscode.languages.setLanguageConfiguration("idris", {
    indentationRules: {
      decreaseIndentPattern: /[}][ \t]*$/m,
      increaseIndentPattern: /((\b(if\b.*|then|else|do|of|let|in|where))|=|->|>>=|>=>|=<<|(^(data)( |\t)+(\w|')+( |\t)*))( |\t)*$/
    }
  })

  context.subscriptions.push(controller.tcDiagnosticCollection)
  context.subscriptions.push(controller.buildDiagnosticCollection)
  context.subscriptions.push(controller.nonTotalDiagnosticCollection)
  controller.getCommands().forEach(([key, value]) => {
    let disposable = vscode.commands.registerCommand(key, value)
    context.subscriptions.push(disposable)
  })
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(controller.IDRIS_MODE, new idrisCompletion.IdrisCompletionProvider(), ...triggers))
  context.subscriptions.push(vscode.languages.registerHoverProvider(controller.IDRIS_MODE, new idrisHover.IdrisHoverProvider()))
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(controller.IDRIS_MODE, new idrisDefinition.IdrisDefinitionProvider()))
  context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(controller.IDRIS_MODE, new idrisDocumentSymbol.IdrisDocumentSymbolProvider()))
  context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new idrisWorkspaceSymbol.IdrisWorkspaceSymbolProvider()))
  context.subscriptions.push(vscode.languages.registerReferenceProvider(controller.IDRIS_MODE, new idrisReference.IdrisReferenceProvider()))
  context.subscriptions.push(vscode.languages.registerRenameProvider(controller.IDRIS_MODE, new idrisRename.IdrisRenameProvider()))
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(controller.IPKG_MODE, new ipkgDefinition.IPKGDefinitionProvider()))
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(controller.IPKG_MODE, new ipkgCompletion.IPKGCompletionProvider(), ...triggers))
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
    controller.typeCheckOnSave()
    idrisCompletion.buildCompletionList()
    ipkgCompletion.buildCompletionList()
  }))
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
    let newIdrisExecutablePath = vscode.workspace.getConfiguration('idris').get('executablePath')
    if (idrisExecutablePath != newIdrisExecutablePath) {
      idrisExecutablePath = newIdrisExecutablePath
      controller.reInitialize()
    }
  }))
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
    idrisCompletion.buildCompletionList()
    ipkgCompletion.buildCompletionList()
  }))
  idrisCompletion.buildCompletionList()
  ipkgCompletion.buildCompletionList()
}
exports.activate = activate

function deactivate() {
  controller.destroy(false)
}
exports.deactivate = deactivate
