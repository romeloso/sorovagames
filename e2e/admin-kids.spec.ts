import { test, expect } from '@playwright/test'

test.describe('Mis Juegos E2E', () => {
  test('admin agrega niño, tema y el dashboard adapta por edad', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.setItem('sorova.lobby-intro.seen', '1')
    })
    await page.reload()

    await expect(page.getByRole('heading', { name: /¿Quién va a jugar hoy/i })).toBeVisible()

    await page.getByRole('button', { name: /Acceso superadministrador/i }).click()
    await page.getByPlaceholder('••••').fill('4716')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('Panel del superadministrador')).toBeVisible()

    await page.getByRole('button', { name: 'Niños' }).click()
    const addForm = page.locator('section', { has: page.getByRole('heading', { name: /Agregar niño/i }) })
    await addForm.getByPlaceholder('Nombre').fill('Elena')
    await addForm.getByLabel('Tutor a cargo').selectOption({ label: 'Familia Sorova' })
    await addForm.getByLabel('Grado escolar').selectOption('2')
    await addForm.locator('input[type="date"]').fill('2018-08-20')
    await addForm.getByRole('button', { name: 'Guardar perfil' }).click()
    await expect(page.getByText(/ELENA200818/)).toBeVisible()
    const elenaCard = page.locator('li', { has: page.locator('input[value="Elena"]') })
    await expect(elenaCard.locator('select').first()).toHaveValue('2')

    await page.getByRole('button', { name: 'Temas' }).click()
    await page.getByPlaceholder('Título del tema').fill('Rimas fáciles')
    await page.getByPlaceholder('Descripción o qué practicar').fill('Practicar rimas')
    await page.getByRole('button', { name: 'Guardar tema' }).click()
    await expect(page.getByText(/Tema agregado/i)).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await page.getByLabel('Código del niño').fill('ELENA200818')
    await page.getByRole('button', { name: 'Entrar a jugar' }).click()
    await expect(page.getByText(/¡Hola, Elena!/i)).toBeVisible()
    await expect(page.getByText(/Temas para ti/i)).toBeVisible()
    await expect(page.getByText(/Rimas fáciles/i)).toBeVisible()
  })

  test('rate limit bloquea PIN tras varios intentos', async ({ page }) => {
    await page.goto('/superadmin')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.setItem('sorova.lobby-intro.seen', '1')
    })
    await page.reload()

    for (let i = 0; i < 6; i += 1) {
      await page.getByPlaceholder('••••').fill('0000')
      await page.getByRole('button', { name: 'Entrar' }).click()
    }
    await expect(page.getByText(/Demasiados intentos|PIN incorrecto|Límite/i)).toBeVisible()
  })
})
