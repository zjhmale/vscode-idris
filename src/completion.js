let ipkg     = require('./ipkg/ipkg')
let commands = require('./idris/commands')
let vscode   = require('vscode')

let IdrisCompletionProvider = (function() {
  function IdrisCompletionProvider() {}

  IdrisCompletionProvider.prototype.provideCompletionItems = (document, position, token) => {
    var wordRange = document.getWordRangeAtPosition(position)
    var currentWord = document.getText(wordRange)

    let trimmedPrefix = currentWord.trim()

    if (trimmedPrefix.length > 2) {
      let root = vscode.workspace.rootPath
      let compilerOptions = ipkg.compilerOptions(root)
      let uri = vscode.window.activeTextEditor.document.uri.path

      return compilerOptions.flatMap((compilerOptions) => {
        commands.initialize(compilerOptions)
        return commands.getModel().replCompletions(trimmedPrefix)
      }).toPromise().then((arg) => {
        let ref = arg.msg[0][0]
        let results = ref.map((v, i, arr) => {
          var ci = new vscode.CompletionItem(v, 1)
          return ci
        })
        return results
      })
    } else {
      return null
    }
  }
  return IdrisCompletionProvider
}())

module.exports = {
    IdrisCompletionProvider
}
