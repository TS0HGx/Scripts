// Start with a basic script check to see if it's loaded
console.log("Troop counter script is running!");

// Step 1: Basic UI Setup with Alert Check
function openUI() {
    alert("Opening UI");
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
            <button onclick="readData()">Read Data</button>
        </div>
    `;
    document.body.innerHTML = html;
}

// Step 2: Set Mode Function with Confirmation
function setMode(mode) {
    console.log("Setting mode to:", mode);
    localStorage.troopCounterMode = mode;
}

// Step 3: Read Data Function to Simulate Data Retrieval and Display
function readData() {
    console.log("Reading data...");

    // Simulated data for testing purposes
    const troopData = {
        coords: "123|456",
        player: "Player1",
        units: { spear: 10, sword: 20, axe: 15 }
    };

    // Format data as CSV
    const csvData = `Coords,Player,Spear,Sword,Axe,Total Troops\n${troopData.coords},${troopData.player},${troopData.units.spear},${troopData.units.sword},${troopData.units.axe},${troopData.units.spear + troopData.units.sword + troopData.units.axe}`;
    
    // Show result in an alert (for testing) or in the page
    alert("Troop Data:\n" + csvData);
    console.log("Troop data read successfully:", csvData);

    // Display the data in a text area for download
    document.body.innerHTML += `
        <div>
            <h3>Troop Data:</h3>
            <textarea style="width:100%;height:100px;" readonly>${csvData}</textarea>
        </div>
    `;
}

// Initialize UI
openUI();
