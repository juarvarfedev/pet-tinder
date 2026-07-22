const state = {
  deck: [],
  history: [],
  currentIndex: 0,
  isAnimating: false,
  isLoading: false,
};

const dragState = {
  active: false,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
};

let swipeAction = null;

const elements = {
  speciesBadge: document.getElementById("speciesBadge"),
  countBadge: document.getElementById("countBadge"),
  petCard: document.getElementById("petCard"),
  petImage: document.getElementById("petImage"),
  petName: document.getElementById("petName"),
  petSpecies: document.getElementById("petSpecies"),
  emptyState: document.getElementById("emptyState"),
  undoBtn: document.getElementById("undoBtn"),
  likeBtn: document.getElementById("likeBtn"),
  passBtn: document.getElementById("passBtn"),
  cardShell: document.getElementById("cardShell"),
};

async function fetchPetBatch(count = 10) {
  const url = `https://pet.btholt.workers.dev/pets/random/${count}`;
  const response = await fetch(url);
  const data = await response.json();

  if (Array.isArray(data.pets)) {
    return data.pets;
  }

  if (data.pet) {
    return [data.pet];
  }

  return [];
}

function createDeckItem(pet) {
  return {
    id: `api-${pet.id}`,
    species: pet.species,
    type: capitalize(pet.species),
    display: `${capitalize(pet.species)}s`,
    image: pet.image,
    name: pet.name,
  };
}

async function buildDeck() {
  const pets = await fetchPetBatch(10);
  return shuffle(pets.map(createDeckItem));
}

function capitalize(value = "") {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function hidePetImage() {
  elements.petImage.src = "";
  elements.petImage.alt = "";
  elements.petImage.style.display = "none";
}

function showPetImage() {
  elements.petImage.style.display = "block";
}

function resetCardFrame() {
  elements.emptyState.classList.add("hidden");
  elements.cardShell.classList.remove("empty");
  resetDrag();
}

function renderLoadingCard() {
  resetCardFrame();
  hidePetImage();
  elements.petName.textContent = "";
  elements.petSpecies.textContent = "";
  elements.emptyState.classList.remove("hidden");
  elements.emptyState.querySelector("h2").textContent = "Loading pets...";
  elements.emptyState.querySelector(".empty-copy").textContent =
    "Fetching the next batch now.";
  elements.countBadge.textContent = "0";
  elements.speciesBadge.textContent = "Loading";
}

function renderEmptyCard() {
  resetCardFrame();
  hidePetImage();
  elements.petName.textContent = "";
  elements.petSpecies.textContent = "";
  elements.emptyState.classList.remove("hidden");
  elements.emptyState.querySelector("h2").textContent = "All pets rated";
  elements.emptyState.querySelector(".empty-copy").textContent =
    "No more pets available.";
  elements.countBadge.textContent = `${state.deck.length}`;
  elements.speciesBadge.textContent = "Pets";
}

function renderPetCard(currentPet) {
  resetCardFrame();
  showPetImage();
  elements.petImage.src = currentPet.image;
  elements.petImage.alt = `${currentPet.name} the ${currentPet.type}`;
  elements.petName.textContent = currentPet.name;
  elements.petSpecies.textContent = `${currentPet.type}`;
  elements.countBadge.textContent = `${state.currentIndex + 1}`;
  elements.speciesBadge.textContent = currentPet.display;
}

function renderCard() {
  if (state.isLoading) {
    renderLoadingCard();
    return;
  }

  const currentPet = state.deck[state.currentIndex];

  if (!currentPet) {
    renderEmptyCard();
    return;
  }

  renderPetCard(currentPet);
}

function updateActionButtons() {
  const deckFinished = state.currentIndex >= state.deck.length;
  elements.undoBtn.disabled = state.history.length === 0 || state.isLoading;
  elements.likeBtn.disabled = state.isLoading || deckFinished;
  elements.passBtn.disabled = state.isLoading || deckFinished;
}

function render() {
  renderCard();
  updateActionButtons();
}

function canSwipe() {
  return !state.isAnimating && state.currentIndex < state.deck.length;
}

function applySwipeAnimation(direction) {
  if (!canSwipe()) {
    return;
  }

  state.isAnimating = true;
  swipeAction = direction;
  elements.petCard.classList.remove("dragging-like", "dragging-pass");
  elements.petCard.classList.add(
    direction === "like" ? "swipe-right" : "swipe-left",
  );
}

async function completeSwipe(direction) {
  const pet = state.deck[state.currentIndex];
  if (!pet) {
    state.isAnimating = false;
    return;
  }

  state.history.push({ action: direction, pet });
  state.currentIndex += 1;
  state.isAnimating = false;
  elements.petCard.classList.remove("swipe-right", "swipe-left");
  swipeAction = null;

  if (state.currentIndex >= state.deck.length) {
    await loadMorePets();
  }

  render();
}

function likePet() {
  applySwipeAnimation("like");
}

function passPet() {
  applySwipeAnimation("pass");
}

function undoAction() {
  const lastAction = state.history.pop();
  if (!lastAction) {
    return;
  }

  state.currentIndex = Math.max(0, state.currentIndex - 1);
  render();
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
}

async function loadInitialDeck() {
  setLoading(true);
  state.history = [];
  state.currentIndex = 0;
  state.isAnimating = false;
  render();

  try {
    state.deck = await buildDeck();
  } catch (error) {
    console.error("Could not load pets:", error);
    state.deck = [];
  } finally {
    setLoading(false);
    render();
  }
}

async function loadMorePets() {
  if (state.isLoading) {
    return;
  }

  setLoading(true);

  try {
    const pets = await fetchPetBatch(10);
    const newDeckItems = pets.map(createDeckItem);
    state.deck = [...state.deck, ...newDeckItems];
  } catch (error) {
    console.error("Could not load more pets:", error);
  } finally {
    setLoading(false);
    render();
  }
}

function resetDrag() {
  dragState.active = false;
  dragState.deltaX = 0;
  dragState.deltaY = 0;
  elements.petCard.style.transform = "";
  elements.petCard.classList.remove("dragging-like", "dragging-pass");
}

function startCardDrag(event) {
  if (!canSwipe()) {
    return;
  }

  dragState.active = true;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.deltaX = 0;
  dragState.deltaY = 0;
  elements.petCard.setPointerCapture(event.pointerId);
}

function updateCardDrag(event) {
  if (!dragState.active) {
    return;
  }

  dragState.deltaX = event.clientX - dragState.startX;
  dragState.deltaY = event.clientY - dragState.startY;
  const rotate = dragState.deltaX / 18;

  elements.petCard.style.transform = `translate(${dragState.deltaX}px, ${dragState.deltaY}px) rotate(${rotate}deg)`;
  elements.petCard.classList.toggle("dragging-like", dragState.deltaX > 0);
  elements.petCard.classList.toggle("dragging-pass", dragState.deltaX < 0);
}

function endCardDrag() {
  if (!dragState.active) {
    return;
  }

  dragState.active = false;

  if (dragState.deltaX > 120) {
    applySwipeAnimation("like");
  } else if (dragState.deltaX < -120) {
    applySwipeAnimation("pass");
  } else {
    resetDrag();
  }
}

function handleKeyboard(event) {
  if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
    return;
  }

  const key = event.key.toLowerCase();
  if (key === "l") {
    likePet();
  }

  if (key === "p") {
    passPet();
  }

  if (key === "u") {
    undoAction();
  }
}

function handleTransitionEnd(event) {
  if (event.propertyName !== "transform" || !swipeAction) {
    return;
  }

  completeSwipe(swipeAction);
}

function bindActions() {
  elements.likeBtn.addEventListener("click", likePet);
  elements.passBtn.addEventListener("click", passPet);
  elements.undoBtn.addEventListener("click", undoAction);

  document.addEventListener("keydown", handleKeyboard);

  elements.petCard.addEventListener("pointerdown", startCardDrag);
  window.addEventListener("pointermove", updateCardDrag);
  window.addEventListener("pointerup", endCardDrag);
  window.addEventListener("pointercancel", endCardDrag);
  elements.petCard.addEventListener("transitionend", handleTransitionEnd);
}

async function initApp() {
  bindActions();
  await loadInitialDeck();
}

initApp();
