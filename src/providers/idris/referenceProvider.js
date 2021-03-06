const commands = require('../../idris/commands')
const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')
const _ = require('lodash')

let IdrisReferenceProvider = (function () {
  function IdrisReferenceProvider() { }

  IdrisReferenceProvider.prototype.provideReferences = function (document, position, _context, _token) {
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
      let locations = uniPositions.map(({ uri, line, column }) => {
        let pos = new vscode.Position(line, column)
        let range = new vscode.Range(pos, pos)
        return new vscode.Location(vscode.Uri.file(uri), range)
      })
      resolve(locations)
    })
  }
  return IdrisReferenceProvider
}())

module.exports = {
  IdrisReferenceProvider
}