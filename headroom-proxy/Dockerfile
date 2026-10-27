# Headroom compression proxy untuk 9router
# Image full (bukan slim/alpine) agar dependensi Rust bisa ter-compile saat build
FROM python:3.12

RUN pip install --no-cache-dir "headroom-ai[proxy]"

EXPOSE 8787
CMD ["headroom", "proxy", "--port", "8787", "--host", "0.0.0.0"]
