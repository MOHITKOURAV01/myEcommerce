const { chromium } = require('playwright');
(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push('CONSOLE ERROR: ' + msg.text());
                console.log('CONSOLE ERROR: ' + msg.text());
            }
        });
        page.on('pageerror', error => {
            errors.push('PAGE ERROR: ' + error.message);
            console.log('PAGE ERROR: ' + error.message);
        });

        await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle' });
        
        if (errors.length === 0) {
            console.log("NO ERRORS DETECTED");
        }
        await browser.close();
    } catch (e) {
        console.log("Script failed:", e);
    }
})();
