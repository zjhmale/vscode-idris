const common = require('../../analysis/common')
const vscode = require('vscode')

let identList

let buildCompletionList = () => {
  let uri = vscode.window.activeTextEditor.document.uri.fsPath
  identList = common.getIdents(uri)
}

let IPKGCompletionProvider = (function () {
  function IPKGCompletionProvider() { }

  let moduleNames = common.getAllModuleName()

  IPKGCompletionProvider.prototype.provideCompletionItems = (document, position, token) => {
    let wordRange = document.getWordRangeAtPosition(position, /(\\)?'?\w+(\.\w+)?'?/i)
    let currentWord = document.getText(wordRange).trim()

    let trimmedPrefix = currentWord.trim()

    if (trimmedPrefix.length >= 2) {
      let suggestionItems = identList.concat(moduleNames).filter((ident) => {
        return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
      }).map((ident) => {
        return new vscode.CompletionItem(ident, 0)
      })
      return suggestionItems
    } else {
      return null
    }
  }
  return IPKGCompletionProvider
}())

module.exports = {
  IPKGCompletionProvider,
  buildCompletionList
}
