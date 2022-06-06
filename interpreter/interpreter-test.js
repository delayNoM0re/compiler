// 二元运算用例
const testExpression1 = () => {
    // 1 + 2
    const ast = [
        Plus(
            Num(1),
            Num(2),
        )
    ]
    let env = Environment.new()

    const expect = 3
    const output = interpret(ast, env)
    ensure(expect === output, 'testExpression1')
}

const testExpression2 = () => {
    // 1 * (2 + 3)
    const ast = [
        Multiply(
            Num(1),
            Plus(
                Num(2),
                Num(3),
            ),
        )
    ]
    let env = Environment.new()

    const expect = 5
    const output = interpret(ast, env)
    ensure(expect === output, 'testExpression2')
}

const testExpression3 = () => {
    // (2 - 3) + (2 * 3)
    const ast = [
        Plus(
            Minus(
                Num(2),
                Num(3)
                ),
            Multiply(
                Num(2),
                Num(3),
            ),
        )
    ]
    let env = Environment.new()

    const expect = 5
    const output = interpret(ast, env)
    ensure(expect === output, 'testExpression3')
}

const testExpression4 = () => {
    // 2 > 1
    const ast = [
        Greater(
            Num(2),
            Num(1),
        )
    ]
    let env = Environment.new()

    const expect = true
    const output = interpret(ast, env)
    ensure(expect === output, 'testExpression4')
}

// 变量声明用例
const testDeclaration1 = () => {
    // var a = 1
    const ast = [
        Declaration(
            Var('a'),
            Num(1),
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    const expect = 1
    const output = env.valueOf('a')
    ensure(expect === output, 'testDeclaration1')
}

const testDeclaration2 = () => {
    // var a = 3 + 5
    const ast = [
        Declaration(
            Var('a'),
            Plus(
                Num(3),
                Num(5),
                ),
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    const expect = 8
    const output = env.valueOf('a')
    ensure(expect === output, 'testDeclaration2')
}

const testDeclaration3 = () => {
    // var a = 1
    // var b = a + 1
    const ast = [
        Declaration(
            Var('a'),
            Num(1),
        ),
        Declaration(
            Var('b'),
            Plus(
                Var('a'),
                Num(1),
            ),
        ),
    ]
    let env = Environment.new()

    interpret(ast, env)
    const expect = 2
    const output = env.valueOf('b')
    ensure(expect === output, 'testDeclaration3')
}

const testDeclaration4 = () => {
    // var a = 1
    // var b = 1
    // var c = a + b
    const ast = [
        Declaration(
            Var('a'),
            Num(1),
        ),
        Declaration(
            Var('b'),
            Num(1),
        ),
        Declaration(
            Var('c'),
            Plus(
                Var('a'),
                Var('b'),
            ),
        ),
    ]
    let env = Environment.new()

    interpret(ast, env)
    const expect = 2
    const output = env.valueOf('c')
    ensure(expect === output, 'testDeclaration4')
}

const testDeclaration5 = () => {
    // var c = 2
    // var d = c
    const ast = [
        Declaration(
            Var('c'),
            Num(2),
        ),
        Declaration(
            Var('d'),
            Var('c'),
        ),
    ]
    let env = Environment.new()

    interpret(ast, env)
    const expect = 2
    const output = env.valueOf('d')
    ensure(expect === output, 'testDeclaration5')
}

// if 用例
const testIf1 = () => {
    // if (true) {
    //     1 + 2
    // }
    const ast = [
        If(
            True(),
            Block([
               Plus(
                   Num(1),
                   Num(2),
                   )
            ]),
        ),
    ]
    let env = Environment.new()

    const expect = interpret(ast, env)
    const output = 3
    ensure(expect === output, 'testIf1')
}

const testIf2 = () => {
    const ast = [
        If(
            False(),
            Block([
                Plus(
                    Num(1),
                    Num(2),
                )
            ]),
            Block([
                Plus(
                    Num(3),
                    Num(4),
                )
            ])
        ),
    ]
    let env = Environment.new()

    const expect = interpret(ast, env)
    const output = 7
    ensure(expect === output, 'testIf2')
}

const testIf3 = () => {
    // var a = 3
    // if (a > 0) {
    //     1 + 2
    // } else {
    //     3 + 4
    // }
    const ast = [
        Declaration(
            Var('a'),
            Num(3),
        ),
        If(
            Greater(
                Var('a'),
                Num(0),
            ),
            Block([
                Plus(
                    Num(1),
                    Num(2),
                )
            ]),
            Block([
                Plus(
                    Num(3),
                    Num(4),
                )
            ])
        ),
    ]
    let env = Environment.new()

    const expect = interpret(ast, env)
    const output = 3
    ensure(expect === output, 'testIf3')
}

// while 和 for 用例
const test_while_1 = () => {
    // var i = 0
    // while (i < 3) {
    //     i = i + 1
    // }

    var ast = [
        Declaration(Var('i'), Num(0)),
        While(
            Less(Var('i'), Num(3)),
            Block(
                Assign(Var('i'), Plus(Var('i'), Num(1)))
            ),
        ),
    ]

    let env = Environment.new()
    interpret(ast, env)
    var output = env.valueOf('i')

    ensure(3 == output, 'test_while_1')
}

const test_for_1 = () => {
    // var a = 0
    // for (var i = 0; i < 3; i = i + 1) {
    //     a = a + 1
    // }

    var ast = [
        Declaration(Var('a'), Num(0)),
        For(
            Declaration(Var('i'), Num(0)),
            Less(Var('i'), Num(3)),
            Assign(Var('i'), Plus(Var('i'), Num(1))),
            Block(
                Assign(Var('a'), Plus(Var('a'), Num(1))),
            ),
        ),
    ]
    let env = Environment.new()

    interpret(ast, env)
    var output = env.valueOf('a')

    ensure(3 == output, 'test_for_1')
}

// 函数用例
const test_Function_1 = () => {
    // 函数声明:
    // 无参数, 函数内有返回:
    // var f = function() {
    //     return 1
    // }
    // f()

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [],
                // 空函数体
                Block([
                    Return(Num(1)),
                ]),
            ),
        ),
        Call(Var('f'), [])
    ]

    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(1 === output, 'test_Function_1')
}

const test_Function_2 = () => {
    // 函数声明, 单参数
    // var f = function(a) {
    //     return a
    // }
    // f(2)

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [Var('a')],
                // 空函数体
                Block([
                    Return(Var('a')),
                ]),
            ),
        ),
        Call(Var('f'), [Num(2)])
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(2 === output, 'test_Function_2')
}

const test_Function_3 = () => {
    // 多参数, 函数体内使用参数
    // var f = function(a, b) {
    //     return a + b
    // }
    // f(1, 2)

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [Var('a'), Var('b')],
                // 空函数体
                Block([
                    Return(
                        Plus(
                            Var('a'),
                            Var('b'),
                        ),
                    ),
                ]),
            ),
        ),
        Call(Var('f'), [Num(1), Num(2)]),
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(3 === output, 'test_Function_3')
}

const test_Function_4 = () => {
    // 函数体内 声明新变量
    // var f = function(a, b) {
    //     var c = a + b
    //     return c
    // }
    // f(1, 2)

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [Var('a'), Var('b')],
                // 空函数体
                Block([
                    Declaration(
                        Var('c'),
                        Plus(
                            Var('a'),
                            Var('b'),
                        ),
                    ),
                    Return(
                        Var('c'),
                    ),
                ]),
            ),
        ),
        Call(Var('f'), [Num(1), Num(2)]),
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(3 === output, 'test_Function_4')
}

const test_Function_5 = () => {
    // 函数调用结果 参与二元运算
    // var f = function(a) {
    //     return a
    // }
    // 1 + f(2)

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [Var('a')],
                // 空函数体
                Block([
                    Return(
                        Var('a'),
                    ),
                ]),
            ),
        ),
        Plus(
            Num(1),
            Call(Var('f'), [Num(2)]),
        ),
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(3 === output, 'test_Function_5')
}

const test_Function_6 = () => {
    // 函数嵌套调用
    // var f1 = function(a) {
    //     return 2 + a
    // }
    // var f2 = function() {
    //     return f1(2)
    // }
    // f2()

    let ast = [
        Declaration(
            Var('f1'),
            Fun(
                [Var('a')],
                // 空函数体
                Block([
                    Return(
                        Plus(
                            Num(2),
                            Var('a'),
                        )
                    ),
                ]),
            ),
        ),
        Declaration(
            Var('f2'),
            Fun(
                [],
                // 空函数体
                Block([
                    Return(
                        Call(Var('f1'), [Num(2)]),
                    ),
                ]),
            ),
        ),
        Call(Var('f2'), []),
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(4 === output, 'test_Function_6')
}

const test_Function_7 = () => {
    // 函数的参数带运算:
    // var f = function(a) {
    //     return 2 + a
    // }
    // var n = 3
    // f(n - 1)

    let ast = [
        Declaration(
            Var('f'),
            Fun(
                [Var('a')],
                Block([
                    Return(
                        Plus(
                            Num(2),
                            Var('a'),
                        ),
                    ),
                ]),
            ),
        ),
        Declaration(
            Var('n'),
            Num(3),
        ),
        // f(n-1)
        Call(Var('f'), [Minus(Var('n'), Num(1))])
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(4 === output, 'test_Function_7')
}

const test_Function_If_1 = () => {
    // var f1 = function(a) {
    //     if (true) {
    //         return 1 + 2
    //     }
    // }
    // f1()

    let ast = [
        Declaration(
            Var('f1'),
            Fun(
                [Var('a')],
                Block([
                    If(
                        True(),
                        Block(
                            [
                                Return(
                                    Plus(
                                        Num(1),
                                        Num(2),
                                    ),
                                )
                            ]
                        ),
                    ),
                ]),
            ),
        ),
        Call(Var('f1'), []),
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(3 === output, 'test_Function_If_1')
}

const test_Function_Recursion_1 = () => {
    // 递归调用:
    // var f1 = function(n) {
    //     if (n < 2) {
    //         return 1
    //     } else {
    //         return f1(n-1) * n
    //     }
    // }
    // var a = 4
    // f1(a)

    let ast = [
        Declaration(
            Var('f1'),
            Fun(
                [Var('n')],
                Block([
                    If(
                        // if (n < 2)
                        Less(
                            Var('n'),
                            Num(2),
                        ),
                        // return 1
                        Block(
                            [
                                Return(
                                    Num(1),
                                ),
                            ]
                        ),
                        // else { return f1(n-1) * n }
                        Block(
                            [
                                Return(
                                    // f1(n-1) * n
                                    Multiply(
                                        Call(Var('f1'), [Minus(Var('n'), Num(1))]),
                                        Var('n'),
                                    )
                                ),
                            ]
                        ),
                    ),
                ]),
            ),
        ),
        Declaration(
            Var('a'),
            Num(4),
        ),
        // f1(a)
        Call(Var('f1'), [Var('a')])
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    ensure(24 === output, 'test_Function_Recursion_1')
}

// 闭包
const testBibk1 = () => {
    // var a = 100
    // var f1 = function() {
    //     var b = 1
    //     var f2 = function() {
    //         b = b + 1
    //         return b
    //     }
    //     return f2
    // }
    // var c = f1()
    // log(c()) // 输出2
    // log(c()) // 输出3
    // var output = c() // 得到4

    const ast = [
        Declaration(Var('a'), Num(100)),
        Call(Var('log'), [Var('a')]),
        Declaration(Var('f1'), Fun([], Block(
            [
                Declaration(Var('b'), Num(1)),
                Declaration(Var('f2'), Fun([], Block(
                    [
                        Assign(Var('b'), Plus(Var('b'), Num(1))),
                        Return(Var('b')),
                    ],
                ))),
                Return(Var('f2')),
            ],
        ))),
        Declaration(Var('c'), Call(Var('f1'), [])),
        Call(Var('log'), [Call(Var('c'), [])]),
        Call(Var('log'), [Call(Var('c'), [])]),
        Declaration(Var('output'), Call(Var('c'), [])),
    ]

    let env = Environment.new()

    interpret(ast, env)
    const expect = 4
    const output = env.valueOf('output')
    ensure(expect === output, 'test bibk')
}

const testBibk2 = () => {
    // const idGenerator = function() {
    //     var id = 0
    //     return function() {
    //         id += 1
    //         return id
    //     }
    // }
    //
    // const g1 = idGenerator()
    // var output = g1()
    //
    // const g2 = idGenerator()
    // log(g2())

    const ast = [
        Declaration(Var('idGenerator'), Fun([], Block(
            [
                Declaration(Var('id'), Num(0)),
                Declaration(Var('f2'), Fun([], Block(
                    [
                        Assign(Var('id'), Plus(Var('id'), Num(1))),
                        Return(Var('id')),
                    ],
                ))),
                Return(Var('f2')),
            ],
        ))),
        Declaration(Var('g1'), Call(Var('idGenerator'), [])),
        Declaration(Var('output1'), Call(Var('g1'), [])),
        Declaration(Var('output2'), Call(Var('g1'), [])),

        Declaration(Var('g2'), Call(Var('idGenerator'), [])),
        Declaration(Var('output3'), Call(Var('g2'), [])),
    ]
    let env = Environment.new()

    interpret(ast, env)

    const expect2 = 2
    const output2 = env.valueOf('output2')
    ensure(expect2 === output2, 'test bibk')

    const expect3 = 1
    const output3 = env.valueOf('output3')
    ensure(expect3 === output3, 'test bibk')
}

const testBibk3 = () => {
    // var a = 99
    // const foo = function() {
    //     var a = 1
    //     return function() {
    //         return function() {
    //             return a
    //         }
    //     }
    // }

    // const f1 = foo()
    // const f2 = f1()
    // var output1 = f2()
    // console.log(output1)
    const ast = [
        Declaration(Var('a'), Num(99)),
        Declaration(Var('foo'), Fun([], Block(
            [
                Declaration(Var('a'), Num(1)),
                Declaration(Var('f1'), Fun([], Block(
                    [
                            Declaration(Var('f2'), Fun([], Block(
                                [
                                    Return(Var('a')),
                                ],
                            ))),
                            Return(Var('f2')),
                    ],
                ))),
                Return(Var('f1')),
            ],
        ))),
        Declaration(Var('f1'), Call(Var('foo'), [])),
        Declaration(Var('f2'), Call(Var('f1'), [])),
        Declaration(Var('output1'), Call(Var('f2'), [])),

    ]
    let env = Environment.new()

    interpret(ast, env)

    const expect1 = 1
    const output1 = env.valueOf('output1')
    ensure(expect1 === output1, 'test bibk 3')

}

// 数组
const test_Array_1 = () => {
    // var a = [1]
    let ast = [
        Declaration(
            Var('a'),
            Arr([Num(1)])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [1]
    ensure(equals(output, expect), 'test_Array_1')
}

const test_Array_2 = () => {
    // var a = [1, false, 'str']
    let ast = [
        Declaration(
            Var('a'),
            Arr([
                Num(1),
                False(),
                Str('str')]
            )
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [1, false, 'str']
    ensure(equals(output, expect), 'test_Array_2')
}

const test_Array_3 = () => {
    // var a = [1, [2]]
    let ast = [
        Declaration(
            Var('a'),
            Arr([
                Num(1),
                Arr(
                    [Num(2)]
                )
            ])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [1, [2]]
    ensure(equals(output, expect), 'test_Array_3')
}

const test_Array_4 = () => {
    // var a = [1, [2, [3]]
    let ast = [
        Declaration(
            Var('a'),
            Arr([
                    Num(1),
                    Arr([
                        Num(2),
                        Arr([Num(3)])
                    ])
                ]
            )
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [1, [2, [3]]]
    ensure(equals(output, expect), 'test_Array_4')
}

const test_Array_5 = () => {
    // var a = [1]
    // a[0]

    let ast = [
        Declaration(
            Var('a'),
            Arr([Num(1)]),
        ),
        ArrayAccess(Var('a'), Num(0))
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    let expect = 1
    ensure(equals(output, expect), 'test_Array_5')
}

const test_Array_6 = () => {
    // var a = [1]
    // a[0] = 2

    let ast = [
        Declaration(
            Var('a'),
            Arr([Num(1)]),
        ),
        Assign(
            ArrayAccess(
                Var('a'),
                Num(0)
            ),
            Num(2)
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [2]
    ensure(equals(output, expect), 'test_Array_6')
}


// 对象/字典
const test_Object_1 = () => {
    // var o = {
    //     a: 1
    // }
    let ast = [
        Declaration(
            Var('o'),
            Obj([
                objectProperty(
                    Var('a'),
                    Num(1)
                )
            ])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('o')
    let expect = {
        a: 1
    }
    ensure(equals(output, expect), 'test_Object_1')
}

const test_Object_2 = () => {
    // var o = {
    //     a: 1,
    //     b: [1]
    // }
    let ast = [
        Declaration(
            Var('o'),
            Obj([
                objectProperty(
                    Var('a'),
                    Num(1)
                ),
                objectProperty(
                    Var('b'),
                    Arr([Num(1)])
                )
            ])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('o')
    let expect = {
        a: 1,
        b: [1]
    }
    ensure(equals(output, expect), "test_Object_2")
}

const test_Object_3 = () => {
    // var o = {
    //     a: 1,
    //     b: [2]
    //     c: {
    //         d: 3
    //     }
    // }
    let ast = [
        Declaration(
            Var('o'),
            Obj([
                objectProperty(
                    Var('a'),
                    Num(1)
                ),
                objectProperty(
                    Var('b'),
                    Arr([Num(2)])
                ),
                objectProperty(
                    Var('c'),
                    Obj([
                        objectProperty(
                            Var('d'),
                            Num(3)
                        )]
                    )
                ),
            ])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('o')
    let expect = {
        a: 1,
        b: [2],
        c: {
            d: 3
        }
    }
    ensure(equals(output, expect), 'test_Object_3')
}

const test_Object_4 = () => {
    // var o = {
    //     a: 1
    // }
    // o.a
    let ast = [
        Declaration(
            Var('o'),
            Obj([
                objectProperty(
                    Var('a'),
                    Num(1)
                )
            ])
        ),
        DotAccess(Var('o'), Var('a'))
    ]
    let env = Environment.new()

    let output = interpret(ast, env)
    let expect = 1
    ensure(output === expect, 'test_Object_4')
}

const test_Object_5 = () => {
    // var o = {
    //     a: 1
    // }
    // o.a = 2
    let ast = [
        Declaration(
            Var('o'),
            Obj([
                objectProperty(
                    Var('a'),
                    Num(1))
                ]
            )
        ),
        Assign(
            DotAccess(
                Var('o'),
                Var('a')
            ),
            Num(2)
        )
    ]
    let env = Environment.new()

    interpret(ast, env)

    let output = env.valueOf('o')
    let expect = {
        a: 2,
    }
    ensure(equals(output, expect), 'test_Object_5')
}

const test_Object_6 = () => {
    // var a = [{
    //     b: 1
    // }]
    let ast = [
        Declaration(
            Var('a'),
            Arr([
                Obj([
                    objectProperty(
                        Var('b'),
                        Num(1)
                    )
                ])
            ])
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [{
        b: 1
    }]
    ensure(equals(output, expect), 'test_Object_6')
}

const test_Object_7 = () => {
    // var a = [{
    //     b: 1
    // }]
    // a[0].b = 2
    let ast = [
        Declaration(
            Var('a'),
            Arr([
                Obj([
                    objectProperty(
                        Var('b'),
                        Num(1))
                ])
            ])
        ),
        Assign(
            DotAccess(
                ArrayAccess(Var('a'), Num(0)),
                Var('b')
            ),
            Num(2)
        )
    ]
    let env = Environment.new()

    interpret(ast, env)
    let output = env.valueOf('a')
    let expect = [{
        b: 2
    }]
    ensure(equals(output, expect), "test_Object_7")
}

// 类
const testClass1 = () => {
    // const A = class() {}

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([])),
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let A = env.valueOf('A')
    ensure(A.__isClass === true, 'test class 1')
}

const testClass2 = () => {
    // const A = class() {
    //     const new = function() {}
    // }
    // let o = A.new()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), []),
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let o = env.valueOf('o')
    let A = env.valueOf('A')
    ensure(o.__class === A, 'test class 2')
}

const testClass3 = () => {
    // const A = class() {
    //     const new = function() {
    //         var this.name = 'name'
    //     }
    // }
    // let o = A.new()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Str('name'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let o = env.valueOf('o')
    let A = env.valueOf('A')
    let c1 = o.__class === A
    let c2 = o.name === 'name'
    ensure(c1 && c2, 'test class 3')
}

const testClass4 = () => {
    // const A = class() {
    //     const new = function() {
    //         var this.name = 'name'
    //         this.name = 'new name'
    //     }
    // }
    // let o = A.new()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Str('name'),
                        ),
                        Assign(
                            DotAccess(Var('this'), Var('name')),
                            Str('new name'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let o = env.valueOf('o')
    let A = env.valueOf('A')
    let c1 = o.__class === A
    let c2 = o.name === 'new name'
    ensure(c1 && c2, 'test class 4')
}

const testClass5 = () => {
    // const A = class() {
    //     const new = function(n) {
    //         var this.name = n
    //     }
    // }
    // let o = A.new('a')

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([Var('n')], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Var('n'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [Str('a')])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let o = env.valueOf('o')
    let A = env.valueOf('A')
    let c1 = o.__class === A
    let c2 = o.name === 'a'
    ensure(c1 && c2, 'test class 5')
}

const testClass6 = () => {
    // const A = class() {
    //     const new = function() {}
    //     const one = function() {
    //         return 1
    //     }
    // }
    // let o = A.new()
    // let r = o.one()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([])),
                ),
                Declaration(
                    Var('one'),
                    Fun([], Block([
                        Return(Num(1))
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [])
        ),
        Declaration(
            Var('r'),
            Call(DotAccess(
                Var('o'),
                Var('one'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let r = env.valueOf('r')
    ensure(r === 1, 'test class 6')
}

const testClass7 = () => {
    // const A = class() {
    //     const new = function() {}
    //     const f = function(n) {
    //         return n
    //     }
    // }
    // let o = A.new()
    // let r = o.f(3)

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([])),
                ),
                Declaration(
                    Var('f'),
                    Fun([Var('n')], Block([
                        Return(Var('n'))
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [])
        ),
        Declaration(
            Var('r'),
            Call(DotAccess(
                Var('o'),
                Var('f'),
            ), [Num(3)])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let r = env.valueOf('r')
    ensure(r === 3, 'test class 7')
}

const testClass8 = () => {
    // const A = class() {
    //     const new = function(a) {
    //         var this.a = a
    //     }
    //     const plus = function(n) {
    //         this.a = this.a + n
    //     }
    // }
    // let o = A.new(3)
    // o.plus(5)

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([Var('a')], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('a')),
                            Var('a'),
                        ),
                    ])),
                ),
                Declaration(
                    Var('plus'),
                    Fun([Var('n')], Block([
                        Assign(
                            DotAccess(Var('this'), Var('a')),
                            Plus(
                                DotAccess(Var('this'), Var('a')),
                                Var('n'),
                            ),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [Num(3)])
        ),
        Call(DotAccess(
            Var('o'),
            Var('plus'),
        ), [Num(5)]),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let o = env.valueOf('o')
    let a = o.a
    ensure(a === 8, 'test class 8')
}

const testClass9 = () => {
    // const A = class() {
    //     const class.n = 1
    // }
    // let n = A.n

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    DotAccess(Var('class'), Var('n')),
                    Num(1),
                ),
            ])),
        ),
        Declaration(
            Var('n'),
            DotAccess(
                Var('A'),
                Var('n'),
            ),
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let n = env.valueOf('n')
    ensure(n === 1, 'test class 9')
}

const testClass10 = () => {
    // const A = class() {
    //     const class.one = function() {
    //         return 1
    //     }
    // }
    // let n = A.one()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    DotAccess(Var('class'), Var('one')),
                    Fun([], Block([
                        Return(Num(1)),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('n'),
            Call(DotAccess(
                Var('A'),
                Var('one'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let n = env.valueOf('n')
    ensure(n === 1, 'test class 10')
}

const testClass11 = () => {
    // const A = class() {
    //     var class.a = 1
    //     const class.plus = function(n) {
    //         class.a = class.a + n
    //     }
    // }
    // A.plus(2)

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    DotAccess(Var('class'), Var('a')),
                    Num(1),
                ),
                Declaration(
                    DotAccess(Var('class'), Var('plus')),
                    Fun([Var('n')], Block([
                        Assign(
                            DotAccess(Var('class'), Var('a')),
                            Plus(
                                DotAccess(Var('class'), Var('a')),
                                Var('n'),
                            ),
                        ),
                    ])),
                ),
            ])),
        ),
        Call(DotAccess(
            Var('A'),
            Var('plus'),
        ), [Num(2)]),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let A = env.valueOf('A')
    let a = A.a
    ensure(a === 3, 'test class 11')
}

const testClass12 = () => {
    // const A = class() {
    //     const new = function() {}
    //     var class.a = 1
    //     const plus = function(n) {
    //         return class.a + n
    //     }
    // }
    // let o = A.new()
    // let r = o.plus(2)

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([])),
                ),
                Declaration(
                    DotAccess(Var('class'), Var('a')),
                    Num(1),
                ),
                Declaration(
                    Var('plus'),
                    Fun([Var('n')], Block([
                        Return(
                            Plus(
                                DotAccess(Var('class'), Var('a')),
                                Var('n'),
                            ),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('A'),
                Var('new'),
            ), [])
        ),
        Declaration(
            Var('r'),
            Call(DotAccess(
                Var('o'),
                Var('plus'),
            ), [Num(2)])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let r = env.valueOf('r')
    ensure(r === 3, 'test class 12')
}

// 类继承
const testClassExtend1 = () => {
    // const A = class() {}
    // const B = class(A) {}

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([])),
        ),
        Declaration(
            Var('B'),
            ClassExtend(Var('A'), Block([])),
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let A = env.valueOf('A')
    let B = env.valueOf('B')
    let c1 = B.__isClass === true
    let c2 = B.__parent === A
    ensure(c1 && c2, 'test class extend 1')
}

const testClassExtend2 = () => {
    // const A = class() {
    //     const new = function() {
    //         var this.name = 'name'
    //     }
    // }
    // const B = class(A) {
    //     const new = function() {
    //         super.new()
    //     }
    // }
    // var o = B.new()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Str('name'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('B'),
            ClassExtend(Var('A'), Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Call(DotAccess(
                            Var('super'),
                            Var('new'),
                        ), [])
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('B'),
                Var('new'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let B = env.valueOf('B')
    let o = env.valueOf('o')
    // log('o', o)
    let c1 = o.name === 'name'
    let c2 = o.__class === B
    ensure(c1 && c2, 'test class extend 2')
}

const testClassExtend3 = () => {
    // const A = class() {
    //     const new = function() {
    //         var this.name = 'name'
    //     }
    // }
    // const B = class(A) {
    //     const new = function() {
    //         super.new()
    //         var this.age = 1
    //     }
    // }
    // var o = B.new()

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Str('name'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('B'),
            ClassExtend(Var('A'), Block([
                Declaration(
                    Var('new'),
                    Fun([], Block([
                        Call(DotAccess(
                            Var('super'),
                            Var('new'),
                        ), []),
                        Declaration(
                            DotAccess(Var('this'), Var('age')),
                            Num(1),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('B'),
                Var('new'),
            ), [])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let B = env.valueOf('B')
    let o = env.valueOf('o')
    // log('o', o)
    let c1 = o.name === 'name'
    let c2 = o.age === 1
    let c3 = o.__class === B
    ensure(c1 && c2 && c3, 'test class extend 3')
}

const testClassExtend4 = () => {
    // const A = class() {
    //     const new = function(n) {
    //         var this.name = n
    //     }
    // }
    // const B = class(A) {
    //     const new = function(n) {
    //         super.new(n)
    //     }
    // }
    // var o = B.new('good')

    let ast = [
        Declaration(
            Var('A'),
            Class(Block([
                Declaration(
                    Var('new'),
                    Fun([Var('n')], Block([
                        Declaration(
                            DotAccess(Var('this'), Var('name')),
                            Var('n'),
                        ),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('B'),
            ClassExtend(Var('A'), Block([
                Declaration(
                    Var('new'),
                    Fun([Var('n')], Block([
                        Call(DotAccess(
                            Var('super'),
                            Var('new'),
                        ), [Var('n')]),
                    ])),
                ),
            ])),
        ),
        Declaration(
            Var('o'),
            Call(DotAccess(
                Var('B'),
                Var('new'),
            ), [Str('good')])
        ),
    ]
    let env = Environment.new()
    interpret(ast, env)

    let B = env.valueOf('B')
    let o = env.valueOf('o')
    // log('o', o)
    let c1 = o.name === 'good'
    let c2 = o.__class === B
    ensure(c1 && c2, 'test class extend 4')
}

const __main = () => {
    testExpression1()
    testExpression2()
    testExpression3()
    testExpression4()

    testDeclaration1()
    testDeclaration2()
    testDeclaration3()
    testDeclaration4()
    testDeclaration5()

    testIf1()
    testIf2()
    testIf3()

    test_while_1()
    test_for_1()

    test_Function_1()
    test_Function_2()
    test_Function_3()
    test_Function_4()
    test_Function_5()
    test_Function_6()
    test_Function_7()
    test_Function_If_1()
    test_Function_Recursion_1()

    testBibk1()
    testBibk2()
    testBibk3()

    test_Array_1()
    test_Array_2()
    test_Array_3()
    test_Array_4()
    test_Array_5()
    test_Array_6()

    test_Object_1()
    test_Object_2()
    test_Object_3()
    test_Object_4()
    test_Object_5()
    test_Object_6()
    // test_Object_7()

    testClass1()
    testClass2()
    testClass3()
    testClass4()
    testClass5()
    testClass6()
    testClass7()
    testClass8()
    testClass9()
    testClass10()
    testClass11()
    testClass12()

    // testClassExtend1()
    // testClassExtend2()
    // testClassExtend3()
    // testClassExtend4()
}

__main()
