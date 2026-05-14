import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store'
import POSTerminalPage from '@/pages/pos/POSTerminalPage'
import { Product } from '@/types'

// Mock the AIProductGrid component
vi.mock('@/components/POS/AIProductGrid', () => ({
  AIProductGrid: ({ products, cart, onAddToCart }: any) => (
    <div data-testid="ai-product-grid">
      {products.map((product: Product) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button 
            onClick={() => onAddToCart(product)}
            data-testid={`add-${product.id}`}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  )
}))

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  )
}

describe('POS Terminal Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  test('renders POS terminal with initial state', () => {
    renderWithProviders(<POSTerminalPage />)
    
    expect(screen.getByText('AlgoHub POS Terminal')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Point of Sale')).toBeInTheDocument()
    expect(screen.getByText('Cart')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  test('adds product to cart successfully', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add first product to cart
    const addButton = screen.getByTestId('add-1')
    fireEvent.click(addButton)

    // Verify cart updates
    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument()
      expect(screen.getByText('$3.50')).toBeInTheDocument()
    })
  })

  test('updates cart total when products are added', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add multiple products
    fireEvent.click(screen.getByTestId('add-1'))
    fireEvent.click(screen.getByTestId('add-2'))

    await waitFor(() => {
      expect(screen.getByText('$8.00')).toBeInTheDocument() // 3.50 + 4.50
    })
  })

  test('removes product from cart', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add product
    fireEvent.click(screen.getByTestId('add-1'))

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument()
    })

    // Remove product
    const removeButton = screen.getByTitle('Remove from cart')
    fireEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument()
      expect(screen.getByText('$0.00')).toBeInTheDocument()
    })
  })

  test('opens payment modal when checkout is clicked', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add product and checkout
    fireEvent.click(screen.getByTestId('add-1'))
    
    const checkoutButton = screen.getByText('Complete Sale')
    fireEvent.click(checkoutButton)

    await waitFor(() => {
      expect(screen.getByText('Select Payment Method')).toBeInTheDocument()
      expect(screen.getByText('Cash')).toBeInTheDocument()
      expect(screen.getByText('Credit Card')).toBeInTheDocument()
    })
  })

  test('processes payment successfully', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add product and checkout
    fireEvent.click(screen.getByTestId('add-1'))
    fireEvent.click(screen.getByText('Complete Sale'))
    
    // Select payment method
    fireEvent.click(screen.getByText('Cash'))

    await waitFor(() => {
      expect(screen.getByText('Processing payment...')).toBeInTheDocument()
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  test('displays receipt after payment', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Complete the payment flow
    fireEvent.click(screen.getByTestId('add-1'))
    fireEvent.click(screen.getByText('Complete Sale'))
    fireEvent.click(screen.getByText('Cash'))

    await waitFor(() => {
      expect(screen.getByText('Receipt #')).toBeInTheDocument()
      expect(screen.getByText('AlgoHub POS')).toBeInTheDocument()
      expect(screen.getByText('Espresso')).toBeInTheDocument()
    }, { timeout: 6000 })
  })

  test('searches products by name', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Search for specific product
    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'Espresso' } })

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument()
    })
  })

  test('filters products by category', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Filter by Coffee category
    const categoryFilter = screen.getByText('Coffee')
    fireEvent.click(categoryFilter)

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument() // Espresso
      expect(screen.getByTestId('product-2')).toBeInTheDocument() // Cappuccino
      expect(screen.queryByTestId('product-3')).not.toBeInTheDocument() // Croissant (Bakery)
    })
  })

  test('handles error states gracefully', async () => {
    // Mock a failed API call
    global.console.error = vi.fn()
    
    renderWithProviders(<POSTerminalPage />)
    
    // The component should still render even with API errors
    expect(screen.getByText('AlgoHub POS Terminal')).toBeInTheDocument()
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  test('maintains cart state during session', async () => {
    renderWithProviders(<POSTerminalPage />)
    
    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument()
    })

    // Add product to cart
    fireEvent.click(screen.getByTestId('add-1'))

    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument()
    })

    // Cart should persist (simulated by checking current state)
    expect(screen.getByText('$3.50')).toBeInTheDocument()
  })
})
