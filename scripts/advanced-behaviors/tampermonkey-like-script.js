// Tampermonkey Benzeri Gelişmiş Script
// Form doldurma, tıklama, bekleme ve çerez yönetimi

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting advanced Tampermonkey-like behavior script');
    
    // Rastgele site seç
    const targetSites = [
        'https://httpbin.org/forms/post',
        'https://duckduckgo.com',
        'https://example.com'
    ];
    
    const randomSite = targetSites[Math.floor(Math.random() * targetSites.length)];
    await page.goto(randomSite, { waitUntil: 'networkidle2' });
    
    // Çerezleri kabul et (eğer banner varsa)
    try {
        const cookieSelectors = [
            'button[id*="accept"]',
            'button[id*="consent"]',
            '[data-testid="cookie-accept"]',
            '.cookie-accept',
            '#cookie-accept',
            'button:contains("Accept")',
            'button:contains("Kabul")'
        ];
        
        for (const selector of cookieSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 2000 });
                await page.click(selector);
                logger.info('Cookie banner kabul edildi');
                await delay(1000);
                break;
            } catch (e) {
                // Bu selector bulunamadı, sonrakini dene
            }
        }
    } catch (e) {
        logger.info('Cookie banner bulunamadı');
    }
    
    // Sayfadaki tüm formları bul
    const forms = await page.$$('form');
    logger.info(`${forms.length} form bulundu`);
    
    for (let i = 0; i < Math.min(forms.length, 2); i++) {
        try {
            const form = forms[i];
            logger.info(`Form ${i + 1} işleniyor...`);
            
            // Form içindeki input alanlarını bul
            const inputs = await form.$$('input[type="text"], input[type="email"], input[type="search"], textarea');
            
            for (const input of inputs) {
                try {
                    // Input tipini kontrol et
                    const inputType = await input.evaluate(el => el.type);
                    const inputName = await input.evaluate(el => el.name || el.id || el.className);
                    
                    logger.info(`Input işleniyor: ${inputType} - ${inputName}`);
                    
                    // Input alanını temizle
                    await input.click({ clickCount: 3 });
                    await page.keyboard.press('Backspace');
                    
                    // Rastgele veri oluştur
                    let randomData = '';
                    if (inputType === 'email' || inputName.toLowerCase().includes('email')) {
                        randomData = `test${Math.floor(Math.random() * 1000)}@example.com`;
                    } else if (inputName.toLowerCase().includes('name') || inputName.toLowerCase().includes('isim')) {
                        const names = ['John Doe', 'Jane Smith', 'Ali Veli', 'Ayşe Fatma'];
                        randomData = names[Math.floor(Math.random() * names.length)];
                    } else if (inputName.toLowerCase().includes('search') || inputName.toLowerCase().includes('q')) {
                        const searchTerms = ['technology', 'programming', 'web development', 'javascript', 'automation'];
                        randomData = searchTerms[Math.floor(Math.random() * searchTerms.length)];
                    } else {
                        randomData = `test data ${Math.floor(Math.random() * 1000)}`;
                    }
                    
                    // Veriyi yavaşça yaz (insan gibi)
                    await input.type(randomData, { delay: 100 });
                    await delay(500 + Math.random() * 1000);
                    
                } catch (inputError) {
                    logger.warn(`Input işlenirken hata: ${inputError.message}`);
                }
            }
            
            // Checkbox'ları bul ve rastgele işaretle
            const checkboxes = await form.$$('input[type="checkbox"]');
            for (const checkbox of checkboxes) {
                try {
                    if (Math.random() > 0.5) { // %50 şansla işaretle
                        await checkbox.click();
                        await delay(300);
                    }
                } catch (checkboxError) {
                    logger.warn(`Checkbox işlenirken hata: ${checkboxError.message}`);
                }
            }
            
            // Radio button'ları bul ve rastgele seç
            const radioGroups = await form.$$('input[type="radio"]');
            const radioGroupNames = new Set();
            
            for (const radio of radioGroups) {
                try {
                    const name = await radio.evaluate(el => el.name);
                    if (name && !radioGroupNames.has(name)) {
                        radioGroupNames.add(name);
                        if (Math.random() > 0.5) { // %50 şansla seç
                            await radio.click();
                            await delay(300);
                        }
                    }
                } catch (radioError) {
                    logger.warn(`Radio button işlenirken hata: ${radioError.message}`);
                }
            }
            
            // Select (dropdown) elementleri bul
            const selects = await form.$$('select');
            for (const select of selects) {
                try {
                    const options = await select.$$('option');
                    if (options.length > 1) {
                        // İlk option (genelde boş) hariç rastgele seç
                        const randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
                        const optionValue = await options[randomIndex].evaluate(el => el.value);
                        await select.select(optionValue);
                        await delay(300);
                    }
                } catch (selectError) {
                    logger.warn(`Select işlenirken hata: ${selectError.message}`);
                }
            }
            
            await delay(1000 + Math.random() * 2000);
            
        } catch (formError) {
            logger.warn(`Form işlenirken hata: ${formError.message}`);
        }
    }
    
    // Sayfadaki butonları bul (submit hariç)
    const buttons = await page.$$('button:not([type="submit"]), input[type="button"]');
    logger.info(`${buttons.length} buton bulundu`);
    
    // Rastgele 1-2 butona tıkla
    const buttonsToClick = Math.min(buttons.length, Math.floor(Math.random() * 2) + 1);
    for (let i = 0; i < buttonsToClick; i++) {
        try {
            const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
            const buttonText = await randomButton.evaluate(el => el.textContent || el.value);
            
            // Tehlikeli butonları atla
            if (buttonText && !buttonText.toLowerCase().includes('delete') && 
                !buttonText.toLowerCase().includes('remove') && 
                !buttonText.toLowerCase().includes('sil')) {
                
                logger.info(`Butona tıklanıyor: ${buttonText}`);
                await randomButton.click();
                await delay(2000 + Math.random() * 3000);
            }
        } catch (buttonError) {
            logger.warn(`Buton tıklanırken hata: ${buttonError.message}`);
        }
    }
    
    // Sayfada scroll yap
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight * (Math.random() * 0.8 + 0.2));
        });
        await delay(1000 + Math.random() * 1500);
    }
    
    // Mouse hareketleri simüle et
    const viewport = await page.viewport();
    for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * viewport.width);
        const y = Math.floor(Math.random() * viewport.height);
        await page.mouse.move(x, y);
        await delay(200 + Math.random() * 300);
    }
    
    // Linkler arasında gezin
    const links = await page.$$('a[href]:not([href^="javascript:"])');
    if (links.length > 0) {
        try {
            const randomLink = links[Math.floor(Math.random() * Math.min(links.length, 5))];
            const linkText = await randomLink.evaluate(el => el.textContent);
            const linkHref = await randomLink.evaluate(el => el.href);
            
            // Güvenli linkler için kontrol
            if (linkHref && !linkHref.includes('logout') && !linkHref.includes('delete') && 
                linkHref.startsWith('http') && linkText && linkText.length < 100) {
                
                logger.info(`Link tıklanıyor: ${linkText}`);
                await randomLink.click();
                await delay(5000 + Math.random() * 5000);
                
                // Geri dön
                await page.goBack();
                await delay(2000);
            }
        } catch (linkError) {
            logger.warn(`Link tıklanırken hata: ${linkError.message}`);
        }
    }
    
    // Local Storage ve Session Storage ile oyna
    try {
        await page.evaluate(() => {
            // Test verisi ekle
            localStorage.setItem('test_key', 'test_value_' + Date.now());
            sessionStorage.setItem('session_test', 'session_value_' + Date.now());
        });
        logger.info('Local/Session storage test verileri eklendi');
    } catch (storageError) {
        logger.warn(`Storage işlemi hatası: ${storageError.message}`);
    }
    
    // Console'a mesaj gönder
    try {
        await page.evaluate(() => {
            console.log('Automated bot visit - ' + new Date().toISOString());
        });
    } catch (consoleError) {
        logger.warn(`Console işlemi hatası: ${consoleError.message}`);
    }
    
    // Son olarak random bir süre bekle
    await delay(3000 + Math.random() * 7000);
    
    logger.info('Advanced Tampermonkey-like behavior script completed');
    
} catch (error) {
    logger.error('Error in advanced script:', error.message);
    throw error;
}