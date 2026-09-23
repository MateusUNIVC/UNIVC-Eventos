# UNIVC Eventos

Sistema de inscrição prévia e confirmação de presença para eventos do UNIVC — Centro Universitário Vale do Cricaré.

## Fluxos

- `/` redireciona direto para a inscrição do evento inicial.
- `/evento/saude-cultura-cidadania/inscricao` — inscrição pública.
- `/evento/saude-cultura-cidadania/presenca` — presença pública, liberada manualmente pelo admin.
- `/admin` — área administrativa protegida.

Não existe escolha "participante ou administrador" na página inicial e não existem credenciais expostas na interface.

## Stack

- React + TypeScript + Vite
- Tailwind CSS 4
- Supabase Cloud (PostgreSQL + Auth + RLS + RPCs)
- Vercel

## 1. Instalação local

```bash
npm install
cp .env.example .env.local
npm run dev
```

No Windows, copie `.env.example` para `.env.local` manualmente ou execute:

```powershell
Copy-Item .env.example .env.local
```

Preencha:

```text
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxx
```

## 2. Criar o banco no Supabase Cloud

Instale/execute o Supabase CLI e vincule este projeto ao projeto Cloud:

```bash
npx supabase@latest login
npx supabase@latest link --project-ref SEU_PROJECT_REF
npx supabase@latest db push
```

Depois execute o conteúdo de `supabase/seed.sql` no SQL Editor do Supabase para criar o evento inicial.

## 3. Criar o administrador

No Supabase Dashboard:

**Authentication → Users → Add user**

Crie o usuário administrativo com e-mail e senha reais.

Depois execute no SQL Editor:

```sql
insert into public.admin_profiles (user_id, display_name)
select id, 'Administrador UNIVC'
from auth.users
where lower(email) = lower('SEU_EMAIL@UNIVC.BR')
on conflict (user_id) do update set display_name = excluded.display_name;
```

## 4. Segurança

O público não possui SELECT direto em inscrições ou presenças. Os formulários usam RPCs `security definer` com validação. O admin precisa estar autenticado e existir em `admin_profiles`.

Nunca adicione `service_role` ou uma secret key ao frontend.

## 5. Publicar na Vercel

Crie o repositório no GitHub e envie este projeto. Na Vercel:

- Import Project → GitHub → selecione o repositório.
- Framework: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

O arquivo `vercel.json` já contém o rewrite necessário para rotas SPA.

## 6. URLs finais para as artes

Após o deploy, use o domínio real da Vercel:

```text
https://SEU-DOMINIO.vercel.app/evento/saude-cultura-cidadania/inscricao
https://SEU-DOMINIO.vercel.app/evento/saude-cultura-cidadania/presenca
```

Os QR Codes também podem ser baixados em `/admin` → evento → `QR Codes`.

## Regras principais

- Inscrição prévia é opcional e serve para estimativa de público.
- Presença independe de inscrição prévia.
- Se o e-mail da presença coincidir com uma inscrição, o relacionamento é feito automaticamente.
- Somente quem confirmou presença aparece em `Lista para certificados`.
- O sistema não gera certificados; exporta a lista dos presentes.
- O botão `Exportar Excel` gera um arquivo `.xls` compatível com Excel sem biblioteca adicional.
- O botão `Exportar PDF` abre a visualização de impressão para salvar como PDF.
