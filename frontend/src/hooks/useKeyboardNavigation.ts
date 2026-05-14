import { useEffect, useCallback, useRef } from 'react'

interface KeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: (e: KeyboardEvent) => void
  onShiftTab?: (e: KeyboardEvent) => void
  enabled?: boolean
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    onShiftTab,
    enabled = true
  } = options

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        onEscape?.()
        break
      case 'Enter':
        e.preventDefault()
        onEnter?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        e.preventDefault()
        onArrowLeft?.()
        break
      case 'ArrowRight':
        e.preventDefault()
        onArrowRight?.()
        break
      case 'Tab':
        if (e.shiftKey) {
          onShiftTab?.(e)
        } else {
          onTab?.(e)
        }
        break
    }
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

// Hook for focus management
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLElement>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[]
  }, [])

  const focusFirstElement = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    }
  }, [getFocusableElements])

  const focusLastElement = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  const trapFocus = useCallback((e: KeyboardEvent) => {
    const elements = getFocusableElements()
    const firstElement = elements[0]
    const lastElement = elements[elements.length - 1]

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }, [getFocusableElements])

  useEffect(() => {
    focusableElementsRef.current = getFocusableElements()
  }, [getFocusableElements])

  return {
    containerRef,
    focusableElements: focusableElementsRef.current,
    focusFirstElement,
    focusLastElement,
    trapFocus
  }
}

// Hook for screen reader announcements
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const announceToScreenReader = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceImportant = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  return {
    announceToScreenReader,
    announceImportant
  }
}
