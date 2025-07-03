"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Loader2, Upload, FileText, Database, Zap } from "lucide-react"

export interface LoadingUploadProps {
  /** Array of text strings for different loading stages */
  stages: string[]
  /** Current stage index (0-based). If not provided, auto-progresses */
  currentStage?: number
  /** Duration for each stage in milliseconds (default: 2000) */
  stageDuration?: number
  /** Whether the loading is complete */
  isComplete?: boolean
  /** Whether the loading process has started */
  isActive?: boolean
  /** Animation variant */
  variant?: "spinner" | "dots" | "pulse" | "progress" | "upload"
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Color theme */
  theme?: "default" | "success" | "warning" | "error" | "info"
  /** Show progress bar */
  showProgress?: boolean
  /** Custom icon for each stage */
  stageIcons?: React.ReactNode[]
  /** Callback when a stage changes */
  onStageChange?: (stage: number) => void
  /** Callback when loading completes */
  onComplete?: () => void
  /** Custom className */
  className?: string
  /** Completion message */
  completionMessage?: string
}

const LoadingUpload: React.FC<LoadingUploadProps> = ({
  stages,
  currentStage,
  stageDuration = 2000,
  isComplete = false,
  isActive = true,
  variant = "spinner",
  size = "md",
  theme = "default",
  showProgress = false,
  stageIcons,
  onStageChange,
  onComplete,
  className,
  completionMessage = "Process completed successfully!",
}) => {
  const [internalStage, setInternalStage] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const activeStage = currentStage !== undefined ? currentStage : internalStage

  // Auto-progress through stages if currentStage is not controlled
  useEffect(() => {
    if (currentStage === undefined && isActive && !isComplete && activeStage < stages.length - 1) {
      const timer = setTimeout(() => {
        setInternalStage((prev) => {
          const nextStage = Math.min(prev + 1, stages.length - 1)
          onStageChange?.(nextStage)
          return nextStage
        })
      }, stageDuration)

      return () => clearTimeout(timer)
    }
  }, [activeStage, stages.length, stageDuration, isActive, isComplete, currentStage, onStageChange])

  // Handle completion
  useEffect(() => {
    if (isComplete && activeStage === stages.length - 1) {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, activeStage, stages.length, onComplete])

  // Animation trigger
  useEffect(() => {
    if (isActive) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [activeStage, isActive])

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const themeClasses = {
    default: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    info: "text-cyan-600",
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  const getDefaultIcon = (index: number) => {
    const iconProps = { className: cn(iconSizes[size], themeClasses[theme]) }
    const icons = [
      <FileText key="file" {...iconProps} />,
      <Database key="database" {...iconProps} />,
      <Upload key="upload" {...iconProps} />,
      <Zap key="process" {...iconProps} />,
    ]
    return icons[index % icons.length]
  }

  const renderAnimation = () => {
    const baseClasses = cn(iconSizes[size], themeClasses[theme])

    switch (variant) {
      case "spinner":
        return <Loader2 className={cn(baseClasses, "animate-spin")} />

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "rounded-full bg-current",
                  size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3",
                  themeClasses[theme],
                  "animate-pulse",
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )

      case "pulse":
        return (
          <div
            className={cn(
              "rounded-full bg-current animate-pulse",
              size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6",
              themeClasses[theme],
            )}
          />
        )

      case "upload":
        return <Upload className={cn(baseClasses, "animate-bounce")} />

      case "progress":
      default:
        return <Loader2 className={cn(baseClasses, "animate-spin")} />
    }
  }

  const progressPercentage = stages.length > 0 ? ((activeStage + 1) / stages.length) * 100 : 0

  if (!isActive && !isComplete) {
    return null
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4 p-6", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-out",
                isComplete ? "bg-green-500" : "bg-current",
                themeClasses[theme],
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-3">
        {/* Icon/Animation */}
        <div className={cn("transition-all duration-300", isAnimating && "scale-110")}>
          {isComplete ? (
            <CheckCircle className={cn(iconSizes[size], "text-green-500")} />
          ) : (
            <div className="flex items-center space-x-2">
              {stageIcons?.[activeStage] || getDefaultIcon(activeStage)}
              {renderAnimation()}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p
            className={cn(
              "font-medium transition-all duration-300",
              sizeClasses[size],
              isAnimating && "opacity-50 scale-95",
            )}
          >
            {isComplete ? completionMessage : stages[activeStage] || "Loading..."}
          </p>

          {!isComplete && stages.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Step {activeStage + 1} of {stages.length}
            </p>
          )}
        </div>

        {/* Stage Indicators */}
        {stages.length > 1 && (
          <div className="flex space-x-2">
            {stages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-full transition-all duration-300",
                  size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4",
                  index <= activeStage
                    ? isComplete && index === stages.length - 1
                      ? "bg-green-500"
                      : cn("bg-current", themeClasses[theme])
                    : "bg-muted",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingUpload
