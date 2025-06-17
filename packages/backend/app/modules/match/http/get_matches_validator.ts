import vine from '@vinejs/vine'

export const getMatchesValidator = vine.compile(
  vine.object({
    startDate: vine.date().optional(),
    endDate: vine.date().optional(),
    equipeId: vine.string().uuid().optional(),
    officielId: vine.string().uuid().optional(),
  })
)

export type GetMatchesValidatorOutput = Awaited<ReturnType<typeof getMatchesValidator>>
