/**
 * Calculate mean of an array.
 */
export function mean(arr) {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/**
 * Calculate standard deviation.
 */
export function stdDev(arr) {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}

/**
 * Calculate standard error of the mean.
 */
export function sem(arr) {
  if (arr.length < 2) return 0
  return stdDev(arr) / Math.sqrt(arr.length)
}

/**
 * Two-sample unpaired t-test (Welch's).
 * Returns p-value (two-tailed).
 */
export function tTest(group1, group2) {
  const n1 = group1.length
  const n2 = group2.length
  if (n1 < 2 || n2 < 2) return 1

  const m1 = mean(group1)
  const m2 = mean(group2)
  const v1 = group1.reduce((s, x) => s + (x - m1) ** 2, 0) / (n1 - 1)
  const v2 = group2.reduce((s, x) => s + (x - m2) ** 2, 0) / (n2 - 1)

  const se = Math.sqrt(v1 / n1 + v2 / n2)
  if (se === 0) return 1

  const t = Math.abs(m1 - m2) / se

  // Welch–Satterthwaite degrees of freedom
  const df = (v1 / n1 + v2 / n2) ** 2 /
    ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1))

  // Approximate p-value using the regularized incomplete beta function
  return tDistPValue(t, df)
}

/**
 * Approximate two-tailed p-value from t-distribution.
 * Uses a simple approximation via the normal distribution for large df,
 * and a better approximation for small df.
 */
function tDistPValue(t, df) {
  // Use the regularized incomplete beta function approach
  const x = df / (df + t * t)
  const p = incompleteBeta(x, df / 2, 0.5)
  return Math.min(1, Math.max(0, p))
}

/**
 * Regularized incomplete beta function I_x(a, b) via continued fraction.
 * Good enough for our statistics needs.
 */
function incompleteBeta(x, a, b) {
  if (x <= 0) return 0
  if (x >= 1) return 1

  const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b)
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta)

  // Use continued fraction (Lentz's method)
  if (x < (a + 1) / (a + b + 2)) {
    return front * betaCF(x, a, b) / a
  }
  return 1 - front * betaCF(1 - x, b, a) / b
}

function betaCF(x, a, b) {
  const maxIter = 200
  const eps = 1e-10
  let qab = a + b
  let qap = a + 1
  let qam = a - 1
  let c = 1
  let d = 1 - qab * x / qap
  if (Math.abs(d) < eps) d = eps
  d = 1 / d
  let h = d

  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + aa / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    h *= d * c

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < eps) d = eps
    c = 1 + aa / c
    if (Math.abs(c) < eps) c = eps
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < eps) break
  }
  return h
}

function lnGamma(z) {
  // Stirling-Lanczos approximation
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z)
  }
  z -= 1
  let x = c[0]
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i)
  }
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

/**
 * Format p-value as significance stars.
 */
export function significanceStars(p) {
  if (p < 0.001) return '***'
  if (p < 0.01) return '**'
  if (p < 0.05) return '*'
  return 'ns'
}
