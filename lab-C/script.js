let mapElement = document.getElementsByClassName('map')[0];
let tiles = [];
let correctIndices = [];
const GRID_SIZE = 4;

Notification.requestPermission().then(function (result) {
    console.log('Notification permission status:', result);
});

let map = L.map(mapElement).setView([53.430127, 14.564802], 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

function getLocation() {
    if (!navigator.geolocation) {
        console.log("No geolocation.");
        return;
    }
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
        map.setView([position.coords.latitude, position.coords.longitude]);
        L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
    });
};

function generateImage() {
    let rasterCanvas = document.getElementById('rasterMap');
    let imageElementSize = [rasterCanvas.clientWidth, rasterCanvas.clientHeight];
    console.log('Generating raster map image...' + imageElementSize);

    rasterCanvas.width = imageElementSize[0];
    rasterCanvas.height = imageElementSize[1];

    leafletImage(map, function (err, canvas) {
        let rasterContext = rasterCanvas.getContext('2d');
        rasterContext.drawImage(canvas, 0, 0, imageElementSize[0], imageElementSize[1]);
        console.log('Map image generated successfully');

        createImageGrid(rasterCanvas);
    });
};

function createImageGrid(sourceCanvas) {
    tiles = [];
    correctIndices = [];
    const gridContainer = document.getElementsByClassName('div3')[0];
    gridContainer.innerHTML = '';

    const tileWidth = sourceCanvas.width / GRID_SIZE;
    const tileHeight = sourceCanvas.height / GRID_SIZE;

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileWidth;
            tileCanvas.height = tileHeight;
            tileCanvas.className = 'puzzleElement';

            const correctIndex = row * GRID_SIZE + col;
            correctIndices.push({
                element: tileCanvas,
                correctIndex: correctIndex
            });

            const tileContext = tileCanvas.getContext('2d');

            tileContext.drawImage(
                sourceCanvas,
                col * tileWidth, row * tileHeight, tileWidth, tileHeight,
                0, 0, tileWidth, tileHeight
            );

            tiles.push(tileCanvas);
        }
    }

    shuffleArray(tiles);

    tiles.forEach((tile) => {
        let addedTile = gridContainer.appendChild(tile);
        addDragAndDropHandlers(addedTile);
    });

    console.log('4x4 image grid created successfully');
}

function addDragAndDropHandlers(tile) {
    tile.setAttribute('draggable', 'true');

    tile.addEventListener('dragstart', function (event) {
        event.dataTransfer.effectAllowed = 'move';
        const currentIndex = tiles.indexOf(tile);
        event.dataTransfer.setData('text/plain', currentIndex.toString());
        tile.style.opacity = '0.5';
    });

    tile.addEventListener('dragend', function () {
        tile.style.opacity = '1';
    });

    tile.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    tile.addEventListener('drop', function (event) {
        event.preventDefault();

        const fromIndexStr = event.dataTransfer.getData('text/plain');
        if (fromIndexStr === '') {
            return;
        }

        const fromIndex = parseInt(fromIndexStr, 10);
        const toIndex = tiles.indexOf(tile);

        if (Number.isNaN(fromIndex) || Number.isNaN(toIndex) || fromIndex === toIndex) {
            return;
        }

        const gridContainer = tile.parentElement;
        const draggedTile = tiles[fromIndex];

        if (!draggedTile || !gridContainer) {
            return;
        }

        swapTilesInDom(gridContainer, draggedTile, tile);

        [tiles[fromIndex], tiles[toIndex]] = [tiles[toIndex], tiles[fromIndex]];

        setTimeout(checkPuzzleSolved, 10);
    });
}

function swapTilesInDom(container, tileA, tileB) {
    const tempA = document.createElement('div');
    const tempB = document.createElement('div');

    container.replaceChild(tempA, tileA);
    container.replaceChild(tempB, tileB);
    container.replaceChild(tileA, tempB);
    container.replaceChild(tileB, tempA);
}

function checkPuzzleSolved() {
    const allCorrect = tiles.every((tile, index) => {
        const info = correctIndices.find(ci => ci.element === tile);
        if (!info) {
            return false;
        }
        return info.correctIndex === index;
    });

    if (allCorrect) {
        console.log('Puzzle solved!');
        document.getElementsByClassName('div4')[0].style.backgroundColor = '#52ff7aff';

        if (Notification.permission === 'granted') {
            new Notification('Gratulacje!', {
                body: 'Ułożyłeś poprawnie całą mapę 😊'
            });
        } else {
            alert('Gratulacje! Ułożyłeś poprawnie całą mapę.');
        }

    }
}

// https://stackoverflow.com/a/12646864
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}