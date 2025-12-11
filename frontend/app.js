
const API_URL = "http://localhost:8000";  // PORT 8000, pas 8080

console.log(`🔗 API URL configurée: ${API_URL}`);

// Ajoutez ce code pour tester la connexion au démarrage
async function testConnection() {
    try {
        const response = await fetch(`${API_URL}/`);
        if (response.ok) {
            console.log("✅ Backend connecté avec succès");
        } else {
            console.log("❌ Backend répond mais avec erreur:", response.status);
        }
    } catch (error) {
        console.log("❌ Impossible de joindre le backend:", error);
    }
}

// Appelez cette fonction au chargement
window.addEventListener('load', testConnection);

/* ---------------------------
     NAVIGATION ENTRE SECTIONS
---------------------------- */
function showSection(id) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.remove("active", "fade-in");
  });

  const target = document.getElementById(id);
  target.classList.add("active", "fade-in");

  // Navigation visuelle
  document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`nav-${id}`).classList.add("active");

  const underline = document.querySelector(".nav-underline");
  underline.style.width = document.getElementById(`nav-${id}`).offsetWidth + "px";
  underline.style.left = document.getElementById(`nav-${id}`).offsetLeft + "px";
}

/* ---------------------------
        UPLOAD CSV + COLONNES
---------------------------- */
async function uploadFile() {
  const file = document.getElementById("csvFile").files[0];
  if (!file) {
    alert("Veuillez sélectionner un fichier CSV !");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const messageEl = document.getElementById("uploadMessage");
  messageEl.textContent = "⏳ Téléversement en cours...";
  messageEl.className = "message loading";

  try {
    console.log("📤 Envoi vers:", `${API_URL}/data/upload`);
    
    const response = await fetch(`${API_URL}/data/upload`, {
      method: "POST",
      body: formData
    });

    console.log("📡 Statut réponse:", response.status);
    
    const data = await response.json();
    console.log("📊 Données reçues:", data);

    if (response.ok && data.columns) {
      messageEl.textContent = "✅ Fichier téléversé avec succès !";
      messageEl.className = "message success";

      // 🟦 Mettre à jour les variables pour VISUALISATIONS
      const vizVar1 = document.getElementById("vizVar1");
      const vizVar2 = document.getElementById("vizVar2");
      
      if (vizVar1 && vizVar2) {
        vizVar1.innerHTML = '<option disabled selected>-- Choisir une variable --</option>' + 
                           data.columns.map(c => `<option value="${c}">${c}</option>`).join("");
        vizVar2.innerHTML = '<option disabled selected>-- Choisir une variable --</option>' + 
                           data.columns.map(c => `<option value="${c}">${c}</option>`).join("");
      }

      // 🟧 Mettre à jour les variables pour TESTS (CORRIGES)
      const testVar1 = document.getElementById("testVar1");  // testVar1 au lieu de var1
      const testVar2 = document.getElementById("testVar2");  // testVar2 au lieu de var2

    if (testVar1 && testVar2) {
      testVar1.innerHTML = '<option disabled selected>-- Choisir une variable --</option>' + 
                          data.columns.map(c => `<option value="${c}">${c}</option>`).join("");
      testVar2.innerHTML = '<option disabled selected>-- Choisir une variable --</option>' + 
                          data.columns.map(c => `<option value="${c}">${c}</option>`).join("");
        
        // Animation visuelle
        testVar1.classList.add("highlight");
        testVar2.classList.add("highlight");
        setTimeout(() => {
          testVar1.classList.remove("highlight");
          testVar2.classList.remove("highlight");
        }, 800);
      }

    } else {
      messageEl.textContent = "❌ Erreur : " + (data.detail || data.error || "Inconnue");
      messageEl.className = "message error";
    }

  } catch (err) {
    console.error("💥 Erreur complète:", err);
    messageEl.textContent = "❌ Problème de connexion au serveur: " + err.message;
    messageEl.className = "message error";
  }
}

/* ---------------------------
         VISUALISATIONS
---------------------------- */
async function generateViz() {
  const type = document.getElementById("vizType").value;
  const var1 = document.getElementById("vizVar1").value;  // Utilisez vizVar1 maintenant
  const var2 = document.getElementById("vizVar2").value;  // Utilisez vizVar2 maintenant

  if (!var1) {
    alert("⚠️ Veuillez sélectionner au moins une variable !");
    return;
  }

  let url = `${API_URL}/visualisation/${type}?var=${encodeURIComponent(var1)}`;

  if (type === "boxplot") url = `${API_URL}/visualisation/boxplot?y=${var1}&x=${var2}`;
  if (type === "scatter") url = `${API_URL}/visualisation/scatter?x=${var1}&y=${var2}`;
  if (type === "line") url = `${API_URL}/visualisation/line?y=${var1}&order_by=${var2}`;
  if (type === "kde") url = `${API_URL}/visualisation/kde?var=${var1}`;
  if (type === "bar") url = `${API_URL}/visualisation/bar?cat=${var1}`;

  console.log("📊 Requête visualisation:", url);

  const vizResult = document.getElementById("vizResult");
  vizResult.style.opacity = "0.2";

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok && data.image_base64) {
      vizResult.src = "data:image/png;base64," + data.image_base64;
      setTimeout(() => (vizResult.style.opacity = "1"), 300);
    } else {
      alert("⚠️ Erreur : " + (data.detail || "Requête incorrecte"));
    }
  } catch (error) {
    console.error("Erreur visualisation:", error);
    alert("🚫 Impossible de contacter le serveur !");
  }
}

/* ---------------------------
            PRÉDICTION
---------------------------- */
async function predict() {
  // Récupération des valeurs
  const age = document.getElementById("age").value;
  const bmi = document.getElementById("bmi").value;
  const bp = document.getElementById("bp").value;
  const glucose = document.getElementById("glucose").value;
  const hba1c = document.getElementById("hba1c").value;
  const history = document.getElementById("history").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  // Validation
  if (!age || !bmi || !bp || !glucose || !hba1c || !history) {
    alert("⚠️ Veuillez remplir tous les champs !");
    return;
  }
  if (!latitude || !longitude) {
    alert("⚠️ Veuillez renseigner latitude et longitude pour la cartographie.");
    return;
  }

  const resultEl = document.getElementById("predictionResult");
  resultEl.textContent = "⏳ Calcul en cours...";
  resultEl.className = "message loading";

  try {
    const response = await fetch(`${API_URL}/prediction/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: parseFloat(age),
        bmi: parseFloat(bmi),
        systolic_bp: parseFloat(bp),
        glucose_fasting: parseFloat(glucose),
        hba1c: parseFloat(hba1c),
        family_history: parseInt(history)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Erreur ${response.status}`);
    }

    const data = await response.json();
    
    // Affichage amélioré
    const probability = data.probability_percent || (data.probability * 100).toFixed(1);
    const resultText = data.result === "Diabétique" ? "🔴 Diabétique" : "🟢 Non diabétique";
    const riskCategory = data.risk_category ? ` | ${data.risk_category}` : '';
    
    resultEl.innerHTML = `
      <strong>${resultText}</strong><br>
      Probabilité : <strong>${probability}%</strong>${riskCategory}
    `;
    resultEl.className = "message success";

    // ➜ Rediriger vers la cartographie avec un marqueur
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    showSection('map');
    renderMapWithMarker(lat, lon, parseFloat(probability));

  } catch (error) {
    console.error("Erreur:", error);
    resultEl.textContent = `❌ Erreur: ${error.message}`;
    resultEl.className = "message error";
  }
}

/* ---------------------------
      TESTS STATISTIQUES
---------------------------- */
async function runStatTest() {
  const testType = document.getElementById("testType").value;
  const var1 = document.getElementById("testVar1").value;
  const var2 = document.getElementById("testVar2").value;

  // Validation
  if (!var1 || var1.includes("--") || !var2 || var2.includes("--")) {
    alert("⚠️ Veuillez sélectionner les deux variables !");
    return;
  }

  const resultEl = document.getElementById("testResult");
  resultEl.textContent = "⏳ Calcul du test...";
  resultEl.className = "message loading";

  try {
    console.log(`🧪 Test ${testType}: ${var1} vs ${var2}`);
    
    const response = await fetch(`${API_URL}/stats/${testType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ var1, var2 })
    });

    console.log("📡 Réponse:", response.status);
    
    const data = await response.json();
    console.log("📊 Résultat:", data);

    if (response.ok && !data.error) {
      // Formatage amélioré avec p-value formatée
      let resultText = `✅ Test: ${testType.toUpperCase()}\n\n`;
      
      // Afficher la statistique
      if (data.statistic !== undefined) {
        resultText += `📊 Statistique = ${data.statistic.toFixed(6)}\n`;
      }
      if (data.correlation !== undefined) {
        resultText += `📈 Corrélation = ${data.correlation.toFixed(6)}\n`;
      }
      
      // Afficher la p-value avec format scientifique si très petite
      if (data.p_value !== undefined) {
        if (data.p_value < 0.0001) {
          resultText += `🎯 p-value = ${data.p_value.toExponential(4)}\n`;
        } else {
          resultText += `🎯 p-value = ${data.p_value.toFixed(6)}\n`;
        }
        
        // Interprétation
        resultText += data.p_value < 0.05 ? 
          "🌟 Résultat significatif (p < 0.05)" : 
          "📉 Résultat non significatif (p ≥ 0.05)";
      }
      
      // Informations supplémentaires
      if (data.n !== undefined) {
        resultText += `\n📋 N = ${data.n}`;
      }
      if (data.n1 !== undefined && data.n2 !== undefined) {
        resultText += `\n📋 N₁ = ${data.n1}, N₂ = ${data.n2}`;
      }
      if (data.interpretation) {
        resultText += `\n💡 ${data.interpretation}`;
      }
      
      resultEl.textContent = resultText;
      resultEl.className = "message success";
    } else {
      resultEl.textContent = "❌ Erreur : " + (data.error || data.detail || "Erreur inconnue");
      resultEl.className = "message error";
    }
  } catch (error) {
    console.error("💥 Erreur test:", error);
    resultEl.textContent = "🚫 Erreur réseau : impossible de contacter le serveur.";
    resultEl.className = "message error";
  }
}

/* ---------------------------
        ANIMATION INITIALE
---------------------------- */
window.addEventListener("load", () => {
  const firstNav = document.querySelector("nav button.active");
  const underline = document.querySelector(".nav-underline");
  underline.style.width = firstNav.offsetWidth + "px";
  underline.style.left = firstNav.offsetLeft + "px";
});

// Fonction de test de la prédiction
async function testPrediction() {
  const testData = {
    age: 45,
    bmi: 25.5,
    systolic_bp: 120,
    glucose_fasting: 95,
    hba1c: 5.4,
    family_history: 0
  };

  try {
    const response = await fetch(`${API_URL}/prediction/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log("🧪 Test prédiction:", result);
    return result;
  } catch (error) {
    console.error("🧪 Erreur test:", error);
  }
}

// Appelez cette fonction dans la console du navigateur pour tester

/* ---------------------------
  🔥 TEST URGENT DE PRÉDICTION
---------------------------- */
async function debugPredictionNow() {
  console.log("=== 🔥 DÉBOGAGE PRÉDICTION ===");
  
  // Test avec des données simples
  const testData = {
    age: 45,
    bmi: 25.5,
    systolic_bp: 120,
    glucose_fasting: 95,
    hba1c: 5.4,
    family_history: 0
  };

  console.log("Données de test:", testData);

  try {
    const response = await fetch(`${API_URL}/prediction/manual`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData)
    });
    
    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log("Réponse brute:", text);
    
    try {
      const json = JSON.parse(text);
      console.log("JSON parsé:", json);
    } catch (e) {
      console.log("❌ Impossible de parser JSON:", e.message);
    }
    
  } catch (error) {
    console.error("💥 Erreur fetch:", error);
  }
}

// Exposer la fonction
window.debugPredictionNow = debugPredictionNow;
console.log("🚨 Commande de débogage: debugPredictionNow()");

/* ---------------------------
  TEST DE CONNEXION AU DÉMARRAGE
  (AJOUTEZ APRÈS LE CODE CI-DESSUS)
---------------------------- */
async function testConnectionOnLoad() {
  console.log("🔍 Test de connexion au backend...");
  
  try {
    const response = await fetch(`${API_URL}/`);
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Backend connecté avec succès:", data.message);
      return true;
    } else {
      console.warn(`⚠️ Backend répond avec erreur: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Impossible de joindre le backend:", error);
    console.log("📌 URL essayée:", API_URL);
    alert("⚠️ Attention: Le backend semble ne pas fonctionner sur " + API_URL);
    return false;
  }
}

// Test des endpoints principaux
async function testAllEndpoints() {
  console.log("🧪 Test de tous les endpoints...");
  
  const endpoints = [
    "/data/upload",
    "/stats/spearman",
    "/visualisation/histogram",
    "/prediction/manual"
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${endpoint}: ❌ ${error.message}`);
    }
  }
}

// Exposez les fonctions de test
window.testConnectionOnLoad = testConnectionOnLoad;
window.testAllEndpoints = testAllEndpoints;

// Exposez les fonctions utilisées par l'HTML
// Surcharge showSection pour initialiser la carte à l'affichage
const _showSection = showSection;
showSection = function(id) {
  _showSection(id);
  if (id === 'map') {
    initMap();
  }
};

window.showSection = showSection;
window.uploadFile = uploadFile;
window.generateViz = generateViz;
window.predict = predict;
window.runStatTest = runStatTest;

// Exécuter au chargement
window.addEventListener('load', () => {
  console.log("🚀 Application chargée");
  
  // Animation de navigation existante
  const firstNav = document.querySelector("nav button.active");
  const underline = document.querySelector(".nav-underline");
  if (firstNav && underline) {
    underline.style.width = firstNav.offsetWidth + "px";
    underline.style.left = firstNav.offsetLeft + "px";
  }
  
  // Init carte si section ouverte directement
  if (document.getElementById('map').classList.contains('active')) {
    initMap();
  }

  // Test de connexion automatique
  setTimeout(() => {
    testConnectionOnLoad().then(isConnected => {
      if (isConnected) {
        console.log("🌐 Tous les systèmes sont opérationnels");
      }
    });
  }, 1000);
});

/* ---------------------------
        CARTOGRAPHIE
---------------------------- */
let _leafletMap = null;
let _leafletMarker = null;

function initMap() {
  const mapDiv = document.getElementById('mapContainer');
  if (!mapDiv) return;

  // Si déjà créé, ne pas recréer
  if (_leafletMap) {
    _leafletMap.invalidateSize();
    return;
  }

  _leafletMap = L.map('mapContainer').setView([48.8566, 2.3522], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(_leafletMap);
}

function renderMapWithMarker(lat, lon, probability) {
  initMap();
  const info = document.getElementById('mapInfo');

  if (isNaN(lat) || isNaN(lon)) {
    info.textContent = '⚠️ Coordonnées invalides';
    info.className = 'message error';
    return;
  }

  // Couleur selon probabilité
  const p = Math.max(0, Math.min(100, probability));
  const color = p >= 66 ? 'red' : (p >= 33 ? 'orange' : 'green');
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};color:white;padding:4px 6px;border-radius:6px;border:1px solid rgba(0,0,0,0.3);font-size:12px;">${p.toFixed(1)}%</div>`
  });

  if (_leafletMarker) {
    _leafletMarker.remove();
  }
  _leafletMarker = L.marker([lat, lon], { icon }).addTo(_leafletMap);
  _leafletMap.setView([lat, lon], 10);

  info.textContent = `📍 Position: (${lat.toFixed(4)}, ${lon.toFixed(4)}) | Probabilité diabète: ${p.toFixed(1)}%`;
  info.className = 'message success';
}

console.log("🛠️ Fonctions de test disponibles:");
console.log("   - testConnectionOnLoad()");
console.log("   - testAllEndpoints()");
console.log("   - debugPredictionNow()");