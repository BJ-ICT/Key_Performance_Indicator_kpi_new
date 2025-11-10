import mongoose from 'mongoose';
import TableDataModel from '../models/TableDataModel.js';

// Usage: node backend/scripts/migrateAddYear.js MONGODB_URI [defaultYear]
const [,, uri, defaultYearArg] = process.argv;
if (!uri) {
  console.error('Provide MongoDB URI. Usage: node backend/scripts/migrateAddYear.js MONGODB_URI [defaultYear]');
  process.exit(1);
}

const defaultYear = Number(defaultYearArg) || new Date().getFullYear();

async function run() {
  await mongoose.connect(uri, { autoIndex: true });
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cursor = TableDataModel.collection.find({ year: { $exists: false } });
    let updated = 0;
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const created = doc.createdAt ? new Date(doc.createdAt) : null;
      const yearToSet = created && !isNaN(created.getTime()) ? created.getFullYear() : defaultYear;
      await TableDataModel.updateOne(
        { _id: doc._id },
        { $set: { year: yearToSet } },
        { session }
      );
      updated++;
    }

    // Create the compound index if not present
    await TableDataModel.collection.createIndex({ year: 1, month: 1 }, { unique: true, background: true });

    await session.commitTransaction();
    console.log(`Migration complete. Updated docs: ${updated}`);
  } catch (e) {
    console.error('Migration failed:', e);
    await session.abortTransaction();
    process.exit(1);
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
}

run();






