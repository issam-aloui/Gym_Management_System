// Revenue Chart

const ctx = document.getElementById("revenueChart").getContext("2d");

// Create gradient fill
const gradientFill = ctx.createLinearGradient(0, 0, 0, 280);
gradientFill.addColorStop(0, "rgba(232, 93, 4, 0.25)");
gradientFill.addColorStop(0.9, "rgba(232, 93, 4, 0.05)");
gradientFill.addColorStop(1, "rgba(232, 93, 4, 0)");

// Sample data - Revenue in thousands (DZD)
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const currentMonth = new Date().getMonth(); // Get current month (0-11)

// Last 12 months with current month as the last item
const labels = Array.from({ length: 12 }, (_, i) => {
  const month = (currentMonth - 11 + i + 12) % 12; // Calculate month index
  return monthNames[month];
});

const baseRevenue = 30;
const revenueData = Array.from({ length: 12 }, (_, i) => {
  const trendFactor = i * 1.5; // Gradual increase over time
  const seasonalFactor = Math.sin((i + 6) * 0.5) * 5; // Seasonal variations
  const randomFactor = Math.random() * 10 - 5; // Random fluctuations
  return Math.max(
    baseRevenue + trendFactor + seasonalFactor + randomFactor,
    20
  ).toFixed(1);
});

// Create a separate array for last year's data (lower than current)
const lastYearData = revenueData.map((val) =>
  (val * 0.8 - Math.random() * 5).toFixed(1)
);

// Chart configuration
const revenueChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Revenue 2025",
        data: revenueData,
        backgroundColor: gradientFill,
        borderColor: "#e85d04",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#e85d04",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#e85d04",
        pointHoverBorderWidth: 3,
        order: 1,
      },
      {
        label: "Revenue 2024",
        data: lastYearData,
        backgroundColor: "rgba(203, 213, 225, 0.2)",
        borderColor: "#cbd5e1",
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#cbd5e1",
        pointBorderWidth: 1.5,
        pointHoverRadius: 5,
        order: 2,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        bodyFont: {
          size: 13,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: "#e2e8f0",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": " + context.parsed.y + "k DZD";
          },
        },
        displayColors: true,
      },
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawBorder: false,
        },
        border: {
          dash: [4, 4],
        },
        ticks: {
          callback: function (value) {
            return value + "k";
          },
          padding: 10,
          color: "#64748b",
        },
        suggestedMax: 60,
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          padding: 10,
          color: "#64748b",
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        right: 20,
        left: 10,
        bottom: 10,
      },
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
    },
  },
});

// Update chart data when dropdown changes
document
  .querySelector(".chart-dropdown")
  .addEventListener("change", function (e) {
    const period = e.target.value;

    // Different data for different time periods
    if (period === "weekly") {
      const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const weeklyData = [42.5, 45.8, 39.2, 51.7];
      const lastYearWeekly = [38.2, 40.1, 35.8, 44.3];

      updateChart(revenueChart, weekLabels, weeklyData, lastYearWeekly);
    } else if (period === "daily") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dailyData = [9.5, 11.2, 10.8, 12.5, 14.8, 18.2, 15.7];
      const lastYearDaily = [8.2, 9.7, 9.3, 10.1, 12.8, 15.5, 13.2];

      updateChart(revenueChart, days, dailyData, lastYearDaily);
    } else {
      // Monthly (default)
      updateChart(revenueChart, labels, revenueData, lastYearData);
    }
  });

function updateChart(chart, labels, currentData, previousData) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = currentData;
  chart.data.datasets[1].data = previousData;
  chart.update();
}

// Add sorting functionality to table headers with three-state toggle
document.addEventListener("DOMContentLoaded", function () {
  // Get all table headers in the registration table
  const tableHeaders = document.querySelectorAll(".registrations-table th");

  // Track current sort state
  let currentSortColumn = null;
  let currentSortDirection = "none"; // 'none', 'asc', 'desc'

  // Store original order of rows
  let originalRows = null;

  // Add click event listener to each header
  tableHeaders.forEach((header, headerIndex) => {
    header.addEventListener("click", function () {
      const table = this.closest("table");
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));

      // Save original order if not already saved
      if (!originalRows) {
        originalRows = [...rows];
      }

      // Toggle sort direction or reset if clicking a different column
      if (currentSortColumn === headerIndex) {
        // Same column - toggle between asc, desc, none
        if (currentSortDirection === "none") {
          currentSortDirection = "asc";
        } else if (currentSortDirection === "asc") {
          currentSortDirection = "desc";
        } else {
          currentSortDirection = "none";
        }
      } else {
        // Different column - start with ascending
        currentSortColumn = headerIndex;
        currentSortDirection = "asc";
      }

      // Update visual indicators on all headers
      tableHeaders.forEach((h) => h.classList.remove("sorted", "asc", "desc"));

      if (currentSortDirection !== "none") {
        this.classList.add("sorted");
        this.classList.add(currentSortDirection);
      }

      // Restore original order if sorting is turned off
      if (currentSortDirection === "none") {
        originalRows.forEach((row) => tbody.appendChild(row));
        return;
      }

      // Sort the rows
      rows.sort((a, b) => {
        const aValue = a.children[headerIndex].textContent.trim();
        const bValue = b.children[headerIndex].textContent.trim();
        const isAscending = currentSortDirection === "asc";

        // Check if we're sorting dates (second column)
        if (headerIndex === 1) {
          // Parse dates in format DD.MM.YYYY · HH:MM AM/PM
          const aDateParts = aValue.split(" · ")[0].split(".");
          const bDateParts = bValue.split(" · ")[0].split(".");

          const aDate = new Date(
            parseInt("20" + aDateParts[2]), // Year (assuming 20xx)
            parseInt(aDateParts[1]) - 1, // Month (0-indexed)
            parseInt(aDateParts[0]) // Day
          );

          const bDate = new Date(
            parseInt("20" + bDateParts[2]),
            parseInt(bDateParts[1]) - 1,
            parseInt(bDateParts[0])
          );

          return isAscending ? aDate - bDate : bDate - aDate;
        }
        // For status column (third column), sort by status text
        else if (headerIndex === 2) {
          const aStatus = a.querySelector(".status-badge").textContent;
          const bStatus = b.querySelector(".status-badge").textContent;
          return isAscending
            ? aStatus.localeCompare(bStatus)
            : bStatus.localeCompare(aStatus);
        }
        // Default string comparison for other columns
        else {
          return isAscending
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      });

      // Re-append sorted rows to the tbody
      rows.forEach((row) => tbody.appendChild(row));
    });

    // Add cursor and subtle indicators that headers are clickable
    header.style.cursor = "pointer";
    header.classList.add("sortable");
  });
});
