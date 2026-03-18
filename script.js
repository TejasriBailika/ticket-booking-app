const matches = [
  { home: "RCB", away: "CSK", venue: "Chinnaswamy Stadium" },
  { home: "SRH", away: "MI", venue: "Uppal Stadium" },
  { home: "MI", away: "KKR", venue: "Wankhede Stadium" },
  { home: "CSK", away: "RR", venue: "Chepauk Stadium" },
  { home: "KKR", away: "RCB", venue: "Eden Gardens" },
  { home: "SRH", away: "CSK", venue: "Uppal Stadium" },
  { home: "MI", away: "SRH", venue: "Wankhede Stadium" },
  { home: "RR", away: "MI", venue: "Jaipur Stadium" }
];

const grid = document.getElementById("matches-grid");
const details = document.getElementById("match-details");
const title = document.getElementById("match-title");
const stadium = document.getElementById("stadium-name");
const note = document.getElementById("home-ground-note");
const availability = document.getElementById("availability");
const stadiumBg = document.getElementById("stadium-bg");

const seatMap = document.getElementById("seat-map");
const selectedSeatsEl = document.getElementById("selected-seats");
const totalPriceEl = document.getElementById("total-price");
const bookBtn = document.getElementById("book-btn");

let selectedSeats = [];
let currentMatchKey = "";
const price = 500;


// 🎨 THEMES
function getTheme(team) {
  return {
    RCB: "rcb-theme",
    SRH: "srh-theme",
    MI: "mi-theme",
    CSK: "csk-theme"
  }[team] || "";
}


// 🔥 LOAD MATCHES
matches.forEach((m) => {
  const card = document.createElement("div");
  card.classList.add("match-card");

  card.innerHTML = `
    <h3>${m.home} vs ${m.away}</h3>
    <p>${m.venue}</p>
  `;

  card.onclick = () => selectMatch(m, card);
  grid.appendChild(card);
});


// 🔥 SELECT MATCH
async function selectMatch(match, card) {
  document.querySelectorAll(".match-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");

  currentMatchKey = `${match.home} vs ${match.away}`;

  title.innerText = currentMatchKey;
  stadium.innerText = match.venue;
  note.innerText = `Home ground of ${match.home}`;

  stadiumBg.className = "stadium-background";
  stadiumBg.classList.add(getTheme(match.home));

  generateSeats(6, 10);

  try {
    const res = await fetch(`/slots?match=${encodeURIComponent(currentMatchKey)}`);
    const data = await res.json();

    const bookedSeats = data.booked_seats || [];

    selectedSeats = [];

    document.querySelectorAll(".seat").forEach(seat => {
      seat.classList.remove("occupied");
      if (bookedSeats.includes(seat.innerText)) {
        seat.classList.add("occupied");
      }
    });

  } catch (err) {
    alert("Failed to load seats from server");
  }

  updateAvailability();
  updateSummary();

  details.style.display = "block";
}


// 🔥 GENERATE SEATS
function generateSeats(rows, cols) {
  seatMap.innerHTML = "";

  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.classList.add("row");

    for (let j = 1; j <= cols; j++) {
      const seat = document.createElement("div");
      seat.classList.add("seat");

      const seatId = String.fromCharCode(65 + i) + j;
      seat.innerText = seatId;

      seat.onclick = () => toggleSeat(seat);

      row.appendChild(seat);
    }

    seatMap.appendChild(row);
  }
}


// 🔥 TOGGLE SEAT
function toggleSeat(seat) {
  if (seat.classList.contains("occupied")) return;

  const id = seat.innerText;

  if (selectedSeats.includes(id)) {
    selectedSeats = selectedSeats.filter(s => s !== id);
    seat.classList.remove("selected");
  } else {
    selectedSeats.push(id);
    seat.classList.add("selected");
  }

  updateSummary();
}


// 🔥 UPDATE SUMMARY
function updateSummary() {
  selectedSeatsEl.innerText = selectedSeats.join(", ") || "None";
  totalPriceEl.innerText = selectedSeats.length * price;
  bookBtn.disabled = selectedSeats.length === 0;
}


// 🔥 UPDATE AVAILABILITY
function updateAvailability() {
  const total = document.querySelectorAll(".seat").length;
  const occupied = document.querySelectorAll(".seat.occupied").length;

  availability.innerText = `Seats Available: ${total - occupied} / ${total}`;
}


// 🔥 BOOK SEATS
bookBtn.onclick = async () => {
  if (selectedSeats.length === 0) return;

  const name = prompt("Enter your name:");
  const email = prompt("Enter your email:");

  if (!name || !email) {
    alert("Name and Email are required");
    return;
  }

  try {
    const res = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match: currentMatchKey,
        seats: selectedSeats,
        user_name: name,
        user_email: email
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Booking failed");
      return;
    }

    alert(`🎟 Booking Confirmed!\nSeats: ${selectedSeats.join(", ")}`);

    document.querySelectorAll(".seat").forEach(seat => {
      if (selectedSeats.includes(seat.innerText)) {
        seat.classList.remove("selected");
        seat.classList.add("occupied");
      }
    });

    selectedSeats = [];
    updateSummary();
    updateAvailability();

  } catch (err) {
    alert("Server error. Try again.");
  }
};


// 🔥 SHOW BOOKINGS
async function showBookings() {
  const container = document.getElementById("all-bookings");

  if (container.style.display === "block") {
    container.style.display = "none";
    return;
  }

  container.innerHTML = "<h2>📄 My Bookings</h2>";

  try {
    const res = await fetch('/bookings');
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML += "<p>No bookings yet.</p>";
      container.style.display = "block";
      return;
    }

    data.forEach(b => {
      const div = document.createElement("div");
      div.classList.add("booking-card");

      div.innerHTML = `
        <h3>${b.match}</h3>
        <p>🎟 Seats: ${b.seats.join(", ")}</p>
        <p>👤 ${b.user_name}</p>
        <p>⏱ ${b.time}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    container.innerHTML += "<p>Failed to load bookings</p>";
  }

  container.style.display = "block";
}