import { CreateOfficielUseCase } from '#officiel/application/use_case/create_officiel_use_case'
import { AssignOfficielToMatchUseCase } from '#officiel/application/use_case/assign_officiel_to_match_use_case'
import { AssignArbitreFromFederationUseCase } from '#officiel/application/use_case/assign_arbitre_from_federation_use_case'
import { AssignArbitreFromClubUseCase } from '#officiel/application/use_case/assign_arbitre_from_club_use_case'
import { ConfirmAssignmentUseCase } from '#officiel/application/use_case/confirm_assignment_use_case'
import { GetMatchAssignmentsUseCase } from '#officiel/application/use_case/get_match_assignments_use_case'
import { FindAvailableOfficielsUseCase } from '#officiel/application/use_case/find_available_officiels_use_case'

import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { AssignmentRepository } from '#officiel/domain/repository/assignment_repository'
import { OfficielAssignmentRepository } from '#officiel/domain/repository/officiel_assignment_repository'

import { LucidOfficielRepository } from '#officiel/infrastructure/repository/lucid_officiel_repository'
import { LucidAssignmentRepository } from '#officiel/infrastructure/repository/lucid_assignment_repository'
import { LucidOfficielAssignmentRepository } from '#officiel/infrastructure/repository/lucid_officiel_assignment_repository'

import { AssignmentValidationService } from '#officiel/service/assignment_validation_service'

export const officielProviderMap = [
  // Repositories
  [OfficielRepository, LucidOfficielRepository],
  [AssignmentRepository, LucidAssignmentRepository],
  [OfficielAssignmentRepository, LucidOfficielAssignmentRepository],

  // Services
  [AssignmentValidationService, AssignmentValidationService],

  // Use Cases
  [CreateOfficielUseCase, CreateOfficielUseCase],
  [AssignOfficielToMatchUseCase, AssignOfficielToMatchUseCase],
  [AssignArbitreFromFederationUseCase, AssignArbitreFromFederationUseCase],
  [AssignArbitreFromClubUseCase, AssignArbitreFromClubUseCase],
  [ConfirmAssignmentUseCase, ConfirmAssignmentUseCase],
  [GetMatchAssignmentsUseCase, GetMatchAssignmentsUseCase],
  [FindAvailableOfficielsUseCase, FindAvailableOfficielsUseCase],
]
