import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProvider, useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/Button'

function Probe() {
  const { ready, state, loginSuperadmin, addChildProfile, addStudyTopic, isSuperadmin } = useApp()
  if (!ready) return <p>Cargando</p>
  const nora = Object.values(state.profiles).find((profile) => profile.name === 'Nora')
  return (
    <div>
      <p>Perfiles: {Object.keys(state.profiles).length}</p>
      <p>Super: {isSuperadmin ? 'si' : 'no'}</p>
      <p>Temas: {state.contentBank.topics.length}</p>
      <p>Codigo: {nora?.accessCode ?? 'ninguno'}</p>
      <Button
        onClick={() => {
          const result = loginSuperadmin('4716')
          if (!result.ok) throw new Error(result.error)
        }}
      >
        Login
      </Button>
      <Button
        onClick={() => {
          addChildProfile({
            name: 'Nora',
            birthDate: '2020-01-01',
            grade: 1,
            tutorId: 'tutor-sorova',
          })
        }}
      >
        Add child
      </Button>
      <Button
        onClick={() => {
          addStudyTopic({
            subjectId: 'reading',
            title: 'Sílabas',
            description: 'ma me mi',
            minAge: 3,
            maxAge: 8,
          })
        }}
      >
        Add topic
      </Button>
    </div>
  )
}

describe('AppContext integration', () => {
  it('login admin, alta de niño y tema', async () => {
    const user = userEvent.setup()
    render(
      <AppProvider>
        <MemoryRouter>
          <Probe />
        </MemoryRouter>
      </AppProvider>,
    )

    await waitFor(() => expect(screen.getByText(/Perfiles:/)).toBeInTheDocument())
    expect(screen.getByText(/Perfiles: 3/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Super: si')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add child' }))
    expect(screen.getByText(/Perfiles: 4/)).toBeInTheDocument()
    expect(screen.getByText('Codigo: NORA010120')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add topic' }))
    expect(screen.getByText('Temas: 1')).toBeInTheDocument()
  })
})
