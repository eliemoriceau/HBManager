import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'

export const getMatchesValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    equipeId: vine.string().uuid().optional(),
    officielId: vine.string().uuid().optional(),
  })
)

export type GetMatchesValidatorOutput = InferInput<typeof getMatchesValidator>
