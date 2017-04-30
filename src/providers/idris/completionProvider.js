const commands = require('../../idris/commands')
const controller = require('../../controller')
const common = require('../../analysis/common')
const snippets = require('../../../snippets/idris.json')
const completionUtil = require('../completionUtil')
const HashMap = require('hashmap')
const vscode = require('vscode')
const Rx = require('rx-lite')
const _ = require('lodash')

const unicodeMap = new HashMap()
unicodeMap.set("\\alpha", "α")
unicodeMap.set("\\beta", "β")
unicodeMap.set("\\gamma", "γ")
unicodeMap.set("\\delta", "δ")
unicodeMap.set("\\zeta", "ζ")
unicodeMap.set("\\eta", "η")
unicodeMap.set("\\theta", "θ")
unicodeMap.set("\\iota", "ι")
unicodeMap.set("\\kappa", "κ")
unicodeMap.set("\\lambda", "λ")
unicodeMap.set("\\mu", "μ")
unicodeMap.set("\\nu", "ν")
unicodeMap.set("\\xi", "ξ")
unicodeMap.set("\\pi", "π")
unicodeMap.set("\\rho", "ρ")
unicodeMap.set("\\sigma", "σ")
unicodeMap.set("\\tau", "τ")
unicodeMap.set("\\upsilon", "υ")
unicodeMap.set("\\chi", "χ")
unicodeMap.set("\\psi", "ψ")
unicodeMap.set("\\omega", "ω")
unicodeMap.set("\\phi", "ϕ")

let identList
// cache previous completion items when successfully typechecking file
let lastReplCompletionItems = []

let buildCompletionList = () => {
  let idents = common.getAllFilesExts(['idr', 'lidr']).map((uri) => {
    return common.getIdents(uri)
  })
  identList = _.uniqWith(_.flatten(idents), _.isEqual)
}

let getUnicodeCompletion = (currentWord, wordRange) => {
  let result = []
  unicodeMap.forEach((value, key) => {
    if (key.startsWith(currentWord)) {
      let item = new vscode.CompletionItem(key, 0)
      item.insertText = value
      item.range = wordRange
      result.push(item)
    }
  })
  return result
}

let IdrisCompletionProvider = (function () {
  function IdrisCompletionProvider() { }

  let snippetItems = Object.keys(snippets).map((k) => {
    let snippet = snippets[k]
    let item = new vscode.CompletionItem(snippet.prefix)
    item.insertText = new vscode.SnippetString(snippet.body.join("\n"))
    item.kind = 14
    return item
  })

  IdrisCompletionProvider.prototype.provideCompletionItems = (document, position, _token) => {
    let wordRange = document.getWordRangeAtPosition(position, /(\\)?'?\w+(\.\w+)?'?/i)
    let currentWord = document.getText(wordRange).trim()
    let currentLine = document.lineAt(position)

    let trimmedPrefix = currentWord.trim()

    if (trimmedPrefix.length >= 2) {
      let suggestMode = vscode.workspace.getConfiguration('idris').get('suggestMode')

      if (suggestMode == 'allWords') {
        if (currentWord.startsWith("\\")) {
          return getUnicodeCompletion(currentWord, wordRange)
        } else {
          let suggestionItems = identList.filter((ident) => {
            return ident.startsWith(trimmedPrefix) || ident.toLowerCase().startsWith(trimmedPrefix)
          }).map((ident) => {
            return new vscode.CompletionItem(ident, 0)
          })

          let baseItems = suggestionItems
            .concat(snippetItems)
            .concat(completionUtil.idrisKeywordCompletionItems(trimmedPrefix))

          if (/^(>\s+)?import/g.test(currentLine.text)) {
            return baseItems.concat(completionUtil.getModuleNameCompletionItems(trimmedPrefix))
          } else {
            return baseItems
          }
        }
      } else if (suggestMode == 'replCompletion') {
        if (currentWord.startsWith("\\")) {
          return getUnicodeCompletion(currentWord, wordRange)
        } else {
          return new Promise((resolve, _reject) => {
            controller.withCompilerOptions((uri) => {
              commands.getModel().load(uri).flatMap((tcResult) => {
                if (tcResult.responseType == "return") {
                  return commands.getModel().replCompletions(trimmedPrefix)
                } else {
                  return Rx.Observable.of(false)
                }
              }).subscribe((arg) => {
                resolve(arg)
              }, (_err) => {
              })
            })
          }).then(function (arg) {
            if (arg) {
              let ref = arg.msg[0][0]
              let results = ref.map((v, _i, _arr) => {
                return new vscode.CompletionItem(v, 1)
              })

              let baseItems = results
                .concat(snippetItems)
                .concat(completionUtil.idrisKeywordCompletionItems(trimmedPrefix))

              if (/^(>\s+)?import/g.test(currentLine)) {
                let finalItems = baseItems.concat(completionUtil.getModuleNameCompletionItems(trimmedPrefix))
                lastReplCompletionItems = finalItems
                return finalItems
              } else {
                lastReplCompletionItems = baseItems
                return baseItems
              }
            } else {
              return lastReplCompletionItems
            }
          })
        }
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
