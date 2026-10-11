import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  await page.goto(base)
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.setItem('sorova.lobby-intro.seen', '1')
  })
  await page.reload()

  // Avatars visible
  await page.getByRole('img', { name: /Avatar de Isabella/i }).waitFor()
  await page.getByRole('img', { name: /Avatar de Sophia/i }).waitFor()
  await page.getByRole('img', { name: /Avatar de Valentina/i }).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/avatars_profiles.png', fullPage: true })

  // Admin login
  await page.getByRole('button', { name: /Acceso Administrador/i }).click()
  await page.waitForURL('**/admin')
  await page.getByPlaceholder('••••').fill('4716')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/admin/panel')
  await page.getByText('Panel Administrador').waitFor()

  // Add child with birth date
  await page.getByRole('button', { name: 'Niños' }).click()
  await page.getByPlaceholder('Nombre').fill('Lucas')
  await page.locator('input[type="date"]').first().fill('2018-05-10')
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await page.getByText(/Niño o niña agregado/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/admin_children.png', fullPage: true })

  // Add study topic
  await page.getByRole('button', { name: 'Temas' }).click()
  await page.getByPlaceholder('Título del tema').fill('Sílabas ma me mi')
  await page.getByPlaceholder('Descripción o qué practicar').fill('Repasar sílabas con m')
  await page.getByRole('button', { name: 'Guardar tema' }).click()
  await page.getByText(/Tema agregado/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/admin_topics.png', fullPage: true })

  // Avatars gallery
  await page.getByRole('button', { name: 'Avatares' }).click()
  await page.getByText(/Galería central de fotos/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/admin_avatars.png', fullPage: true })

  // Progress
  await page.getByRole('button', { name: 'Progreso' }).click()
  await page.getByText('Lucas').waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/admin_progress.png', fullPage: true })

  // Add material
  await page.getByRole('button', { name: 'Material' }).click()
  await page.getByPlaceholder('Palabra (ej: MARIPOSA)').fill('MARIPOSA')
  await page.getByPlaceholder('Pista / definición').fill('Insecto con alas de colores')
  await page.getByPlaceholder('Emoji o imagen (ej: 🦋)').fill('🦋')
  await page.getByPlaceholder('Distractores separados por coma').fill('ABEJA, FLOR')
  await page.getByRole('button', { name: 'Guardar palabra' }).click()
  await page.getByText(/Palabra agregada/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/admin_material.png', fullPage: true })

  // Back to kids and open reading quiz level path via hub
  await page.getByRole('button', { name: /Cerrar sesión admin/i }).click()
  await page.waitForURL((url) => url.pathname === '/')
  await page.getByRole('heading', { name: /¿Quién va a jugar hoy/i }).waitFor()
  await page.getByText('Lucas').waitFor()
  await page.locator('button', { has: page.getByRole('img', { name: /Avatar de Isabella/i }) }).click()
  await page.waitForURL('**/dashboard')
  await page.getByRole('img', { name: /Avatar de Isabella/i }).waitFor()
  await page.getByText(/Temas para ti|Sílabas ma me mi/i).first().waitFor()
  await page.getByRole('button', { name: /Leo y Escribo/i }).click()
  await page.waitForURL('**/games/aprende-a-leer')
  await page.getByText(/La ciudad de las palabras/i).waitFor()
  await page.getByText(/El taller de escritores/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/reading_modules.png', fullPage: true })

  console.log('SMOKE_ADMIN_OK')
  await browser.close()
}

main().catch((error) => {
  console.error('SMOKE_ADMIN_FAIL', error)
  process.exit(1)
})
