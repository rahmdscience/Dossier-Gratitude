document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const quoteContainer = document.getElementById("quote-container");
  const journalInput = document.getElementById("journal-input");
  const saveButton = document.getElementById("save-button");
  const todayDateEl = document.getElementById("today-date");
  const calendarGrid = document.getElementById("calendar-grid");
  const monthYearEl = document.getElementById("month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const recapList = document.getElementById("recap-list");
  const navTabs = document.querySelectorAll(".nav-tab");
  const views = document.querySelectorAll(".view-section");
  const entryModal = document.getElementById("entry-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const modalDateEl = document.getElementById("modal-date");
  const modalTextEl = document.getElementById("modal-text");
  const watermark = document.getElementById("watermark");
  const watermarkModal = document.getElementById("watermark-modal");
  const closeWatermarkModalBtn = document.getElementById(
    "close-watermark-modal",
  );

  // --- STATE ---
  let currentView = "journal-view";
  let currentDate = new Date();
  let calendarDate = new Date();
  let journalData = JSON.parse(localStorage.getItem("gratitudeJournal")) || {};

  const quotes = [
    {
      text: "The more you are in a state of gratitude, the more you will attract things to be grateful for.",
      author: "WALT DISNEY",
    },
    {
      text: "Gratitude turns what we have into enough.",
      author: "ANONYMOUS",
    },
    {
      text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.",
      author: "EPICTETUS",
    },
    {
      text: "Acknowledging the good that you already have in your life is the foundation for all abundance.",
      author: "ECKHART TOLLE",
    },
    {
      text: "Gratitude is the healthiest of all human emotions. The more you express gratitude for what you have, the more likely you will have even more to express gratitude for.",
      author: "ZIG ZIGLAR",
    },
  ];

  // --- FUNCTIONS ---
  const getFormattedDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getLongDate = (date) => {
    return date
      .toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
  };

  const switchView = (viewId) => {
    currentView = viewId;
    views.forEach((view) => {
      view.classList.toggle("hidden", view.id !== viewId);
    });

    navTabs.forEach((tab) => {
      if (tab.dataset.view === viewId) {
        tab.classList.add("tab-active");
        tab.classList.remove("text-ink");
      } else {
        tab.classList.remove("tab-active");
        tab.classList.add("text-ink");
      }
    });

    if (viewId === "calendar-view") renderCalendar();
    if (viewId === "recap-view") renderRecap();
    if (viewId === "journal-view") renderJournal();
  };

  const renderJournal = () => {
    todayDateEl.textContent = `> ${getLongDate(currentDate)}`;
    const todayKey = getFormattedDate(currentDate);
    journalInput.value = journalData[todayKey] || "";
  };

  const saveJournal = () => {
    const todayKey = getFormattedDate(currentDate);
    const entryText = journalInput.value.trim();

    if (entryText) {
      journalData[todayKey] = entryText;
    } else {
      delete journalData[todayKey];
    }

    localStorage.setItem("gratitudeJournal", JSON.stringify(journalData));

    saveButton.textContent = "[ STATUS: TERSIMPAN ]";
    saveButton.style.backgroundColor = "var(--moss, #386641)";
    saveButton.style.color = "#f4f1ea";

    setTimeout(() => {
      saveButton.textContent = "[ SIMPAN DATA ]";
      saveButton.style.backgroundColor = "";
      saveButton.style.color = "";
    }, 1500);
  };

  const renderCalendar = () => {
    calendarGrid.innerHTML = "";
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    monthYearEl.textContent = `[ ${calendarDate
      .toLocaleString("id-ID", { month: "long", year: "numeric" })
      .toUpperCase()} ]`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
    dayNames.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.className = "font-bold text-ink border-b-2 border-ink pb-1";
      dayEl.textContent = day;
      calendarGrid.appendChild(dayEl);
    });

    for (let i = 0; i < firstDay; i++) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "bg-paperDark border border-ink opacity-30";
      calendarGrid.appendChild(emptyEl);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEl = document.createElement("div");
      const date = new Date(year, month, day);
      const dateKey = getFormattedDate(date);

      dayEl.textContent = day;
      dayEl.className =
        "calendar-day bg-white border-2 border-ink p-2 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0px_#1a1a1a]";

      if (journalData[dateKey]) {
        dayEl.classList.add("has-entry", "font-bold");
        dayEl.dataset.entryKey = dateKey;
        dayEl.addEventListener("click", () => showEntryModal(dateKey));
      }

      const todayKey = getFormattedDate(new Date());
      if (dateKey === todayKey) {
        dayEl.classList.add("is-today");
      }

      calendarGrid.appendChild(dayEl);
    }
  };

  const renderRecap = () => {
    recapList.innerHTML = "";
    const sortedKeys = Object.keys(journalData).sort().reverse();

    if (sortedKeys.length === 0) {
      recapList.innerHTML = `
        <div class="neo-box p-4 text-center font-bold ui-text border-dashed bg-paperDark">
          [ DATA NIHIL. MULAI TULIS LAPORAN SYUKUR. ]
        </div>`;
      return;
    }

    sortedKeys.forEach((key) => {
      const [y, m, d] = key.split("-");
      const date = new Date(y, m - 1, d);
      const card = document.createElement("div");

      card.className =
        "neo-box p-4 bg-white hover:bg-paperDark transition-colors cursor-default";

      card.innerHTML = `
        <p class="ui-text font-bold text-xs bg-ink text-paper inline-block px-2 py-1 mb-2">> ${getLongDate(date)}</p>
        <p class="font-serif text-ink mt-1 whitespace-pre-wrap leading-relaxed">${journalData[key]}</p>
      `;

      recapList.appendChild(card);
    });
  };

  const showEntryModal = (dateKey) => {
    const [y, m, d] = dateKey.split("-");
    const date = new Date(y, m - 1, d);
    modalDateEl.textContent = `> ${getLongDate(date)}`;
    modalTextEl.textContent = journalData[dateKey];
    entryModal.classList.add("active");
  };

  const hideEntryModal = () => {
    entryModal.classList.remove("active");
  };

  const showWatermarkModal = () => {
    watermarkModal.classList.add("active");
  };

  const hideWatermarkModal = () => {
    watermarkModal.classList.remove("active");
  };

  const showDailyQuote = () => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById("quote-text").textContent = `"${quote.text}"`;
    document.getElementById("quote-author").textContent = `- ${quote.author}`;
  };

  // --- KEYBOARD SHORTCUTS ---
  const handleShortcut = (e) => {
    if (
      entryModal.classList.contains("active") ||
      watermarkModal.classList.contains("active")
    ) {
      return;
    }

    if (e.key === "/") {
      if (document.activeElement !== journalInput) {
        e.preventDefault();
        if (currentView !== "journal-view") switchView("journal-view");
        journalInput.focus();
      }
    }

    if (document.activeElement === journalInput) return;

    const tabOrder = ["journal-view", "calendar-view", "recap-view"];
    const currentIndex = tabOrder.indexOf(currentView);

    if (e.key === "ArrowRight") {
      const nextIndex = (currentIndex + 1) % tabOrder.length;
      switchView(tabOrder[nextIndex]);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      switchView(tabOrder[prevIndex]);
    }
  };

  // --- INITIALIZATION ---
  const init = () => {
    saveButton.addEventListener("click", saveJournal);
    navTabs.forEach((tab) =>
      tab.addEventListener("click", () => switchView(tab.dataset.view)),
    );

    prevMonthBtn.addEventListener("click", () => {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    });

    closeModalBtn.addEventListener("click", hideEntryModal);
    entryModal.addEventListener("click", (e) => {
      if (e.target === entryModal) hideEntryModal();
    });

    watermark.addEventListener("click", showWatermarkModal);
    closeWatermarkModalBtn.addEventListener("click", hideWatermarkModal);
    watermarkModal.addEventListener("click", (e) => {
      if (e.target === watermarkModal) hideWatermarkModal();
    });

    document.addEventListener("keydown", handleShortcut);

    showDailyQuote();
    switchView("journal-view");
  };

  init();
});
