# ──────────────────────────────────────────────────────
# Dockerfile — StockFlow
# Usa Nginx para servir os arquivos HTML/CSS/JS
# ──────────────────────────────────────────────────────

FROM nginx:alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos do projeto para o container
COPY index.html       /usr/share/nginx/html/index.html
COPY css/             /usr/share/nginx/html/css/
COPY js/              /usr/share/nginx/html/js/

# Expõe a porta 80
EXPOSE 80

# Nginx sobe automaticamente
CMD ["nginx", "-g", "daemon off;"]
