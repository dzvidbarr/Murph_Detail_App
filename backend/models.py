from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base
from sqlalchemy import (Column, Integer, String, DateTime, Date, Time, Text, ForeignKey, Numeric)

# Customer Table 
class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(Integer, primary_key = True, index = True)
    first_name = Column(String(50), nullable = False)
    last_name = Column(String(50), nullable = False)
    email = Column(String(255), unique = True, nullable = False)
    phone = Column(String(20), nullable = False)
    created_at = Column(DateTime, server_default = func.now())
    vehicles = relationship("Vehicle", back_populates = "customer")
    appointments = relationship("Appointment", back_populates = "customer")

class Vehicle(Base):
    __tablename__ = "vehicles"
    vehicle_id = Column(Integer, primary_key = True, index = True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"),nullable = False)
    vehicle_type = Column(String(10), nullable = False)
    customer = relationship("Customer", back_populates = "vehicles")
    appointments = relationship("Appointment", back_populates = "vehicle")

class Service(Base):
    __tablename__ = "services"
    service_id = Column(Integer, primary_key = True, index = True)
    name = Column(String(100), unique = True, nullable = False)
    description = Column(String)
    duration_minutes = Column(Integer, nullable = False)
    prices = relationship("ServicePrice", back_populates = "service")
    appointments = relationship("Appointment", back_populates = "service")

class ServicePrice(Base):
    __tablename__ = "service_prices"
    service_price_id = Column(Integer, primary_key = True, index = True)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable = False)
    vehicle_type = Column(String(10), nullable = False)
    price = Column(Numeric(10, 2), nullable = False)
    service = relationship("Service", back_populates = "prices")

class Appointment(Base):
    __tablename__ = "appointments"
    appointment_id = Column(Integer, primary_key = True, index = True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable = False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.vehicle_id"), nullable = False)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable = False)
    appointment_date = Column(Date, nullable = False)
    appointment_time = Column(Time, nullable = False)
    status = Column(String(20), nullable = False, default = "Pending")
    price_at_booking = Column(Numeric(10, 2), nullable = False)
    notes = Column(Text)
    created_at = Column(DateTime, server_default = func.now())
    customer = relationship("Customer", back_populates = "appointments")
    vehicle = relationship("Vehicle", back_populates = "appointments")
    service = relationship("Service", back_populates = "appointments")