
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const liveId = searchParams.get('liveId')

    let students: any[] = []
    let filename = 'alunos.xlsx'

    if (type === 'all') {
      // Exportar todos os alunos
      students = await prisma.student.findMany({
        include: {
          _count: {
            select: { Attendance: true }
          }
        },
        orderBy: { name: 'asc' }
      })
      filename = 'todos-os-alunos.xlsx'
    } else if (type === 'present' && liveId) {
      // Exportar alunos presentes na aula
      const liveEvent = await prisma.liveEvent.findUnique({
        where: { id: BigInt(liveId) },
        select: { title: true }
      })

      students = await prisma.student.findMany({
        where: {
          Attendance: {
            some: {
              liveId: BigInt(liveId)
            }
          }
        },
        include: {
          _count: {
            select: { Attendance: true }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      filename = `presentes-${liveEvent?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'aula'}.xlsx`
    } else if (type === 'absent' && liveId) {
      // Exportar alunos ausentes na aula
      const liveEvent = await prisma.liveEvent.findUnique({
        where: { id: BigInt(liveId) },
        select: { title: true }
      })

      students = await prisma.student.findMany({
        where: {
          Attendance: {
            none: {
              liveId: BigInt(liveId)
            }
          }
        },
        include: {
          _count: {
            select: { Attendance: true }
          }
        },
        orderBy: { name: 'asc' }
      })
      
      filename = `ausentes-${liveEvent?.title?.replace(/[^a-zA-Z0-9]/g, '-') || 'aula'}.xlsx`
    }

    // Gerar conteúdo CSV simples (pode ser aberto no Excel)
    const csvHeader = 'Nome,Email,Telefone,Cidade,Modalidade,Sexo,Total de Presencas,Data de Cadastro\n'
    
    const csvContent = students.map(student => {
      const name = (student.name || 'Não informado').replace(/,/g, ';')
      const email = student.email.replace(/,/g, ';')
      const phone = (student.phone || 'Não informado').replace(/,/g, ';')
      const city = (student.city || 'Não informado').replace(/,/g, ';')
      const studyStyle = (student.studyStyle || 'Não informado').replace(/,/g, ';')
      const sex = (student.sex || 'Não informado').replace(/,/g, ';')
      const attendanceCount = student._count.Attendance
      const createdAt = new Date(student.createdAt).toLocaleDateString('pt-BR')
      
      return `"${name}","${email}","${phone}","${city}","${studyStyle}","${sex}",${attendanceCount},"${createdAt}"`
    }).join('\n')

    const fullCsv = csvHeader + csvContent

    // Retornar como arquivo Excel
    const buffer = Buffer.from('\ufeff' + fullCsv, 'utf-8') // BOM para UTF-8

    const response = new NextResponse(buffer)
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    return response
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erro na exportação' }, { status: 500 })
  }
}
