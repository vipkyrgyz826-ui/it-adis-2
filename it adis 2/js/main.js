(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const current = document.getElementById("current");
  const total = document.getElementById("total");
  const fill = document.getElementById("progress-fill");
  const chapterNav = document.getElementById("chapter-nav");
  const chapterMenu = document.getElementById("chapter-menu");
  const chapters = [
    { id: "01", title: "BRAND IDENTITY", first: 0 },
    { id: "02", title: "APPLICATION", first: 9 },
    { id: "03", title: "INTERIOR", first: 17 },
    { id: "04", title: "FINAL", first: 27 },
  ];
  let index = 0;
  let touchStartX = null;
  total.textContent = String(slides.length).padStart(2, "0");

  chapters.forEach((chapter, i) => {
    const railLink = document.createElement("a");
    railLink.href = `#slide-${chapter.first + 1}`;
    railLink.textContent = chapter.id;
    railLink.title = chapter.title;
    railLink.setAttribute(
      "aria-label",
      `Глава ${chapter.id}: ${chapter.title}`,
    );
    railLink.addEventListener("click", (event) => {
      event.preventDefault();
      goTo(chapter.first);
    });
    chapterNav.append(railLink);

    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.textContent = `${chapter.id} / ${chapter.title}`;
    menuButton.addEventListener("click", () => goTo(chapter.first));
    chapterMenu.append(menuButton);
  });
  const railLinks = [...chapterNav.children];
  const menuButtons = [...chapterMenu.children];

  function goTo(nextIndex) {
    index = Math.max(0, Math.min(slides.length - 1, nextIndex));
    slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    current.textContent = String(index + 1).padStart(2, "0");
    fill.style.width = `${((index + 1) / slides.length) * 100}%`;
    const chapter = slides[index].dataset.chapter;
    chapters.forEach((item, i) => {
      const active = chapter === item.id;
      railLinks[i].classList.toggle("active", active);
      menuButtons[i].classList.toggle("active", active);
      if (active) {
        railLinks[i].setAttribute("aria-current", "step");
        menuButtons[i].setAttribute("aria-current", "step");
      } else {
        railLinks[i].removeAttribute("aria-current");
        menuButtons[i].removeAttribute("aria-current");
      }
    });
    history.replaceState(null, "", `#slide-${index + 1}`);
  }

  document
    .getElementById("prev")
    .addEventListener("click", () => goTo(index - 1));
  document
    .getElementById("next")
    .addEventListener("click", () => goTo(index + 1));
  document
    .getElementById("print")
    .addEventListener("click", () => window.print());
  document.getElementById("fullscreen").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.warn("Полноэкранный режим недоступен в этом браузере.", error);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (["ArrowRight", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      goTo(index + 1);
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Home") {
      goTo(0);
    } else if (event.key === "End") {
      goTo(slides.length - 1);
    } else if (event.key.toLowerCase() === "f") {
      document.getElementById("fullscreen").click();
    }
  });

  document.getElementById("slides").addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  document.getElementById("slides").addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) return;
      const dx = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 70) goTo(index + (dx < 0 ? 1 : -1));
      touchStartX = null;
    },
    { passive: true },
  );

  const initial = location.hash.match(/^#slide-(\d+)$/);
  goTo(initial ? Number(initial[1]) - 1 : 0);
})();
