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
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload()

  await page.getByRole('heading', { name: /¿Quién va a jugar hoy/i }).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/sorova_lobby.png`, fullPage: true })

  await page.locator('button', { has: page.getByRole('img', { name: /Avatar de Isabella/i }) }).click()
  await page.waitForURL('**/dashboard')
  await page.getByRole('button', { name: /Sopa de letras/i }).click()
  await page.waitForURL('**/games/sopa-de-letras')
  await page.screenshot({ path: `${outDir}/screenshots/sorova_sopa_hub.png`, fullPage: true })

  await page.getByRole('button', { name: /Palabras cortas/i }).click()
  await page.waitForURL('**/play/**')
  await page.getByText(/Encontradas 0\//i).waitFor()
  await page.screenshot({ path: `${outDir}/screenshots/sorova_sopa_play.png`, fullPage: true })

  await context.close()
  await browser.close()
  console.log('DEMO_SOROVA_SOPA_OK')
}

main().catch((error) => {
  console.error('DEMO_SOROVA_SOPA_FAIL', error)
  process.exit(1)
})
