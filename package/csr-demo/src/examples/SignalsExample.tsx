import { createSignal } from "cinnabun"
import { Greeter } from "./Greeter"

export const SignalsExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>click me</button>
      <br />
      <br />
      <input
        style={{ textAlign: "center" }}
        value={count}
        onChange={(e) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
      <br />
      <br />
      <Greeter count={count} />
    </>
  )
}