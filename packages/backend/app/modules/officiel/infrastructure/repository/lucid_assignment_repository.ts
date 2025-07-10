import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { Assignment } from '#officiel/domain/entity/assignment'
import { AssignmentStatusEnum } from '#officiel/domain/value_object/assignment_status'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import AssignmentModel from '#models/assignment'

export class LucidAssignmentRepository extends AssignmentRepository {
  async findById(id: string): Promise<Assignment | null> {
    const model = await AssignmentModel.find(id)
    return model ? this.toDomain(model) : null
  }

  async findByMatch(matchId: string): Promise<Assignment[]> {
    const models = await AssignmentModel.query().where('match_id', matchId)
    return models.map((model) => this.toDomain(model))
  }

  async findByOfficiel(officielId: string): Promise<Assignment[]> {
    const models = await AssignmentModel.query().where('officiel_id', officielId)
    return models.map((model) => this.toDomain(model))
  }

  async findActiveByOfficiel(officielId: string): Promise<Assignment[]> {
    const models = await AssignmentModel.query()
      .where('officiel_id', officielId)
      .where('status', AssignmentStatusEnum.CONFIRMED)
    return models.map((model) => this.toDomain(model))
  }

  async findByOfficielInPeriod(
    officielId: string,
    startDate: string,
    endDate: string
  ): Promise<Assignment[]> {
    const models = await AssignmentModel.query()
      .where('officiel_id', officielId)
      .whereBetween('date_assignment', [startDate, endDate])
    return models.map((model) => this.toDomain(model))
  }

  async findByMatchAndStatus(matchId: string, status: AssignmentStatusEnum): Promise<Assignment[]> {
    const models = await AssignmentModel.query().where('match_id', matchId).where('status', status)
    return models.map((model) => this.toDomain(model))
  }

  async findByType(type: OfficielTypeEnum): Promise<Assignment[]> {
    const models = await AssignmentModel.query().where('type', type)
    return models.map((model) => this.toDomain(model))
  }

  async findPending(): Promise<Assignment[]> {
    const models = await AssignmentModel.query().where('status', AssignmentStatusEnum.PENDING)
    return models.map((model) => this.toDomain(model))
  }

  async findPendingByOfficiel(officielId: string): Promise<Assignment[]> {
    const models = await AssignmentModel.query()
      .where('officiel_id', officielId)
      .where('status', AssignmentStatusEnum.PENDING)
    return models.map((model) => this.toDomain(model))
  }

  async existsActiveAssignmentForOfficielOnMatch(
    officielId: string,
    matchId: string
  ): Promise<boolean> {
    const count = await AssignmentModel.query()
      .where('officiel_id', officielId)
      .where('match_id', matchId)
      .where('status', AssignmentStatusEnum.CONFIRMED)
      .count('* as total')
    return count[0].$extras.total > 0
  }

  async save(assignment: Assignment): Promise<void> {
    const data = this.toModel(assignment)
    await AssignmentModel.updateOrCreate({ id: assignment.id.toString() }, data)
  }

  async delete(id: string): Promise<void> {
    await AssignmentModel.query().where('id', id).delete()
  }

  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Assignment[]
    total: number
    page: number
    limit: number
  }> {
    const query = AssignmentModel.query()
    const models = await query.paginate(page, limit)

    return {
      data: models.all().map((model) => this.toDomain(model)),
      total: models.total,
      page: models.currentPage,
      limit: models.perPage,
    }
  }

  private toDomain(model: AssignmentModel): Assignment {
    // Nous devons reconstituer l'Assignment en fonction de son source
    if (model.source === 'FEDERATION') {
      return Assignment.createArbitreFromFederation({
        id: model.id,
        matchId: model.matchId,
        arbitreId: model.officielId,
        type: { value: model.type } as any, // Type sera reconstitué par le factory
        assignedBy: model.assignedBy,
        notes: model.notes || undefined,
      })
    } else if (model.source === 'CLUB_MANUAL') {
      return Assignment.createArbitreFromClub({
        id: model.id,
        matchId: model.matchId,
        arbitreId: model.officielId,
        type: { value: model.type } as any,
        assignedBy: model.assignedBy,
        notes: model.notes || undefined,
      })
    } else {
      return Assignment.create({
        id: model.id,
        matchId: model.matchId,
        officielId: model.officielId,
        type: { value: model.type } as any,
        assignedBy: model.assignedBy,
        notes: model.notes || undefined,
      })
    }
  }

  private toModel(assignment: Assignment): Partial<AssignmentModel> {
    return {
      id: assignment.id.toString(),
      matchId: assignment.matchId.toString(),
      officielId: assignment.officielId.toString(),
      type: assignment.type.value,
      status: assignment.status.value,
      source: assignment.source.value,
      dateAssignment: assignment.dateAssignment,
      notes: assignment.notes,
      assignedBy: assignment['props']?.assignedBy || '',
    }
  }
}
