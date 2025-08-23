
import { z } from "zod"

export const liveEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  youtubeId: z.string().min(1, "ID do YouTube é obrigatório"),
  startsAt: z.union([z.string(), z.date()]).transform((val) => typeof val === 'string' ? new Date(val) : val),
  durationHours: z.number().min(0.5, "Duração deve ser pelo menos 30 minutos").max(12, "Duração máxima é 12 horas")
})

export const studentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 dígitos"),
  sex: z.string().optional(),
  birthDate: z.string().optional(),
  city: z.string().optional(),
  fullAddress: z.string().optional(),
  howFoundUs: z.string().optional(),
  studyStyle: z.string().optional()
})

export const attendanceTrackSchema = z.object({
  liveId: z.number(),
  delta: z.number().min(0)
})
