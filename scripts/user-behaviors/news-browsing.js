// News Browsing User Behavior Script
// Simulates news consumption patterns

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting news browsing simulation');
    
    // Navigate to a news website
    const newsWebsites = [
        'https://www.bbc.com/news',
        'https://www.reuters.com',
        'https://www.cnn.com',
        'https://www.npr.org'
    ];
    
    const randomSite = newsWebsites[Math.floor(Math.random() * newsWebsites.length)];
    await page.goto(randomSite, { waitUntil: 'networkidle2' });
    
    // Handle any cookie banners
    try {
        await page.waitForSelector('button[id*="accept"], button[id*="consent"], .consent-accept', { timeout: 3000 });
        await page.click('button[id*="accept"], button[id*="consent"], .consent-accept');
        await delay(1000);
    } catch (e) {
        // No cookie banner
    }
    
    // Scroll to see more headlines
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 0.5);
    });
    await delay(2000 + Math.random() * 1000);
    
    // Click on a headline
    try {
        const headlines = await page.$$('a[href*="/article"], a[href*="/news"], article a, .headline a');
        if (headlines.length > 0) {
            const randomHeadline = headlines[Math.floor(Math.random() * Math.min(headlines.length, 10))];
            await randomHeadline.click();
            await delay(5000 + Math.random() * 5000); // Read article
            
            // Scroll through article
            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight * 0.8);
                });
                await delay(2000 + Math.random() * 2000);
            }
            
            // Go back to main page
            await page.goBack();
            await delay(2000);
        }
    } catch (e) {
        logger.warn('Could not click on headline');
    }
    
    // Browse different sections
    try {
        const sections = await page.$$('nav a, .navigation a, [role="navigation"] a');
        if (sections.length > 0) {
            const randomSection = sections[Math.floor(Math.random() * Math.min(sections.length, 5))];
            await randomSection.click();
            await delay(3000 + Math.random() * 2000);
            
            // Browse this section
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await delay(2000);
        }
    } catch (e) {
        logger.warn('Could not navigate to section');
    }
    
    // Search for specific news topic
    const newsTopics = ['politics', 'technology', 'business', 'health', 'sports'];
    const randomTopic = newsTopics[Math.floor(Math.random() * newsTopics.length)];
    
    try {
        await page.type('input[type="search"], input[name="q"], input[placeholder*="search"]', randomTopic, { delay: 100 });
        await page.keyboard.press('Enter');
        await delay(3000 + Math.random() * 2000);
        
        // Browse search results
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await delay(2000);
    } catch (e) {
        logger.warn('Search functionality not available');
    }
    
    logger.info('News browsing simulation completed');
    
} catch (error) {
    logger.error('Error in news browsing script:', error.message);
    throw error;
}
