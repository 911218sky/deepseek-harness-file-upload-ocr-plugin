/**
 * E2E: upload image via OCR plugin and assert attachment rail is visible.
 * Usage: DSH_WEB_URL='http://127.0.0.1:3080/?token=...' node scripts/verify-browser-upload.mjs
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = process.env.DSH_WEB_URL ?? process.env.DSH_WEB_BASE
if (!baseUrl) {
  console.error('Set DSH_WEB_URL (full URL with ?token=...)')
  process.exit(2)
}

const imagePath = process.env.OCR_TEST_IMAGE ?? '/tmp/ocr-test.png'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120_000 })

  const workspace = page.getByRole('menuitem', { name: 'test', exact: true })
  if (await workspace.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await page.getByRole('button', { name: 'Choose workspace' }).click()
    await workspace.click()
  }

  await page.getByRole('button', { name: /添加文件|Add file/i }).waitFor({ timeout: 30_000 })
  const fileInput = page.locator('input[type=file]').first()
  await fileInput.setInputFiles(imagePath)

  await page.getByRole('button', { name: /本機 OCR|OCR 轉文字/i }).click()

  const rail = page.locator('[data-ocr-rail="1"]')
  await rail.waitFor({ state: 'visible', timeout: 5_000 })
  const pendingText = rail.locator('text=/OCR|辨識|ocr-test\\.png/i')
  await pendingText.first().waitFor({ state: 'visible', timeout: 3_000 })

  await page.waitForFunction(() => {
    const rail = document.querySelector('[data-ocr-rail="1"]')
    if (!rail) return false
    const text = rail.textContent ?? ''
    return text.includes('image') || text.includes('KB') || text.includes('OCR')
  }, { timeout: 60_000 })

  const railText = await rail.innerText()
  assert.match(railText, /ocr-test\.png/i, 'filename on card')
  assert.doesNotMatch(railText, /truncated|不完整/i, 'no OCR error on success path')

  await browser.close()
  console.log('browser-upload-ui-ok')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
