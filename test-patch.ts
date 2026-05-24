import { http } from './client/src/core/api/http.js';
import axios from 'axios';

async function testPatch() {
  const apiBaseUrl = 'http://localhost:4000/api';
  const api = axios.create({ baseURL: apiBaseUrl });
  
  // 1. Get first order
  const res = await api.get('/orders/manage?limit=1');
  const order = res.data.items[0];
  console.log('Order before:', order);
  
  // 2. Patch warehouse
  const patchRes = await api.patch(`/orders/manage/${order._id}`, { warehouse: 'Kho Test 123' });
  console.log('Patch response:', patchRes.data);
  
  // 3. Get again
  const getRes = await api.get(`/orders/manage/${order._id}`);
  console.log('Order after:', getRes.data);
}

testPatch().catch(console.error);
