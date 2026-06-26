import { PrismaClient } from "@prisma/client"
import { Role } from "@prisma/client"
import { hashPassword } from "@/app/lib/auth";


const prisma = new PrismaClient()

async function main() {
    console.log(`Start seeding ...`)

   //creating teams
   const teams = await Promise.all([
    prisma.team.create({
        data: {
            name: "marketting",
            description: "marketting team",
            code: "MKT"
        },
    }),
    prisma.team.create({
        data: {
            name: "sales",
            description: "sales team",
            code: "SLS"
        },
    }),
    prisma.team.create({
        data: {
            name: "engineering",
            description: "engineering team",
            code: "ENG"
        },
    }),
   ]) ;


//    create sample users
const sampleUsers = [
    {
        name: "John Doe",
        email: "john@gmail.com",
        team: teams[0],
        role: Role.MANAGER,
    },
    {
        name: "Jane Smith",
        email: "jane@gmail.com",
        team: teams[1],
        role: Role.USER,
    },
    {
        name: "Alice Johnson",
        email: "Alice@gmail.com",
        team: teams[2],
        role: Role.USER,
    }
];

for (const user of sampleUsers) {
    await prisma.user.create({
        data: {
            name: user.name,
            email: user.email,
            teamId: user.team.id,
            role: user.role,
            password: await hashPassword("password123"), // Hash the password before storing
        }
    });
}

    console.log(`Seeding succesful.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });