from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI()

from fastapi.staticfiles import StaticFiles

# Mount the 'static' directory for serving CSS & JS
app.mount("/static", StaticFiles(directory="static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sensor_data = {"heartRate": 0, "spo2": 0}

class SensorData(BaseModel):
    heartRate: float
    spo2: float

@app.get("/")
async def serve_index():
    return FileResponse("index.html")  # Must be in root

@app.get("/data")
async def get_data():
    return JSONResponse(content=sensor_data)

@app.post("/data")
async def update_data(data: SensorData):
    sensor_data["heartRate"] = data.heartRate
    sensor_data["spo2"] = data.spo2
    return {"message": "Data received"}
