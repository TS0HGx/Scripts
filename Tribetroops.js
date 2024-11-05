function showData(data) {
    // Ensure 'mode' is available globally or passed to this function if it's used in the popup message.
    let mode = localStorage.troopCounterMode || "N/A";

    // Generate HTML for the troop data display and download option
    const html = `
        <head></head>
        <body>
            <p><h2>Tribe Data</h2>Mode selected: ${mode}</p>
            <p><textarea style="width:100%;height:150px;" readonly>${data}</textarea></p>
            <p>
                <button class="btn evt-confirm-btn btn-confirm-yes" id="download" onclick="downloadCSV()">Download as CSV</button>
                <button class="btn evt-confirm-btn btn-confirm-no" onclick="openUI()">Back to Main Menu</button>
            </p>
        </body>
    `;

    Dialog.show("Tribe data", html);
}

// Updated downloadCSV function to work without passing parameters
function downloadCSV() {
    const dataText = document.querySelector("textarea").value;  // Grabs the text from the textarea
    const filename = "tribe_data.csv";
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(dataText));
    element.setAttribute("download", filename);
    
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    console.log("CSV downloaded:", filename);
}
