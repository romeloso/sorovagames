import { useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/profile/Avatar'
import { AvatarUploader } from '@/components/profile/AvatarUploader'
import { Button } from '@/components/ui/Button'
import { PageShell } from '@/components/ui/PageShell'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ACCENT_PALETTE } from '@/config/profiles'
import { useApp } from '@/context/AppContext'
import { visibleChildProfiles } from '@/domain/accessCode'
import { buildChildDirectory } from '@/domain/childDirectory'
import { ChildDirectoryTable } from '@/components/admin/ChildDirectoryTable'
import { countLeoActivities } from '@/data/games/reading/curriculum'
import { READING_WORLDS } from '@/data/games/reading/levels'
import { countSubjectActivities, getSubjectLevels, SUBJECT_GAME_IDS } from '@/data/subjects/catalog'
import { GAME_DEFINITIONS } from '@/data/games/registry'
import { overallGameCompletion } from '@/domain/progress'
import { GradeRangeInputs, GradeSelect } from '@/components/admin/GradeSelect'
import { ageFromBirthDate, formatAge } from '@/lib/age'
import { formatGrade, type SchoolGrade } from '@/lib/grade'
import { fileToAvatarDataUrl } from '@/lib/image'
import { formatNumber, formatPercent } from '@/lib/format'
import type { GameId, ReadingStats, TypingStats } from '@/types'

type Tab = 'tutors' | 'children' | 'topics' | 'avatars' | 'progress' | 'material'

const inputClass = 'w-full rounded-xl border-2 border-ink/10 px-3 py-2 font-bold'
const sectionClass = 'rounded-[1.75rem] bg-white/90 p-5 ring-1 ring-ink/5'

function AgeRangeInputs({
  minAge,
  maxAge,
  onMin,
  onMax,
}: {
  minAge: number
  maxAge: number
  onMin: (value: number) => void
  onMax: (value: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block text-sm font-bold text-ink-soft">
        Edad mínima
        <input
          type="number"
          min={3}
          max={12}
          className={`${inputClass} mt-1`}
          value={minAge}
          onChange={(e) => onMin(Number(e.target.value) || 3)}
        />
      </label>
      <label className="block text-sm font-bold text-ink-soft">
        Edad máxima
        <input
          type="number"
          min={3}
          max={12}
          className={`${inputClass} mt-1`}
          value={maxAge}
          onChange={(e) => onMax(Number(e.target.value) || 12)}
        />
      </label>
    </div>
  )
}

export function AdminPanelPage() {
  const navigate = useNavigate()
  const {
    canManage,
    isSuperadmin,
    state,
    logoutStaff,
    addChildProfile,
    updateChildProfile,
    removeChildProfile,
    addTutor,
    setTutorActive,
    regenerateTutorCode,
    addWordMaterial,
    addPassageMaterial,
    removeWordMaterial,
    removePassageMaterial,
    addStudyTopic,
    removeStudyTopic,
    addAvatarToLibrary,
    removeAvatarFromLibrary,
    getGameProgress,
    updateProfileAvatar,
  } = useApp()

  const [tab, setTab] = useState<Tab>('children')
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const [childName, setChildName] = useState('')
  const [childBirthDate, setChildBirthDate] = useState('')
  const [childGrade, setChildGrade] = useState<SchoolGrade | null>(null)
  const [childAccent, setChildAccent] = useState<string>(ACCENT_PALETTE[0]!)
  const [childAvatarSrc, setChildAvatarSrc] = useState('')
  const [childTutorId, setChildTutorId] = useState('')
  const [tutorName, setTutorName] = useState('')
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  const [topicSubject, setTopicSubject] = useState<GameId>('reading')
  const [topicTitle, setTopicTitle] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [topicMinAge, setTopicMinAge] = useState(3)
  const [topicMaxAge, setTopicMaxAge] = useState(12)
  const [topicMinGrade, setTopicMinGrade] = useState(0)
  const [topicMaxGrade, setTopicMaxGrade] = useState(6)
  const [topicReinforce, setTopicReinforce] = useState(true)

  const [avatarLabel, setAvatarLabel] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)

  const [word, setWord] = useState('')
  const [clue, setClue] = useState('')
  const [image, setImage] = useState('📚')
  const [distractors, setDistractors] = useState('CASA, MESA')
  const [wordMinAge, setWordMinAge] = useState(3)
  const [wordMaxAge, setWordMaxAge] = useState(12)
  const [wordMinGrade, setWordMinGrade] = useState(0)
  const [wordMaxGrade, setWordMaxGrade] = useState(6)

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState('Toby, Max, Leo')
  const [answer, setAnswer] = useState('Toby')
  const [passageMinAge, setPassageMinAge] = useState(3)
  const [passageMaxAge, setPassageMaxAge] = useState(12)
  const [passageMinGrade, setPassageMinGrade] = useState(0)
  const [passageMaxGrade, setPassageMaxGrade] = useState(6)

  const profiles = useMemo(() => visibleChildProfiles(state), [state])
  const tutors = useMemo(() => Object.values(state.tutors), [state.tutors])
  const directoryRows = useMemo(
    () => buildChildDirectory(profiles, tutors, state.progress),
    [profiles, state.progress, tutors],
  )
  const editorProfiles = isSuperadmin
    ? profiles.filter((profile) => profile.id === selectedChildId)
    : profiles
  const library = state.contentBank.avatarLibrary
  const topics = state.contentBank.topics

  if (!canManage) return <Navigate to="/" replace />

  const flash = (message: string) => setSavedMessage(message)

  const tabs: { id: Tab; label: string }[] = [
    ...(isSuperadmin ? [{ id: 'tutors' as const, label: 'Tutores' }] : []),
    { id: 'children', label: 'Niños' },
    { id: 'topics', label: 'Temas' },
    { id: 'avatars', label: 'Avatares' },
    { id: 'progress', label: 'Progreso' },
    { id: 'material', label: 'Material' },
  ]

  return (
    <PageShell wide>
      <TopBar backTo="/" backLabel="Inicio" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">
            {isSuperadmin ? 'Panel del superadministrador' : 'Panel del tutor'}
          </h1>
          <p className="font-semibold text-ink-soft">
            {isSuperadmin
              ? 'Crea tutores y revisa los perfiles de todos los niños.'
              : 'Crea los perfiles de tus niños. Cada uno entra con su código.'}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            logoutStaff()
            navigate('/')
          }}
        >
          Cerrar sesión
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? 'primary' : 'secondary'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {savedMessage ? (
        <p className="mb-4 rounded-2xl bg-mint/60 px-4 py-3 font-bold text-ink">{savedMessage}</p>
      ) : null}

      {tab === 'tutors' && isSuperadmin ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Nuevo tutor</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              El tutor crea los perfiles de sus niños y ve solo su progreso. Comparte el código con esa familia.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Nombre del tutor"
                value={tutorName}
                onChange={(event) => setTutorName(event.target.value)}
              />
              <Button
                onClick={() => {
                  try {
                    const tutor = addTutor(tutorName)
                    setTutorName('')
                    flash(`Cuenta creada. El código de ${tutor.name} es ${tutor.accessCode}.`)
                  } catch (error) {
                    flash(error instanceof Error ? error.message : 'No se pudo crear el tutor')
                  }
                }}
              >
                Crear tutor
              </Button>
            </div>
          </section>
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Cuentas ({tutors.length})</h2>
            <ul className="mt-4 space-y-3">
              {tutors.map((tutor) => {
                const children = Object.values(state.profiles).filter((profile) => profile.tutorId === tutor.id)
                return (
                  <li key={tutor.id} className="rounded-2xl bg-sand/70 p-4">
                    <p className="font-display text-xl font-bold">{tutor.name}</p>
                    <p className="mt-1 font-bold">Código: {tutor.accessCode}</p>
                    <p className="text-sm font-semibold text-ink-soft">
                      {tutor.active ? 'Activa' : 'Desactivada'} · {children.length}{' '}
                      {children.length === 1 ? 'perfil' : 'perfiles'}
                    </p>
                    {children.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm font-semibold">
                        {children.map((profile) => (
                          <li key={profile.id}>
                            {profile.name}: {profile.accessCode ?? 'sin código'}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="md" variant="secondary" onClick={() => setTutorActive(tutor.id, !tutor.active)}>
                        {tutor.active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={() => {
                          const next = regenerateTutorCode(tutor.id)
                          if (next) flash(`Nuevo código de ${tutor.name}: ${next}`)
                        }}
                      >
                        Nuevo código
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'children' ? (
        <div className="space-y-6">
          {isSuperadmin ? (
            <ChildDirectoryTable
              rows={directoryRows}
              profiles={profiles}
              tutors={tutors}
              selectedId={selectedChildId}
              onSelect={setSelectedChildId}
            />
          ) : null}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Agregar niño o niña</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              El código se forma con el nombre y la fecha: día, mes y los dos últimos números del año.
              Sophia, 4 de diciembre de 2017, entra con SOPHIA041217.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Nombre"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
              {isSuperadmin ? (
                <label className="block text-sm font-bold text-ink-soft">
                  Tutor a cargo
                  <select
                    className={`${inputClass} mt-1`}
                    value={childTutorId}
                    onChange={(event) => setChildTutorId(event.target.value)}
                  >
                    <option value="">Elige un tutor</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <GradeSelect value={childGrade} onChange={setChildGrade} />
              <label className="block text-sm font-bold text-ink-soft">
                Fecha de nacimiento
                <input
                  type="date"
                  className={`${inputClass} mt-1`}
                  value={childBirthDate}
                  onChange={(e) => setChildBirthDate(e.target.value)}
                />
              </label>
              <div>
                <p className="mb-2 text-sm font-bold text-ink-soft">Color de acento</p>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Color ${color}`}
                      onClick={() => setChildAccent(color)}
                      className="h-9 w-9 rounded-full ring-2 ring-offset-2"
                      style={{
                        backgroundColor: color,
                        outline: childAccent === color ? `3px solid ${color}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
              {library.length > 0 ? (
                <div>
                  <p className="mb-2 text-sm font-bold text-ink-soft">Foto de la galería</p>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                    {library.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setChildAvatarSrc(item.src)}
                        className={`h-14 w-14 overflow-hidden rounded-full ring-2 ${
                          childAvatarSrc === item.src ? 'ring-teal' : 'ring-white'
                        }`}
                        aria-label={item.label}
                      >
                        <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <Button
                onClick={() => {
                  if (!childName.trim() || !childBirthDate) {
                    flash('Escribe el nombre y la fecha de nacimiento para crear el código.')
                    return
                  }
                  try {
                    const profile = addChildProfile({
                      name: childName,
                      birthDate: childBirthDate,
                      grade: childGrade,
                      accent: childAccent,
                      avatarImage: childAvatarSrc || undefined,
                      tutorId: isSuperadmin ? childTutorId : undefined,
                    })
                    setChildName('')
                    setChildBirthDate('')
                    setChildGrade(null)
                    setChildAvatarSrc('')
                    flash(`${profile.name} ya puede entrar con el código ${profile.accessCode}.`)
                  } catch (error) {
                    flash(error instanceof Error ? error.message : 'No se pudo agregar el perfil')
                  }
                }}
              >
                Guardar perfil
              </Button>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">
              {isSuperadmin ? 'Editar perfil' : `Perfiles (${profiles.length})`}
            </h2>
            {isSuperadmin && editorProfiles.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-sand/70 px-4 py-3 font-semibold">
                Elige un niño en la tabla para cambiar su grado, su fecha, su tutor o su foto.
              </p>
            ) : null}
            <ul className="mt-4 space-y-4">
              {editorProfiles.map((profile) => {
                const age = ageFromBirthDate(profile.birthDate)
                return (
                  <li key={profile.id} className="rounded-2xl bg-sand/60 p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <Avatar
                        name={profile.name}
                        src={profile.avatarImage}
                        accent={profile.accent}
                        size="md"
                        focus="center"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          className={inputClass}
                          value={profile.name}
                          onChange={(e) => {
                            const result = updateChildProfile(profile.id, { name: e.target.value })
                            if (!result.ok && result.error) flash(result.error)
                          }}
                        />
                        <p className="rounded-xl bg-white px-3 py-2 font-bold text-ink">
                          Código: {profile.accessCode ?? 'Falta la fecha de nacimiento'}
                        </p>
                        <GradeSelect
                          value={profile.grade}
                          onChange={(grade) => updateChildProfile(profile.id, { grade })}
                          label={`Grado escolar · ${formatGrade(profile.grade)}`}
                        />
                        {isSuperadmin ? (
                          <label className="block text-sm font-bold text-ink-soft">
                            Tutor a cargo
                            <select
                              className={`${inputClass} mt-1`}
                              value={profile.tutorId ?? ''}
                              onChange={(event) => {
                                const result = updateChildProfile(profile.id, {
                                  tutorId: event.target.value || null,
                                })
                                if (!result.ok && result.error) flash(result.error)
                              }}
                            >
                              <option value="">Sin tutor</option>
                              {tutors.map((tutor) => (
                                <option key={tutor.id} value={tutor.id}>
                                  {tutor.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                        <label className="block text-sm font-bold text-ink-soft">
                          Fecha de nacimiento · {formatAge(age)}
                          <input
                            type="date"
                            className={`${inputClass} mt-1`}
                            value={profile.birthDate ?? ''}
                            onChange={(e) => {
                              const result = updateChildProfile(profile.id, {
                                birthDate: e.target.value || null,
                              })
                              if (!result.ok && result.error) flash(result.error)
                            }}
                          />
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="md"
                            variant="secondary"
                            onClick={() => setEditingAvatarId(profile.id)}
                          >
                            Cambiar foto
                          </Button>
                          <Button
                            size="md"
                            variant="ghost"
                            onClick={() => {
                              removeChildProfile(profile.id)
                              if (selectedChildId === profile.id) setSelectedChildId(null)
                              flash(`${profile.name} fue eliminado del listado.`)
                            }}
                          >
                            Quitar
                          </Button>
                        </div>
                        {editingAvatarId === profile.id ? (
                          <div className="rounded-2xl bg-white/80 p-3">
                            <AvatarUploader
                              profile={profile}
                              library={library}
                              compact
                              onSave={(avatarImage) => {
                                updateProfileAvatar(profile.id, avatarImage)
                                setEditingAvatarId(null)
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
        </div>
      ) : null}

      {tab === 'topics' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Tema para estudiar o reforzar</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Se muestra a cada niño según su edad y materia.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-bold text-ink-soft">
                Materia / ámbito
                <select
                  className={`${inputClass} mt-1`}
                  value={topicSubject}
                  onChange={(e) => setTopicSubject(e.target.value as GameId)}
                >
                  {GAME_DEFINITIONS.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.icon} {game.title}
                    </option>
                  ))}
                </select>
              </label>
              <input
                className={inputClass}
                placeholder="Título del tema"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
              />
              <textarea
                className={`min-h-24 ${inputClass}`}
                placeholder="Descripción o qué practicar"
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
              />
              <AgeRangeInputs
                minAge={topicMinAge}
                maxAge={topicMaxAge}
                onMin={setTopicMinAge}
                onMax={setTopicMaxAge}
              />
              <GradeRangeInputs
                minGrade={topicMinGrade}
                maxGrade={topicMaxGrade}
                onMin={setTopicMinGrade}
                onMax={setTopicMaxGrade}
              />
              <label className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                <input
                  type="checkbox"
                  checked={topicReinforce}
                  onChange={(e) => setTopicReinforce(e.target.checked)}
                />
                Tema de refuerzo
              </label>
              <Button
                onClick={() => {
                  if (!topicTitle.trim()) return
                  try {
                    addStudyTopic({
                      subjectId: topicSubject,
                      title: topicTitle,
                      description: topicDescription,
                      minAge: topicMinAge,
                      maxAge: topicMaxAge,
                      minGrade: topicMinGrade,
                      maxGrade: topicMaxGrade,
                      reinforce: topicReinforce,
                    })
                    setTopicTitle('')
                    setTopicDescription('')
                    flash('Tema agregado. Se adaptará a la edad y grado de cada niño.')
                  } catch (error) {
                    flash(error instanceof Error ? error.message : 'No se pudo guardar el tema')
                  }
                }}
              >
                Guardar tema
              </Button>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Temas guardados ({topics.length})</h2>
            <ul className="mt-4 space-y-3">
              {topics.length === 0 ? (
                <li className="font-semibold text-ink-soft">Aún no hay temas. Agrega el primero.</li>
              ) : (
                topics.map((topic) => {
                  const game = GAME_DEFINITIONS.find((item) => item.id === topic.subjectId)
                  return (
                    <li
                      key={topic.id}
                      className="flex items-start justify-between gap-3 rounded-xl bg-sand/70 px-3 py-3"
                    >
                      <div>
                        <p className="font-bold">
                          {game?.icon} {topic.title}
                        </p>
                        <p className="text-sm font-semibold text-ink-soft">{topic.description}</p>
                        <p className="mt-1 text-xs font-bold text-teal">
                          {game?.shortTitle ?? topic.subjectId} · {topic.minAge}–{topic.maxAge} años ·
                          grado {topic.minGrade}–{topic.maxGrade}
                          {topic.reinforce ? ' · Refuerzo' : ''}
                        </p>
                      </div>
                      <Button variant="ghost" size="md" onClick={() => removeStudyTopic(topic.id)}>
                        Quitar
                      </Button>
                    </li>
                  )
                })
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'avatars' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Galería central de fotos</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Sube fotos aquí y asígnalas a cualquier niño o niña.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Etiqueta (ej: Foto nueva Isabella)"
                value={avatarLabel}
                onChange={(e) => setAvatarLabel(e.target.value)}
              />
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  setAvatarBusy(true)
                  void fileToAvatarDataUrl(file)
                    .then((src) => {
                      addAvatarToLibrary({
                        label: avatarLabel || file.name.replace(/\.[^.]+$/, ''),
                        src,
                      })
                      setAvatarLabel('')
                      flash('Foto agregada a la galería central.')
                    })
                    .catch((err: unknown) => {
                      flash(err instanceof Error ? err.message : 'No se pudo cargar la imagen')
                    })
                    .finally(() => {
                      setAvatarBusy(false)
                      event.target.value = ''
                    })
                }}
              />
              <Button
                disabled={avatarBusy}
                onClick={() => avatarFileRef.current?.click()}
              >
                {avatarBusy ? 'Subiendo…' : 'Subir foto a la galería'}
              </Button>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">
              Fotos disponibles ({library.length})
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {library.map((item) => (
                <article key={item.id} className="rounded-2xl bg-sand/60 p-3 text-center">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full ring-2 ring-white">
                    <img src={item.src} alt={item.label} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-bold">{item.label}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    <select
                      className={inputClass}
                      defaultValue=""
                      onChange={(e) => {
                        const profileId = e.target.value
                        if (!profileId) return
                        updateProfileAvatar(profileId, item.src)
                        e.target.value = ''
                        flash('Foto asignada al perfil.')
                      }}
                    >
                      <option value="">Asignar a…</option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="md"
                      variant="ghost"
                      onClick={() => {
                        removeAvatarFromLibrary(item.id)
                        flash('Foto quitada de la galería.')
                      }}
                    >
                      Quitar de galería
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'progress' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {profiles.map((profile) => {
            const reading = getGameProgress('reading', profile.id)
            const typing = getGameProgress('typing', profile.id)
            const readingStats = reading?.stats as ReadingStats | undefined
            const typingStats = typing?.stats as TypingStats | undefined
            const age = ageFromBirthDate(profile.birthDate)

            return (
              <article key={profile.id} className={sectionClass}>
                {editingAvatarId === profile.id ? (
                  <div className="mb-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h2 className="font-display text-2xl font-bold">Foto de {profile.name}</h2>
                      <Button size="md" variant="ghost" onClick={() => setEditingAvatarId(null)}>
                        Cerrar
                      </Button>
                    </div>
                    <AvatarUploader
                      profile={profile}
                      library={library}
                      compact
                      onSave={(avatarImage) => {
                        updateProfileAvatar(profile.id, avatarImage)
                        setEditingAvatarId(null)
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={profile.name}
                      src={profile.avatarImage}
                      accent={profile.accent}
                      size="md"
                      focus="center"
                    />
                    <div>
                      <h2 className="font-display text-2xl font-bold">{profile.name}</h2>
                      <p className="font-semibold text-ink-soft">
                        Nivel {profile.level} · {formatAge(age)} · {formatGrade(profile.grade)}
                      </p>
                      <Button
                        size="md"
                        variant="secondary"
                        className="mt-2 !min-h-10"
                        onClick={() => setEditingAvatarId(profile.id)}
                      >
                        Cambiar foto
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-sm font-semibold text-ink-soft">
                  <p>⭐ XP: {formatNumber(profile.xp)}</p>
                  <p>🪙 Monedas: {formatNumber(profile.coins)}</p>
                  <p>🔥 Racha: {profile.streakDays} días</p>
                  <p>🏆 Logros: {profile.achievements.length}</p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="mb-1 font-bold">📚 Lectura</p>
                    <ProgressBar
                      value={reading ? overallGameCompletion(reading) : 0}
                      colorClassName="bg-coral"
                    />
                    <p className="mt-1 text-sm font-semibold text-ink-soft">
                      Palabras: {readingStats?.wordsLearned.length ?? 0} · Lecciones:{' '}
                      {readingStats?.lessonsCompleted ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-bold">⌨️ Tecleo</p>
                    <ProgressBar
                      value={typing ? overallGameCompletion(typing) : 0}
                      colorClassName="bg-teal"
                    />
                    <p className="mt-1 text-sm font-semibold text-ink-soft">
                      Velocidad: {Math.round(typingStats?.bestWpm ?? 0)} PPM · Precisión:{' '}
                      {formatPercent(typingStats?.bestAccuracy ?? 0)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {tab === 'material' ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`${sectionClass} lg:col-span-2`}>
            <h2 className="font-display text-2xl font-bold">Currículo Leo y Escribo</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              {READING_WORLDS.length} mundos y {countLeoActivities()} actividades publicadas. Las palabras y
              los cuentos de abajo se suman a La ciudad de las palabras, El reino de las historias y El taller
              de escritores.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {READING_WORLDS.map((world) => (
                <li key={world.id} className="rounded-2xl bg-sand/70 px-3 py-2">
                  <p className="font-bold">
                    {world.icon} {world.title}
                  </p>
                  <p className="text-sm font-semibold text-ink-soft">
                    {world.lessonIds.filter((id) => !id.startsWith('reading-admin')).length} lecciones · {world.subtitle}
                  </p>
                </li>
              ))}
            </ul>
          </section>
          <section className={`${sectionClass} lg:col-span-2`}>
            <h2 className="font-display text-2xl font-bold">Otras materias</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              El mismo motor de actividades sirve para matemáticas, ciencias, inglés y tecnología. El contenido
              vive en datos, no dentro de la pantalla.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {SUBJECT_GAME_IDS.map((subjectId) => {
                const game = GAME_DEFINITIONS.find((item) => item.id === subjectId)
                const worlds = getSubjectLevels(subjectId)
                return (
                  <li key={subjectId} className="rounded-2xl bg-sand/70 px-3 py-3">
                    <p className="font-bold">
                      {game?.icon} {game?.title}
                    </p>
                    <p className="text-sm font-semibold text-ink-soft">
                      {worlds.length} mundos · {countSubjectActivities(subjectId)} actividades
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Agregar palabra / quiz</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Se integra en la ciudad de las palabras y en el taller de escritores, según la edad.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Palabra (ej: MARIPOSA)"
                value={word}
                onChange={(e) => setWord(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Pista / definición"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Emoji o imagen (ej: 🦋)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Distractores separados por coma"
                value={distractors}
                onChange={(e) => setDistractors(e.target.value)}
              />
              <AgeRangeInputs
                minAge={wordMinAge}
                maxAge={wordMaxAge}
                onMin={setWordMinAge}
                onMax={setWordMaxAge}
              />
              <GradeRangeInputs
                minGrade={wordMinGrade}
                maxGrade={wordMaxGrade}
                onMin={setWordMinGrade}
                onMax={setWordMaxGrade}
              />
              <Button
                onClick={() => {
                  if (!word.trim()) return
                  try {
                    addWordMaterial({
                      word,
                      clue,
                      image,
                      distractors: distractors.split(',').map((item) => item.trim()),
                      minAge: wordMinAge,
                      maxAge: wordMaxAge,
                      minGrade: wordMinGrade,
                      maxGrade: wordMaxGrade,
                    })
                    setWord('')
                    setClue('')
                    flash('Palabra agregada. Ya está disponible en el juego de lectura.')
                  } catch (error) {
                    flash(error instanceof Error ? error.message : 'No se pudo guardar la palabra')
                  }
                }}
              >
                Guardar palabra
              </Button>
            </div>

            <ul className="mt-5 space-y-2">
              {state.contentBank.words.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-sand/70 px-3 py-2"
                >
                  <span className="font-bold">
                    {item.image} {item.word}{' '}
                    <span className="text-xs text-ink-soft">
                      ({item.minAge}–{item.maxAge} años · g{item.minGrade}–{item.maxGrade})
                    </span>
                  </span>
                  <Button variant="ghost" size="md" onClick={() => removeWordMaterial(item.id)}>
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="font-display text-2xl font-bold">Agregar historia / pregunta</h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              Se integra en el nivel de Historias según la edad.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className={`min-h-28 ${inputClass}`}
                placeholder="Texto de la historia"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Pregunta"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Opciones separadas por coma"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="Respuesta correcta"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <AgeRangeInputs
                minAge={passageMinAge}
                maxAge={passageMaxAge}
                onMin={setPassageMinAge}
                onMax={setPassageMaxAge}
              />
              <GradeRangeInputs
                minGrade={passageMinGrade}
                maxGrade={passageMaxGrade}
                onMin={setPassageMinGrade}
                onMax={setPassageMaxGrade}
              />
              <Button
                onClick={() => {
                  if (!title.trim() || !text.trim() || !question.trim() || !answer.trim()) return
                  try {
                    addPassageMaterial({
                      title,
                      text,
                      question,
                      options: options.split(',').map((item) => item.trim()),
                      answer,
                      minAge: passageMinAge,
                      maxAge: passageMaxAge,
                      minGrade: passageMinGrade,
                      maxGrade: passageMaxGrade,
                    })
                    setTitle('')
                    setText('')
                    setQuestion('')
                    flash('Historia agregada. Ya aparece en el módulo de Historias.')
                  } catch (error) {
                    flash(error instanceof Error ? error.message : 'No se pudo guardar la historia')
                  }
                }}
              >
                Guardar historia
              </Button>
            </div>

            <ul className="mt-5 space-y-2">
              {state.contentBank.passages.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-sand/70 px-3 py-2"
                >
                  <span className="font-bold">
                    {item.title}{' '}
                    <span className="text-xs text-ink-soft">
                      ({item.minAge}–{item.maxAge} años · g{item.minGrade}–{item.maxGrade})
                    </span>
                  </span>
                  <Button variant="ghost" size="md" onClick={() => removePassageMaterial(item.id)}>
                    Quitar
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </PageShell>
  )
}
