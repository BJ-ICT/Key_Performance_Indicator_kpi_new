import mongoose from 'mongoose';
import TableDataModel from '../models/TableDataModel.js';
import { FetchMsan, FetchVpn, FetchSlbn } from '../models/MultiTableDataModel.js';

// Usage: node backend/scripts/seedMonthlyDummy.js MONGODB_URI YEAR
const [,, uri, yearArg] = process.argv;
if (!uri) {
  console.error('Provide MongoDB URI. Usage: node backend/scripts/seedMonthlyDummy.js MONGODB_URI YEAR');
  process.exit(1);
}
const year = Number(yearArg) || new Date().getFullYear();

const months = [
  { month: 'October', detailsFactor: 1 },
  { month: 'November', detailsFactor: 1.2 },
];

const sampleAreas = ['NW/WPC', 'NW/WPNE', 'NW/WPSW'];

function buildDetails(factor) {
  return sampleAreas.map((name, i) => ({
    Column1: name,
    Column2: 100 * (i + 1),
    Column3: Math.round(85 * (i + 1) * factor),
    Column4: 0,
  }));
}

async function run() {
  await mongoose.connect(uri, { autoIndex: true });
  try {
    for (const m of months) {
      // TableDataModel
      await TableDataModel.updateOne(
        { year, month: m.month },
        { $set: { details: buildDetails(m.detailsFactor) } },
        { upsert: true }
      );

      // Multi tables
      const details = buildDetails(m.detailsFactor).map(d => ({ Column1: d.Column1, Column2: d.Column2, Column3: d.Column3 }));
      await FetchMsan.updateOne(
        { month: m.month, platform: 'MSAN' },
        { $set: { details } },
        { upsert: true }
      );
      await FetchVpn.updateOne(
        { month: m.month, platform: 'VPN' },
        { $set: { details } },
        { upsert: true }
      );
      await FetchSlbn.updateOne(
        { month: m.month, platform: 'SLBN' },
        { $set: { details } },
        { upsert: true }
      );
    }
    console.log('Seed complete');
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();






