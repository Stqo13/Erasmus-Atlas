import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'strong_Secret_for_JSON_web_token_12345';

export const hash = (p:string)=> bcrypt.hashSync(p,10);
export const check = (p:string,h:string)=> bcrypt.compareSync(p,h);
export const sign  = (payload:object)=> jwt.sign(payload, SECRET, { expiresIn:'7d' });
export const verify = (t:string)=> jwt.verify(t, SECRET) as any;
