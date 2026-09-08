(function () {
  var SAMPLE = 'Bias is about how you sample, not how many.';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  var panels = {
    cold: document.getElementById('panelCold'),
    ghost: document.getElementById('panelGhost'),
    ink: document.getElementById('panelInk'),
    contract: document.getElementById('panelContract'),
    exit: document.getElementById('panelExit')
  };
  var ghostCopy = document.getElementById('ghostCopy');
  var ghostVoid = document.getElementById('ghostVoid');
  var stamp = document.getElementById('stamp');
  var ghostHint = document.getElementById('ghostHint');
  var demoBadge = document.getElementById('demoBadge');
  var inkHint = document.getElementById('inkHint');
  var inkInput = document.getElementById('inkInput');
  var contractInk = document.getElementById('contractInk');
  var contractCond = document.getElementById('contractCond');

  var ink = null;
  var costLocked = false;
  var maxGhost = 0;

  var split = new SplitType(ghostCopy, { types: 'chars,words', tagName: 'span' });
  var chars = split.chars || [];

  function show(name) {
    Object.keys(panels).forEach(function (k) {
      panels[k].classList.toggle('is-live', k === name);
    });
  }

  function paintContract() {
    if (!ink) {
      contractInk.textContent = 'No ink on the slip.';
      contractInk.classList.add('empty');
      contractCond.textContent = '';
      return;
    }
    contractInk.classList.remove('empty');
    contractInk.textContent = ink.text;
    if (ink.kind === 'sample') {
      contractCond.textContent = 'Sample Trace · demonstration · not visitor evidence';
    } else if (ink.kind === 'refuse') {
      contractCond.textContent = 'Visitor refused · productive absence';
    } else {
      contractCond.textContent = 'Visitor ink · unassisted on this slip · no answer key';
    }
  }

  function setGhostProgress(raw) {
    var g = Math.min(1, Math.max(0, raw));
    maxGhost = Math.max(maxGhost, g);
    if (costLocked) g = maxGhost;
    if (g > 0.18) costLocked = true;

    var n = chars.length || 1;
    var voided = g >= 0.92;

    chars.forEach(function (ch, i) {
      if (voided) {
        ch.style.opacity = '0';
        ch.style.transform = 'none';
        ch.style.filter = 'none';
        ch.style.visibility = 'hidden';
        return;
      }
      ch.style.visibility = 'visible';
      var t = i / n;
      var local = Math.min(1, Math.max(0, (g - t * 0.42) / 0.5));
      if (reduced) {
        ch.style.opacity = String(1 - g);
        ch.style.transform = 'none';
        ch.style.filter = 'none';
      } else {
        var scatter = local * local;
        ch.style.opacity = String(1 - scatter);
        ch.style.transform = 'translate(' + ((i % 5 - 2) * scatter * 10) + 'px,' + (scatter * 22) + 'px) rotate(' + (scatter * (i % 2 ? 14 : -14)) + 'deg)';
        ch.style.filter = 'blur(' + (scatter * 6) + 'px)';
      }
    });

    ghostVoid.style.opacity = String(g > 0.55 ? Math.min(1, (g - 0.55) / 0.35) : 0);

    var stampP = g > 0.92 ? Math.min(1, (g - 0.92) / 0.08) : 0;
    stamp.style.opacity = String(stampP);
    var s = 0.78 + stampP * 0.28;
    stamp.style.transform = 'translate(-50%, -50%) rotate(-12deg) scale(' + s + ')';

    if (g >= 0.92) {
      ghostHint.textContent = 'The help is gone. You generated none of it.';
    } else if (g > 0.35) {
      ghostHint.textContent = 'Assisted text is leaving.';
    } else {
      ghostHint.textContent = 'Assisted text arrives. Keep scrolling.';
    }
  }

  function onProgress(p) {
    if (p < 0.08) {
      show('cold');
      setGhostProgress(0);
    } else if (p < 0.38) {
      show('ghost');
      setGhostProgress((p - 0.08) / (0.38 - 0.08));
    } else if (p < 0.55) {
      show('ink');
      setGhostProgress(1);
      demoBadge.classList.toggle('show', !!(ink && ink.kind === 'sample'));
      if (ink) {
        inkHint.textContent = ink.kind === 'sample'
          ? 'Sample Trace on the slip. Not your evidence.'
          : 'Ink recorded. Keep scrolling.';
      } else {
        inkHint.textContent = 'Scroll past for a labeled Sample Trace.';
      }
    } else if (p < 0.78) {
      show('contract');
      setGhostProgress(1);
      if (!ink) ink = { text: SAMPLE, kind: 'sample' };
      paintContract();
    } else {
      show('exit');
      setGhostProgress(1);
      if (!ink) ink = { text: SAMPLE, kind: 'sample' };
      paintContract();
    }
  }

  ScrollTrigger.create({
    trigger: '#pinWrap',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.35,
    onUpdate: function (self) { onProgress(self.progress); }
  });

  function refresh() {
    var st = ScrollTrigger.getAll()[0];
    onProgress(st ? st.progress : 0.45);
  }

  document.getElementById('commitBtn').addEventListener('click', function () {
    var t = inkInput.value.trim();
    if (!t) { inkInput.focus(); return; }
    ink = { text: t, kind: 'typed' };
    refresh();
  });
  document.getElementById('refuseBtn').addEventListener('click', function () {
    ink = { text: "I don't know yet.", kind: 'refuse' };
    inkInput.value = '';
    refresh();
  });
  inkInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('commitBtn').click();
    }
  });

  onProgress(0);
})();
