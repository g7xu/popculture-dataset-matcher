import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { forceSimulation, forceCollide, forceCenter } from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";

let cate_prop_data;

// Function to load CSV data
function loadCSVData(filePath) {
    return d3.csv(filePath)
        .then(data => {
            console.log("CSV Data Loaded:", data);
            return data;
        })
        .catch(error => {
            console.error("Error loading CSV data:", error);
            throw error;
        });
}

document.addEventListener("DOMContentLoaded", async () => {
    const bubbleChartDiv = document.querySelector(".bubble-chart");

    // Get the width and height of the bubble-chart div
    const width = bubbleChartDiv.clientWidth;
    const height = bubbleChartDiv.clientHeight;

    // Create an SVG element within the bubble-chart div
    const svg = d3.select(bubbleChartDiv)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background-color", "#0f3460");

    // Load the CSV file and log the data
    try {
        cate_prop_data = await loadCSVData("data/cate_trends.csv");
        console.log("Data successfully loaded in DOMContentLoaded:", cate_prop_data);

        // Find the data with the latest record_time
        const latestData = cate_prop_data.reduce((latest, current) => {
            return new Date(current.record_time) > new Date(latest.record_time) ? current : latest;
        });

        console.log("Latest Data:", latestData);

        // Convert latestData into a format suitable for simulation
        const formattedData = Object.entries(latestData)
            .filter(([key, value]) => key !== "record_time") // Exclude the record_time field
            .map(([name, proportion]) => ({ name, proportion: +proportion }));

        // Normalize and rescale the proportions
        const maxProp = d3.max(formattedData, d => d.proportion); // Find the maximum proportion
        const rescaledData = formattedData.map(d => ({
            name: d.name,
            proportion: (d.proportion / maxProp) * 100 // Normalize and scale to a range of 0-100
        }));

        // Add radius and initial positions to each data point
        const nodes = rescaledData.map(d => ({
            ...d,
            r: Math.sqrt(d.proportion) * 15, // Increase the multiplier to make circles larger
            x: Math.random() * (width * 1.2) - width * 0.1, // Scatter beyond the SVG bounds slightly
            y: Math.random() * (height * 1.2) - height * 0.1 // Scatter beyond the SVG bounds slightly
        }));

        // Create a color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Create a simulation
        const simulation = forceSimulation(nodes)
            .alphaDecay(0.01) // Reduce decay rate to slow down the simulation
            .force("center", forceCenter(width / 2, height / 2))
            .force("collide", forceCollide(d => d.r + 20).strength(0.5))
            .force("x", d3.forceX(width / 2).strength(0.02))
            .force("y", d3.forceY(height / 2).strength(0.02))
            .on("tick", ticked);

        // Add circles to the SVG
        const circles = svg.selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", d => d.r)
            .attr("fill", (d, i) => color(i))
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1);

        // Add labels to the circles
        const labels = svg.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .style("font-size", d => `${Math.min(d.r / 4, 10)}px`)
            .style("fill", "#ffffff");

        // Update positions on each tick
        function ticked() {
            circles
                .attr("cx", d => d.x = Math.max(d.r, Math.min(width - d.r, d.x))) // Restrict x within bounds
                .attr("cy", d => d.y = Math.max(d.r, Math.min(height - d.r, d.y))); // Restrict y within bounds

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y + 4); // Adjust label position slightly
        }
    } catch (error) {
        bubbleChartDiv.innerHTML = "Failed to load bubble chart data.";
    }
});