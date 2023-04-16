export interface StoragePlan {
  name: string;
  storageLimit: number; // in GB
  price: number; // in USD per month
  isFree: boolean;
  avaible: boolean;
  imageUrl: string;
  description?: string;
}
export const StoragePlans: StoragePlan[] = [
  {
    name: 'base',
    storageLimit: 5,
    price: 0,
    isFree: true,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495288/assets/base_l0lrtq.png',
    description:
      'Безкоштовний план з 5 ГБ місця для зберігання. Ідеально підходить для користувачів з базовими потребами.',
  },
  {
    name: 'student',
    storageLimit: 100,
    price: 0,
    isFree: true,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/student_tnynpb.png',
    description:
      'Безкоштовний план для студентів з 100 ГБ місця для зберігання. Надає більше місця для проектів і документів.',
  },
  {
    name: 'move',
    storageLimit: 15,
    price: 1,
    isFree: false,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495288/assets/move_xzmy8s.png',
    description:
      'Платний план з 15 ГБ місця для зберігання. Відмінний вибір для користувачів, які потребують трохи більше місця.',
  },
  {
    name: 'pro',
    storageLimit: 50,
    price: 2,
    isFree: false,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/pro_k79v1p.png',
    description:
      'План "Pro" з 50 ГБ місця для зберігання. Призначений для професіоналів, які потребують більше місця і ресурсів.',
  },
  {
    name: 'pro+',
    storageLimit: 100,
    price: 3,
    isFree: false,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495288/assets/pro_plus_mpxxuj.png',
    description:
      'План "Pro+" з 100 ГБ місця для зберігання. Ідеальний варіант для професіоналів, які потребують ще більше місця та продуктивності.',
  },
  {
    name: 'set',
    storageLimit: 500,
    price: 10,
    isFree: false,
    avaible: false,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/set_ghjn7p.png',
    description:
      'План "Set" з 500 ГБ місця для зберігання. Відмінно підходить для бізнесу або великих проектів, що потребують значного місця для зберігання.',
  },
  {
    name: 'crazy',
    storageLimit: 1800,
    price: 25,
    isFree: false,
    avaible: false,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/crazy_sjueel.png',
    description:
      'План "Crazy" з 1800 ГБ місця для зберігання. Відмінний вибір для користувачів, яким потрібне величезне місце для зберігання даних.',
  },
  {
    name: 'crazy+',
    storageLimit: 3000,
    price: 35,
    isFree: false,
    avaible: false,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495288/assets/crazy_plus_g28j4f.png',
    description:
      'План "Crazy+" з 3000 ГБ місця для зберігання. Ідеальний варіант для тих, кому потрібне неймовірно велике місце для зберігання даних та ресурсів.',
  },
  {
    name: 'sensei',
    storageLimit: 5000,
    price: 50,
    isFree: false,
    avaible: true,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/sensei_rzkyci.png',
    description:
      'План "Sensei" з 5000 ГБ місця для зберігання. Найкращий варіант для корпоративних клієнтів або великих організацій з великими потребами у зберіганні даних.',
  },
  {
    name: 'sensei+',
    storageLimit: 10000,
    price: 75,
    isFree: false,
    avaible: false,
    imageUrl:
      'https://res.cloudinary.com/dxb12m5lg/image/upload/v1681495289/assets/sensei_plus_ylc6nd.png',
    description:
      'План "Sensei+" з 10 000 ГБ місця для зберігання. Цей план створений для надзвичайно великих організацій або корпоративних клієнтів, яким потрібне масивне місце для зберігання даних та висока продуктивність.',
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
