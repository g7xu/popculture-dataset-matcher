import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { forceSimulation, forceCollide, forceCenter } from "https://cdn.jsdelivr.net/npm/d3-force@3/+esm";

let cate_prop_data;
let hotest_data;
let most_votes_data;

// Function to load CSV data
function loadCSVData(filePath) {
    return d3.csv(filePath)
        .then(data => {
            console.log("CSV Data Loaded successfully");
            return data;
        })
        .catch(error => {
            console.error("Error loading CSV data:", error);
            throw error;
        });
}

// Function to load json data
function loadJSONData(filePath) {
    return d3.json(filePath)
        .then(data => {
            console.log("JSON Data Loaded successfully", data);
            return data;
        })
        .catch(error => {
            console.error("Error loading JSON data:", error);
            throw error;
        });
}

// Function to create and display the welcome modal
function showWelcomeModal() {
    // Check if user has seen the modal before
    if (localStorage.getItem('welcomeModalSeen') === 'true') {
        return;
    }

    // Create modal container
    const modal = d3.select("body")
        .append("div")
        .attr("id", "welcome-modal")
        .style("position", "fixed")
        .style("left", "0")
        .style("top", "0")
        .style("width", "100%")
        .style("height", "100%")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("z-index", "2000")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center");

    // Create modal content
    const modalContent = modal.append("div")
        .style("width", "600px")
        .style("max-width", "90%")
        .style("background-color", "#2a2a40")
        .style("color", "#ffffff")
        .style("padding", "25px")
        .style("border-radius", "10px")
        .style("box-shadow", "0px 8px 24px rgba(0, 0, 0, 0.5)");

    // Add header
    modalContent.append("h2")
        .text("Welcome to Bubble Trends! 🫧🫧🫧")
        .style("margin-top", "0")
        .style("color", "#4dabf7");

    // Add instructions
    const instructions = modalContent.append("div")
        .style("margin-bottom", "20px");

    instructions.append("h3")
        .text("How to use this visualization:")
        .style("margin-bottom", "10px");

    const list = instructions.append("ul")
        .style("padding-left", "20px")
        .style("line-height", "1.6");

    list.append("li")
        .html("<strong>Bubble Chart:</strong> Shows popular pop culture categories. The size of each bubble represents the proportion of datasets in that category.");
    
    list.append("li")
        .html("<strong>Line Chart:</strong> Displays how category proportions have changed over time.");
    
    list.append("li")
        .html("<strong>Interaction:</strong> Click on any bubble to see related datasets in that category.");
    
    list.append("li")
        .html("<strong>Dataset Details:</strong> Each dataset shows its name, description, link, and download count.");

    // Add buttons
    const buttonContainer = modalContent.append("div")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("margin-top", "30px");

    buttonContainer.append("button")
        .text("Don't show again")
        .style("background-color", "transparent")
        .style("color", "#bbbbbb")
        .style("border", "1px solid #bbbbbb")
        .style("padding", "8px 16px")
        .style("border-radius", "5px")
        .style("cursor", "pointer")
        .on("click", function() {
            localStorage.setItem('welcomeModalSeen', 'true');
            modal.remove();
        });

    buttonContainer.append("button")
        .text("Got it!")
        .style("background-color", "#4dabf7")
        .style("color", "#ffffff")
        .style("border", "none")
        .style("padding", "8px 16px")
        .style("border-radius", "5px")
        .style("cursor", "pointer")
        .on("click", function() {
            modal.remove();
        });
}

// Function to parse and filter datasets by category
function getDatasetsByCategory(category, hotest_data, most_votes_data) {
    // Filter the hottest datasets by category
    const filteredHottest = hotest_data.filter(dataset => dataset.ai_category === category);

    // Filter the most voted datasets by category
    const filteredMostVotes = most_votes_data.filter(dataset => dataset.ai_category === category);

    // Combine the two lists
    const combinedDatasets = [...filteredHottest, ...filteredMostVotes];

    // Map the combined datasets to the required format
    return combinedDatasets.map(dataset => ({
        name: dataset.title,
        description: dataset.description,
        url: dataset.url,
        downloadCount: dataset.downloadCount,
    }));
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
        .attr("height", height);

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
            r: Math.sqrt(d.proportion) * (4.4 * width / height),
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
            .attr("stroke-width", 1)
            .on("mouseover", function () {
                d3.select(this)
                    .attr("stroke-width", 5); // Increase stroke width on hover
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke-width", 1); // Reset stroke width when mouse leaves
            })
            .on("click", function (event, d) {
                // Remove any existing pop-up box
                d3.select(".popup-box").remove();

                // Get mouse position relative to the window
                const mouseX = event.pageX;
                const mouseY = event.pageY;

                // Get datasets for the clicked category
                const datasets = getDatasetsByCategory(d.name, hotest_data, most_votes_data);

                // Sort the datasets by usability
                datasets.sort((a, b) => b.usabilityRating - a.usabilityRating);

                // Create a rectangle box
                const popupBox = d3.select("body")
                    .append("div")
                    .attr("class", "popup-box")
                    .style("position", "absolute")
                    .style("left", `${mouseX - 100}px`) // Adjust position for larger box
                    .style("top", `${mouseY - 50}px`)
                    .style("width", "500px") // Increase width
                    .style("height", "400px") // Increase height
                    .style("background-color", "#2a2a40") // Dark background for theme consistency
                    .style("color", "#ffffff") // White text for readability
                    .style("padding", "20px") // Add more padding for spacing
                    .style("border-radius", "10px") // Smooth rounded corners
                    .style("box-shadow", "0px 8px 16px rgba(0, 0, 0, 0.5)") // Enhance shadow for depth
                    .style("z-index", "1000") // Ensure it appears above other elements
                    .style("overflow-y", "auto"); // Enable scrolling for overflow content

                // Add the list of datasets
                const list = popupBox.append("ul")
                    .style("list-style", "none")
                    .style("padding", "0")
                    .style("margin", "0");

                datasets.forEach(dataset => {
                    const listItem = list.append("li")
                        .style("margin-bottom", "20px");

                    listItem.append("strong")
                        .text(dataset.name)
                        .style("display", "block")
                        .style("color", "#ffffff");

                    // Start a new line that contains the dataset URL and the download count
                    const linkContainer = listItem.append("div")
                        .style("display", "flex")
                        .style("justify-content", "space-between")
                        .style("align-items", "center")
                        .style("margin", "5px 0");

                    linkContainer.append("a")
                        .attr("href", dataset.url)
                        .attr("target", "_blank")
                        .text("View Dataset")
                        .style("color", "#4dabf7") // Light blue for links
                        .style("text-decoration", "none");

                    linkContainer.append("span")
                        .text(`${dataset.downloadCount || 0} downloads`)
                        .style("color", "#bbbbbb")
                        .style("font-size", "0.9rem");

                    listItem.append("span")
                        .text(dataset.description)
                        .style("font-size", "0.9rem")
                        .style("color", "#bbbbbb");
                });

                // Add a click listener to the document to close the pop-up box
                d3.select("body").on("click", function (event) {
                    const isClickInside = d3.select(event.target).classed("popup-box");
                    if (!isClickInside) {
                        d3.select(".popup-box").remove();
                        d3.select("body").on("click", null); // Remove the event listener
                    }
                });

                // Prevent the click event from propagating to the body
                event.stopPropagation();
            });

        const labels = svg.selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .text(d => d.name)
            .style("font-size", d => `${Math.max(d.r / 7.5, 7.5)}px`)
            .style("fill", "#ffffff")
            .text(d => {
                if (d.name === "Gaming & Interactive Media") {
                    return "Gaming & Media";
                } else if (d.name === "Film & Television Media") {
                    return "Film & TV";
                } else if (d.name === "Fandoms & Cultural Expression") {
                    return "Fandoms & Culture";
                } else if (d.name === "Music & Audio Trends") {
                    return "Music & Audio";
                } else {
                    return d.name;
                }
            })

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
        // Parse the last 7 rows of data
        const parsedData = cate_prop_data
            .map(d => ({
            ...d,
            record_time: new Date(d.record_time)
            }))
            .sort((a, b) => b.record_time - a.record_time)  // Sort by date descending
            .slice(0, 7)  // Take the latest 7 records
            .sort((a, b) => a.record_time - b.record_time); // Sort by date ascending for display

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

        // Append horizontal grid lines
        chart.append("g")
            .attr("class", "grid-lines")
            .selectAll("line")
            .data(yScale.ticks(5)) // Use the same ticks as the y-axis
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", chartWidth)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#444") // Light gray color for grid lines
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "4,4"); // Dashed lines for better visibility

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

        // Append y-axis label
        chart.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)") // Rotate the text to align with the y-axis
            .attr("x", -chartHeight / 2) // Center the label vertically along the y-axis
            .attr("y", -margin.left + 15) // Position the label to the left of the y-axis
            .attr("text-anchor", "middle") // Center the text horizontally
            .style("fill", "#ffffff") // Set the text color to white for visibility
            .style("font-size", "1rem") // Set the font size
            .text("Proportion"); // Set the label text

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
    hotest_data = await loadJSONData("data/hottest_datasets.json");
    most_votes_data = await loadJSONData("data/most_votes_datasets.json");

    renderBubbleChart(bubbleChartDiv, cate_prop_data);
    renderLineChart(lineChartDiv, cate_prop_data);
    
    // Create and show welcome modal
    showWelcomeModal();

    // Re-render on window resize
    window.addEventListener("resize", () => {
        renderBubbleChart(bubbleChartDiv, cate_prop_data);
        renderLineChart(lineChartDiv, cate_prop_data);
    });
});

