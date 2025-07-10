import { OfficielRepository } from '#officiel/domain/repository/officiel_repository'
import { Officiel } from '#officiel/domain/entity/officiel'
import { OfficielTypeEnum } from '#officiel/domain/value_object/officiel_type'
import OfficielModel from '#models/officiel'

export class LucidOfficielRepository extends OfficielRepository {
  async findById(id: string): Promise<Officiel | null> {
    const model = await OfficielModel.find(id)
    return model ? this.toDomain(model) : null
  }

  async findByEmail(email: string): Promise<Officiel | null> {
    const model = await OfficielModel.query().where('email', email).first()
    return model ? this.toDomain(model) : null
  }

  async findByQualification(qualification: OfficielTypeEnum): Promise<Officiel[]> {
    const models = await OfficielModel.query().whereRaw(
      "JSON_EXTRACT(qualifications, '$') LIKE ?",
      [`%"${qualification}"%`]
    )
    return models.map((model) => this.toDomain(model))
  }

  async findAvailableOn(date: string): Promise<Officiel[]> {
    const models = await OfficielModel.query().where((builder) => {
      // Trouve les officiels qui ont explicitement cette date disponible
      // ou qui n'ont pas de restrictions pour cette date (pas de fausse valeur pour cette date)
      builder
        .whereRaw('JSON_EXTRACT(disponibilites, \'$."' + date + '"\') = ?', [true])
        .orWhereRaw('JSON_EXTRACT(disponibilites, \'$."' + date + '"\') IS NULL')
    })
    return models.map((model) => this.toDomain(model))
  }

  async findByClub(clubId: string): Promise<Officiel[]> {
    const models = await OfficielModel.query().where('club_id', clubId)
    return models.map((model) => this.toDomain(model))
  }

  async findAvailableWithQualification(
    qualification: OfficielTypeEnum,
    date: string
  ): Promise<Officiel[]> {
    const models = await OfficielModel.query()
      .whereRaw("JSON_EXTRACT(qualifications, '$') LIKE ?", [`%"${qualification}"%`])
      .where((builder) => {
        builder
          .whereRaw('JSON_EXTRACT(disponibilites, \'$."' + date + '"\') = ?', [true])
          .orWhereRaw('JSON_EXTRACT(disponibilites, \'$."' + date + '"\') IS NULL')
      })
    return models.map((model) => this.toDomain(model))
  }

  async save(officiel: Officiel): Promise<void> {
    const data = this.toModel(officiel)
    await OfficielModel.updateOrCreate({ id: officiel.id.toString() }, data)
  }

  async delete(id: string): Promise<void> {
    await OfficielModel.query().where('id', id).delete()
  }

  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    data: Officiel[]
    total: number
    page: number
    limit: number
  }> {
    const query = OfficielModel.query()
    const models = await query.paginate(page, limit)

    return {
      data: models.all().map((model) => this.toDomain(model)),
      total: models.total,
      page: models.currentPage,
      limit: models.perPage,
    }
  }

  private toDomain(model: OfficielModel): Officiel {
    const officiel = Officiel.create({
      id: model.id,
      nom: model.nom,
      prenom: model.prenom,
      email: model.email,
      telephone: model.telephone || undefined,
      clubId: model.clubId || undefined,
      qualifications: model.qualifications as OfficielTypeEnum[],
    })

    // Restaurer les disponibilités
    if (model.disponibilites && typeof model.disponibilites === 'object') {
      for (const [date, available] of Object.entries(model.disponibilites)) {
        officiel.setDisponibilite(date, available as boolean)
      }
    }

    return officiel
  }

  private toModel(officiel: Officiel): Partial<OfficielModel> {
    // Convertir Map en objet pour la base de données
    const disponibilites: Record<string, boolean> = {}
    for (const [date, available] of officiel.disponibilites.entries()) {
      disponibilites[date] = available
    }

    return {
      id: officiel.id.toString(),
      nom: officiel.nom,
      prenom: officiel.prenom,
      email: officiel.email,
      telephone: officiel.telephone,
      clubId: officiel.clubId,
      qualifications: officiel.qualifications.map((q) => q.value),
      disponibilites,
    }
  }
}
