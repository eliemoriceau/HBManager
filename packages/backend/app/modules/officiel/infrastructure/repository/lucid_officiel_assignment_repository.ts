import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'
import { OfficielAssignment } from '#officiel/domain/entity/officiel_assignment'
import OfficielAssignmentModel from '#models/officiel_assignment'
import { LucidAssignmentRepository } from './lucid_assignment_repository.js'

export class LucidOfficielAssignmentRepository extends OfficielAssignmentRepository {
  private assignmentRepository: LucidAssignmentRepository

  constructor() {
    super()
    this.assignmentRepository = new LucidAssignmentRepository()
  }

  async findById(id: string): Promise<OfficielAssignment | null> {
    const model = await OfficielAssignmentModel.find(id)
    return model ? await this.toDomain(model) : null
  }

  async findByMatch(matchId: string): Promise<OfficielAssignment | null> {
    const model = await OfficielAssignmentModel.query().where('match_id', matchId).first()
    return model ? await this.toDomain(model) : null
  }

  async findIncomplete(): Promise<OfficielAssignment[]> {
    const models = await OfficielAssignmentModel.all()
    const domains = await Promise.all(models.map((model) => this.toDomain(model)))
    return domains.filter((domain) => !domain.isComplete())
  }

  async findComplete(): Promise<OfficielAssignment[]> {
    const models = await OfficielAssignmentModel.all()
    const domains = await Promise.all(models.map((model) => this.toDomain(model)))
    return domains.filter((domain) => domain.isComplete())
  }

  async findReadyForMatch(): Promise<OfficielAssignment[]> {
    const models = await OfficielAssignmentModel.all()
    const domains = await Promise.all(models.map((model) => this.toDomain(model)))
    return domains.filter((domain) => domain.canStartMatch())
  }

  async findByPeriod(startDate: string, endDate: string): Promise<OfficielAssignment[]> {
    const models = await OfficielAssignmentModel.query().whereBetween('created_at', [
      startDate,
      endDate,
    ])
    return Promise.all(models.map((model) => this.toDomain(model)))
  }

  async existsForMatch(matchId: string): Promise<boolean> {
    const count = await OfficielAssignmentModel.query()
      .where('match_id', matchId)
      .count('* as total')
    return count[0].$extras.total > 0
  }

  async save(officielAssignment: OfficielAssignment): Promise<void> {
    const data = await this.toModel(officielAssignment)
    await OfficielAssignmentModel.updateOrCreate({ id: officielAssignment.id.toString() }, data)

    // Sauvegarder aussi toutes les assignations individuelles
    for (const assignment of officielAssignment.assignments) {
      await this.assignmentRepository.save(assignment)
    }
  }

  async delete(id: string): Promise<void> {
    const model = await OfficielAssignmentModel.find(id)
    if (model) {
      // Supprimer d'abord toutes les assignations individuelles
      const assignmentIds = model.assignments.map((a: any) => a.id)
      for (const assignmentId of assignmentIds) {
        await this.assignmentRepository.delete(assignmentId)
      }

      // Puis supprimer l'agrégat
      await model.delete()
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: OfficielAssignment[]
    total: number
    page: number
    limit: number
  }> {
    const query = OfficielAssignmentModel.query()
    const models = await query.paginate(page, limit)

    const data = await Promise.all(models.all().map((model) => this.toDomain(model)))

    return {
      data,
      total: models.total,
      page: models.currentPage,
      limit: models.perPage,
    }
  }

  private async toDomain(model: OfficielAssignmentModel): Promise<OfficielAssignment> {
    const officielAssignment = OfficielAssignment.create({
      id: model.id,
      matchId: model.matchId,
    })

    // Reconstituer les assignations à partir de la base de données
    const assignments = await this.assignmentRepository.findByMatch(model.matchId)
    for (const assignment of assignments) {
      officielAssignment.addAssignment(assignment)
    }

    return officielAssignment
  }

  private async toModel(
    officielAssignment: OfficielAssignment
  ): Promise<Partial<OfficielAssignmentModel>> {
    return {
      id: officielAssignment.id.toString(),
      matchId: officielAssignment.matchId.toString(),
      assignments: officielAssignment.assignments.map((assignment) => ({
        id: assignment.id.toString(),
        officielId: assignment.officielId.toString(),
        type: assignment.type.value,
        status: assignment.status.value,
        source: assignment.source.value,
      })),
    }
  }
}
