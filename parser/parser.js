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
    let ops = [
        TokenType.or,
        TokenType.and,
        TokenType.equal,
        TokenType.notEqual,
        TokenType.greaterThan,
        TokenType.greaterEqual,
        TokenType.lessThan,
        TokenType.lessEqual,
        TokenType.plus,
        TokenType.minus,
        TokenType.multiply,
        TokenType.divide,
        TokenType.mod,
        TokenType.not,
        TokenType.dot,
    ]
    if (ops.includes(type)) {
        return true
    } else {
        return false
    }
}

const isAssignsToken = (token) => {
    let assign1 = token.tokenType === TokenType.assign
    let assign2 = token.tokenType === TokenType.assignPlus
    let assign3 = token.tokenType === TokenType.assignMinus
    let assign4 = token.tokenType === TokenType.assignMultiply
    let assign5 = token.tokenType === TokenType.assignDivide
    return assign1 || assign2 || assign3 || assign4 || assign5
}

// 处理数组
const parserArray = (tokens, index) => {
    let bracketCount = 0
    let elements = []
    let start = index + 1

    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.bracketLeft) {
            bracketCount += 1
        } else if (token.tokenType === TokenType.bracketRight) {
            bracketCount -= 1
        }

        // 遇到 , 说明逗号前是一个数组元素或者表达式
        // 而且在 tokenizer 给数组尾元素插入了尾逗号
        // 所以可以根据逗号取每一个数组元素
        if (token.tokenType === TokenType.comma) {
            let t = tokens.slice(start, index)
            let [ast, offset] = parserExpression(t)
            start = index + 1
            index += offset
            elements.push(ast)
        }

        // 检测是否遇到数组结尾
        if (bracketCount === 0) {
            break
        }
        index += 1
    }
    let ast = {
        type: AstType.ExpressionArray,
        elements,
    }
    return [ast, index]
}

// 处理对象
const parserObject = (tokens, index) => {
    let i = index + 1
    let properties = []
    while (i < tokens.length) {
        let token = tokens[i]
        if (token.tokenType === TokenType.curlyLeft) {
            let [e, length] = parserObject(tokens, i + 1)
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
            let [valueAst, length] = parserExpression(valueToken)
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

// 处理变量
const parserValue = (tokens, index) => {
    let token = tokens[index]
    if (token.tokenType === TokenType.bracketLeft) {
        return parserArray(tokens, index)
    } else if (token.tokenType === TokenType.curlyLeft) {
        return parserObject(tokens, index)
    } else if (token.tokenType === TokenType.keyword && token.tokenValue === 'function') {
        return parserFunction(tokens, index)
    }  else if (token.tokenType === TokenType.keyword && token.tokenValue === 'class') {
        return parserClass(tokens, index)
    } else {
        let [ast, offset] = parserExpression(tokens, index)
        return [ast, offset]
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
    let curlyCount = 0
    let body = []
    let start = index + 1

    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.curlyLeft) {
            curlyCount += 1
        } else if (token.tokenType === TokenType.curlyRight) {
            curlyCount -= 1
        }
        if (curlyCount === 0) {
            let t = tokens.slice(start + 1, index)
            let ast = parser(t)
            if (ast !== undefined) {
                body.push(...ast)
            }
            break
        }
        index += 1
    }
    let ast = {
        type: AstType.StatementBlock,
        body,
    }
    return [ast, index]
}

// 处理函数
const parserFunction = (tokens, index) => {
    let [params, i] = parserParams(tokens, index)
    let [body, offset] = parserBody(tokens, i + 1)
    let ast = {
        type: AstType.ExpressionFunction,
        params,
        body,
    }
    return [ast, offset]
}

// 处理类
const parserClass = (tokens, index) => {
    let [params, i] = parserParams(tokens, index + 1)
    let [body, offset] = parserBody(tokens, i + 1)
    let ast = {
        type: AstType.ExpressionClass,
        body,
    }
    return [ast, offset]
}

// 处理变量声明
const parserStatementDeclaration = (tokens, index) => {
    let kind = tokens[index].tokenValue
    // = 的下标
    let assignIndex = -1
    for (let i = index; i < tokens.length; i++) {
        let t = tokens[i]
        if (t.tokenType === TokenType.assign) {
            assignIndex = i
            break
        }
    }

    // 截取 = 左边的 token，并调用 parser 转换成 ast
    let variableTokenList = tokens.slice(index + 1, assignIndex)
    let [variableAst, variableLength] = parserExpression(variableTokenList)

    // 截取 = 右边的 token，并调用 parser 转换成 ast
    // let valueTokenList = tokens.slice(assignIndex + 1)
    let [valueAst, valueLength] = parserValue(tokens, assignIndex + 1)

    let ast = {
        type: AstType.DeclarationVariable,
        kind: kind,
        variable: variableAst,
        value: valueAst,
    }
    let length = valueLength
    return [ast, length]
}

// 处理变量
const parserVariable = (tokens, index) => {
    let hasAssign = false
    for (let i = index; i < tokens.length; i++) {
        let token = tokens[i]
        if (isAssignsToken(token)) {
            hasAssign = true
            break
        }
        // 遇到分号说明是语句结束
        // 说明没有找到 assign
        if (token.tokenType === TokenType.semicolon) {
            break
        }
    }
    if (hasAssign) {
        let ast = {
            type: AstType.ExpressionAssignment,
        }
        let i = index
        while (index < tokens.length) {
            let token = tokens[i]
            if (isAssignsToken(token)) {
                let t = tokens.slice(index, i)
                ast.left = parserExpression(t)[0]
                break
            }
            i += 1
        }
        ast.operator = tokens[i]
        let [right, j] = parserValue(tokens, i + 1)
        ast.right = right
        return [ast, j]
    } else {
        return []
    }
}

// 处理 if/while 条件
const parserCondition = (tokens, index) => {
    let t = tokens.slice(index)
    let i = t.findIndex(item => item.tokenType === TokenType.parenthesesRight)
    let conditionTokens = tokens.slice(index + 1, index + i)
    let [ast] = parserExpression(conditionTokens)
    return [ast, index + i]
}

// 处理 if
const parserStatementIf = (tokens, index) => {
    let [condition, i] = parserCondition(tokens, index + 1)
    let [consequent, offset] = parserBody(tokens, i + 1)

    let ast = {
        type: AstType.StatementIf,
        condition,
        consequent,
        alternate: {},
    }

    // 处理 else if 和 else 情况
    let token = tokens[offset + 1]
    if (token && token.tokenType === TokenType.keyword && token.tokenValue === 'else') {
        let next = tokens[offset + 2]
        if (next.tokenType === TokenType.keyword && next.tokenValue === 'if') {
            let [elseIfAst, j] = parserStatementIf(tokens, offset + 2)
            ast.alternate = elseIfAst
            offset = j
        } else {
            let [elseAst, j] = parserBody(tokens, offset + 2)
            ast.alternate = elseAst
            offset = j
        }
    }
    return [ast, offset]
}

// 处理 while
const parserStatementWhile = (tokens, index) => {
    let [condition, i] = parserCondition(tokens, index + 1)
    let [body, offset] = parserBody(tokens, i + 1)
    let ast = {
        type: AstType.StatementWhile,
        condition: condition,
        // while 的 condition 为 true 时，执行的作用域
        body: body
    }
    return [ast, offset]
}

// 处理 for
const parserStatementFor = (tokens, index) => {
    let [init, i] = parserStatementDeclaration(tokens, index + 2)
    let [condition, j] = parserExpression(tokens, i + 1)
    let [update, k] = parserVariable(tokens, j + 1)
    let [body, offset] = parserBody(tokens, k + 2)

    let ast = {
        init,
        condition,
        update,
        body,
    }
    return [ast, offset]
}

const parserExpression = (tokens, index = 0) => {
    let stackOperator = []
    let stackNode = []

    // let index = 0
    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.variable) {
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
            } else if (next && next.tokenType === TokenType.assign) {
                // 变量名后面接等于号，说明这个变量赋值
                let rightTokens = tokens.slice(index + 2)
                let [rightAst, length] = parser(rightTokens)
                let top = stackOperator[stackOperator.length - 1]
                if (top && top.tokenType === TokenType.dot) {
                    stackOperator.pop()
                    let object = stackNode.pop()
                    let ast = {
                        type: AstType.ExpressionAssignment,
                        operator: next,
                        left: {
                            type: AstType.ExpressionMember,
                            object: object,
                            property: token,
                        },
                        right: rightAst,
                    }
                    stackNode.push(ast)
                    index += length + 2
                }
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
        // log('left', left)
        // log('right', right)
        // log('op', op)
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

const parser = (tokens) => {
    let r = []
    let index = 0
    while (index < tokens.length) {
        let token = tokens[index]
        if (token.tokenType === TokenType.keyword) {
            // token 是关键字
            if (token.tokenValue === 'var' || token.tokenValue === 'const') {
                // 赋值操作
                let [ast, length] = parserStatementDeclaration(tokens, index)
                r.push(ast)
                index += length + 1
            } else if (token.tokenValue === 'if') {
                // if
                let [ast, length] = parserStatementIf(tokens, index)
                r.push(ast)
                index += length + 1
            } else if (token.tokenValue === 'while') {
                // while
                let [ast, length] = parserStatementWhile(tokens, index)
                r.push(ast)
                index += length + 1
            } else if (token.tokenValue === 'for') {
                // for
                let [ast, length] = parserStatementFor(tokens, index)
                r.push(ast)
                index += length + 1
            }
            continue
        }
        let [ast, length] = parserExpression(tokens, index)
        if (ast === undefined) {
            index += 1
        } else {
            r.push(ast)
            index += (length - index) + 1
        }
    }
    return r
}
