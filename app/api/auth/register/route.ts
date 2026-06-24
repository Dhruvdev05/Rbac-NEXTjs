import { prisma } from "@/app/lib/db";
import { error } from "console";
import { NextResponse , NextRequest} from "next/server";
import { hashPassword , generateToken } from "@/app/lib/auth";
import { Role } from "@prisma/client";

export async function POST(request: NextRequest) {
    try{
const {name, password, email,teamCode} = await request.json();

console.log('Received registration data:', { name, email, teamCode ,password });
if(!name || !email || !password) {
return NextResponse.json(
    {
        error: 'Name, email and password are required'
  },
     {status: 400});
    }

    // find existing user
    const existingUser = await prisma.user.findUnique(
        {where: { email },
    }
    )
    if(existingUser) {
        return NextResponse.json(
            {
                error: 'User with this email already exists'
          },
             {status: 409});
    }

    let teamId : string | undefined;
    if(teamCode) {
        const team = await prisma.team.findUnique({
            where : { code: teamCode},
        });

        if(!team) {
            return NextResponse.json(
                {
                    error: 'Invalid team code'
              },
                 {status: 400}
                );
        }
        teamId = team.id;
    }

    const hashedPassword = await hashPassword(password);

    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            teamId,
            role
        },
        include: {
            team: true,
        },

    })

    const token = generateToken(user.id, user.role);

    const response = NextResponse.json({ 
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team ,
            teamId: user.teamId,
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
        console.error('Error in registration:', error);
return NextResponse.json(
    {
        error: 'Internal Server Error'
  },
     {status: 500});
    }
}