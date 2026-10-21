const form = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const messageEl = document.getElementById("login-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageEl.textContent = "";

  const response = await fetch("/api/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: passwordInput.value }),
  });

  if (response.ok) {
    window.location.href = "/";
    return;
  }

  const data = await response.json().catch(() => ({}));
  messageEl.textContent = data.detail || "登录失败，请稍后重试";
  passwordInput.select();
});
