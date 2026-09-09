document.querySelectorAll('footer').forEach((footer) => {
  const footerText = footer.querySelector('p');
  if (!footerText) return;
  footerText.innerHTML = '<a href="terms.html">Terms &amp; conditions</a> · <a href="privacy.html">Privacy policy</a>';
});
