// Flight data model
export class Flight {
  constructor(data) {
    this.id = data.id;
    this.airline = data.airline;
    this.flightNumber = data.flightNumber;
    this.from = data.from;
    this.to = data.to;
    this.departureTime = data.departureTime;
    this.arrivalTime = data.arrivalTime;
    this.duration = data.duration; // in minutes
    this.price = data.price;
    this.stops = data.stops || 0;
    this.aircraft = data.aircraft;
    this.availableSeats = data.availableSeats;
    this.baggage = data.baggage;
    this.refundable = data.refundable || false;
    this.class = data.class || 'economy';
  }

  // Get formatted duration
  getFormattedDuration() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return `${hours}h ${minutes}m`;
  }

  // Get stops description
  getStopsDescription() {
    if (this.stops === 0) return 'Non-stop';
    if (this.stops === 1) return '1 Stop';
    return `${this.stops} Stops`;
  }

  // Get formatted price
  getFormattedPrice() {
    return `₹${this.price.toLocaleString()}`;
  }

  // Check if flight is available
  isAvailable() {
    return this.availableSeats > 0;
  }
}

// Flight search parameters model
export class FlightSearchParams {
  constructor(data) {
    this.from = data.from;
    this.to = data.to;
    this.departureDate = data.departureDate;
    this.returnDate = data.returnDate || null;
    this.passengers = data.passengers || 1;
    this.class = data.class || 'economy';
    this.tripType = data.tripType || 'oneWay';
  }

  // Validate search parameters
  validate() {
    const errors = {};

    if (!this.from?.trim()) {
      errors.from = 'Departure city is required';
    }

    if (!this.to?.trim()) {
      errors.to = 'Destination city is required';
    }

    if (this.from === this.to) {
      errors.to = 'Destination must be different from departure city';
    }

    if (!this.departureDate) {
      errors.departureDate = 'Departure date is required';
    }

    if (this.tripType === 'roundTrip' && !this.returnDate) {
      errors.returnDate = 'Return date is required for round trip';
    }

    if (this.returnDate && this.departureDate) {
      if (new Date(this.returnDate) <= new Date(this.departureDate)) {
        errors.returnDate = 'Return date must be after departure date';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Booking model
export class Booking {
  constructor(data) {
    this.id = data.id;
    this.bookingId = data.bookingId;
    this.flight = new Flight(data.flight);
    this.passengers = data.passengers || [];
    this.contactInfo = data.contactInfo;
    this.totalAmount = data.totalAmount;
    this.status = data.status || 'pending';
    this.bookingDate = data.bookingDate || new Date().toISOString();
    this.paymentStatus = data.paymentStatus || 'pending';
  }

  // Get booking status color
  getStatusColor() {
    switch (this.status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  }

  // Check if booking can be cancelled
  canBeCancelled() {
    const departureDate = new Date(`${this.flight.departureDate} ${this.flight.departureTime}`);
    const now = new Date();
    const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60);
    
    return this.status === 'confirmed' && hoursUntilDeparture > 24;
  }
}

// Passenger model
export class Passenger {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.age = data.age;
    this.gender = data.gender;
    this.seatNumber = data.seatNumber || null;
    this.mealPreference = data.mealPreference || 'standard';
  }

  // Get full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Validate passenger data
  validate() {
    const errors = {};

    if (!this.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!this.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!this.age || this.age < 0 || this.age > 120) {
      errors.age = 'Valid age is required';
    }

    if (!this.gender) {
      errors.gender = 'Gender is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Flight filters model
export class FlightFilters {
  constructor(data = {}) {
    this.priceRange = data.priceRange || [0, 50000];
    this.timeRange = data.timeRange || 'all';
    this.airlines = data.airlines || [];
    this.stops = data.stops || 'all';
    this.sortBy = data.sortBy || 'price';
  }

  // Apply filters to flight list
  applyFilters(flights) {
    let filtered = [...flights];

    // Price filter
    filtered = filtered.filter(flight => 
      flight.price >= this.priceRange[0] && flight.price <= this.priceRange[1]
    );

    // Time filter
    if (this.timeRange !== 'all') {
      filtered = filtered.filter(flight => {
        const hour = parseInt(flight.departureTime.split(':')[0]);
        switch (this.timeRange) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 24;
          case 'night': return hour >= 0 && hour < 6;
          default: return true;
        }
      });
    }

    // Airline filter
    if (this.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        this.airlines.includes(flight.airline)
      );
    }

    // Stops filter
    if (this.stops !== 'all') {
      filtered = filtered.filter(flight => {
        if (this.stops === 'nonstop') return flight.stops === 0;
        if (this.stops === '1stop') return flight.stops === 1;
        if (this.stops === '2+stops') return flight.stops >= 2;
        return true;
      });
    }

    // Sort flights
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price': return a.price - b.price;
        case 'duration': return a.duration - b.duration;
        case 'departure': return a.departureTime.localeCompare(b.departureTime);
        case 'arrival': return a.arrivalTime.localeCompare(b.arrivalTime);
        default: return 0;
      }
    });

    return filtered;
  }
}
