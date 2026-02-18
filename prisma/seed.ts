import 'dotenv/config'
//import { PrismaClient } from '@prisma/client'
import { PrismaClient } from '../prisma/app/generated/prisma-client'

import { withAccelerate } from '@prisma/extension-accelerate'
const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
    // Upsert Profile
    const profile = await prisma.profile.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Jooyeon Jo',
            bio: 'AI Engineer & Creator',
            image: 'https://github.com/shadcn.png', // Placeholder
            banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Placeholder banner
            instagram: 'https://instagram.com/hellojooyeon',
            blog: 'https://blog.naver.com/hellojooyeon',
            email: 'mailto:hello@example.com',
        },
    })

    console.log({ profile })

    // Cleanup (Order matters due to foreign keys)
    await prisma.linkClick.deleteMany()
    await prisma.link.deleteMany()
    await prisma.group.deleteMany()

    // Create Groups
    const groupSocial = await prisma.group.create({ data: { name: 'Socials', order: 1 } })
    const groupWork = await prisma.group.create({ data: { name: 'Work', order: 2 } })

    // Create Links
    await prisma.link.createMany({
        data: [
            {
                title: 'Official Website',
                url: 'https://example.com',
                icon: 'Globe',
                order: 1,
                isActive: true,
                groupId: groupWork.id
            },
            {
                title: 'Latest YouTube Video',
                url: 'https://youtube.com',
                icon: 'Youtube',
                order: 2,
                isActive: true,
                groupId: groupSocial.id
            },
            {
                title: 'Open Soon Project',
                url: 'https://example.com/project',
                icon: 'Rocket',
                order: 3,
                isActive: true,
                startDate: new Date('2030-01-01'), // Future date
                groupId: groupWork.id
            },
            {
                title: 'My Portfolio',
                url: 'https://portfolio.example.com',
                icon: 'Briefcase',
                order: 4,
                isActive: true,
            },
            {
                title: 'Coming Soon (Inactive)',
                url: 'https://example.com/coming-soon',
                icon: 'Star',
                order: 5,
                isActive: false,
            },
        ],
    })

    console.log('Seeded groups and links')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
