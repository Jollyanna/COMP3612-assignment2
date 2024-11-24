const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";
const goToBeginning = "hold CTRL and click on this variable to return to the top!";

document.addEventListener("DOMContentLoaded", () => {
    // MAIN PROGRAM
    const goToMainStart = "hold CTRL and click on this variable to return to the top/bottom of the main program section!";
    
    setupRacesData();
    setupQualifyings();
    setupResults();
    setupFaveLists();

    const seasons = $("select#seasons");
    seasons.addEventListener("change", () => {
        const year = seasons.value;
        const key = `${year}Races`;
        const raceData = JSON.parse(localStorage.getItem(key));
        raceData.sort((a, b) => { if (a.round < b.round) return -1 });
        
        toggleMainView($("#home"), $("#browse"));

        loadRaces(year, raceData);

        eventClickResult(year, raceData);
    });

    const homeBtns = document.querySelectorAll("#homeBtn");
    homeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            location.reload();
        });
    });

    const faveBtn = $("#browse #faveBtn");
    faveBtn.addEventListener("click", () => {
        const favouritesDialog = $("dialog#favourites");
        const faveLists = ["faveCircuits", "faveDrivers", "faveConstructors"]
        const selectorLists = ["#favourites #circuits", "#favourites #drivers", "#favourites #constructs"];

        for (let i = 0; i < faveLists.length; i++) {
            loadFavourites(faveLists[i], selectorLists[i]);
        }
        
        favouritesDialog.show();

        eventCloseDialog("dialog#favourites", favouritesDialog);
        eventEmptyFavouriteLists();
    });

    goToMainStart;



    // HELPER FUNCTION DECLARATIONS AND EXPRESSIONS
    const goToHelperStart = "hold CTRL and click on this variable to return to the top/bottom of the helper functions section!";
    function $(selector) {
        return document.querySelector(selector);
    }
    
    // SETUP - retrieves and stores large data into the localStorage
    function setupRacesData() {
        const racesList = [2020, 2021, 2022, 2023];
        
        racesList.forEach((year) => {
            if (!localStorage.getItem(`${year}Races`)) {
                const url = `${domain}/races.php?season=${year}`;
                fetchAndStore(url, `${year}Races`);
            }
        });
    }
    function setupQualifyings() {
        const racesList = [2020, 2021, 2022, 2023];
        
        racesList.forEach((year) => {
            if (!localStorage.getItem(`${year}Qualifying`)) {
                const url = `${domain}/qualifying.php?season=${year}`;
                fetchAndStore(url, `${year}Qualifying`);
            }
        });
    }
    function setupResults() {
        const racesList = [2020, 2021, 2022, 2023];
        
        racesList.forEach((year) => {
            if (!localStorage.getItem(`${year}Results`)) {
                const url = `${domain}/results.php?season=${year}`;
                fetchAndStore(url, `${year}Results`);
            }
        });
    }
    function setupFaveLists() {
        const faveLists = ["faveCircuits", "faveDrivers", "faveConstructors"]
        faveLists.forEach(list => {
            if (!localStorage.getItem(list)) {
                localStorage.setItem(list, JSON.stringify([]));
            }
        });   
    }

    // FETCH - fetches the data from the web API
    // fetchAndStore() - fetches large data from the web API and stores it to the localStorage
    //                 - called within setup functions to avoid issues with timing, etc.
    function fetchAndStore(url, key) {
        console.log("key is not in local storage! fetching and storing...");
        
        fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error("error: fetch did not work!");
            }
        })
        .then(data => localStorage.setItem(key, JSON.stringify(data)))
        .catch(error => console.error("uh oh, an error occured: ", error));
    }
    // fetchAndLoad() - fetches and displays the dialogs/modals
    function fetchAndLoad(url, loadFunction) {
        fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error("error: fetch did not work!");
            }
        })
        .then(data => { loadFunction(data) })
        .catch(error => console.error("uh oh, an error occured: ", error));
    }

    // TOGGLE VIEWS - switches visibility for the chosen view(s)
    function toggleMainView(selector1, selector2) {
        selector1.classList.toggle("hidden");
        selector2.classList.toggle("hidden");
    }
    const hide = (selector) => selector.classList.add("hidden");
    const show = (selector) => selector.classList.remove("hidden");
    
    // LOAD - fills in the information needed and displays the views
    // loadRaces() - displays the list of races from the chosen year
    function loadRaces(year, raceData) {
        $("#races h3").innerHTML = "";
        $("#races h3").textContent = `${year} Races`;

        const racesTableData = $("#racesTable tbody");
        raceData.forEach(r => {
            const row       = document.createElement("tr");
            const round     = document.createElement("td");
            const name      = document.createElement("td");
            const resultBtn = document.createElement("td"); 
            const btn       = document.createElement("button");

            round.setAttribute("id", "round");
            round.textContent = r.round;
            
            name.setAttribute("id", "name");
            name.textContent = r.name;
            
            btn.setAttribute("id", `${r.name}`);
            btn.setAttribute("class", "p-2 m-2 text-lg inline-block rounded bg-indigo-750 text-cream-50 font-roboto_con hover:bg-cream-50 hover:text-blue-960 no-underline");
            btn.textContent = "Result";
            
            resultBtn.appendChild(btn);
            
            row.appendChild(round);
            row.appendChild(name);
            row.appendChild(resultBtn);

            racesTableData.appendChild(row);
        });

        const raceImg = $("#racesImage");
        const img = document.createElement("img");
        img.setAttribute("src", `images/${year}_raceImg.jpg`);
        img.setAttribute("alt", "A photo that corresponds to the chosen year.");
        raceImg.appendChild(img);
    }
    // loadRaceResultsDesc() - displays the brief description of the chosen race
    function loadRaceResultsDesc(e, year, raceData) {
        const result = raceData.find(result => result.name == e.target.id);
                
        $("#raceResultsDesc h3").innerHTML = "";
        $("#raceResultsDesc h3").textContent += `${year} ${e.target.id}`;
        
        const pList = document.querySelectorAll("#raceResultsDesc p span");
        const dataList = [result.name, result.round, result.year, result.circuit.name, result.date, result.url];
        let i = 0;
  
        pList.forEach(span => {
            span.innerHTML = "";            
            span.textContent += dataList[i];

            if (dataList[i] == `${result.circuit.name}`) {  
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-2 w-4");
                
                if (isInFavourite("faveCircuits", `${dataList[i]}`)) {
                    span.classList.add("flex");
                    span.appendChild(faveIcon);
                }
            }
            i++;
        });

        eventClickCircuit(result);
    }
    // loadQualifying() - displays the qualifying section for the chosen race
    function loadQualifying(e, year) {
        const key = `${year}Qualifying`;
        const qualifyData = JSON.parse(localStorage.getItem(key));
        const raceQualify = qualifyData.filter(q => q.race.name == e.target.id)
        
        raceQualify.sort((a, b) => { if (a.position < b.position) return -1 });
        
        const qualify = $("#qualify tbody");
        qualify.innerHTML = "";
        raceQualify.forEach(q => {
            const row       = document.createElement("tr");
            const pos       = document.createElement("td");
            const name      = document.createElement("td");
            const construct = document.createElement("td");
            const q1        = document.createElement("td");
            const q2        = document.createElement("td");
            const q3        = document.createElement("td");
            const tdList    = [pos, name, construct, q1, q2, q3];

            pos.textContent = q.position;
            q1.textContent = q.q1;
            q2.textContent = q.q2;
            q3.textContent = q.q3;
            
            for (let td of tdList) {
                if (td == name || td == construct) {
                    const btn = document.createElement("button");
                    const faveIcon = document.createElement("img");
                    faveIcon.setAttribute("src", "images/faved_icon.png");
                    faveIcon.setAttribute("class", "self-center mx-1 w-4");

                    if (td == name) {
                        btn.textContent = `${q.driver.forename} ${q.driver.surname}`;
                        if (isInFavourite("faveDrivers", `${q.driver.forename} ${q.driver.surname}`)) {
                            btn.appendChild(faveIcon);
                        }
                        td.setAttribute("id", "name");
                    }
                    else if (td == construct) {
                        btn.textContent = q.constructor.name;
                        if (isInFavourite("faveConstructors", q.constructor.name)) {
                            btn.appendChild(faveIcon);
                        }
                        td.setAttribute("id", "construct");
                    }
                    btn.setAttribute("class", "flex text-left hover:text-indigo-750");
                    td.appendChild(btn);
                }
                td.setAttribute("class", "pr-4");
                row.appendChild(td);
            }
            qualify.appendChild(row);
        });
        eventClickDriver(year, raceQualify);
        eventClickConstructor(year, raceQualify);
    }
    // loadRankingTable() - displays the ranking for the chosen race
    function loadRankingTable(year, raceResult) {
        const points = raceResult.sort((a, b) => { if (a.points > b.points) return 1 });
        const rankingTable = $("#result #ranking tbody");
        
        rankingTable.innerHTML = "";
        const row = document.createElement("tr");
        for (let i = 0; i < 3; i++) {
            const place = document.createElement("td");
            const btn = document.createElement("button");

            place.innerHTML = "";
            place.setAttribute("id", "name");

            btn.textContent = `${points[i].driver.forename} ${points[i].driver.surname}`;
            btn.setAttribute("class", "hover:text-indigo-750");
            
            place.appendChild(btn);
            row.appendChild(place);
        }
        rankingTable.appendChild(row);

        eventClickDriver(year, points);
    }
    // loadResultTable() - displays the result for the chosen race
    function loadResultTable(year, raceResult) {
        const result = raceResult.sort((a, b) => { if (a.position < b.position) return -1 });
        const resultTable = $("#result #resultTable tbody");
        
        resultTable.innerHTML = "";
        result.forEach(r => {
            const row = document.createElement("tr");
            const name = document.createElement("td");
            const pos = document.createElement("td");
            const construct = document.createElement("td");
            const laps = document.createElement("td");
            const pts = document.createElement("td");
            const tdList = [pos, name, construct, laps, pts];

            pos.textContent = r.position;
            laps.textContent = r.laps;
            pts.textContent = r.points;

            for (let td of tdList) {
                if (td == name || td == construct) {
                    const btn = document.createElement("button");
                    const faveIcon = document.createElement("img");
                    faveIcon.setAttribute("src", "images/faved_icon.png");
                    faveIcon.setAttribute("class", "self-center mx-1 w-4");

                    if (td == name) {
                        btn.textContent = `${r.driver.forename} ${r.driver.surname}`;
                        if (isInFavourite("faveDrivers", `${r.driver.forename} ${r.driver.surname}`)) {
                            btn.appendChild(faveIcon);
                        }
                        td.setAttribute("id", "name");
                    }
                    else if (td == construct) {
                        btn.textContent = r.constructor.name;
                        if (isInFavourite("faveConstructors", r.constructor.name)) {
                            btn.appendChild(faveIcon);
                        }
                        td.setAttribute("id", "construct");
                    }
                    btn.setAttribute("class", "flex text-left hover:text-indigo-750");
                    td.appendChild(btn);
                }
                td.setAttribute("class", "pr-4");
                row.appendChild(td);
            }
            resultTable.appendChild(row);
        });
        eventClickDriver(year, result);
        eventClickConstructor(year, result);
    }
    // loadResult() - displays the result section for the chosen race
    function loadResult(e, year) {
        const key = `${year}Results`;
        const resultData = JSON.parse(localStorage.getItem(key));
        const raceResult = resultData.filter(r => r.race.name == e.target.id);

        loadRankingTable(year, raceResult);

        loadResultTable(year, raceResult);
    }
    // CIRCUIT DIALOG
    // loadCircuit() - displays the circuit dialog
    function loadCircuit(circuitData) {
        const circuitName = $("#raceResultsDesc p#circuit");
        circuitName.addEventListener("click", () => {
            const circuitDialog = $("dialog#circuit");
            const pList = document.querySelectorAll("#circuitDetails p span");
            const dataList = [circuitData.name, circuitData.location, circuitData.country, circuitData.url];
            let i = 0;

            pList.forEach(span => {
                span.innerHTML = "";
                span.textContent += dataList[i];
                i++;
            });
            circuitDialog.show();
            
            eventAddToFavourites("dialog#circuit", "faveCircuits", "#circuitDetails p#name span", `${circuitData.name}`, refreshCircuit);
        });
    }
    // DRIVER DIALOG
    // loadDriverDetails() - displays the driver details section
    function loadDriverDetails(driverData) {
        const nameBtn = document.querySelectorAll("td#name button");
        nameBtn.forEach(d => {
            if (d.textContent == `${driverData.forename} ${driverData.surname}`) {
                const pList = document.querySelectorAll("#driverDetails p span");
                const age = 2024 - parseInt(driverData.dob.split("-", 1), 10);
                const dataList = [`${driverData.forename} ${driverData.surname}`, driverData.dob, age, driverData.nationality, driverData.url];
                let i = 0;

                pList.forEach(span => {
                    span.innerHTML = "";
                    span.textContent += dataList[i];
                    i++;
                });
                eventAddToFavourites("dialog#driver", "faveDrivers", "#driverDetails p#name span", `${driverData.forename} ${driverData.surname}`, refreshDriver);
            }
        });
    }
    // loadDriverRaceResults() - displays the driver's race results section
    function loadDriverRaceResults(driverResultData) {
        const key = `${driverResultData[0].year}Results`;
        const raceData = JSON.parse(localStorage.getItem(key));

        raceData.sort((a, b) => { if (a.round < b.round) return -1 });
        driverResultData.sort((a, b) => { if (a.round < b.round) return -1 });

        const results = raceData.filter(r => r.driver.ref == driverResultData[0].driverRef);
        const resultTable = $("#raceResultsDriver tbody");        
        let i = 0;

        resultTable.innerHTML = "";
        driverResultData.forEach(d => {
            const row = document.createElement("tr");
            const rnd = document.createElement("td");
            const name = document.createElement("td");
            const pos = document.createElement("td");
            const pts = document.createElement("td");
            const tdList = [rnd, name, pos, pts];
            const dataList = [d.round, d.name, d.positionOrder, results[i].points];
            
            for (let d = 0; d < tdList.length; d++) {
                tdList[d].textContent = dataList[d];
                tdList[d].setAttribute("class", "pr-5");
                row.appendChild(tdList[d]);
            }
            resultTable.appendChild(row);
            i++;
        });
    }
    // CONSTRUCTOR DIALOG
    // loadConstructorDetails() - displays the constructor details section
    function loadConstructorDetails(constructData) {
        const constructBtn = document.querySelectorAll("td#construct button"); 
        
        constructBtn.forEach(c => {
            if (c.textContent == constructData.name) {
                const pList = document.querySelectorAll("#constructDetails p span");
                const dataList = [constructData.name, constructData.nationality, constructData.url];
                let i = 0;

                pList.forEach(span => {
                    span.innerHTML = "";
                    span.textContent += dataList[i];
                    i++;
                });
                eventAddToFavourites("dialog#constructor", "faveConstructors", "#constructDetails p#name span", constructData.name, refreshConstructor);
            }
        });
    }
    // loadConstructorRaceResults() - displays the constructor's race results
    function loadConstructorRaceResults(constructResultData) {
        constructResultData.sort((a, b) => { if (a.round < b.round) return -1 });
        const resultTable = $("#raceResultsConstruct tbody");

        resultTable.innerHTML = "";
        constructResultData.forEach(c => {
            const row = document.createElement("tr");
            const rnd = document.createElement("td");
            const name = document.createElement("td");
            const driver = document.createElement("td");
            const pos = document.createElement("td");
            const tdList = [rnd, name, driver, pos];
            const dataList = [c.round, c.name, `${c.forename} ${c.surname}`, c.positionOrder];

            for (let i = 0; i < tdList.length; i++) {
                tdList[i].textContent = dataList[i];
                tdList[i].setAttribute("class", "pr-5");
                row.appendChild(tdList[i]);
            }
            resultTable.appendChild(row);
        });
    }
    // loadFavourites() - displays the list of favourite circuits, drivers, and constructors
    function loadFavourites(whichFaveArray, targetSelector) {
        const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));
        const ul = $(targetSelector);
        ul.innerHTML = "";
        
        if (aFaveList.length == 0) {
            const li = document.createElement("li");
            li.textContent = "nothing to see here!";
            li.setAttribute("class", "px-3 italic text-indigo-750");
            ul.appendChild(li);
        }
        else {
            aFaveList.forEach(fave => {
                const li = document.createElement("li");
                li.textContent = fave;
                li.setAttribute("class", "px-3");
                ul.appendChild(li);
            });
        }  
    }

    // EVENTS - handlers for certain events
    // eventClickResult() - event handler for clicking the [Result] button on the list of races for the chosen year
    function eventClickResult(year, raceData) {
        const racesTable = $("#racesTable tbody");
        racesTable.addEventListener("click", (e) => {
            if (e.target.nodeName == "BUTTON") {
                hide($("#racesImage"));
                show($("#raceResults"));

                loadRaceResultsDesc(e, year, raceData);
                loadQualifying(e, year);
                loadResult(e, year);
            }
        });
    }
    // DIALOG EVENT HANDLERS
    // eventClickCircuit() - event handler for clicking the circuit name on the chosen race's result description
    function eventClickCircuit(result) {
        const circuitId = result.circuit.id;
        const circuitDialog = $("dialog#circuit");
        const url = `${domain}/circuits.php?id=${circuitId}`;
        
        fetchAndLoad(url, loadCircuit);  

        eventCloseDialog("dialog#circuit", circuitDialog);
    };
    // eventClickDriver() - event handler for clicking a driver's name on the qualifying and result sections
    function eventClickDriver(year, data) {
        const nameBtn = document.querySelectorAll("td#name button");
        
        nameBtn.forEach(d => {
            d.addEventListener("click", () => {
                const findDriver = data.find(name => d.textContent == `${name.driver.forename} ${name.driver.surname}`);
                const driverId = findDriver.driver.id;
                const driverRef = findDriver.driver.ref;
                const driverDialog = $("dialog#driver");
                const url1 = `${domain}/drivers.php?id=${driverId}`; // single array
                const url2 = `${domain}/driverResults.php?driver=${driverRef}&season=${year}`;
                        
                fetchAndLoad(url1, loadDriverDetails);
                fetchAndLoad(url2, loadDriverRaceResults);

                driverDialog.show();

                eventCloseDialog("dialog#driver", driverDialog);
            });
        });
    }
    // eventClickConstructor() - event handler for clicking a constructor's name on the qualifying and result sections
    function eventClickConstructor(year, data) {
        const constructBtn = document.querySelectorAll("td#construct button");

        constructBtn.forEach(c => {
            c.addEventListener("click", () => {
                const findConstruct = data.find(construct => c.textContent == construct.constructor.name);
                const constructId = findConstruct.constructor.id;
                const constructRef = findConstruct.constructor.ref;
                const constructorDialog = $("dialog#constructor");
                const url1 = `${domain}/constructors.php?id=${constructId}`;
                const url2 = `${domain}/constructorResults.php?constructor=${constructRef}&season=${year}`;

                fetchAndLoad(url1, loadConstructorDetails);
                fetchAndLoad(url2, loadConstructorRaceResults);
                
                constructorDialog.show();

                eventCloseDialog("dialog#constructor", constructorDialog);
            });
        });
    }
    // eventCloseDialog() - event handler for closing a circuit, driver, constructor, and favourites dialog
    function eventCloseDialog(whichDialog, dialogSelector) {
        const closeBtn = document.querySelectorAll(`${whichDialog} button#close`);
        closeBtn.forEach(button => {
            button.addEventListener("click", () => {
                dialogSelector.close();
            });
        });
    }
    // eventAddToFavourites() - event handler for adding a circuit, driver, or a constructor to the favourites list
    function eventAddToFavourites(whichDialog, whichFaveArray, targetSelector, data, refreshFunction) {
        const faveBtn = $(`${whichDialog} button#addToFave`);
        const selector = $(targetSelector);
        
        faveBtn.addEventListener("mouseover", () => {
            const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));

            if (aFaveList.find(fave => fave == data) && data == selector.textContent) {
                faveBtn.innerHTML = "";
                faveBtn.textContent = "Favourited!";
            }
            else {
                faveBtn.innerHTML = "";
                faveBtn.textContent = "Favourite";
            }
        });
        faveBtn.addEventListener("mouseout", () => {
            faveBtn.innerHTML = "";
            faveBtn.textContent = "Favourite";
        });

        faveBtn.addEventListener("click", () => {
            const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));

            if (!aFaveList.find(fave => fave == data) && data == selector.textContent) {
                aFaveList.push(selector.textContent);
                localStorage.setItem(whichFaveArray, JSON.stringify(aFaveList));
                refreshFunction(data);
            }
        });
    }
    // eventEmptyFavouriteLists - clears every list of favourite circuits, drivers, and constructors in the favourites dialog
    function eventEmptyFavouriteLists() {
        const emptyFavesBtn = $("#favourites #empty");
        emptyFavesBtn.addEventListener("click", () => {
            const faveLists = ["faveCircuits", "faveDrivers", "faveConstructors"]
            const selectorLists = ["#favourites #circuits", "#favourites #drivers", "#favourites #constructs"];
            
            for (let i = 0; i < faveLists.length; i++) {
                localStorage.setItem(faveLists[i], JSON.stringify([]));
                loadFavourites(faveLists[i], selectorLists[i]);
            }

            removeFavedIcons();
            
        }); 
    }
    
    // OTHER
    // isInFavourite() - checks if a circuit/driver/constructor is in the favourites list
    function isInFavourite(whichFaveArray, name) {
        const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));
        let found;

        if (aFaveList.length == 0) {
            found = false;
        }
        else if (!aFaveList.find(f => f == name)) {
            found = false; 
        }
        else {
            found = true;
        }

        return found;
    }

    // UPDATE FAVOURITED ICONS - shows the icons beside a circuit/driver/constructor immediately after adding to favourites
    function refreshCircuit(data) {
        const circuit = $("#raceResultsDesc p#circuit span")
        const faveIcon = document.createElement("img");
        faveIcon.setAttribute("src", "images/faved_icon.png");
        faveIcon.setAttribute("class", "self-center mx-2 w-4");
        
        if (isInFavourite("faveCircuits", `${data}`)) {
            circuit.classList.add("flex");
            circuit.appendChild(faveIcon);
        }
    }
    function refreshDriver(data) {
        // driver name in the Qualifying section
        const driversQualify = document.querySelectorAll("#qualify tbody td#name button");
        driversQualify.forEach(driver => {
            if (driver.textContent == data) {
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-1 w-4");

                if (isInFavourite("faveDrivers", `${data}`)) {
                    driver.appendChild(faveIcon);
                }
            }
        });

        // driver name in the Result section
        const driversResult = document.querySelectorAll("#result #resultTable tbody td#name button");
        driversResult.forEach(driver => {
            if (driver.textContent == data) {
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-1 w-4");

                if (isInFavourite("faveDrivers", `${data}`)) {
                    driver.appendChild(faveIcon);
                }
            }
        });
    }
    function refreshConstructor(data) {
        // constructor name in the Qualifying section
        const constructorsQualify = document.querySelectorAll("#qualify tbody td#construct button");
        constructorsQualify.forEach(construct => {
            if (construct.textContent == data) {
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-1 w-4");

                if (isInFavourite("faveConstructors", `${data}`)) {
                    construct.appendChild(faveIcon);
                }
            }
        });

        // constructor name in the Result section
        const constructorsResult = document.querySelectorAll("#result #resultTable tbody td#construct button");
        constructorsResult.forEach(construct => {
            if (construct.textContent == data) {
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-1 w-4");

                if (isInFavourite("faveConstructors", `${data}`)) {
                    construct.appendChild(faveIcon);
                }
            }
        });
    }
    function removeFavedIcons() {
        const circuitIcon = $("#raceResultsDesc p#circuit span img");
        if (circuitIcon != null) {
            circuitIcon.remove();
        }

        const driverIconsQualify = document.querySelectorAll("#qualify tbody td#name button img");
        driverIconsQualify.forEach(icon => {
            if (icon != null) {
                icon.remove();
            }
        });
        const driverIconsResult = document.querySelectorAll("#result #resultTable tbody td#name button img");
        driverIconsResult.forEach(icon => {
            if (icon != null) {
                icon.remove();
            }
        });

        const constructorIconsQualify = document.querySelectorAll("#qualify tbody td#construct button img");
        constructorIconsQualify.forEach(icon => {
            if (icon != null) {
                icon.remove();
            }
        });
        const constructorIconsResult = document.querySelectorAll("#result #resultTable tbody td#construct button img");
        constructorIconsResult.forEach(icon => {
            if (icon != null) {
                icon.remove();
            }
        });
    }

    goToHelperStart;



    
});

goToBeginning;