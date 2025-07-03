export interface User {
  id: string;
  email: string;
  role: string;
  profile?: { id: string };
  products?:{id:string}
}
