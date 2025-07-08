#!/bin/bash

# Multi-Bot Automation System - Kurulum ve Başlatma Scripti
# Bu script PC'nizde sistemi kolayca kurmanıza ve çalıştırmanıza yardımcı olur

echo "======================================"
echo "Multi-Bot Automation System Kurulumu"
echo "======================================"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonksiyonlar
print_step() {
    echo -e "${BLUE}>>> $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Docker ve Docker Compose kontrolü
check_requirements() {
    print_step "Gereksinimler kontrol ediliyor..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker yüklü değil. Lütfen Docker'ı yükleyin: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker bulundu"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose yüklü değil. Lütfen Docker Compose'u yükleyin"
        exit 1
    fi
    print_success "Docker Compose bulundu"
    
    # Docker daemon kontrolü
    if ! docker ps &> /dev/null; then
        print_error "Docker daemon çalışmıyor. Lütfen Docker'ı başlatın"
        exit 1
    fi
    print_success "Docker daemon çalışıyor"
}

# VPN konfigürasyon kontrolü
check_vpn_config() {
    print_step "VPN konfigürasyonu kontrol ediliyor..."
    
    vpn_configs=("config-001.ovpn" "config-002.ovpn" "config-003.ovpn")
    auth_files=("auth-001.txt" "auth-002.txt" "auth-003.txt")
    
    missing_files=0
    
    for config in "${vpn_configs[@]}"; do
        if [ ! -f "configs/vpn/$config" ]; then
            print_warning "VPN config dosyası bulunamadı: configs/vpn/$config"
            missing_files=$((missing_files + 1))
        fi
    done
    
    for auth in "${auth_files[@]}"; do
        if [ ! -f "configs/vpn/$auth" ]; then
            print_warning "VPN auth dosyası bulunamadı: configs/vpn/$auth"
            missing_files=$((missing_files + 1))
        else
            # Auth dosyası içeriğini kontrol et
            if grep -q "your_vpn_username_here" "configs/vpn/$auth"; then
                print_warning "VPN auth dosyası güncellenmelidir: configs/vpn/$auth"
                missing_files=$((missing_files + 1))
            fi
        fi
    done
    
    if [ $missing_files -gt 0 ]; then
        print_error "VPN konfigürasyonu eksik veya hatalı!"
        echo ""
        echo "Lütfen aşağıdaki adımları takip edin:"
        echo "1. configs/vpn/ klasörüne OpenVPN config dosyalarınızı (.ovpn) kopyalayın"
        echo "2. configs/vpn/auth-*.txt dosyalarına VPN kullanıcı adı ve şifrenizi yazın"
        echo ""
        echo "Örnek auth dosyası içeriği:"
        echo "  your_vpn_username"
        echo "  your_vpn_password"
        echo ""
        read -p "VPN konfigürasyonunu tamamladıktan sonra ENTER'a basın..."
        check_vpn_config
    else
        print_success "VPN konfigürasyonu tamam"
    fi
}

# Docker image'leri build et
build_images() {
    print_step "Docker image'leri build ediliyor..."
    
    if docker-compose build; then
        print_success "Docker image'leri başarıyla build edildi"
    else
        print_error "Docker build başarısız!"
        exit 1
    fi
}

# Sistemi başlat
start_system() {
    print_step "Sistem başlatılıyor..."
    
    # Önce dashboard'u başlat
    if docker-compose up -d dashboard; then
        print_success "Dashboard başlatıldı"
    else
        print_error "Dashboard başlatılamadı!"
        exit 1
    fi
    
    # Dashboard'un hazır olmasını bekle
    echo "Dashboard'un hazır olması bekleniyor..."
    for i in {1..30}; do
        if curl -s http://localhost:5000/health &> /dev/null; then
            print_success "Dashboard hazır: http://localhost:5000"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Dashboard başlatma timeout!"
            exit 1
        fi
        
        sleep 2
        echo -n "."
    done
    echo ""
}

# Bot'ları başlat (opsiyonel)
start_bots() {
    echo ""
    read -p "Bot'ları şimdi başlatmak istiyor musunuz? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Bot'lar başlatılıyor..."
        
        bots=("bot-001" "bot-002" "bot-003" "bot-004" "bot-005")
        
        for bot in "${bots[@]}"; do
            echo "Başlatılıyor: $bot"
            if docker-compose up -d $bot; then
                print_success "$bot başlatıldı"
            else
                print_warning "$bot başlatılamadı"
            fi
        done
        
        print_success "Tüm bot'lar başlatıldı"
    else
        print_warning "Bot'lar başlatılmadı. Dashboard'dan manuel olarak başlatabilirsiniz."
    fi
}

# Sistem durumunu göster
show_status() {
    echo ""
    print_step "Sistem durumu:"
    
    echo ""
    echo "Çalışan servisler:"
    docker-compose ps
    
    echo ""
    echo "Dashboard: http://localhost:5000"
    echo "API Health: http://localhost:5000/health"
    
    echo ""
    echo "Yararlı komutlar:"
    echo "  docker-compose ps              # Servis durumları"
    echo "  docker-compose logs -f         # Tüm loglar"
    echo "  docker-compose logs bot-001    # Belirli bot logları"
    echo "  docker-compose stop            # Tüm servisleri durdur"
    echo "  docker-compose start           # Tüm servisleri başlat"
    echo "  docker-compose restart         # Tüm servisleri yeniden başlat"
    echo ""
}

# Ana fonksiyon
main() {
    check_requirements
    check_vpn_config
    build_images
    start_system
    start_bots
    show_status
    
    print_success "Kurulum tamamlandı!"
    print_step "Dashboard'a erişim: http://localhost:5000"
}

# Script'i çalıştır
main "$@"