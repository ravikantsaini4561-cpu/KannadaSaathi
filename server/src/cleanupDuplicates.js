import 'dotenv/config';
import mongoose from 'mongoose';
import Phrase from './models/Phrase.js';

async function cleanupDuplicates() {
  const uri = process.env.MONGO_URI || '';

  // Safety check: only allow the local test database.
  if (!uri.includes('/kannadasaathi_upgrade_test')) {
    throw new Error(
      'Safety stop: MONGO_URI must point to kannadasaathi_upgrade_test.'
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    console.log('Connected to the test database.');

    const duplicates = await Phrase.aggregate([
      {
        $group: {
          _id: {
            category: '$category',
            english: '$english'
          },
          ids: { $push: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let deletedCount = 0;

    for (const group of duplicates) {
      // Keep one record and remove only its duplicate copies.
      const idsToDelete = group.ids.slice(1);

      if (idsToDelete.length > 0) {
        const result = await Phrase.deleteMany({
          _id: { $in: idsToDelete }
        });

        deletedCount += result.deletedCount;
      }
    }

    // Prevent the same category/English phrase from being
    // inserted twice in future.
    await Phrase.collection.createIndex(
      { category: 1, english: 1 },
      {
        unique: true,
        name: 'category_english_unique'
      }
    );

    console.log(`Duplicate records removed: ${deletedCount}`);
    console.log('One copy of each phrase has been preserved.');
    console.log('Unique phrase index created.');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

cleanupDuplicates();