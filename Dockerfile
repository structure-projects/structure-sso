# 使用 Nginx 作为生产环境的 Web 服务器
FROM nginx:alpine

ENV SCHEME=https
ENV SERVER_HOST=api.prod.structured.cn
ENV SERVER_PORT=443
ENV AUTH_TOKEN=""
# 将构建好的应用程序复制到 Nginx 的 html 目录
ADD ./dist /usr/share/nginx/html
ADD ./nginx.template /etc/nginx/conf.d/source.template
ENTRYPOINT ["sh","-c","envsubst '$${SERVER_HOST}$${SERVER_PORT}$${SCHEME}' < /etc/nginx/conf.d/source.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
# # 启动 Nginx
# 暴露 Nginx 默认端口
EXPOSE 80