import { makeVar } from "@apollo/client";
export interface User { id: string; email: string; role: string; profile?: { id: string } }
export const userVar = makeVar<User | null>(null);
