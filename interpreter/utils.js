const log = console.log.bind(console)

const isArray = o => Array.isArray(o)

const isObject = o => Object.prototype.toString.call(o) === '[object Object]'

const isNumber = o => Object.prototype.toString.call(o) === '[object Number]'

const isString = o => Object.prototype.toString.call(o) === '[object String]'

const equals = (a, b) => {
    if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) {
            return false
        }
        for (let i = 0; i < a.length; i++) {
            let a1 = a[i]
            let b1 = b[i]
            if (!equals(a1, b1)) {
                return false
            }
        }
        return true
    } else if (isObject(a) && isObject(b)) {
        let keys1 = Object.keys(a)
        let keys2 = Object.keys(b)
        if (keys1.length !== keys2.length) {
            return false
        }
        for (let i = 0; i < keys1.length; i++) {
            let k1 = keys1[i]
            // let k2 = keys2[i]
            if (keys2.indexOf(k1) === -1) {
                return false
            }
            if (!equals(a[k1], b[k1])) {
                return false
            }
        }
        return true
    } else {
        return a === b
    }
}

const ensure = (condition, message) => {
    // 在条件不成立的时候, 输出 message
    if (!condition) {
        log('*** 测试失败:', message)
    }
}
