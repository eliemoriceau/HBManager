import { Entity } from '#shared/domaine/entity'
import { Identifier } from '#shared/domaine/identifier'
import { OfficielType } from '#officiel/domain/value_object/officiel_type'
import {
  AssignmentStatus,
  AssignmentStatusEnum,
} from '#officiel/domain/value_object/assignment_status'
import { AssignmentSource } from '#officiel/domain/value_object/assignment_source'
import { DateTime } from 'luxon'

interface AssignmentProperties {
  id: Identifier
  matchId: Identifier
  officielId: Identifier
  type: OfficielType
  status: AssignmentStatus
  source: AssignmentSource
  dateAssignment: DateTime
  notes?: string
  assignedBy: string
}

export class Assignment extends Entity<AssignmentProperties> {
  private constructor(props: AssignmentProperties) {
    super(props)
  }

  static create({
    id,
    matchId,
    officielId,
    type,
    assignedBy,
    notes,
  }: {
    id?: string
    matchId: string
    officielId: string
    type: OfficielType
    assignedBy: string
    notes?: string
  }): Assignment {
    return new Assignment({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      matchId: Identifier.fromString(matchId),
      officielId: Identifier.fromString(officielId),
      type,
      status: AssignmentStatus.pending(),
      source: AssignmentSource.systemAuto(),
      dateAssignment: DateTime.now(),
      notes,
      assignedBy,
    })
  }

  static createArbitreFromFederation({
    id,
    matchId,
    arbitreId,
    type,
    assignedBy,
    notes,
  }: {
    id?: string
    matchId: string
    arbitreId: string
    type: OfficielType
    assignedBy: string
    notes?: string
  }): Assignment {
    if (!type.isArbitre()) {
      throw new Error('Type doit être un arbitre')
    }

    return new Assignment({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      matchId: Identifier.fromString(matchId),
      officielId: Identifier.fromString(arbitreId),
      type,
      status: AssignmentStatus.confirmed(), // Auto-confirmé pour fédération
      source: AssignmentSource.federation(),
      dateAssignment: DateTime.now(),
      notes: notes || 'Arbitre désigné par la fédération',
      assignedBy,
    })
  }

  static createArbitreFromClub({
    id,
    matchId,
    arbitreId,
    type,
    assignedBy,
    notes,
  }: {
    id?: string
    matchId: string
    arbitreId: string
    type: OfficielType
    assignedBy: string
    notes?: string
  }): Assignment {
    if (!type.isArbitre()) {
      throw new Error('Type doit être un arbitre')
    }

    return new Assignment({
      id: id ? Identifier.fromString(id) : Identifier.generate(),
      matchId: Identifier.fromString(matchId),
      officielId: Identifier.fromString(arbitreId),
      type,
      status: AssignmentStatus.pending(), // En attente de confirmation
      source: AssignmentSource.clubManual(),
      dateAssignment: DateTime.now(),
      notes: notes || 'Arbitre fourni par le club hôte',
      assignedBy,
    })
  }

  get matchId(): Identifier {
    return this.props.matchId
  }

  get officielId(): Identifier {
    return this.props.officielId
  }

  get type(): OfficielType {
    return this.props.type
  }

  get status(): AssignmentStatus {
    return this.props.status
  }

  get source(): AssignmentSource {
    return this.props.source
  }

  get dateAssignment(): DateTime {
    return this.props.dateAssignment
  }

  get notes(): string | undefined {
    return this.props.notes
  }

  confirm(): void {
    if (!this.props.status.canTransitionTo(AssignmentStatusEnum.CONFIRMED)) {
      throw new Error('Impossible de confirmer cette assignation')
    }
    this.props.status = AssignmentStatus.confirmed()
  }

  decline(): void {
    if (!this.props.status.canTransitionTo(AssignmentStatusEnum.DECLINED)) {
      throw new Error('Impossible de décliner cette assignation')
    }
    this.props.status = AssignmentStatus.create(AssignmentStatusEnum.DECLINED)
  }

  cancel(): void {
    if (!this.props.status.canTransitionTo(AssignmentStatusEnum.CANCELLED)) {
      throw new Error("Impossible d'annuler cette assignation")
    }
    this.props.status = AssignmentStatus.create(AssignmentStatusEnum.CANCELLED)
  }

  addNote(note: string): void {
    this.props.notes = note
  }

  isActive(): boolean {
    return this.props.status.isConfirmed()
  }

  isFromFederation(): boolean {
    return this.props.source.isFederation()
  }

  isFromClub(): boolean {
    return this.props.source.isClubManual()
  }

  requiresStrictValidation(): boolean {
    return this.props.source.requiresStrictValidation()
  }
}
