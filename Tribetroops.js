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

    // Add CSV data and download button to the UI
    const outputDiv = document.createElement("div");
    outputDiv.innerHTML = `
        <h3>Troop Data:</h3>
        <textarea style="width:100%;height:100px;" readonly>${csvData}</textarea><br>
        <button onclick="downloadCSV('${csvData}')">Download as CSV</button>
    `;
    document.body.appendChild(outputDiv);  // Append to body to ensure it displays

    console.log("Data ready for download.");
}

// Download CSV data function (unchanged)
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
