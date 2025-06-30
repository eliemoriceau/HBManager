import { MatchDetailsDto } from '#match/application/dto/match_details_dto'

export abstract class GetMatchUseCase {
  abstract execute(id: string): Promise<MatchDetailsDto>
}
