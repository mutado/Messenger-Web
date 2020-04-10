import { Role } from "./role";

export class User {
    id: number;
    username: string;
    name: string;
    email:string;
    password: string;
    role: Role;
    token?: string;
}