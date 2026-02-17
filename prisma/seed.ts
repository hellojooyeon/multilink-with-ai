import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Cleanup Links
    await prisma.link.deleteMany()

    // Create Links
    await prisma.link.createMany({
        data: [
            {
                title: 'Official Website',
                url: 'https://example.com',
                icon: 'Globe',
                variant: 'card',
                order: 1,
                isActive: true,
            },
            {
                title: 'Latest YouTube Video',
                url: 'https://youtube.com',
                icon: 'Youtube',
                variant: 'card',
                order: 2,
                isActive: true,
            },
            {
                title: 'Open Soon Project',
                url: 'https://example.com/project',
                icon: 'Rocket',
                variant: 'list',
                order: 3,
                isActive: true,
                startDate: new Date('2030-01-01'), // Future date
            },
            {
                title: 'My Portfolio',
                url: 'https://portfolio.example.com',
                icon: 'Briefcase',
                variant: 'list',
                order: 4,
                isActive: true,
            },
            {
                title: 'Coming Soon (Inactive)',
                url: 'https://example.com/coming-soon',
                icon: 'Star',
                variant: 'card',
                order: 5,
                isActive: false,
            },
        ],
    })

    console.log('Seeded links')
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
