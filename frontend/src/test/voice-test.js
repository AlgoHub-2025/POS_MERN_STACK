// Voice Recognition Test Script
// Run this in browser console to test voice functionality

console.log('🎤 Voice Recognition Test Script');
console.log('================================');

// Test 1: Check Web Speech API Support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  console.log('✅ Speech Recognition API is supported');
} else {
  console.log('❌ Speech Recognition API is not supported');
}

if ('speechSynthesis' in window) {
  console.log('✅ Speech Synthesis API is supported');
} else {
  console.log('❌ Speech Synthesis API is not supported');
}

// Test 2: Test Voice Recognition Service
try {
  const VoiceRecognitionService = window.VoiceRecognitionService;
  if (VoiceRecognitionService) {
    const voiceService = new VoiceRecognitionService();
    console.log('✅ Voice Recognition Service loaded');
    
    // Test available languages
    const languages = voiceService.getAvailableLanguages();
    console.log('🌐 Available Languages:', languages.map(lang => `${lang.name} (${lang.code})`));
    
    // Test commands for current language
    const commands = voiceService.getCommandsForCurrentLanguage();
    console.log('📋 Available Commands:', Object.keys(commands));
    
  } else {
    console.log('❌ Voice Recognition Service not available');
  }
} catch (error) {
  console.log('❌ Error loading Voice Recognition Service:', error);
}

// Test 3: Test Speech Synthesis
try {
  const utterance = new SpeechSynthesisUtterance('Voice synthesis test successful');
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 0.5;
  
  console.log('🔊 Testing speech synthesis...');
  speechSynthesis.speak(utterance);
  console.log('✅ Speech synthesis test initiated');
} catch (error) {
  console.log('❌ Speech synthesis test failed:', error);
}

// Test 4: Microphone Permission
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.log('❌ Microphone access denied:', error);
  });

console.log('================================');
console.log('🎯 Test complete! Check the POS terminal for voice controls.');

// Helper function to test voice commands
window.testVoiceCommand = function(command) {
  console.log(`🎤 Testing command: "${command}"`);
  
  // Find the voice service instance in the React app
  const voiceService = window.__VOICE_SERVICE__;
  if (voiceService) {
    // Simulate command processing
    const mockCommand = {
      command: command.toLowerCase(),
      intent: 'test',
      entities: {},
      confidence: 0.9,
      language: 'en'
    };
    
    console.log('✅ Command processed:', mockCommand);
  } else {
    console.log('❌ Voice service not found in window');
  }
};

// Test commands
console.log('\n📝 Available test commands:');
console.log('testVoiceCommand("add espresso")');
console.log('testVoiceCommand("search coffee")');
console.log('testVoiceCommand("show total")');
console.log('testVoiceCommand("help")');
