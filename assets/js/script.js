/*
  Phoina Beauty modular site script.
  Production pages load assets/js/main.js directly. This compatibility entry
  keeps hosts that expect script.js pointed at the same optimized module.
*/
(function loadPhoinaMainScript() {
  const hasMain = Array.from(document.scripts).some(script => /assets\/js\/main\.js$/.test(script.src));
  if (hasMain) return;

  const script = document.createElement('script');
  script.src = 'assets/js/main.js';
  script.defer = true;
  document.head.appendChild(script);
})();
