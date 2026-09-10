import {useEffect, useState} from 'react'
import './Admin.css'

function Admin() {
    
    const[appointments,setAppointments] = useState([])
    const [customers, setCustomers] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [services, setServices] = useState([])
    const [servicePrices, setServicePrices] = useState([])
    const [appointmentView, setAppointmentView] = useState("upcoming")
    const [adminLoading, setAdminLoading] = useState(true)
    const [adminError, setAdminError] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [adminPassword, setAdminPassword] = useState("")
    const [loginError, setLoginError] = useState("")
    const [adminToken, setAdminToken] = useState("")
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

    useEffect(() => {

        if (!adminToken) {
            return
        }

        fetch(`${API_URL}/appointments`, {headers: {"x-admin-token": adminToken}})
            .then(response => response.json())
            .then(data => {

                const sortedAppointments = data.sort((a, b) => {

                    const dateTimeA = new Date(
                    `${a.appointment_date}T${a.appointment_time}`
                    )

                    const dateTimeB = new Date(
                    `${b.appointment_date}T${b.appointment_time}`
                    )

                    return dateTimeA - dateTimeB
                })

                setAppointments(sortedAppointments)
                setAdminLoading(false)
            })
            .catch(error => {
                console.error("Error loading appointments:", error)
                setAdminError(true)
                setAdminLoading(false)
            })

    }, [adminToken])

    useEffect(() => {

        if (!adminToken) {
            return
        }

        fetch(`${API_URL}/customers`, {
            headers: {
                "x-admin-token": adminToken
            }
        })
            .then(response => response.json())
            .then(data => {
                setCustomers(data)
            })
            .catch(error => {
                console.error("Error loading customers:", error)
            })

    }, [adminToken])

    useEffect(() => {

        if (!adminToken) {
            return
        }

        fetch(`${API_URL}/vehicles`, {
            headers: {
                "x-admin-token": adminToken
            }
        })
            .then(response => response.json())
            .then(data => {
                setVehicles(data)
            })
            .catch(error => {
                console.error("Error loading vehicles:", error)
            })

    }, [adminToken])

        useEffect(() => {

            fetch(`${API_URL}/services`)
                .then(response => response.json())
                .then(data => {
                setServices(data)
                })
                .catch(error => {
                console.error("Error loading services:", error)
                })

            }, [])

        useEffect(() => {

            fetch(`${API_URL}/service-prices`)
                .then(response => response.json())
                .then(data => {
                setServicePrices(data)
                })
                .catch(error => {
                console.error("Error loading service prices:", error)
                })

        }, [])

        const handleAdminLogin = async () => {
            setLoginError("")

            try {
                const response = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: adminPassword
                })
                })

                if (response.status === 401) {
                    setLoginError("Incorrect password")
                    return
                }

                if (!response.ok) {
                    setLoginError("Server error. Please try again.")
                    return
                }

                const data = await response.json()

                setAdminToken(data.token)
                setIsLoggedIn(true)
                setAdminPassword("")

            } catch (error) {
                console.error("Admin login error:", error)
                setLoginError("Unable to connect to the server")
            }
        }

        const updateAppointmentStatus = async (appointmentId, newStatus) => {

            try {

                const response = await fetch(
                `${API_URL}/appointments/${appointmentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-token": adminToken
                    },
                    body: JSON.stringify({
                    status: newStatus
                    })
                }
                )

                if (!response.ok) {
                throw new Error("Failed to update appointment status")
                }

                const updatedAppointment = await response.json()

                setAppointments(currentAppointments =>
                currentAppointments.map(appointment => {

                    if (appointment.appointment_id === updatedAppointment.appointment_id) {
                    return updatedAppointment
                    }

                    return appointment
                })
                )

            } catch (error) {
                console.error("Error updating appointment status:", error)
            }

        }

    const now = new Date()

    const upcomingAppointments = appointments.filter(appointment => {

    const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
    )

    return appointmentDateTime >= now
    })

    const pastAppointments = appointments.filter(appointment => {

    const appointmentDateTime = new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
    )

    return appointmentDateTime < now
    })

    let displayedAppointments = upcomingAppointments

    if (appointmentView === "history") {
    displayedAppointments = pastAppointments
    }

    let upcomingButtonClass = "appointment-view-button"
    let historyButtonClass = "appointment-view-button"

    if (appointmentView === "upcoming") {
    upcomingButtonClass = "appointment-view-button active"
    }

    if (appointmentView === "history") {
    historyButtonClass = "appointment-view-button active"
    }

    if (!isLoggedIn) {
        return (
            <div className = "admin-login-page">

            <div className = "admin-login-card">

                <h1>Murph Detail</h1>
                <p>Admin Login</p>

                <input
                type = "password"
                placeholder = "Enter admin password"
                value = {adminPassword}
                onChange = {event => {
                    setAdminPassword(event.target.value)
                }}
                onKeyDown = {event => {
                    if (event.key === "Enter") {
                        handleAdminLogin()
                    }
                }}
                />

                <button onClick = {handleAdminLogin}>
                Login
                </button>

                {loginError && (
                <p className = "admin-login-error">
                    {loginError}
                </p>
                )}

            </div>

            </div>
        )
    }

    return (
        <div className = "admin-page">
            <div className = "admin-header">

                <div>
                    <h1>Murph Detail</h1>
                    <p>Admin Dashboard</p>
                </div>

                <div className = "admin-header-actions">

                    <div className = "admin-header-badge">
                        ADMIN
                    </div>

                    <button
                        className = "admin-logout-button"
                        onClick = {() => {
                            setAdminToken("")
                            setIsLoggedIn(false)
                            setAppointments([])
                            setCustomers([])
                            setVehicles([])
                            setServices([])
                            setServicePrices([])
                            setAdminLoading(true)
                            setAdminError(false)
                        }}
                    >
                        Logout
                    </button>

                </div>

            </div>

            <div className = "admin-summary">

                <div className = "admin-summary-card">
                    <span>Total Appointments</span>
                    <strong>{appointments.length}</strong>
                </div>

                <div className = "admin-summary-card">
                    <span>Pending</span>
                    <strong>
                    {appointments.filter(appointment => appointment.status === "Pending").length}
                    </strong>
                </div>

                <div className = "admin-summary-card">
                    <span>Completed</span>
                    <strong>
                    {appointments.filter(appointment => appointment.status === "Completed").length}
                    </strong>
                </div>

                <div className = "admin-summary-card">
                    <span>Cancelled</span>
                    <strong>
                    {appointments.filter(appointment => appointment.status === "Cancelled").length}
                    </strong>
                </div>

                </div>

            <div className = "admin-appointments">

                <h2>Appointments</h2>
                {adminLoading && (
                    <div className = "admin-loading">
                        <div className = "admin-spinner"></div>
                        <p>Loading appointments...</p>
                    </div>
                    )}

                    {adminError && (
                    <div className = "admin-error">
                        <p>Unable to load appointments. Please try again.</p>
                    </div>
                )}
                <div className = "appointment-view-buttons">

                    <button
                        className = {upcomingButtonClass}
                        onClick = {() => setAppointmentView("upcoming")}
                    >
                        Upcoming
                    </button>

                    <button
                        className = {historyButtonClass}
                        onClick = {() => setAppointmentView("history")}
                    >
                        History
                    </button>

                    </div>
                {!adminLoading && !adminError && (
                    <table className = "appointments-table">

                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Vehicle</th>
                            <th>Service</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>

                            {displayedAppointments.map(appointment => {

                                const appointmentDate = new Date(
                                `${appointment.appointment_date}T00:00:00`
                                )

                                const dateDisplay = appointmentDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                                })

                                const timeParts = appointment.appointment_time.split(":")

                                let hour = Number(timeParts[0])
                                const minute = timeParts[1]

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

                                const timeDisplay = `${hour}:${minute} ${period}`

                                const customer = customers.find(
                                customer => customer.customer_id === appointment.customer_id
                                )

                                let customerName = "Unknown Customer"

                                if (customer) {
                                customerName = `${customer.first_name} ${customer.last_name}`
                                }

                                let customerPhone = "N/A"
                                let customerEmail = "N/A"

                                if (customer) {
                                customerPhone = customer.phone
                                customerEmail = customer.email
                                }

                                const vehicle = vehicles.find(
                                vehicle => vehicle.vehicle_id === appointment.vehicle_id
                                )

                                let vehicleType = "Unknown Vehicle"

                                if (vehicle) {
                                vehicleType = vehicle.vehicle_type
                                }

                                const service = services.find(
                                service => service.service_id === appointment.service_id
                                )

                                let serviceName = "Unknown Service"

                                if (service) {
                                serviceName = service.name
                                }

                                const servicePrice = servicePrices.find(
                                price =>
                                    price.service_id === appointment.service_id &&
                                    price.vehicle_type === vehicleType
                                )

                                let priceDisplay = "N/A"

                                if (servicePrice) {
                                priceDisplay = `$${Number(servicePrice.price).toFixed(2)}`
                                }

                                return (
                                <tr key = {appointment.appointment_id}>
                                    <td>{appointment.appointment_id}</td>
                                    <td>{dateDisplay}</td>
                                    <td>{timeDisplay}</td>
                                    <td>{customerName}</td>
                                    <td>{customerPhone}</td>
                                    <td>{customerEmail}</td>
                                    <td>{vehicleType}</td>
                                    <td>{serviceName}</td>
                                    <td>{priceDisplay}</td>
                                    <td>
                                        <select
                                            className = "admin-status-select"
                                            value = {appointment.status}
                                            onChange = {event => {
                                            updateAppointmentStatus(
                                                appointment.appointment_id,
                                                event.target.value
                                            )
                                            }}
                                        >
                                            <option value = "Pending">Pending</option>
                                            <option value = "Completed">Completed</option>
                                            <option value = "Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                                )
                            })}

                            </tbody>

                    </table>
                )}

                </div>        
        </div>
    )
}

export default Admin