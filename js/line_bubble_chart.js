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

// Function to render the bubble chart
async function renderBubbleChart(bubbleChartDiv, cate_prop_data) {
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
            r: Math.sqrt(d.proportion) * (5.4 * width / height),
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

// Function to render the line chart
async function renderLineChart(lineChartDiv, cate_prop_data) {
    // Clear any existing SVG
    lineChartDiv.innerHTML = "";
    
    // Get the updated width and height of the line-chart div
    const width = lineChartDiv.clientWidth;
    const height = lineChartDiv.clientHeight;

    // Create an SVG element within the line-chart div
    const svg = d3.select(lineChartDiv)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Define margins and chart dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    try {
        // Parse the data for the last 7 days
        const parsedData = cate_prop_data.map(d => ({
            ...d,
            record_time: new Date(d.record_time)
        })).filter(d => d.record_time >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

        const categories = Object.keys(parsedData[0]).filter(key => key !== "record_time");

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(parsedData, d => d.record_time))
            .range([0, chartWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d3.max(categories, cat => +d[cat]))])
            .nice()
            .range([chartHeight, 0]);

        // Create axes
        const xAxis = d3.axisBottom(xScale).ticks(7).tickFormat(d3.timeFormat("%b %d"));
        const yAxis = d3.axisLeft(yScale).ticks(5); // Reduce the number of ticks on the y-axis

        // Append axes
        chart.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#ffffff");

        chart.append("g")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "#ffffff");

        // Create line generator with smooth curves
        const line = d3.line()
            .x(d => xScale(d.record_time))
            .y(d => yScale(d.value))
            .curve(d3.curveCatmullRom); // Apply smooth curve interpolation

        // Add lines for each category
        categories.forEach(category => {
            const categoryData = parsedData.map(d => ({
                record_time: d.record_time,
                value: +d[category]
            }));

            chart.append("path")
                .datum(categoryData)
                .attr("fill", "none")
                .attr("stroke", d3.schemeCategory10[categories.indexOf(category)])
                .attr("stroke-width", 2)
                .attr("d", line);
        });

    } catch (error) {
        lineChartDiv.innerHTML = "Failed to load line chart data.";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const bubbleChartDiv = document.querySelector(".bubble-chart");
    const lineChartDiv = document.querySelector(".line-chart");

    // Load data and render the charts
    cate_prop_data = await loadCSVData("data/cate_trends.csv");
    renderBubbleChart(bubbleChartDiv, cate_prop_data);
    renderLineChart(lineChartDiv, cate_prop_data);

    // Re-render on window resize
    window.addEventListener("resize", () => {
        renderBubbleChart(bubbleChartDiv, cate_prop_data);
        renderLineChart(lineChartDiv, cate_prop_data);
    });
});