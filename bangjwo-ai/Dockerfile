FROM python:3.9-slim

WORKDIR /app

# 시스템 패키지 및 Chromium 설치 (Mac ARM64, Windows AMD64 모두 완벽 호환)
# 복잡한 lib 패키지들을 직접 명시할 필요 없이 chromium을 설치하면 알아서 의존성이 해결됩니다.
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# requirements 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY . .

# law_db 폴더 미리 생성
RUN mkdir -p /app/law_db

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]