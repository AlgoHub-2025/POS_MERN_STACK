import { useState, useEffect, useMemo } from 'react'
import { Product, CartItem } from '@/types'

interface AIRecommendation {
  product: Product
  score: number
  reason: string
  confidence: number
}

interface UseAIRecommendationsOptions {
  products: Product[]
  cart: CartItem[]
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek?: number
  customerHistory?: string[]
}

export const useAIRecommendations = (options: UseAIRecommendationsOptions) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { products, cart, timeOfDay, dayOfWeek, customerHistory = [] } = options

  // Analyze patterns and generate recommendations
  useEffect(() => {
    if (!products.length || !cart.length) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      const aiRecommendations = generateAIRecommendations({
        products,
        cart,
        timeOfDay,
        dayOfWeek,
        customerHistory
      })

      setRecommendations(aiRecommendations)
      setIsAnalyzing(false)
    }, 1500) // Simulate processing time
  }, [products, cart, timeOfDay, dayOfWeek, customerHistory])

  // Generate AI recommendations based on multiple factors
  const generateAIRecommendations = (params: UseAIRecommendationsOptions): AIRecommendation[] => {
    const { products, cart, timeOfDay, customerHistory = [] } = params
    
    // Factor 1: Time-based recommendations
    const timeBasedRecs = getTimeBasedRecommendations(products, timeOfDay)
    
    // Factor 2: Cart-based complementary items
    const complementaryRecs = getComplementaryRecommendations(products, cart)
    
    // Factor 3: Historical preferences
    const historicalRecs = getHistoricalRecommendations(products, customerHistory)
    
    // Factor 4: Popular items (trending)
    const popularRecs = getPopularRecommendations(products)
    
    // Combine and score all recommendations
    const allRecommendations = [
      ...timeBasedRecs,
      ...complementaryRecs,
      ...historicalRecs,
      ...popularRecs
    ]

    // Remove duplicates and sort by score
    const uniqueRecommendations = allRecommendations.reduce((acc, rec) => {
      const existing = acc.find(r => r.product.id === rec.product.id)
      if (!existing) {
        acc.push(rec)
      } else {
        // Combine scores if duplicate
        existing.score = Math.max(existing.score, rec.score)
        existing.reason = combineReasons(existing.reason, rec.reason)
      }
      return acc
    }, [] as AIRecommendation[])

    return uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) // Top 6 recommendations
  }

  const getTimeBasedRecommendations = (products: Product[], timeOfDay?: string): AIRecommendation[] => {
    if (!timeOfDay) return []

    const timePatterns = {
      morning: ['Coffee', 'Espresso', 'Croissant'],
      afternoon: ['Coffee', 'Latte', 'Sandwich'],
      evening: ['Coffee', 'Dinner', 'Dessert'],
      night: ['Coffee', 'Snack']
    }

    const preferredItems = timePatterns[timeOfDay as keyof typeof timePatterns] || []
    
    return products
      .filter(product => preferredItems.some(item => 
        product.category.toLowerCase().includes(item.toLowerCase())
      ))
      .map(product => ({
        product,
        score: 0.8,
        reason: `Popular ${timeOfDay} item`,
        confidence: 0.75
      }))
  }

  const getComplementaryRecommendations = (products: Product[], cart: CartItem[]): AIRecommendation[] => {
    if (!cart.length) return []

    const cartCategories = cart.map(item => item.product.category)
    const complementaryMap: Record<string, string[]> = {
      'Coffee': ['Bakery', 'Dairy', 'Supplements'],
      'Bakery': ['Coffee', 'Dairy', 'Beverages'],
      'Dairy': ['Coffee', 'Bakery', 'Cereal'],
      'Sandwich': ['Chips', 'Beverages', 'Dessert']
    }

    const recommendations: AIRecommendation[] = []
    
    cartCategories.forEach(category => {
      const complementaryCategories = complementaryMap[category] || []
      const complementaryProducts = products.filter(product => 
        complementaryCategories.some(comp => 
          product.category.toLowerCase().includes(comp.toLowerCase())
        )
      )

      complementaryProducts.forEach(product => {
        recommendations.push({
          product,
          score: 0.9,
          reason: `Pairs well with ${category}`,
          confidence: 0.85
        })
      })
    })

    return recommendations
  }

  const getHistoricalRecommendations = (products: Product[], history: string[]): AIRecommendation[] => {
    if (!history.length) return []

    return products
      .filter(product => 
        history.some(item => 
          item.toLowerCase() === product.name.toLowerCase() ||
          product.category.toLowerCase().includes(item.toLowerCase())
        )
      )
      .map(product => ({
        product,
        score: 0.95,
        reason: 'Based on your preferences',
        confidence: 0.9
      }))
  }

  const getPopularRecommendations = (products: Product[]): AIRecommendation[] => {
    // Simulate popularity based on mock sales data
    const popularityScores: Record<string, number> = {
      'Espresso': 0.9,
      'Cappuccino': 0.85,
      'Latte': 0.8,
      'Croissant': 0.75,
      'Muffin': 0.7,
      'Americano': 0.65
    }

    return products
      .map(product => ({
        product,
        score: popularityScores[product.name] || 0.5,
        reason: 'Trending item',
        confidence: 0.7
      }))
  }

  const combineReasons = (reason1: string, reason2: string): string => {
    return `${reason1} • ${reason2}`
  }

  // Memoize filtered recommendations to avoid re-calculation
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => 
      !cart.some(item => item.product.id === rec.product.id)
    )
  }, [recommendations, cart])

  return {
    recommendations: filteredRecommendations,
    isAnalyzing,
    topRecommendation: filteredRecommendations[0],
    hasRecommendations: filteredRecommendations.length > 0
  }
}
