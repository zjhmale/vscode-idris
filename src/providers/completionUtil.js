const common = require('../analysis/common')
const vscode = require('vscode')

let getModuleNameCompletionItems = (trimmedPrefix) => {
  let moduleItems = common.getAllModuleName().filter((ident) => {
    return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
  }).map((ident) => {
    return new vscode.CompletionItem(ident, 8)
  })

  return moduleItems
}

let idrisKeywordCompletionItems = (trimmedPrefix) => {
  let keywordItems = common.idrisKeywords.filter((ident) => {
    return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
  }).map((ident) => {
    return new vscode.CompletionItem(ident, 13)
  })

  return keywordItems
}

let ipkgKeywordCompletionItems = (trimmedPrefix) => {
  let keywordItems = common.ipkgKeywords.filter((ident) => {
    return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
  }).map((ident) => {
    return new vscode.CompletionItem(ident, 13)
  })

  return keywordItems
}

module.exports = {
  getModuleNameCompletionItems,
  idrisKeywordCompletionItems,
  ipkgKeywordCompletionItems
}