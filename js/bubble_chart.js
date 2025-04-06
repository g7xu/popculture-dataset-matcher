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

    async function renderBubbleChart() {
        // Clear any existing SVG
        bubbleChartDiv.innerHTML = "";

        // Get the updated width and height of the bubble-chart div
        const width = bubbleChartDiv.clientWidth;
        const height = bubbleChartDiv.clientHeight;

        // Create an SVG element within the bubble-chart div
        const svg = d3.select(bubbleChartDiv)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "#0f3460");

        try {
            // Use the previously loaded data
            const latestData = cate_prop_data.reduce((latest, current) => {
                return new Date(current.record_time) > new Date(latest.record_time) ? current : latest;
            });

            const formattedData = Object.entries(latestData)
                .filter(([key, value]) => key !== "record_time")
                .map(([name, proportion]) => ({ name, proportion: +proportion }));

            const maxProp = d3.max(formattedData, d => d.proportion);
            const rescaledData = formattedData.map(d => ({
                name: d.name,
                proportion: (d.proportion / maxProp) * 100
            }));

            const nodes = rescaledData.map(d => ({
                ...d,
                r: Math.sqrt(d.proportion) * (5.7 * width / height),
                x: Math.random() * (width * 1.2) - width * 0.1,
                y: Math.random() * (height * 1.2) - height * 0.1
            }));

            const color = d3.scaleOrdinal(d3.schemeCategory10);

            const simulation = forceSimulation(nodes)
                .alphaDecay(0.01)
                .force("center", forceCenter(width / 2, height / 2))
                .force("collide", forceCollide(d => d.r + 20).strength(0.5))
                .force("x", d3.forceX(width / 2).strength(0.02))
                .force("y", d3.forceY(height / 2).strength(0.02))
                .on("tick", ticked);

            const circles = svg.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", d => d.r)
                .attr("fill", (d, i) => color(i))
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1);

            const labels = svg.selectAll("text")
                .data(nodes)
                .enter()
                .append("text")
                .attr("text-anchor", "middle")
                .text(d => d.name)
                .style("font-size", d => `${Math.max(d.r / 8, 8)}px`)
                .style("fill", "#ffffff");

            function ticked() {
                circles
                    .attr("cx", d => d.x = Math.max(d.r, Math.min(width - d.r, d.x)))
                    .attr("cy", d => d.y = Math.max(d.r, Math.min(height - d.r, d.y)));

                labels
                    .attr("x", d => d.x)
                    .attr("y", d => d.y + 4);
            }
        } catch (error) {
            bubbleChartDiv.innerHTML = "Failed to load bubble chart data.";
        }
    }

    // Initial render
    cate_prop_data = await loadCSVData("data/cate_trends.csv");
    renderBubbleChart();

    // Re-render on window resize
    window.addEventListener("resize", renderBubbleChart);
});