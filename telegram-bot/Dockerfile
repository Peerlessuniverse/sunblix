# SURTI Telegram Bot — production image
FROM node:20-alpine

WORKDIR /app

# Install deps dulu (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy kode
COPY src ./src

# Non-root user
RUN addgroup -S surti && adduser -S surti -G surti
USER surti

# Long-polling bot — tidak expose port, tapi sediakan healthcheck-friendly CMD
CMD ["node", "src/bot.js"]
