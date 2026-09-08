(function () {
  var SAMPLE = "Bigger sample from the same bad draw just makes the wrong answer more confident.";
  var CLAIMS = [
    "Establishes durable retention",
    "Establishes cold reconstruction",
    "Establishes transfer to novel domains"
  ];
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  var panels = {
    cold: document.getElementById("panelCold"),
    ghost: document.getElementById("panelGhost"),
    ink: document.getElementById("panelInk"),
    contract: document.getElementById("panelContract"),
    exit: document.getElementById("panelExit")
  };
  var ghostCopy = document.getElementById("ghostCopy");
  var ghostVoid = document.getElementById("ghostVoid");
  var stamp = document.getElementById("stamp");
  var ghostHint = document.getElementById("ghostHint");
  var demoBadge = document.getElementById("demoBadge");
  var inkHint = document.getElementById("inkHint");
  var inkInput = document.getElementById("inkInput");
  var commitBtn = document.getElementById("commitBtn");
  var sampleBtn = document.getElementById("sampleBtn");
  var refuseBtn = document.getElementById("refuseBtn");
  var contractInk = document.getElementById("contractInk");
  var contractCond = document.getElementById("contractCond");
  var claimLayer = document.getElementById("claimLayer");
  var caret = document.getElementById("simCaret");

  var ink = null;
  var costLocked = false;
  var maxGhost = 0;
  var scene = "cold";
  var boundPlayed = false;
  var boundTimer = null;

  var split = new SplitType(ghostCopy, { types: "chars,words", tagName: "span" });
  var chars = split.chars || [];

  // Visitor-writable; Sample Trace is explicit and badged immediately
  inkInput.readOnly = false;
  inkInput.tabIndex = 0;
  if (caret) caret.classList.remove("on", "done");
  demoBadge.classList.remove("show");

  function show(name) {
    scene = name;
    Object.keys(panels).forEach(function (k) {
      panels[k].classList.toggle("is-live", k === name);
    });
  }

  function setBadge(on, text) {
    if (!demoBadge) return;
    if (on) {
      demoBadge.classList.add("show");
      demoBadge.textContent = text || "Sample Trace · not your evidence";
    } else {
      demoBadge.classList.remove("show");
    }
  }

  function paintContractMeta() {
    if (!ink) {
      contractInk.textContent = "No ink on the slip.";
      contractInk.classList.add("empty");
      contractCond.textContent = "";
      return;
    }
    contractInk.classList.remove("empty");
    contractInk.textContent = ink.text;
    if (ink.kind === "sample") {
      contractCond.textContent = "Sample Trace · demonstration · not visitor evidence";
      setBadge(true, "Sample Trace · not your evidence");
    } else if (ink.kind === "refuse") {
      contractCond.textContent = "Visitor refused · productive absence";
      setBadge(false);
    } else {
      contractCond.textContent = "Visitor ink · unassisted on this slip · no answer key";
      setBadge(false);
    }
  }

  function clearClaims() {
    if (!claimLayer) return;
    claimLayer.innerHTML = "";
    claimLayer.classList.remove("is-hot");
  }

  function playBoundRefusal() {
    if (!claimLayer || boundPlayed) return;
    boundPlayed = true;
    clearClaims();
    claimLayer.classList.add("is-hot");
    paintContractMeta();

    CLAIMS.forEach(function (text, i) {
      var el = document.createElement("div");
      el.className = "claim-stamp";
      el.innerHTML = "<span class=\"claim-text\">" + text + "</span><span class=\"claim-x\" aria-hidden=\"true\">" + String.fromCharCode(0x2715) + "</span>";
      el.style.setProperty("--i", String(i));
      claimLayer.appendChild(el);
      // land then refuse
      requestAnimationFrame(function () {
        setTimeout(function () {
          el.classList.add("is-landed");
          setTimeout(function () {
            el.classList.add("is-refused");
          }, reduced ? 40 : 280);
        }, reduced ? i * 80 : 220 + i * 420);
      });
    });
  }

  function setGhostProgress(raw) {
    var g = Math.min(1, Math.max(0, raw));
    maxGhost = Math.max(maxGhost, g);
    if (costLocked) g = maxGhost;
    if (g > 0.15) costLocked = true;

    var n = chars.length || 1;
    var voided = g >= 0.88;

    chars.forEach(function (ch, i) {
      if (voided) {
        ch.style.opacity = "0";
        ch.style.transform = "none";
        ch.style.filter = "none";
        ch.style.visibility = "hidden";
        return;
      }
      ch.style.visibility = "visible";
      var t = i / n;
      var local = Math.min(1, Math.max(0, (g - t * 0.38) / 0.48));
      if (reduced) {
        ch.style.opacity = String(1 - g);
        ch.style.transform = "none";
        ch.style.filter = "none";
      } else {
        var scatter = local * local;
        ch.style.opacity = String(1 - scatter);
        ch.style.transform = "translate(" + ((i % 5 - 2) * scatter * 12) + "px," + (scatter * 26) + "px) rotate(" + (scatter * (i % 2 ? 16 : -16)) + "deg)";
        ch.style.filter = "blur(" + (scatter * 7) + "px)";
      }
    });

    ghostVoid.style.opacity = String(g > 0.5 ? Math.min(1, (g - 0.5) / 0.35) : 0);

    var stampP = g >= 0.9 ? Math.min(1, (g - 0.9) / 0.1) : 0;
    stamp.style.opacity = String(stampP * 0.85);
    var overshoot = stampP < 1 ? 0.72 + stampP * 0.4 : 1.0;
    stamp.style.transform = "translate(-50%, -50%) rotate(-13deg) scale(" + overshoot + ")";

    if (g >= 0.9) ghostHint.textContent = "The help is gone. You generated none of it.";
    else if (g > 0.35) ghostHint.textContent = "Assisted text is leaving.";
    else ghostHint.textContent = "Assisted text arrives. Keep scrolling.";
  }

  function enterInk() {
    show("ink");
    setGhostProgress(1);
    if (ink && ink.kind === "sample") {
      setBadge(true, "Sample Trace · not your evidence");
      inkInput.value = ink.text;
      inkInput.readOnly = true;
      inkHint.textContent = "Sample Trace on the slip. Not your evidence.";
      commitBtn.classList.add("is-press");
    } else if (ink && ink.kind === "typed") {
      setBadge(false);
      inkInput.value = ink.text;
      inkInput.readOnly = true;
      inkHint.textContent = "Ink recorded. Keep scrolling.";
      commitBtn.classList.add("is-press");
    } else if (ink && ink.kind === "refuse") {
      setBadge(false);
      inkInput.value = "";
      inkInput.readOnly = true;
      inkHint.textContent = "Refusal recorded. Bound next.";
      commitBtn.classList.remove("is-press");
    } else {
      setBadge(false);
      inkInput.readOnly = false;
      inkInput.value = "";
      commitBtn.classList.remove("is-press");
      inkHint.textContent = "Write one sentence — or show a labeled sample.";
    }
  }

  function enterBound() {
    show("contract");
    setGhostProgress(1);
    if (!ink) {
      // force labeled sample if they skipped ink without committing
      ink = { text: SAMPLE, kind: "sample" };
      setBadge(true, "Sample Trace · not your evidence");
    }
    paintContractMeta();
    if (boundTimer) clearTimeout(boundTimer);
    boundTimer = setTimeout(playBoundRefusal, reduced ? 60 : 120);
  }

  function onProgress(p) {
    if (p < 0.08) {
      boundPlayed = false;
      clearClaims();
      ink = null;
      show("cold");
      setGhostProgress(0);
      setBadge(false);
      inkInput.value = "";
      inkInput.readOnly = false;
      commitBtn.classList.remove("is-press");
    } else if (p < 0.34) {
      if (scene === "contract" || scene === "exit") {
        boundPlayed = false;
        clearClaims();
      }
      show("ghost");
      setGhostProgress((p - 0.08) / (0.34 - 0.08));
    } else if (p < 0.58) {
      enterInk();
    } else if (p < 0.82) {
      enterBound();
    } else {
      show("exit");
      setGhostProgress(1);
      if (!ink) ink = { text: SAMPLE, kind: "sample" };
      paintContractMeta();
      if (!boundPlayed) playBoundRefusal();
    }
  }

  commitBtn.addEventListener("click", function () {
    var t = inkInput.value.trim();
    if (!t) { inkInput.focus(); return; }
    ink = { text: t, kind: "typed" };
    inkInput.readOnly = true;
    setBadge(false);
    commitBtn.classList.add("is-press");
    inkHint.textContent = "Ink recorded. Keep scrolling.";
  });

  sampleBtn.addEventListener("click", function () {
    ink = { text: SAMPLE, kind: "sample" };
    inkInput.value = SAMPLE;
    inkInput.readOnly = true;
    setBadge(true, "Sample Trace · not your evidence");
    commitBtn.classList.add("is-press");
    inkHint.textContent = "Sample Trace on the slip. Not your evidence.";
  });

  refuseBtn.addEventListener("click", function () {
    ink = { text: "I don't know yet.", kind: "refuse" };
    inkInput.value = "";
    inkInput.readOnly = true;
    setBadge(false);
    commitBtn.classList.remove("is-press");
    inkHint.textContent = "Refusal recorded. Bound next.";
  });

  ScrollTrigger.create({
    trigger: "#pinWrap",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.35,
    onUpdate: function (self) { onProgress(self.progress); }
  });

  onProgress(0);
})();
