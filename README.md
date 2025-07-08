# Multi-Bot Automation System

Docker Compose ile OpenVPN bağlantılı çoklu container'da Puppeteer bot simülasyon sistemi. Her bot kendi VPN bağlantısı ile farklı kullanıcı davranışlarını simüle eder.

## Özellikler

- **5 Farklı Bot Tipi**: Her biri farklı kullanıcı davranışı simüle eder
- **OpenVPN Entegrasyonu**: Her bot farklı VPN sunucusu üzerinden bağlanır
- **Headless Browser Automation**: Puppeteer ile gerçekçi web etkileşimi
- **Docker Container İzolasyonu**: Her bot ayrı container'da çalışır
- **Web Dashboard**: Gerçek zamanlı bot izleme ve kontrol
- **Tampermonkey Benzeri Scriptler**: Özelleştirilebilir davranış scriptleri

## Bot Tipleri

1. **Social Media Explorer** (bot-001) - Sosyal medya gezinme
2. **E-commerce Shopper** (bot-002) - Online alışveriş simülasyonu
3. **News Reader** (bot-003) - Haber sitelerinde gezinme
4. **Research Assistant** (bot-004) - Araştırma ve akademik gezinme
5. **Entertainment Seeker** (bot-005) - Eğlence platformları

## Kurulum

### Gereksinimler

- Docker & Docker Compose
- OpenVPN config dosyaları (.ovpn)
- VPN giriş bilgileri

### Adım 1: Proje Klonlama

```bash
git clone <repository-url>
cd multi-bot-automation-system
```

### Adım 2: VPN Konfigürasyonu

1. `configs/vpn/` klasörüne OpenVPN config dosyalarınızı koyun:
   - `config-001.ovpn`
   - `config-002.ovpn` 
   - `config-003.ovpn`

2. VPN giriş bilgilerinizi ekleyin:
   ```bash
   # configs/vpn/auth-001.txt
   your_vpn_username
   your_vpn_password
   
   # configs/vpn/auth-002.txt
   your_vpn_username
   your_vpn_password
   
   # configs/vpn/auth-003.txt
   your_vpn_username
   your_vpn_password
   ```

### Adım 3: Docker Build

```bash
docker-compose build
```

### Adım 4: Sistem Başlatma

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları takip et
docker-compose logs -f

# Sadece dashboard'u başlat
docker-compose up -d dashboard

# Belirli bir bot'u başlat
docker-compose up -d bot-001
```

### Adım 5: Dashboard Erişimi

Dashboard: http://localhost:5000

## Kullanım

### Dashboard Özellikleri

- **System Overview**: Bot durumu ve istatistikleri
- **Bot Cards**: Her bot için detaylı bilgiler
- **Real-time Monitoring**: 5 saniyede bir güncellenen durumlar
- **Individual Control**: Her bot için start/stop/info butonları
- **Log Viewing**: Container loglarını görüntüleme

### Bot Kontrolü

```bash
# Tüm botları başlat
docker-compose start

# Tüm botları durdur
docker-compose stop

# Belirli bot başlat/durdur
docker-compose start bot-001
docker-compose stop bot-001

# Container durumunu kontrol et
docker-compose ps

# Belirli bot loglarını görüntüle
docker-compose logs bot-001

# Tüm logları temizle ve yeniden başlat
docker-compose down
docker-compose up -d
```

### VPN Bağlantı Kontrolü

```bash
# Bot container'ına bağlan
docker exec -it social-media-bot bash

# VPN durumunu kontrol et
ps aux | grep openvpn

# Public IP kontrol et
curl ipinfo.io/ip

# VPN loglarını kontrol et
cat /tmp/openvpn.log
```

## Konfigürasyon

### Bot Ayarları

`configs/bot-configs.json` dosyasından bot ayarlarını değiştirebilirsiniz:

```json
{
  "id": "bot-001",
  "name": "Social Media Explorer",
  "scriptDelay": 45000,
  "viewport": { "width": 1366, "height": 768 },
  "scripts": [
    { "name": "social-media", "file": "user-behaviors/social-media.js", "weight": 3 }
  ]
}
```

### Script Ekleme

Yeni davranış scriptleri `scripts/user-behaviors/` klasörüne ekleyin:

```javascript
// scripts/user-behaviors/my-custom-script.js
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

try {
    logger.info('Starting custom behavior script');
    
    // Web sitesine git
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    // Özel davranışları ekle
    await page.click('button');
    await delay(2000);
    
    logger.info('Custom behavior script completed');
    
} catch (error) {
    logger.error('Error in custom script:', error.message);
    throw error;
}
```

### VPN Sunucu Ekleme

Yeni VPN sunucuları eklemek için:

1. `configs/vpn/config-004.ovpn` ekleyin
2. `configs/vpn/auth-004.txt` oluşturun
3. `docker-compose.yml`'de yeni bot servisi tanımlayın
4. `configs/bot-configs.json`'a yeni bot konfigürasyonu ekleyin

## Güvenlik

### Container İzolasyonu

- Her bot ayrı container'da çalışır
- VPN bağlantıları izole edilmiştir
- Network trafiği container ağı üzerinden yönlendirilir

### VPN Güvenliği

- Her bot farklı VPN endpoint kullanır
- Kimlik bilgileri container environment'ından okunur
- OpenVPN logları container içinde tutulur

### User Agent Rotasyonu

- Her bot farklı user agent kullanır
- Viewport boyutları çeşitlendirilmiştir
- Request timing'leri randomize edilmiştir

## Sorun Giderme

### VPN Bağlantı Sorunları

```bash
# VPN config dosyasını kontrol et
cat configs/vpn/config-001.ovpn

# Auth dosyasını kontrol et
cat configs/vpn/auth-001.txt

# Container VPN loglarını kontrol et
docker exec social-media-bot cat /tmp/openvpn.log

# Network bağlantısını test et
docker exec social-media-bot ping 8.8.8.8
```

### Container Sorunları

```bash
# Container durumunu kontrol et
docker-compose ps

# Container kaynaklarını kontrol et
docker stats

# Container loglarını detaylı incele
docker-compose logs --tail=100 bot-001

# Container'ı yeniden başlat
docker-compose restart bot-001
```

### Browser/Puppeteer Sorunları

```bash
# Chrome dependencies kontrol et
docker exec social-media-bot dpkg -l | grep chrome

# Puppeteer cache temizle
docker exec social-media-bot rm -rf /home/botuser/.cache/puppeteer

# Browser process'lerini kontrol et
docker exec social-media-bot ps aux | grep chrome
```

## Loglama

### Log Dosyaları

- Container logları: `docker-compose logs`
- VPN logları: `/tmp/openvpn.log` (container içinde)
- Uygulama logları: `logs/` klasörü (volume mount)

### Log Seviyeleri

- **INFO**: Normal operasyonlar
- **WARN**: Uyarılar ve geçici hatalar
- **ERROR**: Kritik hatalar
- **DEBUG**: Detaylı debug bilgileri

## Performans

### Kaynak Kullanımı

- Her bot container'ı ~200-500MB RAM kullanır
- CPU kullanımı browser aktivitesine bağlıdır
- Network kullanımı VPN ve web trafiği içerir

### Ölçeklendirme

```bash
# Daha fazla bot eklemek için docker-compose.yml'i düzenleyin
# Sistem kaynaklarınıza göre bot sayısını ayarlayın

# Docker sistem kaynaklarını kontrol et
docker system df
docker system prune  # Kullanılmayan kaynakları temizle
```

## API Referansı

### Dashboard API Endpoints

- `GET /api/status` - Sistem durumu
- `POST /api/start-bot/:id` - Bot başlat
- `POST /api/stop-bot/:id` - Bot durdur
- `POST /api/start-all` - Tüm botları başlat
- `POST /api/stop-all` - Tüm botları durdur
- `GET /api/logs/:botId` - Bot logları

### Environment Variables

- `BOT_ID`: Bot kimliği
- `BOT_NAME`: Bot adı
- `VPN_CONFIG`: VPN config dosyası yolu
- `VPN_AUTH_FILE`: VPN auth dosyası yolu
- `SCRIPT_DELAY`: Script'ler arası bekleme süresi (ms)

## Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Destek

Sorunlar için GitHub Issues kullanın veya dokümantasyonu kontrol edin.