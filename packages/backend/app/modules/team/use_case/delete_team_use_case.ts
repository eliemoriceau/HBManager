export abstract class DeleteTeamUseCase {
  abstract execute(id: string): Promise<void>
}
