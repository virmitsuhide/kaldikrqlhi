import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/calendar
 * Query params:
 *   year  : number (required)  — e.g. 2026
 *   unit  : string (optional)  — SD | SMP | RQ | NASIONAL | all
 *   month : number (optional)  — 1-12
 *
 * Response: { events: KaldikEvent[], total: number, meta: {...} }
 *
 * Contoh untuk WhatsApp bot:
 *   GET /api/calendar?year=2026&unit=RQ&month=3
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const yearStr  = searchParams.get('year')
  const unitStr  = searchParams.get('unit')
  const monthStr = searchParams.get('month')

  // Validasi year
  const year = parseInt(yearStr ?? '')
  if (isNaN(year) || year < 2024 || year > 2030) {
    return NextResponse.json(
      { error: 'Parameter year tidak valid. Gunakan ?year=2026' },
      { status: 400 }
    )
  }

  let query = supabase.from('events').select('*').eq('year', year)

  // Filter unit
  if (unitStr && unitStr !== 'all' && unitStr !== 'SEMUA') {
    const units = unitStr.toUpperCase().split(',').map(u => u.trim())
    // Always include NASIONAL
    if (!units.includes('NASIONAL')) units.push('NASIONAL')
    query = query.in('unit', units)
  }

  // Filter month
  const month = parseInt(monthStr ?? '')
  if (!isNaN(month) && month >= 1 && month <= 12) {
    const startDate = `${year}-${String(month).padStart(2,'0')}-01`
    const endDate   = `${year}-${String(month).padStart(2,'0')}-31`
    query = query.gte('date', startDate).lte('date', endDate)
  }

  query = query.order('date', { ascending: true })

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    events : data ?? [],
    total  : data?.length ?? 0,
    meta: {
      year,
      unit  : unitStr ?? 'all',
      month : monthStr ?? 'all',
      source: 'Kaldik RQ LHI — SIT Lukman Hakim Internasional',
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin' : '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control'               : 'public, s-maxage=300, stale-while-revalidate=600',
    }
  })
}
