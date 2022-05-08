class NewObject {
    static new(...args) {
        return new this(...args)
    }
}

class Process extends NewObject {
    constructor(params, body, env) {
        super()
        // this.name = name
        this.params = params
        this.body = body
        this.env = env
    }
}

class Environment extends NewObject {
    constructor(next=null) {
        super()
        this.env = {}
        this.next = next
    }

    valueOf(variableName) {
        return this.env[variableName]
    }

    binding(variableName, value) {
        this.env[variableName] = value
    }

    find(variableName) {
        let e = this
        while (e !== null) {
            let value = e.env[variableName]
            if (value === undefined) {
                e = e.next
            } else {
                return value
            }
        }
        log('class env', this.env)
        throw new Error('变量未绑定: ' + variableName)
    }

    findAndBinding(variableName, value) {
        let e = this
        while (e !== null) {
            let v = e.env[variableName]
            if (v === undefined) {
                e = e.next
            } else {
                e.env[variableName] = value
                return
            }
        }
        throw new Error('未找到变量: ' + variableName)
    }

    has(variableName) {
        return variableName in this.env
    }
}