import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { Assignment } from '#officiel/domain/entity/assignment'
import { OfficielType, OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import { DateTime } from 'luxon'

interface OfficielAssignmentProperties {
  id: Identifier
  matchId: Identifier
  assignments: Assignment[]
  createdAt: DateTime
  updatedAt: DateTime
}

export class OfficielAssignment extends Entity<OfficielAssignmentProperties> {
  private constructor(props: OfficielAssignmentProperties) {
    super(props)
  }

  static create({ id, matchId }: { id?: string; matchId: string }): OfficielAssignment {
    return new OfficielAssignment({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      matchId: Identifier.fromString(matchId),
      assignments: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    })
  }

  get matchId(): Identifier {
    return this.props.matchId
  }

  get assignments(): Assignment[] {
    return [...this.props.assignments]
  }

  addAssignment(assignment: Assignment): void {
    // Vérifier qu'il n'y a pas déjà une assignation pour ce type
    const existingAssignment = this.props.assignments.find(
      (a) => a.type.equals(assignment.type) && a.isActive()
    )

    if (existingAssignment) {
      throw new Error(`Une assignation existe déjà pour le type ${assignment.type.toString()}`)
    }

    this.props.assignments.push(assignment)
    this.props.updatedAt = DateTime.now()
  }

  removeAssignment(assignmentId: string): void {
    const index = this.props.assignments.findIndex((a) => a.id.toString() === assignmentId)
    if (index === -1) {
      throw new Error('Assignation non trouvée')
    }

    this.props.assignments.splice(index, 1)
    this.props.updatedAt = DateTime.now()
  }

  getAssignmentsByType(type: OfficielType): Assignment[] {
    return this.props.assignments.filter((a) => a.type.equals(type))
  }

  getActiveAssignments(): Assignment[] {
    return this.props.assignments.filter((a) => a.isActive())
  }

  getRequiredAssignments(): Assignment[] {
    return this.props.assignments.filter((a) => a.type.isRequired())
  }

  getMissingRequiredTypes(): OfficielType[] {
    const requiredTypes = [
      OfficielType.create(OfficielTypeEnum.SECRETAIRE),
      OfficielType.create(OfficielTypeEnum.CHRONOMETREUR),
      OfficielType.create(OfficielTypeEnum.RESPONSABLE_SALLE),
      OfficielType.create(OfficielTypeEnum.ARBITRE_PRINCIPAL),
    ]

    const assignedTypes = this.getActiveAssignments().map((a) => a.type)

    return requiredTypes.filter(
      (required) => !assignedTypes.some((assigned) => assigned.equals(required))
    )
  }

  isComplete(): boolean {
    return this.getMissingRequiredTypes().length === 0
  }

  canStartMatch(): boolean {
    return this.isComplete() && this.getActiveAssignments().length > 0
  }
}
