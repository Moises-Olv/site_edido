// Versão simplificada sem módulos ES para GitHub Pages
// Funciona 100% com localStorage

// Variáveis globais
let acceptanceDate = null;
let specialDates = [];
let counterInterval = null;

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

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    setupEventListeners();
    checkAcceptanceStatus();
});

// Verificar status de aceitação
function checkAcceptanceStatus() {
    // Carregar dados e selects independente do status
    loadSpecialDates();
    updateDateSelect();
    updatePhotoDateSelect();
    
    if (acceptanceDate) {
        showAcceptanceBanner();
        startCounter();
        updateAcceptanceDate();
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

// Lidar com clique no botão Sim
function handleYesClick() {
    acceptanceDate = new Date();
    saveData();
    showAcceptanceBanner();
    startCounter();
    createConfetti();
    updateAcceptanceDate();
}

// Lidar com hover no botão Não
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
    setTimeout(() => {
        button.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
}

// Lidar com clique no botão Não
function handleNoClick(e) {
    const messages = [
        "Tem certeza? 😢",
        "Pensa mais um pouco... 💭",
        "Eu te amo muito! ❤️",
        "Não desista de nós! 💕",
        "Somos perfeitos juntos! 🌟"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const messageElement = document.createElement('div');
    messageElement.textContent = randomMessage;
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
        padding: 1rem 2rem;
        border-radius: 20px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(238,90,36,0.4);
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 2000);
    
    handleNoHover(e);
}

// Mostrar tela de proposta
function showProposalScreen() {
    proposalScreen.classList.add('active');
    acceptanceScreen.classList.remove('active');
    
    const banner = document.getElementById('acceptance-banner');
    banner.style.display = 'none';
}

// Mostrar tela de aceitação
function showAcceptanceScreen() {
    proposalScreen.classList.remove('active');
    acceptanceScreen.classList.add('active');
}

// Mostrar banner de aceitação na primeira página
function showAcceptanceBanner() {
    proposalScreen.classList.add('active');
    acceptanceScreen.classList.remove('active');
    
    const banner = document.getElementById('acceptance-banner');
    banner.style.display = 'block';
}

// Atualizar data de aceitação
function updateAcceptanceDate() {
    if (acceptanceDate && acceptanceDateElement) {
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        acceptanceDateElement.textContent = acceptanceDate.toLocaleDateString('pt-BR', options);
    }
}

// Iniciar contador
function startCounter() {
    if (counterInterval) clearInterval(counterInterval);
    
    counterInterval = setInterval(() => {
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
        
        const loveText = document.getElementById('love-text');
        loveText.textContent = `${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`;
    }, 1000);
}

// Adicionar data especial
function addSpecialDate() {
    const title = dateTitleInput.value.trim();
    const date = dateValueInput.value;
    const description = dateDescriptionInput.value.trim();
    
    if (!title || !date) {
        showMessage("Preencha título e data!", "error");
        return;
    }
    
    const specialDate = {
        id: Date.now().toString(),
        title: title,
        date: date,
        description: description,
        image: null
    };
    
    specialDates.push(specialDate);
    saveData();
    renderSpecialDates();
    updateDateSelect();
    updatePhotoDateSelect();
    
    // Limpar campos
    dateTitleInput.value = '';
    dateValueInput.value = '';
    dateDescriptionInput.value = '';
    
    showMessage("Data especial adicionada! ❤️", "success");
}

// Renderizar datas especiais
function renderSpecialDates() {
    specialDatesList.innerHTML = '';
    
    const sortedDates = [...specialDates].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedDates.forEach(date => {
        const dateElement = document.createElement('div');
        dateElement.className = date.image ? 'date-item-with-image' : 'date-item';
        
        const dateObj = new Date(date.date);
        const formattedDate = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        let contentHTML = `
            <div class="date-item-content">
                <div class="date-item-title">${date.title}</div>
                <div class="date-item-date">${formattedDate}</div>
                ${date.description ? `<div class="date-item-description">${date.description}</div>` : ''}
            </div>
        `;
        
        if (date.image) {
            contentHTML = `
                <img src="${date.image}" alt="${date.title}" class="date-item-image" onclick="openImageModal('${date.image}', '${date.title}', '${formattedDate}', '${date.description || ''}')">
                ${contentHTML}
            `;
        }
        
        dateElement.innerHTML = contentHTML;
        specialDatesList.appendChild(dateElement);
    });
}

// Abrir modal de imagem
function openImageModal(imageSrc, title, date, description) {
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modalDate.textContent = date;
    modalDescription.textContent = description;
    imageModal.style.display = 'block';
}

// Fechar modal de imagem
function closeImageModal() {
    imageModal.style.display = 'none';
}

// Toggle painel admin
function toggleAdminPanel() {
    adminPanel.classList.toggle('active');
}

// Resetar tempo
function handleResetTime() {
    if (confirm('Tem certeza que deseja resetar o tempo de namoro?')) {
        acceptanceDate = null;
        saveData();
        showProposalScreen();
        if (counterInterval) clearInterval(counterInterval);
        showMessage('Tempo resetado!', 'success');
    }
}

// Resetar tudo
function handleResetAll() {
    if (confirm('Tem certeza que deseja resetar TUDO? Esta ação não pode ser desfeita!')) {
        acceptanceDate = null;
        specialDates = [];
        saveData();
        showProposalScreen();
        if (counterInterval) clearInterval(counterInterval);
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
        showMessage('Tudo resetado!', 'success');
    }
}

// Atualizar selects
function updateDateSelect() {
    dateSelect.innerHTML = '<option value="">Selecione uma data...</option>';
    
    specialDates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = date.id;
        option.textContent = `${index + 1}. ${date.title}`;
        dateSelect.appendChild(option);
    });
}

function updatePhotoDateSelect() {
    photoDateSelect.innerHTML = '<option value="">Selecione uma data para foto...</option>';
    
    specialDates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = date.id;
        option.textContent = `${index + 1}. ${date.title}`;
        if (date.image) {
            option.textContent += ' (com foto)';
        }
        photoDateSelect.appendChild(option);
    });
}

// Organizar datas
function updateOrganizeButtons() {
    const selectedId = dateSelect.value;
    moveUpBtn.disabled = !selectedId;
    moveDownBtn.disabled = !selectedId;
    deleteDateBtn.disabled = !selectedId;
}

function moveDateUp() {
    const selectedId = dateSelect.value;
    const currentIndex = specialDates.findIndex(date => date.id === selectedId);
    
    if (currentIndex > 0) {
        [specialDates[currentIndex - 1], specialDates[currentIndex]] = 
        [specialDates[currentIndex], specialDates[currentIndex - 1]];
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
    }
}

function moveDateDown() {
    const selectedId = dateSelect.value;
    const currentIndex = specialDates.findIndex(date => date.id === selectedId);
    
    if (currentIndex < specialDates.length - 1) {
        [specialDates[currentIndex], specialDates[currentIndex + 1]] = 
        [specialDates[currentIndex + 1], specialDates[currentIndex]];
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
    }
}

function deleteSelectedDate() {
    const selectedId = dateSelect.value;
    const selectedDate = specialDates.find(date => date.id === selectedId);
    
    if (selectedDate && confirm(`Tem certeza que deseja deletar "${selectedDate.title}"?`)) {
        specialDates = specialDates.filter(date => date.id != selectedId);
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
        showMessage('Data deletada!', 'success');
    }
}

// Upload de imagem
function handleAdminImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Imagem muito grande! Máximo 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result;
            adminImagePreview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function addPhotoToDate() {
    const selectedId = photoDateSelect.value;
    
    if (!selectedId) {
        showMessage('Selecione uma data primeiro!', 'error');
        return;
    }
    
    if (!currentImageData) {
        showMessage('Selecione uma imagem primeiro!', 'error');
        return;
    }
    
    const dateIndex = specialDates.findIndex(date => date.id === selectedId);
    if (dateIndex !== -1) {
        specialDates[dateIndex].image = currentImageData;
        
        saveData();
        renderSpecialDates();
        
        // Limpar preview e resetar
        adminImagePreview.innerHTML = '<div class="placeholder">Nenhuma imagem selecionada</div>';
        adminDateImageInput.value = '';
        currentImageData = null;
        
        showMessage('Foto adicionada com sucesso! 📸', 'success');
    }
}

// Admin logout
function adminLogout() {
    adminPanel.classList.remove('active');
}

// Criar confetes
function createConfetti() {
    const colors = ['#ff6b6b', '#ee5a24', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 30);
    }
}

// Mostrar mensagem
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    if (type === 'error') {
        messageElement.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
    } else if (type === 'warning') {
        messageElement.style.background = 'linear-gradient(45deg, #f39c12, #e67e22)';
    } else {
        messageElement.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
    }
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageElement)) {
                document.body.removeChild(messageElement);
            }
        }, 300);
    }, 3000);
}

// Carregar dados do localStorage
async function loadData() {
    try {
        const stored = localStorage.getItem('proposalData');
        if (stored) {
            const data = JSON.parse(stored);
            acceptanceDate = data.acceptanceDate ? new Date(data.acceptanceDate) : null;
            specialDates = data.specialDates || [];
            console.log("Dados carregados do localStorage");
        } else {
            specialDates = [];
        }
    } catch (e) {
        console.error("Erro ao carregar localStorage:", e);
        specialDates = [];
    }
}

// Salvar dados no localStorage
async function saveData() {
    try {
        localStorage.setItem('proposalData', JSON.stringify({
            acceptanceDate: acceptanceDate ? acceptanceDate.toISOString() : null,
            specialDates: specialDates
        }));
        console.log("Dados salvos no localStorage");
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
        showMessage("Erro ao salvar dados!", "error");
    }
}

// Carregar datas especiais
function loadSpecialDates() {
    renderSpecialDates();
}

// Adicionar animações CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
