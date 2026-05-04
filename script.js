// =====================================================
// FIREBASE - import dinâmico (não trava o site se falhar)
// =====================================================
let db = null;
let firestoreDoc = null;
let firestoreSetDoc = null;
let firestoreGetDoc = null;

async function initFirebase() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const { getFirestore, doc, setDoc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

        const firebaseConfig = {
            apiKey: "AIzaSyBJ0lI-zofeUtjOypurdX4Xa9dX09EwRRM",
            authDomain: "sitepedido-79bb0.firebaseapp.com",
            projectId: "sitepedido-79bb0",
            storageBucket: "sitepedido-79bb0.firebasestorage.app",
            messagingSenderId: "889662198209",
            appId: "1:889662198209:web:67c2d2f01df5d75b4f5f40"
        };

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        firestoreDoc = doc;
        firestoreSetDoc = setDoc;
        firestoreGetDoc = getDoc;

        console.log("✅ Firebase inicializado com sucesso!");
        return true;
    } catch (e) {
        console.error("❌ Falha ao inicializar Firebase:", e);
        db = null;
        return false;
    }
}

// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================
let acceptanceDate = null;
let specialDates = [];
let counterInterval = null;
const FIREBASE_DOC = { collection: "amorVaultX92", document: "linhaTempoAnna2026" };

// =====================================================
// ELEMENTOS DO DOM
// =====================================================
const proposalScreen = document.getElementById('proposal-screen');
const acceptanceScreen = document.getElementById('acceptance-screen');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const acceptanceDateElement = document.getElementById('acceptance-date');
const addDateBtn = document.getElementById('add-date-btn');
const dateTitleInput = document.getElementById('date-title');
const dateValueInput = document.getElementById('date-value');
const dateDescriptionInput = document.getElementById('date-description');
const specialDatesList = document.getElementById('special-dates-list');
const confettiContainer = document.getElementById('confetti-container');

const secretAdmin = document.getElementById('secret-admin');
const adminIcon = document.querySelector('.admin-icon');
const adminPanel = document.querySelector('.admin-panel');
const resetTimeBtn = document.getElementById('reset-time-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const dateSelect = document.getElementById('date-select');
const moveUpBtn = document.getElementById('move-up-btn');
const moveDownBtn = document.getElementById('move-down-btn');
const deleteDateBtn = document.getElementById('delete-date-btn');
const photoDateSelect = document.getElementById('photo-date-select');
const adminDateImageInput = document.getElementById('admin-date-image');
const adminImagePreview = document.getElementById('admin-image-preview');
const addPhotoBtn = document.getElementById('add-photo-btn');

const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalDescription = document.getElementById('modal-description');
const closeModal = document.querySelector('.close-modal');

let currentImageData = null;

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener('DOMContentLoaded', async function () {
    // Configura botões ANTES do Firebase (site responde imediatamente)
    setupEventListeners();

    // Inicializa Firebase em paralelo
    await initFirebase();

    // Carrega dados (Firebase ou localStorage)
    await loadData();

    // Verifica status
    checkAcceptanceStatus();
});

// =====================================================
// CARREGAR / SALVAR DADOS
// =====================================================
async function loadData() {
    if (db) {
        try {
            const snap = await firestoreGetDoc(firestoreDoc(db, FIREBASE_DOC.collection, FIREBASE_DOC.document));
            if (snap.exists()) {
                const data = snap.data();
                acceptanceDate = data.acceptanceDate ? new Date(data.acceptanceDate) : null;
                specialDates = data.specialDates || [];
                // Salva no localStorage como backup
                salvarLocalStorage();
                console.log("✅ Dados carregados do Firebase!");
                return;
            } else {
                console.log("⚠️ Documento Firebase não encontrado, usando localStorage.");
            }
        } catch (e) {
            console.error("❌ Erro ao carregar Firebase:", e);
            if (e.code === 'permission-denied') {
                showMessage("⚠️ Permissão negada no Firebase. Verifique as regras.", "error");
            }
        }
    }
    // Fallback: localStorage
    carregarLocalStorage();
}

async function saveData() {
    // Sempre salva local primeiro
    salvarLocalStorage();

    if (db) {
        try {
            await firestoreSetDoc(firestoreDoc(db, FIREBASE_DOC.collection, FIREBASE_DOC.document), {
                acceptanceDate: acceptanceDate ? acceptanceDate.toISOString() : null,
                specialDates: specialDates
            });
            console.log("✅ Dados salvos no Firebase!");
        } catch (e) {
            console.error("❌ Erro ao salvar Firebase:", e);
            showMessage("Firebase indisponível. Dados salvos localmente.", "warning");
        }
    }
}

function salvarLocalStorage() {
    try {
        localStorage.setItem('proposalData', JSON.stringify({
            acceptanceDate: acceptanceDate ? acceptanceDate.toISOString() : null,
            specialDates: specialDates
        }));
    } catch (e) {
        console.error("Erro localStorage:", e);
    }
}

function carregarLocalStorage() {
    try {
        const stored = localStorage.getItem('proposalData');
        if (stored) {
            const data = JSON.parse(stored);
            acceptanceDate = data.acceptanceDate ? new Date(data.acceptanceDate) : null;
            specialDates = data.specialDates || [];
            console.log("📦 Dados carregados do localStorage.");
        } else {
            specialDates = [];
        }
    } catch (e) {
        console.error("Erro ao carregar localStorage:", e);
        specialDates = [];
    }
}

// =====================================================
// STATUS DE ACEITAÇÃO
// =====================================================
function checkAcceptanceStatus() {
    loadSpecialDates();
    updateDateSelect();
    updatePhotoDateSelect();

    if (acceptanceDate) {
        showAcceptanceScreen();
        startCounter();
        updateAcceptanceDate();
        disableYesBtn();
    } else {
        showProposalScreen();
    }
}

// =====================================================
// EVENT LISTENERS
// =====================================================
function setupEventListeners() {
    yesBtn.addEventListener('click', handleYesClick);
    noBtn.addEventListener('mouseenter', handleNoHover);
    noBtn.addEventListener('click', handleNoClick);

    addDateBtn.addEventListener('click', addSpecialDate);

    adminIcon.addEventListener('click', toggleAdminPanel);
    resetTimeBtn.addEventListener('click', handleResetTime);
    resetAllBtn.addEventListener('click', handleResetAll);

    dateSelect.addEventListener('change', updateOrganizeButtons);
    moveUpBtn.addEventListener('click', moveDateUp);
    moveDownBtn.addEventListener('click', moveDateDown);
    deleteDateBtn.addEventListener('click', deleteSelectedDate);

    adminDateImageInput.addEventListener('change', handleAdminImageUpload);
    addPhotoBtn.addEventListener('click', addPhotoToDate);

    document.getElementById('admin-logout-btn').addEventListener('click', adminLogout);
    document.getElementById('share-data-btn').addEventListener('click', copyLink);

    // Botões de navegação entre telas
    document.getElementById('btn-ver-pedido').addEventListener('click', () => {
        showProposalScreen();
        window.scrollTo(0, 0);
    });
    document.getElementById('btn-voltar-contador').addEventListener('click', () => {
        showAcceptanceScreen();
        window.scrollTo(0, 0);
    });

    closeModal.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', function (e) {
        if (e.target === imageModal) closeImageModal();
    });

    dateTitleInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') addSpecialDate(); });
    dateValueInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') addSpecialDate(); });
    dateDescriptionInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') addSpecialDate(); });

    document.addEventListener('click', function (e) {
        if (!secretAdmin.contains(e.target)) {
            adminPanel.classList.remove('active');
        }
    });
}

// =====================================================
// BOTÃO SIM
// =====================================================
async function handleYesClick() {
    // Proteção dupla: variável em memória E botão desabilitado
    if (acceptanceDate || yesBtn.disabled) {
        showAcceptanceScreen();
        window.scrollTo(0, 0);
        return;
    }
    disableYesBtn(); // Desabilita imediatamente antes de qualquer coisa
    acceptanceDate = new Date();
    await saveData();
    showAcceptanceScreen();
    window.scrollTo(0, 0);
    startCounter();
    createConfetti();
    updateAcceptanceDate();
}

function disableYesBtn() {
    yesBtn.disabled = true;
    yesBtn.style.opacity = '0.5';
    yesBtn.style.cursor = 'not-allowed';
}

// =====================================================
// BOTÃO NÃO
// =====================================================
function handleNoHover(e) {
    const button = e.target;
    const container = button.parentElement;
    const containerRect = container.getBoundingClientRect();

    const maxX = containerRect.width - button.offsetWidth - 20;
    const maxY = containerRect.height - button.offsetHeight - 20;

    const randomX = Math.random() * maxX + 10;
    const randomY = Math.random() * maxY + 10;

    button.style.position = 'absolute';
    button.style.left = randomX + 'px';
    button.style.top = randomY + 'px';

    button.style.transform = 'scale(1.1) rotate(5deg)';
    setTimeout(() => { button.style.transform = 'scale(1) rotate(0deg)'; }, 300);
}

function handleNoClick(e) {
    e.preventDefault();
    const messages = [
        'Ainda não desisti! 😊',
        'Por favor, pense mais! 🥺',
        'Eu sei que você quer dizer sim! 💕',
        'Não desista de nós! 💔',
        'Tente novamente! 🌹'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const messageElement = document.createElement('div');
    messageElement.textContent = randomMessage;
    messageElement.style.cssText = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,255,255,0.95);
        padding: 20px 40px; border-radius: 15px;
        font-size: 1.2rem; color: #333;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 10000; animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => { if (document.body.contains(messageElement)) document.body.removeChild(messageElement); }, 300);
    }, 2000);
    handleNoHover(e);
}

// =====================================================
// TELAS
// =====================================================
function showProposalScreen() {
    proposalScreen.classList.add('active');
    acceptanceScreen.classList.remove('active');
    document.getElementById('acceptance-banner').style.display = 'none';
    // Mostrar botão de voltar ao contador se já aceitou
    const btnVoltar = document.getElementById('btn-voltar-contador');
    if (btnVoltar) btnVoltar.style.display = acceptanceDate ? 'inline-block' : 'none';
}

function showAcceptanceScreen() {
    proposalScreen.classList.remove('active');
    acceptanceScreen.classList.add('active');
}

function showAcceptanceBanner() {
    proposalScreen.classList.add('active');
    acceptanceScreen.classList.remove('active');
    document.getElementById('acceptance-banner').style.display = 'block';
}

function updateAcceptanceDate() {
    if (acceptanceDate && acceptanceDateElement) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        acceptanceDateElement.textContent = acceptanceDate.toLocaleDateString('pt-BR', options);
    }
}

// =====================================================
// CONTADOR
// =====================================================
function startCounter() {
    if (counterInterval) clearInterval(counterInterval);
    updateCounter();
    counterInterval = setInterval(updateCounter, 1000);
}

function updateCounter() {
    if (!acceptanceDate) return;
    const now = new Date();
    const diff = now - acceptanceDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    document.getElementById('love-text').textContent = `${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`;
}

// =====================================================
// DATAS ESPECIAIS
// =====================================================
function loadSpecialDates() {
    renderSpecialDates();
}

function addSpecialDate() {
    const title = dateTitleInput.value.trim();
    const date = dateValueInput.value;
    const description = dateDescriptionInput ? dateDescriptionInput.value.trim() : '';

    if (!title) { showMessage('Por favor, preencha o título!', 'error'); dateTitleInput.focus(); return; }
    if (!date) { showMessage('Por favor, selecione a data!', 'error'); dateValueInput.focus(); return; }

    specialDates.push({
        id: Date.now(),
        title, date, description,
        image: currentImageData
    });

    saveData();
    renderSpecialDates();
    updateDateSelect();
    updatePhotoDateSelect();

    dateTitleInput.value = '';
    dateValueInput.value = '';
    dateDescriptionInput.value = '';
    currentImageData = null;

    showMessage('Data especial adicionada! 💕', 'success');
}

function renderSpecialDates() {
    specialDatesList.innerHTML = '';
    if (specialDates.length === 0) {
        specialDatesList.innerHTML = '<p style="color:#666;text-align:center;">Nenhuma data especial cadastrada ainda.</p>';
        return;
    }

    const sortedDates = [...specialDates].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedDates.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.className = date.image ? 'date-item-with-image' : 'date-item';

        const dateObj = new Date(date.date + 'T12:00:00');
        const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const imageHtml = date.image ? `<img src="${date.image}" alt="${date.title}" class="date-item-image">` : '';
        const descriptionHtml = date.description ? `<div class="date-item-description">${date.description}</div>` : '';

        dateElement.innerHTML = `
            ${imageHtml}
            <div class="date-item-content">
                <div class="date-item-title">${date.title}</div>
                <div class="date-item-date">${formattedDate}</div>
                ${descriptionHtml}
            </div>
        `;

        if (date.image) {
            dateElement.querySelector('.date-item-image').addEventListener('click', () => openImageModal(date));
        }

        specialDatesList.appendChild(dateElement);
    });
}

// =====================================================
// ADMIN
// =====================================================
function toggleAdminPanel(e) {
    e.stopPropagation();
    if (isAdminAuthenticated()) {
        adminPanel.classList.toggle('active');
    } else {
        askAdminPassword();
    }
}

function isAdminAuthenticated() {
    const authTime = localStorage.getItem('adminAuthTime');
    if (!authTime) return false;
    return (Date.now() - parseInt(authTime)) < 30 * 60 * 1000;
}

function askAdminPassword() {
    const password = prompt('🔐 Digite a senha de administrador:');
    if (password === null) return;
    if (password === 'digiteasenha123') {
        localStorage.setItem('adminAuthTime', Date.now().toString());
        adminPanel.classList.add('active');
        showMessage('🔓 Acesso autorizado!', 'success');
    } else {
        showMessage('🔒 Senha incorreta!', 'error');
    }
}

function adminLogout() {
    localStorage.removeItem('adminAuthTime');
    adminPanel.classList.remove('active');
    showMessage('🔒 Logout realizado!', 'info');
}

function handleResetTime() {
    if (confirm('Tem certeza que deseja resetar apenas o tempo de namoro?')) {
        acceptanceDate = null;
        if (counterInterval) { clearInterval(counterInterval); counterInterval = null; }
        saveData();
        showProposalScreen();
        adminPanel.classList.remove('active');
        showMessage('Tempo resetado!', 'info');
    }
}

function handleResetAll() {
    if (confirm('Tem certeza que deseja resetar TODOS os dados?')) {
        acceptanceDate = null;
        specialDates = [];
        if (counterInterval) { clearInterval(counterInterval); counterInterval = null; }
        saveData();
        // Reativar botão Sim
        yesBtn.disabled = false;
        yesBtn.style.opacity = '';
        yesBtn.style.cursor = '';
        showProposalScreen();
        renderSpecialDates();
        adminPanel.classList.remove('active');
        showMessage('Todos os dados foram resetados!', 'info');
    }
}

function updateDateSelect() {
    dateSelect.innerHTML = '<option value="">Selecione uma data...</option>';
    specialDates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = date.id;
        option.textContent = `${index + 1}. ${date.title}`;
        dateSelect.appendChild(option);
    });
    updateOrganizeButtons();
}

function updateOrganizeButtons() {
    const selectedId = dateSelect.value;
    const selectedIndex = specialDates.findIndex(date => date.id == selectedId);
    const hasSelection = selectedId !== '';
    moveUpBtn.disabled = !hasSelection || selectedIndex === 0;
    moveDownBtn.disabled = !hasSelection || selectedIndex === specialDates.length - 1;
    deleteDateBtn.disabled = !hasSelection;
}

function moveDateUp() {
    const selectedId = dateSelect.value;
    const idx = specialDates.findIndex(d => d.id == selectedId);
    if (idx > 0) {
        [specialDates[idx - 1], specialDates[idx]] = [specialDates[idx], specialDates[idx - 1]];
        saveData(); renderSpecialDates(); updateDateSelect(); updatePhotoDateSelect();
        showMessage('Data movida para cima! ⬆️', 'success');
    }
}

function moveDateDown() {
    const selectedId = dateSelect.value;
    const idx = specialDates.findIndex(d => d.id == selectedId);
    if (idx < specialDates.length - 1) {
        [specialDates[idx], specialDates[idx + 1]] = [specialDates[idx + 1], specialDates[idx]];
        saveData(); renderSpecialDates(); updateDateSelect(); updatePhotoDateSelect();
        showMessage('Data movida para baixo! ⬇️', 'success');
    }
}

function deleteSelectedDate() {
    const selectedId = dateSelect.value;
    const selectedDate = specialDates.find(d => d.id == selectedId);
    if (selectedDate && confirm(`Deletar "${selectedDate.title}"?`)) {
        specialDates = specialDates.filter(d => d.id != selectedId);
        saveData(); renderSpecialDates(); updateDateSelect(); updatePhotoDateSelect();
        showMessage('Data deletada! 🗑️', 'info');
    }
}

function updatePhotoDateSelect() {
    photoDateSelect.innerHTML = '<option value="">Selecione uma data para foto...</option>';
    specialDates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = date.id;
        option.textContent = `${index + 1}. ${date.title}${date.image ? ' (📷)' : ''}`;
        photoDateSelect.appendChild(option);
    });
}

function handleAdminImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showMessage('Selecione uma imagem válida!', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showMessage('Imagem muito grande! Máx 5MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function (event) {
        currentImageData = event.target.result;
        adminImagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        showMessage('Imagem carregada!', 'success');
    };
    reader.readAsDataURL(file);
}

function addPhotoToDate() {
    const selectedId = photoDateSelect.value;
    if (!selectedId) { showMessage('Selecione uma data primeiro!', 'error'); return; }
    if (!currentImageData) { showMessage('Selecione uma imagem primeiro!', 'error'); return; }
    const idx = specialDates.findIndex(d => d.id == selectedId);
    if (idx !== -1) {
        specialDates[idx].image = currentImageData;
        saveData(); renderSpecialDates();
        currentImageData = null;
        adminImagePreview.innerHTML = '<div class="placeholder">Nenhuma imagem selecionada</div>';
        adminDateImageInput.value = '';
        showMessage('Foto adicionada! 📷', 'success');
    }
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => showMessage('Link copiado! 📱', 'success'))
        .catch(() => showMessage('Não foi possível copiar o link.', 'error'));
}

// =====================================================
// MODAL DE IMAGEM
// =====================================================
function openImageModal(date) {
    modalImage.src = date.image;
    modalTitle.textContent = date.title;
    const dateObj = new Date(date.date + 'T12:00:00');
    modalDate.textContent = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    modalDescription.textContent = date.description || '';
    imageModal.style.display = 'block';
}

function closeImageModal() {
    imageModal.style.display = 'none';
}

// =====================================================
// CONFETTI
// =====================================================
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6ab04c'];
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confettiContainer.appendChild(confetti);
            setTimeout(() => { if (confettiContainer.contains(confetti)) confettiContainer.removeChild(confetti); }, 5000);
        }, i * 30);
    }
}

// =====================================================
// MENSAGENS
// =====================================================
function showMessage(message, type) {
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db', warning: '#f39c12' };
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${colors[type] || '#333'};
        color: white; padding: 15px 25px;
        border-radius: 10px; font-size: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000; max-width: 300px;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => { if (document.body.contains(el)) document.body.removeChild(el); }, 300);
    }, 3000);
}

// =====================================================
// ANIMAÇÕES CSS EXTRAS
// =====================================================
const extraStyle = document.createElement('style');
extraStyle.textContent = `
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
`;
document.head.appendChild(extraStyle);
