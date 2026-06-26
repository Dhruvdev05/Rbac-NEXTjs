import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/db";


export async function GET(request : NextRequest) { 

     try {
            const user = await getCurrentUser();

    if (!user) {
         return NextResponse.json(
                      {
                          error: 'not authorized to access this resource'},
                      { status: 401 }
                  ); 
    }

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');
    const requestedRole = searchParams.get('role');
    const role = requestedRole && Object.values(Role).includes(requestedRole as Role)
        ? (requestedRole as Role)
        : null;

const where: Prisma.UserWhereInput = {};
if (user.role === Role.ADMIN) {
    // Admins can query any role.
} else if (user.role === Role.MANAGER) {
    where.OR = [{ teamId: teamId }, { role: Role.USER }];
}else {
    where.teamId = user.teamId;
    where.role = { not :Role.ADMIN };
}

if(teamId) {
    where.teamId = teamId;
}
if (role) {
    if (user.role !== Role.ADMIN && role === Role.ADMIN) {
        return NextResponse.json(
            { error: 'forbidden' },
            { status: 403 }
        );
    }
    where.role = role;
}

const users = await prisma.user.findMany({
where,
select: {
    id: true,
    name: true,
    email: true,
    role: true,
    team: {
        select: {
            id: true,
            name: true
        },
    },
    createdAt: true,
},
orderBy: {
    createdAt: 'desc',
},
})
return NextResponse.json( {users});     
}
        catch (error) {
console.error('Error in user route', error);
return NextResponse.json({
    error: 'Internal Server Error,something went wrong'
},
    { status: 500 }
);
        }
 }
    

  
