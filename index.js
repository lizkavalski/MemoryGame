// Fetches card data from a JSON file
async function fetchCardsData() {
    try {
        const response = await fetch('index.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const cardsData = await response.json();
        return cardsData;
    } catch (error) {
        console.error('Failed to fetch cards:', error);
        return []; // Return an empty array on failure
    }
}

// Shuffles an array using the Durstenfeld shuffle algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Creates a DOM element for a card
function createCardElement(card, isImage) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.name = card.name;

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardBack.textContent = "Memory Game"; // This can be a logo or similar static back

    if (isImage) {
        cardBack.innerHTML = `<img src="${card.img}" alt="${card.name}">`;
    } else {
        cardBack.textContent = card.name;
    }

    cardElement.appendChild(cardBack); // Place the back first
    cardElement.appendChild(cardFront); // Front last (this way front is displayed by default due to stacking)

    // Bind card click event
    cardElement.addEventListener('click', () => handleCardClick(cardElement, card));
    return cardElement;
}

let firstCard = null;
let lockBoard = false;

// Handle a card click
function handleCardClick(cardElement, card) {
    if (lockBoard) return;
    if (cardElement === firstCard) return;

    cardElement.classList.add('flip');

    if (!firstCard) {
        // If this is the first card flipped
        firstCard = cardElement;
    } else {
        // If this is the second card flipped
        if (firstCard.dataset.name === card.name) {
            // Match found
            firstCard.removeEventListener('click', () => handleCardClick(firstCard, card));
            cardElement.removeEventListener('click', () => handleCardClick(cardElement, card));
            resetBoard();
        } else {
            // No match
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flip');
                cardElement.classList.remove('flip');
                resetBoard();
            }, 1500);
        }
    }
}

// Reset the board
function resetBoard() {
    [firstCard, lockBoard] = [null, false];
}

// Sets up the game with a specified number of cards
async function setupGame(numCards) {
    const cardsData = await fetchCardsData();
    if (cardsData.length > 0) {
        let cards = cardsData.slice(0, numCards / 2); // Adjust number of cards based on parameter
        let doubleCards = cards.map(card => ([{...card, isImage: false}, {...card, isImage: true}])).flat();
        doubleCards = shuffle(doubleCards);

        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = ''; // Clear previous game setup
        doubleCards.forEach(card => {
            const cardEl = createCardElement(card, card.isImage);
            gameContainer.appendChild(cardEl);
        });
    } else {
        console.log('No data available to set up the game');
    }
}

// Example: setup the game with 8 cards (even number required)
setupGame(8);

