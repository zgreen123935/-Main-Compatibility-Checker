"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

type Message = {
  id: number
  text: string
  sender: "user" | "ai"
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm here to answer any questions you might have about Mysa's compatibility with your thermostat. What would you like to know?",
      sender: "ai",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = { id: messages.length + 1, text: input, sender: "user" }
      setMessages([...messages, newMessage])
      setInput("")
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: "Thank you for your question. I'm processing it and will respond shortly. Is there anything else you'd like to know?",
          sender: "ai",
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="px-6 py-4 border-b">
        <h1 className="text-2xl font-medium text-[#2D2D2D]">Mysa Assistant</h1>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user" ? "bg-[#BAE5D4] text-[#2D2D2D]" : "bg-gray-100 text-[#2D2D2D]"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="px-6 py-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

