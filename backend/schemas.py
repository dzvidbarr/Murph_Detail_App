# First API endpoint
from pydantic import BaseModel, EmailStr, Field
from typing import Literal
from datetime import date, time, datetime
from decimal import Decimal

# Customer class
class CustomerCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

# Vehicle type class
class VehicleCreate(BaseModel):
    customer_id: int
    # Literal uses these exact three values and reject anything else
    vehicle_type: Literal["Sedan", "SUV", "Truck"]

# Service class
class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    duration_minutes: int = Field(gt = 0)

# Service Price class
class ServicePriceCreate(BaseModel):
    service_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    price: Decimal = Field(ge = 0)
    duration_minutes: int | None = None

# Appointment class
class AppointmentCreate(BaseModel):
    customer_id: int
    vehicle_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    notes: str | None = None

# Appointment status class
class AppointmentStatusUpdate(BaseModel):
    status: Literal["Pending", "Confirmed", "Completed", "Cancelled"]

# Customer response class
class CustomerResponse(BaseModel):
    customer_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    created_at: datetime
    model_config = {"from_attributes": True}

# Vehicle response class
class VehicleResponse(BaseModel):
    vehicle_id: int
    customer_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    model_config = {"from_attributes": True}

# Serivce response class
class ServiceResponse(BaseModel):
    service_id: int
    name: str
    description: str | None
    duration_minutes: int
    model_config = {"from_attributes": True}

# Service price response
class ServicePriceResponse(BaseModel):
    service_price_id: int
    service_id: int
    vehicle_type: Literal["Sedan", "SUV", "Truck"]
    price: Decimal
    duration_minutes: int | None = None
    model_config = {"from_attributes": True}

# Appointment response class
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