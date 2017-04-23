const which = require('which')
const IdrisModel = require('./model')
const ipkg = require('../ipkg/ipkg')
const vscode = require('vscode')
const common = require('../analysis/common')
const findDefinition = require('../analysis/find-definition')
const Rx = require('rx-lite')
const path = require('path')

let model = null
let checkNotTotalModel = null
let outputChannel = vscode.window.createOutputChannel('Idris')
let replChannel = vscode.window.createOutputChannel('Idris REPL')
let aproposChannel = vscode.window.createOutputChannel('Idris Apropos')
let tcDiagnosticCollection = vscode.languages.createDiagnosticCollection("Typechecking Diagnostic")
// Acutally build diagnostic also deal with the non totality warnings
let buildDiagnosticCollection = vscode.languages.createDiagnosticCollection("Build Diagnostic")
let nonTotalDiagnosticCollection = vscode.languages.createDiagnosticCollection("Non-total Diagnostic")
let term = null
let innerCompilerOptions
let needDestroy = true

let init = (compilerOptions) => {
  if (compilerOptions) {
    innerCompilerOptions = compilerOptions
    model.setCompilerOptions(compilerOptions)
    checkNotTotalModel.setCompilerOptions(compilerOptions)
  } else {
    vscode.window.showErrorMessage("Can not get compiler options for current project")
  }
}

let initialize = (compilerOptions) => {
  if (!model) {
    model = new IdrisModel()
  }
  if (!checkNotTotalModel) {
    checkNotTotalModel = new IdrisModel()
  }
  init(compilerOptions)
}

let reInitialize = (compilerOptions) => {
  model = new IdrisModel()
  checkNotTotalModel = new IdrisModel()
  init(compilerOptions)
}

let getModel = () => {
  return model
}

let showOutputChannel = (msg) => {
  outputChannel.clear()
  outputChannel.show()
  outputChannel.append(msg)
}

let clearOutputChannel = () => {
  outputChannel.clear()
}

let showLoading = () => {
  showOutputChannel("loading...")
}

let getCurrentPosition = () => {
  let editor = vscode.window.activeTextEditor
  let document = editor.document
  if (document.isDirty) {
    // if a concrete command use this function, it should set `needDestroy` to true when it finished.
    needDestroy = false
    document.save()
  }
  let position = editor.selection.active
  return [document, position]
}

let getWordBase = (document, position, isHover) => {
  let wordRange = document.getWordRangeAtPosition(position, /'?\w+(\.\w+)?'?/i)
  let currentWord = document.getText(wordRange)
  if (currentWord.match(/\r|\n| /g)) {
    outputChannel.clear()
    if (!isHover) {
      vscode.window.showWarningMessage("Please move cursor to an Identifier")
    }
    return [null, null]
  } else {
    return [currentWord, wordRange]
  }
}

getWord = () => {
  let [document, position] = getCurrentPosition()
  return getWordBase(document, position, false)[0]
}

/**
 * Get the column of the first character of a concrete line of code
 */
let getStartColumn = (line) => {
  if (line >= vscode.window.activeTextEditor.document.lineCount)
    return 0

  let document = vscode.window.activeTextEditor.document
  let textAtLine = document.lineAt(line).text
  let column = textAtLine.indexOf(textAtLine.trim())
  return column
}

let checkTotality = (uri) => {
  nonTotalDiagnosticCollection.clear()
  let moduleName = common.getModuleName(uri)
  if (!moduleName) return

  let nonTotalDianostics = []

  new Promise((resolve, reject) => {
    checkNotTotalModel.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return checkNotTotalModel.browseNamespace(moduleName)
    }).flatMap((arg) => {
      let docs = arg.msg[0][1].map((a) => {
        return checkNotTotalModel.getDocs(a[0].split(":")[0].trim())
      })

      return Rx.Observable.zip(docs)
    }).subscribe((docs) => {
      docs.forEach((doc) => {
        let infoMsg = doc.msg[0].replace(/\n    \n    /g, "").replace(/\n        \n        /g, "")
        if (infoMsg.includes("not total")) {
          let infos = infoMsg.split("\n")
          let names = infos[0].split(":")[0].split(".")
          let name = names[names.length - 1].trim()
          let def = findDefinition.findDefinitionInFiles(name, uri)
          if (def) {
            let message = infos[infos.length - 1].trim()
            let range = new vscode.Range(def.line, def.column, def.line + 1, 0)
            let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning)
            nonTotalDianostics.push([vscode.Uri.file(uri), [diagnostic]])
          }
        }
      })
      nonTotalDiagnosticCollection.set(nonTotalDianostics)
      destroy(false)
      resolve()
    }, (err) => { })
  }).then(function () {
  }).catch(function () {
  })
}

let buildIPKG = (uri) => {
  buildDiagnosticCollection.clear()
  let ipkgFile = common.getAllFiles("ipkg")[0]
  if (!ipkgFile) return

  let dir = model.getDirectory(uri)
  let buildDiagnostics = []

  new Promise((resolve, reject) => {
    model.build(ipkgFile).subscribe((ret) => {
      let msgs = ret.split("\n")
      for (let i = 0; i < msgs.length; i++) {
        let l = msgs[i]
        let match = /(\w+(\/\w+)?.idr):(\d+):(\d+):$/g.exec(l)
        if (match) {
          let moduleName = match[1]
          let line = parseInt(match[3])
          let column = getStartColumn(line)
          if (`${dir}/${moduleName}` == uri && msgs[i + 1] && msgs[i + 1].includes("not total")) {
            let range = new vscode.Range(line - 1, column, line, 0)
            let diagnostic = new vscode.Diagnostic(range, msgs[i + 1], vscode.DiagnosticSeverity.Warning)
            buildDiagnostics.push([vscode.Uri.file(uri), [diagnostic]])
          }
        }
      }

      buildDiagnosticCollection.set(buildDiagnostics)
      resolve()
    }, (err) => { })
  }).then(function () {
  }).catch(function () {
  })
}

let typecheckFile = (uri) => {
  let successHandler = (_) => {
    outputChannel.clear()
    outputChannel.show()
    outputChannel.append("Idris: File loaded successfully")
    tcDiagnosticCollection.clear()
    destroy(true)
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).subscribe(successHandler, (err) => {
      destroy(true)
      displayErrors(err)
    })
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let cmdMsgs = {
  type: 'Type of',
  docs: 'Docs for',
  definition: 'Definition of'
}

let getInfoForWord = (uri, cmd) => {
  let currentWord = getWord()
  if (!currentWord) return

  let successHandler = (arg) => {
    let info = arg.msg[0]
    //let highlightingInfo = arg.msg[1]
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Idris: ' + cmdMsgs[cmd] + ' ' + currentWord)
    outputChannel.append(info.replace(/\n    \n    /g, "").replace(/\n        \n        /g, ""))
    tcDiagnosticCollection.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      switch (cmd) {
        case 'type':
          return model.getType(currentWord)
        case 'docs':
          return model.getDocs(currentWord)
        case 'definition':
          return model.printDefinition(currentWord)
      }
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let typeForWord = (uri) => {
  getInfoForWord(uri, 'type')
}

let docsForWord = (uri) => {
  getInfoForWord(uri, 'docs')
}

let printDefinition = (uri) => {
  getInfoForWord(uri, 'definition')
}

let showHoles = (uri) => {
  let successHandler = (arg) => {
    let holes = arg.msg[0]
    let hs = holes.map(([name, premises, [type, _]]) => {
      let ps = premises.map(([name, type, _]) => {
        return `    ${name} : ${type}`
      })
      let conclusion = `${name} : ${type}`
      let divider = '-'.repeat(conclusion.length)
      return `${name}\n${ps.join('\n')}\n${divider}\n${conclusion}`
    })
    outputChannel.clear()
    outputChannel.show()
    outputChannel.appendLine('Idris: Holes')
    outputChannel.append(hs.join('\n'))
    tcDiagnosticCollection.clear()
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.holes(80)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

/*
let idrisAscii = (version) => {
  return [
    "    ____    __     _"
  , "   /  _/___/ /____(_)____"
  , "   / // __  / ___/ / ___/     Version " + version
  , " _/ // /_/ / /  / (__  )      http://www.idris-lang.org/"
  , "/___/\_____/_/  /_/____/       Type :? for help"
  , ""
  ]
}
*/

let evalSelection = (uri) => {
  let editor = vscode.window.activeTextEditor
  let selection = editor.selection
  let text = editor.document.getText(selection)

  let successHandler = (arg) => {
    let result = arg.msg[0]
    //let highlightingInfo = arg.msg[1]

    outputChannel.clear()
    tcDiagnosticCollection.clear()
    replChannel.clear()
    replChannel.show()

    model.getVersion().subscribe((arg) => {
      let version = arg.msg[0][0].join(".")
      //replChannel.appendLine(idrisAscii(version).join('\n'))
      replChannel.appendLine("Type checking " + uri + "\n")
      replChannel.appendLine("λΠ> " + text)
      replChannel.appendLine(result)
    }, displayErrors)
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.interpret(text)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let startup = (uri) => {
  const pathToIdris = vscode.workspace.getConfiguration('idris').get('executablePath');
  const idrisPath = which.sync(pathToIdris)
  const pkgOpts = ipkg.getPkgOpts(innerCompilerOptions)
  term = vscode.window.createTerminal("Idris REPL", idrisPath, pkgOpts)

  if (innerCompilerOptions.src && uri.includes(innerCompilerOptions.src)) {
    term.sendText(`:cd ${path.resolve(innerCompilerOptions.src)}`)
    term.sendText(`:l ${path.relative(path.resolve(innerCompilerOptions.src), path.resolve(uri))}`)
    term.show()
  } else {
    term.sendText(`:l ${uri}`)
    term.show()
  }
}

let startREPL = (uri) => {
  if (term == null) {
    startup(uri)
  } else {
    term.hide()
    term.dispose()
    startup(uri)
  }
}

let sendREPL = (uri) => {
  let editor = vscode.window.activeTextEditor
  let selection = editor.selection
  let text = editor.document.getText(selection)

  if (term == null) {
    startup(uri)
  }

  term.show()
  term.sendText(text)
}

let addClause = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0] + "\n"
    editor.edit((edit) => {
      edit.insert(new vscode.Position(line + 1, 0), line + 1 == editor.document.lineCount ? "\n" + clause : clause)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.addClause(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let addProofClause = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0] + "\n"
    editor.edit((edit) => {
      edit.insert(new vscode.Position(line + 1, 0), line + 1 == editor.document.lineCount ? "\n" + clause : clause)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.addProofClause(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let caseSplit = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let split = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), split)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.caseSplit(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let proofSearch = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line
  let position = editor.selection.active
  let wordRange = editor.document.getWordRangeAtPosition(position)

  let successHandler = (arg) => {
    let res = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(wordRange.start.line, wordRange.start.character - 1)
      let end = wordRange.end
      edit.replace(new vscode.Range(start, end), res)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.proofSearch(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeWith = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), clause)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeWith(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeCase = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line

  let successHandler = (arg) => {
    let clause = arg.msg[0]
    editor.edit((edit) => {
      let start = new vscode.Position(line, 0)
      let end = new vscode.Position(line + 1, 0)
      edit.replace(new vscode.Range(start, end), clause)
    })

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeCase(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let makeLemma = (uri) => {
  let currentWord = getWord()
  if (!currentWord) return
  let editor = vscode.window.activeTextEditor
  let line = editor.selection.active.line
  let position = editor.selection.active
  let wordRange = editor.document.getWordRangeAtPosition(position)

  let successHandler = (arg) => {
    let lemty = arg.msg[0]
    let param1 = arg.msg[1]
    let param2 = arg.msg[2]
    if (lemty == ':metavariable-lemma') {
      editor.edit((edit) => {
        let start = new vscode.Position(wordRange.start.line, wordRange.start.character - 1)
        let end = wordRange.end
        edit.replace(new vscode.Range(start, end), param1[1])

        while (line > 0) {
          if (editor.document.lineAt(line).isEmptyOrWhitespace) break
          line--
        }
        edit.insert(new vscode.Position(line + 1, 0), param2[1] + "\n\n")
      })
    }

    outputChannel.clear()
    needDestroy = true
  }

  new Promise((resolve, reject) => {
    model.load(uri).filter((arg) => {
      return arg.responseType === 'return'
    }).flatMap(() => {
      return model.makeLemma(line + 1, currentWord)
    }).subscribe(successHandler, displayErrors)
    showLoading()
    resolve()
  }).then(function () {
  }).catch(function () {
  })
}

let apropos = (uri) => {
  vscode.window.showInputBox({ prompt: 'Idris: Apropos' }).then(val => {
    let successHandler = (arg) => {
      let result = arg.msg[0]
      //let highlightingInfo = arg.msg[1]

      outputChannel.clear()
      tcDiagnosticCollection.clear()
      aproposChannel.clear()
      aproposChannel.show()
      aproposChannel.appendLine(result)
    }

    new Promise((resolve, reject) => {
      model.load(uri).filter((arg) => {
        return arg.responseType === 'return'
      }).flatMap(() => {
        return model.apropos(val)
      }).subscribe(successHandler, displayErrors)
      showLoading()
      resolve()
    }).then(function () {
    }).catch(function () {
    })
  });
}

let displayErrors = (err) => {
  replChannel.clear()
  aproposChannel.clear()
  outputChannel.clear()
  outputChannel.show()
  tcDiagnosticCollection.clear()
  let buf = []
  let diagnostics = []
  if (err.warnings) {
    let len = err.warnings.length
    buf.push("Errors (" + len + ")")
    err.warnings.forEach(function (w) {
      let file = w[0].replace("./", err.cwd + "/")
      let line = w[1][0]
      let char = w[1][1]
      let message = w[3]
      buf.push(file + ":" + line + ":" + char)
      buf.push(message)
      buf.push("")
      if (line > 0) {
        let column = getStartColumn(line)
        let range = new vscode.Range(line - 1, column, line, 0)
        let diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
        diagnostics.push([vscode.Uri.file(file), [diagnostic]])
      }
    })
    outputChannel.appendLine(buf.join('\n'))
    tcDiagnosticCollection.set(diagnostics)
  }
}

let destroy = (isOnSave) => {
  if (isOnSave) {
    if (model != null && needDestroy) {
      model.stop()
      model = null
    }
  } else {
    if (model != null) {
      model.stop()
      model = null
    }
    if (checkNotTotalModel != null) {
      checkNotTotalModel.stop()
      checkNotTotalModel = null
    }
  }
}

module.exports = {
  getModel,
  tcDiagnosticCollection,
  buildDiagnosticCollection,
  nonTotalDiagnosticCollection,
  initialize,
  reInitialize,
  typecheckFile,
  typeForWord,
  docsForWord,
  printDefinition,
  showHoles,
  addClause,
  addProofClause,
  caseSplit,
  proofSearch,
  makeWith,
  makeCase,
  makeLemma,
  apropos,
  evalSelection,
  destroy,
  startREPL,
  sendREPL,
  getWordBase,
  showOutputChannel,
  clearOutputChannel,
  buildIPKG,
  checkTotality
}
