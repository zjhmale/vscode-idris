const common = require('../../analysis/common')
const completionUtil = require('../completionUtil')
const vscode = require('vscode')

let identList

let buildCompletionList = () => {
  let uri = vscode.window.activeTextEditor.document.uri.fsPath
  identList = common.getIdents(uri)
}

let IPKGCompletionProvider = (function () {
  function IPKGCompletionProvider() { }

  IPKGCompletionProvider.prototype.provideCompletionItems = (document, position, _token) => {
    let wordRange = document.getWordRangeAtPosition(position, /(\\)?'?\w+(\.\w+)?'?/i)
    let currentWord = document.getText(wordRange).trim()

    let trimmedPrefix = currentWord.trim()

    if (trimmedPrefix.length >= 2) {
      let identItems = identList.filter((ident) => {
        return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
      }).map((ident) => {
        return new vscode.CompletionItem(ident, 0)
      })
      return identItems
        .concat(completionUtil.ipkgKeywordCompletionItems(trimmedPrefix))
        .concat(completionUtil.getModuleNameCompletionItems(trimmedPrefix))
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
