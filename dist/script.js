const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const scrollToPageTop = () => {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
};

window.addEventListener("pageshow", (event) => {
  if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
    scrollToPageTop();
  }
});

window.addEventListener("popstate", scrollToPageTop);

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) {
      return;
    }

    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== item) {
        other.removeAttribute("open");
      }
    });
  });
});

const processCards = Array.from(document.querySelectorAll("[data-process-card]"));

if (processCards.length) {
  const closeProcessCards = (exceptCard) => {
    processCards.forEach((card) => {
      if (card === exceptCard) {
        return;
      }

      card.classList.remove("is-preview-open");
      const video = card.querySelector("video");

      if (video instanceof HTMLVideoElement) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  const openProcessCard = (card) => {
    closeProcessCards(card);
    card.classList.add("is-preview-open");
    const video = card.querySelector("video");

    if (video instanceof HTMLVideoElement) {
      video.muted = true;
      video.play().catch(() => {});
    }
  };

  const closeProcessCard = (card) => {
    card.classList.remove("is-preview-open");
    const video = card.querySelector("video");

    if (video instanceof HTMLVideoElement) {
      video.pause();
    }
  };

  processCards.forEach((card) => {
    card.addEventListener("pointerenter", () => openProcessCard(card));
    card.addEventListener("pointerleave", () => closeProcessCard(card));
    card.addEventListener("focusin", () => openProcessCard(card));
    card.addEventListener("focusout", (event) => {
      if (!card.contains(event.relatedTarget)) {
        closeProcessCard(card);
      }
    });
    card.addEventListener("click", () => openProcessCard(card));
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm instanceof HTMLFormElement) {
  const status = document.querySelector("[data-contact-status]");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      status?.classList.remove("is-success");
      status?.classList.add("is-error");
      if (status) {
        status.textContent = "Please complete the required fields.";
      }
      return;
    }

    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const interest = String(data.get("interest") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = `Fanfair inquiry from ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Interest: ${interest}`,
      "",
      "Message:",
      message
    ].join("\n");

    status?.classList.remove("is-error");
    status?.classList.add("is-success");
    if (status) {
      status.textContent = "Opening your email app with the prepared inquiry.";
    }

    window.location.href = `mailto:blake@trustfanfair.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const demo = document.querySelector("[data-demo]");

if (demo) {
  const runButton = document.querySelector("[data-demo-run]");
  const resetButton = document.querySelector("[data-demo-reset]");
  const stepButtons = Array.from(document.querySelectorAll("[data-demo-step]"));
  const ledgerBlocks = Array.from(document.querySelectorAll("[data-ledger-block]"));
  const status = document.querySelector("[data-demo-status]");
  const progress = document.querySelector("[data-demo-progress]");
  const progressLabel = document.querySelector("[data-demo-progress-label]");
  const itemLabel = document.querySelector("[data-demo-item-label]");
  const description = document.querySelector("[data-demo-description]");
  const certificate = document.querySelector("[data-demo-cert]");
  const code = document.querySelector("[data-demo-code]");
  let demoTimer = null;

  const stages = [
    {
      status: "Intake started",
      progress: 18,
      label: "Signed game ball",
      certificate: "FF-328791",
      description: "Item photos, seal ID, condition notes, and owner-supplied provenance are captured together.",
      ledger: "evidence captured",
      code: `const item = await fanfair.intake({
  type: "signed game ball",
  seal: "FF-328791",
  photos: 6,
  condition: "reviewed"
})

registry.queue(item.id)`
    },
    {
      status: "Inspection running",
      progress: 38,
      label: "Evidence package",
      certificate: "FF-328791-A",
      description: "The platform compares the physical seal, item photos, signature evidence, and partner notes.",
      ledger: "inspection passed",
      code: `const inspection = await fanfair.inspect(item.id, {
  sealIntegrity: "intact",
  imageAngles: ["front", "macro", "serial"],
  provenanceFiles: 3
})

assert(inspection.riskScore < 0.04)`
    },
    {
      status: "Fingerprint created",
      progress: 58,
      label: "Digital fingerprint",
      certificate: "FF-HASH-91C4",
      description: "Fanfair turns the evidence package into a tamper-evident fingerprint for the item record.",
      ledger: "hash sealed",
      code: `const fingerprint = await fanfair.fingerprint({
  seal: item.seal,
  media: inspection.mediaHash,
  provenance: inspection.provenanceHash
})

// sha256: 91c4...e72b`
    },
    {
      status: "Ledger write",
      progress: 78,
      label: "Registry entry",
      certificate: "FF-TX-0x7A4E",
      description: "A registry event anchors the item fingerprint so future changes can be verified against it.",
      ledger: "tx confirmed",
      code: `const tx = await fanfair.ledger.write({
  itemId: item.id,
  fingerprint,
  network: "partner-registry"
})

await tx.confirmations(3)`
    },
    {
      status: "Certificate live",
      progress: 100,
      label: "Verified collectible",
      certificate: "FF-CERT-4409",
      description: "The buyer sees a live certificate connected to the physical seal and the item history.",
      ledger: "certificate live",
      code: `const certificate = await fanfair.certificate.publish({
  itemId: item.id,
  tx: "0x7A4E...9B3C",
  visibility: "tap-to-verify"
})

return "FF-CERT-4409"`
    }
  ];

  const setDemoStage = (index) => {
    const stage = stages[index];

    if (!stage) {
      return;
    }

    status.textContent = stage.status;
    progress.style.width = `${stage.progress}%`;
    progressLabel.textContent = `${stage.progress}% complete`;
    itemLabel.textContent = stage.label;
    description.textContent = stage.description;
    certificate.textContent = stage.certificate;
    code.textContent = stage.code;

    stepButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === index);
    });

    ledgerBlocks.forEach((block, blockIndex) => {
      const label = block.querySelector("span");
      block.classList.toggle("is-active", blockIndex === index);
      block.classList.toggle("is-complete", blockIndex < index);

      if (label) {
        if (blockIndex < index) {
          label.textContent = "complete";
        } else if (blockIndex === index) {
          label.textContent = stage.ledger;
        } else {
          label.textContent = "queued";
        }
      }
    });
  };

  const stopDemoTimer = () => {
    if (demoTimer) {
      window.clearInterval(demoTimer);
      demoTimer = null;
    }
  };

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopDemoTimer();
      setDemoStage(Number(button.dataset.demoStep));
    });
  });

  runButton?.addEventListener("click", () => {
    stopDemoTimer();
    let index = 0;
    setDemoStage(index);

    demoTimer = window.setInterval(() => {
      index += 1;

      if (index >= stages.length) {
        stopDemoTimer();
        return;
      }

      setDemoStage(index);
    }, 1250);
  });

  resetButton?.addEventListener("click", () => {
    stopDemoTimer();
    status.textContent = "Ready";
    progress.style.width = "0%";
    progressLabel.textContent = "0% complete";
    itemLabel.textContent = "Signed game ball";
    description.textContent =
      "Serialized seal is waiting for intake photos, condition notes, and provenance evidence.";
    certificate.textContent = "FF-READY";
    code.textContent = `await fanfair.ready()
// Select "Run Demo" to activate the registry workflow.`;

    stepButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === 0);
    });

    ledgerBlocks.forEach((block, index) => {
      const label = block.querySelector("span");
      block.classList.toggle("is-active", index === 0);
      block.classList.remove("is-complete");

      if (label) {
        label.textContent = index === 0 ? "standing by" : "queued";
      }
    });
  });
}
