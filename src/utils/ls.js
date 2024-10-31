export const ls = {
    get: (key, parse = true) => {
        if (parse) {
            return JSON.parse(localStorage.getItem(key))
        }
        return localStorage.getItem(key)
    },
    set: (key, value, stringify = true) => {
        if (stringify) {
            localStorage.setItem(key, JSON.stringify(value))
        } else {
            localStorage.setItem(key, value)
        }
    }
}