"use client"

import type React from "react"
import { useEditor, EditorContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyle } from "@tiptap/extension-text-style"
import { Extension } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { useEffect, useState, useCallback, useRef } from "react"
import { Toolbar } from "./toolbar"
import { AttachmentList } from "./attachment-list"
import { ThemeProvider, useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"
import { Plus, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"


declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
    textColor: {
      setTextColor: (color: string) => ReturnType
      unsetTextColor: () => ReturnType
    }
    highlight: {
      setHighlight: (color: string) => ReturnType
      unsetHighlight: () => ReturnType
    }
  }
}

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  data: string
}

interface Note {
  id: string
  title: string
  content: string
  attachments: Attachment[]
  drawing: string | null
  createdAt: number
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { fontSize }).run()
          },
      unsetFontSize:
        () =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
          },
    }
  },
})

const TextColor = Extension.create({
  name: "textColor",
  addOptions() {
    return {
      types: ["textStyle"],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          color: {
            default: null,
            parseHTML: (element) => element.style.color?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.color) {
                return {}
              }
              return {
                style: `color: ${attributes.color}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setTextColor:
        (color: string) =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { color }).run()
          },
      unsetTextColor:
        () =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { color: null }).removeEmptyTextStyle().run()
          },
    }
  },
})

const Highlight = Extension.create({
  name: "highlight",
  addOptions() {
    return {
      types: ["textStyle"],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) {
                return {}
              }
              return {
                style: `background-color: ${attributes.backgroundColor}; padding: 0.125rem 0.25rem; border-radius: 0.25rem;`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setHighlight:
        (color: string) =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { backgroundColor: color }).run()
          },
      unsetHighlight:
        () =>
          ({ chain }: { chain: any }) => {
            return chain().setMark("textStyle", { backgroundColor: null }).removeEmptyTextStyle().run()
          },
    }
  },
})

function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const img = imageRef.current
    if (!img) return

    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: img.offsetWidth,
      height: img.offsetHeight,
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPosRef.current.x
      const aspectRatio = startPosRef.current.width / startPosRef.current.height

      let newWidth = startPosRef.current.width

      if (corner.includes("right")) {
        newWidth = Math.max(100, startPosRef.current.width + deltaX)
      } else if (corner.includes("left")) {
        newWidth = Math.max(100, startPosRef.current.width - deltaX)
      }

      const newHeight = newWidth / aspectRatio

      updateAttributes({
        width: Math.round(newWidth),
        height: Math.round(newHeight),
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  return (
    <NodeViewWrapper className="relative inline-block my-2">
      <div
        className={cn("relative inline-block group", selected && "ring-2 ring-offset-2 rounded-lg")}
        style={{ ["--tw-ring-color" as string]: "var(--accent-color)" }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src || "/placeholder.svg"}
          alt={node.attrs.alt || ""}
          width={node.attrs.width}
          height={node.attrs.height}
          className="rounded-lg max-w-full"
          style={{
            width: node.attrs.width ? `${node.attrs.width}px` : "auto",
            height: node.attrs.height ? `${node.attrs.height}px` : "auto",
          }}
          draggable={false}
        />
        {/* Resize handles */}
        {selected && (
          <>
            <div
              className="absolute top-0 left-0 w-3 h-3 bg-white border-2 rounded-full cursor-nw-resize -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
              style={{ borderColor: "var(--accent-color)" }}
              onMouseDown={(e) => handleMouseDown(e, "top-left")}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 bg-white border-2 rounded-full cursor-ne-resize translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform"
              style={{ borderColor: "var(--accent-color)" }}
              onMouseDown={(e) => handleMouseDown(e, "top-right")}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 bg-white border-2 rounded-full cursor-sw-resize -translate-x-1/2 translate-y-1/2 hover:scale-125 transition-transform"
              style={{ borderColor: "var(--accent-color)" }}
              onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 rounded-full cursor-se-resize translate-x-1/2 translate-y-1/2 hover:scale-125 transition-transform"
              style={{ borderColor: "var(--accent-color)" }}
              onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}

const ResizableImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage)
  },
})

function NoteEditorContent() {
  const { theme, accentColor } = useTheme()
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingEnabled, setDrawingEnabled] = useState(false)
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(3)
  const [isEraser, setIsEraser] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const drawingHistoryRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(-1)
  const canvasInitializedRef = useRef(false) // Add flag to prevent history reset on resize

  const activeNote = notes.find((n) => n.id === activeNoteId)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "code-block",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "note-link",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-item",
        },
      }),
      ResizableImageExtension.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
      TextStyle,
      FontSize,
      TextColor,
      Highlight,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-2",
      },
      handleClick: (view, pos, event) => {
        const { state } = view
        const { selection } = state
        const { $from } = selection
        const node = $from.parent

        if (node.type.name === "codeBlock") {
          const target = event.target as HTMLElement
          if (target.closest(".code-block")) {
            if (node.textContent) {
              editor?.chain().focus().toggleCodeBlock().run()
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      if (isLoaded && activeNoteId) {
        debouncedSave(editor.getHTML())
      }
    },
  })

  const debouncedSave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === activeNoteId ? { ...n, content } : n))
          localStorage.setItem("notes", JSON.stringify(updated))
          return updated
        })
      }, 500)
    },
    [activeNoteId],
  )

  const defaultPlaceholderContent = `
<h2>NotesApp, Notes on Steroids</h2>
<p>Start typing to create your note, or explore the features below:</p>
<h3>Text Formatting</h3>
<p>Make text <strong>bold</strong>, <em>italic</em>, or <u>underline</u>. Change <span style="color: #ef4444">text colors</span> and add <mark data-color="#fef08a" style="background-color: #fef08a">highlights</mark>.</p>
<h3>Lists</h3>
<ul>
  <li>Bullet points for unordered items</li>
  <li>Nested lists are supported</li>
</ul>
<ol>
  <li>Numbered lists for steps</li>
  <li>Easy to follow sequences</li>
</ol>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Task items with checkboxes</li>
  <li data-type="taskItem" data-checked="true">Mark tasks as complete</li>
</ul>
<h3>Code Blocks</h3>
<pre><code>const greeting = "Hello, World!";
console.log(greeting);</code></pre>
<h3>More Features</h3>
<p>Add <a href="https://example.com" target="_blank">links</a>, insert images, attach files, and even draw with the sketch tool!</p>
<p><em>Delete this content and start fresh, or use it as a template.</em></p>
`

  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      const parsed = JSON.parse(savedNotes) as Note[]
      setNotes(parsed)
      if (parsed.length > 0) {
        setActiveNoteId(parsed[0].id)
      }
    } else {
      const initialNote: Note = {
        id: crypto.randomUUID(),
        title: "Getting Started",
        content: defaultPlaceholderContent,
        attachments: [],
        drawing: null,
        createdAt: Date.now(),
      }
      setNotes([initialNote])
      setActiveNoteId(initialNote.id)
      localStorage.setItem("notes", JSON.stringify([initialNote]))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (editor && activeNote && isLoaded) {
      // Use requestAnimationFrame to ensure we're outside any active transactions
      requestAnimationFrame(() => {
        if (editor && !editor.isDestroyed) {
          try {
            editor.commands.setContent(activeNote.content || "")
          } catch (e) {
            // Silently handle position errors during content switch
            console.warn("Content switch delayed due to active transaction")
          }
        }
      })
    }
  }, [activeNoteId, editor, isLoaded])

  const handleNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Getting Started",
      content: defaultPlaceholderContent,
      attachments: [],
      drawing: null,
      createdAt: Date.now(),
    }
    setNotes((prev) => {
      const updated = [...prev, newNote]
      localStorage.setItem("notes", JSON.stringify(updated))
      return updated
    })
    setActiveNoteId(newNote.id)
    setDrawingEnabled(false)
  }

  const handleCloseNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (notes.length === 1) {
      handleReset()
      return
    }
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      localStorage.setItem("notes", JSON.stringify(updated))
      if (activeNoteId === id) {
        setActiveNoteId(updated[0]?.id || null)
      }
      return updated
    })
  }

  const handleTitleChange = (newTitle: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === activeNoteId ? { ...n, title: newTitle } : n))
      localStorage.setItem("notes", JSON.stringify(updated))
      return updated
    })
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to clear this note? This cannot be undone.")) {
      editor?.commands.clearContent()
      setNotes((prev) => {
        const updated = prev.map((n) =>
          n.id === activeNoteId ? { ...n, title: "", content: "", attachments: [], drawing: null } : n,
        )
        localStorage.setItem("notes", JSON.stringify(updated))
        return updated
      })
    }
  }

  const handleAddAttachment = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target?.result as string,
        }
        setNotes((prev) => {
          const updated = prev.map((n) =>
            n.id === activeNoteId ? { ...n, attachments: [...n.attachments, newAttachment] } : n,
          )
          localStorage.setItem("notes", JSON.stringify(updated))
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveAttachment = (id: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === activeNoteId ? { ...n, attachments: n.attachments.filter((a) => a.id !== id) } : n,
      )
      localStorage.setItem("notes", JSON.stringify(updated))
      return updated
    })
  }

  const handleDownloadAttachment = (attachment: Attachment) => {
    const link = document.createElement("a")
    link.href = attachment.data
    link.download = attachment.name
    link.click()
  }

  const handleDrawingChange = (drawingData: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === activeNoteId ? { ...n, drawing: drawingData } : n))
      localStorage.setItem("notes", JSON.stringify(updated))
      return updated
    })
  }

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()

    const ctx = canvas.getContext("2d")
    let existingImage: ImageData | null = null
    if (canvasInitializedRef.current && ctx && canvas.width > 0 && canvas.height > 0) {
      existingImage = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    canvas.width = rect.width
    canvas.height = rect.height

    if (!ctx) return

    if (existingImage && canvasInitializedRef.current) {
      ctx.putImageData(existingImage, 0, 0)
      return
    }

    if (canvasInitializedRef.current) return

    const note = notes.find((n) => n.id === activeNoteId)
    if (note?.drawing) {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        drawingHistoryRef.current = [imageData]
        historyIndexRef.current = 0
        canvasInitializedRef.current = true
      }
      img.src = note.drawing
    } else {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      drawingHistoryRef.current = [imageData]
      historyIndexRef.current = 0
      canvasInitializedRef.current = true
    }
  }, [activeNoteId, notes])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    // Truncate any redo history
    drawingHistoryRef.current = drawingHistoryRef.current.slice(0, historyIndexRef.current + 1)
    drawingHistoryRef.current.push(imageData)
    historyIndexRef.current = drawingHistoryRef.current.length - 1
  }

  const clearDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
    saveDrawing()
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingEnabled) return
    setIsDrawing(true)
    const pos = getPosition(e)
    lastPosRef.current = pos
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getPosition(e)
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out"
      ctx.strokeStyle = "rgba(255,255,255,1)"
      ctx.lineWidth = brushSize * 2 // Make eraser slightly bigger
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
    }

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
      saveDrawing()
    }
  }

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const drawingData = canvas.toDataURL()
    handleDrawingChange(drawingData)
  }

  useEffect(() => {
    if (activeNoteId && isLoaded && !canvasInitializedRef.current) {
      initializeCanvas()
    }
  }, [activeNoteId, isLoaded, initializeCanvas])

  useEffect(() => {
    const handleResize = () => {
      if (!canvasInitializedRef.current) {
        initializeCanvas()
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [initializeCanvas])

  useEffect(() => {
    if (isLoaded) {
      canvasInitializedRef.current = false
      drawingHistoryRef.current = []
      historyIndexRef.current = -1
      initializeCanvas()
    }
  }, [activeNoteId, isLoaded, initializeCanvas])

  if (!editor || !isLoaded) return null

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        theme === "dark" ? "dark bg-neutral-950" : "bg-neutral-50",
      )}
      style={{ "--accent-color": accentColor } as React.CSSProperties}
    >
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div
          className={cn(
            "flex items-center gap-1 p-2 rounded-t-xl overflow-x-auto print:hidden",
            theme === "dark" ? "bg-neutral-900" : "bg-white",
          )}
          style={{
            borderTop: `2px solid ${accentColor}`,
            borderLeft: `2px solid ${accentColor}`,
            borderRight: `2px solid ${accentColor}`,
          }}
        >
          {notes.map((note) => (
            <div
              role="button"
              key={note.id}
              onClick={() => {
                setActiveNoteId(note.id)
                setDrawingEnabled(false)
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all min-w-0 cursor-pointer",
                activeNoteId === note.id
                  ? theme === "dark"
                    ? "bg-neutral-800 shadow-sm"
                    : "bg-neutral-100 shadow-sm"
                  : theme === "dark"
                    ? "hover:bg-neutral-800/50"
                    : "hover:bg-neutral-100/50",
              )}
              style={activeNoteId === note.id ? { color: accentColor } : undefined}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate max-w-[120px]">{note.title || "Untitled"}</span>
              <button
                onClick={(e) => handleCloseNote(note.id, e)}
                className={cn(
                  "ml-1 p-1 rounded-md shrink-0 opacity-60 hover:opacity-100 transition-opacity",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 shrink-0 ml-1 rounded-lg",
              theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-neutral-100",
            )}
            onClick={handleNewNote}
            title="New Note"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="note-header-controls flex items-center gap-2 print:hidden">{/* Controls here */}</div>

        <div className="note-toolbar print:hidden">
          <Toolbar
            editor={editor}
            onReset={handleReset}
            onAddAttachment={handleAddAttachment}
            title={activeNote?.title || ""}
            drawingEnabled={drawingEnabled}
            onToggleDrawing={() => setDrawingEnabled(!drawingEnabled)}
            brushColor={brushColor}
            onBrushColorChange={setBrushColor}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            isEraser={isEraser}
            onToggleEraser={() => setIsEraser(!isEraser)}
            onClearDrawing={clearDrawing}
          />
        </div>

        <div
          ref={containerRef}
          className={cn(
            "tiptap-editor-container rounded-b-xl shadow-lg relative",
            theme === "dark" ? "bg-neutral-900" : "bg-white",
          )}
          style={{
            borderBottom: `2px solid ${accentColor}`,
            borderLeft: `2px solid ${accentColor}`,
            borderRight: `2px solid ${accentColor}`,
          }}
        >
          <input
            type="text"
            value={activeNote?.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Note"
            className={cn(
              "w-full px-5 py-4 text-2xl font-semibold bg-transparent focus:outline-none transition-colors",
              theme === "dark"
                ? "text-neutral-100 placeholder:text-neutral-500"
                : "text-neutral-900 placeholder:text-neutral-400",
              drawingEnabled && "pointer-events-none",
            )}
            style={{ borderBottom: `1px solid ${accentColor}20` }}
          />

          <EditorContent editor={editor} className={cn("note-editor", drawingEnabled && "pointer-events-none")} />

          {activeNote && activeNote.attachments.length > 0 && (
            <div className="note-attachments print:hidden">
              <AttachmentList
                attachments={activeNote.attachments}
                onRemove={handleRemoveAttachment}
                onDownload={handleDownloadAttachment}
              />
            </div>
          )}

          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-10"
            style={{
              cursor: drawingEnabled ? "crosshair" : "default",
              touchAction: drawingEnabled ? "none" : "auto",
              backgroundColor: "transparent",
              background: "transparent",
              pointerEvents: drawingEnabled ? "auto" : "none",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {drawingEnabled && (
            <div
              className={cn(
                "absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium z-20",
                theme === "dark" ? "bg-neutral-800 text-neutral-200" : "bg-neutral-100 text-neutral-700",
              )}
              style={{ border: `1px solid ${accentColor}` }}
            >
              Drawing Mode - Click and drag to draw
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .note-editor .ProseMirror {
          min-height: 400px;
          padding: 1.25rem;
          color: ${theme === "dark" ? "#f5f5f5" : "#171717"};
        }

        .note-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: ${theme === "dark" ? "#525252" : "#a3a3a3"};
          pointer-events: none;
          height: 0;
        }

        .note-link {
          color: ${accentColor};
          text-decoration: underline;
          cursor: pointer;
        }

        .code-block {
          background: ${theme === "dark" ? "#262626" : "#f5f5f5"};
          color: ${theme === "dark" ? "#e5e5e5" : "#171717"};
          font-family: ui-monospace, monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
          overflow-x: auto;
          border: 1px solid ${theme === "dark" ? "#404040" : "#e5e5e5"};
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .task-item[data-checked="true"] > div > p {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .task-item input[type="checkbox"] {
          margin-top: 0.25rem;
          accent-color: ${accentColor};
        }

        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .tiptap-editor-container {
            border: none !important;
            box-shadow: none !important;
          }
          .note-editor .ProseMirror {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  )
}

export function NoteEditor() {
  return (
    <ThemeProvider>
      <NoteEditorContent />
    </ThemeProvider>
  )
}
