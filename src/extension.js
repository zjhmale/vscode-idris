let vscode = require('vscode')
let controller = require('./controller')
let completion = require('./providers/completionProvider')
let hover = require('./providers/hoverProvider')

let IDRIS_MODE = { language: 'idris', scheme: 'file' }

let idrisExecutablePath = vscode.workspace.getConfiguration('idris').get('executablePath');

var triggers = []
for (var i = 0; i < 26; i++) {
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

  context.subscriptions.push(controller.diagnosticCollection)
  controller.getCommands().forEach(([key, value]) => {
    let disposable = vscode.commands.registerCommand(key, value)
    context.subscriptions.push(disposable)
  })
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(IDRIS_MODE, new completion.IdrisCompletionProvider(), ...triggers))
  context.subscriptions.push(vscode.languages.registerHoverProvider(IDRIS_MODE, new hover.IdrisHoverProvider()))
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
  controller.destroy()
}
exports.deactivate = deactivate
