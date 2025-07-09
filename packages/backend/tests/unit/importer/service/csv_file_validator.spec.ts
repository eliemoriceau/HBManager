import { test } from '@japa/runner'
import { CsvFileValidator } from '#importer/service/csv_file_validator'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'

const requiredHeaders = ['code renc', 'le', 'horaire', 'club rec', 'club vis', 'nom salle']
const validContent = 'code renc;le;horaire;club rec;club vis;nom salle\n1;2025-01-01;12:00;A;B;Gym'

test.group('CsvFileValidator', () => {
  test('échoue si le fichier est manquant', async ({ assert }) => {
    await assert.rejects(
      () => CsvFileValidator.validate(undefined as any, requiredHeaders),
      /Fichier manquant/
    )
  })

  test('échoue si le format est incorrect', async ({ assert }) => {
    const file = { isMultipartFile: true, extname: 'txt', size: 10, tmpPath: '/tmp/f.csv' } as any
    await assert.rejects(
      () => CsvFileValidator.validate(file, requiredHeaders),
      /Format de fichier invalide/
    )
  })

  test('échoue si le fichier est trop volumineux', async ({ assert }) => {
    const file = {
      isMultipartFile: true,
      extname: 'csv',
      size: 6 * 1024 * 1024,
      tmpPath: '/tmp/f.csv',
    } as any
    await assert.rejects(
      () => CsvFileValidator.validate(file, requiredHeaders),
      /Fichier trop volumineux/
    )
  })

  test('échoue si le fichier a un encodage invalide', async ({ assert }) => {
    const tmpPath = join(os.tmpdir(), 'invalid_utf8.csv')
    const buffer = Buffer.from([0xff, 0xfe, 0xfd])
    await fs.writeFile(tmpPath, buffer)
    const file = { isMultipartFile: true, extname: 'csv', size: buffer.length, tmpPath } as any
    await assert.rejects(
      () => CsvFileValidator.validate(file, requiredHeaders),
      /Encodage invalide/
    )
    await fs.unlink(tmpPath)
  })

  test('échoue si les entêtes sont manquants', async ({ assert }) => {
    const tmpPath = join(os.tmpdir(), 'missing_headers.csv')
    const content = 'foo;bar\n1;2'
    await fs.writeFile(tmpPath, content)
    const file = { isMultipartFile: true, extname: 'csv', size: content.length, tmpPath } as any
    await assert.rejects(
      () => CsvFileValidator.validate(file, requiredHeaders),
      /Entêtes manquants/
    )
    await fs.unlink(tmpPath)
  })

  test('valide un fichier correct', async ({ assert }) => {
    const tmpPath = join(os.tmpdir(), 'valid.csv')
    await fs.writeFile(tmpPath, validContent)
    const file = {
      isMultipartFile: true,
      extname: 'csv',
      size: validContent.length,
      tmpPath,
    } as any
    await CsvFileValidator.validate(file, requiredHeaders)
    await fs.unlink(tmpPath)
    assert.isTrue(true)
  })
})
