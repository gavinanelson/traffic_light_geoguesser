const elements = {
  title: document.getElementById("title"),
  progress: document.getElementById("progress"),
  image: document.getElementById("image"),
  location: document.getElementById("location"),
  coords: document.getElementById("coords"),
  scores: document.getElementById("scores"),
  approve: document.getElementById("approve"),
  reject: document.getElementById("reject"),
};

let state = {
  total: 0,
  reviewed: 0,
  pending: [],
  saving: false,
};

function current() {
  return state.pending[0] ?? null;
}

function render() {
  const item = current();

  if (!item) {
    elements.title.textContent = "No pending images";
    elements.progress.textContent = `${state.reviewed} / ${state.total}`;
    elements.image.removeAttribute("src");
    elements.location.textContent = "You have reviewed everything currently downloaded.";
    elements.coords.textContent = "";
    elements.scores.textContent = "";
    elements.approve.disabled = true;
    elements.reject.disabled = true;
    return;
  }

  elements.title.textContent = item.title;
  elements.progress.textContent = `${state.reviewed + 1} / ${state.total}`;
  elements.image.src = item.imagePath;
  elements.location.textContent = `${item.city}, ${item.country}`;
  elements.coords.textContent = `${item.lat}, ${item.lng}`;
  elements.scores.textContent =
    `brightness ${item.scores?.brightness?.toFixed(1) ?? "n/a"} | ` +
    `contrast ${item.scores?.contrast?.toFixed(1) ?? "n/a"} | ` +
    `edges ${item.scores?.edgeDensity?.toFixed(3) ?? "n/a"}`;
  elements.approve.disabled = false;
  elements.reject.disabled = false;
}

async function load() {
  const response = await fetch("/api/review");
  state = { ...(await response.json()), saving: false };
  render();
}

async function decide(decision) {
  const item = current();
  if (!item || state.saving) return;

  state.saving = true;
  elements.approve.disabled = true;
  elements.reject.disabled = true;

  await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: item.id, decision }),
  });

  state.pending = state.pending.filter((record) => record.id !== item.id);
  state.reviewed += 1;
  state.saving = false;
  render();
}

elements.approve.addEventListener("click", () => decide("approved"));
elements.reject.addEventListener("click", () => decide("rejected"));

window.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  if (event.key.toLowerCase() === "a") decide("approved");
  if (event.key.toLowerCase() === "x") decide("rejected");
});

void load();

