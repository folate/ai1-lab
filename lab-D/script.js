const API_KEY = "REDACTED ;)";

async function getWeather() {
    clearForecasts();
    const cityInput = document.getElementById("city-input");
    const city = cityInput.value;
    if (!city) {
        alert('Proszę wpisać nazwę miasta.');
        cityInput.focus();
        return;
    }
    getCurrentWeather(city);
    getForecast(city);
}

async function getCurrentWeather(city){


    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&lang=pl&units=metric`, true);

        xhttp.onload = () => {
            if (xhttp.status >= 200 && xhttp.status < 300) {
                const response = JSON.parse(xhttp.responseText);
                
                document.getElementById(`weather-icon`).src = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
                document.getElementById(`city-name`).innerText = response.name;
                document.getElementById(`temperature`).innerHTML = `${Math.round(response.main.temp)} &deg;C`;
                document.getElementById(`condition`).innerText = response.weather[0].description;
                document.getElementById(`humidity`).innerText = `${response.main.humidity} %`;
                document.getElementById(`feels-like`).innerHTML = `${response.main.feels_like} &deg;C`;
                document.getElementById(`time`).innerText = new Date(response.dt * 1000).toLocaleString('pl-PL', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
                console.log(response);
                resolve(response);
            } else {
                document.getElementsByClassName("weather-div")[0].innerHTML = `<p>Nie znaleziono miasta: ${city}</p>`;
                reject(new Error(`Błąd ${xhttp.status}: ${xhttp.statusText}`));
            }
        };

        xhttp.onerror = () => reject(new Error("Błąd sieci"));
        xhttp.ontimeout = () => reject(new Error("Przekroczono limit czasu"));
        xhttp.send();
    });
}

async function getForecast(city){
    const cardsContainer = document.getElementById("forecast-cards");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&lang=pl&units=metric`);
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        if (!data.list.length) {
            cardsContainer.innerHTML = '<p>Brak prognozy do wyświetlenia.</p>';
            return;
        }

        cardsContainer.innerHTML = data.list.map(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString('pl-PL', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="forecast-card">
                    <p class="forecast-date">${date}</p>
                    <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" />
                    <div class=forecast-infos>
                        <p class="forecast-temp">Temperatura: ${Math.round(item.main.temp)} &deg;C</p>
                        <p class="forecast-conditions">Warunki: ${item.weather[0].description}</p>
                        <p class="forecast-humidity">Wilgotność: ${item.main.humidity}%</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error(error);
        cardsContainer.innerHTML = '<div class="forecast-card">Nie udało się pobrać prognozy.</div>';
    }
}

function clearForecasts() {
    document.getElementsByClassName("forecast-cards")[0].innerHTML = '';
    document.getElementsByClassName("weather-div")[0].innerHTML = `<span class="time"><h3>Czas:</h3><h3 id="time"></h3></span>
            <span class="weather-icon"><img id="weather-icon" src="" alt=""></span>
            <div class="infos">
                <span><h3>Miasto:</h3><h3 id="city-name"></h3></span>
                <span><h3>Warunki:</h3><h3 id="condition"></h3></span>
                <span><h3>Temperatura:</h3><h3 id="temperature"></h3></span>
                <span><h3>Odczuwalna:</h3><h3 id="feels-like"></h3></span>
                <span><h3>Wilgotność:</h3><h3 id="humidity"></h3></span>
            </div>`;
}