// Social Media User Behavior Script
// Simulates typical social media browsing patterns

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting social media browsing simulation');
    
    // Navigate to a social media platform
    await page.goto('https://www.reddit.com', { waitUntil: 'networkidle2' });
    
    // Simulate reading posts
    await delay(2000 + Math.random() * 3000);
    
    // Scroll down to see more content
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight * 0.8);
        });
        await delay(1500 + Math.random() * 2000);
    }
    
    // Click on a random post
    const posts = await page.$$('article, .Post, [data-testid="post-content"]');
    if (posts.length > 0) {
        const randomPost = posts[Math.floor(Math.random() * Math.min(posts.length, 5))];
        await randomPost.click();
        await delay(3000 + Math.random() * 4000);
        
        // Go back
        await page.goBack();
        await delay(2000);
    }
    
    // Search for something
    const searchTerms = ['technology', 'news', 'funny', 'science', 'programming'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    try {
        await page.type('input[type="search"], input[name="q"]', randomTerm, { delay: 100 });
        await page.keyboard.press('Enter');
        await delay(3000 + Math.random() * 2000);
    } catch (e) {
        logger.warn('Search functionality not available');
    }
    
    // Simulate some more browsing
    await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 2);
    });
    await delay(2000 + Math.random() * 3000);
    
    logger.info('Social media browsing simulation completed');
    
} catch (error) {
    logger.error('Error in social media script:', error.message);
    throw error;
}
