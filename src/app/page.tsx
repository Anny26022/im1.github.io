/* eslint-disable */
"use client"

import { useState, useEffect, Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Instructions } from "@/components/instructions"
import { StatsCard } from "@/components/stats-card"
import { SymbolInputForm } from "@/components/symbol-input-form"
import { ResultsDisplay } from "@/components/results-display"
import { AvailableIndustries } from "@/components/available-industries"
import { Watchlist } from "@/components/watchlist"
import { IndustryMapper, IndustryMapperStats, StockData } from "@/lib/data-processor"
import { toast } from "sonner"
import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { HelpCircleIcon } from "lucide-react"

// Simple loading component without heavy animations
const LoadingIndicator = () => (
  <div className="flex items-center justify-center h-[80vh]">
    <div className="flex flex-col items-center">
      <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading data...</p>
    </div>
  </div>
)

export default function Home() {
  const [mapper, setMapper] = useState<IndustryMapper | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [stats, setStats] = useState<IndustryMapperStats | null>(null)
  const [industries, setIndustries] = useState<string[]>([])
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([])
  const [mappedSymbols, setMappedSymbols] = useState<StockData[]>([])
  const [invalidSymbols, setInvalidSymbols] = useState<string[]>([])
  const [tvFormattedOutput, setTvFormattedOutput] = useState("")
  const [flatOutput, setFlatOutput] = useState("")
  const [showFundamentals, setShowFundamentals] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Get watchlist from context
  const { watchlist, addToWatchlist } = useAppContext()

  // Initialize the mapper with optimized loading
  useEffect(() => {
    let isMounted = true;
    let initTimeoutId: NodeJS.Timeout | null = null;
    let initStartTime = Date.now();

    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered after 15 seconds");
      if (isMounted && isInitializing) {
        setIsInitializing(false);
        toast.error("Loading took too long. Please refresh the page.", {
          duration: 5000,
        });
      }
    }, 15000);

    const initializeMapper = async () => {
      try {
        console.log("Starting mapper initialization...");
        // Create the industry mapper instance
        const newMapper = new IndustryMapper()

        // Initialize the mapper and then update the state
        await newMapper.initialize()

        // Only update state if component is still mounted
        if (isMounted) {
          console.log("Mapper initialized, setting state...");
          setMapper(newMapper)
          setStats(newMapper.getStats())

          try {
            // Use Promise.all to fetch industries and symbols in parallel
            const [industryList, symbolList] = await Promise.all([
              Promise.resolve(newMapper.getAvailableIndustries()),
              Promise.resolve(newMapper.getAvailableSymbols())
            ]);

            if (isMounted) {
              console.log(`Loaded ${industryList.length} industries and ${symbolList.length} symbols`);
              setIndustries(industryList)
              setAvailableSymbols(symbolList)
              setIsInitializing(false)
            }
          } catch (error) {
            console.error("Error loading industries or symbols:", error);
            if (isMounted) {
              // Still set initializing to false to show at least partial UI
              setIsInitializing(false);
              toast.error("Some data could not be loaded completely", {
                duration: 3000,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize mapper:", error)
        if (isMounted) {
          toast.error("Failed to load data. Please refresh the page.", {
            duration: 5000,
          })
          setIsInitializing(false)
        }
      } finally {
        if (safetyTimeout) clearTimeout(safetyTimeout);
        console.log(`Initialization completed in ${(Date.now() - initStartTime) / 1000}s`);
      }
    }

    initTimeoutId = setTimeout(() => {
      initializeMapper();
    }, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      if (initTimeoutId) clearTimeout(initTimeoutId);
      if (safetyTimeout) clearTimeout(safetyTimeout);
    }
  }, [])

  const handleSubmit = async (symbols: string, showFundamentals: boolean) => {
    if (!mapper) return

    // Clean and validate the symbols first
    const symbolsArray = symbols
      .replace(/\n/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)

    // Check if there are too many symbols
    const MAX_SYMBOLS = 999
    if (symbolsArray.length > MAX_SYMBOLS) {
      toast.error(`Too many symbols. Maximum limit is ${MAX_SYMBOLS} symbols at once.`, {
        position: "top-right",
        duration: 5000,
      })
      return
    }

    // If no symbols, show error
    if (symbolsArray.length === 0) {
      toast.error("Please enter at least one valid symbol", {
        position: "top-right",
      })
      return
    }

    setIsLoading(true)
    setShowFundamentals(showFundamentals)

    // Use setTimeout to allow UI to update before processing starts
    setTimeout(async () => {
      try {
        // Process the symbols with the mapper
        const { mappedSymbols, invalidSymbols, tvFormattedOutput, flatOutput } = await mapper.processSymbols(
          symbolsArray,
          showFundamentals
        )

        // Update state with the results
        setMappedSymbols(mappedSymbols)
        setInvalidSymbols(invalidSymbols)
        setTvFormattedOutput(tvFormattedOutput)
        setFlatOutput(flatOutput)

        // Show success notification
        const successMessage = invalidSymbols.length > 0
          ? `Processed ${mappedSymbols.length} symbols (${invalidSymbols.length} invalid)`
          : `Successfully processed all ${mappedSymbols.length} symbols`

        toast.success(successMessage, {
          position: "top-right",
          duration: 3000,
          className: "bg-success font-medium",
        })
      } catch (error) {
        console.error("Error processing symbols:", error)
        toast.error("Error processing symbols. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 0);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-4 px-3 sm:px-4 sm:py-6">
        {isInitializing ? (
          <LoadingIndicator />
        ) : (
          <>
            {/* Mobile Layout - Only visible on mobile */}
            <div className="md:hidden flex flex-col gap-4">
              {/* Instructions controls */}
              {!showInstructions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInstructions(true)}
                  className="mb-0 w-full flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <HelpCircleIcon className="h-4 w-4" />
                  <span>Show Instructions</span>
                </Button>
              )}

              {showInstructions && (
                <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading instructions...</div>}>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInstructions(false)}
                      className="absolute top-2 right-2 z-10"
                    >
                      Hide Instructions
                    </Button>
                    <Instructions />
                  </div>
                </Suspense>
              )}

              {/* Mobile Stats Card */}
              {stats && (
                <Suspense fallback={<div className="h-[100px] flex items-center justify-center">Loading stats...</div>}>
                  <StatsCard stats={stats} />
                </Suspense>
              )}

              {/* Symbol Input Form - First main component */}
              <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading form...</div>}>
                <SymbolInputForm
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  availableSymbols={availableSymbols}
                />
              </Suspense>

              {/* Results Display - Immediately after Symbol Input */}
              {mappedSymbols.length > 0 && (
                <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading results...</div>}>
                  <ResultsDisplay
                    mappedSymbols={mappedSymbols}
                    invalidSymbols={invalidSymbols}
                    tvFormattedOutput={tvFormattedOutput}
                    flatOutput={flatOutput}
                    showFundamentals={showFundamentals}
                    onAddToWatchlist={(symbols) => {
                      addToWatchlist(symbols)
                      toast.success(`Added ${symbols.length} symbols to watchlist`)
                    }}
                  />
                </Suspense>
              )}

              {/* Available Industries - After Results Display */}
              {industries.length > 0 && (
                <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading industries...</div>}>
                  <AvailableIndustries
                    industries={industries}
                    mapper={mapper}
                  />
                </Suspense>
              )}

              {/* Watchlist - At the end */}
              {watchlist.length > 0 && (
                <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading watchlist...</div>}>
                  <Watchlist mapper={mapper} />
                </Suspense>
              )}
            </div>

            {/* Desktop Layout - Simple grid without animations */}
            <div className="hidden md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Show Instructions Button */}
                {!showInstructions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInstructions(true)}
                    className="mb-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <HelpCircleIcon className="h-4 w-4" />
                    <span>Show Instructions</span>
                  </Button>
                )}

                {showInstructions && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading instructions...</div>}>
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowInstructions(false)}
                        className="absolute top-2 right-2 z-10 transition-colors duration-200"
                      >
                        Hide Instructions
                      </Button>
                      <Instructions />
                    </div>
                  </Suspense>
                )}

                <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading form...</div>}>
                  <SymbolInputForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    availableSymbols={availableSymbols}
                  />
                </Suspense>

                {mappedSymbols.length > 0 && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading results...</div>}>
                    <ResultsDisplay
                      mappedSymbols={mappedSymbols}
                      invalidSymbols={invalidSymbols}
                      tvFormattedOutput={tvFormattedOutput}
                      flatOutput={flatOutput}
                      showFundamentals={showFundamentals}
                      onAddToWatchlist={(symbols) => {
                        addToWatchlist(symbols)
                        toast.success(`Added ${symbols.length} symbols to watchlist`)
                      }}
                    />
                  </Suspense>
                )}
              </div>

              <div className="space-y-4">
                {stats && (
                  <Suspense fallback={<div className="h-[100px] flex items-center justify-center">Loading stats...</div>}>
                    <StatsCard stats={stats} />
                  </Suspense>
                )}

                {watchlist.length > 0 && (
                  <Suspense fallback={<div className="h-[200px] flex items-center justify-center">Loading watchlist...</div>}>
                    <Watchlist mapper={mapper} />
                  </Suspense>
                )}

                {industries.length > 0 && (
                  <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading industries...</div>}>
                    <AvailableIndustries
                      industries={industries}
                      mapper={mapper}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
