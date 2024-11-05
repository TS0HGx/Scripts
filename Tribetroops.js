console.log("Enhanced Troop Counter Script is running!");

// Open the UI with filter options and a button to read data
function openUI() {
    alert("Opening Enhanced UI");
    const html = `
        <div>
            <h1>Tribe Troop Counter</h1>
            <fieldset>
                <legend>Settings</legend>
                <label>
                    <input type="radio" name="mode" id="of" value="members_troops" onclick="setMode('members_troops')"> Read troops of the village
                </label><br>
                <label>
                    <input type="radio" name="mode" id="in" value="members_defense" onclick="setMode('members_defense')"> Read defenses in the village
                </label>
            </fieldset>
            <fieldset>
                <legend>Filters</legend>
                <label for="unitSelect">Filter by unit:</label>
                <select id="unitSelect">
                    <option value="spear">Spear</option>
                    <option value="sword">Sword</option>
                    <option value="axe">Axe</option>
                </select>
                <label for="comparison">Comparison:</label>
                <select id="comparison">
                    <option value=">">></option>
                    <option value="<"><</option>
                </select>
                <input type="number" id="value" placeholder="Value">
                <button onclick="addFilter()">Add Filter</button>
                <div id="filterTable">${createFilterTable()}</div>
            </fieldset>
            <button onclick="readData()">Read Data</button>
        </div>
    `;
    document.body.innerHTML = html;
}

// Set the troop counter mode
function setMode(mode) {
    console.log("Setting mode to:", mode);
    localStorage.troopCounterMode = mode;
}

// Function to add filter to local storage
function addFilter() {
    const unit = document.getElementById("unitSelect").value;
    const comparison = document.getElementById("comparison").value;
    const value = document.getElementById("value").value;

    if (!value || isNaN(value)) {
        alert("Please enter a valid number for the filter.");
        return;
    }

    let filters = JSON.parse(localStorage.getItem("troopCounterFilter") || "{}");
    if (!filters[unit]) {
        filters[unit] = [];
    }
    filters[unit].push([comparison, value]);
    localStorage.setItem("troopCounterFilter", JSON.stringify(filters));

    console.log("Added filter:", unit, comparison, value);
    openUI(); // Refresh UI with updated filters
}

// Generate filter table HTML
function createFilterTable() {
    const filters = JSON.parse(localStorage.getItem("troopCounterFilter") || "{}");
    let tableHTML = "<table><tr><th>Unit</th><th>Comparison</th><th>Value</th></tr>";
    for (const unit in filters) {
        filters[unit].forEach(([comparison, value]) => {
            tableHTML += `<tr><td>${unit}</td><td>${comparison}</td><td>${value}</td></tr>`;
        });
    }
    tableHTML += "</table>";
    return tableHTML;
}

// Simulate reading data (replace with actual data fetching)
function readData() {
    console.log("Reading data...");
    
    // Placeholder data (replace this with actual data fetch)
    const troopData = [
        { coords: "123|456", player: "Player1", units: { spear: 10, sword: 20, axe: 15 } },
        { coords: "789|012", player: "Player2", units: { spear: 30, sword: 5, axe: 10 } }
    ];

    let csvData = "Coords,Player,Spear,Sword,Axe,Total Troops\n";
    troopData.forEach(data => {
        const totalTroops = data.units.spear + data.units.sword + data.units.axe;
        csvData += `${data.coords},${data.player},${data.units.spear},${data.units.sword},${data.units.axe},${totalTroops}\n`;
    });

    // Display the CSV in a text area and show download button
    document.body.innerHTML += `
        <div>
            <h3>Troop Data:</h3>
            <textarea style="width:100%;height:100px;" readonly>${csvData}</textarea><br>
            <button onclick="downloadCSV('${csvData}')">Download as CSV</button>
        </div>
    `;
}

// Download CSV data
function downloadCSV(data) {
    const filename = "troop_data.csv";
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(data));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log("CSV downloaded:", filename);
}

// Initialize UI
openUI();
