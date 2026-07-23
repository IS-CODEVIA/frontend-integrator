#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────
#  deploy.sh — deploy frontend-integrator to AWS EC2
# ──────────────────────────────────────────────────────────────
# Modos de uso:
#
#   En la instancia EC2 (recién creada):
#     curl -fsSL <url-raw>/deploy.sh | bash
#     # o si ya clonaste el repo:
#     ./deploy.sh
#
#   Desde tu máquina local (requiere SSH key):
#     ./deploy.sh ec2-user@1.2.3.4
#
# ──────────────────────────────────────────────────────────────

REMOTE_USER_HOST="${1:-}"

# ── Colores ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
err()   { echo -e "${RED}[ERR]${NC}   $*"; }

# ── Modo remoto: hace SSH y ejecuta el script allá ───────────
if [ -n "$REMOTE_USER_HOST" ]; then
    info "Modo remoto: conectando a ${REMOTE_USER_HOST} ..."
    ssh -o StrictHostKeyChecking=accept-new "$REMOTE_USER_HOST" \
        "bash -s" < "$0"
    ok "Deploy completado en ${REMOTE_USER_HOST}"
    exit 0
fi

# ──────────────────────────────────────────────────────────────
#  A partir de acá, corre dentro de la instancia EC2
# ──────────────────────────────────────────────────────────────
cd "$(dirname "$0")"

info "Iniciando deploy de frontend-integrator ..."

# ── 1. Detectar SO e instalar Docker ─────────────────────────
if ! command -v docker &>/dev/null; then
    info "Docker no encontrado. Instalando ..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            amzn|amazon)
                sudo yum install -y docker
                sudo systemctl enable --now docker
                sudo usermod -aG docker ec2-user
                newgrp docker
                ;;
            ubuntu|debian)
                sudo apt-get update -qq
                sudo apt-get install -y -qq ca-certificates curl
                sudo install -m 0755 -d /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/$ID/gpg \
                    | sudo tee /etc/apt/keyrings/docker.asc >/dev/null
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/$ID $VERSION_CODENAME stable" \
                    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
                sudo apt-get update -qq
                sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
                sudo usermod -aG docker "$USER"
                ;;
            *)
                err "SO no soportado para instalación automática: $ID"
                err "Instalá Docker manualmente y volvé a correr el script."
                exit 1
                ;;
        esac
    else
        err "No se pudo detectar el SO."
        exit 1
    fi
    ok "Docker instalado"
else
    ok "Docker ya instalado"
fi

# Asegurar que el usuario actual pueda usar docker
if ! docker ps &>/dev/null; then
    if command -v newgrp &>/dev/null; then
        newgrp docker || true
    fi
    DOCKER="sudo docker"
else
    DOCKER="docker"
fi

# ── 2. Instalar docker compose plugin si falta ───────────────
if ! $DOCKER compose version &>/dev/null; then
    info "Instalando docker compose plugin ..."
    ARCH=$(uname -m)
    case "$ARCH" in
        x86_64)  ARCH="x86_64" ;;
        aarch64) ARCH="aarch64" ;;
    esac
    sudo curl -fsSL \
        "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$ARCH" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    DOCKER_COMPOSE="sudo docker-compose"
else
    DOCKER_COMPOSE="$DOCKER compose"
fi

# ── 3. Crear .env si no existe ────────────────────────────────
if [ ! -f .env ]; then
    info "Creando .env ..."
    cat > .env <<EOF
NEXT_PUBLIC_API_URL=https://sauu.store/graphql
EOF
    ok ".env creado"
else
    ok ".env ya existe"
fi

# ── 4. Build y run ────────────────────────────────────────────
info "Construyendo imagen ..."
$DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

info "Levantando servicio ..."
$DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml up -d

# ── 5. Verificar ──────────────────────────────────────────────
info "Esperando que la app responda ..."
for i in {1..10}; do
    if curl -sf http://localhost:3000 >/dev/null 2>&1; then
        ok "App respondiendo en http://localhost:3000"
        break
    fi
    if [ "$i" -eq 10 ]; then
        err "No se pudo verificar la app. Revisá los logs:"
        err "  $DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml logs -f"
    fi
    sleep 3
done

# ── 6. Configurar Nginx como reverse proxy ────────────────────
info "Configurando Nginx ..."

if ! command -v nginx &>/dev/null; then
    info "Nginx no encontrado. Instalando ..."
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        case "$ID" in
            amzn|amazon)
                sudo yum install -y nginx
                sudo systemctl enable --now nginx
                ;;
            ubuntu|debian)
                sudo apt-get update -qq
                sudo apt-get install -y -qq nginx
                sudo systemctl enable --now nginx
                ;;
        esac
    fi
    ok "Nginx instalado"
fi

# Detectar IP pública de la instancia EC2
EC2_PUBLIC_IP=$(curl -fsSL http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

NGINX_CONF="/etc/nginx/conf.d/sauu-frontend.conf"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
        ubuntu|debian)
            NGINX_CONF="/etc/nginx/sites-available/sauu-frontend"
            sudo mkdir -p /etc/nginx/sites-enabled
            ;;
    esac
fi

sudo tee "$NGINX_CONF" > /dev/null <<NGINXEOF
server {
    listen 80;
    server_name ${EC2_PUBLIC_IP};

    # Frontend admin panel
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINXEOF

# Ubuntu/Debian: habilitar el sitio
if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
        ubuntu|debian)
            sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
            ;;
    esac
fi

sudo nginx -t && sudo systemctl reload nginx
ok "Nginx configurado: sirviendo frontend en http://${EC2_PUBLIC_IP}"

# ── 7. Mensaje final ──────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║           Frontend desplegado con éxito                     ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Frontend:         http://${EC2_PUBLIC_IP}"
echo "  API backend:      https://sauu.store/graphql"
echo "  Logs:             $DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml logs -f"
echo "  Detener:          $DOCKER_COMPOSE -f docker-compose.yml -f docker-compose.prod.yml down"
echo "  Actualizar:       git pull && ./deploy.sh"
echo ""
