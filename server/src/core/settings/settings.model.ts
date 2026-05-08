import { Schema, model } from 'mongoose';

export const StoreSetting = model('StoreSetting', new Schema({
  singletonKey: { type: String, default: 'store', unique: true },
  shopName: { type: String, default: 'LadyStars' },
  logoUrl: String,
  address: String,
  phone: String,
  taxCode: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));
