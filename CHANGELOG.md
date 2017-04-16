# Changelog

## 0.8.9

* Auto-completion module names in iPKG file [#62](https://github.com/zjhmale/vscode-idris/issues/62)
* Go to the definition of a concrete module file from iPKG file [#68](https://github.com/zjhmale/vscode-idris/issues/68)
* Literate programming improvement [#79](https://github.com/zjhmale/vscode-idris/issues/79)
* Extension activates on Idris file, iPKG file and literate Idris file [#80](https://github.com/zjhmale/vscode-idris/issues/80)
* Auto-completion module names in import clause of Idris file and literate Idris file [#81](https://github.com/zjhmale/vscode-idris/issues/81)
* Auto-completion for Idris keywords and iPKG keywords [#82](https://github.com/zjhmale/vscode-idris/issues/82)

## 0.8.6

* Support totality checking for functions [#58](https://github.com/zjhmale/vscode-idris/issues/58)
* Better support for literate programming [#75](https://github.com/zjhmale/vscode-idris/issues/75)
* Support `Add proof clause` command [#76](https://github.com/zjhmale/vscode-idris/issues/76)
* Update syntax file to fix context signature [df29a52](https://github.com/zjhmale/vscode-idris/commit/df29a527bb6a31ac7a57712791b84c0b8c7229e0) [@be5invis](https://github.com/be5invis)
* Update code snippets [3c1c869](https://github.com/zjhmale/vscode-idris/commit/3c1c869abd9c6821c563a078571c89d608a445b4)

## 0.8.3

* Update syntax file to support numbers in module names [2ceb72d](https://github.com/zjhmale/vscode-idris/commit/2ceb72ddb72df2d3e51586a50485a80f694dd7cc) [@be5invis](https://github.com/be5invis)
* Support Latex snippets [#49](https://github.com/zjhmale/vscode-idris/issues/49)
* Support go to module file from import clause [#72](https://github.com/zjhmale/vscode-idris/issues/72)
* Support go to definition with module alias and re-export import clause [#71](https://github.com/zjhmale/vscode-idris/issues/71)

## 0.8.0

* Performance improvement for `Search Symbol` [#70](https://github.com/zjhmale/vscode-idris/issues/70)
* Remove default keybindings completely [#69](https://github.com/zjhmale/vscode-idris/issues/69)
* `Find All References` [#27](https://github.com/zjhmale/vscode-idris/issues/27)
* `Rename Symbol` and `Change all occurrences` [#50](https://github.com/zjhmale/vscode-idris/issues/50)
* Update code snippets [#61](https://github.com/zjhmale/vscode-idris/issues/61)

## 0.6.9

* Support `Go to Symbol` and `Search Symbol` [#48](https://github.com/zjhmale/vscode-idris/issues/48)
* `Find definition` improvement [#67](https://github.com/zjhmale/vscode-idris/issues/67)
* Fix `Can't find import` bug for typechecking [#66](https://github.com/zjhmale/vscode-idris/issues/66)

## 0.6.6

* `Go to Definition` and `Peek Definition` improvement [#63](https://github.com/zjhmale/vscode-idris/issues/63)
* Fix can not Start/Reload REPL for Windows [#60](https://github.com/zjhmale/vscode-idris/issues/60) [@be5invis](https://github.com/be5invis)

## 0.6.3

* Support `Go to Definition` and `Peek Definition` [#21](https://github.com/zjhmale/vscode-idris/issues/21)
* Fix `Can't find import` bug for REPL [#59](https://github.com/zjhmale/vscode-idris/issues/59)
* Fix command confliction on unsaved files [#55](https://github.com/zjhmale/vscode-idris/issues/55)
* Insert new line for `Add Clause` command [#56](https://github.com/zjhmale/vscode-idris/issues/56) [@wkwkes](https://github.com/wkwkes)

## 0.6.1

* Fix huge memory usage issue [#52](https://github.com/zjhmale/vscode-idris/issues/52)
* Fix shortcuts confliction again [#53](https://github.com/zjhmale/vscode-idris/issues/53)
* Update commands' title [#54](https://github.com/zjhmale/vscode-idris/issues/54)

## 0.6.0

* Support `Cleanup Idris binary files` action [#42](https://github.com/zjhmale/vscode-idris/issues/42)
* Add [when-clause-context](https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts) for right-click menu items [#44](https://github.com/zjhmale/vscode-idris/issues/44)
* Support a new auto-completion mode which will always include all words from the currently opened documentation [#43](https://github.com/zjhmale/vscode-idris/issues/43)

## 0.3.9

* Fix a typo [#36](https://github.com/zjhmale/vscode-idris/issues/36)
* Hover text should have the same syntactical render with the source code [#33](https://github.com/zjhmale/vscode-idris/issues/33)
* Support hover on identifiers with a single quote, e.g. `name'` and `'name` [#35](https://github.com/zjhmale/vscode-idris/issues/35)
* Show more user-friendly error message for hover [#32](https://github.com/zjhmale/vscode-idris/issues/32)
* Support customizing Idris executable path [#38](https://github.com/zjhmale/vscode-idris/issues/38)
* Do not show duplicate hover when it is inside a diagnostic [#39](https://github.com/zjhmale/vscode-idris/issues/39)
* Fix a corner case issue for `Add Clause` command [#41](https://github.com/zjhmale/vscode-idris/issues/41)
* Add Idris commands to right-click menu [#34](https://github.com/zjhmale/vscode-idris/issues/34)
* Trim redundant whitespace and new-line character for `Show Documentation` command [#40](https://github.com/zjhmale/vscode-idris/issues/40)
* Support customizing hover behavior [#37](https://github.com/zjhmale/vscode-idris/issues/37)

## 0.3.7

* Eliminate warning messages for hover [#28](https://github.com/zjhmale/vscode-idris/issues/28)

## 0.3.6

* Syntax file improvement [#24](https://github.com/zjhmale/vscode-idris/issues/24) [@be5invis](https://github.com/be5invis)
* Fix loading `pkgs` for bootstrapping [774ecde](https://github.com/zjhmale/vscode-idris/commit/774ecded6419af483ce0c255957282f5076a283d) [@be5invis](https://github.com/be5invis)
* Show type definition on hover [#22](https://github.com/zjhmale/vscode-idris/issues/22)
* Type checking on saving file [#25](https://github.com/zjhmale/vscode-idris/issues/25)

## 0.3.3

* Update syntax files [#16](https://github.com/zjhmale/vscode-idris/issues/16)

## 0.3.2

* Support fully featured REPL [#3](https://github.com/zjhmale/vscode-idris/issues/3) [#17](https://github.com/zjhmale/vscode-idris/issues/17)
* Support single Idris file [#9](https://github.com/zjhmale/vscode-idris/issues/9)
* Fix shortcuts confliction [#15](https://github.com/zjhmale/vscode-idris/issues/15) [@be5invis](https://github.com/be5invis)

## 0.3.1

* Update syntax to followed up Idirs 0.99.1 [@be5invis](https://github.com/be5invis)
* Add key binding filter for actions [@be5invis](https://github.com/be5invis)
* Fix typo for the title of `idris.docs-for` command [@FinnNk](https://github.com/FinnNk)

## 0.3.0

* Basic features [#4](https://github.com/zjhmale/vscode-idris/issues/4)
