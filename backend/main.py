from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend import models, schemas

# Creates the API application 
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# When someone sends a GET request to "/", it will run the function below 
@app.get("/")
def root():
    return {"message": "Murph Detail API is running"}

@app.post("/customers")
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

@app.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).all()
    return customers

@app.post("/vehicles")
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

@app.get("/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    return vehicles

@app.post("/services")
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

@app.get("/services")
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()

@app.post("/service-prices")
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
            status_code=404,
            detail="Service not found"
        )

    if service_price.price < 0:
        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative"
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
        price = service_price.price
    )

    db.add(new_price)
    db.commit()
    db.refresh(new_price)

    return new_price

@app.get("/service-prices")
def get_service_prices(db: Session = Depends(get_db)):
    return db.query(models.ServicePrice).all()

@app.post("/appointments")
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

@app.get("/appointments")
def get_appointments(db: Session = Depends(get_db)):
    return db.query(models.Appointment).all()