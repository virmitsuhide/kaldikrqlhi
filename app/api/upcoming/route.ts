import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { todayWIB, addDaysWIB } from '@/lib/date-wib'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/upcoming
 * Query params:
 *   days (optional, default 30, max 365): jumlah hari ke depan
 *   unit (optional): SD | SMP | RQ | NASIONAL | all  (NASIONAL selalu disertakan)
 *   limit (optional, max 100): batas jumlah event
 *
 * Response: { events: KaldikEvent[], total, meta }
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const unitStr  = searchParams.get('unit')
  const daysStr  = searchParams.get('days')
  const limitStr = searchParams.get('limit')

  const days  = Math.min(Math.max(parseInt(daysStr  ?? '30') || 30, 1), 365)
  const limit = Math.min(Math.max(parseInt(limitStr ?? '50') || 50, 1), 100)

  const startDate = todayWIB()
  const endDate   = addDaysWIB(days)

  let query = supabase
    .from('events')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .limit(limit)

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
      from  : startDate,
      to    : endDate,
      days,
      limit,
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
