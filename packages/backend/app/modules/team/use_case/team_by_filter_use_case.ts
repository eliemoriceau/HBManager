export interface TeamExisteFilter {
  id?: string
  nom?: string
  codeFederal?: string
}

export interface TeamExisteResult {
  id: string
  nom: string
  codeFederal?: string
  logo?: string
}

export default abstract class TeamExisteUseCase {
  abstract execute(filter: TeamExisteFilter): Promise<TeamExisteResult[]>
}
