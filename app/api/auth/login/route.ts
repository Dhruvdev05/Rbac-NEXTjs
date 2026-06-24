import { prisma } from "@/app/lib/db";
import { error } from "console";
import { NextResponse , NextRequest} from "next/server";
import { hashPassword , generateToken, verifyPassword } from "@/app/lib/auth";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
    try{
const { password, email,} = await request.json();

if( !email || !password) {
return NextResponse.json(
    {
        error: 'Email and password are required'
  },
     {status: 400});
    }

    // find existing user
    const userFromDb = await prisma.user.findUnique(
        {where: { email },
        include: {
            team: true,
        }
    }
    )
   
    if(!userFromDb) {
       return NextResponse.json(
        {
            error: 'User with this email does not exist'
        },
        { status: 401 }
       ) 
    }

  

    const isValidPassword = await verifyPassword(password , userFromDb.password);

       if(!isValidPassword) {
       return NextResponse.json(
        {
            error: 'invalid credentials'
        },
        { status: 401 }
       ) 
    }


    const token = generateToken(userFromDb.id , userFromDb.role);

    const response = NextResponse.json({ 
        user: {
            id: userFromDb.id,
            name: userFromDb.name,
            email: userFromDb.email,
            role: userFromDb.role,
            team: userFromDb.team ,
            teamId: userFromDb.teamId,
        token,
        },
        }
    )

    response.cookies.set('token', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',

    })
    return response;
}
    catch(error) {
        console.error('Error in login:', error);
return NextResponse.json(
    {
        error: 'Internal Server Error'
  },
     {status: 500});
    }
}