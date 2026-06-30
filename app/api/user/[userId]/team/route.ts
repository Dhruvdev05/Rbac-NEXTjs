import { checkUserPermission ,getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function PATCH(request: NextRequest, 
    context : { params: Promise<{ userId: string }> } ) {

 try {
            const { userId } = await context.params;
            const user = await getCurrentUser() ;

            if(!user || !checkUserPermission(user, Role.ADMIN)) {
            
            return NextResponse.json(
                {
                    error: 'Unauthorized to assign teams',
                },
                { status: 401 }
            )
            }

            const { teamId } = await request.json();
            
            if (!teamId) {
                const team = await prisma.team.findUnique({
                    where: { id: teamId },
                });

                if (!team) {
                    return NextResponse.json(
{
    error: 'Team not found',
},
{ status: 404 }
                    );
                }
            

            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { 
                    teamId: teamId 
                },
                include: {
                    team: true,
                }
            });

            return NextResponse.json({
                user: updatedUser,
                message: teamId ? 'Team assigned successfully' : 'Team removed successfully',
            });

        }   catch (error) {
            console.error('Error assigning team:', error);
            if (error instanceof Error && error.message === 'User not found') {
            return NextResponse.json({
                error: 'User not found',
            },
            { status: 404 }

            )
        }    
        return NextResponse.json({
                error: 'Internal Server Error',
            },
            { status: 500 }
        )
    }
}
