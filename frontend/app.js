const input = document.getElementById("url-input");
const submitBtn = document.getElementById("submit-btn");
const messageEl = document.getElementById("message");
const historyEl = document.getElementById("history");
const logoutBtn = document.getElementById("logout-btn");

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (response.status === 401) {
    window.location.href = "/login.html";
    throw new Error("未登录");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "请求失败，请稍后重试");
  }
  return data;
}

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle("error", isError);
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderHistory(items) {
  historyEl.replaceChildren();
  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "还没有提交记录";
    historyEl.append(empty);
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    li.className = "history-item";

    const link = document.createElement("div");
    link.className = "history-url";
    link.textContent = item.url;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = `${item.status_text} · ${formatTime(item.created_at)}`;

    li.append(link, meta);
    historyEl.append(li);
  }
}

async function loadHistory() {
  const data = await api("/api/submissions");
  renderHistory(data.items);
}

async function handleSubmit() {
  const url = input.value.trim();
  if (!url) {
    showMessage("请先粘贴链接", true);
    input.focus();
    return;
  }

  submitBtn.disabled = true;
  showMessage("正在提交…");
  try {
    const data = await api("/api/submit", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    input.value = "";
    showMessage(data.message);
    await loadHistory();
  } catch (error) {
    showMessage(error.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleLogout() {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  window.location.href = "/login.html";
}

submitBtn.addEventListener("click", handleSubmit);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") handleSubmit();
});
logoutBtn.addEventListener("click", handleLogout);

(async function init() {
  try {
    await api("/api/me");
    await loadHistory();
  } catch (error) {
    showMessage(error.message, true);
  }
})();
