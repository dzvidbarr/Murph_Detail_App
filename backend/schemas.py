# First API endpoint
from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import date, time

class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

class VehicleCreate(BaseModel):
    customer_id: int
    # Literal uses these exact three values and reject anything else
    vehicle_type: Literal["Sedan", "SUV", "Truck"]

class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    duration_minutes: int

class ServicePriceCreate(BaseModel):
    service_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    price: float

class AppointmentCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    notes: str | None = None


