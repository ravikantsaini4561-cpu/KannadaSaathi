import mongoose from 'mongoose';

const phraseSchema = new mongoose.Schema({
  english: {
    type: String,
    required: true
  },

  hindi: {
    type: String,
    default: ''
  },

  kannada: {
    type: String,
    required: true
  },

  transliteration: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: [
      'healthcare',
      'college',
      'food',
      'transport',
      'village',
      'beach',
      'hills',
      'mall',
      'festival',
      'work',
      'emergency'
    ],
    index: true
  },

  tags: {
    type: [String],
    default: []
  },

  audioUrl: {
    type: String,
    default: ''
  },

  verified: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Phrase', phraseSchema);