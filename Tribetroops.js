function readData() {
    if (game_data.mode == "members") {
        var html = '<label> Reading...     </label><progress id="bar" max="1" value="0">  </progress>';
        Dialog.show("Progress bar", html);
        filtres = {};
        if (localStorage.troopCounterFilter) {
            filtres = JSON.parse(localStorage.troopCounterFilter);
        }
        table = document.getElementsByClassName("vis");
        nMembers = table[2].rows.length;
        playerInfoList = [];
        for (i = 1; i < nMembers - 1; i++) {
            let playerId = table[2].rows[i].innerHTML.split("[")[1].split("]")[0];
            let villageAmount = table[2].rows[i].innerHTML.split("<td class=\"lit-item\">")[4].split("</td>")[0];
            playerInfoList.push({
                playerId: playerId,
                villageAmount: villageAmount
            });
        }
        mode = localStorage.troopCounterMode;
        data = "Coords,Player,";
        unitsList = game_data.units;
        for (k = 0; k < unitsList.length; k++) {
            data += unitsList[k] + ",";
        }
        data += "Total Troops,\n";  // Add column for total troops
        players = getPlayerDict();
        data += "\n";
        i = 0;
        let pageNumber = 1;
        (function loop() {
            page = $.ajax({
                url: "https://" + window.location.host + "/game.php?screen=ally&mode=" + mode + "&player_id=" + playerInfoList[i].playerId + "&page=" + pageNumber,
                async: false,
                function(result) {
                    return result.responseText;
                }
            });
            document.getElementById("bar").value = (i / playerInfoList.length);

            let temp = page.responseText.split("vis w100");

            if (temp.length === 2 || temp.length === 4) {
                rows = page.responseText.split("vis w100")[temp.length - 1].split("<tr>");
                step = 1;
                if (mode == "members_defense") {
                    step = 2;
                }
                for (j = 2; j + step < rows.length; j = j + step) {
                    villageData = {};

                    let coords = rows[j].match(/\d{1,3}\|\d{1,3}/g)[0].split("|");
                    villageData["x"] = coords[0];
                    villageData["y"] = coords[1];
                    units = rows[j].split(/<td class="">|<td class="hidden">/g);

                    // Initialize total troop count for the village
                    let totalTroops = 0;

                    for (k = 1; k < units.length; k++) {
                        let unitCount = parseInt(units[k].split("</td>")[0].replace(/ /g, "").replace(/\n/g, "").replace(/<spanclass="grey">\.<\/span>/g, "")) || 0;
                        villageData[unitsList[k - 1]] = unitCount;
                        totalTroops += unitCount; // Add to total
                    }

                    filtered = true; //filtered==true ok, ==false hide
                    for (key in filtres) {
                        for (k = 0; k < filtres[key].length; k++) {
                            if (filtres[key][k][0] === ">") {
                                if (parseInt(villageData[key]) < parseInt(filtres[key][k][1])) {
                                    filtered = false;
                                }
                            } else if (filtres[key][k][0] === "<") {
                                         
                                if (parseInt(villageData[key]) > parseInt(filtres[key][k][1])) {
                                    filtered = false;
                                }
                            }
                        }
                    }
                    if (filtered) {
                        data += villageData["x"] + "|" + villageData["y"] + ",";
                        data += players[playerInfoList[i].playerId] + ",";
                        for (k = 0; k < unitsList.length; k++) {
                            data += villageData[unitsList[k]] + ",";
                        }
                        data += totalTroops + ",";  // Add total troops to the data row
                        data += "\n";
                    }
                }
            }
            i++;

            if (temp.length === 4) {
                if (playerInfoList[i].villageAmount / 1000 > pageNumber) {
                    i--;
                    pageNumber++;
                } else {
                    pageNumber = 1;
                }
            }

            if (i < playerInfoList.length) {
                setTimeout(loop, 200);
            } else {
       
                showData(data, mode);
            }
        })();
    }
}
