/*------------------------------------------------------------------------------------------------------------------------*
 * COMP 3612 - Assignment 2
 * F1 Dashboard - Single-Page Application
 * HTML, Tailwind CSS, and Javascript  
 * ʚ Juliana Marie Tafalla ɞ
 * 
 * General Notes:
 *  - I was under the impression that every JS code is to be placed within the same file, 
 *    so while it made it easier to write, I understand it's quite a lot of code. I've
 *    done my best to organize the program's structure and its functions based on their common purpose, as listed below:
 *      // MAIN PROGRAM
 *          // ...
 *      // HELPER FUNCTION DECLARATIONS AND EXPRESSIONS
 *          // setup functions
 *          // fetch functions
 *          // toggle view(s) functions
 *          // load functions
 *          // events functions
 *          // update functions
 *          // other functions
 * 
 *  - The majority of the functions are documented to briefly explain their purpose. 
 *    The documentation is formatted as such:
 *      [function name] - [brief description]
 *          [input parameter(s), if any] - [brief description]
 *          [...] 
 * 
 *  - ...I didn't implement some sort of loading screen when the data is being fetched and stored to localStorage
 *    (all necessary data is fetched and stored automatically when the program first runs - ie. before choosing the season),
 *    so if the data hasn't been fetched yet, please wait a few seconds for the necessary data to be stored into localStorage
 *    before selecting a season!
--------------------------------------------------------------------------------------------------------------------------*/
const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

document.addEventListener("DOMContentLoaded", () => {
    // MAIN PROGRAM
    
    // sets up the necessary arrays by fetching data or creating empty arrays 
    // and storing them to localStorage
    setupRacesData();
    setupQualifyings();
    setupResults();
    setupFaveLists();

    // event handler for the majority of the program's functionality
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

    // event handler for the [Home] button and logo in both Home and Races views
    const homeBtns = document.querySelectorAll("#homeBtn");
    homeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            location.reload();
        });
    });

    // event handler for the [Favourites] button in Races view
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



    /* ʚɞ */



    // HELPER FUNCTION DECLARATIONS AND EXPRESSIONS
    function $(selector) {
        return document.querySelector(selector);
    }
    
    // SETUP - retrieves and stores large data into localStorage
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
    // setupFaveLists() - creates empty arrays for favourited circuits, drivers, and constructors,
    //                    if they don't exist yet
    function setupFaveLists() {
        const faveLists = ["faveCircuits", "faveDrivers", "faveConstructors"]
        faveLists.forEach(list => {
            if (!localStorage.getItem(list)) {
                localStorage.setItem(list, JSON.stringify([]));
            }
        });   
    }

    // FETCH - fetches the data from the web API
    // fetchAndStore() - fetches large data from the web API and stores it to localStorage
    //                 - called within setup functions to avoid issues with timing, etc.
    //      url - url of the data to be fetched
    //      key - name of the array to be stored in localStorage
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
    //      url          - url of the data to be fetched
    //      loadFunction - function that displays a dialog with the data fetched
    //                   - load functions for dialogs include: 
    //                      * loadCircuit()
    //                      * loadDriverDetails() and loadDriverRaceResults()
    //                      * loadConstructorDetails() and loadConstructorRaceResults()    
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
    //      year     - chosen season selected from Home view
    //      raceData - chosen season's race data (202XRaces in locaStorage)
    function loadRaces(year, raceData) {
        // title - 202X Races
        $("#races h3").innerHTML = "";
        $("#races h3").textContent = `${year} Races`;
        
        // table for the list of races and the [Result] buttons
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
            
            // [Result] button
            btn.setAttribute("id", `${r.name}`);
            btn.setAttribute("class", "p-2 m-2 text-lg inline-block rounded bg-indigo-750 text-cream-50 font-roboto_con hover:bg-cream-50 hover:text-blue-960 no-underline");
            btn.textContent = "Result";
            
            resultBtn.appendChild(btn);
            
            row.appendChild(round);
            row.appendChild(name);
            row.appendChild(resultBtn);

            racesTableData.appendChild(row);
        });
        // alternate the background colour for the table rows
        alternateRowColour("#racesTable tbody tr");

        // by default, an image will be displayed if the user hasn't pressed [Result] yet
        const raceImg = $("#racesImage");
        const img = document.createElement("img");
        img.setAttribute("src", `images/${year}_raceImg.jpg`);
        img.setAttribute("alt", "A photo that corresponds to the chosen year.");
        raceImg.appendChild(img);
    }
    // loadRaceResultsDesc() - displays the brief description of the chosen race
    //      e        - object that triggered an event (from eventClickResult())
    //      year     - chosen season selected from Home view
    //      raceData - chosen season's race data (202XRaces in locaStorage)
    function loadRaceResultsDesc(e, year, raceData) {
        const result = raceData.find(result => result.name == e.target.id);
                
        $("#raceResultsDesc h3").innerHTML = "";
        $("#raceResultsDesc h3").textContent = `Results For ${year} ${e.target.id}`;
        
        const pList = document.querySelectorAll("#raceResultsDesc p span");
        const dataList = [result.name, result.round, result.year, result.circuit.name, result.date, result.url];
        let i = 0;
  
        pList.forEach(span => {
            span.innerHTML = "";            
            span.textContent += dataList[i];
            
            // if the circuit is already in the Favourites list, append the favourited icon beside it 
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
        // displays the circuit dialog after clicking the [circuit] name
        eventClickCircuit(result);
    }
    // QUALIFYING SECTION
    // loadQualifying() - displays the qualifying section for the chosen race
    //      e    - object that triggered an event (from eventClickResult())
    //      year - chosen season selected from Home view
    function loadQualifying(e, year) {
        const key = `${year}Qualifying`;
        const qualifyData = JSON.parse(localStorage.getItem(key));
        const raceQualify = qualifyData.filter(q => q.race.name == e.target.id)
        
        // by default, the qualifying section is sorted by position... (ascending order)
        defaultSortingAndLoad(year, raceQualify, "position", "#qualifyTable button", fillQualify);
        
        // ...however, users can click on the table [headings] to switch the sorting order (ascending order)
        eventChangeSortingAndLoad(year, raceQualify, "#qualifyTable thead", "#qualifyTable button", fillQualify);
    }
    // fillQualify() - fills in the qualifying section; used in functions within loadQualifying() 
    //      year - chosen season selected from Home view
    //      data - chosen race's qualifying data (202XQualifying in localStorage)
    function fillQualify(year, data) {
        const qualify = $("#qualify tbody");
        qualify.innerHTML = "";
        data.forEach(q => {
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
                    
                    // if the driver and/or the constructor are already in the Favourites list,
                    // append the favourited icon beside it 
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
        // alternate the background colour for the table rows
        alternateRowColour("#qualify tbody tr");
        
        // displays the driver and/or constructor dialog after clicking the [driver] and/or [constructor] names 
        eventClickDriver(year, data);
        eventClickConstructor(year, data);
    }
    // RESULT SECTION
    // loadRankingTable() - displays the ranking for the chosen race
    //      year       - chosen season selected from Home view
    //      raceResult - chosen race's result data (202XResult in localStorage)
    function loadRankingTable(year, raceResult) {
        // sorts the chosen race's result by points (descending order)
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

        // displays the driver dialog after clicking the [driver] name
        eventClickDriver(year, points);
    }
    // loadResultTable() - displays the result for the chosen race
    //      year       - chosen season selected from Home view
    //      raceResult - chosen race's result data (202XResult in localStorage)
    function loadResultTable(year, raceResult) {
        // by default, the result section is sorted by position... (ascending order)
        defaultSortingAndLoad(year, raceResult, "position", "#resultTable button", fillResult);
        
        // ...however, users can click on the table [headings] to switch the sorting order (ascending order)
        eventChangeSortingAndLoad(year, raceResult, "#resultTable thead", "#resultTable button", fillResult);
    }
    // fillResult() - fills in the result table section; used in functions within loadResultTable() 
    //      year       - chosen season selected from Home view
    //      raceResult - chosen race's result data (202XResult in localStorage)
    function fillResult(year, data) {
        const resultTable = $("#result #resultTable tbody");
        resultTable.innerHTML = "";
        data.forEach(r => {
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
                    
                    // if the driver and/or the constructor are already in the Favourites list,
                    // append the favourited icon beside it
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
        // alternate the background colour for the table rows
        alternateRowColour("#result #resultTable tbody tr");

        // displays the driver and/or constructor dialog after clicking the [driver] and/or [constructor] names 
        eventClickDriver(year, data);
        eventClickConstructor(year, data);
    }
    // loadResult() - displays the result section for the chosen race
    //      e    - object that triggered an event (from eventClickResult())
    //      year - chosen season selected from Home view
    function loadResult(e, year) {
        const key = `${year}Results`;
        const resultData = JSON.parse(localStorage.getItem(key));
        // filters result data (202XResults) based on the id of the clicked [Result]
        const raceResult = resultData.filter(r => r.race.name == e.target.id);

        loadRankingTable(year, raceResult);

        loadResultTable(year, raceResult);
    }
    // CIRCUIT DIALOG
    // loadCircuit() - displays the circuit dialog
    //      circuitData - circuit data fetched from fetchAndLoad()
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
            
            // adds the circuit to the Favourites list after clicking [Favourite] 
            eventAddToFavourites("dialog#circuit", "faveCircuits", "#circuitDetails p#name span", `${circuitData.name}`, refreshCircuit);
        });
    }
    // DRIVER DIALOG
    // loadDriverDetails() - displays the driver details section
    //      driverData - driver data fetched from fetchAndLoad()
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
                // adds the driver to the Favourites list after clicking [Favourite] 
                eventAddToFavourites("dialog#driver", "faveDrivers", "#driverDetails p#name span", `${driverData.forename} ${driverData.surname}`, refreshDriver);
            }
        });
    }
    // loadDriverRaceResults() - displays the driver's race results section
    //      driverResultData - driver's race result data fetched from fetchAndLoad()  
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
        // alternate the background colour for the table rows
        alternateRowColour("#raceResultsDriver tbody tr");
    }
    // CONSTRUCTOR DIALOG
    // loadConstructorDetails() - displays the constructor details section
    //      constructData - constructor data fetched from fetchAndLoad()   
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
                // adds the constructor to the Favourites list after clicking [Favourite] 
                eventAddToFavourites("dialog#constructor", "faveConstructors", "#constructDetails p#name span", constructData.name, refreshConstructor);
            }
        });
    }
    // loadConstructorRaceResults() - displays the constructor's race results
    //      constructResultData - constructor's race result data fetched from fetchAndLoad()
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
        // alternate the background colour for the table rows
        alternateRowColour("#raceResultsConstruct tbody tr");
    }
    // loadFavourites() - displays the list of favourite circuits, drivers, and constructors
    //      whichFaveArray - the specific favourites array in localStorage
    //                     - favourites arrays in localStorage include:
    //                        * faveCircuits
    //                        * faveDrivers
    //                        * faveConstructors
    //      targetSelector - unordered list selector for circuit/driver/constructor in favourites dialog
    function loadFavourites(whichFaveArray, targetSelector) {
        const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));
        const ul = $(targetSelector);
        ul.innerHTML = "";
        
        // if a Favourites list was empty 
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
        // alternate the background colour for the list
        alternateRowColour(`${targetSelector} li`);  
    }

    // EVENTS - handlers for certain events
    // eventClickResult() - event handler for clicking the [Result] button on the list of races for the chosen year
    //      year     - chosen season selected from Home view
    //      raceData - chosen season's race data (202XRaces in locaStorage)
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
    // eventChangeSortingAndLoad() - event handler for clicking the headings in qualifying/result section to change order
    //                             - no matter the heading clicked, it will be sorted in ascending order
    //      year                 - chosen season selected from Home view
    //      data                 - data to change sorting order (either 202XQualifying or 202XResults)
    //      tableHeadingSelector - table heading selector for the qualifying/result tables
    //      headingsBtnsSelector - button selector for the qualifying/result table headings
    //      fillFunction         - fills in the specified section
    //                           - fill functions include:
    //                              * fillQualify
    //                              * fillResult
    function eventChangeSortingAndLoad(year, data, tableHeadingSelector, headingBtnsSelector, fillFunction) {
        const tableHeading = $(tableHeadingSelector);
        tableHeading.addEventListener("click", (e) => {
            const headingBtns = document.querySelectorAll(headingBtnsSelector);
            if (e.target.nodeName == "BUTTON") {
                // change the table [heading]'s format when it's clicked while resetting others
                headingBtns.forEach(h => {
                    h.classList.remove("italic");
                    h.classList.remove("text-indigo-750")
                    
                    if (h.id == e.target.id) {
                        h.classList.add("italic");
                        h.classList.add("text-indigo-750");
                        // sort the data according to the clicked table [heading] and re-display the section
                        sortDataBy(data, h.id);
                        fillFunction(year, data);
                    }
                });
            }
        });
    }
    // DIALOG EVENT HANDLERS
    // eventClickCircuit() - event handler for clicking the circuit name on the chosen race's result description
    //      result - race data (202XRaces in localStorage) filtered to the chosen race
    function eventClickCircuit(result) {
        const circuitId = result.circuit.id;
        const circuitDialog = $("dialog#circuit");
        const url = `${domain}/circuits.php?id=${circuitId}`;
        
        fetchAndLoad(url, loadCircuit);  
        // closes the dialog after clicking [Close]
        eventCloseDialog("dialog#circuit", circuitDialog);
    };
    // eventClickDriver() - event handler for clicking a driver's name on the qualifying and result sections
    //      year - chosen season selected from Home view
    //      data - chosen race's qualifying/result data (202XQualifying or 202XResult in localStorage)
    function eventClickDriver(year, data) {
        const nameBtn = document.querySelectorAll("td#name button");
        
        nameBtn.forEach(d => {
            d.addEventListener("click", () => {
                const findDriver = data.find(name => d.textContent == `${name.driver.forename} ${name.driver.surname}`);
                const driverId = findDriver.driver.id;
                const driverRef = findDriver.driver.ref;
                const driverDialog = $("dialog#driver");
                const url1 = `${domain}/drivers.php?id=${driverId}`;
                const url2 = `${domain}/driverResults.php?driver=${driverRef}&season=${year}`;
                        
                fetchAndLoad(url1, loadDriverDetails);
                fetchAndLoad(url2, loadDriverRaceResults);

                driverDialog.show();

                // closes the dialog after clicking [Close]
                eventCloseDialog("dialog#driver", driverDialog);
            });
        });
    }
    // eventClickConstructor() - event handler for clicking a constructor's name on the qualifying and result sections
    //      year - chosen season selected from Home view
    //      data - chosen race's qualifying/result data (202XQualifying or 202XResult in localStorage)
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

                // closes the dialog after clicking [Close]
                eventCloseDialog("dialog#constructor", constructorDialog);
            });
        });
    }
    // eventCloseDialog() - event handler for closing a circuit, driver, constructor, and favourites dialogs
    //      whichDialog    - specific dialog to select all [Close] buttons within the dialog
    //      dialogSelector - specific dialog selector for circuit/driver/constructor
    function eventCloseDialog(whichDialog, dialogSelector) {
        const closeBtn = document.querySelectorAll(`${whichDialog} button#close`);
        closeBtn.forEach(button => {
            button.addEventListener("click", () => {
                dialogSelector.close();
            });
        });
    }
    // eventAddToFavourites() - event handler for adding a circuit, driver, or a constructor to the favourites list
    //      whichDialog    - specific dialog to select [Add to Favourites] button within the dialog
    //      whichFaveArray - the specific favourites array in localStorage
    //                     - favourites arrays in localStorage include:
    //                        * faveCircuits
    //                        * faveDrivers
    //                        * faveConstructors 
    //      targetSelector  - selector that contains the item's name 
    //      data            - the item's name to be added
    //      refreshFunction - adds a favourited icon beside an item immediately
    //                      - refresh functions include:
    //                         * refreshCircuit
    //                         * refreshDriver
    //                         * refreshConstructor
    function eventAddToFavourites(whichDialog, whichFaveArray, targetSelector, data, refreshFunction) {
        const faveBtn = $(`${whichDialog} button#addToFave`);
        const selector = $(targetSelector);
        
        faveBtn.addEventListener("mouseover", () => {
            const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));
            // if the item is already in the Favourites list or right after adding an item to the Favourites list,
            // let users know it's been added when hovering over the [Favourite] button
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

        // adds the current circuit/driver/constructor being viewed to the respective Favourites list after clicking [Favourite]
        faveBtn.addEventListener("click", () => {
            const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));

            if (!aFaveList.find(fave => fave == data) && data == selector.textContent) {
                aFaveList.push(selector.textContent);
                localStorage.setItem(whichFaveArray, JSON.stringify(aFaveList));
                // adds a favourited icon beside an item immediately
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
                // re-displays the Favourites list after resetting the arrays in localStorage
                loadFavourites(faveLists[i], selectorLists[i]);
            }
            // removes all favourited icons beside an item immediately
            removeFavedIcons();
            
        }); 
    }
    
    // UPDATE FAVOURITED ICONS - shows the icons beside a circuit/driver/constructor immediately after adding to Favourites list
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
        // removes the icon beside a [circuit] name
        const circuitIcon = $("#raceResultsDesc p#circuit span img");
        if (circuitIcon != null) {
            circuitIcon.remove();
        }
        // removes all icons beside a [driver] name in the qualifying and result section
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
        // removes all icons beside a [constructor] name in the qualifying and result section
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

    // OTHER - other helper functions used in other functions
    // isInFavourite() - checks if a circuit/driver/constructor is in the favourites list
    //      whichFaveArray - the specific favourites array in localStorage
    //                     - favourites arrays in localStorage include:
    //                        * faveCircuits
    //                        * faveDrivers
    //                        * faveConstructors   
    //      name           - item's name to find in the chosen favourites array
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
    // sortDataBy() - sorts qualifying/results data by a chosen order
    function sortDataBy(data, sortBy) {
        if (sortBy == "name") {
            data.sort((a, b) => { if (a["driver"]["surname"] < b["driver"]["surname"]) return -1 });
        }
        else if (sortBy == "construct") {
            data.sort((a, b) => { if (a["constructor"]["name"] < b["constructor"]["name"]) return -1 });
        }
        else {
            data.sort((a, b) => { if (a[sortBy] < b[sortBy]) return -1 });
        }
    }
    // defaultSortingAndLoad() - sorts qualifying/results data in default order and displays the qualifying/result section
    //      year                 - chosen season selected from Home view
    //      data                 - data to change sorting order (either 202XQualifying or 202XResults)
    //      defaultSort          - sort by the chosen default order
    //      headingsBtnsSelector - button selector for the qualifying/result table headings
    //      fillFunction         - fills in the specified section
    //                           - fill functions include:
    //                              * fillQualify
    //                              * fillResult
    function defaultSortingAndLoad(year, data, defaultSort, headingBtnsSelector, fillFunction) {
        sortDataBy(data, defaultSort);

        const headingBtns = document.querySelectorAll(headingBtnsSelector);
        headingBtns.forEach(h => {
        h.classList.remove("italic");
        h.classList.remove("text-indigo-750");
        });

        fillFunction(year, data);
    }
    // alternateRowColour() - alternates the background colour of the given rows
    function alternateRowColour(whichRows) {
        const rows = document.querySelectorAll(whichRows);
        for (let i = 0; i < rows.length; i++) {
            if (i % 2 == 0) {
                rows[i].classList.add("bg-cream-50");
                rows[i].classList.add("bg-opacity-50");
            }
        }
    }
 
});
