let vscode     = require('vscode')
let ipkg       = require('./ipkg/ipkg')
let IdrisModel = require('./idris/model')

let model = null
let outputChannel = vscode.window.createOutputChannel('Idris')
let diagnosticCollection = vscode.languages.createDiagnosticCollection()

let getCommands = () => {
  return [
    ['idris.typecheck', typecheckFile],
    ['idris.typeof', typeForWord]
  ]
}

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  model.setCompilerOptions(compilerOptions);
}

let typecheckFile = () => {
  let root = vscode.workspace.rootPath
  let compilerOptions = ipkg.compilerOptions(root)
  compilerOptions.subscribe((compilerOptions) => {
    initialize(compilerOptions)
    let uri = vscode.window.activeTextEditor.document.uri.path
    let successHandler = (arg) => {
      outputChannel.clear()
      outputChannel.show()
      outputChannel.append("Idris: File loaded successfull")
      diagnosticCollection.clear()
    }
    new Promise((resolve, reject) => {
      model.load(uri).filter((arg) => {
        return arg.responseType === 'return'
      }).subscribe(successHandler, displayErrors)
      outputChannel.clear()
      outputChannel.show()
      outputChannel.append("loading...")
      resolve()
    }).then(function () {
    }).catch(function () {
    })
  })
}

let typeForWord = () => {
    let editor = vscode.window.activeTextEditor
    let document = editor.document
    let position = editor.selection.active
    let wordRange = document.getWordRangeAtPosition(position)
    let currentWord = document.getText(wordRange)
    if (currentWord.match(/\r|\n| /g)) {
      outputChannel.clear()
      vscode.window.showWarningMessage("Please move cursor to an Identifier")
      return
    }

    let root = vscode.workspace.rootPath
    let compilerOptions = ipkg.compilerOptions(root)
    compilerOptions.subscribe((compilerOptions) => {
      initialize(compilerOptions)
      let uri = vscode.window.activeTextEditor.document.uri.path
      let successHandler = (arg) => {
        let type = arg.msg[0]
        outputChannel.clear()
        outputChannel.show()
        outputChannel.appendLine('Idris: Type of ' + currentWord)
        outputChannel.append(type)
        diagnosticCollection.clear()
      }
      new Promise((resolve, reject) => {
        model.load(uri).filter((arg) => {
          return arg.responseType === 'return'
        }).flatMap(() => {
          return model.getType(currentWord)
        }).subscribe(successHandler, displayErrors)
        outputChannel.clear()
        outputChannel.show()
        outputChannel.append("loading...")
        resolve()
      }).then(function () {
      }).catch(function () {
      })
  })
}

let displayErrors = (err) => {
  outputChannel.clear()
  outputChannel.show()
  diagnosticCollection.clear()
  let buf = []
  let diagnostics = []
  let len = err.warnings.length
  buf.push("Errors (" + len + ")")
  err.warnings.forEach(function(w) {
    let file = w[0].replace("./", err.cwd + "/")
    let line = w[1][0]
    let char = w[1][1]
    let message = w[3]
    buf.push(file + ":" + line + ":" + char)
    buf.push(message)
    buf.push("")
    if (line > 0) {
      let range = new vscode.Range(line - 1, char - 1, line, 0)
      let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
      diagnostics.push([vscode.Uri.file(file), [diagnostic]])          
    }
  })
  outputChannel.appendLine(buf.join('\n'))
  diagnosticCollection.set(diagnostics)
}

module.exports = {
  getCommands,
  diagnosticCollection
}
