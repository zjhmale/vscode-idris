const vscode = require('vscode')
const controller = require('./controller')
const completion = require('./providers/idris/completionProvider')
const hover = require('./providers/idris/hoverProvider')
const definition = require('./providers/idris/definitionProvider')
const documentSymbol = require('./providers/idris/documentSymbolProvider')
const workspaceSymbol = require('./providers/idris/workspaceSymbolProvider')
const reference = require('./providers/idris/referenceProvider')
const rename = require('./providers/idris/renameProvider')

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
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(controller.IDRIS_MODE, new completion.IdrisCompletionProvider(), ...triggers))
  context.subscriptions.push(vscode.languages.registerHoverProvider(controller.IDRIS_MODE, new hover.IdrisHoverProvider()))
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(controller.IDRIS_MODE, new definition.IdrisDefinitionProvider()))
  context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(controller.IDRIS_MODE, new documentSymbol.IdrisDocumentSymbolProvider()))
  context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new workspaceSymbol.IdrisWorkspaceSymbolProvider()))
  context.subscriptions.push(vscode.languages.registerReferenceProvider(controller.IDRIS_MODE, new reference.IdrisReferenceProvider()))
  context.subscriptions.push(vscode.languages.registerRenameProvider(controller.IDRIS_MODE, new rename.IdrisRenameProvider()))
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
    controller.typeCheckOnSave()
    completion.buildCompletionList()
  }))
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
    let newIdrisExecutablePath = vscode.workspace.getConfiguration('idris').get('executablePath')
    if (idrisExecutablePath != newIdrisExecutablePath) {
      idrisExecutablePath = newIdrisExecutablePath
      controller.reInitialize()
    }
  }))
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
    completion.buildCompletionList()
  }))
  completion.buildCompletionList()
}
exports.activate = activate

function deactivate() {
  controller.destroy(false)
}
exports.deactivate = deactivate
