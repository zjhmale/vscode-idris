const ipkg = require('../ipkg/ipkg')
const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const common = require('../analysis/common')

let identList

let buildCompletionList = () => {
  let uri = vscode.window.activeTextEditor.document.uri.fsPath
  identList = common.getIdents(uri)
}

let IdrisCompletionProvider = (function () {
  function IdrisCompletionProvider() { }

  IdrisCompletionProvider.prototype.provideCompletionItems = (document, position, token) => {
    let wordRange = document.getWordRangeAtPosition(position)
    let currentWord = document.getText(wordRange)

    let trimmedPrefix = currentWord.trim()

    if (trimmedPrefix.length >= 2) {
      let suggestMode = vscode.workspace.getConfiguration('idris').get('suggestMode')

      if (suggestMode == 'allWords') {
        return identList.filter((ident) => {
          return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
        }).map((ident) => {
          return new vscode.CompletionItem(ident, 0)
        })
      } else if (suggestMode == 'replCompletion') {
        return controller.getCompilerOptsPromise().flatMap((compilerOptions) => {
          commands.initialize(compilerOptions)
          return commands.getModel().load(document.uri.fsPath).filter((arg) => {
            return arg.responseType === 'return'
          }).flatMap(() => {
            return commands.getModel().replCompletions(trimmedPrefix)
          })
        }).toPromise().then((arg) => {
          let ref = arg.msg[0][0]
          let results = ref.map((v, i, arr) => {
            return new vscode.CompletionItem(v, 1)
          })
          return results
        })
      } else {
        vscode.window.showErrorMessage("Invalid option for idris.suggestMode")
        return null
      }
    } else {
      return null
    }
  }
  return IdrisCompletionProvider
}())

module.exports = {
  IdrisCompletionProvider,
  buildCompletionList
}
