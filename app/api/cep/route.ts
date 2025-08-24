
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cep = searchParams.get('cep')

    if (!cep) {
      return NextResponse.json({ error: 'CEP é obrigatório' }, { status: 400 })
    }

    // Limpar CEP (remover caracteres especiais)
    const cleanCep = cep.replace(/\D/g, '')

    if (cleanCep.length !== 8) {
      return NextResponse.json({ error: 'CEP deve ter 8 dígitos' }, { status: 400 })
    }

    // Buscar CEP na API dos Correios (ViaCEP)
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    const data = await response.json()

    if (data.erro) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 })
    }

    // Retornar dados formatados
    const addressData = {
      cep: data.cep,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      fullAddress: `${data.logradouro ? data.logradouro + ', ' : ''}${data.bairro ? data.bairro + ', ' : ''}${data.localidade || ''} - ${data.uf || ''}`
    }

    const result = NextResponse.json(addressData)
    result.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return result
  } catch (error) {
    console.error('CEP lookup error:', error)
    return NextResponse.json({ error: 'Erro ao buscar CEP' }, { status: 500 })
  }
}
