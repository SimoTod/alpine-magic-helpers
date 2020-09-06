

const AlpineInViewMagicMethod = {
    start() {
        let observer = null;

        const whenEnterCallbacks = new WeakMap()
        const whenLeaveCallbacks = new WeakMap()
        const observed = new WeakMap()

        const handler = (entries, observer) => {
            for (let entry of entries) {
                let  target = entry.target
                if (observed.get(target) === entry.isIntersecting) {
                    continue
                }
                observed.set(target, entry.isIntersecting)

                if (entry.isIntersecting) {
                    if (whenEnterCallbacks.has(target)) {
                        whenEnterCallbacks.get(target).forEach((callback) => callback())
                    }
                } else {
                    if (whenLeaveCallbacks.has(target)) {
                        whenLeaveCallbacks.get(target).forEach((callback) => callback())
                    }
                }

                target.__alpine_parent.__x.updateElements(target.__alpine_parent)
            }
        }

        const observe = (target, $el) => {
            if (observer === null) {
                observer = new IntersectionObserver(handler)
            }
            if (!observed.has(target)) {
                observed.set(target, null)
                target.__alpine_parent = $el
                observer.observe(target)
            }
        }

        Alpine.addMagicProperty('whenEnterView', function ($el) {
            return function (target, whenEnter) {
                if (whenEnter !== null) {
                    if(!whenEnterCallbacks.has(target)) {
                        whenEnterCallbacks.set(target, new Set())
                    }
                    let callbackSet = whenEnterCallbacks.get(target)
                    if(!callbackSet.has(target)) {
                        callbackSet.add(whenEnter)
                    }
                }
                observe(target, $el)
            }
        })

        Alpine.addMagicProperty('whenLeaveView', function ($el) {
            return function (target, whenLeave) {
                if (whenLeave !== null && !whenLeaveCallbacks.has(target)) {
                    if(!whenLeaveCallbacks.has(target)) {
                        whenLeaveCallbacks.set(target, new Set())
                    }
                    let callbackSet = whenLeaveCallbacks.get(target)
                    if(!callbackSet.has(target)) {
                        callbackSet.add(whenLeave)
                    }
                }
                observe(target, $el)
            }
        })

        Alpine.addMagicProperty('inView', function ($el) {
            return function (target) {
                observe(target, $el)
                return observed.get(target)
            }
        })
    }
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    AlpineInViewMagicMethod.start()
    alpine(callback)
}

export default AlpineInViewMagicMethod
