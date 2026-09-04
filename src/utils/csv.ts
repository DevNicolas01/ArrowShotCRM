/** Minimal RFC-4180-ish CSV parser: handles quoted fields (with embedded
 *  commas, newlines and escaped "" quotes) and both \n and \r\n line endings.
 *  Good enough for hand-edited/spreadsheet-exported CSVs — not a full CSV
 *  spec implementation (no custom delimiters, no BOM stripping beyond the
 *  one char). */
export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text // strip BOM if present
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const len = src.length

  while (i < len) {
    const char = src[i]

    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }

    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop fully blank trailing/stray lines (e.g. a trailing newline at EOF).
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

/** Builds CSV text from rows (quoting fields that need it) and triggers a
 *  browser download with the given filename. */
export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((field) => {
          const needsQuotes = /[",\n\r]/.test(field)
          const escaped = field.replace(/"/g, '""')
          return needsQuotes ? `"${escaped}"` : escaped
        })
        .join(',')
    )
    .join('\r\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
