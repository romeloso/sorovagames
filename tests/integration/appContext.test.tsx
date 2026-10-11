import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProvider, useApp } from '@/context/AppContext'
import { SEED_TOPICS } from '@/data/content/seed'
import { Button } from '@/components/ui/Button'

function Probe() {
  const { ready, state, loginAdmin, addChildProfile, addStudyTopic, isAdmin } = useApp()
  if (!ready) return <p>Cargando</p>
  return (
    <div>
      <p>Perfiles: {Object.keys(state.profiles).length}</p>
      <p>Admin: {isAdmin ? 'si' : 'no'}</p>
      <p>Temas: {state.contentBank.topics.length}</p>
      <Button
        onClick={() => {
          const result = loginAdmin('4716')
          if (!result.ok) throw new Error(result.error)
        }}
      >
        Login
      </Button>
      <Button
        onClick={() => {
          addChildProfile({ name: 'Nora', birthDate: '2020-01-01', grade: 1 })
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
    expect(screen.getByText('Admin: si')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add child' }))
    expect(screen.getByText(/Perfiles: 4/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add topic' }))
    expect(screen.getByText(`Temas: ${SEED_TOPICS.length + 1}`)).toBeInTheDocument()
  })
})
