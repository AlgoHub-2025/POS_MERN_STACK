import React from 'react'
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor,
  Chrome
} from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export const InstallPrompt: React.FC = () => {
  const { 
    showInstallPrompt, 
    isInstallable, 
    isInstalled, 
    installApp, 
    dismissInstallPrompt 
  } = usePWA()

  const getBrowserIcon = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) return <Chrome className="w-5 h-5" />
    if (userAgent.includes('safari')) return <Smartphone className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        title: 'Install on iOS',
        steps: [
          'Tap the Share button in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      }
    }
    
    if (userAgent.includes('android')) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the menu button in Chrome',
          'Tap "Add to Home screen"',
          'Tap "Add" to install the app'
        ]
      }
    }
    
    return {
      title: 'Install App',
      steps: [
        'Click the install button below',
        'Follow your browser\'s instructions',
        'Enjoy the app on your device!'
      ]
    }
  }

  if (!showInstallPrompt || isInstalled) {
    return null
  }

  const instructions = getInstallInstructions()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
              <Download className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Install AlgoHub POS
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get the full app experience
              </p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isInstallable ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                {getBrowserIcon()}
                <div>
                  <p className="font-medium text-primary-900 dark:text-primary-100">
                    Ready to install!
                  </p>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    Click install to add AlgoHub POS to your device
                  </p>
                </div>
              </div>
              
              <button
                onClick={installApp}
                className="w-full btn-primary hover:scale-105 transition-transform duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <Smartphone className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {instructions.title}
                </h4>
              </div>
              
              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={dismissInstallPrompt}
            className="w-full btn-secondary"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
