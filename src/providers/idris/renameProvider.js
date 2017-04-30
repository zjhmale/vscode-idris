const commands = require('../../idris/commands')
const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')
const _ = require('lodash')

let IdrisRenameProvider = (function () {
  function IdrisRenameProvider() { }

  IdrisRenameProvider.prototype.provideRenameEdits = function (document, position, newName, _token) {
    let [currentWord, _wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    let currentWordDef = findDefinition.findDefinitionInFiles(currentWord, document.uri.fsPath)

    return new Promise((resolve, _reject) => {
      let uniIdents = common.getAllIdents()
      let positions = uniIdents.filter(({ name, uri }) => {
        if (name == currentWord) {
          let def = findDefinition.findDefinitionInFiles(name, uri)
          if (def == undefined) {
            return false
          } else {
            return common.isDefinitonEqual(currentWordDef, def)
          }
        } else {
          return false
        }
      }).map(({ name, uri }) => {
        return common.getAllPositions(name, uri)
      })
      let uniPositions = _.uniqWith(_.flatten(positions), _.isEqual)
      let workspaceEdit = new vscode.WorkspaceEdit()
      uniPositions.forEach(({ uri, line, column }) => {
        let startPos = new vscode.Position(line, column)
        let endPos = new vscode.Position(line, column + currentWord.length)
        let range = new vscode.Range(startPos, endPos)
        let fileUri = vscode.Uri.file(uri)
        workspaceEdit.replace(fileUri, range, newName)
      })
      resolve(workspaceEdit)
    })
  }
  return IdrisRenameProvider
}())

module.exports = {
  IdrisRenameProvider
}