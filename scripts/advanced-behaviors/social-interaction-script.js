// Sosyal Medya Etkileşim Scripti
// Like, yorum, paylaşım simülasyonu

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting social interaction script');
    
    // Sosyal medya siteleri
    const socialSites = [
        { 
            url: 'https://www.reddit.com/r/programming',
            name: 'Reddit Programming',
            actions: ['upvote', 'comment', 'scroll']
        },
        { 
            url: 'https://www.reddit.com/r/technology',
            name: 'Reddit Technology',
            actions: ['upvote', 'scroll']
        }
    ];
    
    const randomSite = socialSites[Math.floor(Math.random() * socialSites.length)];
    logger.info(`Visiting ${randomSite.name}`);
    
    await page.goto(randomSite.url, { waitUntil: 'networkidle2' });
    
    // Cookie/GDPR kabul et
    try {
        await page.waitForSelector('button:contains("Accept"), button:contains("I Accept"), [data-testid="cookie-banner"] button', { timeout: 3000 });
        const acceptButton = await page.$('button:contains("Accept"), button:contains("I Accept"), [data-testid="cookie-banner"] button');
        if (acceptButton) {
            await acceptButton.click();
            logger.info('Cookies kabul edildi');
            await delay(1000);
        }
    } catch (e) {
        logger.info('Cookie banner bulunamadı');
    }
    
    if (randomSite.url.includes('reddit')) {
        await simulateRedditInteraction();
    }
    
    async function simulateRedditInteraction() {
        logger.info('Reddit etkileşimi başlatılıyor');
        
        // Sayfada scroll yap ve postları gör
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 0.8);
            });
            await delay(2000 + Math.random() * 2000);
        }
        
        // Post'ları bul
        const posts = await page.$$('[data-testid="post-container"], .Post, article, [data-click-id="body"]');
        logger.info(`${posts.length} post bulundu`);
        
        // Rastgele 2-3 post ile etkileşim
        const postsToInteract = Math.min(posts.length, Math.floor(Math.random() * 3) + 2);
        
        for (let i = 0; i < postsToInteract; i++) {
            try {
                const randomPost = posts[Math.floor(Math.random() * posts.length)];
                
                // Post'u görünür hale getir
                await randomPost.scrollIntoView();
                await delay(1000);
                
                // Upvote butonunu bul ve tıkla
                try {
                    const upvoteButton = await randomPost.$('[aria-label*="upvote"], [aria-label*="Upvote"], .upvote, [data-testid="upvote-button"]');
                    if (upvoteButton && Math.random() > 0.3) { // %70 şansla upvote
                        await upvoteButton.click();
                        logger.info('Post upvote edildi');
                        await delay(500 + Math.random() * 1000);
                    }
                } catch (upvoteError) {
                    logger.debug('Upvote butonu bulunamadı');
                }
                
                // Comments kısmına bak
                try {
                    const commentsButton = await randomPost.$('[aria-label*="comment"], [aria-label*="Comment"], .comments, [data-testid="comments-button"]');
                    if (commentsButton && Math.random() > 0.7) { // %30 şansla comments'e git
                        await commentsButton.click();
                        logger.info('Comments açıldı');
                        await delay(3000 + Math.random() * 4000);
                        
                        // Comments'te scroll yap
                        for (let j = 0; j < 3; j++) {
                            await page.evaluate(() => {
                                window.scrollBy(0, window.innerHeight * 0.6);
                            });
                            await delay(1500);
                        }
                        
                        // Geri dön
                        await page.goBack();
                        await delay(2000);
                    }
                } catch (commentsError) {
                    logger.debug('Comments butonu bulunamadı');
                }
                
                await delay(1000 + Math.random() * 2000);
                
            } catch (postError) {
                logger.warn(`Post etkileşimi hatası: ${postError.message}`);
            }
        }
        
        // Subreddit değiştir
        try {
            const subredditLinks = await page.$$('a[href*="/r/"]');
            if (subredditLinks.length > 0 && Math.random() > 0.5) {
                const randomSubreddit = subredditLinks[Math.floor(Math.random() * Math.min(subredditLinks.length, 5))];
                const subredditName = await randomSubreddit.evaluate(el => el.textContent);
                
                if (subredditName && !subredditName.includes('NSFW')) {
                    logger.info(`Yeni subreddit'e geçiliyor: ${subredditName}`);
                    await randomSubreddit.click();
                    await delay(4000 + Math.random() * 3000);
                    
                    // Yeni sayfada biraz scroll yap
                    for (let i = 0; i < 3; i++) {
                        await page.evaluate(() => {
                            window.scrollBy(0, window.innerHeight * 0.7);
                        });
                        await delay(2000);
                    }
                }
            }
        } catch (subredditError) {
            logger.debug('Subreddit değiştirme hatası');
        }
        
        // Search fonksiyonu dene
        try {
            const searchBox = await page.$('input[name="q"], input[type="search"], [data-testid="search-input"]');
            if (searchBox && Math.random() > 0.6) {
                const searchTerms = ['javascript', 'python', 'web development', 'programming', 'technology'];
                const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
                
                await searchBox.click();
                await searchBox.type(randomTerm, { delay: 150 });
                await page.keyboard.press('Enter');
                logger.info(`Arama yapıldı: ${randomTerm}`);
                await delay(3000 + Math.random() * 3000);
                
                // Search sonuçlarında scroll
                for (let i = 0; i < 2; i++) {
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight);
                    });
                    await delay(2000);
                }
            }
        } catch (searchError) {
            logger.debug('Search işlemi hatası');
        }
    }
    
    // Genel sosyal medya davranışları
    await simulateGeneralSocialBehavior();
    
    async function simulateGeneralSocialBehavior() {
        logger.info('Genel sosyal medya davranışları simüle ediliyor');
        
        // Profil simülasyonu
        try {
            const profileLinks = await page.$$('a[href*="/user/"], a[href*="/profile/"], .profile-link');
            if (profileLinks.length > 0 && Math.random() > 0.8) {
                const randomProfile = profileLinks[Math.floor(Math.random() * Math.min(profileLinks.length, 3))];
                await randomProfile.click();
                logger.info('Profil ziyaret edildi');
                await delay(5000 + Math.random() * 5000);
                
                // Profile sayfasında scroll
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight * 2);
                });
                await delay(3000);
                
                await page.goBack();
                await delay(2000);
            }
        } catch (profileError) {
            logger.debug('Profil ziyareti hatası');
        }
        
        // Menu navigasyon
        try {
            const menuItems = await page.$$('nav a, .menu a, [role="navigation"] a');
            if (menuItems.length > 0 && Math.random() > 0.7) {
                const randomMenu = menuItems[Math.floor(Math.random() * Math.min(menuItems.length, 5))];
                const menuText = await randomMenu.evaluate(el => el.textContent);
                
                if (menuText && !menuText.toLowerCase().includes('logout') && 
                    !menuText.toLowerCase().includes('settings') &&
                    menuText.length < 50) {
                    
                    logger.info(`Menu item tıklandı: ${menuText}`);
                    await randomMenu.click();
                    await delay(3000 + Math.random() * 3000);
                    
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight);
                    });
                    await delay(2000);
                }
            }
        } catch (menuError) {
            logger.debug('Menu navigasyon hatası');
        }
        
        // Trending/Popular content kontrol
        try {
            const trendingLinks = await page.$$('a:contains("Trending"), a:contains("Popular"), a:contains("Hot"), .trending, .popular');
            if (trendingLinks.length > 0 && Math.random() > 0.6) {
                const randomTrending = trendingLinks[Math.floor(Math.random() * trendingLinks.length)];
                await randomTrending.click();
                logger.info('Trending content kontrol edildi');
                await delay(4000 + Math.random() * 4000);
                
                for (let i = 0; i < 4; i++) {
                    await page.evaluate(() => {
                        window.scrollBy(0, window.innerHeight * 0.8);
                    });
                    await delay(1500);
                }
            }
        } catch (trendingError) {
            logger.debug('Trending content hatası');
        }
        
        // Son scroll ve idle time
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 0.5);
            });
            await delay(2000 + Math.random() * 2000);
        }
        
        // Idle time - sosyal medyada takılma simülasyonu
        await delay(5000 + Math.random() * 10000);
    }
    
    logger.info('Social interaction script completed');
    
} catch (error) {
    logger.error('Error in social interaction script:', error.message);
    throw error;
}