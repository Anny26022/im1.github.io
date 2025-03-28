"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface SymbolAutocompleteProps {
  symbols: string[]
  onSelect: (symbol: string) => void
  selectedSymbols?: string[]
  isDisabled?: boolean
}

export function SymbolAutocomplete({
  symbols,
  onSelect,
  selectedSymbols = [],
  isDisabled = false
}: SymbolAutocompleteProps) {
  const [inputValue, setInputValue] = useState("")
  const [filteredSymbols, setFilteredSymbols] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // Set up portal container on mount
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  // Filter symbols based on input
  useEffect(() => {
    if (inputValue.length < 1) {
      setFilteredSymbols([])
      setIsOpen(false)
      return
    }

    // Make sure symbols is defined and is an array before filtering
    if (symbols && Array.isArray(symbols)) {
      const filtered = symbols
        .filter(symbol => symbol.includes(inputValue.toUpperCase()))
        .slice(0, 10) // Limit the number of suggestions

      setFilteredSymbols(filtered)
      setIsOpen(filtered.length > 0)

      // Update dropdown position
      if (filtered.length > 0 && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    } else {
      setFilteredSymbols([])
      setIsOpen(false)
    }
  }, [inputValue, symbols])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        // Don't close if clicking inside the dropdown (which is in the portal)
        const portalElement = document.querySelector('.symbol-dropdown-portal')
        if (portalElement && portalElement.contains(event.target as Node)) {
          return
        }
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  // Handle selecting a symbol
  const handleSelectSymbol = (symbol: string) => {
    onSelect(symbol)
    setInputValue("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex w-full space-x-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type to search symbols..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (filteredSymbols.length > 0) {
              setIsOpen(true)
              // Update position on focus
              if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect()
                setDropdownPosition({
                  top: rect.bottom + window.scrollY,
                  left: rect.left + window.scrollX,
                  width: rect.width
                })
              }
            }
          }}
          className="w-full text-xs sm:text-sm h-9 bg-background text-foreground border border-input rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
          disabled={isDisabled}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={inputValue.length === 0 || isDisabled}
          onClick={() => {
            if (inputValue) {
              handleSelectSymbol(inputValue.toUpperCase())
            }
          }}
          className="text-foreground bg-background border-input h-9 aspect-square p-0 flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {portalContainer && isOpen && filteredSymbols.length > 0 && createPortal(
        <div
          className="fixed z-[100] bg-background border border-input rounded-md shadow-xl overflow-hidden symbol-dropdown-portal"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          <ul className="py-1">
            {filteredSymbols.map((symbol) => (
              <li key={symbol}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectSymbol(symbol);
                  }}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-muted focus:bg-muted focus:outline-none text-foreground"
                >
                  {symbol}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        portalContainer
      )}
    </div>
  )
}
