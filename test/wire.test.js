let assert    = require("assert")
let formatter = require('../src/wire/formatter')
let parser    = require("../src/wire/parser")
let runP      = require('bennu').parse.run

let test1 = "(:protocol-version 1 0)"
let list1 = [':protocol-version', 1, 0]

let test2 = "(:set-prompt \"*C:\\Programming\\Idris\\Start\\hello\" 1)"
let list2 = [":set-prompt", "*C:\\Programming\\Idris\\Start\\hello", 1]

let test3 = "(:return (:ok ()) 5)"
let list3 = [":return", [":ok", []], 5]

let test4 = "(:return (:ok \"Main.a : Nat\" ((0 6 ((:name \"Main.a\") (:implicit :False) (:decor :function) (:doc-overview \"\") (:type \"Nat\"))) (9 3 ((:name \"Prelude.Nat.Nat\") (:implicit :False) (:decor :type) (:doc-overview \"Unary natural numbers\") (:type \"Type\"))) (9 3 ((:tt-term \"AAAAAAAAAAAAAwAAAAAACAAAAQyZWx1ZGU=\"))))) 2)"
let list4 = [":return", [":ok", "Main.a : Nat", [[0, 6, [[":name", "Main.a"], [":implicit", false], [":decor", ":function"], [":doc-overview", ""], [":type", "Nat"]]], [9, 3, [[":name", "Prelude.Nat.Nat"], [":implicit", false], [":decor", ":type"], [":doc-overview", "Unary natural numbers"], [":type", "Type"]]], [9, 3, [[":tt-term", "AAAAAAAAAAAAAwAAAAAACAAAAQyZWx1ZGU="]]]]], 2]


let test5 = "(:return (:ok \"\\\"Z\\\" : String\" ((0 3 ((:name \"\\\"Z\\\"\"))))) 5)"
let list5 =
  [
    ":return",
    [
      ":ok",
      '"Z" : String',
      [
        [
          0,
          3,
          [
            [
              ":name",
              '"Z"'
            ]
          ]
        ]
      ]
    ],
    5
  ]

let test6 = "(:return (:ok \"\\\\__pi_arg => \\\\__pi_arg1 => (__pi_arg1)\") 6)"
let list6 =
  [
    ":return",
    [
      ":ok",
      "\\__pi_arg => \\__pi_arg1 => (__pi_arg1)"
    ],
    6
  ]

let test7 = "(:interpret \":cd C:/Path/to/dir\")"
let list7 =
  [
    ":interpret",
    ":cd C:/Path/to/dir"
  ]

suite("The sub-parser(s)",() => {
  test("for :True and :False should work.", () => {
    assert.equal(runP(parser.trueP, ':True'), true)
    assert.equal(runP(parser.falseP, ':False'), false)
  })

  test("for integers should work.", () => {
    assert.equal(runP(parser.integerP, '2345'), 2345)
    assert.equal(runP(parser.integerP, '1'), 1)
  })

  test("for symbols should work.", () => {
    assert.equal(runP(parser.symbolP, ':sym'), ':sym')
  })

  test("for string chars should work.", () => {
    assert.equal(runP(parser.stringCharP, 'h'), 'h')
    assert.equal(runP(parser.stringCharP, '\\"'), '"')
  })

  test("for strings should work.", () => {
    assert.equal(runP(parser.stringP, '"hello"'), 'hello')
    assert.equal(runP(parser.stringP, '"\\"Z\\""'), '"Z"')
    assert.equal(runP(parser.stringP, '"\\"Z\\" : String"'), '"Z" : String')
  })
})

suite("A parser", () => {
  test("should parse to the right list.", () => {
    assert.deepEqual(parser.parse(test1), list1)
    assert.deepEqual(parser.parse(test2), list2)
    assert.deepEqual(parser.parse(test3), list3)
    assert.deepEqual(parser.parse(test4), list4)
    assert.deepEqual(parser.parse(test5), list5)
    assert.deepEqual(parser.parse(test6), list6)
  })

  test("should serialize back again.", () => {
    assert.equal(formatter.formatSexp(list1), test1)
    assert.equal(formatter.formatSexp(list2), test2)
    assert.equal(formatter.formatSexp(list3), test3)
    assert.equal(formatter.formatSexp(list4), test4)
    assert.equal(formatter.formatSexp(list7), test7)
  })

  test("should serialize common commands.", () => {
    loadFile = [[':load-file', "idris.idr"], 1]
    assert.equal(formatter.formatSexp(loadFile), '((:load-file "idris.idr") 1)')
  })
})