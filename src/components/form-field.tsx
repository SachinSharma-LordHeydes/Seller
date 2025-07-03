"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function ValidatedInput({ error, className, ...props }: ValidatedInputProps) {
  return <Input className={cn(error && "border-red-500 focus-visible:ring-red-500", className)} {...props} />
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function ValidatedTextarea({ error, className, ...props }: ValidatedTextareaProps) {
  return <Textarea className={cn(error && "border-red-500 focus-visible:ring-red-500", className)} {...props} />
}

interface ValidatedSelectProps {
  error?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function ValidatedSelect({ error, children, ...props }: ValidatedSelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger className={cn(error && "border-red-500 focus-visible:ring-red-500")}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}
