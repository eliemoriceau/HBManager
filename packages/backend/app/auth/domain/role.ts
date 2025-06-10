import { InvalidArgumentException } from '#exceptions/invalidArgumentException'

export enum Role {
  SECRETAIRE = 'SECRETAIRE',
  ENTRAINEUR = 'ENTRAINEUR',
  ARBITRE = 'ARBITRE',
  COMMUNICATION = 'COMMUNICATION',
  ADMIN = 'ADMIN',
}

export const allRoles = new Set(Object.values(Role))

export const setRoles = (roles: string[]): Role[] => {
  const rolesSet = new Set(roles.map((role) => role as Role))
  if (rolesSet.size !== roles.length) {
    throw new InvalidArgumentException('Les rôles ne doivent pas contenir de doublons')
  }
  for (const r of rolesSet) {
    if (!allRoles.has(r)) {
      throw new InvalidArgumentException(`Rôle inconnu : ${r}`)
    }
  }
  return Array.from(rolesSet)
}
