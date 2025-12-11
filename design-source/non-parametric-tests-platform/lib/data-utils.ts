// utils/dataUtils.js
export function isNumeric(v) {
  if (v === null || v === undefined) return false
  // trim si string
  if (typeof v === "string") v = v.trim()
  // rejetter les strings vides
  if (v === "") return false
  const n = Number(v)
  return Number.isFinite(n)
}

export function countValidPairs(rows, varA, varB) {
  if (!Array.isArray(rows)) return 0
  let count = 0
  for (const r of rows) {
    const a = r[varA]
    const b = r[varB]
    if (isNumeric(a) && isNumeric(b)) count++
  }
  return count
}

// Optionnel : renvoie des indices/valeurs pour debug
export function getValidPairSamples(rows: any[], varA: string, varB: string, sampleSize = 10) {
  const pairs: { i: number; a: number; b: number }[] = []
  for (const [i, r] of rows.entries()) {
    if (isNumeric(r[varA]) && isNumeric(r[varB])) {
      pairs.push({ i, a: Number(r[varA]), b: Number(r[varB]) })
      if (pairs.length >= sampleSize) break
    }
  }
  return pairs
}
