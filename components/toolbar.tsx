"use client"

import type React from "react"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  ImageIcon,
  Link,
  Paperclip,
  Trash2,
  Download,
  Sun,
  Moon,
  Smile,
  Palette,
  Type,
  Baseline,
  Highlighter,
  Printer,
  FileText,
  Pencil,
  Eraser,
  Circle,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "./theme-provider"
import { useRef, useState } from "react"
import { EmojiPicker } from "./emoji-picker"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  editor: Editor
  onReset: () => void
  onAddAttachment: (files: FileList) => void
  title: string
  drawingEnabled: boolean
  onToggleDrawing: () => void
  brushColor: string
  onBrushColorChange: (color: string) => void
  brushSize: number
  onBrushSizeChange: (size: number) => void
  isEraser: boolean
  onToggleEraser: () => void
  onClearDrawing: () => void
}

const FONT_SIZES = [
  { label: "Small", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "Heading", value: "24px" },
]

const ACCENT_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
]

const TEXT_COLORS = [
  { label: "Default", value: null },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
]

const HIGHLIGHT_COLORS = [
  { label: "None", value: null },
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Purple", value: "#ddd6fe" },
  { label: "Cyan", value: "#a5f3fc" },
  { label: "Red", value: "#fecaca" },
]

const BRUSH_COLORS = [
  "#000000", // Black
  "#ffffff", // White
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#6b7280", // Gray
]

export function Toolbar({
  editor,
  onReset,
  onAddAttachment,
  title,
  drawingEnabled,
  onToggleDrawing,
  brushColor,
  onBrushColorChange,
  brushSize,
  onBrushSizeChange,
  isEraser,
  onToggleEraser,
  onClearDrawing,
}: ToolbarProps) {
  const { theme, toggleTheme, accentColor, setAccentColor } = useTheme()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        editor.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAddAttachment(e.target.files)
    }
    e.target.value = ""
  }

  const handleAddLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleInsertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setShowEmojiPicker(false)
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const handleDownloadTxt = () => {
    const text = editor.getText()
    const content = title ? `${title}\n${"=".repeat(title.length)}\n\n${text}` : text
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "note"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run()
  }

  const setTextColor = (color: string | null) => {
    if (color) {
      editor.chain().focus().setTextColor(color).run()
    } else {
      editor.chain().focus().unsetTextColor().run()
    }
  }

  const setHighlight = (color: string | null) => {
    if (color) {
      editor.chain().focus().setHighlight(color).run()
    } else {
      editor.chain().focus().unsetHighlight().run()
    }
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled,
  }: {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
    disabled?: boolean
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 rounded-lg transition-colors",
        isActive && (theme === "dark" ? "bg-neutral-700" : "bg-neutral-200"),
        !isActive && (theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200"),
        disabled && "opacity-40 cursor-not-allowed",
      )}
      title={title}
      style={isActive ? { color: accentColor } : undefined}
    >
      {children}
    </Button>
  )

  const Divider = () => <div className="w-px h-6 mx-1" style={{ backgroundColor: `${accentColor}40` }} />

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 p-2 print:hidden",
        theme === "dark" ? "bg-neutral-900" : "bg-white",
      )}
      style={{
        borderLeft: `2px solid ${accentColor}`,
        borderRight: `2px solid ${accentColor}`,
      }}
    >
      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={attachmentInputRef} onChange={handleAttachmentUpload} multiple className="hidden" />

      <ToolbarButton
        onClick={onToggleDrawing}
        isActive={drawingEnabled}
        title={drawingEnabled ? "Exit Drawing Mode" : "Enter Drawing Mode"}
      >
        <Pencil className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {drawingEnabled ? (
        <>
          {/* Drawing Mode Toolbar */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={onToggleEraser} isActive={isEraser} title={isEraser ? "Brush" : "Eraser"}>
              {isEraser ? <Circle className="h-4 w-4" /> : <Eraser className="h-4 w-4" />}
            </ToolbarButton>
          </div>

          <Divider />

          {/* Brush Color */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
                title="Brush Color"
              >
                <Circle className="h-4 w-4" fill={brushColor} stroke={brushColor} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-48 p-3", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
              align="start"
            >
              <div className="grid grid-cols-4 gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onBrushColorChange(color)}
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 transition-all",
                      brushColor === color ? "border-blue-500 scale-110" : "border-transparent",
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Brush Size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 gap-1.5 rounded-lg",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
                title="Brush Size"
              >
                <div
                  className="rounded-full"
                  style={{
                    width: Math.min(brushSize, 16),
                    height: Math.min(brushSize, 16),
                    backgroundColor: theme === "dark" ? "#f5f5f5" : "#171717",
                  }}
                />
                <span className="text-xs">{brushSize}px</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-48 p-3", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
              align="start"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Size</span>
                  <span>{brushSize}px</span>
                </div>
                <Slider
                  value={[brushSize]}
                  onValueChange={([value]) => onBrushSizeChange(value)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Divider />

          {/* Clear Drawing */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={onClearDrawing} title="Clear Drawing">
              <RotateCcw className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </>
      ) : (
        <>
          {/* Text Formatting */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Font Size */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2 gap-1 rounded-lg",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
                title="Font Size"
              >
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={theme === "dark" ? "bg-neutral-800 border-neutral-700" : ""}>
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={theme === "dark" ? "hover:bg-neutral-700 focus:bg-neutral-700" : ""}
                >
                  <span style={{ fontSize: size.value }}>{size.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />

          {/* Text Color & Highlighter */}
          <div className="flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg",
                    theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                  )}
                  title="Text Color"
                >
                  <Baseline className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={theme === "dark" ? "bg-neutral-800 border-neutral-700" : ""}>
                {TEXT_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color.label}
                    onClick={() => setTextColor(color.value)}
                    className={theme === "dark" ? "hover:bg-neutral-700 focus:bg-neutral-700" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{
                          backgroundColor: color.value || (theme === "dark" ? "#f5f5f5" : "#171717"),
                          borderColor: theme === "dark" ? "#525252" : "#d4d4d4",
                        }}
                      />
                      <span style={{ color: color.value || "inherit" }}>{color.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-lg",
                    theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                  )}
                  title="Highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={theme === "dark" ? "bg-neutral-800 border-neutral-700" : ""}>
                {HIGHLIGHT_COLORS.map((color) => (
                  <DropdownMenuItem
                    key={color.label}
                    onClick={() => setHighlight(color.value)}
                    className={theme === "dark" ? "hover:bg-neutral-700 focus:bg-neutral-700" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded border"
                        style={{
                          backgroundColor: color.value || "transparent",
                          borderColor: theme === "dark" ? "#525252" : "#d4d4d4",
                        }}
                      />
                      <span>{color.label}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Divider />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive("taskList")}
              title="Checkbox List"
            >
              <CheckSquare className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Code Block */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Media */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert Image">
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={handleAddLink} isActive={editor.isActive("link")} title="Add Link">
              <Link className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => attachmentInputRef.current?.click()} title="Add Attachment">
              <Paperclip className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          {/* Emoji */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
                title="Emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-80 p-0", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
              align="start"
            >
              <EmojiPicker onSelect={handleInsertEmoji} />
            </PopoverContent>
          </Popover>
        </>
      )}

      {/* Download */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg print:hidden",
              theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
            )}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn("print:hidden", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
        >
          <DropdownMenuItem
            onClick={handlePrintPDF}
            className={theme === "dark" ? "hover:bg-neutral-700 focus:bg-neutral-700" : ""}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print / Save as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDownloadTxt}
            className={theme === "dark" ? "hover:bg-neutral-700 focus:bg-neutral-700" : ""}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download as TXT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />

      {/* Reset */}
      <ToolbarButton onClick={onReset} title="Reset Note">
        <Trash2 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Theme & Accent Color - pushed to right */}
      <div className="flex items-center gap-0.5 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-lg",
                theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
              )}
              title="Accent Color"
            >
              <Palette className="h-4 w-4" style={{ color: accentColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-auto p-3", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
            align="end"
          >
            <div className="grid grid-cols-4 gap-2">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                    accentColor === color ? "ring-2 ring-offset-2" : "border-transparent",
                  )}
                  style={{
                    backgroundColor: color,
                    ["--tw-ring-color" as string]: color,
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton onClick={toggleTheme} title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </ToolbarButton>
      </div>
    </div>
  )
}
