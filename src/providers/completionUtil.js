const common = require('../analysis/common')
const vscode = require('vscode')

let getModuleNameCompletionItems = (trimmedPrefix) => {
  let moduleNames = common.getAllModuleName()

  let moduleItems = moduleNames.filter((ident) => {
    return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
  }).map((ident) => {
    return new vscode.CompletionItem(ident, 8)
  })

  return moduleItems
}

module.exports = {
  getModuleNameCompletionItems
}