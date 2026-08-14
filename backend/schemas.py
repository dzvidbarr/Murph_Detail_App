# First API endpoint
from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from datetime import date, time, datetime
from decimal import Decimal

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
    duration_minutes: int = Field(gt = 0)

class ServicePriceCreate(BaseModel):
    service_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    price: Decimal = Field(ge = 0)

class AppointmentCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    notes: str | None = None

class AppointmentStatusUpdate(BaseModel):
    status: Literal["Pending", "Confirmed", "Completed", "Cancelled"]


class CustomerResponse(BaseModel):
    customer_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    created_at: datetime
    model_config = {"from_attributes": True}

class VehicleResponse(BaseModel):
    vehicle_id: int
    customer_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    model_config = {"from_attributes": True}

class ServiceResponse(BaseModel):
    service_id: int
    name: str
    description: str | None
    duration_minutes: int
    model_config = {"from_attributes": True}

class ServicePriceResponse(BaseModel):
    service_price_id: int
    service_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    price: Decimal
    model_config = {"from_attributes": True}

class AppointmentResponse(BaseModel):
    appointment_id: int
    customer_id: int
    vehicle_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    status: str
    price_at_booking: Decimal
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}