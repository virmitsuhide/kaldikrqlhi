import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { todayWIB } from '@/lib/date-wib'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/today
 * Query params:
 *   unit (optional): SD | SMP | RQ | NASIONAL | all  (NASIONAL selalu disertakan)
 *
 * Response: { events: KaldikEvent[], total, meta }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const unitStr = searchParams.get('unit')

  const today = todayWIB()

  let query = supabase.from('events').select('*').eq('date', today)

  if (unitStr && unitStr !== 'all' && unitStr !== 'SEMUA') {
    const units = unitStr.toUpperCase().split(',').map(u => u.trim())
    if (!units.includes('NASIONAL')) units.push('NASIONAL')
    query = query.in('unit', units)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    events: data ?? [],
    total : data?.length ?? 0,
    meta: {
      date  : today,
      unit  : unitStr ?? 'all',
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
