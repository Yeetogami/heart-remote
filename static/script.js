document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".data-card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.classList.add("hovered");
        });
        card.addEventListener("mouseleave", () => {
            card.classList.remove("hovered");
        });
    });
});

const ctx = document.getElementById("chart").getContext("2d");

// Create gradients for brutalist effect
const gradientHR = ctx.createLinearGradient(0, 0, 0, 400);
gradientHR.addColorStop(0, "rgba(255, 90, 138, 0.6)");
gradientHR.addColorStop(1, "rgba(255, 90, 138, 0)");

const gradientSpO2 = ctx.createLinearGradient(0, 0, 0, 400);
gradientSpO2.addColorStop(0, "rgba(0, 255, 127, 0.6)");
gradientSpO2.addColorStop(1, "rgba(0, 0, 0, 0)");

// Dynamic Axis Scaling
let minHR = 50, maxHR = 120;
let minSpO2 = 85, maxSpO2 = 100;

// ThingSpeak API Config
const THINGSPEAK_CHANNEL_ID = "2892010"; // Replace with your actual ThingSpeak Channel ID
const THINGSPEAK_API_KEY = "9JO2ULC3Q6PWCIIU"; // Replace with your ThingSpeak Read API Key
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=1`;

const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: Array(30).fill(""),
        datasets: [
            {
                label: "Heart Rate (BPM)",
                borderColor: "#ff5a8a",
                backgroundColor: gradientHR,
                data: [],
                tension: 0.4,
                fill: true
            },
            {
                label: "SpO2 (%)",
                borderColor: "#00ff7f",
                backgroundColor: gradientSpO2,
                data: [],
                tension: 0.4,
                fill: true
            }
        ]
    },
    options: {
        animation: { duration: 500 },
        scales: {
            x: { display: false },
            y: { min: minHR, max: maxHR } // Will be updated dynamically
        },
        responsive: true
    }
});

async function fetchData() {
    try {
        const response = await fetch("https://api.thingspeak.com/channels/YOUR_CHANNEL_ID/feeds.json?results=1");
        const data = await response.json();

        let heartRate = parseInt(data.feeds[0].field1);
        let spo2 = parseInt(data.feeds[0].field2);

        // If readings are 0 or invalid, display '--'
        document.getElementById("heartRate").innerText = heartRate > 0 ? heartRate : "--";
        document.getElementById("spo2").innerText = spo2 > 0 ? spo2 : "--";

        // Stop heart animation if no valid HR
        if (heartRate > 0) {
            document.querySelector(".beating-heart").style.animationDuration = `${60 / heartRate}s`;
        } else {
            document.querySelector(".beating-heart").style.animationDuration = "0s"; // Stop animation
        }

        // Update chart
        chart.data.datasets[0].data.push(heartRate > 0 ? heartRate : null);
        chart.data.datasets[1].data.push(spo2 > 0 ? spo2 : null);

        if (chart.data.datasets[0].data.length > 30) {
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }
        chart.update();

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


// Fetch data every 15 seconds (ThingSpeak free limit)
setInterval(fetchData, 15000);

// Initial Data Load
fetchData();
