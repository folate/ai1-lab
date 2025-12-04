type StyleEntry = { name: string; file: string };

const styles: StyleEntry[] = [
  { name: "basic",   file: "style-1.css" },
  { name: "classic", file: "style-2.css" },
  { name: "modern",  file: "style-3.css" },
];

const appState = {
  currentStyle: styles[0],
};

const styleTextElement = document.getElementById("current-style");

const applyStyle = (style: StyleEntry) => {
  const prev = document.getElementById("dynamic-style");
  if (prev) prev.remove();

  const link = document.createElement("link");
  link.id = "dynamic-style";
  link.rel = "stylesheet";
  link.href = style.file;
  document.head.appendChild(link);

  if (styleTextElement) styleTextElement.textContent = style.name;
};

const renderStyleLinks = () => {
  const footer = document.querySelector("footer");
  if (!footer) return;

  const container = document.createElement("div");
  container.id = "style-links";
  container.innerHTML = `<p>Wybierz styl:</p>`;

  styles.forEach((style) => {
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = style.name;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      appState.currentStyle = style;
      applyStyle(style);
    });
    container.appendChild(link);
  });

  footer.appendChild(container);
};

applyStyle(appState.currentStyle);
renderStyleLinks();