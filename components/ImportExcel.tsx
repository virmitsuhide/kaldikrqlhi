'use client'
import { useState, useCallback, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import { Unit, EventType } from '@/types'

type Step = 1 | 2 | 3

interface ParsedRow {
  id          : string
  date        : string
  rawDate     : string
  title       : string
  type        : string
  description : string
  unit        : Unit
  color       : string
  errors      : string[]
  deleted     : boolean
}

const VALID_TYPES: EventType[] = [
  'agenda','libur_nasional','libur_semester','ramadhan','kegiatan_bersama'
]

const UNIT_SHEETS: { sheet: string; unit: Unit; color: string; label: string }[] = [
  { sheet:'SD',       unit:'SD',       color:'#F59E0B', label:'SDIT LHI'  },
  { sheet:'SMP',      unit:'SMP',      color:'#3B82F6', label:'SMPIT LHI' },
  { sheet:'RQ',       unit:'RQ',       color:'#10B981', label:'RQ LHI'    },
  { sheet:'NASIONAL', unit:'NASIONAL', color:'#EF4444', label:'Nasional'  },
]

const TIPE_LABEL: Record<string,string> = {
  agenda:'Agenda', libur_nasional:'Libur Nas.',
  libur_semester:'Libur Sem.', ramadhan:'Ramadhan',
  kegiatan_bersama:'Keg. Bersama',
}

const BULAN = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function parseDate(raw: unknown, year: number): { dateStr: string; error?: string } {
  if (!raw && raw !== 0) return { dateStr: '', error: 'Tanggal wajib diisi' }
  if (typeof raw === 'number') {
    const date = XLSX.SSF.parse_date_code(raw)
    if (!date) return { dateStr: '', error: 'Format tanggal tidak valid' }
    const dateStr = `${date.y}-${String(date.m).padStart(2,'0')}-${String(date.d).padStart(2,'0')}`
    if (date.y !== year) return { dateStr, error: `Tanggal tidak sesuai tahun ${year}` }
    return { dateStr }
  }
  const str = String(raw).trim()
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return { dateStr: '', error: 'Format harus DD/MM/YYYY' }
  const [, d, m, y] = match
  const dateStr = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  const obj = new Date(dateStr)
  if (isNaN(obj.getTime())) return { dateStr: '', error: 'Tanggal tidak valid' }
  if (parseInt(y) !== year)  return { dateStr, error: `Tanggal tidak sesuai tahun ${year}` }
  return { dateStr }
}

function generateTemplate(year: number) {
  const wb = XLSX.utils.book_new()

  // PANDUAN sheet
  const panduan = [
    [`PANDUAN PENGISIAN TEMPLATE KALDIK RQ LHI — TAHUN ${year}`],
    [''],
    ['CARA PENGISIAN:'],
    ['1. Isi data di sheet sesuai unit (SD = SDIT, SMP = SMPIT, RQ, NASIONAL)'],
    ['2. Format tanggal: DD/MM/YYYY  →  contoh: 05/01/'+year],
    ['3. Pastikan tahun di tanggal sesuai tahun yang dipilih di web ('+year+')'],
    ['4. Kolom Tipe: pilih dari dropdown yang tersedia'],
    ['5. Kolom Keterangan: opsional, boleh dikosongkan'],
    [''],
    ['PILIHAN TIPE (salin persis, atau pilih dari dropdown):'],
    ['  agenda           → Kegiatan/agenda sekolah biasa'],
    ['  libur_nasional   → Hari libur nasional'],
    ['  libur_semester   → Libur akhir/tengah semester'],
    ['  ramadhan         → Kegiatan/libur terkait Ramadhan'],
    ['  kegiatan_bersama → Kegiatan gabungan semua unit'],
    [''],
    ['WARNA OTOMATIS (tidak perlu diisi di Excel):'],
    ['  Sheet SD       → Warna Kuning'],
    ['  Sheet SMP      → Warna Biru'],
    ['  Sheet RQ       → Warna Hijau'],
    ['  Sheet NASIONAL → Warna Merah'],
  ]
  const wsPanduan = XLSX.utils.aoa_to_sheet(panduan)
  wsPanduan['!cols'] = [{ wch: 65 }]
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'PANDUAN')

  // Data sheets
  UNIT_SHEETS.forEach(({ sheet }) => {
    const ws = XLSX.utils.aoa_to_sheet([['Tanggal','Judul Agenda','Tipe','Keterangan']])
    ws['!cols'] = [{ wch:14 },{ wch:48 },{ wch:22 },{ wch:40 }]
    ws['!dataValidations'] = [{
      sqref: 'C2:C1000',
      type: 'list',
      formula1: '"agenda,libur_nasional,libur_semester,ramadhan,kegiatan_bersama"',
      showDropDown: false,
      showErrorMessage: true,
      errorTitle: 'Tipe tidak valid',
      error: 'Pilih salah satu dari dropdown',
    }]
    XLSX.utils.book_append_sheet(wb, ws, sheet)
  })

  XLSX.writeFile(wb, `Template_Kaldik_RQ_LHI_${year}.xlsx`)
}

function parseFile(file: File, year: number): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb   = XLSX.read(data, { type:'array', cellDates:false })
        const rows: ParsedRow[] = []
        let counter = 0

        UNIT_SHEETS.forEach(({ sheet, unit, color }) => {
          const ws = wb.Sheets[sheet]
          if (!ws) return
          const json = XLSX.utils.sheet_to_json<any[]>(ws, { header:1, defval:'' })
          for (let i = 1; i < json.length; i++) {
            const row = json[i]
            if (!row || (row[0]===''&&row[1]===''&&row[2]===''&&row[3]==='')) continue
            const errors: string[] = []
            const rawDate = row[0]
            const title   = String(row[1]??'').trim()
            const typeRaw = String(row[2]??'').trim()
            const desc    = String(row[3]??'').trim()
            const { dateStr, error: dateErr } = parseDate(rawDate, year)
            if (dateErr) errors.push(dateErr)
            if (!title)  errors.push('Judul wajib diisi')
            if (!typeRaw)errors.push('Tipe wajib diisi')
            else if (!VALID_TYPES.includes(typeRaw as EventType)) errors.push(`Tipe "${typeRaw}" tidak dikenali`)
            rows.push({ id:`r${counter++}`, date:dateStr, rawDate:String(rawDate),
              title, type:typeRaw, description:desc, unit, color, errors, deleted:false })
          }
        })
        resolve(rows)
      } catch(err) { reject(err) }
    }
    reader.onerror = () => reject(new Error('Gagal baca file'))
    reader.readAsArrayBuffer(file)
  })
}

interface Props { onClose:()=>void; onSuccess:(n:number)=>void }

export default function ImportExcel({ onClose, onSuccess }: Props) {
  const [step, setStep]           = useState<Step>(1)
  const [year, setYear]           = useState(new Date().getFullYear())
  const [rows, setRows]           = useState<ParsedRow[]>([])
  const [activeTab, setActiveTab] = useState('SD')
  const [fileName, setFileName]   = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(async (file: File) => {
    setParseError('')
    try {
      const parsed = await parseFile(file, year)
      if (parsed.length === 0) {
        setParseError('File tidak berisi data. Pastikan sheet SD/SMP/RQ/NASIONAL sudah diisi.')
        return
      }
      setRows(parsed); setFileName(file.name); setStep(3)
    } catch { setParseError('Gagal membaca file. Pastikan format .xlsx') }
  }, [year])

  async function handleImport() {
    const valid = rows.filter(r => !r.deleted && r.errors.length === 0)
    if (!valid.length) return
    setImporting(true)
    const { error } = await supabase.from('events').insert(
      valid.map(r => ({ date:r.date, title:r.title,
        description:r.description||null, unit:r.unit,
        type:r.type, color:r.color, year }))
    )
    setImporting(false)
    if (error) { setParseError(`Gagal: ${error.message}`); return }
    onSuccess(valid.length); onClose()
  }

  const validCount   = rows.filter(r=>!r.deleted&&r.errors.length===0).length
  const errorCount   = rows.filter(r=>!r.deleted&&r.errors.length>0).length
  const deletedCount = rows.filter(r=>r.deleted).length

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
         onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Import Data Massal</p>
            <p className="font-display font-bold text-slate-800">Import Excel Kaldik</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">✕</button>
        </div>

        {/* Step bar */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          {([1,2,3] as Step[]).map((s,idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step===s?'bg-emerald-700 text-white':step>s?'bg-emerald-100 text-emerald-700':'bg-slate-200 text-slate-400'}`}>
                {step>s?'✓':s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step===s?'text-emerald-700':'text-slate-400'}`}>
                {['Pilih Tahun','Upload File','Preview & Konfirmasi'][idx]}
              </span>
              {s<3&&<div className="w-5 h-px bg-slate-200 mx-1"/>}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* STEP 1 */}
          {step===1&&(
            <div className="space-y-5">
              <p className="text-sm text-slate-600">Pilih tahun untuk data yang akan diimport:</p>
              <div className="flex gap-3 flex-wrap">
                {[2025,2026,2027,2028].map(y=>(
                  <button key={y} onClick={()=>setYear(y)}
                    className={`px-8 py-4 rounded-2xl text-xl font-bold transition-all border-2
                      ${year===y?'bg-emerald-700 text-white border-emerald-700 shadow-lg':'bg-white text-slate-500 border-slate-200 hover:border-emerald-400'}`}>
                    {y}
                  </button>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                ⚠️ Semua tanggal di file Excel harus sesuai tahun <strong>{year}</strong>. Tanggal yang tidak sesuai akan ditandai error.
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&(
            <div className="space-y-4">
              <div className="border-2 border-dashed border-emerald-200 rounded-2xl p-6 text-center space-y-3 bg-emerald-50/30">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto text-2xl">📥</div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">Langkah 1 — Download Template</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sudah berisi header, dropdown validasi, dan sheet PANDUAN</p>
                </div>
                <button onClick={()=>generateTemplate(year)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-all">
                  📥 Download Template {year}
                </button>
              </div>

              <div
                className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center space-y-3 bg-blue-50/30
                           hover:border-blue-400 transition-colors cursor-pointer"
                onClick={()=>fileRef.current?.click()}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleUpload(f)}}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto text-2xl">📂</div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">Langkah 2 — Upload File yang Sudah Diisi</p>
                  <p className="text-xs text-slate-400 mt-0.5">Klik atau drag & drop file .xlsx di sini</p>
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                  onChange={e=>{const f=e.target.files?.[0];if(f)handleUpload(f)}}/>
                <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                  📂 Pilih File
                </button>
                {fileName&&<p className="text-xs text-emerald-600 font-medium">✓ {fileName}</p>}
              </div>

              {parseError&&<div className="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3">{parseError}</div>}
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n:validCount,   label:'Siap diimport', cls:'bg-emerald-50 text-emerald-700' },
                  { n:errorCount,   label:'Error',         cls:errorCount>0?'bg-red-50 text-red-600':'bg-slate-50 text-slate-400' },
                  { n:deletedCount, label:'Dihapus',       cls:'bg-slate-50 text-slate-400' },
                ].map(({n,label,cls})=>(
                  <div key={label} className={`rounded-xl p-3 text-center ${cls.split(' ')[0]}`}>
                    <p className={`text-2xl font-bold ${cls.split(' ')[1]}`}>{n}</p>
                    <p className={`text-xs ${cls.split(' ')[1]}`}>{label}</p>
                  </div>
                ))}
              </div>

              {errorCount>0&&(
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                  ⚠️ <strong>{errorCount} baris error</strong> tidak akan diimport. Hapus atau kembali upload ulang file yang sudah diperbaiki.
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-200">
                {UNIT_SHEETS.map(({sheet,label,color})=>{
                  const sheetRows = rows.filter(r=>r.unit===sheet&&!r.deleted)
                  const hasErr    = sheetRows.some(r=>r.errors.length>0)
                  return (
                    <button key={sheet} onClick={()=>setActiveTab(sheet)}
                      className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all relative
                        ${activeTab===sheet?'border border-b-white border-slate-200 bg-white -mb-px':'text-slate-400 hover:text-slate-600'}`}>
                      <span style={{color:activeTab===sheet?color:undefined}}>{label}</span>
                      <span className="ml-1 text-slate-400">({sheetRows.length})</span>
                      {hasErr&&<span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"/>}
                    </button>
                  )
                })}
              </div>

              {/* Rows */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {rows.filter(r=>r.unit===activeTab).length===0&&(
                  <p className="text-center text-slate-400 py-8 text-xs">Tidak ada data di sheet {activeTab}</p>
                )}
                {rows.filter(r=>r.unit===activeTab).map(r=>(
                  <div key={r.id} className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs transition-all
                    ${r.deleted?'opacity-40 bg-slate-50 line-through'
                    :r.errors.length>0?'bg-red-50 border border-red-200'
                    :'bg-slate-50'}`}>
                    <span className="text-slate-400 font-mono w-14 flex-shrink-0">
                      {r.date?(()=>{const[,m,d]=r.date.split('-');return`${parseInt(d)} ${BULAN[parseInt(m)]}`})():r.rawDate||'??'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 truncate">{r.title||'(kosong)'}</p>
                      {r.errors.length>0&&<p className="text-red-500 mt-0.5">{r.errors.join(' · ')}</p>}
                    </div>
                    <span className="text-slate-400 flex-shrink-0 text-[10px]">{TIPE_LABEL[r.type]??r.type}</span>
                    {!r.deleted
                      ?<button onClick={()=>setRows(p=>p.map(x=>x.id===r.id?{...x,deleted:true}:x))}
                          className="text-red-400 hover:text-red-600 font-bold flex-shrink-0">✕</button>
                      :<button onClick={()=>setRows(p=>p.map(x=>x.id===r.id?{...x,deleted:false}:x))}
                          className="text-emerald-600 hover:text-emerald-800 flex-shrink-0 font-semibold text-[10px]">Pulihkan</button>
                    }
                  </div>
                ))}
              </div>

              {parseError&&<div className="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-3">{parseError}</div>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100">
          {step>1&&(
            <button onClick={()=>{setStep(p=>(p-1)as Step);setParseError('')}}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
              ← Kembali
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <div className="ml-auto">
            {step===1&&(
              <button onClick={()=>setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800">
                Lanjut →
              </button>
            )}
            {step===3&&(
              <button onClick={handleImport} disabled={validCount===0||importing}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold
                           hover:bg-emerald-800 disabled:opacity-40 transition-all">
                {importing?'Mengimport...':`✅ Import ${validCount} Agenda`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
