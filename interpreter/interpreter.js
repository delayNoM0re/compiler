// 二元表达式
const applyExpressionBinary = (ast, env) => {
    let left = interpret(ast.left, env)
    let right = interpret(ast.right, env)

    // 做运算操作
    let operator = ast.operator
    if (operator.type === TokenType.plus) {
        // 加法
        return left + right
    } else if (operator.type === TokenType.minus) {
        // 减法
        return left - right
    } else if (operator.type === TokenType.multiply) {
        // 乘法
        return left * right
    } else if (operator.type === TokenType.divide) {
        // 除法
        return left * right
    } else if (operator.type === TokenType.equal) {
        // 相等
        return left === right
    } else if (operator.type === TokenType.greaterThan) {
        // 大于
        return left > right
    } else if (operator.type === TokenType.greaterEqual) {
        // 大于等于
        return left >= right
    } else if (operator.type === TokenType.lessThan) {
        // 小于
        return left < right
    } else if (operator.type === TokenType.lessEqual) {
        // 小于等于
        return left <= right
    }
}

// 变量声明
const applyDeclarationVariable = (ast, env) => {
    let variable = ast.variable
    if (variable.type === TokenType.variable) {
        // 拿到变量名称
        let name = variable.value
        // 数据可能是二维表达式或者其他情况
        // 所以将数据用 interpret 跑一遍得到值
        let value = interpret(ast.value, env)
        // 讲变量名称和数据绑定一起
        env.binding(name, value)
    } else if (variable.type === AstType.ExpressionDotAccess) {
        if (variable.object.value === 'this' || variable.object.value === 'class') {
            // 拿到变量名称
            let name = variable.property.value
            // 数据可能是二维表达式或者其他情况
            // 所以将数据用 interpret 跑一遍得到值
            let value = interpret(ast.value, env)
            // 讲变量名称和数据绑定一起
            env.binding(name, value)
        }
    }
}

// 赋值
const applyExpressionAssignment = (ast, env) => {
    // log('ast.left', ast.left)
    if (ast.left.type === TokenType.variable) {
        // 左边是变量的情况下，直接给当前环境添加变量
        let name = ast.left.value
        // 右边可能是 变量 或者 二元表达式
        // 直接跑一次 interpret 得到值
        let value = interpret(ast.right, env)
        // 改变作用域里的值
        env.findAndBinding(name, value)
    } else if (ast.left.type === AstType.ExpressionArrayAccess) {
        // 左边是访问数组变量
        // 拿到数组的变量名
        let object = ast.left.object.value
        // 去环境拿到对应的数据
        let variable = env.find(object)
        // 下标可能是表达式，先跑一遍 interpret 拿到最终数据
        let property = interpret(ast.left.property, env)

        // 右边可能是 变量 或者 二元表达式
        // 直接跑一次 interpret 得到值
        let value = interpret(ast.right, env)

        // 改变对应下标的值
        variable[property] = value
    } else if (ast.left.type === AstType.ExpressionDotAccess) {
        // 左边是访问对象变量
        // 拿到对象的变量名
        let object = ast.left.object.value
        // 变量名称
        let variable = null
        if (object === 'this' || object === 'class') {
            // 如果是 this 就直接是当前环境
            variable = env.env
        } else {
            // 去环境拿到对应的数据
            variable = env.find(object)
        }

        let property = ast.left.property.value
        // 右边可能是 变量 或者 二元表达式
        // 直接跑一次 interpret 得到值
        let value = interpret(ast.right, env)
        // 改变对应下标的值
        variable[property] = value
    }
}

// if
const applyStatementIf = (ast, env) => {
    // 条件可能是二元表达式，先用 interpret 跑一遍
    let condition = interpret(ast.condition, env)
    if (condition) {
        // 条件成立，执行 if 代码
        // if 代码在 consequent 中的 body 中
        // 将 body 作为 ast 传入 interpret 中
        // 需要创建一个 if 的作用域，放在栈顶
        let ifEnv = Environment.new(env)
        let body = ast.consequent.body
        let r = interpret(body, ifEnv)
        return r
    } else {
        // 条件不成立，执行 else 代码
        // else 代码在 alternate 中的 body 中
        // 将 body 作为 ast 传入 interpret 中
        // 需要创建一个 else 的作用域，放在栈顶
        let elseEnv = Environment.new(env)
        let body = ast.alternate.body
        let r = interpret(body, elseEnv)
        return r
    }
}

// while
const applyStatementWhile = (ast, env) => {
    while (true) {
        // 条件可能是二元表达式，先用 interpret 跑一遍
        let condition = interpret(ast.condition, env)
        if (condition) {
            // 条件成立，执行 body 代码
            // 将 body 作为 ast 传入 interpret 中
            // 需要创建一个 while 的作用域，放在栈顶
            let whileEnv = Environment.new(env)
            let body = ast.body.body
            interpret(body, whileEnv)
        } else {
            break
        }
    }
}

// for
const applyStatementFor = (ast, env) => {
    // for 循环初始化
    // 因为每次循环作用域都不一样
    // 所以先在顶层建一个初始化的作用域
    // 取出 init 部分跑 interpret 来初始化
    let initEnv = Environment.new(env)
    let init = ast.init
    interpret(init, initEnv)

    while (true) {
        // 条件可能是二元表达式，先用 interpret 跑一遍
        let condition = interpret(ast.condition, initEnv)
        if (condition) {
            // 条件成立，执行 body 代码
            // 将 body 作为 ast 传入 interpret 中
            // 需要为每一个 for 循环创建作用域，放在栈顶
            let forEnv = Environment.new(initEnv)
            let body = ast.body.body
            interpret(body, forEnv)
            // 跑完 body 代码后要跑 for 循环的更新代码
            // 更新代码在 update 中
            let update = ast.update
            interpret(update, initEnv)
        } else {
            break
        }
    }
}

// 函数
const applyExpressionFunction = (ast, env) => {
    // 要实现静态作用域，也就是函数在调用时能够基于函数定义时的环境去构建新的作用域，那就必须在定义时就把当时的环境给存下来
    // 拿到函数体和入参名称
    // 再结合当前的作用域构建一个词法闭包
    let body = ast.body.body
    let params = ast.params

    let process = Process.new(params, body, env)
    return process
}

// 调用函数
const applyExpressionCall = (ast, env) => {
    if (ast.callee.type === TokenType.variable) {
        // 普通函数调用
        // 拿到调用函数的名称
        let callee = ast.callee.value

        // 拿到函数声明时的变量
        if (callee !== 'log') {
            let process = env.find(callee)
            // 基于函数定义时的环境就是静态作用域
            // 下面一行代码换成 let envNew = Env.new(env) 就是动态作用域了，基于函数调用时解释器的环境
            let envNew = Environment.new(process.env)

            // 将入参和函数声明时的参数名称绑定
            // 函数声明时入参名称
            let params = process.params
            // 调用函数时的入参
            let args = ast.arguments
            for (let i = 0; i < args.length; i += 1) {
                let name = params[i].value
                // 入参可能是表达式，所以用 interpret 跑一下
                let value = interpret(args[i], env)
                envNew.binding(name, value)
            }

            // 将拿到函数的 body 去跑 interpret 拿到结果
            let body = process.body
            let r = interpret(body, envNew)
            return r
        } else {
            // 调用函数时的入参
            let args = ast.arguments
            let values = []
            for (let i = 0; i < args.length; i += 1) {
                // 入参可能是表达式，所以用 interpret 跑一下
                let value = interpret(args[i], env)
                values.push(value)
            }
            log(...values)
        }
    } else if (ast.callee.type === AstType.ExpressionDotAccess) {
        // 类方法调用
        let callee = ast.callee

        // 拿到对象变量的变量名
        let object = callee.object.value
        // 去环境拿到对应的数据
        let variable = env.find(object)
        // 拿到调用的函数名称
        let property = callee.property.value

        let newEnv = Environment.new(env)
        // // 给类声明的时候做一个浅拷贝
        // Object.assign(newEnv.env, variable)
        newEnv.env = variable

        let { body, params } = variable[property]
        // 调用函数时的入参
        let args = ast.arguments
        for (let i = 0; i < args.length; i += 1) {
            let name = params[i].value
            // 入参可能是表达式，所以用 interpret 跑一下
            let value = interpret(args[i], env)
            newEnv.binding(name, value)
        }

        let r = interpret(body, newEnv)

        if (property === 'new') {
            return newEnv.env
        } else {
            return r
        }
    }
}

// 数组
const applyExpressionArray = (ast, env) => {
    // 转换成最基础的值
    let values = []
    // 拿到所有的值
    let elements = ast.elements
    for (let i = 0; i < elements.length; i += 1) {
        let e = elements[i]
        // 赋值可能是变量或者表达式
        // 所以将拿到的值去跑一遍 interpret
        let v = interpret(e, env)
        values.push(v)
    }
    return values
}

// 访问数组变量
const applyExpressionArrayAccess = (ast, env) => {
    // 拿到数组的变量名
    let object = ast.object.value
    // 去环境拿到对应的数据
    let variable = env.find(object)
    // 下标可能是表达式，先跑一遍 interpret 拿到最终数据
    let property = interpret(ast.property, env)

    let r = variable[property]
    return r
}

// 对象
const applyExpressionObject = (ast, env) => {
    let r = {}
    // 拿到所有的键值对
    let properties = ast.properties
    for (let i = 0; i < properties.length; i += 1) {
        let property = properties[i]
        // 拿到 key 的名称
        let key = property.key.value
        // value 可能是表达式，先用 interpret 跑一遍
        let value = interpret(property.value, env)

        r[key] = value
    }
    return r
}

// 访问对象变量
const applyExpressionDotAccess = (ast, env) => {
    // 拿到对象变量的变量名
    let object = ast.object.value

    if (object === 'this' || object === 'class') {
        let property = ast.property.value

        let r = env.find(property)
        return r
    } else {
        // 去环境拿到对应的数据
        let variable = env.find(object)

        let property = ast.property.value

        let r = variable[property]
        return r
    }
}

// 类
const applyExpressionClass = (ast, env) => {
    // log('class ast', ast)
    let classEnv = Environment.new(env)
    classEnv.binding('__isClass', true)
    classEnv.binding('__class', classEnv.env)

    let body = ast.body.body
    interpret(body, classEnv)

    return classEnv.env
}

const interpret = (ast, env) => {
    log('interpret ast', ast)
    if (isArray(ast)) {
        let index = 0
        while (index < ast.length) {
            let node = ast[index]
            if (index === ast.length - 1) {
                return interpret(node, env)
            } else {
                interpret(node, env)
                index += 1
            }
        }
    } else {
        if (ast.type === AstType.ExpressionBinary) {
            let r = applyExpressionBinary(ast, env)
            return r
        } else if (ast.type === AstType.DeclarationVariable) {
            let r = applyDeclarationVariable(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionAssignment) {
            let r = applyExpressionAssignment(ast, env)
            return r
        } else if (ast.type === AstType.StatementIf) {
            let r = applyStatementIf(ast, env)
            return r
        } else if (ast.type === AstType.StatementWhile) {
            let r = applyStatementWhile(ast, env)
            return r
        } else if (ast.type === AstType.StatementFor) {
            let r = applyStatementFor(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionFunction) {
            let r = applyExpressionFunction(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionCall) {
            let r = applyExpressionCall(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionArray) {
            let r = applyExpressionArray(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionArrayAccess) {
            let r = applyExpressionArrayAccess(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionObject) {
            let r = applyExpressionObject(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionDotAccess) {
            let r = applyExpressionDotAccess(ast, env)
            return r
        } else if (ast.type === AstType.ExpressionClass) {
            let r = applyExpressionClass(ast, env)
            return r
        } else if (ast.type === AstType.StatementReturn) {
            let r = interpret(ast.value, env)
            return r
        } else if (ast.type === TokenType.variable) {
            let r = env.find(ast.value)
            return r
        } else {
            return ast.value
        }
    }
}
