import { chromium } from 'playwright'
import { mkdirSync, copyFileSync } from 'node:fs'
import { basename } from 'node:path'

const base = 'http://127.0.0.1:5173'

async function clickVirtualKey(page, key) {
  await page.getByLabel('Teclado virtual').getByRole('button', { name: key, exact: true }).click()
}

async function main() {
  mkdirSync('/tmp/mis-juegos-video', { recursive: true })
  mkdirSync('/opt/cursor/artifacts/screenshots', { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: '/tmp/mis-juegos-video', size: { width: 1280, height: 800 } },
  })
  const page = await context.newPage()

  await page.goto(base)
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.setItem('sorova.lobby-intro.seen', '1')
  })
  await page.reload()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/profiles.png', fullPage: true })

  await page.getByRole('button', { name: /Isabella/i }).click()
  await page.waitForURL('**/dashboard')
  await page.getByRole('heading', { name: /¡Hola, Isabella!/i }).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/dashboard.png', fullPage: true })

  await page.getByRole('button', { name: /Leo y Escribo/i }).click()
  await page.waitForURL('**/games/aprende-a-leer')
  await page.getByRole('button', { name: /¿Qué sonido escuchaste\?/i }).click()
  await page.waitForURL('**/lesson/reading-sonidos-1')

  for (const answer of ['SOL', 'LUNA', 'OSO', 'PAN']) {
    await page.getByRole('button', { name: answer, exact: true }).click()
    await page.waitForTimeout(900)
  }

  await page.waitForURL('**/result', { timeout: 15000 })
  await page.getByText(/¡Excelente, Isabella!/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/result_reading.png', fullPage: true })

  await page.getByRole('button', { name: 'Ir al inicio' }).click()
  await page.waitForURL('**/dashboard')

  await page.getByRole('button', { name: /Teclea como una experta/i }).click()
  await page.waitForURL('**/games/teclea-como-una-experta')
  await page.getByRole('button', { name: /Teclas A S D/i }).click()
  await page.waitForURL('**/lesson/typing-l1-a')
  await page.getByText(/Presiona la tecla A/i).waitFor()

  for (const key of ['A', 'S', 'D', 'F']) {
    await page.getByText(new RegExp(`Presiona la tecla ${key}`, 'i')).waitFor()
    await clickVirtualKey(page, key)
    await page.waitForTimeout(900)
  }

  await page.waitForURL('**/result', { timeout: 15000 })
  await page.getByText(/¡Excelente, Isabella!/i).waitFor()
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/result_typing.png', fullPage: true })

  await page.getByRole('button', { name: 'Ir al inicio' }).click()
  await page.waitForURL('**/dashboard')
  await page.screenshot({ path: '/opt/cursor/artifacts/screenshots/dashboard_after.png', fullPage: true })

  const video = page.video()
  await context.close()
  await browser.close()

  if (video) {
    const videoPath = await video.path()
    const target = `/opt/cursor/artifacts/mis_juegos_demo_lectura_y_tecleo.webm`
    copyFileSync(videoPath, target)
    console.log('SMOKE_OK', { video: target, file: basename(videoPath) })
  } else {
    console.log('SMOKE_OK')
  }
}

main().catch((error) => {
  console.error('SMOKE_FAIL', error)
  process.exit(1)
})
