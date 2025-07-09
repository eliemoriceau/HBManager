import { test } from '@japa/runner'
import { CsvParser } from '#importer/service/csv_parser'

test.group('CsvParser', () => {
  test('parse un CSV simple', ({ assert }) => {
    const content = 'code renc;le;horaire\n1;2025-01-01;12:00\n2;2025-01-02;13:00'
    const result = CsvParser.parse(content)
    assert.lengthOf(result, 2)
    assert.equal(result[0]['code renc'], '1')
    assert.equal(result[1]['horaire'], '13:00')
  })

  test('ignore les lignes vides', ({ assert }) => {
    const content = 'code renc;le;horaire\n1;2025-01-01;12:00\n\n2;2025-01-02;13:00'
    const result = CsvParser.parse(content)
    assert.lengthOf(result, 2)
  })
})
