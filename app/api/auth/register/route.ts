import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = validated.data

    // Check if user exists (compound unique index [email, siteId] requires findFirst)
    const existingUser = await prisma.user.findFirst({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Create empty cart
    await prisma.cartItem.create({
      data: {
        userId: user.id,
        productId: 'temp', // Will be updated when real products added
        quantity: 0,
      },
    }).catch(() => {}) // Ignore if fails

    return NextResponse.json(
      { message: 'Conta criada com sucesso', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}