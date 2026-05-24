import { connectDatabase } from '../config/database.js';
import { Branch } from '../core/org/branch.model.js';
import { Order } from '../modules/orders/orders.models.js';

async function main() {
  await connectDatabase();
  const branches = await Branch.find().lean();
  console.log('--- Branches ---');
  console.log(branches);

  const orders = await Order.find().limit(5).lean();
  console.log('--- Orders (limit 5) ---');
  console.log(orders.map(o => ({
    _id: o._id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    warehouse: o.warehouse,
    status: o.status
  })));

  process.exit(0);
}

main().catch(console.error);
