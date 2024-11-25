const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

document.addEventListener("DOMContentLoaded", () => {
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

    // const homeBtn = $("#browse #homeBtn"); WORKS NOW
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
        // event handler for emptying the favourites list
        eventEmptyFavouriteLists();
    });














    // function declarations and expressions
    function $(selector) {
        return document.querySelector(selector);
    }

    // FETCH ALL DATA NEEDED
    // instead of only storing the user's selected season, store all the season
    // - doing it the first way kept giving me errors when trying to sort the data.
    //   it only works the second time the user chooses the same option, 
    //   since that data is already in local storage 
    function setupRacesData() {
        const racesList = [2020, 2021, 2022, 2023];
        racesList.forEach((year) => {
            if (!localStorage.getItem(`${year}Races`)) {
                const url = `${domain}/races.php?season=${year}`;
                fetchAndStore(url, `${year}Races`);
            }
        })
    }

    // see above
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

    // FETCHING
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

     // for fetching smaller data. dialogs will be loaded along the way
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

    // TOGGLE VIEWS
    function toggleMainView(selector1, selector2) {
        selector1.classList.toggle("hidden");
        selector2.classList.toggle("hidden");
    }

    const hide = (selector) => selector.classList.add("hidden");

    const show = (selector) => selector.classList.remove("hidden");

    // LOAD 
    function loadRaces(year, raceData) {
        // title
        $("#races h3").innerHTML = "";
        $("#races h3").textContent = `${year} Races`;

        // table
        const racesTableData = $("#racesTable tbody");
        raceData.forEach(r => {
            const row = document.createElement("tr");
            const round = document.createElement("td");
            const name = document.createElement("td");
            const resultBtn = document.createElement("td"); 
            const btn = document.createElement("button");

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
        altRowBackground("#racesTable tbody tr");

        // image
        const raceImg = $("#racesImage");
        const img = document.createElement("img");
        img.setAttribute("src", `images/${year}_raceImg.jpg`);
        img.setAttribute("alt", "A photo that corresponds to the chosen year.");
        raceImg.appendChild(img);
    }

    function loadRaceResultsDesc(e, year, raceData) {
        const result = raceData.find(result => result.name == e.target.id);
                
        $("#raceResultsDesc h3").innerHTML = "";
        $("#raceResultsDesc h3").textContent += `${year} ${e.target.id}`;
        
        const pList = document.querySelectorAll("#raceResultsDesc p span");
        const r = [result.name, result.round, result.year, result.circuit.name, result.date, result.url];
        let i = 0;

        pList.forEach(span => {
            span.innerHTML = "";            
            span.textContent += r[i];

            if (r[i] == `${result.circuit.name}`) {  
                const faveIcon = document.createElement("img");
                faveIcon.setAttribute("src", "images/faved_icon.png");
                faveIcon.setAttribute("class", "self-center mx-2 w-4");
                
                if (isInFavourite("faveCircuits", `${r[i]}`)) {
                    span.classList.add("flex");
                    span.appendChild(faveIcon);
                }
            }
            i++;
        });
        eventClickCircuit(result);
        
        
    }

   

    function loadQualifying(e, year) {
        const key = `${year}Qualifying`;
        const qualifyData = JSON.parse(localStorage.getItem(key));
        // find the chosen race's qualifying
        const raceQualify = qualifyData.filter(q => q.race.name == e.target.id)
        
        // default: sorted by position
        // must have a function that sorts this data first based on what heading was clicked!
        // to do: start the sorting functions       

        // test: sort by constructor
        // sortBy(...)
        // raceQualify.sort((a, b) => { if (a.position < b.position) return -1 });
        // WORKS! raceQualify.sort((a, b) => { if (a["constructor"]["name"] < b["constructor"]["name"]) return -1 });
        // WORKS! raceQualify.sort((a, b) => { if (a["driver"]["surname"] < b["driver"]["surname"]) return -1 });

        /*  default sorting
        sortDataBy(raceQualify, "position");

        // console.log("raceQualify sorted by name (position): ");
        // console.log(raceQualify);

        // reset the table headings format
        const headingBtns = document.querySelectorAll("#qualifyTable button");
        headingBtns.forEach(h => {
            h.classList.remove("italic");
            h.classList.remove("text-indigo-750")
        });

        // default display by position sorting
        fillQualify(raceQualify); */

        defaultSortingAndLoad(year, raceQualify, "position", "#qualifyTable button", fillQualify);
        

        eventChangeSortingAndLoad(year, raceQualify, "#qualifyTable thead", "#qualifyTable button", fillQualify);


        
        

        // eventClickDriver(year, raceQualify);
        // eventClickConstructor(year, raceQualify);
        // console.log("raceQualify in loadQualifying:");
        // console.log(raceQualify);
    }

    // MOVE TO OTHER!
    // sortBy: string
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

    } //

    function fillQualify(year, data) {
        // fillInQualify(...)
        const qualify = $("#qualify tbody");
        qualify.innerHTML = "";
        data.forEach(q => {
            const row = document.createElement("tr");
            const pos = document.createElement("td");
            const name = document.createElement("td");
            const construct = document.createElement("td");
            const q1 = document.createElement("td");
            const q2 = document.createElement("td");
            const q3 = document.createElement("td");
            const tdList = [pos, name, construct, q1, q2, q3];

            /*
            for (let d of tdList) {
                d.innerHTML = "";
            } NOT NEEDED SINCE qualify.innerHtml clears it all! */

            pos.textContent = q.position;
            // name.textContent = `${q.driver.forename} ${q.driver.surname}`;
            // construct.textContent = q.constructor.name;
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

        /* alternate row colours
        const rows = document.querySelectorAll("#qualify tbody tr");
        for (let i = 0; i < rows.length; i++) {
            if (i%2 == 0) {
                rows[i].classList.add("bg-cream-50");
                rows[i].classList.add("bg-opacity-60");
            }
        } */
        altRowBackground("#qualify tbody tr");

        


        eventClickDriver(year, data);
        eventClickConstructor(year, data);
    }

    function defaultSortingAndLoad(year, data, defaultSort, headingBtnsSelector, fillFunction) {
        sortDataBy(data, defaultSort);

        const headingBtns = document.querySelectorAll(headingBtnsSelector);
        headingBtns.forEach(h => {
        h.classList.remove("italic");
        h.classList.remove("text-indigo-750");
        });

        fillFunction(year, data);
    }

    // event handler for clicking on the table headings
    function eventChangeSortingAndLoad(year, data, tableHeadingSelector, headingBtnsSelector, fillFunction) {
        // const qualifyTableHeading = $("#qualifyTable thead");
        const tableHeading = $(tableHeadingSelector);
        tableHeading.addEventListener("click", (e) => {
            // const headingBtns = document.querySelectorAll("#qualifyTable button");
            const headingBtns = document.querySelectorAll(headingBtnsSelector);
            if (e.target.nodeName == "BUTTON") {
                // change the table heading's text format when it gets clicked
                headingBtns.forEach(h => {
                    h.classList.remove("italic");
                    h.classList.remove("text-indigo-750")
                    
                    if (h.id == e.target.id) {
                        h.classList.add("italic");
                        h.classList.add("text-indigo-750");
                        sortDataBy(data, h.id);
                        fillFunction(year, data);
                    }
                });
            }
        });
    }


    function loadRankingTable(year, raceResult) {
        const points = raceResult.sort((a, b) => { if (a.points > b.points) return 1 });
        const rankingTable = $("#result #ranking tbody");
        
        rankingTable.innerHTML = "";
        const row = document.createElement("tr");
        for (let i = 0; i < 3; i++) {
            const place = document.createElement("td");
            const btn = document.createElement("button");

            place.innerHTML = "";

            btn.textContent = `${points[i].driver.forename} ${points[i].driver.surname}`;
            btn.setAttribute("class", "hover:text-indigo-750");
            
            place.setAttribute("id", "name");
            place.appendChild(btn);

            row.appendChild(place);
        }
        rankingTable.appendChild(row);

        // console.log("points in loadRankingTable: ")
        // console.log(points);
        eventClickDriver(year, points);
    }

    function loadResultTable(year, raceResult) {
        // default: sorted by position
        // must have a function that sorts this data first based on what heading was clicked!
        // const result = raceResult.sort((a, b) => { if (a.position < b.position) return -1 });
        
        // fillResult(year, raceResult);

        defaultSortingAndLoad(year, raceResult, "position", "#resultTable button", fillResult);

        eventChangeSortingAndLoad(year, raceResult, "#resultTable thead", "#resultTable button", fillResult);

    }

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
       altRowBackground("#result #resultTable tbody tr");


        eventClickDriver(year, data);
        eventClickConstructor(year, data);
    }

    function loadResult(e, year) {
        const key = `${year}Results`;
        const resultData = JSON.parse(localStorage.getItem(key));
        // find the chosen race's result
        const raceResult = resultData.filter(r => r.race.name == e.target.id);

        // for ranking table
        loadRankingTable(year, raceResult);

        // for result table
        loadResultTable(year, raceResult);
    }

    function loadCircuit(circuitData) {
        const circuitName = $("#raceResultsDesc p#circuit");
        circuitName.addEventListener("click", () => {
            // select the dialog=circuit
            const circuitDialog = $("dialog#circuit");
            // select the spans in the div=circuitDetails
            const pList = document.querySelectorAll("#circuitDetails p span");
            const dataList = [circuitData.name, circuitData.location, circuitData.country, circuitData.url];
            let i = 0;

            pList.forEach(span => {
                span.innerHTML = "";
                span.textContent += dataList[i];
                i++;
            })

            circuitDialog.show();
    
            // event handler to add the circuit to the faveCircuits array in localStorage
            // eventAddToFaveCircuits(circuitData); 
            // testing [WORKS! <3]

            eventAddToFavourites("dialog#circuit", "faveCircuits", "#circuitDetails p#name span", `${circuitData.name}`, refreshCircuit);
            
                                  
        });
    }

    //
    function loadDriverDetails(driverData) {
        // const driverDialog = $("dialog#driver");
        const nameBtn = document.querySelectorAll("td#name button");
        nameBtn.forEach(d => {
            if (d.textContent == `${driverData.forename} ${driverData.surname}`) {
                // WORKS console.log(d.textContent);
                const pList = document.querySelectorAll("#driverDetails p span");
                // calculate age (basic caluclation/only by year orz)
                const age = 2024 - parseInt(driverData.dob.split("-", 1), 10);
                const dataList = [`${driverData.forename} ${driverData.surname}`, driverData.dob, age, driverData.nationality, driverData.url];
                let i = 0;

                pList.forEach(span => {
                    span.innerHTML = "";
                    span.textContent += dataList[i];
                    i++;
                });

                // eventAddToFaveDrivers(driverData);
                eventAddToFavourites("dialog#driver", "faveDrivers", "#driverDetails p#name span", `${driverData.forename} ${driverData.surname}`, refreshDriver);
            }
        })
    }

    /* [domain]/driverResults.php?driver=piastri&season=2023 for race results of a specific driver */  
    function loadDriverRaceResults(driverResultData) {
        // const driverRaceResults = $("#raceResultsDriver tbody");
        const key = `${driverResultData[0].year}Results`;
        // console.log(`${driverResultData[0].year}`);
        const raceData = JSON.parse(localStorage.getItem(key));
        raceData.sort((a, b) => { if (a.round < b.round) return -1 });
        driverResultData.sort((a, b) => { if (a.round < b.round) return -1 });

        // for the points
        const results = raceData.filter(r => r.driver.ref == driverResultData[0].driverRef);
        const resultTable = $("#raceResultsDriver tbody");
        
        /*
        console.log("results in loadDriverRaceResults: ");
        console.log(results);

        console.log("raceData in loadDriverRaceResults: ");
        console.log(raceData);
        */

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
            
            // WORKS! dataList.forEach(test => console.log(test));
            for (let d = 0; d < tdList.length; d++) {
                tdList[d].textContent = dataList[d];
                tdList[d].setAttribute("class", "pr-5");
                row.appendChild(tdList[d]);
            }
            resultTable.appendChild(row);
            i++;
        });
    }

    function loadConstructorDetails(constructData) {
        const constructBtn = document.querySelectorAll("td#construct button"); 
        constructBtn.forEach(c => {
            if (c.textContent == constructData.name) {
                // v console.log("loadConstructorDetails: " + constructData.name);
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

    function loadConstructorRaceResults(constructResultData) {
        // const key = `${constructResultData[0].year}Results`;
        // const raceData = JSON.parse(localStorage.getItem(key));
        
        // raceData.sort((a, b) => { if (a.round < b.round) return -1 });
        constructResultData.sort((a, b) => { if (a.round < b.round) return -1 });

        // const results = raceData.filter(r => r.constructor.id == constructResultData[0].);
        // console.log(constructResultData);
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

            // console.log("dataList: ");
            for (let i = 0; i < tdList.length; i++) {
                tdList[i].textContent = dataList[i];
                tdList[i].setAttribute("class", "pr-5");
                row.appendChild(tdList[i]);
            }
            resultTable.appendChild(row);
        });
    }

    function loadFavourites(whichFaveArray, targetSelector) {
        /*
        if (!localStorage.getItem(whichFaveArray)) {
            localStorage.setItem(whichFaveArray, JSON.stringify([]));
        } 
        */

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
                // console.log(li.textContent);
                li.setAttribute("class", "px-3");
                ul.appendChild(li);
            });
        }  
    }
    

    // EVENT HANDLERS
    
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
    // event handler for showing the circuit dialog
    function eventClickCircuit(result) {
        const circuitId = result.circuit.id;
        const circuitDialog = $("dialog#circuit");
        const url = `${domain}/circuits.php?id=${circuitId}`;
        
        fetchAndLoad(url, loadCircuit);  

        // event handler for closing the circuit dialog with the close buttons
        eventCloseDialog("dialog#circuit", circuitDialog);
    };

    // (!!!)
        // (!) event listener for clicking name or constructor (name for now! should be general enough to be used in Results too)
    function eventClickDriver(year, data) {
        const nameBtn = document.querySelectorAll("td#name button");
        
        nameBtn.forEach(d => {
            d.addEventListener("click", () => {
                // figure out which driver got clicked
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

    function eventClickConstructor(year, data) {
        const constructBtn = document.querySelectorAll("td#construct button");

        constructBtn.forEach(c => {
            c.addEventListener("click", () => {
                const findConstruct = data.find(construct => c.textContent == construct.constructor.name);
                // console.log(`findConstruct in eventClickConstructor:`);
                // console.log(findConstruct);
                const constructId = findConstruct.constructor.id;
                const constructRef = findConstruct.constructor.ref;
                const constructorDialog = $("dialog#constructor");
                const url1 = `${domain}/constructors.php?id=${constructId}`;
                const url2 = `${domain}/constructorResults.php?constructor=${constructRef}&season=${year}`;

                // console.log(url2); // for test

                fetchAndLoad(url1, loadConstructorDetails);
                fetchAndLoad(url2, loadConstructorRaceResults);
                
                constructorDialog.show();

                eventCloseDialog("dialog#constructor", constructorDialog);
            });
            
        });
    }

    // event handler for closing a dialog
    function eventCloseDialog(whichDialog, dialogSelector) {
        const closeBtn = document.querySelectorAll(`${whichDialog} button#close`);
        closeBtn.forEach(button => {
            button.addEventListener("click", () => {
                dialogSelector.close();
            });
        });
    }


    // MODIFY EVENT HANDLERS FOR ADDING TO FAVOURITES (WORKS!)
    function eventAddToFavourites(whichDialog, whichFaveArray, targetSelector, data, refreshFunction) {
        const faveBtn = $(`${whichDialog} button#addToFave`);
        const selector = $(targetSelector);
        
        /* if (!localStorage.getItem(whichFaveArray)) {
            localStorage.setItem(whichFaveArray, JSON.stringify([]));
        } */
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
        })
        faveBtn.addEventListener("mouseout", () => {
            faveBtn.innerHTML = "";
            faveBtn.textContent = "Favourite";
        })

        faveBtn.addEventListener("click", () => {
            const aFaveList = JSON.parse(localStorage.getItem(whichFaveArray));

            if (!aFaveList.find(fave => fave == data) && data == selector.textContent) {
                aFaveList.push(selector.textContent);
                localStorage.setItem(whichFaveArray, JSON.stringify(aFaveList));
                // when a circuit/driver/constructer is added to the favourites list, the favourited icon will appear immediately
                refreshFunction(data);
            }

        })
    }
    
    //
    function eventEmptyFavouriteLists() {
        const emptyFavesBtn = $("#favourites #empty");
        emptyFavesBtn.addEventListener("click", () => {
            const faveLists = ["faveCircuits", "faveDrivers", "faveConstructors"]
            const selectorLists = ["#favourites #circuits", "#favourites #drivers", "#favourites #constructs"];
            
            for (let i = 0; i < faveLists.length; i++) {
                localStorage.setItem(faveLists[i], JSON.stringify([]));
                loadFavourites(faveLists[i], selectorLists[i]);
            }

            // remove the icons immediately after clearing favourites
            removeFavedIcons();
            
        }); 
    }

    // helper function to see if a circuit/name/constructor is in the list
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
    function altRowBackground(whichRows) {
        const rows = document.querySelectorAll(whichRows);
        for (let i = 0; i < rows.length; i++) {
            if (i%2 == 0) {
                rows[i].classList.add("bg-cream-50");
                rows[i].classList.add("bg-opacity-50");
            }
        }
    }


    // event handler for adding to favourite circuits in localStorage (no longer generalized to make it specific for each list)  
    function eventAddToFaveCircuits(circuitData) {
        const faveBtn = $("dialog#circuit button#addToFave");
        const circuitName = $("#circuitDetails p#name span");
        
        // if the array doesn't exist yet in localStorage, create one
        if (!localStorage.getItem("faveCircuits")) {
            // console.log(`${addTo} does not exist in local storage!`);
            localStorage.setItem("faveCircuits", JSON.stringify([]));
        }

        // event to show that a circuit is/has been added to the faveCircuits array
        faveBtn.addEventListener("mouseover", () => {
            const aFaveList = JSON.parse(localStorage.getItem("faveCircuits"));

            if (aFaveList.find(fave => fave == circuitData.name) && circuitData.name == circuitName.textContent) {
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

        // event to add the chosen circuit to the faveCircuits array
        faveBtn.addEventListener("click", () => {
            const aFaveList = JSON.parse(localStorage.getItem("faveCircuits"));

            if (!aFaveList.find(fave => fave == circuitData.name) && circuitData.name == circuitName.textContent) {
                aFaveList.push(circuitName.textContent);
                // console.log("pushing: " + circuitName.textContent);
                localStorage.setItem("faveCircuits", JSON.stringify(aFaveList));
            }
        });
    }

    // FUCKING FINALLY I THINK ITS DONEEEEEE???
    // is it possible to generalize the eventAddToFavourites? (parameter has to be a specific value/field - ie. data = `${driverData.forename} ${driverData.surname}` or `${circuitData.name}`)
    function eventAddToFaveDrivers(driverData) {
        const faveBtn = $("dialog#driver button#addToFave");
        const driverName = $("#driverDetails p#name span");
        // there's nothing here when it gets run (delayed or whatever)
        
        // console.log(driverName.textContent);

        // if the array doesn't exist yet in localStorage, create one
        if (!localStorage.getItem("faveDrivers")) {
            console.log(`faveDrivers does not exist in local storage!`);
            localStorage.setItem("faveDrivers", JSON.stringify([]));
        }

        // event to show that a circuit is/has been added to the faveCircuits array
        faveBtn.addEventListener("mouseover", () => {
            const aFaveList = JSON.parse(localStorage.getItem("faveDrivers"));

            // driverData.forename and driverData.surname
            
            if (aFaveList.find(fave => fave == `${driverData.forename} ${driverData.surname}`) && 
                driverName.textContent == `${driverData.forename} ${driverData.surname}`) {
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

        // event to add the chosen circuit to the faveCircuits array
        faveBtn.addEventListener("click", () => {
            const aFaveList = JSON.parse(localStorage.getItem("faveDrivers"));

            if (!aFaveList.find(fave => fave == `${driverData.forename} ${driverData.surname}`) && 
            driverName.textContent == `${driverData.forename} ${driverData.surname}`) {
                aFaveList.push(driverName.textContent);
                // console.log("pushing: " + circuitName.textContent);
                localStorage.setItem("faveDrivers", JSON.stringify(aFaveList));
            }
        });
    }


});