FROM python:3.12-slim

WORKDIR /app

# 의존성을 먼저 설치해 소스 변경 시 레이어 캐시를 재사용한다
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
