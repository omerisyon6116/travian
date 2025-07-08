// Entertainment User Behavior Script
// Simulates entertainment and leisure browsing

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting entertainment browsing simulation');
    
    // Navigate to entertainment platform
    const entertainmentSites = [
        'https://www.youtube.com',
        'https://www.twitch.tv',
        'https://www.imdb.com'
    ];
    
    const randomSite = entertainmentSites[Math.floor(Math.random() * entertainmentSites.length)];
    await page.goto(randomSite, { waitUntil: 'networkidle2' });
    
    // Handle consent/cookie banners
    try {
        await page.waitForSelector('button[aria-label*="accept"], button[id*="accept"], .consent-accept', { timeout: 3000 });
        await page.click('button[aria-label*="accept"], button[id*="accept"], .consent-accept');
        await delay(1000);
    } catch (e) {
        // No consent banner
    }
    
    if (randomSite.includes('youtube')) {
        // YouTube browsing behavior
        await delay(2000);
        
        // Search for entertainment content
        const searchTerms = ['funny videos', 'music', 'gaming', 'movies', 'tutorials'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        try {
            await page.type('input[id="search"]', randomTerm, { delay: 100 });
            await page.keyboard.press('Enter');
            await delay(3000 + Math.random() * 2000);
            
            // Click on a video
            const videos = await page.$$('a[id="video-title"]');
            if (videos.length > 0) {
                const randomVideo = videos[Math.floor(Math.random() * Math.min(videos.length, 5))];
                await randomVideo.click();
                await delay(10000 + Math.random() * 15000); // Watch for a while
                
                // Scroll down to see comments
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight * 1.5);
                });
                await delay(3000);
                
                // Go back to search
                await page.goBack();
                await delay(2000);
            }
        } catch (e) {
            logger.warn('Could not search YouTube');
        }
        
    } else if (randomSite.includes('twitch')) {
        // Twitch browsing behavior
        await delay(3000);
        
        // Browse categories
        try {
            await page.click('a[href="/directory/game"]');
            await delay(3000);
            
            // Click on a game category
            const categories = await page.$$('a[data-a-target="tw-box-art-card-link"]');
            if (categories.length > 0) {
                const randomCategory = categories[Math.floor(Math.random() * Math.min(categories.length, 5))];
                await randomCategory.click();
                await delay(4000);
                
                // Click on a stream
                const streams = await page.$$('a[data-a-target="preview-card-image-link"]');
                if (streams.length > 0) {
                    const randomStream = streams[Math.floor(Math.random() * Math.min(streams.length, 3))];
                    await randomStream.click();
                    await delay(8000 + Math.random() * 12000); // Watch stream briefly
                }
            }
        } catch (e) {
            logger.warn('Could not browse Twitch categories');
        }
        
    } else if (randomSite.includes('imdb')) {
        // IMDB browsing behavior
        await delay(2000);
        
        // Search for movies/shows
        const searchTerms = ['action movies', 'comedy', 'thriller', 'sci-fi', 'drama'];
        const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        
        try {
            await page.type('input[id="suggestion-search"]', randomTerm, { delay: 100 });
            await page.keyboard.press('Enter');
            await delay(3000);
            
            // Click on a movie/show
            const results = await page.$$('.findResult .result_text a');
            if (results.length > 0) {
                const randomResult = results[Math.floor(Math.random() * Math.min(results.length, 5))];
                await randomResult.click();
                await delay(4000 + Math.random() * 3000);
                
                // Scroll through movie details
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await delay(2000);
                
                // Check cast or reviews
                try {
                    await page.click('a[href*="/cast"], a[href*="/reviews"]');
                    await delay(3000);
                    
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight);
                    });
                    await delay(2000);
                } catch (e) {
                    // Links not found
                }
            }
        } catch (e) {
            logger.warn('Could not search IMDB');
        }
    }
    
    // Simulate some idle time (like watching content)
    await delay(5000 + Math.random() * 10000);
    
    logger.info('Entertainment browsing simulation completed');
    
} catch (error) {
    logger.error('Error in entertainment script:', error.message);
    throw error;
}
