function openUI() {
    const html = `
    <head></head>
    <body>
        <h1>Tribe troop counter</h1>
        <form>
            <fieldset>
                <legend>Settings</legend>
                <p><input type="radio" name="mode" id="of" value="Read troops of the village" onchange="setMode('members_troops')">Read troops of the village</input></p>
                <p><input type="radio" name="mode" id="in" value="Read defenses in the village" onchange="setMode('members_defense')">Read defenses in the village</input></p>
            </fieldset>
            <fieldset>
                <legend>Filters</legend>
                <select id="variable">${createUnitOption()}</select>
                <select id="kind">
                    <option value=">">></option>
                    <option value="<"><</option>
                </select>
                <input type="text" id="value" placeholder="Enter value">
                <input type="button" class="btn evt-confirm-btn btn-confirm-yes" onclick="addFilter()" value="Save filter">
                <p>
                    <table>
                        <tr>
                            <th>Variable filtered</th>
                            <th>Operator</th>
                            <th>Value</th>
                            <th></th>
                        </tr>
                        ${createFilterTable()}
                    </table>
                </p>
            </fieldset>
            <div>
                <p><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="run" onclick="readData()" value="Read data"></p>
            </div>
        </form>
    </body>`;
    alert("UI Opened");
    console.log("Opening UI");
    document.body.innerHTML = html;

    if (localStorage.troopCounterMode) {
        document.getElementById(localStorage.troopCounterMode === "members_troops" ? "of" : "in").checked = true;
    } else {
        document.getElementById("of").checked = true;
    }
}

function setMode(mode) {
    localStorage.troopCounterMode = mode;
}

function getPlayerDict() {
    let playerDict = {};
    const now = new Date();
    const server = window.location.host;
    if (localStorage.playerDictFake) {
        const [savedServer, savedDate, savedDict] = localStorage.playerDictFake.split(":::");
        if (savedServer === server && now - new Date(savedDate) < 1000 * 60 * 60) {
            playerDict = JSON.parse(savedDict);
            return playerDict;
        }
    }
    const playerList = downloadInfo(`https://${server}/map/player.txt`).split("\n");
    playerList.forEach(line => {
        if (line) {
            const [id, name] = line.split(",");
            playerDict[id] = name.replace(/\+/g, " ");
        }
    });
    localStorage.playerDictFake = `${server}:::${now}:::${JSON.stringify(playerDict)}`;
    return playerDict;
}

function addFilter() {
    const filters = localStorage.troopCounterFilter ? JSON.parse(localStorage.troopCounterFilter) : {};
    const variable = document.getElementById("variable").value;
    const operator = document.getElementById("kind").value;
    const value = document.getElementById("value").value;
    if (!isNaN(value)) {
        if (!filters[variable]) filters[variable] = [];
        filters[variable].push([operator, value]);
        localStorage.troopCounterFilter = JSON.stringify(filters);
        openUI();
    } else {
        alert("Insert a valid value");
    }
}

function createUnitOption() {
    return game_data.units.map(unit => `<option value="${unit}">${unit}</option>`).join("");
}

function createFilterTable() {
    const filters = localStorage.troopCounterFilter ? JSON.parse(localStorage.troopCounterFilter) : {};
    return Object.entries(filters).map(([filter, conditions]) => 
        conditions.map((cond, idx) => `
            <tr>
                <td>${filter}</td>
                <td>${cond[0]}</td>
                <td>${cond[1]}</td>
                <td><input type="image" src="https://dsit.innogamescdn.com/asset/cbd6f76/graphic/delete.png" onclick="deleteFilter('${filter}', '${idx}')"></td>
            </tr>`
        ).join("")
    ).join("");
}

function deleteFilter(filter, idx) {
    const filters = JSON.parse(localStorage.troopCounterFilter || "{}");
    if (filters[filter]) {
        filters[filter].splice(parseInt(idx), 1);
        localStorage.troopCounterFilter = JSON.stringify(filters);
        openUI();
    }
}

function readData() {
    if (game_data.mode === "members") {
        alert("Reading data...");
        console.log("Starting data reading process");

        const mode = localStorage.troopCounterMode;
        const playerInfoList = Array.from(document.getElementsByClassName("vis")[2].rows).slice(1, -1).map(row => ({
            playerId: row.innerHTML.split("[")[1].split("]")[0],
            villageAmount: row.innerHTML.split("<td class=\"lit-item\">")[4].split("</td>")[0]
        }));

        const players = getPlayerDict();
        let data = "Coords,Player," + game_data.units.join(",") + ",Total Troops\n";
        let currentIndex = 0;
        let pageNumber = 1;

        (function loop() {
            if (currentIndex >= playerInfoList.length) {
                showData(data);
                return;
            }

            const playerId = playerInfoList[currentIndex].playerId;
            $.ajax({
                url: `https://${window.location.host}/game.php?screen=ally&mode=${mode}&player_id=${playerId}&page=${pageNumber}`,
                success(result) {
                    const villageRows = result.split("vis w100").pop().split("<tr>");
                    for (let j = 2; j < villageRows.length - 1; j++) {
                        const row = villageRows[j];
                        const [x, y] = row.match(/\d{1,3}\|\d{1,3}/g)[0].split("|");
                        const unitCounts = row.split(/<td class="">|<td class="hidden">/g).slice(1).map(unit => 
                            parseInt(unit.split("</td>")[0].replace(/\D/g, ""), 10) || 0
                        );
                        const totalTroops = unitCounts.reduce((sum, count) => sum + count, 0);
                        const villageData = `${x}|${y},${players[playerId]},${unitCounts.join(",")},${totalTroops}\n`;
                        data += villageData;
                    }

                    document.getElementById("bar").value = currentIndex / playerInfoList.length;
                    if (playerInfoList[currentIndex].villageAmount / 1000 > pageNumber) {
                        pageNumber++;
                    } else {
                        pageNumber = 1;
                        currentIndex++;
                    }
                    loop();
                }
            });
        })();
    }
}

function showData(data) {
    alert("Data read complete!");
    const html = `<h3>Troop count:</h3><textarea readonly style="width:100%;height:500px;">${data}</textarea><br><br><button onclick="download('troops.csv', data)">Download CSV</button>`;
    console.log("Displaying troop data");
    document.body.innerHTML = html;
}
