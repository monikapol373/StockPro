import { connectDB } from './db.js';
import { User } from './models.js';
await connectDB();
await User.updateMany({ role: { $exists: false } }, { $set: { role: 'admin', isActive: true } });
console.log('Done');
process.exit();
