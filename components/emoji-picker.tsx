"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const EMOJI_CATEGORIES = {
  Smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
  ],
  Gestures: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
  ],
  Hearts: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
  ],
  Objects: [
    "📝",
    "📋",
    "📌",
    "📍",
    "🔗",
    "📎",
    "🖇️",
    "📏",
    "📐",
    "✂️",
    "🖊️",
    "🖋️",
    "✒️",
    "🖍️",
    "📒",
    "📕",
    "📗",
    "📘",
    "📙",
    "📓",
    "📔",
    "📚",
    "📖",
    "🔖",
    "🏷️",
    "💼",
    "📁",
    "📂",
    "🗂️",
    "📰",
    "🗞️",
    "📄",
    "📃",
    "📑",
    "🧾",
    "📊",
    "📈",
    "📉",
  ],
  Symbols: [
    "✅",
    "❌",
    "⭐",
    "🌟",
    "💫",
    "✨",
    "⚡",
    "🔥",
    "💯",
    "❗",
    "❓",
    "‼️",
    "⁉️",
    "💡",
    "🔔",
    "🔕",
    "🎵",
    "🎶",
    "➕",
    "➖",
    "➗",
    "✖️",
    "♾️",
    "💲",
    "💱",
    "©️",
    "®️",
    "™️",
  ],
}

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [search, setSearch] = useState("")

  const allEmojis = Object.values(EMOJI_CATEGORIES).flat()
  const filteredEmojis = search
    ? allEmojis.filter(() => true) // Simple filter - in real app would filter by emoji name
    : null

  return (
    <div className="p-2">
      <Input
        placeholder="Search emojis..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
      <ScrollArea className="h-64">
        {filteredEmojis ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onSelect(emoji)}
                className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">{category}</h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => onSelect(emoji)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
