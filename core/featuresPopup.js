const STORAGE_KEY = "sentient.showFeatures";

export function initFeaturesPopup() {
  const overlay = document.getElementById("featuresOverlay");
  const showBtn = document.getElementById("featuresShow");
  const hideBtn = document.getElementById("featuresHide");

  if (localStorage.getItem(STORAGE_KEY) === "no") {
    return;
  }

  overlay.classList.add("open");

  showBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "yes");
    overlay.classList.remove("open");
  });

  hideBtn.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, "no");
    overlay.classList.remove("open");
  });
}
