import { test } from '@japa/runner'

const sampleCsv = `semaine;num poule;competition;poule;J;le;horaire;club rec;club vis;club hote;arb1 designe;arb2 designe;observateur;delegue;code renc;nom salle;adresse salle;CP;Ville;colle;Coul. Rec;Coul. Gard. Rec;Coul. Vis;Coul. Gard. Vis;Ent. Rec;Tel Ent. Rec;Corresp. Rec;Tel Corresp. Rec;Ent. Vis;Tel Ent. Vis;Corresp. Vis;Tel Corresp. Vis;Num rec;Num vis\n2024-14;M624465072;u12m-44;U12M D8;7;07/04/2024;09/04/2024 14:30:00;HBC PORNIC;CHABOSSIERE OLYMPIQUE CLUB HB 2;HBC PORNIC;;;;;TAFEQMK;VAL SAINT MARTIN (SALLE 2); rue val saint martin;44210;PORNIC;Toutes colles interdites;Bleu;;Rouge-Noir;Jaune-Bleu;CHAUVET FRANCOISE;330668831514;CHAUVET FRANCOISE;330668831514;GUMIERO ELYO;330648677907;PASCAL MATHIEU;330616545866;6244036;6244011`

test.group('UploadCsvController', () => {
  test('uploads CSV file', async ({ client }) => {
    const response = await client
      .post('/api/import/csv')
      .file('file', Buffer.from(sampleCsv), {
        filename: 'matches.csv',
        contentType: 'text/csv',
      })
      .send()
    response.assertStatus(201)
  })
})
