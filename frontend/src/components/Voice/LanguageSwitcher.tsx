import React, { useState } from 'react'
import { Globe, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import { VoiceRecognitionService, LanguagePack } from '@/services/voiceRecognition'

interface LanguageSwitcherProps {
  voiceService: VoiceRecognitionService
  onLanguageChange?: (language: string) => void
  className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  voiceService,
  onLanguageChange,
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(voiceService.getCurrentLanguage())
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const availableLanguages = voiceService.getAvailableLanguages()

  React.useEffect(() => {
    // Update listening status
    const updateStatus = () => {
      setIsListening(voiceService.isCurrentlyListening())
    }

    const interval = setInterval(updateStatus, 100)
    return () => clearInterval(interval)
  }, [voiceService])

  const handleLanguageChange = (languageCode: string) => {
    voiceService.setLanguage(languageCode)
    setCurrentLanguage(languageCode)
    setShowLanguageMenu(false)
    onLanguageChange?.(languageCode)
    
    // Announce language change
    if (!isMuted) {
      const languagePack = availableLanguages.find(lang => lang.code === languageCode)
      if (languagePack) {
        voiceService.speak(`Language changed to ${languagePack.name}`)
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      voiceService.speak('Voice feedback muted')
    }
  }

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening()
    } else {
      voiceService.startListening()
    }
  }

  const getCurrentLanguageFlag = (languageCode: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷'
    }
    return flags[languageCode] || '🌐'
  }

  const getCurrentLanguageName = () => {
    const languagePack = availableLanguages.find(lang => lang.code === currentLanguage)
    return languagePack?.name || 'English'
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleListening}
          className={`
            p-3 rounded-lg border transition-all duration-200
            ${isListening 
              ? 'bg-red-600 border-red-400 text-white animate-pulse' 
              : 'bg-gray-800 border-gray-700 text-green-400 hover:bg-gray-700'
            }
          `}
          title={isListening ? 'Stop listening' : 'Start voice recognition'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center space-x-2 p-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200"
          title="Select language"
        >
          <Globe className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">
            {getCurrentLanguageFlag(currentLanguage)} {getCurrentLanguageName()}
          </span>
        </button>

        <button
          onClick={toggleMute}
          className={`
            p-3 rounded-lg border transition-all duration-200
            ${isMuted 
              ? 'bg-gray-800 border-gray-700 text-gray-400' 
              : 'bg-gray-800 border-gray-700 text-green-400 hover:bg-gray-700'
            }
          `}
          title={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Language dropdown menu */}
      {showLanguageMenu && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-green-400 font-semibold">Select Language</h3>
            <p className="text-gray-400 text-sm">Choose your preferred voice recognition language</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full px-4 py-3 flex items-center space-x-3 transition-colors duration-200
                  ${currentLanguage === language.code
                    ? 'bg-green-900/20 text-green-400 border-l-4 border-green-400'
                    : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                <span className="text-2xl">{getCurrentLanguageFlag(language.code)}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm text-gray-400">{language.code.toUpperCase()}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Voice Recognition</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                voiceService.isSpeechRecognitionSupported()
                  ? 'bg-green-900/20 text-green-400'
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {voiceService.isSpeechRecognitionSupported() ? 'Supported' : 'Not Supported'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Voice Feedback</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                voiceService.isSpeechSynthesisSupported()
                  ? 'bg-green-900/20 text-green-400'
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {voiceService.isSpeechSynthesisSupported() ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {showLanguageMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageMenu(false)}
        />
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  )
}

export default LanguageSwitcher
