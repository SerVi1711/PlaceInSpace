import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Перевірка, чи працює сервер
@app.get("/")
def root():
    return {"status": "ok", "message": "Сервер Place in Space працює!"}

# Тестова кнопка зв'язку з фронтендом
@app.get("/api/hello")
def say_hello():
    return {"message": "Привіт від бекенду!"}

# 1-й закон Кеплера: розрахунок форми еліпса та зміщення Сонця
@app.get("/api/kepler/ellipse")
def calculate_ellipse(a: float = 1.50, e: float = 0.45):
    if a <= 0:
        raise HTTPException(status_code=400, detail="Велика піввісь 'a' має бути більшою за 0!")
    if not (0 <= e <= 0.9):
        raise HTTPException(status_code=400, detail="Ексцентриситет 'e' має бути від 0 до 0.9!")

    b = round(a * math.sqrt(1 - e ** 2), 4)
    sun_offset_c = round(a * e, 4)
    perihelion = round(a * (1 - e), 4)
    aphelion = round(a * (1 + e), 4)

    points = []
    steps = 100
    for i in range(steps):
        angle = (2 * math.pi * i) / steps
        x = round(a * math.cos(angle) - sun_offset_c, 4)
        y = round(b * math.sin(angle), 4)
        points.append({"x": x, "y": y})

    return {
        "semi_major_axis_a": a,
        "semi_minor_axis_b": b,
        "eccentricity_e": e,
        "sun_offset_c": sun_offset_c,
        "perihelion_au": perihelion,
        "aphelion_au": aphelion,
        "orbit_points": points
    }

# 2-й закон Кеплера: площа секторів та пояснення швидкості
@app.get("/api/kepler/second-law")
def calculate_second_law(angle_deg: float = 120, e: float = 0.45, sectors: int = 4, days: int = 30, a: float = 1.50):
    if not (0 <= e <= 0.9) or a <= 0 or sectors <= 0 or days <= 0:
        raise HTTPException(status_code=400, detail="Перевірте правильність введених параметрів!")

    b = a * math.sqrt(1 - e ** 2)
    total_area = math.pi * a * b
    period_days = (a ** 1.5) * 365.25

    sector_area = round(total_area * (days / period_days), 4)
    angle_rad = math.radians(angle_deg)
    distance_r = round((a * (1 - e ** 2)) / (1 + e * math.cos(angle_rad)), 4)

    return {
        "sector_area_au2": sector_area,
        "distance_r_au": distance_r,
        "sectors_count": sectors,
        "formula_text": f"A₁ = A₂ = ... = A{sectors} = {sector_area} а.о.²",
        "explanation": (
            f"За кожні {days} діб планета замітає однакову площу {sector_area} а.о.². "
            f"На куті {angle_deg}° відстань до Сонця становить {distance_r} а.о. — "
            f"чим ближче до Сонця (менше r), тим швидше рухається планета, щоб встигнути покрити ту саму площу."
        )
    }

# 3-й закон Кеплера: калькулятор періодів обертання для двох планет
@app.get("/api/kepler/periods")
def calculate_periods(a1: float = 1.00, a2: float = 1.52):
    if a1 <= 0 or a2 <= 0:
        raise HTTPException(status_code=400, detail="Радіуси орбіт a₁ та a₂ мають бути більшими за нуль!")

    a1_cubed = round(a1 ** 3, 4)
    a2_cubed = round(a2 ** 3, 4)

    t1 = round(math.sqrt(a1_cubed), 4)
    t2 = round(math.sqrt(a2_cubed), 4)
    ratio = round(t2 / t1, 4)

    return {
        "planet1": {
            "radius_au": a1,
            "period_years": t1,
            "steps": [
                f"Крок 1: Підносимо радіус до кубу: {a1}³ = {a1_cubed}",
                f"Крок 2: Добуваємо квадратний корінь: √{a1_cubed} = {t1} земних років"
            ]
        },
        "planet2": {
            "radius_au": a2,
            "period_years": t2,
            "steps": [
                f"Крок 1: Підносимо радіус до кубу: {a2}³ = {a2_cubed}",
                f"Крок 2: Добуваємо квадратний корінь: √{a2_cubed} = {t2} земних років"
            ]
        },
        "comparison": f"Період другої планети у {ratio} разів більший за період першої."
    }
