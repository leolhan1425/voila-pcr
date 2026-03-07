/**
 * GraphPad Prism .pzfx export for VoilaPCR.
 *
 * Generates a valid .pzfx (XML) file that Prism can open directly.
 * Creates two tables:
 *   Table0 — Group summary (means per group x target)
 *   Table1 — Individual replicates (all fold-change values)
 */

/**
 * Escape special XML characters in a string.
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Format a numeric value for Prism. Returns empty string for null/undefined/NaN.
 * @param {number|null|undefined} val
 * @param {number} decimals
 * @returns {string}
 */
function formatNum(val, decimals = 6) {
  if (val == null || Number.isNaN(val)) return ''
  return Number(val).toFixed(decimals)
}

/**
 * Extract the unique ordered list of groups from the results summary object.
 * Control group is placed first if present.
 *
 * @param {object} summary  — { [target]: { [group]: stats } }
 * @param {string} controlGroup
 * @returns {string[]}
 */
function extractGroups(summary, controlGroup) {
  const groupSet = new Set()
  for (const groups of Object.values(summary)) {
    for (const g of Object.keys(groups)) {
      groupSet.add(g)
    }
  }
  const groups = Array.from(groupSet)
  // Sort so control comes first
  groups.sort((a, b) => {
    if (a === controlGroup) return -1
    if (b === controlGroup) return 1
    return a.localeCompare(b)
  })
  return groups
}

/**
 * Extract unique target names in stable order from the summary.
 * @param {object} summary
 * @returns {string[]}
 */
function extractTargets(summary) {
  return Object.keys(summary)
}

/**
 * Build the summary table XML (Table0).
 * Rows = groups, Columns = target genes, Values = mean fold change.
 *
 * @param {object} summary
 * @param {string[]} groups
 * @param {string[]} targets
 * @returns {string}
 */
function buildSummaryTable(summary, groups, targets) {
  const lines = []

  lines.push(
    '  <Table ID="Table0" XFormat="none" YFormat="replicates" Replicates="1" TableType="TwoWay" EVFormat="AsteriskAfterNumber">'
  )
  lines.push('    <Title>Summary (Mean Fold Change)</Title>')

  // Row titles = group names
  lines.push('    <RowTitlesColumn Width="120">')
  lines.push('      <Subcolumn>')
  for (const group of groups) {
    lines.push(`        <d>${escapeXml(group)}</d>`)
  }
  lines.push('      </Subcolumn>')
  lines.push('    </RowTitlesColumn>')

  // One YColumn per target
  for (const target of targets) {
    lines.push(`    <YColumn Width="100" Decimals="4" Subcolumns="1">`)
    lines.push(`      <Title>${escapeXml(target)}</Title>`)
    lines.push('      <Subcolumn>')
    for (const group of groups) {
      const stats = summary[target]?.[group]
      if (stats && stats.mean != null) {
        lines.push(`        <d>${formatNum(stats.mean, 4)}</d>`)
      } else {
        lines.push('        <d></d>')
      }
    }
    lines.push('      </Subcolumn>')
    lines.push('    </YColumn>')
  }

  lines.push('  </Table>')
  return lines.join('\n')
}

/**
 * Build the individual-replicates table XML (Table1).
 * Rows = individual samples (one per replicate), Columns = target genes,
 * Values = individual fold-change values.
 *
 * To support grouped data in Prism, each target column uses multiple
 * subcolumns (one per group). This enables Prism to create grouped bar
 * charts or scatter plots directly.
 *
 * @param {object[]} rows      — results.rows
 * @param {object} summary     — results.summary
 * @param {string[]} groups
 * @param {string[]} targets
 * @returns {string}
 */
function buildReplicatesTable(rows, summary, groups, targets) {
  const lines = []

  // Determine max replicates across all group-target combinations
  let maxN = 1
  for (const target of targets) {
    for (const group of groups) {
      const stats = summary[target]?.[group]
      if (stats && stats.n > maxN) maxN = stats.n
    }
  }

  lines.push(
    `  <Table ID="Table1" XFormat="none" YFormat="replicates" Replicates="${groups.length}" TableType="TwoWay" EVFormat="AsteriskAfterNumber">`
  )
  lines.push('    <Title>Individual Replicates</Title>')

  // Row titles — numbered 1 through maxN
  lines.push('    <RowTitlesColumn Width="60">')
  lines.push('      <Subcolumn>')
  for (let i = 1; i <= maxN; i++) {
    lines.push(`        <d>${i}</d>`)
  }
  lines.push('      </Subcolumn>')
  lines.push('    </RowTitlesColumn>')

  // For each target, create a YColumn with one Subcolumn per group
  for (const target of targets) {
    lines.push(
      `    <YColumn Width="100" Decimals="4" Subcolumns="${groups.length}">`
    )
    lines.push(`      <Title>${escapeXml(target)}</Title>`)

    for (const group of groups) {
      // Gather all fold-change values for this target+group
      const values = rows
        .filter((r) => r.target === target && r.group === group && r.foldChange != null)
        .map((r) => r.foldChange)

      lines.push('      <Subcolumn>')
      for (let i = 0; i < maxN; i++) {
        if (i < values.length) {
          lines.push(`        <d>${formatNum(values[i], 4)}</d>`)
        } else {
          lines.push('        <d></d>')
        }
      }
      lines.push('      </Subcolumn>')
    }

    lines.push('    </YColumn>')
  }

  lines.push('  </Table>')
  return lines.join('\n')
}

/**
 * Build the SEM table XML (Table2).
 * Rows = groups, Columns = target genes, Values = SEM values.
 * Useful as error bars when users graph the summary table.
 *
 * @param {object} summary
 * @param {string[]} groups
 * @param {string[]} targets
 * @returns {string}
 */
function buildSemTable(summary, groups, targets) {
  const lines = []

  lines.push(
    '  <Table ID="Table2" XFormat="none" YFormat="replicates" Replicates="1" TableType="TwoWay" EVFormat="AsteriskAfterNumber">'
  )
  lines.push('    <Title>SEM</Title>')

  lines.push('    <RowTitlesColumn Width="120">')
  lines.push('      <Subcolumn>')
  for (const group of groups) {
    lines.push(`        <d>${escapeXml(group)}</d>`)
  }
  lines.push('      </Subcolumn>')
  lines.push('    </RowTitlesColumn>')

  for (const target of targets) {
    lines.push('    <YColumn Width="100" Decimals="4" Subcolumns="1">')
    lines.push(`      <Title>${escapeXml(target)}</Title>`)
    lines.push('      <Subcolumn>')
    for (const group of groups) {
      const stats = summary[target]?.[group]
      if (stats && stats.sem != null) {
        lines.push(`        <d>${formatNum(stats.sem, 4)}</d>`)
      } else {
        lines.push('        <d></d>')
      }
    }
    lines.push('      </Subcolumn>')
    lines.push('    </YColumn>')
  }

  lines.push('  </Table>')
  return lines.join('\n')
}

/**
 * Generate a complete .pzfx XML string from VoilaPCR analysis results.
 *
 * @param {{ rows: object[], summary: object, statistics?: object }} results
 * @param {{ method?: string, referenceGene?: string, controlGroup?: string }} config
 * @returns {Blob}
 */
export function generatePzfx(results, config) {
  const method = config?.method || 'ddct'
  const referenceGene = config?.referenceGene || ''
  const controlGroup = config?.controlGroup || ''

  const summary = results.summary || {}
  const rows = results.rows || []

  const targets = extractTargets(summary)
  const groups = extractGroups(summary, controlGroup)

  const now = new Date().toISOString()

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<GraphPadPrismFile PrismXMLVersion="5.00">',
    '  <Created>',
    `    <OriginalVersion CreatedByProgram="VoilaPCR" CreatedByVersion="2.0" Login="" DateTime="${escapeXml(now)}" />`,
    '  </Created>',
    '',
    '  <InfoSequence>',
    '    <Ref ID="Info0" Selected="1" />',
    '  </InfoSequence>',
    '  <Info ID="Info0">',
    '    <Title>VoilaPCR Export</Title>',
    '    <Notes>',
    `Exported from VoilaPCR (https://voilapcr.com)`,
    `Method: ${escapeXml(method.toUpperCase())}`,
    `Reference gene: ${escapeXml(referenceGene)}`,
    `Control group: ${escapeXml(controlGroup)}`,
    `Date: ${escapeXml(now)}`,
    `Targets: ${escapeXml(targets.join(', '))}`,
    `Groups: ${escapeXml(groups.join(', '))}`,
    '    </Notes>',
    '  </Info>',
    '',
    '  <TableSequence>',
    '    <Ref ID="Table0" Selected="1" />',
    '    <Ref ID="Table1" />',
    '    <Ref ID="Table2" />',
    '  </TableSequence>',
    '',
    buildSummaryTable(summary, groups, targets),
    '',
    buildReplicatesTable(rows, summary, groups, targets),
    '',
    buildSemTable(summary, groups, targets),
    '',
    '</GraphPadPrismFile>',
  ].join('\n')

  return new Blob([xml], { type: 'application/xml' })
}
