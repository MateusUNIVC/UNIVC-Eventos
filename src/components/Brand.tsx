export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'admin-brand' : 'public-logo-wrap'}>
      <img
        src="/brand/univc-horizontal.png"
        alt="UNIVC — Centro Universitário Vale do Cricaré"
        className={compact ? undefined : 'public-logo'}
      />
    </div>
  )
}
