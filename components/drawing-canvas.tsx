"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Eraser, Paintbrush, Trash2, Undo, Redo, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

interface DrawingCanvasProps {
  initialData: string | null
  onChange: (data: string) => void
  accentColor: string
}

const COLORS_LIGHT = [
  "#000000", // Black
  "#404040", // Dark Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#6b7280", // Gray
]

const COLORS_DARK = [
  "#ffffff", // White
  "#d4d4d4", // Light Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#a3a3a3", // Gray
]

export function DrawingCanvas({ initialData, onChange, accentColor }: DrawingCanvasProps) {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(theme === "dark" ? "#ffffff" : "#000000")
  const [brushSize, setBrushSize] = useState(4)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const COLORS = theme === "dark" ? COLORS_DARK : COLORS_LIGHT
  const canvasBg = theme === "dark" ? "#262626" : "#ffffff"
  const eraserColor = canvasBg

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = 400
    }

    ctx.fillStyle = canvasBg
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (initialData) {
      const img = new window.Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        saveToHistory()
      }
      img.src = initialData
    } else {
      saveToHistory()
    }
  }, [canvasBg])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const data = canvas.toDataURL()
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1)
      return [...newHistory, data]
    })
    setHistoryIndex((prev) => prev + 1)
  }, [historyIndex])

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL())
  }, [onChange])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e)
    lastPosRef.current = pos
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === "eraser" ? eraserColor : color
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize
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

  const handleUndo = () => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const newIndex = historyIndex - 1
    const img = new window.Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHistoryIndex(newIndex)
      saveDrawing()
    }
    img.src = history[newIndex]
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const newIndex = historyIndex + 1
    const img = new window.Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      setHistoryIndex(newIndex)
      saveDrawing()
    }
    img.src = history[newIndex]
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = canvasBg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
    saveDrawing()
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "drawing.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="p-4">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 p-3 mb-3 rounded-xl",
          theme === "dark" ? "bg-neutral-800" : "bg-neutral-100",
        )}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              tool === "brush"
                ? theme === "dark"
                  ? "bg-neutral-700"
                  : "bg-white shadow-sm"
                : theme === "dark"
                  ? "hover:bg-neutral-700"
                  : "hover:bg-white",
            )}
            onClick={() => setTool("brush")}
            title="Brush"
            style={tool === "brush" ? { color: accentColor } : undefined}
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              tool === "eraser"
                ? theme === "dark"
                  ? "bg-neutral-700"
                  : "bg-white shadow-sm"
                : theme === "dark"
                  ? "hover:bg-neutral-700"
                  : "hover:bg-white",
            )}
            onClick={() => setTool("eraser")}
            title="Eraser"
            style={tool === "eraser" ? { color: accentColor } : undefined}
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6" style={{ backgroundColor: `${accentColor}40` }} />

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="h-7 w-7 rounded-full border-2 shadow-sm transition-transform hover:scale-110"
              style={{
                backgroundColor: color,
                borderColor: theme === "dark" ? "#525252" : "#d4d4d4",
              }}
              title="Color"
            />
          </PopoverTrigger>
          <PopoverContent
            className={cn("w-auto p-3", theme === "dark" ? "bg-neutral-800 border-neutral-700" : "")}
            align="start"
          >
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                    color === c ? "ring-2 ring-offset-2" : "",
                  )}
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? accentColor : "transparent",
                    ["--tw-ring-color" as string]: accentColor,
                    boxShadow: c === "#ffffff" || c === "#d4d4d4" ? "inset 0 0 0 1px #d4d4d4" : undefined,
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6" style={{ backgroundColor: `${accentColor}40` }} />

        <div className="flex items-center gap-2 w-32">
          <span className={cn("text-xs", theme === "dark" ? "text-neutral-400" : "text-neutral-500")}>Size</span>
          <Slider
            value={[brushSize]}
            onValueChange={(v) => setBrushSize(v[0])}
            min={1}
            max={20}
            step={1}
            className="flex-1"
          />
        </div>

        <div className="w-px h-6" style={{ backgroundColor: `${accentColor}40` }} />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-white",
              historyIndex <= 0 && "opacity-40 cursor-not-allowed",
            )}
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-lg",
              theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-white",
              historyIndex >= history.length - 1 && "opacity-40 cursor-not-allowed",
            )}
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6" style={{ backgroundColor: `${accentColor}40` }} />

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0 rounded-lg", theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-white")}
          onClick={handleClear}
          title="Clear"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0 rounded-lg", theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-white")}
          onClick={handleDownload}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="rounded-xl overflow-hidden shadow-inner"
        style={{
          border: `2px solid ${accentColor}`,
          backgroundColor: canvasBg,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
