import { test } from '@japa/runner'
import { ImportReportBuilder } from '#importer/service/import_report_builder'

test.group('ImportReportBuilder', () => {
  test('crée un rapport d’import', ({ assert }) => {
    const report = ImportReportBuilder.create(5)
    assert.equal(report.totalLines, 5)
    assert.equal(report.importedCount, 0)
    assert.equal(report.addedCount, 0)
    assert.equal(report.updatedCount, 0)
    assert.deepEqual(report.ignored, [])
  })

  test('ajoute un import (ajout ou update)', ({ assert }) => {
    const report = ImportReportBuilder.create(2)
    ImportReportBuilder.addImported(report, false)
    ImportReportBuilder.addImported(report, true)
    assert.equal(report.importedCount, 2)
    assert.equal(report.addedCount, 1)
    assert.equal(report.updatedCount, 1)
  })

  test('ajoute une ligne ignorée', ({ assert }) => {
    const report = ImportReportBuilder.create(1)
    ImportReportBuilder.addIgnored(report, 3, { foo: 'bar' }, 'erreur')
    assert.lengthOf(report.ignored, 1)
    assert.equal(report.ignored[0].lineNumber, 3)
    assert.equal(report.ignored[0].reason, 'erreur')
  })
})
