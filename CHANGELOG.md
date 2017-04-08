# Changelog

## 0.8.0

* Performance improvement for `Search Symbol` [#70](https://github.com/zjhmale/vscode-idris/issues/70)
* Remove default keybindings completely [#69](https://github.com/zjhmale/vscode-idris/issues/69)
* `Find All References` [#27](https://github.com/zjhmale/vscode-idris/issues/27)
* `Rename Symbol` [#50](https://github.com/zjhmale/vscode-idris/issues/50)
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
* Update commands title [#54](https://github.com/zjhmale/vscode-idris/issues/54)

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
