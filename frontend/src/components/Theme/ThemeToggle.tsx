import React, { useState } from 'react'
import { 
  Sun, 
  Moon, 
  Monitor, 
  ChevronDown 
} from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'

export const ThemeToggle: React.FC = () => {
  const { theme, isDark, setThemeMode } = useDarkMode()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4" />,
      description: 'Light mode'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4" />,
      description: 'Dark mode'
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Use system preference'
    }
  ]

  const currentTheme = themes.find(t => t.value === theme)

  const handleThemeSelect = (newTheme: string) => {
    setThemeMode(newTheme as 'light' | 'dark' | 'system')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        title={`Current theme: ${currentTheme?.description}`}
      >
        {currentTheme?.icon}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-slide-up">
            <div className="py-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => handleThemeSelect(themeOption.value)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    theme === themeOption.value 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {themeOption.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">
                      {themeOption.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.value && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Theme Preview */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Preview
              </div>
              <div className="flex space-x-2">
                <div className={`w-16 h-8 rounded border-2 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}>
                  <div className={`w-full h-full rounded flex items-center justify-center text-xs ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {isDark ? '🌙' : '☀️'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeToggle
