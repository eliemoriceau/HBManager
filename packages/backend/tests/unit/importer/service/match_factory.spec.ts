import { test } from '@japa/runner'
import { MatchFactory } from '#importer/service/match_factory'

test.group('MatchFactory', () => {
  test('crée un Match valide à partir d’une ligne CSV', ({ assert }) => {
    const line = {
      'code renc': '1',
      'le': '2025-01-01',
      'horaire': '12:00',
      'club rec': 'A',
      'club vis': 'B',
      'arb1 designe': 'X',
      'arb2 designe': 'Y',
    }
    const match = MatchFactory.fromCsvLine(line)
    assert.equal(match.codeRenc, '1')
    assert.equal(match.heure, '12:00')
    assert.equal(match.equipeDomicile.nom.toString(), 'A')
    assert.equal(match.equipeExterieur.nom.toString(), 'B')
    assert.deepEqual(match.officiels, ['X', 'Y'])
  })

  test('échoue si la date est invalide', ({ assert }) => {
    const line = {
      'code renc': '1',
      'le': 'not-a-date',
      'horaire': '12:00',
      'club rec': 'A',
      'club vis': 'B',
    }
    assert.throws(() => MatchFactory.fromCsvLine(line), /Format de date invalide/)
  })

  test('échoue si l’heure est invalide', ({ assert }) => {
    const line = {
      'code renc': '1',
      'le': '2025-01-01',
      'horaire': 'bad',
      'club rec': 'A',
      'club vis': 'B',
    }
    assert.throws(() => MatchFactory.fromCsvLine(line), /Heure invalide/)
  })
})
