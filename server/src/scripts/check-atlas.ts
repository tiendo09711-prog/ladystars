import { connectDatabase } from '../config/database.js';
import mongoose from 'mongoose';

await connectDatabase();
const db = mongoose.connection.db!;
const colls = await db.listCollections().toArray();

console.log('\n=== COLLECTIONS TRÊN ATLAS ===');
for (const c of colls) {
  const count = await db.collection(c.name).countDocuments();
  console.log(`  ${c.name}: ${count} docs`);
}
console.log('==============================\n');
process.exit(0);
