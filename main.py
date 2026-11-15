from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Дозволяємо сайту фронтендера звертатися до вашого сервера
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# TASK-3: Базова перевірка, що сервер працює
@app.get("/")
def root():
    return {"status": "ok", "message": "Сервер Place in Space працює!"}

# TASK-4: Тестовий зв'язок із сайтом
@app.get("/api/hello")
def say_hello():
    return {"message": "Привіт від бекенду!"}
