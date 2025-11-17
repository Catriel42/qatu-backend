#!/bin/bash

# Script para generar certificados SSL self-signed
# Uso: ./generate-certs.sh [IP]

IP=${1:-$(hostname -I | awk '{print $1}')}
CERT_DIR="../certs"

echo "🔐 Generando certificados SSL para IP: $IP"
echo "📁 Directorio: $CERT_DIR"

mkdir -p $CERT_DIR

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $CERT_DIR/server.key \
  -out $CERT_DIR/server.crt \
  -subj "/C=BO/ST=SC/L=Cochabamba/O=DevOps/CN=$IP"

echo "✅ Certificados generados para IP: $IP"
