import { chromium } from 'playwright'

const base = 'http://127.0.0.1:5173'
const outDir = '/opt/cursor/artifacts'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 900 } },
  })
  const page = await context.newPage()

  await page.goto(base)
  await page.evaluate(() => localStorage.clear())
  await page.reload()

  await page.getByRole('button', { name: /Acceso superadministrador/i }).click()
  await page.getByPlaceholder('••••').fill('4716')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/panel')

  await page.getByRole('button', { name: 'Niños' }).click()
  const addForm = page.locator('section', { has: page.getByRole('heading', { name: /Agregar niño/i }) })
  await addForm.getByPlaceholder('Nombre').fill('Mateo')
  await addForm.getByLabel('Tutor a cargo').selectOption({ label: 'Familia Sorova' })
  await addForm.locator('input[type="date"]').fill('2019-03-15')
  await addForm.getByRole('button', { name: 'Guardar perfil' }).click()
  await page.getByText(/MATEO150319/).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/demo_admin_ninos.png`, fullPage: true })

  await page.getByRole('button', { name: 'Temas' }).click()
  await page.getByPlaceholder('Título del tema').fill('Vocales A E I')
  await page.getByPlaceholder('Descripción o qué practicar').fill('Practicar vocales')
  await page.getByRole('button', { name: 'Guardar tema' }).click()
  await page.getByText(/Tema agregado/i).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/demo_admin_temas.png`, fullPage: true })

  await page.getByRole('button', { name: 'Avatares' }).click()
  await page.getByText(/Galería central de fotos/i).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/demo_admin_avatares.png`, fullPage: true })

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await page.waitForURL((url) => url.pathname === '/')
  await page.getByLabel('Código del niño').fill('MATEO150319')
  await page.screenshot({ path: `${outDir}/screenshots/demo_perfiles_con_mateo.png`, fullPage: true })
  await page.getByRole('button', { name: 'Entrar a jugar' }).click()
  await page.waitForURL('**/dashboard')
  await page.getByText(/Temas para ti/i).waitFor()
  await page.getByText(/Vocales A E I/i).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/demo_dashboard_temas_edad.png`, fullPage: true })

  await context.close()
  await browser.close()
  console.log('DEMO_ADMIN_KIDS_OK')
}

main().catch((error) => {
  console.error('DEMO_ADMIN_KIDS_FAIL', error)
  process.exit(1)
})
