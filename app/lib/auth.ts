import { Role, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET;

export const hashPassword = async (password: string) : Promise<string> => {
    return await bcrypt.hash(password, 12);
}

export const verifyPassword = async (password: string , hashedPassword: string) : Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}

export const generateToken = (userId: string, role: string) : string => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}


export const verifyToken = (token: string) : { userId: string; 
role: string;
 } => {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        return jwt.verify(token, JWT_SECRET) as {
             userId: string;
             role: string 
            };
}

export const getCurrentUser = async () :  Promise<User | null> => {
    try {
const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;
if (!token) return null;
const decode = verifyToken(token);  

const userFromDb = await prisma.user.findUnique({
    where: { id: decode.userId },

});
if (!userFromDb) return null;
const { password, ...user } = userFromDb;
return user as User;
    }
    catch (error) {
console.error('Error getting current user:', error);
return null;
    }
}

export const checkUserPermission = (
    user: User,
    requiredRole: Role
    ) : boolean => {
        const roleHierarchy: Record<Role, number> = {
[Role.GUEST]: 0,
[Role.USER]: 1,
[Role.MANAGER]: 2,
[Role.ADMIN]: 3,
        }
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
        }
     