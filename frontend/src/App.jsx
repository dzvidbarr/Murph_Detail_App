import { useEffect, useState } from 'react'
import './App.css'

function App() {

  // Const for the services 
  const [services, setServices] = useState([])
  const [prices, setPrices] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState("Sedan")

  // Const for the booking appointments
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedService, setSelectedService] = useState("")

  // Const for date and booked items
  const [appointmentDate, setAppointmentDate] = useState("")
  const [bookedAppointments, setBookedAppointments] = useState([])
  const [selectedTime, setSelectedTime] = useState("")
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Find the selected service
  const bookingService = services.find(service => service.service_id === selectedService)

  const today = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    fetch('http://127.0.0.1:8000/services')
      .then(response => response.json())
      .then(data => {
        setServices(data)
      })
      .catch(error => {
        console.error('Error loading services:', error)
      })
  }, [])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/service-prices')
      .then(response => response.json())
      .then(data => {
        console.log("Prices from API:", data)
        setPrices(data)
      })
      .catch(error => {
        console.error('Error loading prices:', error)
      })
  }, [])

  useEffect(() => {

    if (appointmentDate === "") {
      return
    }

    fetch(`http://127.0.0.1:8000/availability/${appointmentDate}`)
      .then(response => response.json())
      .then(data => {
        setBookedAppointments(data.booked_appointments)
      })
      .catch(error => {
        console.error("Error loading availability:", error)
      })

  }, [appointmentDate])

  let sedanClass = ""
  let suvClass = ""
  let truckClass = ""

  if (selectedVehicle === "Sedan") 
  {
    sedanClass = "selected"
  }

  if (selectedVehicle === "SUV") 
  {
    suvClass = "selected"
  }

  if (selectedVehicle === "Truck") 
  {
    truckClass = "selected"
  }

  const businessHours = {
    0: { open: "08:00", close: "22:30" }, // Sunday
    1: { open: "17:30", close: "22:30" }, // Monday
    2: { open: "17:30", close: "22:30" }, // Tuesday
    3: { open: "17:30", close: "22:30" }, // Wednesday
    4: { open: "17:30", close: "22:30" }, // Thursday
    5: { open: "08:00", close: "22:30" }, // Friday
    6: { open: "08:00", close: "22:30" }  // Saturday
  }

  // Format the time correctly
  function formatTime(time) {
    const parts = time.split(":")
    let hour = Number(parts[0])
    const minutes = parts[1]

    let period = "AM"

    if (hour >= 12) {
      period = "PM"
    }

    if (hour > 12) {
      hour = hour - 12
    }

    if (hour === 0) {
      hour = 12
    }

    return `${hour}:${minutes} ${period}`
  }

  let bookingPrice = null

  if (bookingService) 
  {
    bookingPrice = prices.find(price => price.service_id === bookingService.service_id && price.vehicle_type === selectedVehicle)
  }

  let serviceDisplay = "Not selected"
  let priceDisplay = "Not available"
  let dateDisplay = "Not selected"
  let timeDisplay = "Not selected"

  if (bookingService) {
    serviceDisplay = bookingService.name
  }

  if (bookingPrice) {
    priceDisplay = `$${Number(bookingPrice.price).toFixed(2)}`
  }

  if (appointmentDate !== "") {
    const dateParts = appointmentDate.split("-")
    const year = Number(dateParts[0])
    const month = Number(dateParts[1]) - 1
    const day = Number(dateParts[2])
    const date = new Date(year, month, day)

    dateDisplay = date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    )
  }

  if (selectedTime !== "") {
    timeDisplay = formatTime(selectedTime)
  }

  async function handleBooking() {

    if (firstName === "") {
      alert("Please enter your first name.")
      return
    }

    if (lastName === "") {
      alert("Please enter your last name.")
      return
    }

    if (email === "") {
      alert("Please enter your email.")
      return
    }

    if (phone === "") {
      alert("Please enter your phone number.")
      return
    }

    if (selectedService === "") {
      alert("Please select a service.")
      return
    }

    if (appointmentDate === "") {
      alert("Please select an appointment date.")
      return
    }

    if (selectedTime === "") {
      alert("Please select an appointment time.")
      return
    }

    try {

      let customerData = null

      const customerLookupResponse = await fetch(
        `http://127.0.0.1:8000/customers/email/${encodeURIComponent(email)}`
      )

      if (customerLookupResponse.ok) {

        customerData = await customerLookupResponse.json()

        console.log("Existing customer found:", customerData)

      } else if (customerLookupResponse.status === 404) {

        const customerResponse = await fetch(
          "http://127.0.0.1:8000/customers",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone: phone
            })
          }
        )

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json()
          alert(errorData.detail)
          return
        }

        customerData = await customerResponse.json()

        console.log("New customer created:", customerData)

      } else {

        alert("There was a problem checking the customer email.")
        return
      }

      const vehicleResponse = await fetch(
        "http://127.0.0.1:8000/vehicles",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            customer_id: customerData.customer_id,
            vehicle_type: selectedVehicle
          })
        }
      )

      const vehicleData = await vehicleResponse.json()

      console.log("Vehicle created:", vehicleData)

      const appointmentResponse = await fetch(
        "http://127.0.0.1:8000/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            customer_id: customerData.customer_id,
            vehicle_id: vehicleData.vehicle_id,
            service_id: selectedService,
            appointment_date: appointmentDate,
            appointment_time: selectedTime,
            notes: null
          })
        }
      )

      if (!vehicleResponse.ok) {
        const errorData = await vehicleResponse.json()
        alert(errorData.detail)
        return
      }

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json()
        alert(errorData.detail)
        return
      }

      const appointmentData = await appointmentResponse.json()

      console.log("Appointment created:", appointmentData)

      setConfirmedBooking({
        service: serviceDisplay,
        vehicle: selectedVehicle,
        price: priceDisplay,
        duration: durationDisplay,
        date: dateDisplay,
        time: timeDisplay
      })
      setBookingConfirmed(true)

      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setSelectedService("")
      setAppointmentDate("")
      setSelectedTime("")
      setBookedAppointments([])

    } catch (error) {

      console.error("Booking error:", error)

    }
  }

  let selectedDuration = null

  const selectedPrice = prices.find(price =>
    price.service_id === selectedService &&
    price.vehicle_type === selectedVehicle
  )

  if (selectedPrice) {
    selectedDuration = selectedPrice.duration_minutes
  }

  function generateAppointmentTimes() {

    if (appointmentDate === "") {
      return []
    }

    if (selectedDuration === null) {
      return []
    }

    const dateParts = appointmentDate.split("-")

    const year = Number(dateParts[0])
    const month = Number(dateParts[1]) - 1
    const day = Number(dateParts[2])

    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()

    const hours = businessHours[dayOfWeek]

    const openParts = hours.open.split(":")
    const closeParts = hours.close.split(":")

    let currentMinutes =
      Number(openParts[0]) * 60 + Number(openParts[1])

    const closingMinutes =
      Number(closeParts[0]) * 60 + Number(closeParts[1])

    const latestStartTime = closingMinutes - selectedDuration

    const times = []

    while (currentMinutes <= latestStartTime) {

      const hour = Math.floor(currentMinutes / 60)
      const minutes = currentMinutes % 60

      const hourString = String(hour).padStart(2, "0")
      const minuteString = String(minutes).padStart(2, "0")

      times.push(`${hourString}:${minuteString}`)

      currentMinutes = currentMinutes + 30
    }

    return times
  }

  const appointmentTimes = generateAppointmentTimes()

  let durationDisplay = "Not available"

  if (selectedDuration !== null) {

    const hours = Math.floor(selectedDuration / 60)
    const minutes = selectedDuration % 60

    if (hours > 0 && minutes > 0) {
      durationDisplay = `${hours} hr ${minutes} min`
    }

    if (hours > 0 && minutes === 0) {
      durationDisplay = `${hours} hr`
    }

    if (hours === 0) {
      durationDisplay = `${minutes} min`
    }
  }

  return (
    <div>
      <nav className = "navbar">

        <div className = "logo">
          Murph Detail
        </div>

        <div className = "nav-links">
          <a href = "#home">Home</a>
          <a href = "#services">Services</a>
          <a href = "#contact">Contact</a>
          <a href = "#booking">Book Now</a>
        </div>

      </nav>
      <section className = "hero" id = "home">
        <div className = "hero-content">
          <p className = "hero-label">Professional Automotive Detailing</p>

          <h1>Make Your Car Look New Again.</h1>

          <p className = "hero-description">
            Quality automotive detailing with the care your vehicle deserves.
          </p>

          <a href = "#booking" className = "book-button">
            Book a Detail
          </a>
        </div>
      </section>
      <section className = "services" id = "services">

        <div className = "services-header">
          <p className = "section-label">Our Services</p>
          <h2>Choose Your Detail</h2>
          <p>
            Select the service that's right for your vehicle.
          </p>
        </div>

        <div className = "vehicle-selector">

          <button
            className = {sedanClass}
            onClick = {() => setSelectedVehicle("Sedan")}
          >
            Sedan
          </button>

          <button
            className = {suvClass}
            onClick = {() => setSelectedVehicle("SUV")}
          >
            SUV
          </button>

          <button
            className = {truckClass}
            onClick = {() => setSelectedVehicle("Truck")}
          >
            Truck
          </button>

        </div>

        <div className = "service-cards">

          {services.map(service => {
            const servicePrice = prices.find(price => price.service_id === service.service_id && price.vehicle_type === selectedVehicle)

            let priceDisplay

            if (servicePrice) {
              priceDisplay = `$${Number(servicePrice.price).toFixed(2)}`
            } else {
              priceDisplay = "Price unavailable"
            }

            return (
              <div className = "service-card" key = {service.service_id}>

                <h3>{service.name}</h3>

                <p>{service.description}</p>

                <p>
                  Duration: {service.duration_minutes} minutes
                </p>

                <p className = "service-price">
                  {priceDisplay}
                </p>

                <a href = "#booking">
                  Book Now
                </a>

              </div>
            )
          })}

        </div>

      </section>

      <section className = "booking" id = "booking">

        <div className = "booking-header">
          <p className = "section-label">Book Online</p>
          <h2>Book Your Detail</h2>
          <p>
            Enter your information below to get started.
          </p>
        </div>

        <div className = "booking-form">

          <h3>Your Information</h3>

          <div className = "form-row">

            <div className = "form-group">
              <label>First Name</label>
              <input type = "text" placeholder = "First name" value = {firstName} onChange = {(event) => setFirstName(event.target.value)} />
            </div>

            <div className = "form-group">
              <label>Last Name</label>
              <input type = "text" placeholder = "Last name" value = {lastName} onChange = {(event) => setLastName(event.target.value)} />
            </div>

          </div>

          <div className = "form-row">

            <div className = "form-group">
              <label>Email</label>
              <input type = "email" placeholder = "Email address" value = {email} onChange = {(event) => setEmail(event.target.value)} />
            </div>

            <div className = "form-group">
              <label>Phone</label>
              <input type = "tel" placeholder = "Phone number" value ={phone} onChange = {(event) => setPhone(event.target.value)} />
            </div>

          </div>

        </div>

        <h3>Vehicle Type</h3>

        <div className = "booking-vehicle-selector">

          <button
            type = "button"
            className = {sedanClass}
            onClick = {() => setSelectedVehicle("Sedan")}
          >
            Sedan
          </button>

          <button
            type = "button"
            className = {suvClass}
            onClick = {() => setSelectedVehicle("SUV")}
          >
            SUV
          </button>

          <button
            type = "button"
            className = {truckClass}
            onClick = {() => setSelectedVehicle("Truck")}
          >
            Truck
          </button>

        </div>

        <h3>Select Service</h3>

        <div className = "booking-service-selector">

          {services.map(service => {
            const servicePrice = prices.find(price =>
            price.service_id === service.service_id &&
            price.vehicle_type === selectedVehicle
          )

          if (!servicePrice) {
            return null
          }

          if (servicePrice.duration_minutes === null) {
            return null
          }

          let serviceClass = ""

          if (selectedService === service.service_id) {
            serviceClass = "selected"
          }

          return (
            <button
              type = "button"
              className = {serviceClass}
              key = {service.service_id}
              onClick = {() => setSelectedService(service.service_id)}
            >
              {service.name}
            </button>
          )
        })}

        </div>

        <h3>Select Date</h3>

        <div className = "form-group">
          <label>Appointment Date</label>

          <input
            type = "date"
            value = {appointmentDate}
            min = {today}
            onChange = {(event) => setAppointmentDate(event.target.value)}
          />
        </div>

        <h3>Select Time</h3>

        <div className = "time-selector">

          {appointmentTimes.map(time => {

            const timeParts = time.split(":")

            const startHour = Number(timeParts[0])
            const startMinute = Number(timeParts[1])

            const newStartMinutes = (startHour * 60) + startMinute
            const newEndMinutes = newStartMinutes + selectedDuration

            let isBooked = false

            for (const appointment of bookedAppointments) {

              if (
                newStartMinutes < appointment.end_minutes &&
                newEndMinutes > appointment.start_minutes
              ) {
                isBooked = true
                break
              }
            }

            let timeClass = ""

            if (selectedTime === time) {
              timeClass = "selected"
            }

            if (isBooked) {
              timeClass = "booked"
            }

            return (
              <button
                type = "button"
                key = {time}
                className = {timeClass}
                disabled = {isBooked}
                onClick = {() => setSelectedTime(time)}
              >
                {formatTime(time)}
              </button>
            )
          })}

        </div>

        {!bookingConfirmed && (
          <div className = "booking-summary">

            <h3>Booking Summary</h3>

            <p>
              <strong>Service:</strong> {serviceDisplay}
            </p>

            <p>
              <strong>Vehicle:</strong> {selectedVehicle}
            </p>

            <p>
              <strong>Price:</strong> {priceDisplay}
            </p>

            <p>
              <strong>Duration:</strong> {durationDisplay}
            </p>

            <p>
              <strong>Date:</strong> {dateDisplay}
            </p>

            <p>
              <strong>Time:</strong> {timeDisplay}
            </p>

            <button
              type = "button"
              className = "submit-booking"
              onClick = {handleBooking}
            >
              Book Appointment
            </button>

          </div>
        )}

        {bookingConfirmed && confirmedBooking && (

          <div className = "booking-confirmation">

            <h2>✓ Appointment Confirmed</h2>

            <p>
              Your detail has been booked successfully.
            </p>

            <div className = "confirmation-details">

              <p>
                <strong>Service:</strong> {confirmedBooking.service}
              </p>

              <p>
                <strong>Vehicle:</strong> {confirmedBooking.vehicle}
              </p>

              <p>
                <strong>Price:</strong> {confirmedBooking.price}
              </p>

              <p>
                <strong>Duration:</strong> {confirmedBooking.duration}
              </p>

              <p>
                <strong>Date:</strong> {confirmedBooking.date}
              </p>

              <p>
                <strong>Time:</strong> {confirmedBooking.time}
              </p>

            </div>

            <button
              type = "button"
              className = "book-another-button"
              onClick = {() => setBookingConfirmed(false)}
            >
              Book Another Appointment
            </button>

          </div>

        )}

      </section>

    </div>
  )
}

export default App