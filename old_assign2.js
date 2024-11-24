const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";

// REDO! FIGURE OUT WHY THIS BROKE <///3
document.addEventListener("DOMContentLoaded", () => {
    const seasons = $("select#seasons");
    seasons.addEventListener("change", () => {
        const year = seasons.value;
        let key;
        
        if (year > 0) {
            key = `${year}Races`;
            const url = `${domain}/races.php?season=${year}`;
            
            // if the race data isn't in local storage, fetch and store
            if (!localStorage.getItem(`${key}`)) {
                fetchAndStore(url, key);
            }
        }

        // switch the view from HOME to RACES
        toggleMainView($("#home"), $("#browse"));

        // loadBrowserView
        // get the chosen year's race data from local storage

        // GETTING ERRORS HERE ORZ (NULL the first time)
        const raceData = JSON.parse(localStorage.getItem(key));

        // ERRORS HERE TOO (error disappears if the data is already in fucking storage orz)
        // sort the raceData by Round
        raceData.sort((a,b) => {if (a.round < b.round) return -1});
        
        // fill in the list of races for the chosen year
        loadRaces(year, raceData);

        // event listener for [Result] button
        const racesTable = $("#racesTable tbody");
        racesTable.addEventListener("click", (e) => {
            if (e.target.nodeName == "BUTTON") {
                hide($("#racesImage"));
                show($("#raceResults"));
                
                // load the race result's description (FAVOURITES NOT ACCOUNTED FOR YET!)
                loadRaceResultsDesc(e, year, raceData);

                

                // load the results
                
            }
        });
        



    });

    // function declarations and expressions
    function $(selector) {
        return document.querySelector(selector);
    }
    
    function fetchAndStore(url, key) {
        console.log("key is not in local storage! fetching and storing...");
        fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error(`response status: ${response.status}`);
            }
        })
        .catch(error => console.error(`uh oh, an error occured: ${error}`))
        .then(data => localStorage.setItem(`${key}`, JSON.stringify(data)));
    }

    function toggleMainView(selector1, selector2) {
        selector1.classList.toggle("hidden");
        selector2.classList.toggle("hidden");
    }
    
    const hide = (selector) => selector.classList.add("hidden");

    const show = (selector) => selector.classList.remove("hidden");

    function loadRaces(year, data) {
        // title
        $("#races h3").innerHTML = "";
        $("#races h3").textContent = `${year} Races`;

        // table
        const racesTableData = $("#racesTable tbody");
        data.forEach(r => {
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

        // image
        const raceImg = $("#racesImage");
        const img = document.createElement("img");
        img.setAttribute("src", `images/${year}_raceImg.jpg`);
        img.setAttribute("alt", "A photo that corresponds to the chosen year.");
        raceImg.appendChild(img);
    }

    function loadRaceResultsDesc(e, year, data) {
        // load the result's description for the chosen race
        let result = data.find(result => result.name == e.target.id);
                
        $("#raceResultsDesc h3").innerHTML = "";
        $("#raceResultsDesc h3").textContent += `${year} ${e.target.id}`;
        
        const pList = document.querySelectorAll("#raceResultsDesc p span");
        const r = [`${result.name}`,`${result.round}`, `${result.year}`, `${result.circuit.name}`, `${result.date}`, `${result.url}`];
        let i = 0;
        pList.forEach(span => {
            span.innerHTML = "";
            // if r[i] is at `${result.circuit.name}`, add a new image to add the fave icon IF the circuit is in localStorage
            if (r[i] == `${result.circuit.name}`) {
                console.log("at circuit!");
            }
            span.textContent += r[i];
            i++;
        });
    }

    function loadQualifying(e, year) {
        let key = `${year}Qualifying`;
        const url = `${domain}/races.php?season=${year}`;
            
        // if the qualifying data isn't in local storage, fetch and store
        if (!localStorage[key]) {
            fetchAndStore(url, key);
        }

    }


});