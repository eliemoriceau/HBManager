import { parse } from 'csv-parse/sync'

export class CsvParser {
  static parse(content: string): Record<string, string>[] {
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      cast: (value) => value,
    })
  }
}
