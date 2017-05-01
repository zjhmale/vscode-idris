const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')

let IdrisSignatureHelpProvider = (function () {
  function IdrisSignatureHelpProvider() { }

  IdrisSignatureHelpProvider.prototype.provideSignatureHelp = function (document, position, _token) {
    let currentLine = document.lineAt(position).text
    let openParenPoses =
      Array
        .from(currentLine)
        .slice(0, position.character - 1)
        .reduce((a, e, i, _) => {
          return (e == "(") ? a.concat(i) : a
        }, [])

    let closeParenPoses =
      Array
        .from(currentLine)
        .slice(position.character, currentLine.length)
        .reduce((a, e, i, _) => {
          return (e == ")") ? a.concat(i) : a
        }, [])

    if (openParenPoses.length == 0 && closeParenPoses.length == 0)
      return

    let leftPos = new vscode.Position(position.line, openParenPoses.pop() + 1)
    let rightPos = new vscode.Position(position.line, position.character + closeParenPoses[0] - 1)

    let application = document.getText(new vscode.Range(leftPos, rightPos)).split(" ")
    let functionSymbol = application[0]
    if (!functionSymbol) return

    let uri = document.uri.fsPath
    let functionDef = findDefinition.findDefinitionInFiles(functionSymbol, uri)
    if (!functionDef) return

    let signature = document.lineAt(functionDef.line).text.split(":")[1].trim()
    if (!signature.includes("->")) return
    let signatureInfo = new vscode.SignatureInformation(signature)
    let parameterInfos = signature.split("->").slice(0, -1).map((t) => {
      return new vscode.ParameterInformation(t.trim())
    })
    signatureInfo.parameters = parameterInfos

    let help = new vscode.SignatureHelp()
    help.signatures = [signatureInfo]
    help.activeSignature = 0
    // the first element is ƒ and index should start from 0
    help.activeParameter = application.length - 2
    return help
  }
  return IdrisSignatureHelpProvider
}())

module.exports = {
  IdrisSignatureHelpProvider
}