import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8),
  })
)

export type RegisterValidatorOutput = InferInput<typeof registerValidator>
