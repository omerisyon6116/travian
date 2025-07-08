// E-commerce User Behavior Script
// Simulates online shopping patterns

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting e-commerce browsing simulation');
    
    // Navigate to an e-commerce site
    await page.goto('https://www.amazon.com', { waitUntil: 'networkidle2' });
    
    // Accept cookies if prompted
    try {
        await page.waitForSelector('#sp-cc-accept', { timeout: 3000 });
        await page.click('#sp-cc-accept');
        await delay(1000);
    } catch (e) {
        // No cookie banner
    }
    
    // Search for a product
    const searchTerms = ['laptop', 'headphones', 'books', 'phone case', 'kitchen utensils'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    await page.type('#twotabsearchtextbox', randomTerm, { delay: 100 });
    await page.click('#nav-search-submit-button');
    await delay(3000 + Math.random() * 2000);
    
    // Browse search results
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
    });
    await delay(2000);
    
    // Click on a product
    try {
        const products = await page.$$('[data-component-type="s-search-result"] h2 a');
        if (products.length > 0) {
            const randomProduct = products[Math.floor(Math.random() * Math.min(products.length, 5))];
            await randomProduct.click();
            await delay(4000 + Math.random() * 3000);
            
            // Scroll through product details
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 1.5);
            });
            await delay(2000 + Math.random() * 2000);
            
            // Look at reviews
            try {
                await page.click('[data-hook="see-all-reviews-link-foot"]');
                await delay(3000 + Math.random() * 2000);
                
                // Scroll through reviews
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await delay(2000);
                
                // Go back to product
                await page.goBack();
                await delay(2000);
            } catch (e) {
                logger.warn('Could not access reviews');
            }
        }
    } catch (e) {
        logger.warn('Could not click on product');
    }
    
    // Simulate cart interaction (without actually adding)
    try {
        // Just hover over the cart button to simulate interest
        await page.hover('#add-to-cart-button');
        await delay(1000);
    } catch (e) {
        // Button not found
    }
    
    // Go back to search or home
    await page.goBack();
    await delay(2000);
    
    logger.info('E-commerce browsing simulation completed');
    
} catch (error) {
    logger.error('Error in e-commerce script:', error.message);
    throw error;
}
