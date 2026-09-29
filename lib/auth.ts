import {cookies} from 'next/headers';import {SignJWT,jwtVerify} from 'jose';import bcrypt from 'bcryptjs';import {findOne} from './db';import type {User,Role} from '@/types';
const secret=new TextEncoder().encode(process.env.JWT_SECRET||'resq-development-secret-change-me');const COOKIE='resq_session';
export async function hashPassword(p:string){return bcrypt.hash(p,12)}export async function verifyPassword(p:string,h:string){return bcrypt.compare(p,h)}
export async function setSession(user:Pick<User,'_id'|'name'|'email'|'role'>){const token=await new SignJWT(user).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);cookies().set(COOKIE,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*7})}
export async function clearSession(){cookies().delete(COOKIE)}
export async function currentUser():Promise<Pick<User,'_id'|'name'|'email'|'role'>|null>{const token=cookies().get(COOKIE)?.value;if(!token)return null;try{const {payload}=await jwtVerify(token,secret);return {_id:String(payload._id),name:String(payload.name),email:String(payload.email),role:String(payload.role) as Role}}catch{return null}}
export async function requireRole(roles:Role[]){const u=await currentUser();if(!u||!roles.includes(u.role))throw new Error('UNAUTHORIZED');return u}
export async function findUserByEmail(email:string){return findOne<User>('users',{email:email.toLowerCase()})}
