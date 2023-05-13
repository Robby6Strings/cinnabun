import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { GenericComponent } from "cinnabun/types"
import { IChatMessage } from "../../types/chat.js"
import { LiveSocket } from "../../client/liveSocket.js"
import { prefetchChatMessages } from "../../server/actions/chat.js"
import { getUser, userStore } from "../../state.js"

let serverData = Cinnabun.createSignal<IChatMessage[]>([])

export const ChatMessageList = () => {
  if (!cb.isClient) {
    prefetchChatMessages().then((res) => {
      if (res.error) {
        console.log("ChatMessageList err", res)
        return
      }
      serverData.value = res.data
    })
  }

  const chatMessages = cb.isClient
    ? cb.getRuntimeService(LiveSocket).chatMessages
    : serverData

  return (
    <div
      className="chat-message-list"
      watch={[chatMessages, userStore]}
      bind:render
    >
      {() => (
        <>
          {...chatMessages.value.map((message: IChatMessage) => (
            <ChatMessageItem message={message} />
          ))}
        </>
      )}
    </div>
  )
}

const ChatMessageItem = ({ message }: { message: IChatMessage }) => {
  const isOwnMessage = (userData: { username: string } | null | undefined) =>
    message.username === userData?.username
  return (
    <div
      watch={userStore}
      bind:className={(self: GenericComponent) =>
        `chat-message ${isOwnMessage(getUser(self)) ? "is-owner" : ""}`
      }
    >
      <div className="chat-message-inner">
        <sup className="chat-message-sender">{message.username}</sup>
        <p>{message.contents}</p>
      </div>
    </div>
  )
}
