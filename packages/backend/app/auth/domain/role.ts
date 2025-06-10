import { InvalidArgumentException } from '#exceptions/invalid_argument_exception'

export enum Role {
  SECRETAIRE = 'SECRETAIRE',
  ENTRAINEUR = 'ENTRAINEUR',
  ARBITRE = 'ARBITRE',
  COMMUNICATION = 'COMMUNICATION',
  ADMIN = 'ADMIN',
}

export const allRoles = new Set(Object.values(Role))

export const setRoles = (roles: Role[]): Role[] => {
  const rolesSet = new Set(roles)
  for (const r of rolesSet) {
    if (!allRoles.has(r)) {
      throw new InvalidArgumentException(`Rôle inconnu : ${r}`)
    }
  }
  return Array.from(rolesSet)
}
