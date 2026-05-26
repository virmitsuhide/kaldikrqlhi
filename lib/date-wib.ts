/**
 * Helpers untuk konsistensi timezone WIB (UTC+7).
 * Server (Vercel) berjalan di UTC; pengguna di Indonesia.
 * Tanpa offset ini, jam 00:00-07:00 WIB akan terhitung sebagai "kemarin".
 */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

export function todayWIB(): string {
  const now = new Date(Date.now() + WIB_OFFSET_MS)
  return now.toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

export function addDaysWIB(days: number): string {
  const d = new Date(Date.now() + WIB_OFFSET_MS + days * 86_400_000)
  return d.toISOString().slice(0, 10)
}
