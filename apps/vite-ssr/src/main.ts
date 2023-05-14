import "./style.css"
import { Hydration } from "cinnabun/hydration"
import { SSRProps } from "cinnabun/types"
import App from "./App.js"

if ("__cbData" in window) {
  // streaming
  Hydration.hydrate(App(), window.__cbData as SSRProps)
  // non-streaming
  //Hydration.hydrate(App(), window.__cbData as SSRProps)

  //TestSerialization()
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
