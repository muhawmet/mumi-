const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        console.log('Navigating to http://localhost:3001...');
        await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });

        console.log('Attempting to set sceneCount to 100...');
        await page.evaluate(() => {
            // Try to set value on an input with id sceneCount or similar
            const inputs = Array.from(document.querySelectorAll('input'));
            const sceneInput = document.getElementById('sceneCount') || inputs.find(i => (i.name || '').includes('sceneCount'));
            if (sceneInput) {
                sceneInput.value = '100';
                sceneInput.dispatchEvent(new Event('input', { bubbles: true }));
                sceneInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }).catch(e => console.log('Could not set sceneCount in DOM.', e.message));

        console.log('Rapidly clicking #btn-batch-generate 50 times...');
        
        let successCount = 0;
        let failCount = 0;
        const startTime = Date.now();
        
        for (let i = 0; i < 50; i++) {
            try {
                await page.evaluate(() => {
                    const btn = document.getElementById('btn-batch-generate') || document.querySelector('[data-testid="btn-batch-generate"]');
                    if (btn) btn.click();
                    else throw new Error('Button btn-batch-generate not found');
                });
                successCount++;
            } catch (e) {
                failCount++;
                console.error(`Click ${i} failed: ${e.message}`);
            }
            await new Promise(r => setTimeout(r, 10)); // tiny pause to allow event loop
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('Checking responsiveness...');
        await new Promise(r => setTimeout(r, 2000)); // wait a bit to see if page locks up
        
        let isResponsive = false;
        try {
            const res = await page.evaluate(() => 42);
            isResponsive = res === 42;
        } catch (e) {
            isResponsive = false;
        }
        
        console.log('\n--- STRESS TEST REPORT ---');
        console.log(`Total Duration for 50 rapid clicks: ${duration} ms`);
        console.log(`Successful Clicks: ${successCount}`);
        console.log(`Failed Clicks: ${failCount}`);
        console.log(`Browser Responsive at end: ${isResponsive}`);
        
        if (!isResponsive) {
            console.log('RESULT: The page crashed or became unresponsive.');
        } else {
            console.log('RESULT: The page remained responsive.');
        }
    } catch (err) {
        console.error('\nError during stress test:', err.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
