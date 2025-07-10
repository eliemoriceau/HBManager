import { ValueObject } from '#shared/domaine/value_object'

export enum AssignmentStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
}

export class AssignmentStatus extends ValueObject<{ status: AssignmentStatusEnum }> {
  private constructor(props: { status: AssignmentStatusEnum }) {
    super(props)
  }

  static create(status: AssignmentStatusEnum): AssignmentStatus {
    return new AssignmentStatus({ status })
  }

  static pending(): AssignmentStatus {
    return new AssignmentStatus({ status: AssignmentStatusEnum.PENDING })
  }

  static confirmed(): AssignmentStatus {
    return new AssignmentStatus({ status: AssignmentStatusEnum.CONFIRMED })
  }

  get value(): AssignmentStatusEnum {
    return this.props.status
  }

  isPending(): boolean {
    return this.props.status === AssignmentStatusEnum.PENDING
  }

  isConfirmed(): boolean {
    return this.props.status === AssignmentStatusEnum.CONFIRMED
  }

  canTransitionTo(newStatus: AssignmentStatusEnum): boolean {
    const transitions = {
      [AssignmentStatusEnum.PENDING]: [
        AssignmentStatusEnum.CONFIRMED,
        AssignmentStatusEnum.DECLINED,
      ],
      [AssignmentStatusEnum.CONFIRMED]: [AssignmentStatusEnum.CANCELLED],
      [AssignmentStatusEnum.DECLINED]: [AssignmentStatusEnum.PENDING],
      [AssignmentStatusEnum.CANCELLED]: [],
    }

    return transitions[this.props.status].includes(newStatus)
  }

  toString(): string {
    return this.props.status
  }
}
