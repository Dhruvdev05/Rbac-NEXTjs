import { NextRequest , NextResponse} from "next/server";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                {
                    error: 'User not authenticated'},
                { status: 401 }
            );
        }
return NextResponse.json(user);
    }
    catch (error) {
console.error('Error in currentuser', error);
return NextResponse.json({
    error: 'Internal Server Error,something went wrong'
},
    { status: 500 }
);
    }
}