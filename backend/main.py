from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.dependencies import get_db
from backend import models, schemas

from fastapi.middleware.cors import CORSMiddleware
from datetime import date

from . import models
from .database import engine

models.Base.metadata.create_all(bind=engine)

# API Create things and Get things 
# Below is to start FastAPI server
# python -m uvicorn backend.main:app --reload
# http://127.0.0.1:8000/docs

# Creates the API application 
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "https://murph-detail-oevfe9s9d-healing-orange.vercel.app"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

BUSINESS_HOURS = {
    0: {"open": 1050, "close": 1350},  # Monday
    1: {"open": 1050, "close": 1350},  # Tuesday
    2: {"open": 1050, "close": 1350},  # Wednesday
    3: {"open": 1050, "close": 1350},  # Thursday
    4: {"open": 480, "close": 1350},   # Friday
    5: {"open": 480, "close": 1350},   # Saturday
    6: {"open": 480, "close": 1350}    # Sunday
}

# When someone sends a GET request to "/", it will run the function below 
@app.get("/")
def root():
    return {"message": "Murph Detail API is running"}

@app.post("/customers", response_model = schemas.CustomerResponse)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    # Duplicate emails
    existing_customer = (
        db.query(models.Customer)
        .filter(models.Customer.email == customer.email)
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code = 409,
            detail = "Email already registered"
        )

    new_customer = models.Customer(
        first_name = customer.first_name,
        last_name = customer.last_name,
        email = customer.email,
        phone = customer.phone
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer

@app.get("/customers", response_model = list[schemas.CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).all()
    return customers

@app.get("/customers/email/{email}", response_model = schemas.CustomerResponse)
def get_customer_by_email(
    email: str,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(func.lower(models.Customer.email) == email.lower())
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code = 404,
            detail = "Customer not found"
        )

    return customer

@app.post("/vehicles", response_model = schemas.VehicleResponse)
def create_vehicle(
    vehicle: schemas.VehicleCreate,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.customer_id == vehicle.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code = 404,
            detail = "Customer not found"
        )

    new_vehicle = models.Vehicle(
        customer_id = vehicle.customer_id,
        vehicle_type = vehicle.vehicle_type
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle

@app.get("/vehicles", response_model = list[schemas.VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles

@app.post("/services", response_model = schemas.ServiceResponse)
def create_service(
    service: schemas.ServiceCreate,
    db: Session = Depends(get_db)
):
    existing_service = (
        db.query(models.Service)
        .filter(models.Service.name == service.name)
        .first()
    )

    if existing_service:
        raise HTTPException(
            status_code = 409,
            detail = "Service already exists"
        )

    if service.duration_minutes <= 0:
        raise HTTPException(
            status_code = 400,
            detail = "Duration must be greater than 0"
        )

    new_service = models.Service(
        name = service.name,
        description = service.description,
        duration_minutes = service.duration_minutes
    )

    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    return new_service

@app.get("/services", response_model = list[schemas.ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()

@app.post("/service-prices", response_model = schemas.ServicePriceResponse)
def create_service_price(
    service_price: schemas.ServicePriceCreate,
    db: Session = Depends(get_db)
):
    service = (
        db.query(models.Service)
        .filter(models.Service.service_id == service_price.service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code = 404,
            detail = "Service not found"
        )

    if service_price.price < 0:
        raise HTTPException(
            status_code = 400,
            detail = "Price cannot be negative"
        )

    existing_price = (
        db.query(models.ServicePrice)
        .filter(
            models.ServicePrice.service_id == service_price.service_id,
            models.ServicePrice.vehicle_type == service_price.vehicle_type
        )
        .first()
    )

    if existing_price:
        raise HTTPException(
            status_code = 409,
            detail = "Price already exists for this service and vehicle type"
        )

    new_price = models.ServicePrice(
        service_id = service_price.service_id,
        vehicle_type = service_price.vehicle_type,
        price = service_price.price,
        duration_minutes = service_price.duration_minutes
    )

    db.add(new_price)
    db.commit()
    db.refresh(new_price)

    return new_price

@app.patch("/service-prices/{service_price_id}", response_model = schemas.ServicePriceResponse)
def update_service_price_duration(
    service_price_id: int,
    duration_minutes: int,
    db: Session = Depends(get_db)
):
    service_price = (
        db.query(models.ServicePrice)
        .filter(models.ServicePrice.service_price_id == service_price_id)
        .first()
    )

    if not service_price:
        raise HTTPException(
            status_code = 404,
            detail = "Service price not found"
        )

    service_price.duration_minutes = duration_minutes

    db.commit()
    db.refresh(service_price)

    return service_price

@app.get("/service-prices", response_model = list[schemas.ServicePriceResponse])
def get_service_prices(db: Session = Depends(get_db)):
    return db.query(models.ServicePrice).all()

@app.post("/appointments", response_model = schemas.AppointmentResponse)
def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.customer_id == appointment.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code = 404,
            detail = "Customer not found"
        )

    vehicle = (
        db.query(models.Vehicle)
        .filter(models.Vehicle.vehicle_id == appointment.vehicle_id)
        .first()
    )

    if not vehicle:
        raise HTTPException(
            status_code = 404,
            detail = "Vehicle not found"
        )

    if vehicle.customer_id != appointment.customer_id:
        raise HTTPException(
            status_code = 400,
            detail = "Vehicle does not belong to this customer"
        )

    service = (
        db.query(models.Service)
        .filter(models.Service.service_id == appointment.service_id)
        .first()
    )

    if not service:
        raise HTTPException(
            status_code = 404,
            detail = "Service not found"
        )

    service_price = (
        db.query(models.ServicePrice)
        .filter(
            models.ServicePrice.service_id == appointment.service_id,
            models.ServicePrice.vehicle_type == vehicle.vehicle_type
        )
        .first()
    )

    if not service_price:
        raise HTTPException(
            status_code = 404,
            detail = "Price not found for this service and vehicle type"
        )

    if service_price.duration_minutes is None:
        raise HTTPException(
            status_code = 400,
            detail = "This service is not currently available for booking"
        )

    new_start_minutes = (
        appointment.appointment_time.hour * 60
        + appointment.appointment_time.minute
    )

    new_end_minutes = (
        new_start_minutes + service_price.duration_minutes
    )

    day_of_week = appointment.appointment_date.weekday()

    business_hours = BUSINESS_HOURS[day_of_week]

    opening_minutes = business_hours["open"]
    closing_minutes = business_hours["close"]

    if new_start_minutes < opening_minutes:
        raise HTTPException(
            status_code = 400,
            detail = "Appointment is before business hours"
        )

    if new_end_minutes > closing_minutes:
        raise HTTPException(
            status_code = 400,
            detail = "Appointment would end after business hours"
        )

    existing_appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.appointment_date == appointment.appointment_date,
            models.Appointment.status != "Cancelled"
        )
        .all()
    )

    for existing_appointment in existing_appointments:

        existing_vehicle = (
            db.query(models.Vehicle)
            .filter(
                models.Vehicle.vehicle_id == existing_appointment.vehicle_id
            )
            .first()
        )

        if not existing_vehicle:
            continue

        existing_service_price = (
            db.query(models.ServicePrice)
            .filter(
                models.ServicePrice.service_id == existing_appointment.service_id,
                models.ServicePrice.vehicle_type == existing_vehicle.vehicle_type
            )
            .first()
        )

        if not existing_service_price:
            continue

        if existing_service_price.duration_minutes is None:
            continue

        existing_start_minutes = (
            existing_appointment.appointment_time.hour * 60
            + existing_appointment.appointment_time.minute
        )

        existing_end_minutes = (
            existing_start_minutes
            + existing_service_price.duration_minutes
        )

        if (
            new_start_minutes < existing_end_minutes
            and new_end_minutes > existing_start_minutes
        ):
            raise HTTPException(
                status_code = 409,
                detail = "This appointment would overlap an existing appointment"
            )
    
    new_appointment = models.Appointment(
        customer_id = appointment.customer_id,
        vehicle_id = appointment.vehicle_id,
        service_id = appointment.service_id,
        appointment_date = appointment.appointment_date,
        appointment_time = appointment.appointment_time,
        status = "Pending",
        price_at_booking = service_price.price,
        notes = appointment.notes
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment

@app.get("/appointments", response_model = list[schemas.AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).all()

@app.get("/appointments/{appointment_id}", response_model = schemas.AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code = 404,
            detail = "Appointment not found"
        )

    return appointment

@app.patch("/appointments/{appointment_id}/status", response_model = schemas.AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_update: schemas.AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code = 404,
            detail = "Appointment not found"
        )

    appointment.status = status_update.status

    db.commit()
    db.refresh(appointment)

    return appointment

@app.get("/availability/{appointment_date}")
def get_availability(
    appointment_date: date,
    db: Session = Depends(get_db)
):
    appointments = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.appointment_date == appointment_date,
            models.Appointment.status != "Cancelled"
        )
        .all()
    )

    booked_appointments = []

    for appointment in appointments:

        vehicle = (
            db.query(models.Vehicle)
            .filter(
                models.Vehicle.vehicle_id == appointment.vehicle_id
            )
            .first()
        )

        service_price = (
            db.query(models.ServicePrice)
            .filter(
                models.ServicePrice.service_id == appointment.service_id,
                models.ServicePrice.vehicle_type == vehicle.vehicle_type
            )
            .first()
        )

        if service_price is None:
            continue

        if service_price.duration_minutes is None:
            continue

        start_hour = appointment.appointment_time.hour
        start_minute = appointment.appointment_time.minute

        start_minutes = (start_hour * 60) + start_minute

        end_minutes = (
            start_minutes + service_price.duration_minutes
        )

        booked_appointments.append({
            "start_minutes": start_minutes,
            "end_minutes": end_minutes
        })

    return {
        "date": appointment_date,
        "booked_appointments": booked_appointments
    }