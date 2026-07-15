import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        # Load local HTML file
        import os
        file_path = f"file://{os.path.abspath('mockup.html')}"
        await page.goto(file_path)

        # Capture full mockup
        await page.screenshot(path="screenshots/design_after_mockup_2026-07-01/mockup_full.png", full_page=True)

        # Capture mobile mockup
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.screenshot(path="screenshots/design_after_mockup_2026-07-01/mockup_mobile.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
