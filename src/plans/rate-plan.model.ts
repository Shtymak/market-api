export interface StoragePlan {
  name: string;
  storageLimit: number; // in GB
  price: number; // in USD per month
  isFree: boolean;
  avaible: boolean;
}
export const StoragePlans: StoragePlan[] = [
  { name: 'base', storageLimit: 5, price: 0, isFree: true, avaible: true },
  { name: 'student', storageLimit: 100, price: 0, isFree: true, avaible: true },
  { name: 'move', storageLimit: 15, price: 1, isFree: false, avaible: true },
  // { name: 'move+', storageLimit: 25, price: 1.5, isFree: false },
  { name: 'pro', storageLimit: 50, price: 2, isFree: false, avaible: true },
  { name: 'pro+', storageLimit: 100, price: 3, isFree: false, avaible: true },
  { name: 'set', storageLimit: 500, price: 10, isFree: false, avaible: false },
  // { name: 'set+', storageLimit: 1000, price: 18, isFree: false },
  {
    name: 'crazy',
    storageLimit: 1800,
    price: 25,
    isFree: false,
    avaible: false,
  },
  {
    name: 'crazy+',
    storageLimit: 3000,
    price: 35,
    isFree: false,
    avaible: false,
  },
  {
    name: 'sensei',
    storageLimit: 5000,
    price: 50,
    isFree: false,
    avaible: false,
  },
  {
    name: 'sensei+',
    storageLimit: 10000,
    price: 75,
    isFree: false,
    avaible: false,
  },
];

export enum StoragePlanView {
  BASE = 'base',
  STUDENT = 'student',
  MOVE = 'move',
  // MOVE_PLUS = 'move+',
  PRO = 'pro',
  PRO_PLUS = 'pro+',
  SET = 'set',
  // SET_PLUS = 'set+',
  CRAZY = 'crazy',
  CRAZY_PLUS = 'crazy+',
  SENSEI = 'sensei',
  SENSEI_PLUS = 'sensei+',
}
