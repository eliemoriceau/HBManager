import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(1),
  })
)

export type LoginValidatorOutput = InferInput<typeof loginValidator>
