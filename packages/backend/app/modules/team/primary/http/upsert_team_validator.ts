import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'

export const upsertTeamValidator = vine.compile(
  vine.object({
    nom: vine.string().trim(),
    codeFederal: vine.string().trim(),
    logo: vine.string().optional(),
  })
)

export type UpsertTeamValidatorOutput = InferInput<typeof upsertTeamValidator>
