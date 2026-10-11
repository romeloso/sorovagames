export type GameStatus = 'available' | 'coming_soon' | 'locked'

export type GameId =
  | 'reading'
  | 'typing'
  | 'wordsearch'
  | 'memory'
  | 'math'
  | 'science'
  | 'english'
  | 'technology'
  | 'creativity'

export type SessionRole = 'child' | 'admin'

/** 0 = preescolar, 1–6 = grados de primaria. */
export type SchoolGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ActivityKind =
  | 'letter_choice'
  | 'letter_from_image'
  | 'syllable_build'
  | 'word_select'
  | 'word_build'
  | 'word_quiz'
  | 'reading_practice'
  | 'token_order'
  | 'trace_letter'
  | 'key_press'
  | 'home_row'
  | 'letter_race'
  | 'syllable_type'
  | 'word_type'

export type SkillMasteryStatus = 'not_evaluated' | 'developing' | 'needs_support' | 'mastered'

export interface ChildProfileSeed {
  id: string
  name: string
  avatar: string
  avatarImage: string
  accent: string
  birthDate?: string | null
  grade?: SchoolGrade | null
}

export interface ChildProfile extends ChildProfileSeed {
  birthDate: string | null
  /** Grado escolar (0 preescolar … 6°). */
  grade: SchoolGrade | null
  level: number
  xp: number
  points: number
  coins: number
  streakDays: number
  lastPlayedDate: string | null
  achievements: string[]
  createdAt: string
  updatedAt: string
}

export interface GameDefinition {
  id: GameId
  slug: string
  title: string
  shortTitle: string
  description: string
  icon: string
  status: GameStatus
  accent: string
  totalLevels: number
}

export interface GameLevelMeta {
  id: string
  gameId: GameId
  order: number
  title: string
  subtitle: string
  icon: string
  lessonIds: string[]
}

export interface ChoiceOption {
  id: string
  label: string
  value: string
}

export interface BaseActivity {
  id: string
  kind: ActivityKind
  prompt: string
  /** Texto que se puede escuchar. No sustituye una grabación profesional. */
  speak?: string
  hint?: string
  imageAlt?: string
  xpReward?: number
  coinReward?: number
}

export interface LetterChoiceActivity extends BaseActivity {
  kind: 'letter_choice'
  letter: string
  options: ChoiceOption[]
  answer: string
}

export interface LetterFromImageActivity extends BaseActivity {
  kind: 'letter_from_image'
  image: string
  wordHint?: string
  options: ChoiceOption[]
  answer: string
}

export interface SyllableBuildActivity extends BaseActivity {
  kind: 'syllable_build'
  parts: string[]
  answer: string
  options: ChoiceOption[]
}

export interface WordSelectActivity extends BaseActivity {
  kind: 'word_select'
  image?: string
  word: string
  options: ChoiceOption[]
  answer: string
}

export interface WordBuildActivity extends BaseActivity {
  kind: 'word_build'
  word: string
  image?: string
  scrambled: string[]
}

/** Quiz: identificar la palabra correcta a partir de imagen o definición. */
export interface WordQuizActivity extends BaseActivity {
  kind: 'word_quiz'
  image?: string
  clue: string
  options: ChoiceOption[]
  answer: string
}

/** Práctica de lectura con corrección instantánea al escribir/seleccionar. */
export interface ReadingPracticeActivity extends BaseActivity {
  kind: 'reading_practice'
  text: string
  mode: 'type' | 'choose'
  options?: ChoiceOption[]
  answer: string
  hint?: string
}

export interface KeyPressActivity extends BaseActivity {
  kind: 'key_press'
  key: string
  fingerHint?: string
}

export interface HomeRowActivity extends BaseActivity {
  kind: 'home_row'
  key: string
  fingerHint: string
  hand: 'left' | 'right'
}

export interface LetterRaceActivity extends BaseActivity {
  kind: 'letter_race'
  letters: string[]
}

export interface SyllableTypeActivity extends BaseActivity {
  kind: 'syllable_type'
  target: string
}

export interface WordTypeActivity extends BaseActivity {
  kind: 'word_type'
  target: string
}

/** Ordenar sílabas o palabras. */
export interface TokenOrderActivity extends BaseActivity {
  kind: 'token_order'
  tokens: string[]
  answer: string
  separator: '' | ' '
  image?: string
}

/** Trazado guiado. Las desviaciones pequeñas no se penalizan. */
export interface TraceLetterActivity extends BaseActivity {
  kind: 'trace_letter'
  letter: string
  checkpoints: Array<{ x: number; y: number }>
}

export type Activity =
  | LetterChoiceActivity
  | LetterFromImageActivity
  | SyllableBuildActivity
  | WordSelectActivity
  | WordBuildActivity
  | WordQuizActivity
  | ReadingPracticeActivity
  | KeyPressActivity
  | HomeRowActivity
  | LetterRaceActivity
  | SyllableTypeActivity
  | WordTypeActivity
  | TokenOrderActivity
  | TraceLetterActivity

export interface LessonDefinition {
  id: string
  gameId: GameId
  levelId: string
  title: string
  activities: Activity[]
  source?: 'builtin' | 'admin'
  objective?: string
  skillIds?: string[]
  instructions?: string
  estimatedMinutes?: number
}

export interface LessonProgress {
  lessonId: string
  stars: number
  bestAccuracy: number
  completions: number
  lastPlayedAt: string | null
  unlocked: boolean
}

export interface LevelProgress {
  levelId: string
  unlocked: boolean
  stars: number
  completedLessons: number
  totalLessons: number
}

export interface GameProgress {
  gameId: GameId
  unlockedLevelIds: string[]
  lessonProgress: Record<string, LessonProgress>
  stats: GameStats
}

export interface SkillProgressRecord {
  skillId: string
  independentCorrect: number
  independentTotal: number
  assistedCorrect: number
  sessions: number
  lastPracticedAt: string | null
  nextReviewAt: string | null
  status: SkillMasteryStatus
}

export interface ReadingPlacement {
  completedAt: string
  recommendedWorldId: string
  summary: string
}

export interface ReadingStats {
  wordsLearned: string[]
  lessonsCompleted: number
  correctAnswers: number
  totalAnswers: number
  skills?: Record<string, SkillProgressRecord>
  placement?: ReadingPlacement
}

export interface TypingStats {
  bestWpm: number
  bestAccuracy: number
  keysPracticed: string[]
  lessonsCompleted: number
  totalKeystrokes: number
  correctKeystrokes: number
}

export interface WordSearchStats {
  puzzlesCompleted: number
  wordsFound: number
}

/** Progreso de una materia que no es lectura: precisión, intentos y habilidades. */
export interface SubjectStats {
  lessonsCompleted: number
  correctAnswers: number
  totalAnswers: number
  skills?: Record<string, SkillProgressRecord>
}

export type GameStats = ReadingStats | TypingStats | WordSearchStats | SubjectStats | Record<string, never>

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  gameId?: GameId | 'global'
}

export interface RewardPayload {
  xp: number
  coins: number
  points: number
  achievements: AchievementDefinition[]
  leveledUp: boolean
  newLevel: number
}

export interface ActivityAttemptResult {
  activityId: string
  correct: boolean
  attempts: number
  timeMs: number
  typedChars?: number
  correctChars?: number
  hintsUsed?: number
}

export interface LessonSessionResult {
  gameId: GameId
  levelId: string
  lessonId: string
  results: ActivityAttemptResult[]
  accuracy: number
  stars: number
  durationMs: number
  wpm?: number
  words?: string[]
  skillIds?: string[]
}

/** Material creado desde el panel administrador. */
export interface AdminWordItem {
  id: string
  word: string
  image?: string
  clue?: string
  distractors: string[]
  minAge: number
  maxAge: number
  minGrade: number
  maxGrade: number
  createdAt: string
}

export interface AdminPassageItem {
  id: string
  title: string
  text: string
  question: string
  options: string[]
  answer: string
  minAge: number
  maxAge: number
  minGrade: number
  maxGrade: number
  createdAt: string
}

/** Temas de estudio/refuerzo por materia, adaptables por edad y grado. */
export interface StudyTopic {
  id: string
  subjectId: GameId
  title: string
  description: string
  minAge: number
  maxAge: number
  minGrade: number
  maxGrade: number
  reinforce: boolean
  createdAt: string
}

/** Galería central de fotos/avatares administrable. */
export interface AvatarLibraryItem {
  id: string
  label: string
  src: string
  createdAt: string
}

export interface ContentBank {
  words: AdminWordItem[]
  passages: AdminPassageItem[]
  topics: StudyTopic[]
  avatarLibrary: AvatarLibraryItem[]
}

export interface AppState {
  version: number
  soundEnabled: boolean
  activeProfileId: string | null
  sessionRole: SessionRole
  profiles: Record<string, ChildProfile>
  progress: Record<string, Record<GameId, GameProgress>>
  contentBank: ContentBank
}

export interface AdaptiveHint {
  mode: 'challenge' | 'reinforce' | 'steady'
  message: string
}
