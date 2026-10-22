// [Kannada, reading, English, Hindi, tag]
export const words = [
  ['ನಮಸ್ಕಾರ', 'namaskara', 'Hello / respects', 'namaste', 'Greet'], ['ಧನ್ಯವಾದ', 'dhanyavaada', 'Thank you', 'shukriya', 'Polite'],
  ['ಹೌದು', 'haudu', 'Yes', 'haan', 'Reply'], ['ಇಲ್ಲ', 'illa', 'No', 'nahi', 'Reply'],
  ['ದಯವಿಟ್ಟು', 'dayavittu', 'Please', 'kripya', 'Polite'], ['ಕ್ಷಮಿಸಿ', 'kshamisi', 'Sorry / excuse me', 'maaf kijiye', 'Polite'],
  ['ನೀರು', 'neeru', 'Drinking water', 'paani', 'Need'], ['ಊಟ', 'oota', 'Meal / lunch', 'khana', 'Food'],
  ['ಮನೆ', 'mane', 'House', 'ghar', 'Place'], ['ದಾರಿ', 'daari', 'Direction / way', 'raasta', 'Route'],
  ['ಎಲ್ಲಿ', 'elli', 'Where', 'kahan', 'Ask'], ['ಎಷ್ಟು', 'eshtu', 'How much', 'kitna', 'Ask'],
  ['ಸಹಾಯ', 'sahaaya', 'Help', 'madad', 'Need'], ['ಬಿಸಿ', 'bisi', 'Hot', 'garam', 'Weather'],
  ['ಚಳಿ', 'chali', 'Cold', 'thand', 'Weather'], ['ಚೆನ್ನಾಗಿದೆ', 'chennagide', 'It is good', 'accha hai', 'Polite'],
  ['ಒಂದು', 'ondu', 'One', 'ek', 'Number'], ['ಎರಡು', 'eradu', 'Two', 'do', 'Number'], ['ಮೂರು', 'mooru', 'Three', 'teen', 'Number'],
  ['ನಾಲ್ಕು', 'naalku', 'Four', 'chaar', 'Number'], ['ಐದು', 'aidu', 'Five', 'paanch', 'Number'], ['ಆರು', 'aaru', 'Six', 'chhe', 'Number'],
  ['ಏಳು', 'elu', 'Seven', 'saat', 'Number'], ['ಎಂಟು', 'entu', 'Eight', 'aath', 'Number'], ['ಒಂಬತ್ತು', 'ombattu', 'Nine', 'nau', 'Number'], ['ಹತ್ತು', 'hattu', 'Ten', 'das', 'Number']
].map(([kn, roman, en, hi, tag]) => ({ kn, roman, en, hi, tag, group: tag === 'Number' ? 'numbers' : 'essentials' }));
