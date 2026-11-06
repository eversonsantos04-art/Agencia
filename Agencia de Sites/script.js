/* NovaWave — interações */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Header no scroll ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const closeNav = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__link").forEach((l) => l.addEventListener("click", closeNav));
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });

  /* ---------- Link ativo por seção (scrollspy) ---------- */
  const sections = $$("main section[id]");
  const links = $$(".nav__link");
  const spy = () => {
    const y = window.scrollY + 140;
    let current = "home";
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + current));
  };
  spy();
  window.addEventListener("scroll", spy, { passive: true });

  /* ---------- Reveal on scroll (com fallback seguro) ---------- */
  const revealEls = $$(".reveal");
  const showVisible = () => {
    let pending = false;
    revealEls.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40 && r.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        pending = true;
      }
    });
    return pending;
  };
  showVisible();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("is-visible"), (i % 4) * 90);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  // fallback: garante que nada fique invisível
  window.addEventListener("load", showVisible);
  window.addEventListener("scroll", showVisible, { passive: true });
  window.addEventListener("resize", showVisible);
  let tries = 0;
  const fallback = setInterval(() => {
    showVisible();
    if (++tries >= 20) clearInterval(fallback);
  }, 900);

  /* ---------- Contadores ---------- */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statsBox = $("#stats");
  if (statsBox) {
    if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            $$(".stat__num", statsBox).forEach(animateCount);
            io2.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io2.observe(statsBox);
    } else {
      $$(".stat__num", statsBox).forEach(animateCount);
    }
  }

  /* ---------- Filtro de projetos ---------- */
  const filters = $$(".filter");
  const projects = $$("#projectGrid .project");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const cat = p.dataset.cat;
        const show = f === "all" || cat === f || p.classList.contains("project--note");
        p.classList.toggle("is-hidden", !show);
        if (show) {
          p.style.animation = "none";
          void p.offsetWidth;
          p.style.animation = "pop .45s ease both";
        }
      });
    });
  });

  /* ---------- Formulário ---------- */
  const form = $("#form");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      $$("[required]", form).forEach((field) => {
        const wrap = field.closest(".field");
        const ok = field.value.trim() !== "" &&
          (field.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim()));
        wrap.classList.toggle("is-error", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        note.textContent = "Confira os campos destacados e tente novamente.";
        note.className = "form__note err";
        return;
      }

      const btn = $("button[type=submit]", form);
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = "Enviando…";

      setTimeout(() => {
        note.textContent = "Mensagem enviada! Retornamos em até 24 horas. ✨";
        note.className = "form__note ok";
        form.reset();
        btn.disabled = false;
        btn.innerHTML = original;
      }, 1100);
    });

    $$("input, textarea", form).forEach((f) =>
      f.addEventListener("input", () => f.closest(".field").classList.remove("is-error"))
    );
  }

  /* ---------- Newsletter ---------- */
  const news = $("#newsForm");
  if (news) {
    news.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", news);
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      $("#newsNote").textContent = ok
        ? "Inscrição confirmada! Obrigado. 🎉"
        : "Informe um e-mail válido.";
      $("#newsNote").style.color = ok ? "#5ee0a0" : "#ff8a8a";
      if (ok) news.reset();
    });
  }

  /* ---------- Ano ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Parallax leve no hero ---------- */
  const stage = $(".hero__stage");
  if (stage && window.matchMedia("(pointer:fine)").matches) {
    const hero = $(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`;
    });
    hero.addEventListener("mouseleave", () => { stage.style.transform = ""; });
  }
})();
