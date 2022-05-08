const priority = (t) => {
    let p = {
        parenthesesLeft: 1,
        or: 2,
        and: 3,
        equal: 4,
        notEqual: 4,
        greaterThan: 5,
        greaterEqual: 5,
        lessThan: 5,
        lessEqual: 5,
        plus: 6,
        minus: 6,
        multiply: 7,
        divide: 7,
        mod: 7,
        not: 8,
        dot: 9,
    }
    let n = t.tokenType.enumName
    return p[n]
}

const isOperator = (type) => {
    let ops = [TokenType.or, TokenType.and, TokenType.equal, TokenType.notEqual, TokenType.greaterThan, TokenType.greaterEqual,
        TokenType.lessThan, TokenType.lessEqual, TokenType.plus, TokenType.minus, TokenType.multiply, TokenType.divide, TokenType.mod,
        TokenType.not, TokenType.dot,
    ]
    // for (let op of ops) {
    //     if (isType(t, op)) {
    //         return true
    //     }
    // }
    // return false
    if (ops.includes(type)) {
        return true
    } else {
        return false
    }
}

// 处理数组
const parserArray = (tokens, index) => {
    let i = index
    let elements = []
    while (i < tokens.length) {
        let token = tokens[i]
        if (token.tokenType === TokenType.bracketLeft) {
            let [e, length] = parserArray(tokens, i)
            elements.push(e)
            i += length
        } else if (token.tokenType === TokenType.bracketRight) {
            let ast = {
                type: AstType.ExpressionArray,
                elements: elements,
            }
            return [ast, i - index + 1]
        } else if (token.tokenType === TokenType.semicolon) {
            i += 1
        } else {
            let commaIndex = -1
            for (let j = i; j < tokens.length; j++) {
                let item = tokens[j]
                if (item.tokenType === TokenType.comma) {
                    commaIndex = j
                    break
                }
            }
            let tempTokens = tokens.slice(i, commaIndex)
            let [ast, length] = parser(tempTokens)
            elements.push(ast)
            i += length + 1
        }
    }
}

// 处理对象
const parserObject = (tokens, index) => {
    let i = index
    let properties = []
    while (i < tokens.length) {
        let token = tokens[i]
        if (token.tokenType === TokenType.curlyLeft) {
            let [e, length] = parserObject(tokens, i)
            properties.push(e)
            i += length
        } else if (token.tokenType === TokenType.curlyRight) {
            let ast = {
                type: AstType.ExpressionObject,
                properties: properties,
            }
            return [ast, i - index + 1]
        } else if (token.tokenType === TokenType.semicolon) {
            i += 1
        } else {
            // 找到逗号下标
            let commaIndex = -1
            for (let j = i; j < tokens.length; j++) {
                let item = tokens[j]
                if (item.tokenType === TokenType.comma) {
                    commaIndex = j
                    break
                }
            }
            let tempTokens = tokens.slice(i, commaIndex)
            // 找到冒号在 tempTokens 中的下标
            let colonIndex = -1
            for (let j = 0; j < tempTokens.length; j++) {
                let item = tempTokens[j]
                if (item.tokenType === TokenType.comma) {
                    colonIndex = j
                    break
                }
            }
            // 左边的 token 作为对象的 key
            let [keyToken] = tempTokens.slice(0, colonIndex - 1)
            // 右边的 token 跑一遍 parser 解析成对应 ast
            let valueToken = tempTokens.slice(colonIndex)
            let [valueAst, length] = parser(valueToken)
            // 构建 ast
            let ast = {
                type: AstType.PropertyObject,
                key: keyToken,
                value: valueAst,
            }
            properties.push(ast)
            i += tempTokens.length + 1
        }
    }
}

// 处理函数入参
const parserParams = (tokens, index) => {
    let params = []
    // 
    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.variable) {
            params.push(token)
        }
        if (token.tokenType === TokenType.parenthesesRight) {
            break
        }
        index += 1
    }
    return [params, index]
}

// 处理 body
const parserBody = (tokens, index) => {
    let curlyCount = 1
    let body = []
    let start = index

    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.curlyLeft) {
            curlyCount += 1
        } else if (token.tokenType === TokenType.curlyRight) {
            curlyCount -= 1
        }
        if (curlyCount === 0) {
            let t = tokens.slice(start, index)
            let ast = parser(t)
            log(ast)
            break
        }
        index += 1
    }
}

// 处理函数
const parserFunction = (tokens, index) => {
    let [params, i] = parserParams(tokens, index)
    log('pppp', params)
    let [body, offset] = parserBody(tokens, i + 1)
    log('bbbb', body)
}

const parser = (tokens) => {
    let stackOperator = []
    let stackNode = []

    let index = 0
    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.keyword) {
            // token 是关键字
            if (token.tokenValue === 'var') {
                // 赋值操作
                // = 的下标
                let assignIndex = -1
                for (let i = index; i < tokens.length; i++) {
                    let t = tokens[i]
                    if (t.tokenType === TokenType.assign) {
                        assignIndex = i
                    }
                }

                // 截取 = 左边的 token，并调用 parser 转换成 ast
                let variableTokenList = tokens.slice(index + 1, assignIndex)
                let [variableAst, variableLength] = parser(variableTokenList)

                // 截取 = 右边的 token，并调用 parser 转换成 ast
                let valueTokenList = tokens.slice(assignIndex + 1)
                let [valueAst, valueLength] = parser(valueTokenList)

                let ast = {
                    type: AstType.DeclarationVariable,
                    kind: 'var',
                    variable: variableAst,
                    value: valueAst,
                }
                stackNode.push(ast)
                index += variableLength + valueLength + assignIndex - index
            } else if (token.tokenValue === 'function') {
                // 声明函数
                parserFunction(tokens, index + 1)
                index += 1
            }
        } else if (token.tokenType === TokenType.variable) {
            let next = tokens[index + 1]
            if (next && next.tokenType === TokenType.bracketLeft) {
                // 变量名后面接左方括号，说明这个变量是一个数组或对象，正在取值，方括号内部是数组下标或对象属性名
                // 把数组名/对象名放入 stackOperator 中
                stackOperator.push(token)
                index += 2
            } else if (next && next.tokenType === TokenType.parenthesesLeft) {
                // 变量名后面接左圆括号，说明这个变量是一个函数，正在调用它，圆括号内部是函数的参数列表
                // 把变量名放入 stackOperator 中
                stackOperator.push(token)
                // 因为不确定参数的个数，所以把左圆括号放入 stackNode 中，标记参数的起始位置
                stackNode.push(next)
                index += 2
            } else {
                // 如果不是以上情况直接 push 进 stackNode
                stackNode.push(token)
                index += 1
            }
        } else if (token.tokenType === TokenType.parenthesesLeft) {
            // 遇到左圆括号，说明是普通的提升运算优先级的圆括号，直接放进
            stackOperator.push(token)
            index += 1
        } else if (token.tokenType === TokenType.parenthesesRight) {
            // 遇到右圆括号
            let top = stackOperator[stackOperator.length - 1]
            if (top.tokenType === TokenType.variable) {
                stackOperator.pop()
                let params = []
                while (true) {
                    let p = stackNode.pop()
                    if (p.tokenType === TokenType.parenthesesLeft) {
                        break
                    }
                    params.unshift(p)
                }
                let ast = {
                    type: AstType.ExpressionCall,
                    callee: top,
                    arguments: params,
                }
                stackNode.push(ast)
            }
            index += 1
        } else if (token.tokenType === TokenType.bracketLeft) {
            // 单独遇到左方括号，就是构建数组
            let [ast, length] = parserArray(tokens, index + 1)
            stackNode.push(ast)
            index += length + 1
        } else if (token.tokenType === TokenType.bracketRight) {
            let top = stackOperator[stackOperator.length - 1]
            if (top && top.tokenType === TokenType.variable) {
                // stackOperator 的栈顶是数组名/对象名
                // 这时需要从 stackNode 中拿到下标节点，和数组名/对象名一起组成节点，push 进 stackNode
                stackOperator.pop()
                let offset = stackNode.pop()
                let ast = {
                    type: AstType.ExpressionMember,
                    object: top,
                    property: offset,
                }
                stackNode.push(ast)
            }
            index += 1
        } else if (token.tokenType === TokenType.curlyLeft) {
            // 遇到右花括号，就是构建字典
            let [ast, length] = parserObject(tokens, index + 1)
            stackNode.push(ast)
            index += length + 1
        } else if (token.tokenType === TokenType.number) {
            // 遇到数字直接 push
            stackNode.push(token)
            index += 1
        } else if (isOperator(token.tokenType)) {
            // 遇到表达式
            if (stackOperator.length === 0) {
                // 如果运算符栈为 0，则直接 push
                stackOperator.push(token)
            } else {
                // 当栈里有值时，判断当前运算符与 stackOperator 栈顶的优先级
                let top = stackOperator[stackOperator.length - 1]
                if (priority(top) > priority(token)) {
                    // 如果 top 优先级高于 token
                    // 把 top pop 出来再组成节点 push 进 stackNode
                    stackOperator.pop()
                    let right = stackNode.pop()
                    let left = stackNode.pop()
                    let ast = {
                        type: AstType.ExpressionBinary,
                        operator: top,
                        right: right,
                        left: left,
                    }
                    stackNode.push(ast)
                } else {
                    // 如果 top 优先级低于 token
                    // 把 token push 进 stackOperator
                    stackOperator.push(token)
                }
            }
            index += 1
        } else if (token.tokenType === TokenType.semicolon) {
            // 遇到分号，说明表达式结束
            break
        } else if (token.tokenType === TokenType.comma) {
            // 遇到逗号，逗号是函数调用中参数之间的分隔符，直接忽略
            index += 1
        } else {
            // 遇到数据，直接 push 进 stackNode
            stackNode.push(token)
            index += 1
        }
    }

    // 遍历完 token 后，stackOperator 中剩余的运算符继续组节点
    while (stackNode.length > 1) {
        let right = stackNode.pop()
        let left = stackNode.pop()
        let op = stackOperator.pop()
        if (op.tokenType === TokenType.dot) {
            if (right.type && right.type === AstType.ExpressionCall) {
                // 如果右侧是函数调用，就是类方法访问
                let ast = {
                    type: AstType.ExpressionCall,
                    callee: {
                        type: AstType.ExpressionMember,
                        object: left,
                        property: right.callee,
                    },
                    arguments: right.arguments,
                }
                stackNode.push(ast)
            } else {
                let ast = {
                    type: AstType.ExpressionMember,
                    object: left,
                    property: right,
                }
                stackNode.push(ast)
            }
        } else if (op.tokenType === TokenType.parenthesesLeft) {
            stackNode.push(left)
            stackNode.push(right)
        } else {
            let ast = {
                type: AstType.ExpressionBinary,
                operator: op,
                left: left,
                right: right,
            }
            stackNode.push(ast)
        }
    }
    return [stackNode[0], index]
}
