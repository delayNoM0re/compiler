const quoteStringEnd = function(s, index, quote) {
    let result = ''
    let length = 0
    let escape = {
        'b': '\b',
        'f': '\f',
        'n': '\n',
        'r': '\r',
        'v': '\v',
        't': '\t',
        "'": "\'",
        '"': '\"',
        '\\': '\\',
        '/': '\/'
    }
    for (let i = index; i < s.length; i++) {
        let c = s[i]
        if (c === '\\') {
            let next = s[i + 1]
            if (escape.hasOwnProperty(next)) {
                result += escape[next]
                i += 1
                length += 2
            } else {
                result += c
                length += 1
            }
        } else if (c === quote) {
            return [result, length]
        } else {
            result += c
            length += 1
        }
    }
}

const numberEnd = (s, begin) => {
    let digit = '-.0123456789xbABCDEF'
    let result = ''
    let index = 0
    for (let i = begin; i < s.length; i++) {
        let c = s[i]
        if (!digit.includes(c)) {
            return [result, index]
        }
        result += c
        index += 1
    }
    return [result, index]
}

const stringEnd = (s, begin) => {
    let letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    let index = 0
    for (let i = begin; i < s.length; i++) {
        let c = s[i]
        if (!letter.includes(c)) {
            return [result, index]
        }
        result += c
        index += 1
    }
    return [result, index]
}

const keywordEnd = (s, begin) => {
    let t = 'true'
    let f = 'false'
    let n = 'null'
    let v = 'var'
    let c = 'const'

    if (s.slice(begin, begin + t.length) === t) {
        return [true, t.length]
    } else if (s.slice(begin, begin + f.length) === f) {
        return [false, f.length]
    } else if (s.slice(begin, begin + n.length) === n) {
        return [null, n.length]
    } else if (s.slice(begin, begin + v.length) === v) {
        let [vn, length] = stringEnd(s, begin + v.length + 1)
        return [[v, vn], v.length + length + 1]
    } else if (s.slice(begin, begin + c.length) === c) {
        let [vn, length] = stringEnd(s, begin + c.length + 1)
        return [[c, vn], c.length + length + 1]
    } else {
        let [k, length] = stringEnd(s, begin)
        return [k, length]
    }
}

const logicSymbolEnd = (s, begin) => {
    let symbol = '=><!+-/*%'
    let result = ''
    let index = 0
    for (let i = begin; i < s.length; i++) {
        let c = s[i]
        if (!symbol.includes(c)) {
            return [result, index]
        }
        result += c
        index += 1
    }
    return [result, index]
}

const operatorTokenType = (token) => {
    let tokenType = {
        '+': TokenType.plus,
        '-': TokenType.divide,
        '*': TokenType.multiply,
        '/': TokenType.minus,
        '%': TokenType.mod,
        '=': TokenType.assign,
        '>': TokenType.greaterThan,
        '<': TokenType.lessThan,
        '>=': TokenType.greaterEqual,
        '<=': TokenType.lessEqual,
        '+=': TokenType.assignPlus,
        '-=': TokenType.assignDivide,
        '*=': TokenType.assignMultiply,
        '/=': TokenType.assignMinus,
        '%=': TokenType.assignMod,
    }
    let type = tokenType[token]
    return type
}

const keywordTokenType = (token) => {
    let tokenType = {
        'true': TokenType.boolean,
        'false': TokenType.boolean,
        'null': TokenType.null,
        'var': TokenType.keyword,
        'const': TokenType.keyword,
        'function': TokenType.keyword,
        'class': TokenType.keyword,
        'if': TokenType.keyword,
        'else': TokenType.keyword,
        'while': TokenType.keyword,
        'for': TokenType.keyword,
        'break': TokenType.keyword,
        'continue': TokenType.keyword,
        'return': TokenType.keyword,
        'and': TokenType.and,
        'not': TokenType.not,
        'or': TokenType.or,
    }
    if (tokenType.hasOwnProperty(token)) {
        let type = tokenType[token]
        return type
    } else {
        return TokenType.variable
    }
}

const symbolTokenType = (token) => {
    let tokenType = {
        '[': TokenType.bracketLeft,
        ']': TokenType.bracketRight,
        '{': TokenType.curlyLeft,
        '}': TokenType.curlyRight,
        '(': TokenType.parenthesesLeft,
        ')': TokenType.parenthesesRight,
        '.': TokenType.dot,
        ',': TokenType.comma,
        ':': TokenType.colon,
        ';': TokenType.semicolon,
    }
    let type = tokenType[token]
    return type
}

const toTokens = (s) => {
    let a = s.split('\n')
    // a = a.filter(item => item.trim())
    s = a.join('\n')
    // log('a', a)
    // s = s.trim()
    // s += '\n'
    let digit = '0123456789'
    let letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let symbol = '=><!+/*%'

    let tokens = []
    let index = 0
    while (index < s.length) {
        let c = s[index]
        if (c === ' ') {
            index += 1
        } else if (c === '\n') {
            // tokens.push(';')
            let token = {
                tokenValue: ';',
                tokenType: TokenType.semicolon,
            }
            tokens.push(token)
            index += 1
        } else if (c === '-') {
            let next = s[index + 1]
            if (digit.includes(next)) {
                let [num, length] = numberEnd(s, index)
                num = Number(num)
                // tokens.push(num)
                let token = {
                    tokenValue: num,
                    tokenType: TokenType.number,
                }
                tokens.push(token)
                index += length
            } else {
                let [sym, length] = logicSymbolEnd(s, index)
                tokens.push(sym)
                index += length
            }
        } else if (digit.includes(c)) {
            let [num, length] = numberEnd(s, index)
            num = Number(num)
            // tokens.push(num)
            let token = {
                tokenValue: num,
                tokenType: TokenType.number,
            }
            tokens.push(token)
            index += length
        } else if (c === '"') {
            let [str, length] = quoteStringEnd(s, index + 1, '"')
            tokens.push(str)
            index += length + 2
        } else if (c === "'") {
            let [str, length] = quoteStringEnd(s, index + 1, "'")
            tokens.push(str)
            index += length + 2
        } else if (letter.includes(c)) {
            let [keyword, length] = keywordEnd(s, index)
            if (isArray(keyword)) {
                // tokens = tokens.concat(keyword)
                let token = keyword.map(item => {
                    return {
                        tokenValue: item,
                        tokenType: keywordTokenType(item)
                    }
                })
                tokens = tokens.concat(token)
            } else {
                // tokens.push(keyword)
                let token = {
                    tokenValue: keyword,
                    tokenType: keywordTokenType(keyword),
                }
                tokens.push(token)
            }
            index += length
        } else if (symbol.includes(c)) {
            let [sym, length] = logicSymbolEnd(s, index)
            // tokens.push(sym)
            let token = {
                tokenValue: sym,
                tokenType: operatorTokenType(sym),
            }
            tokens.push(token)
            index += length
        } else {
            // tokens.push(c)
            if (c === ']' && tokens[tokens.length - 1].tokenValue !== '[') {
                let t = {
                    tokenValue: ',',
                    tokenType: TokenType.comma,
                }
                tokens.push(t)
            }
            if (c === ')') {
                let t = {
                    tokenValue: ',',
                    tokenType: TokenType.comma,
                }
                // 处理 for 循环后面加分号
                let left = tokens.findIndex(e => e.tokenValue === '(')
                if (left !== -1) {
                    let token = tokens[left - 1]
                    if (token.tokenValue === 'for') {
                        t = {
                            tokenValue: ';',
                            tokenType: TokenType.semicolon,
                        }
                    }
                }
                tokens.push(t)
            }
            let token = {
                tokenValue: c,
                tokenType: symbolTokenType(c),
            }
            tokens.push(token)
            index += 1
        }
    }
    log('tokens', tokens)
    return tokens
}

// const test = () => {
//     testNumber()
//     testString()
//     testKeyword()
//     testLogicSymbol()
//     testCalculator()
//     testVariable()
//     testGualangCode()
// }

// const _main = () => {
//     test()
// }

// _main()
