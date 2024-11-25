const domain = "https://www.randyconnolly.com/funwebdev/3rd/api/f1";
// STOP USING THIS, USE THE ACTUAL VERSION!!!
document.addEventListener("DOMContentLoaded", () => {
    const seasons = document.querySelector("select#seasons");
    seasons.addEventListener("change", () => {
        const year = seasons.value;
        let url;
        if (year > 0) {
            // console.log(`url: ${url}`);
            // if it's not in local storage, fetch it once and store to local storage
            // if (!localStorage.getItem(`${year}_races`)) {
            if (!localStorage[`${year}_races`]) {
                url = `${domain}/races.php?season=${year}`;
                fetchAndStore(url, year);
            }
            const homeView = document.querySelector("#home");
            const racesView = document.querySelector("#browse");
            
            // switch view and then deal with data
            for (let c of homeView.classList) {
                console.log(c);
            }
            homeView.classList.toggle("hidden");
            racesView.classList.toggle("hidden");
        }
    });

    // fetchAndStore(url, data)
    function helloWorld() {
        console.log("hello, world!");
    }
    function fetchAndStore(url, item) {
        console.log(`${item}_races data is not in local storage! time to make a copy!`);

        fetch(url)
        .then(response => response.json())
        .then(data => localStorage.setItem(`${item}_races`, JSON.stringify(data)));
    }
    function toggleMainView(show, hide) {
        // if the show's class class has hidden, remove hidden and append block to the class list 
        // if the hide's class doesn't have hidden, append hidden to the class list

    }
});

