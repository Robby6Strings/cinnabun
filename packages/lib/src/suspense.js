import { Component } from "./component.js"
import { Cinnabun } from "./cinnabun.js"
import { DomInterop } from "./domInterop.js"

/**
 * @typedef {Object} SuspenseProps
 * @property {Function} promise - A function that returns a Promise.
 * @property {boolean} [cache] - Optional boolean indicating if the promise should be cached.
 * @property {boolean} [prefetch] - Optional boolean indicating if the promise should be prefetched.
 */

export class SuspenseComponent extends Component {
  /** @type { { (): Promise<any> } | undefined } */
  promiseFunc

  /** @type { Promise<any> | undefined } */
  promiseInstance

  /** @type {any} */
  promiseCache

  /**
   * @param {string} tag
   * @param {SuspenseProps & { children: [{(): Component}] }} props
   */
  constructor(tag, props) {
    super(tag, props)
  }

  get childArgs() {
    return [!this.promiseCache, this.promiseCache]
  }

  resetPromise() {
    this.promiseFunc = undefined
    this.promiseCache = undefined
  }

  /**
   * @param {((value: any) => void | PromiseLike<void>) | null | undefined} onfulfilled
   * @param {((reason: any) => PromiseLike<never>) | null | undefined} onrejected
   */
  handlePromise(onfulfilled, onrejected) {
    if (onfulfilled) {
      this.promiseCache = onfulfilled
      if (Cinnabun.isClient) {
        DomInterop.unRender(this)
        DomInterop.reRender(this)
      }
      if (!this.props.cache) this.promiseCache = undefined
    } else if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
    } else {
      console.error("handlePromise() - unhandle case 'unknown'")
      debugger //todo
    }
  }

  /** @param {{ (): Promise<any> } | undefined} promiseFunc */
  setPromise(promiseFunc) {
    if (!this.promiseFunc && promiseFunc) {
      this.promiseFunc = promiseFunc
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    } else if (this.promiseFunc && !this.props.cache) {
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    }
  }
}

/**
 * @param {SuspenseProps} param0
 * @param {[{():Component}]} children
 * @returns {SuspenseComponent}
 */
export const Suspense = ({ prefetch, promise, cache }, children) => {
  return new SuspenseComponent("", { prefetch, promise, cache, children })
}
