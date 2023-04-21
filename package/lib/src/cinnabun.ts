import { Component, Signal } from "."
import {
  ComponentChild,
  ComponentFunc,
  ComponentProps,
  SSRProps,
  SerializedComponent,
  WatchedElementRef,
} from "./types"
export { h, fragment } from "."

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false
  static readonly isClient: boolean = "window" in globalThis

  static hydrate(app: Component<any>, ssrProps: SSRProps) {
    console.log("hydrating", ssrProps)
    const hStart = performance.now()

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]
    app.element = ssrProps.root.children[0]

    if (
      ssrProps.component?.props &&
      Object.keys(ssrProps.component.props).length
    )
      Object.assign(app.props, ssrProps.component.props)

    const baseSerializedChild = ssrProps.component.children[0]

    for (let i = 0; i < app.children.length; i++) {
      const c = app.children[i]
      const sc = baseSerializedChild.children[i]
      const domNode = ssrProps.root.children[0].children[i]

      Cinnabun.hydrateComponent(app, c, sc, domNode)
    }

    console.log("hydration time", performance.now() - hStart)
    console.log("hydrated", tray)
  }

  static hydrateComponent(
    parent: Component<any>,
    c: ComponentChild,
    sc: SerializedComponent,
    element?: Element | ChildNode | undefined
  ) {
    if (typeof c === "string" || typeof c === "number" || c instanceof Signal) {
      return
    }
    if (typeof c === "function")
      return Cinnabun.hydrateComponentFunc(parent, c, sc, element)

    //if (c.tag.toLowerCase() === "article") debugger

    c.element = element
    if (sc && sc.props && Object.keys(sc.props).length) {
      Object.assign(c.props, sc.props)
    }
    c.bindEvents(c.props)

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc.children[i]
      const domNode = element?.childNodes[i]
      if (child instanceof Signal) {
        c.renderChild(child)
      }
      Cinnabun.hydrateComponent(c, child, sChild, domNode)
    }
  }

  static hydrateComponentFunc(
    parent: Component<any>,
    c: ComponentFunc,
    sc: SerializedComponent,
    element?: Element | ChildNode | undefined
  ) {
    Cinnabun.hydrateComponent(parent, c(...parent.childArgs), sc, element)
  }

  static bake(app: Component<any>, root: HTMLElement): void {
    const tray = new Component<any>(root.tagName, {
      children: [app],
    })
    tray.element = root
    tray.render()
  }

  static serverBake(app: Component<any>): {
    componentTree: SerializedComponent
    html: string
  } {
    let htmlData = { html: "" }
    const serialized = app.serialize(htmlData)
    return {
      componentTree: { children: [serialized], props: {} },
      html: htmlData.html,
    }
  }

  static renderDynamic(
    cmpntOrCmpntFunc: Component<any> | { (): Component<any> }
  ): Node {
    if (typeof cmpntOrCmpntFunc === "function") {
      const val = cmpntOrCmpntFunc()
      if (typeof val === "string" || typeof val === "number") return val
      return Cinnabun.renderDynamic(val)
    }
    return cmpntOrCmpntFunc.render()
  }

  static element<T extends HTMLElement>(
    tag: string,
    props: ComponentProps<T> = {}
  ): Component<T> {
    return new Component<T>(tag, props)
  }

  static svg(component: Component<any>): SVGSVGElement {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      component.tag
    )

    const { render, ...props } = component.props

    for (const [k, v] of Object.entries(props)) {
      el.setAttribute(k, v)
    }

    for (const c of component.children) {
      el.append(
        typeof c === "string"
          ? c
          : Cinnabun.svg(typeof c === "function" ? c() : c)
      )
    }

    //@ts-ignore
    return el as SVGElement
  }
  static svgToString(_: Component<any>): string {
    return "not implemented"
  }
  static serializeSvg(_: Component<any>): SerializedComponent {
    return { children: [], props: {} }
  }
}

export let componentReferences: WatchedElementRef[] = []

export const setComponentReferences = (func: {
  (arr: WatchedElementRef[]): WatchedElementRef[]
}) => {
  componentReferences = func(componentReferences)
  if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
export const addComponentReference = (ref: WatchedElementRef) => {
  componentReferences.push(ref)
  if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
