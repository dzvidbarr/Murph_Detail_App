import { useEffect, useState } from 'react'
import './App.css'
import murphLogo from "./assets/logo.png"
import heroCar from "./assets/car.png"

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

  const [menuOpen, setMenuOpen] = useState(false)

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

  function getServiceIcon(serviceName) {

    // Refresh
    if (serviceName === "Refresh") {
      return (
        <svg
          viewBox = "0 0 24 24"
          fill = "none"
          stroke = "currentColor"
          strokeWidth = "1.8"
          strokeLinecap = "round"
          strokeLinejoin = "round"
        >
          <path d = "M12 2.5C12 2.5 5.5 9.5 5.5 14.5C5.5 18.1 8.4 21 12 21C15.6 21 18.5 18.1 18.5 14.5C18.5 9.5 12 2.5 12 2.5Z" />
          <path d = "M9 15.5C9.5 17.2 10.7 18 12.2 18" />
        </svg>
      )
    }

    if (serviceName === "Full Reset") {
      return (
        <svg
          viewBox = "0 0 24 24"
          fill = "none"
          stroke = "currentColor"
          strokeWidth = "1.8"
          strokeLinecap = "round"
          strokeLinejoin = "round"
        >
          <path d = "M12 3L20 6V11C20 16 16.6 19.5 12 21C7.4 19.5 4 16 4 11V6L12 3Z" />
          <path d = "M8.5 12L11 14.5L16 9.5" />
        </svg>
      )
    }

    if (serviceName === "Exterior Only") {
      return (
        <svg
          viewBox = "0 0 24 24"
          fill = "none"
          stroke = "currentColor"
          strokeWidth = "1.8"
          strokeLinecap = "round"
          strokeLinejoin = "round"
        >
          <path d = "M5 11L7 6H17L19 11" />
          <path d = "M4 11H20C21.1 11 22 11.9 22 13V17H20V19H17V17H7V19H4V17H2V13C2 11.9 2.9 11 4 11Z" />
          <circle cx = "6.5" cy = "14" r = "1" />
          <circle cx = "17.5" cy = "14" r = "1" />
        </svg>
      )
    }

    if (serviceName === "Interior Only") {
      return (
        <svg
          viewBox = "0 0 24 24"
          fill = "none"
          stroke = "currentColor"
          strokeWidth = "1.8"
          strokeLinecap = "round"
          strokeLinejoin = "round"
        >
          <path d = "M12 3L13.2 7.8L18 9L13.2 10.2L12 15L10.8 10.2L6 9L10.8 7.8L12 3Z" />
          <path d = "M18.5 14L19.2 16.8L22 17.5L19.2 18.2L18.5 21L17.8 18.2L15 17.5L17.8 16.8L18.5 14Z" />
          <path d = "M5 14L5.6 16.4L8 17L5.6 17.6L5 20L4.4 17.6L2 17L4.4 16.4L5 14Z" />
        </svg>
      )
    }

    // Default icon for any other service
    return (
      <svg
        viewBox = "0 0 24 24"
        fill = "none"
        stroke = "currentColor"
        strokeWidth = "1.8"
        strokeLinecap = "round"
        strokeLinejoin = "round"
      >
        <path d = "M12 3L13.5 9L19.5 10.5L13.5 12L12 18L10.5 12L4.5 10.5L10.5 9L12 3Z" />
        <path d = "M19 15L19.7 17.3L22 18L19.7 18.7L19 21L18.3 18.7L16 18L18.3 17.3L19 15Z" />
      </svg>
    )
  }

  async function handleBooking() {

    if (firstName.trim() === "") {
      alert("Please enter your first name.")
      return
    }

    if (lastName.trim() === "") {
      alert("Please enter your last name.")
      return
    }

    if (email.trim() === "") {
      alert("Please enter your email.")
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.")
      return
    }

    if (phone.trim() === "") {
      alert("Please enter your phone number.")
      return
    }

    const phoneNumbersOnly = phone.replace(/\D/g, "")

    if (phoneNumbersOnly.length !== 10) {
      alert("Please enter a valid 10-digit phone number.")
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

  let navLinksClass = "nav-links"

  if (menuOpen) 
  {
    navLinksClass = "nav-links open"
  }

  return (

    <div>
      {/* Navigation bar (Header) */} 
      <nav className = "navbar">
        {/* Logo */}
        <a className = "logo" href = "#home">
          <img
            src = {murphLogo}
            alt = "Murph Detail"
          />
        </a>
        {/* Menu button (Mobile Only */}
        <button
          className = "menu-button"
          onClick = {() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
        {/* Navigation Links */}
        <div className = {navLinksClass}>

          <a
            href = "#home"
            onClick = {() => setMenuOpen(false)}
          >
            Home
          </a>

          <a
            href = "#services"
            onClick = {() => setMenuOpen(false)}
          >
            Services
          </a>

          <a
            href = "#contact"
            onClick = {() => setMenuOpen(false)}
          >
            Contact
          </a>
          {/* Custom booking button */}
          <a className = "book-nav-button" href = "#booking">

            <svg
              className = "calendar-icon"
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "2"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <rect x = "3" y = "5" width = "18" height = "16" rx = "2" />
              <line x1 = "16" y1 = "3" x2 = "16" y2 = "7" />
              <line x1 = "8" y1 = "3" x2 = "8" y2 = "7" />
              <line x1 = "3" y1 = "10" x2 = "21" y2 = "10" />
              <line x1 = "8" y1 = "14" x2 = "8" y2 = "14" />
              <line x1 = "12" y1 = "14" x2 = "12" y2 = "14" />
              <line x1 = "16" y1 = "14" x2 = "16" y2 = "14" />
              <line x1 = "8" y1 = "17" x2 = "8" y2 = "17" />
              <line x1 = "12" y1 = "17" x2 = "12" y2 = "17" />
            </svg>

            <span>Book Now</span>

          </a>

        </div>

      </nav>

      {/* Hero page (First block) */}
      <section className = "hero" id = "home">

        <div className = "hero-content">

          <div className = "hero-text">

            <p className = "hero-label">
              <span className = "hero-line"></span>
              ✦ Professional Automotive Detailing
            </p>

            <h1>
              Make Your Car
              <br />
              Look <span>New Again.</span>
            </h1>

            <p className = "hero-description">
              Quality automotive detailing with
              <br />
              the care your vehicle deserves.
            </p>
            {/* Custom booking button */}
            <a className = "hero-button" href = "#booking">
              <svg
                className = "hero-calendar-icon"
                viewBox = "0 0 24 24"
                fill = "none"
                stroke = "currentColor"
                strokeWidth = "2"
              >
                <rect x = "3" y = "5" width = "18" height = "16" rx = "2" />
                <line x1 = "16" y1 = "3" x2 = "16" y2 = "7" />
                <line x1 = "8" y1 = "3" x2 = "8" y2 = "7" />
                <line x1 = "3" y1 = "10" x2 = "21" y2 = "10" />
              </svg>

              Book a Detail
            </a>
            {/* Three benefits on the hero page */}
            <div className = "hero-benefits">

              <div className = "hero-benefit">
                <span className = "benefit-icon">✦</span>
                <p>Premium<br />Products</p>
              </div>

              <div className = "hero-divider"></div>

              <div className = "hero-benefit">
                <span className = "benefit-icon">✓</span>
                <p>Trusted<br />Professionals</p>
              </div>

              <div className = "hero-divider"></div>

              <div className = "hero-benefit">
                <span className = "benefit-icon">★</span>
                <p>Satisfaction<br />Guaranteed</p>
              </div>

            </div>

          </div>

          <div className = "hero-image">

            <img src = {heroCar} alt = "Professionally detailed sports car" />
          </div>

        </div>

      </section>

      {/* Service Section (Second block) */}
      <section className = "services" id = "services">

        <div className = "services-header">
          <div className = "services-label">

            <span className = "services-label-line"></span>
            <span className = "services-star">✦</span>

            <p className = "section-label">
              Our Services
            </p>

            <span className = "services-star">✦</span>
            <span className = "services-label-line"></span>

          </div>
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

            if (!servicePrice) {
              return null
            }

            if (servicePrice.duration_minutes === null) {
              return null
            }

            let priceDisplay

            if (servicePrice) {
              priceDisplay = `$${Number(servicePrice.price).toFixed(2)}`
            } else {
              priceDisplay = "Price unavailable"
            }

            let cardDurationDisplay = "Duration unavailable"

              if (servicePrice && servicePrice.duration_minutes !== null) {

                const totalMinutes = servicePrice.duration_minutes
                const hours = Math.floor(totalMinutes / 60)
                const minutes = totalMinutes % 60

                if (hours > 0 && minutes > 0) {
                  cardDurationDisplay = `${hours} hr ${minutes} min`
                } else if (hours > 0) {
                  cardDurationDisplay = `${hours} hr`
                } else {
                  cardDurationDisplay = `${minutes} min`
                }
              }

            return (
              <div className = "service-card" key = {service.service_id}>

                <div className = "service-icon">
                  {getServiceIcon(service.name)}
                </div>

                <h3>{service.name}</h3>

                <div className = "service-title-line"></div>

                <p className = "service-description">
                  {service.description}
                </p>

                <p className = "service-duration">

                  <svg
                    className = "duration-icon"
                    viewBox = "0 0 24 24"
                    fill = "none"
                    stroke = "currentColor"
                    strokeWidth = "2"
                    strokeLinecap = "round"
                    strokeLinejoin = "round"
                  >
                    <circle cx = "12" cy = "12" r = "9" />
                    <path d = "M12 7V12L15 14" />
                  </svg>

                  <span>
                    Duration: {cardDurationDisplay}
                  </span>

                </p>

                <p className = "service-price">
                  {priceDisplay}
                </p>

                <a
                  className = "service-book-button"
                  href = "#booking"
                >
                  Book Now
                </a>

              </div>
            )
          })}

        </div>

      </section>

      <section className = "booking" id = "booking">

        <div className = "booking-header">

          <div className = "booking-label">

            <span className = "booking-label-line"></span>

            <span className = "booking-star">✦</span>

            <p className = "section-label">
              Book Online
            </p>

            <span className = "booking-star">✦</span>

            <span className = "booking-label-line"></span>

          </div>

          <h2>Book Your Detail</h2>

          <p className = "booking-description">
            Enter your information below to get started.
          </p>

        </div>

        <div className = "booking-form">

          <div className = "information-header">

            <div className = "information-icon">

              <svg
                viewBox = "0 0 24 24"
                fill = "none"
                stroke = "currentColor"
                strokeWidth = "1.8"
                strokeLinecap = "round"
                strokeLinejoin = "round"
              >
                <circle cx = "12" cy = "8" r = "3.5" />
                <path d = "M5.5 20C5.5 16.4 8.4 13.5 12 13.5C15.6 13.5 18.5 16.4 18.5 20" />
              </svg>

            </div>

            <div className = "information-title">
              <h3>Your Information</h3>
              <span></span>
            </div>

          </div>

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

        

        <div className = "booking-option-header">

          <div className = "booking-option-icon">

            <svg
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "1.8"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <path d = "M5 11L7 7H17L19 11" />
              <path d = "M4 11H20C21.1 11 22 11.9 22 13V17H19V19H17V17H7V19H5V17H2V13C2 11.9 2.9 11 4 11Z" />
              <circle cx = "6.5" cy = "14" r = "1" />
              <circle cx = "17.5" cy = "14" r = "1" />
            </svg>

          </div>

          <h3>Vehicle Type</h3>

        </div>

        <div className = "booking-vehicle-selector">

          <button
            type = "button"
            className = {sedanClass}
            onClick = {() => setSelectedVehicle("Sedan")}
          >

            <svg
              className = "vehicle-icon"
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "1.8"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <path d = "M5 11L7 7H16L19 11" />
              <path d = "M4 11H20C21.1 11 22 11.9 22 13V17H19V19H17V17H7V19H5V17H2V13C2 11.9 2.9 11 4 11Z" />
              <circle cx = "6.5" cy = "14" r = "1" />
              <circle cx = "17.5" cy = "14" r = "1" />
            </svg>

            <span>Sedan</span>

          </button>

          <button
            type = "button"
            className = {suvClass}
            onClick = {() => setSelectedVehicle("SUV")}
          >

            <svg
              className = "vehicle-icon"
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "1.8"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <path d = "M4 11L6 6H17L20 11" />
              <path d = "M3 11H21V17H19V19H16V17H8V19H5V17H3V11Z" />
              <path d = "M8 6V11" />
              <path d = "M16 6V11" />
              <circle cx = "6.5" cy = "14" r = "1" />
              <circle cx = "17.5" cy = "14" r = "1" />
            </svg>

            <span>SUV</span>

          </button>

          <button
            type = "button"
            className = {truckClass}
            onClick = {() => setSelectedVehicle("Truck")}
          >

            <svg
              className = "vehicle-icon"
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "1.8"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <path d = "M3 7H13V16H3Z" />
              <path d = "M13 10H18L21 13V16H13Z" />
              <circle cx = "7" cy = "17" r = "2" />
              <circle cx = "18" cy = "17" r = "2" />
            </svg>

            <span>Truck</span>

          </button>

        </div>

        <div className = "booking-option-header">

          <div className = "booking-option-icon">

            <svg
              viewBox = "0 0 24 24"
              fill = "none"
              stroke = "currentColor"
              strokeWidth = "1.8"
              strokeLinecap = "round"
              strokeLinejoin = "round"
            >
              <path d = "M12 3L13.2 7.8L18 9L13.2 10.2L12 15L10.8 10.2L6 9L10.8 7.8L12 3Z" />
              <path d = "M18.5 14L19.2 16.8L22 17.5L19.2 18.2L18.5 21L17.8 18.2L15 17.5L17.8 16.8L18.5 14Z" />
            </svg>

          </div>

          <h3>Select Service</h3>

        </div>

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

              <span className = "booking-service-icon">
                {getServiceIcon(service.name)}
              </span>

              <span className = "booking-service-name">
                {service.name}
              </span>

            </button>
          )
        })}

        </div>

        <div className = "booking-schedule">

          <div className = "booking-date-section">

            <div className = "schedule-header">

              <div className = "schedule-icon">
                <svg
                  viewBox = "0 0 24 24"
                  fill = "none"
                  stroke = "currentColor"
                  strokeWidth = "1.8"
                  strokeLinecap = "round"
                  strokeLinejoin = "round"
                >
                  <rect x = "3" y = "5" width = "18" height = "16" rx = "2" />
                  <line x1 = "16" y1 = "3" x2 = "16" y2 = "7" />
                  <line x1 = "8" y1 = "3" x2 = "8" y2 = "7" />
                  <line x1 = "3" y1 = "10" x2 = "21" y2 = "10" />
                </svg>
              </div>

              <h3>Select Date</h3>

            </div>

            <div className = "form-group">
              <label>Appointment Date</label>

              <input
                type = "date"
                value = {appointmentDate}
                min = {today}
                onChange = {(event) => setAppointmentDate(event.target.value)}
              />
            </div>

          </div>

          <div className = "booking-time-section">

            <div className = "schedule-header">

              <div className = "schedule-icon">

                <svg
                  viewBox = "0 0 24 24"
                  fill = "none"
                  stroke = "currentColor"
                  strokeWidth = "1.8"
                  strokeLinecap = "round"
                  strokeLinejoin = "round"
                >
                  <circle cx = "12" cy = "12" r = "9" />
                  <path d = "M12 7V12L15 14" />
                </svg>

              </div>

              <h3>Select Time</h3>

            </div>

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

          </div>

        </div>

        {!bookingConfirmed && (

          <div className = "booking-summary">

            <div className = "summary-header">

              <div className = "summary-icon">

                <svg
                  viewBox = "0 0 24 24"
                  fill = "none"
                  stroke = "currentColor"
                  strokeWidth = "1.8"
                  strokeLinecap = "round"
                  strokeLinejoin = "round"
                >
                  <path d = "M9 11L12 14L20 6" />
                  <path d = "M20 12V19C20 20.1 19.1 21 18 21H5C3.9 21 3 20.1 3 19V6C3 4.9 3.9 4 5 4H15" />
                </svg>

              </div>

              <div className = "summary-title">
                <h3>Booking Summary</h3>
                <span></span>
              </div>

            </div>

            <div className = "summary-content">

              <div className = "summary-details">

                <div className = "summary-item">
                  <span>Service</span>
                  <strong>{serviceDisplay}</strong>
                </div>

                <div className = "summary-item">
                  <span>Vehicle</span>
                  <strong>{selectedVehicle}</strong>
                </div>

                <div className = "summary-item">
                  <span>Duration</span>
                  <strong>{durationDisplay}</strong>
                </div>

                <div className = "summary-item">
                  <span>Date</span>
                  <strong>{dateDisplay}</strong>
                </div>

                <div className = "summary-item">
                  <span>Time</span>
                  <strong>{timeDisplay}</strong>
                </div>

              </div>


              <div className = "summary-total">

                <span>Total</span>

                <strong>
                  {priceDisplay}
                </strong>

                <button
                  type = "button"
                  className = "submit-booking"
                  onClick = {handleBooking}
                >
                  Book Appointment
                  <span>→</span>
                </button>

              </div>

            </div>

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

      </div>

      </section>

      <section className = "contact" id = "contact">

        <div className = "contact-content">

          <div className = "contact-label">
            <span className = "contact-label-line"></span>

            <span className = "contact-star">✦</span>

            <p>GET IN TOUCH</p>

            <span className = "contact-star">✦</span>

            <span className = "contact-label-line"></span>
          </div>

          <h2>
            Ready to Get Your Vehicle Detailed?
          </h2>

          <p className = "contact-description">
            Have questions about a service or need help booking?
            Get in touch with Murph Detail.
          </p>

          <div className = "contact-buttons">

            <a href = "tel:0000000000">
              <svg
                viewBox = "0 0 24 24"
                fill = "none"
                stroke = "currentColor"
                strokeWidth = "2"
                strokeLinecap = "round"
                strokeLinejoin = "round"
              >
                <path d = "M22 16.92V19.92C22 21.02 21.1 21.92 20 21.92C10.06 21.92 2 13.86 2 3.92C2 2.82 2.9 1.92 4 1.92H7C7.55 1.92 8.05 2.15 8.41 2.52C8.77 2.89 8.97 3.4 8.95 3.95C8.87 5.14 8.66 6.3 8.31 7.4C8.15 7.9 8.27 8.45 8.64 8.82L10.1 10.28C11.39 12.55 13.27 14.43 15.54 15.72L17 14.26C17.37 13.89 17.92 13.77 18.42 13.93C19.52 14.28 20.68 14.49 21.87 14.57C22.97 14.64 22 15.82 22 16.92Z" />
              </svg>

              <span>Call Us</span>
            </a>


            <a href = "sms:0000000000">
              <svg
                viewBox = "0 0 24 24"
                fill = "none"
                stroke = "currentColor"
                strokeWidth = "2"
                strokeLinecap = "round"
                strokeLinejoin = "round"
              >
                <path d = "M21 15C21 16.1 20.1 17 19 17H8L3 21V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V15Z" />
              </svg>

              <span>Text Us</span>
            </a>

          </div>

        </div>

      </section>

      <footer className = "footer">

        <div className = "footer-content">

          <div className = "footer-brand">
            <img
              src = {murphLogo}
              alt = "Murph Detail"
            />

            <p>
              Professional automotive detailing.
            </p>

            <div className = "footer-socials">

              <a href = "#" aria-label = "Instagram">
                <svg
                  viewBox = "0 0 24 24"
                  fill = "none"
                  stroke = "currentColor"
                  strokeWidth = "1.8"
                  strokeLinecap = "round"
                  strokeLinejoin = "round"
                >
                  <rect x = "3" y = "3" width = "18" height = "18" rx = "5" />
                  <circle cx = "12" cy = "12" r = "4" />
                  <circle
                    cx = "17.5"
                    cy = "6.5"
                    r = "1"
                    fill = "currentColor"
                    stroke = "none"
                  />
                </svg>
              </a>

              <a href = "#" aria-label = "Facebook">
                <svg
                  viewBox = "0 0 24 24"
                  fill = "none"
                  stroke = "currentColor"
                  strokeWidth = "1.8"
                  strokeLinecap = "round"
                  strokeLinejoin = "round"
                >
                  <path d = "M14 8H17V4H14C10.7 4 9 6 9 9V11H6V15H9V21H13V15H16L17 11H13V9C13 8.3 13.3 8 14 8Z" />
                </svg>
              </a>

            </div>
          </div>

          <div className = "footer-links">
            <a href = "#home">Home</a>
            <a href = "#services">Services</a>
            <a href = "#booking">Book Now</a>
            <a href = "#contact">Contact</a>
          </div>

        </div>

        <div className = "footer-bottom">
          <p>© 2026 Murph Detail. All rights reserved.</p>
        </div>

      </footer>

    </div>
  )
}

export default App