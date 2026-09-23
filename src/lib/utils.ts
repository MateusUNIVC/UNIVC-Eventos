import type { AttendanceRecord, EventRecord, RegistrationRecord } from './types'

export const formatDateBR = (date?: string | null) => {
  if (!date) return '—'
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export const formatTime = (time?: string | null) => {
  if (!time) return '—'
  return time.slice(0, 5)
}

export const formatDateTimeBR = (value?: string | null) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const effectiveCourse = (record: Pick<RegistrationRecord | AttendanceRecord, 'course' | 'custom_course'>) =>
  record.course === 'Outros' ? record.custom_course || 'Outros' : record.course || '—'

export const effectivePeriod = (record: Pick<RegistrationRecord | AttendanceRecord, 'period' | 'custom_period'>) =>
  record.period === 'Outro' ? record.custom_period || 'Outro' : record.period || '—'

export const eventDisplayDate = (event: EventRecord) => formatDateBR(event.event_date)

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const exportAttendanceExcel = (event: EventRecord, rows: AttendanceRecord[]) => {
  const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const rowXml = rows.map((row) => {
    const values = [
      row.full_name,
      row.email,
      row.is_univc_student ? 'Sim' : 'Não',
      row.is_univc_student ? effectiveCourse(row) : '',
      row.is_univc_student ? effectivePeriod(row) : '',
      formatDateTimeBR(row.checked_in_at),
    ]
    return `<Row>${values.map((v) => `<Cell><Data ss:Type="String">${esc(String(v))}</Data></Cell>`).join('')}</Row>`
  }).join('')

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Presenças"><Table>
<Row><Cell><Data ss:Type="String">Nome completo</Data></Cell><Cell><Data ss:Type="String">E-mail</Data></Cell><Cell><Data ss:Type="String">Aluno UNIVC</Data></Cell><Cell><Data ss:Type="String">Curso</Data></Cell><Cell><Data ss:Type="String">Período</Data></Cell><Cell><Data ss:Type="String">Data/Hora da presença</Data></Cell></Row>
${rowXml}
</Table></Worksheet></Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `presencas-${event.slug}-${event.event_date}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

export const exportAttendancePdf = (event: EventRecord, rows: AttendanceRecord[]) => {
  const tableRows = rows.map((row) => `
    <tr>
      <td>${row.full_name}</td>
      <td>${row.email}</td>
      <td>${row.is_univc_student ? effectiveCourse(row) : '—'}</td>
      <td>${row.is_univc_student ? effectivePeriod(row) : '—'}</td>
      <td>${formatDateTimeBR(row.checked_in_at)}</td>
    </tr>`).join('')

  const win = window.open('', '_blank', 'width=1100,height=800')
  if (!win) return
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Lista de Presença</title>
    <style>
      body{font-family:Arial,sans-serif;color:#173123;margin:28px}h1{font-size:22px;margin:0}h2{font-size:16px;margin:6px 0 20px;color:#50685a}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #cbd8ce;padding:8px;text-align:left}th{background:#04301d;color:#fff}.meta{margin:14px 0 22px;font-size:12px}.brand{font-weight:800;color:#04301d;letter-spacing:.04em}@media print{@page{size:landscape;margin:12mm}.no-print{display:none}}</style></head><body>
    <div class="brand">UNIVC — Centro Universitário Vale do Cricaré</div>
    <h1>Lista de Presença</h1><h2>${event.name}</h2>
    <div class="meta">Data: ${formatDateBR(event.event_date)} &nbsp; • &nbsp; Total de presentes: ${rows.length}</div>
    <table><thead><tr><th>Nome</th><th>E-mail</th><th>Curso</th><th>Período</th><th>Presença</th></tr></thead><tbody>${tableRows}</tbody></table>
    <script>window.onload=()=>window.print()</script>
  </body></html>`)
  win.document.close()
}
