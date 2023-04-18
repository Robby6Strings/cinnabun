# **Cinnabun JS**🥧

#### _Your next app will rise_

---

##### \*_As of current, the project's build settings only work with Vite._

<br >

# Getting Started

Run the following to add Cinnabon:

`npm i cinnabon`

Add the following entry to your typescript config (tsconfig.json):

```json
{
  ...
  "jsx": "preserve"
  ...
}
```

Your Vite config (vite.config.ts) should use Cinnabon's BuildSettings as per the following:

```js
import { defineConfig } from "vite"
import { BuildSettings } from "cinnabon/src/settings"

const { jsxInject, jsxFactory, jsxFragment } = BuildSettings.esbuild

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxInject,
    jsxFactory,
    jsxFragment,
  },
})
```

With your compilation settings configured, you can create a simple Cinnabon application as per the following:
<br />
<br />

_index.ts_

```js
import { Cinnabon } from "cinnabon/src/cinnabon"
import "./style.css"

import { App } from "./App"

const root = document.getElementById("app")!
Cinnabon.bake(App(), root)

```

_App.ts_

```js
import { createSignal } from "cinnabon/src"

export const App = () => {
  const count = createSignal(0)
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>Click me</button>
    </>
  )
}
```

_main.ts_

```js
import { Cinnabon } from "cinnabon/src/cinnabon"
import "./style.css"

import { App } from "./App"

const root = document.getElementById("app")!
Cinnabon.mount(App(), root)
```

<br>

# But what if I want to create a _real_ application?

Cinnabon comes out of the box with support for two-way-binding, suspenseful components and more.

<br>

### **Suspense:**

```ts
import { Suspense } from "cinnabon/src"
import { Either } from "cinnabon/src/types"
import { sleep } from "cinnabon/src/utils"

type ProductCategoriesResponse = Either<{ error: Error }, { data: string[] }>

async function getProductCategories(): Promise<ProductCategoriesResponse> {
  try {
    const res = await fetch("https://dummyjson.com/products/categories")
    if (!res.ok)
      throw new Error(res.statusText ?? "Failed to load product categories")
    await sleep(500)

    const data = await res.json()
    return { data }
  } catch (error) {
    return { error: error as Error }
  }
}

export const SuspenseExample = () => {
  return (
    <Suspense promise={getProductCategories}>
      {(loading: boolean, res?: ProductCategoriesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading...</p>

        return res && <ul>{...res.data.map((c) => <li>{c}</li>)}</ul>
      }}
    </Suspense>
  )
}
```

<br>

### **Two-way binding:**

```js
const TwoWayBindingExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>click me</button>
      <input
        value={count}
        onChange={(e) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
    </>
  )
}
```
