
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "carepath_ai_demo_v1";

const defaultBlood = {
  "A+": 12,
  "A-": 4,
  "B+": 8,
  "B-": 2,
  "AB+": 5,
  "AB-": 1,
  "O+": 15,
  "O-": 3
};

const state = {
  documents: [],
  medicines: [],
  donors: [],
  requests: [],
  timeline: [],
  blood: { ...defaultBlood }
};

// Load saved demo data
function loadSavedData() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) return;

    const parsed = JSON.parse(savedData);

    state.documents = Array.isArray(parsed.documents)
      ? parsed.documents : [];

    state.medicines = Array.isArray(parsed.medicines)
      ? parsed.medicines : [];

    state.donors = Array.isArray(parsed.donors)
      ? parsed.donors : [];

    state.requests = Array.isArray(parsed.requests)
      ? parsed.requests : [];

    state.timeline = Array.isArray(parsed.timeline)
      ? parsed.timeline : [];

    if (parsed.blood && typeof parsed.blood === "object") {
      Object.keys(defaultBlood).forEach((group) => {
        const value = Number(parsed.blood[group]);

        if (Number.isInteger(value) && value >= 0 && value <= 10000) {
          state.blood[group] = value;
        }
      });
    }

  } catch (error) {
    console.error("Could not load saved demo data:", error);
  }
}

// Save demo data
function saveData() {
  try {
    const dataToSave = {
      documents: state.documents,
      medicines: state.medicines,
      donors: state.donors,
      requests: state.requests,
      timeline: state.timeline,
      blood: state.blood
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

  } catch (error) {
    console.error("Could not save demo data:", error);
    alert("Data could not be saved. Browser storage may be full or unavailable.");
  }
}

// Restore data before rendering
loadSavedData();

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function addTimeline(title, detail) {
  state.timeline.unshift({
    title,
    detail,
    time: new Date().toLocaleString()
  });

  // Keep the latest 100 activities
  state.timeline = state.timeline.slice(0, 100);

  saveData();
  renderTimeline();
}

function renderTimeline() {
  const container = $("timelineList");

  if (!container) return;

  if (state.timeline.length === 0) {
    container.innerHTML = '<p class="empty-state">Your demo activities will appear here.</p>';
    return;
  }

  container.innerHTML = state.timeline.map((item) => `
    <div class="timeline-row">
      <span class="timeline-dot"></span>
      <div>
        <strong>${escapeHTML(item.title)}</strong>
        <small>${escapeHTML(item.detail)} · ${escapeHTML(item.time)}</small>
      </div>
    </div>
  `).join("");
}

function updateStats() {
  $("documentCount").textContent = state.documents.length;
  $("medicineCount").textContent = state.medicines.length;

  const totalBloodUnits = Object.values(state.blood).reduce(
    (sum, value) => sum + value,
    0
  );

  $("bloodUnitCount").textContent = totalBloodUnits;
  $("requestCount").textContent = state.requests.length;
}

function renderDocuments() {
  const container = $("documentList");

  if (state.documents.length === 0) {
    container.innerHTML = '<p class="empty-state">No documents added in this session.</p>';
    return;
  }

  container.innerHTML = state.documents.map((doc, index) => `
    <div class="record-row">
      <div>
        <strong>${escapeHTML(doc.name)}</strong>
        <small>${escapeHTML(doc.size)} · Added ${escapeHTML(doc.time)}</small>
      </div>
      <button class="text-button" type="button" data-remove-document="${index}">
        Remove
      </button>
    </div>
  `).join("");
}

function renderMedicines() {
  const body = $("medicineList");

  if (state.medicines.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty-cell">No medicine entries yet.</td></tr>';
    return;
  }

  body.innerHTML = state.medicines.map((medicine, index) => {
    const expiry = medicine.expiry || "Not provided";
    const stockStatus = medicine.quantity === 0
      ? "Out of stock"
      : "Available";

    return `
      <tr>
        <td>${escapeHTML(medicine.name)}</td>
        <td>${medicine.quantity}</td>
        <td>${escapeHTML(expiry)}</td>
        <td>${stockStatus}</td>
        <td>
          <button class="text-button" type="button" data-remove-medicine="${index}">
            Remove
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderBlood() {
  const grid = $("bloodGrid");

  grid.innerHTML = Object.entries(state.blood).map(([group, units]) => `
    <div class="blood-card">
      <h3>${escapeHTML(group)}</h3>
      <p>${units} units</p>
      <small>Demo stock only</small>
    </div>
  `).join("");
}

function renderDonors() {
  const container = $("donorList");

  if (state.donors.length === 0) {
    container.innerHTML = '<p class="empty-state">No adult donor registrations in this session.</p>';
    return;
  }

  container.innerHTML = state.donors.map((donor) => `
    <div class="record-row">
      <div>
        <strong>${escapeHTML(donor.name)}</strong>
        <small>
          ${escapeHTML(donor.group)} ·
          ${escapeHTML(donor.city)} ·
          Awaiting blood-bank verification
        </small>
      </div>
    </div>
  `).join("");
}

function renderRequests() {
  const body = $("requestList");

  if (state.requests.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty-cell">No requests submitted yet.</td></tr>';
    return;
  }

  body.innerHTML = state.requests.map((request) => `
    <tr>
      <td>${escapeHTML(request.name)}</td>
      <td>${escapeHTML(request.group)}</td>
      <td>${request.units}</td>
      <td>
        ${escapeHTML(request.facility)} /
        ${escapeHTML(request.city)}
      </td>
      <td><span class="status pending">Pending verification</span></td>
    </tr>
  `).join("");
}

// PDF document upload
$("fileInput").addEventListener("change", async (event) => {
  const file = event.target.files && event.target.files[0];

  if (!file) return;

  const status = $("uploadStatus");
  const result = $("documentResult");

  result.hidden = true;
  result.innerHTML = "";

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    status.textContent = "Please choose a PDF file.";
    event.target.value = "";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    status.textContent = "File size must be 10 MB or less.";
    event.target.value = "";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  status.textContent = "Uploading PDF and extracting text...";

  try {
    const extractResponse = await fetch(
      "http://127.0.0.1:8000/api/documents/extract",
      {
        method: "POST",
        body: formData
      }
    );

    const extractData = await extractResponse.json();

    if (!extractResponse.ok) {
      throw new Error(extractData.detail || "PDF extraction failed.");
    }

    const analysisForm = new FormData();
    analysisForm.append("file", file);

    status.textContent = "Text extracted. Preparing document summary...";

    const analysisResponse = await fetch(
      "http://127.0.0.1:8000/api/documents/analyze",
      {
        method: "POST",
        body: analysisForm
      }
    );

    const analysisData = await analysisResponse.json();

    if (!analysisResponse.ok) {
      throw new Error(analysisData.detail || "Document analysis failed.");
    }

    const analysis = analysisData.analysis || {};

    const tests = Array.isArray(analysis.identified_tests)
      ? analysis.identified_tests : [];

    const terms = Array.isArray(analysis.identified_medical_terms)
      ? analysis.identified_medical_terms : [];

    const dates = Array.isArray(analysis.identified_dates)
      ? analysis.identified_dates : [];

    const listHTML = (items, emptyText) => {
      if (items.length === 0) {
        return `<li>${emptyText}</li>`;
      }

      return items.map((item) => `
        <li>${escapeHTML(item)}</li>
      `).join("");
    };

    result.hidden = false;

    result.innerHTML = `
      <div class="record-row">
        <div>
          <strong>${escapeHTML(
            analysisData.filename || extractData.filename || file.name
          )}</strong>
          <small>
            ${Number(
              analysisData.total_pages || extractData.total_pages || 0
            )} page(s) · Rule-based summary
          </small>
        </div>
      </div>

      <h4>Extracted Text</h4>

      <pre style="
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        max-height: 300px;
        overflow: auto;
        padding: 14px;
        border-radius: 10px;
        background: rgba(5, 20, 35, 0.55);
        color: inherit;
        font: inherit;
      ">${escapeHTML(
        extractData.extracted_text || "No text was returned by the server."
      )}</pre>

      <h4>Document Summary</h4>
      <p>${escapeHTML(
        analysis.document_summary || "No summary available."
      )}</p>

      <h4>Identified Medical Tests</h4>
      <ul>${listHTML(tests, "No test names identified.")}</ul>

      <h4>Identified Medical Terms</h4>
      <ul>${listHTML(terms, "No medical terms identified.")}</ul>

      <h4>Identified Dates</h4>
      <ul>${listHTML(dates, "No dates identified.")}</ul>

      <p class="field-hint">
        ${escapeHTML(
          analysis.notice ||
          "Informational demo only. Check the original report with a qualified clinician."
        )}
      </p>
    `;

    const filename = extractData.filename || file.name;

    state.documents.push({
      name: filename,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      time: new Date().toLocaleTimeString()
    });

    renderDocuments();
    updateStats();

    addTimeline(
      "PDF document processed",
      `${filename} · ${Number(extractData.total_pages || 0)} page(s)`
    );

    status.textContent = "PDF processed successfully.";

  } catch (error) {
    status.textContent =
      `Processing failed: ${error.message}. Check that the backend is running.`;
  } finally {
    event.target.value = "";
  }
});

// Remove document
$("documentList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-document]");

  if (!button) return;

  const index = Number(button.dataset.removeDocument);

  if (!Number.isInteger(index) || index < 0 || index >= state.documents.length) {
    return;
  }

  state.documents.splice(index, 1);

  renderDocuments();
  updateStats();

  addTimeline(
    "Document removed",
    "A document was removed from this browser."
  );
});

// Add medicine
$("medicineForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("medicineName").value.trim();
  const quantity = Number($("medicineQuantity").value);
  const expiry = $("medicineExpiry").value;

  if (
    !name ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > 100000
  ) {
    alert("Enter a medicine name and a valid quantity between 0 and 100000.");
    return;
  }

  state.medicines.push({ name, quantity, expiry });

  renderMedicines();
  updateStats();

  addTimeline(
    "Medicine inventory updated",
    `${name}: ${quantity} units`
  );

  event.target.reset();
});

// Remove medicine
$("medicineList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-medicine]");

  if (!button) return;

  const index = Number(button.dataset.removeMedicine);

  if (!Number.isInteger(index) || index < 0 || index >= state.medicines.length) {
    return;
  }

  const removed = state.medicines.splice(index, 1)[0];

  renderMedicines();
  updateStats();

  addTimeline("Medicine item removed", removed.name);
});

// Update demo blood stock
$("bloodForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const group = $("bloodGroup").value.trim().toUpperCase();
  const units = Number($("bloodUnits").value);

  if (!Object.prototype.hasOwnProperty.call(state.blood, group)) {
    alert("Please select a valid blood group.");
    return;
  }

  if (!Number.isInteger(units) || units < 0 || units > 10000) {
    alert("Enter a valid quantity between 0 and 10000.");
    return;
  }

  state.blood[group] = units;

  renderBlood();
  updateStats();

  addTimeline(
    "Demo blood stock updated",
    `${group}: ${units} units`
  );

  event.target.reset();

  alert("Demo blood stock updated successfully.");
});

// Adult donor registration
$("donorForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const age = Number($("donorAge").value);
  const name = $("donorName").value.trim();
  const group = $("donorGroup").value;
  const city = $("donorCity").value.trim();

  if (!Number.isInteger(age) || age < 18 || age > 120) {
    alert("Donor registration is restricted to adults aged 18 or older.");
    return;
  }

  if (!name || !group || !city || !$("donorConsent").checked) {
    alert("Complete all fields and provide consent for this demo registration.");
    return;
  }

  state.donors.push({ name, age, group, city });

  renderDonors();

  addTimeline(
    "Adult donor registration submitted",
    `${group}, ${city}; awaiting verification`
  );

  event.target.reset();

  alert(
    "Demo registration submitted. No real donor account was created or shared."
  );
});

// Blood request
$("requestForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const request = {
    name: $("requesterName").value.trim(),
    group: $("requestGroup").value,
    units: Number($("requestUnits").value),
    facility: $("requestHospital").value.trim(),
    city: $("requestCity").value.trim()
  };

  if (
    !request.name ||
    !request.group ||
    !request.facility ||
    !request.city ||
    !$("requestConsent").checked
  ) {
    alert("Complete all fields and confirm the demo request notice.");
    return;
  }

  if (
    !Number.isInteger(request.units) ||
    request.units < 1 ||
    request.units > 20
  ) {
    alert("Enter a valid request between 1 and 20 units.");
    return;
  }

  state.requests.push(request);

  renderRequests();
  updateStats();

  addTimeline(
    "Blood request submitted",
    `${request.group}, ${request.units} units; pending verification`
  );

  event.target.reset();

  alert(
    "Demo request submitted. It has not been sent to a hospital or blood bank."
  );
});

// Chat assistant
function addChatMessage(message, className) {
  const bubble = document.createElement("div");

  bubble.className = `chat-bubble ${className}`;
  bubble.textContent = message;

  $("chatMessages").appendChild(bubble);
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;

  return bubble;
}

$("chatForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = $("chatInput").value.trim();

  if (!question) return;

  addChatMessage(question, "user-bubble");
  $("chatInput").value = "";

  const thinkingBubble = addChatMessage(
    "CarePath AI is preparing a response...",
    "assistant-bubble"
  );

  const submitButton = $("chatForm").querySelector(
    'button[type="submit"]'
  );

  if (submitButton) submitButton.disabled = true;

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Chat request failed.");
    }

    thinkingBubble.textContent =
      data.answer || "No response received.";

  } catch (error) {
    thinkingBubble.textContent =
      "Unable to connect to CarePath AI. Please check the backend and try again.";

    console.error("Chat API Error:", error);

  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

// Sidebar navigation
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// Initial render using saved data
renderDocuments();
renderMedicines();
renderBlood();
renderDonors();
renderRequests();
renderTimeline();
updateStats();
