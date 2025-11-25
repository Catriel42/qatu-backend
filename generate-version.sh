#!/bin/bash

# Script para generación automática de versiones semánticas
# Uso: ./generate-version.sh "feat: agregar nueva funcionalidad"

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Archivo de configuración de versión
VERSION_FILE=".version"
BUILD_INFO_FILE=".build-version"

# Valores por defecto
DEFAULT_MAJOR=2
DEFAULT_MINOR=0
DEFAULT_PATCH=0

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Leer versión actual si existe el archivo
load_current_version() {
    if [ -f "$VERSION_FILE" ]; then
        source "$VERSION_FILE"
        log_info "Versión actual cargada: MAJOR=$MAJOR, MINOR=$MINOR, PATCH=$PATCH"
    else
        log_warning "Archivo .version no encontrado, usando valores por defecto"
        MAJOR=$DEFAULT_MAJOR
        MINOR=$DEFAULT_MINOR
        PATCH=$DEFAULT_PATCH
    fi
}

# Guardar versión en archivo
save_version() {
    cat > "$VERSION_FILE" << EOF
MAJOR=$MAJOR
MINOR=$MINOR
PATCH=$PATCH
VERSION=$VERSION
LAST_UPDATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
LAST_COMMIT_MESSAGE="$COMMIT_MSG"
EOF
    log_success "Versión guardada en $VERSION_FILE"
}

# Guardar información de build
save_build_info() {
    cat > "$BUILD_INFO_FILE" << EOF
BUILD_VERSION=$VERSION
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
BUILD_COMMIT=$CI_COMMIT_SHA
BUILD_BRANCH=$CI_COMMIT_REF_NAME
BUILD_MESSAGE="$COMMIT_MSG"
EOF
    log_success "Información de build guardada en $BUILD_INFO_FILE"
}

# Analizar mensaje de commit y determinar tipo de cambio
analyze_commit() {
    local commit_msg="$1"

    if [[ -z "$commit_msg" ]]; then
        log_warning "Mensaje de commit vacío, usando versión estándar"
        VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
        return
    fi

    # Convertir a minúsculas para comparación
    local lower_msg=$(echo "$commit_msg" | tr '[:upper:]' '[:lower:]')

    case "$lower_msg" in
        *"breaking change:"*|*"!"*)
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
            VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
            log_info "Breaking Change detectado -> Incrementando MAJOR: $VERSION"
            ;;
        *"feat:"*|"*feature:"*)
            PATCH=$((PATCH + 1))
            VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
            log_info "Feature detectado -> Incrementando PATCH: $VERSION"
            ;;
        *"fix:"*|*"bugfix:"*|"*hotfix:"*|*"patch:"*)
            VERSION="DEV-${MAJOR}.${MINOR}"
            log_info "Bug fix detectado -> Versión de parche: $VERSION"
            ;;
        *"perf:"*|*"improve:"*|*"refactor:"*|*"enhance:"*)
            VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
            log_info "Mejora detectada -> Versión menor: $VERSION"
            ;;
        *"chore:"*|*"docs:"*|*"style:"*|*"test:"*)
            VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
            log_info "Commit de mantenimiento -> Sin cambios de versión: $VERSION"
            ;;
        *)
            PATCH=$((PATCH + 1))
            VERSION="DEV-${MAJOR}.${MINOR}.${PATCH}"
            log_info "Commit estándar -> Incrementando PATCH: $VERSION"
            ;;
    esac
}

# Crear tag en Git si se solicita
create_git_tag() {
    if [ "$CREATE_TAG" = "true" ]; then
        log_info "Creando tag Git: $VERSION"
        if git tag -a "$VERSION" -m "Release $VERSION"; then
            log_success "Tag creado localmente"
            if [ "$PUSH_TAG" = "true" ]; then
                git push origin "$VERSION"
                log_success "Tag pushed al remoto"
            fi
        else
            log_error "Error creando tag"
        fi
    fi
}

# Generar changelog simple
generate_changelog() {
    local changelog_file="CHANGELOG.md"

    if [ ! -f "$changelog_file" ]; then
        echo "# Changelog" > "$changelog_file"
        echo "" >> "$changelog_file"
    fi

    local date=$(date +'%Y-%m-%d')
    local entry="## [$VERSION] - $date"
    local entry_content="$entry\n\n$COMMIT_MSG\n"

    # Insertar nueva entrada al principio del archivo (después del título)
    if grep -q "^# Changelog" "$changelog_file"; then
        sed -i "2i\\$entry_content" "$changelog_file"
    else
        echo -e "$entry_content" >> "$changelog_file"
    fi

    log_success "Changelog actualizado"
}

# Mostrar resumen
show_summary() {
    echo ""
    log_success "=== Resumen de Versionamiento ==="
    echo "Versión Anterior: DEV-$((MAJOR > 1 ? MAJOR-1 : MAJOR)).$((VERSION == *"BREAKING"* ? 0 : MINOR)).$((VERSION == *"feat"* && MAJOR == 2 ? PATCH-1 : PATCH))"
    echo "Versión Nueva: $VERSION"
    echo "Tipo de Cambio: $CHANGE_TYPE"
    echo "Mensaje del Commit: $COMMIT_MSG"
    echo "Fecha: $(date)"
    echo ""

    if [ -f "$VERSION_FILE" ]; then
        echo "Contenido de $VERSION_FILE:"
        cat "$VERSION_FILE"
    fi
}

# Función principal
main() {
    local commit_msg="$1"

    # Establecer variables de entorno de CI si no existen
    CI_COMMIT_SHA=${CI_COMMIT_SHA:-"local"}
    CI_COMMIT_REF_NAME=${CI_COMMIT_REF_NAME:-"local"}
    CREATE_TAG=${CREATE_TAG:-"false"}
    PUSH_TAG=${PUSH_TAG:-"false"}

    COMMIT_MSG="$commit_msg"

    log_info "Iniciando generación de versión semántica..."
    log_info "Mensaje del commit: $COMMIT_MSG"

    # Cargar versión actual
    load_current_version

    # Analizar commit y determinar nueva versión
    analyze_commit "$COMMIT_MSG"

    # Guardar versión
    save_version

    # Guardar información de build
    save_build_info

    # Crear tag si es necesario
    create_git_tag

    # Generar changelog
    if [ "$GENERATE_CHANGELOG" = "true" ]; then
        generate_changelog
    fi

    # Mostrar resumen
    show_summary

    # Exportar versión para uso en otros scripts
    echo "export VERSION=\"$VERSION\"" > version.env
    echo "export BUILD_VERSION=\"$VERSION\"" >> version.env

    log_success "Versión $VERSION generada exitosamente"
}

# Validar argumentos
if [ $# -eq 0 ]; then
    log_error "Uso: $0 \"mensaje del commit\""
    log_error "Ejemplo: $0 \"feat: agregar endpoint de autenticación\""
    exit 1
fi

# Verificar si estamos en un directorio Git
if [ ! -d ".git" ] && [ "$CI_COMMIT_SHA" = "local" ]; then
    log_warning "No se detectó un repositorio Git. Algunas funciones pueden no estar disponibles."
fi

# Ejecutar función principal
main "$@"

# Imprimir solo la versión para uso en scripts
echo "$VERSION"