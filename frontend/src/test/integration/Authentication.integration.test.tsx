import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store'
import LoginPage from '@/pages/auth/LoginPage'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  )
}

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders login form correctly', () => {
    renderWithProviders(<LoginPage />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('validates email input', async () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  test('validates password input', async () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter valid email but short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(signinButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  test('successful login redirects to dashboard', async () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter valid credentials
    fireEvent.change(emailInput, { target: { value: 'admin@algohub.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
    
    await waitFor(() => {
      // Should redirect to dashboard (mocked)
      expect(window.location.pathname).toBe('/dashboard')
    }, { timeout: 3000 })
  })

  test('handles login failure gracefully', async () => {
    // Mock failed login
    global.console.error = vi.fn()
    
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Enter invalid credentials
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  test('toggles password visibility', () => {
    renderWithProviders(<LoginPage />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    // Password should be hidden initially
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Click to hide password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('remembers login state with remember me', async () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const rememberCheckbox = screen.getByLabelText(/remember me/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Check remember me
    fireEvent.click(rememberCheckbox)
    
    // Enter credentials and login
    fireEvent.change(emailInput, { target: { value: 'admin@algohub.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(localStorage.getItem('rememberMe')).toBe('true')
    })
  })

  test('disables form during submission', async () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'admin@algohub.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(signInButton)
    
    // Form should be disabled during submission
    await waitFor(() => {
      expect(signInButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })
  })

  test('supports keyboard navigation', () => {
    renderWithProviders(<LoginPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    // Tab navigation should work
    emailInput.focus()
    fireEvent.keyDown(emailInput, { key: 'Tab' })
    expect(passwordInput).toHaveFocus()
    
    // Enter key should submit form
    fireEvent.change(emailInput, { target: { value: 'admin@algohub.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.keyDown(passwordInput, { key: 'Enter' })
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  test('displays loading state correctly', async () => {
    renderWithProviders(<LoginPage />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.click(signInButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(signInButton).toBeDisabled()
    })
  })
})
