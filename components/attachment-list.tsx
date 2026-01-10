"use client"

import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

interface Attachment {
  id: string
  name: string
  type: string
  size: number
  data: string
}

interface AttachmentListProps {
  attachments: Attachment[]
  onRemove: (id: string) => void
  onDownload: (attachment: Attachment) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function getFileIcon(type: string): string {
  if (type.includes("pdf")) return "📄"
  if (type.includes("word") || type.includes("document")) return "📝"
  if (type.includes("sheet") || type.includes("excel")) return "📊"
  if (type.includes("presentation") || type.includes("powerpoint")) return "📽️"
  if (type.includes("zip") || type.includes("archive")) return "📦"
  if (type.includes("audio")) return "🎵"
  if (type.includes("video")) return "🎬"
  return "📎"
}

export function AttachmentList({ attachments, onRemove, onDownload }: AttachmentListProps) {
  const { theme, accentColor } = useTheme()

  return (
    <div className="p-4" style={{ borderTop: `1px solid ${accentColor}20` }}>
      <h3 className={cn("text-sm font-medium mb-3", theme === "dark" ? "text-neutral-400" : "text-neutral-500")}>
        Attachments
      </h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl group transition-colors",
              theme === "dark" ? "bg-neutral-800 hover:bg-neutral-750" : "bg-neutral-100 hover:bg-neutral-150",
            )}
          >
            <span className="text-xl">{getFileIcon(attachment.type)}</span>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  theme === "dark" ? "text-neutral-100" : "text-neutral-900",
                )}
              >
                {attachment.name}
              </p>
              <p className={cn("text-xs", theme === "dark" ? "text-neutral-500" : "text-neutral-400")}>
                {formatFileSize(attachment.size)}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-200",
                )}
                onClick={() => onDownload(attachment)}
              >
                <Download className="h-4 w-4" style={{ color: accentColor }} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  theme === "dark" ? "hover:bg-red-900/50 hover:text-red-400" : "hover:bg-red-100 hover:text-red-600",
                )}
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
