
import { prisma } from '../lib/prisma'

async function main() {
  // Criar alguns alunos de exemplo
  await prisma.student.createMany({
    data: [
      {
        name: "João Silva",
        email: "joao@exemplo.com",
        phone: "61999999999"
      },
      {
        name: "Maria Santos",
        email: "maria@exemplo.com", 
        phone: "61888888888"
      },
      {
        name: "Pedro Costa",
        email: "pedro@exemplo.com",
        phone: "61777777777"
      }
    ],
    skipDuplicates: true
  })

  // Criar uma live de exemplo
  await prisma.liveEvent.upsert({
    where: { slug: "live-exemplo" },
    update: {},
    create: {
      title: "Live de Exemplo - Capacitação",
      slug: "live-exemplo",
      youtubeId: "dQw4w9WgXcQ",
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),   // Tomorrow + 1 hour
      durationMin: 60,
      isActive: true
    }
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
