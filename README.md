# Idris for Visual Studio Code

[![Version](https://vsmarketplacebadge.apphb.com/version/zjhmale.Idris.svg)](https://marketplace.visualstudio.com/items?itemName=zjhmale.Idris)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/zjhmale.Idris.svg)](https://marketplace.visualstudio.com/items?itemName=zjhmale.Idris)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/zjhmale.Idris.svg)](https://marketplace.visualstudio.com/items?itemName=zjhmale.Idris)

[![Build Status](https://travis-ci.org/zjhmale/vscode-idris.svg?branch=master)](https://travis-ci.org/zjhmale/vscode-idris)
[![Build Status](https://ci.appveyor.com/api/projects/status/github/zjhmale/vscode-idris?branch=master&svg=true)](https://ci.appveyor.com/project/zjhmale/vscode-idris)

## Implemented features

| command screenshot | command name |
|---|---|
| [Typechecking](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#typechecking) | idris.typecheck |
| [Show the types of a variable](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#showing-the-type-of-an-identifier) | idris.type-of |
| [Show the doc for a variable](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#showing-the-docs-for-an-identifier) | idris.docs-for |
| [Show the doc for a definition](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#showing-the-definition-for-an-identifier) | idris.print-definition |
| [Show holes](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#list-all-the-currently-active-holes) | idris.show-holes |
| [Add clause](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#generate-an-initial-pattern-match-clause) | idris.add-clause |
| [Add proof clause](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#generate-an-initial-pattern-match-clause-when-trying-to-proof-a-type) | idris.add-proof-clause |
| [Split case](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#generate-a-case-split-for-the-pattern-variable) | idris.case-split |
| [Search proof](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#attempt-to-fill-out-the-holes-by-proof-search) | idris.proof-search |
| [Make with](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#create-a-with-rule-pattern-match-template-for-the-clause-of-function) | idris.make-with |
| [Make case](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#create-a-case-pattern-match-template-for-the-holes) | idris.make-case |
| [Make lemma](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#create-a-top-level-function-with-a-type-which-solves-the-hole-under-the-cursor) | idris.make-lemma |
| [Apropos](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#search-names-types-and-documentations) | idris.apropos |
| [Eval selected code](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#evaluate-selected-code-in-editor) | idris.eval-selection |
| [Start / Refresh REPL](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#start-or-refresh-repl) | idris.start-refresh-repl |
| [Send selected code to REPL](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#send-selected-code-to-repl) | idris.send-selection-repl |
| [Cleanup Idris binary files](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#cleanup-idris-binary-files) | idris.cleanup-ibc |
| [Project Scaffolding](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#project-scaffolding) | idris.new-project |
| [Search values by type signature](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#search-value-by-type) | idris.search |

**Heads up:** All the commands above can also be triggered in the right-click menu

![menu](./images/screenshots/menu.gif)

* [iPKG](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#ipkg)
* [Auto-completion](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#code-completion)
* [Show type definition on hover](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#show-type-definition-on-hover)
* [Type checking on saving file](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#type-checking-on-saving-file)
* [Go to Definition and Peek Definition](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#go-to-definition-and-peek-definition)
* [Go to Symbol (Outline symbols in currently opend file)](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#go-to-symbol-outline-symbols-in-currently-opend-file)
* [Search Symbol (Outline symbols in currently opend project)](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#search-symbol-outline-symbols-in-currently-opend-project)
* [Find all references](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#find-all-references)
* [Rename symbol](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#rename-symbol)
* [Change all occurrences](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#change-all-occurrences)
* [Latex snippets](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#latex-snippets)
* [Literate Idris](https://github.com/zjhmale/vscode-idris/blob/master/FEATURES.md#literate-idris)

## Installation

1. Within Visual Studio Code, open the command palette (Ctrl-Shift-P / Cmd-Shift-P).
2. Select `Install Extension` and search for **Idris** or run `ext install Idris`.
3. [Download Idris](https://www.idris-lang.org/download/) and make sure the **idris** executable is on your `PATH`.
4. Run `cabal install idringen` and make sure the **idrin** executable is on your `PATH`.

## Contributing

Check out [CONTRIBUTING.md](https://github.com/zjhmale/vscode-idris/blob/master/CONTRIBUTING.md).

## Options

The following Visual Studio Code settings along with their *default* values that are available for the Idris extension. If you want to change any of these, you can do so in user preferences (`cmd+,`) or workspace settings (`.vscode/settings.json`). You don't have to copy these if you don't intend to change them.

```javascript
{
    "idris.executablePath": "idris", // The full path to the idris executable.
    "idris.hoverMode": "fallback",   // Controls the hover behavior. 'info' will display Idris documentation, 'type' will display Idris type, 'fallback' will try 'info' first and fallback to 'type' if we can not get the documentation, and 'none' will disable hover tooltips.
    "idris.suggestMode": "allWords"  // Controls the auto-completion behavior. 'allWords' will always include all words from the currently opened documentation, 'replCompletion' will get suggestions from Idris REPL process.
    "idris.warnPartial": true        // Show warning when a function is partial.
}
```

## Acknowledgements

* The internal design is initially inspired by [atom-language-idris](https://github.com/idris-hackers/atom-language-idris).

## Thanks

* Belleve Invis [@be5invis](https://github.com/be5invis) (The maintainer of the syntax files)

## License

[BSD 3-Clause](https://opensource.org/licenses/BSD-3-Clause), the same as Idris.
