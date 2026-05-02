import { db } from './firebase.js';

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
        showAcceptanceScreen();
        startCounter();
        updateAcceptanceDate(); // Garantir que a data seja atualizada
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

    showAcceptanceScreen();
    startCounter();
    createConfetti();
    updateAcceptanceDate();
}
// Lidar com hover no botão Não
function handleNoHover(e) {
    const button = e.target;
    const container = button.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Posições aleatórias dentro do container
    const maxX = containerRect.width - button.offsetWidth - 20;
    const maxY = containerRect.height - button.offsetHeight - 20;
    
    const randomX = Math.random() * maxX + 10;
    const randomY = Math.random() * maxY + 10;
    
    // Aplicar nova posição
    button.style.position = 'absolute';
    button.style.left = randomX + 'px';
    button.style.top = randomY + 'px';
    
    // Adicionar efeito visual
    button.style.transform = 'scale(1.1) rotate(5deg)';
    setTimeout(() => {
        button.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
}

// Lidar com clique no botão Não
function handleNoClick(e) {
    e.preventDefault();
    
    // Mensagem divertida
    const messages = [
        'Ainda não desisti! 😊',
        'Por favor, pense mais! 🥺',
        'Eu sei que você quer dizer sim! 💕',
        'Não desista de nós! 💔',
        'Tente novamente! 🌹'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Criar elemento de mensagem
    const messageElement = document.createElement('div');
    messageElement.textContent = randomMessage;
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 20px 40px;
        border-radius: 15px;
        font-size: 1.2rem;
        color: #333;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(messageElement);
    
    // Remover mensagem após 2 segundos
    setTimeout(() => {
        messageElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 2000);
    
    // Mover botão para posição aleatória
    handleNoHover(e);
}

// Mostrar tela de proposta
function showProposalScreen() {
    proposalScreen.classList.add('active');
    acceptanceScreen.classList.remove('active');
}

// Mostrar tela de aceitação
function showAcceptanceScreen() {
    proposalScreen.classList.remove('active');
    acceptanceScreen.classList.add('active');
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

// Iniciar contador de namoro
function startCounter() {
    if (counterInterval) {
        clearInterval(counterInterval);
    }
    
    updateCounter();
    counterInterval = setInterval(updateCounter, 1000);
}

// Atualizar contador
function updateCounter() {
    if (!acceptanceDate) return;
    
    const now = new Date();
    const diff = now - acceptanceDate;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Atualizar elementos individuais
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    
    // Atualizar texto completo
    const loveText = document.getElementById('love-text');
    loveText.textContent = `${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`;
}

// Adicionar data especial
function addSpecialDate() {
    // Debug: verificar se os elementos existem
    console.log('dateTitleInput:', dateTitleInput);
    console.log('dateValueInput:', dateValueInput);
    console.log('dateDescriptionInput:', dateDescriptionInput);
    
    // Verificar se os elementos existem
    if (!dateTitleInput || !dateValueInput) {
        showMessage('Erro: elementos do formulário não encontrados!', 'error');
        return;
    }
    
    const title = dateTitleInput.value.trim();
    const date = dateValueInput.value;
    const description = dateDescriptionInput ? dateDescriptionInput.value.trim() : '';
    
    // Debug: mostrar valores
    console.log('Título:', title);
    console.log('Data:', date);
    console.log('Descrição:', description);
    
    // Validação mais detalhada
    if (!title) {
        showMessage('Por favor, preencha o título!', 'error');
        if (dateTitleInput) dateTitleInput.focus();
        return;
    }
    
    if (!date) {
        showMessage('Por favor, selecione a data!', 'error');
        if (dateValueInput) dateValueInput.focus();
        return;
    }
    
    const specialDate = {
        id: Date.now(),
        title: title,
        date: date,
        description: description,
        image: currentImageData
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
    currentImageData = null;
    
    showMessage('Data especial adicionada com sucesso! 💕', 'success');
}

// Renderizar datas especiais
function renderSpecialDates() {
    specialDatesList.innerHTML = '';
    
    if (specialDates.length === 0) {
        specialDatesList.innerHTML = '<p style="color: #666; text-align: center;">Nenhuma data especial cadastrada ainda.</p>';
        return;
    }
    
    // Ordenar por data
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
        
        let imageHtml = '';
        if (date.image) {
            imageHtml = `<img src="${date.image}" alt="${date.title}" class="date-item-image">`;
        }
        
        let descriptionHtml = '';
        if (date.description) {
            descriptionHtml = `<div class="date-item-description">${date.description}</div>`;
        }
        
        dateElement.innerHTML = `
            ${imageHtml}
            <div class="date-item-content">
                <div class="date-item-title">${date.title}</div>
                <div class="date-item-date">${formattedDate}</div>
                ${descriptionHtml}
            </div>
        `;
        
        // Adicionar evento de clique na imagem para ampliar
        if (date.image) {
            const imgElement = dateElement.querySelector('.date-item-image');
            if (imgElement) {
                imgElement.addEventListener('click', function() {
                    openImageModal(date);
                });
            }
        }
        
        specialDatesList.appendChild(dateElement);
    });
}

// Toggle painel admin
function toggleAdminPanel(e) {
    e.stopPropagation();
    
    // Verificar se já está autenticado
    if (isAdminAuthenticated()) {
        adminPanel.classList.toggle('active');
    } else {
        // Pedir senha
        askAdminPassword();
    }
}

// Verificar se admin está autenticado
function isAdminAuthenticated() {
    const authTime = localStorage.getItem('adminAuthTime');
    if (!authTime) return false;
    
    // Autenticação válida por 30 minutos
    const thirtyMinutes = 30 * 60 * 1000;
    return (Date.now() - parseInt(authTime)) < thirtyMinutes;
}

// Pedir senha de admin
function askAdminPassword() {
    const password = prompt('🔐 Digite a senha de administrador:');
    
    if (password === null) {
        // Usuário cancelou
        return;
    }
    
    const correctPassword = 'digiteasenha123';
    
    if (password === correctPassword) {
        // Autenticar com sucesso
        localStorage.setItem('adminAuthTime', Date.now().toString());
        adminPanel.classList.add('active');
        showMessage('🔓 Acesso autorizado!', 'success');
    } else {
        showMessage('🔒 Senha incorreta!', 'error');
    }
}

// Fazer logout do admin
function adminLogout() {
    localStorage.removeItem('adminAuthTime');
    adminPanel.classList.remove('active');
    showMessage('🔒 Logout realizado!', 'info');
}

// Resetar apenas o tempo/cronômetro
function handleResetTime() {
    if (confirm('Tem certeza que deseja resetar apenas o tempo de namoro? As datas especiais serão mantidas.')) {
        // Resetar apenas a data de aceite
        acceptanceDate = null;
        localStorage.removeItem('acceptanceDate');
        
        // Parar contador
        if (counterInterval) {
            clearInterval(counterInterval);
            counterInterval = null;
        }
        
        // Voltar para tela inicial
        showProposalScreen();
        
        // Fechar painel admin
        adminPanel.classList.remove('active');
        
        showMessage('Tempo resetado com sucesso! O pedido foi reiniciado.', 'info');
    }
}

// Resetar tudo
function handleResetAll() {
    if (confirm('Tem certeza que deseja resetar TODOS os dados? Isso irá limpar o pedido de namoro e todas as datas especiais.')) {
        // Limpar localStorage
        localStorage.removeItem('acceptanceDate');
        localStorage.removeItem('specialDates');
        
        // Resetar variáveis
        acceptanceDate = null;
        specialDates = [];
        
        // Parar contador
        if (counterInterval) {
            clearInterval(counterInterval);
            counterInterval = null;
        }
        
        // Voltar para tela inicial
        showProposalScreen();
        
        // Limpar lista de datas
        specialDatesList.innerHTML = '';
        
        // Fechar painel admin
        adminPanel.classList.remove('active');
        
        showMessage('Todos os dados foram resetados com sucesso!', 'info');
    }
}

// Atualizar select de datas
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

// Atualizar botões de organizar
function updateOrganizeButtons() {
    const selectedId = dateSelect.value;
    const selectedIndex = specialDates.findIndex(date => date.id == selectedId);
    
    // Desabilitar botões se não houver seleção
    const hasSelection = selectedId !== '';
    moveUpBtn.disabled = !hasSelection || selectedIndex === 0;
    moveDownBtn.disabled = !hasSelection || selectedIndex === specialDates.length - 1;
    deleteDateBtn.disabled = !hasSelection;
}

// Mover data para cima
function moveDateUp() {
    const selectedId = dateSelect.value;
    const currentIndex = specialDates.findIndex(date => date.id == selectedId);
    
    if (currentIndex > 0) {
        // Trocar posição
        [specialDates[currentIndex - 1], specialDates[currentIndex]] = 
        [specialDates[currentIndex], specialDates[currentIndex - 1]];
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
        
        showMessage('Data movida para cima! ⬆️', 'success');
    }
}

// Mover data para baixo
function moveDateDown() {
    const selectedId = dateSelect.value;
    const currentIndex = specialDates.findIndex(date => date.id == selectedId);
    
    if (currentIndex < specialDates.length - 1) {
        // Trocar posição
        [specialDates[currentIndex], specialDates[currentIndex + 1]] = 
        [specialDates[currentIndex + 1], specialDates[currentIndex]];
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
        
        showMessage('Data movida para baixo! ⬇️', 'success');
    }
}

// Deletar data selecionada
function deleteSelectedDate() {
    const selectedId = dateSelect.value;
    const selectedDate = specialDates.find(date => date.id == selectedId);
    
    if (selectedDate && confirm(`Tem certeza que deseja deletar "${selectedDate.title}"?`)) {
        specialDates = specialDates.filter(date => date.id != selectedId);
        
        saveData();
        renderSpecialDates();
        updateDateSelect();
        updatePhotoDateSelect();
        
        showMessage('Data deletada com sucesso! 🗑️', 'info');
    }
}

// Atualizar select de datas para fotos
function updatePhotoDateSelect() {
    photoDateSelect.innerHTML = '<option value="">Selecione uma data para foto...</option>';
    
    specialDates.forEach((date, index) => {
        const option = document.createElement('option');
        option.value = date.id;
        option.textContent = `${index + 1}. ${date.title}`;
        if (date.image) {
            option.textContent += ' (📷)';
        }
        photoDateSelect.appendChild(option);
    });
}

// Upload de imagem no admin
function handleAdminImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showMessage('Selecione uma imagem válida!', 'error');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showMessage('Imagem muito grande! Máx 5MB.', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        currentImageData = event.target.result;

        adminImagePreview.innerHTML =
            `<img src="${currentImageData}" alt="Preview">`;

        showMessage('Imagem carregada com sucesso!', 'success');
    };

    reader.readAsDataURL(file);
}

// Adicionar foto à data selecionada
function addPhotoToDate() {
    const selectedId = photoDateSelect.value;
    
    if (!selectedId) {
        showMessage('Por favor, selecione uma data primeiro!', 'error');
        return;
    }
    
    if (!currentImageData) {
        showMessage('Por favor, selecione uma imagem primeiro!', 'error');
        return;
    }
    
    // Encontrar a data e adicionar imagem
    const dateIndex = specialDates.findIndex(date => date.id == selectedId);
    if (dateIndex !== -1) {
        specialDates[dateIndex].image = currentImageData;
        
        saveData();
        renderSpecialDates();
        
        // Limpar preview e resetar
        currentImageData = null;
        adminImagePreview.innerHTML = '<div class="placeholder">Nenhuma imagem selecionada</div>';
        adminDateImageInput.value = '';
        
        showMessage('Foto adicionada com sucesso! 📷', 'success');
    }
}

// Compartilhar dados entre dispositivos


// Abrir modal de ampliação
function openImageModal(date) {
    modalImage.src = date.image;
    modalTitle.textContent = date.title;
    
    const dateObj = new Date(date.date);
    modalDate.textContent = dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    modalDescription.textContent = date.description || '';
    
    imageModal.style.display = 'block';
}

// Fechar modal de ampliação
function closeImageModal() {
    imageModal.style.display = 'none';
}

// Criar confete
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
            
            // Remover confete após animação
            setTimeout(() => {
                if (confettiContainer.contains(confetti)) {
                    confettiContainer.removeChild(confetti);
                }
            }, 5000);
        }, i * 30);
    }
}

// Mostrar mensagem
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    
    let bgColor = '#333';
    if (type === 'success') bgColor = '#27ae60';
    if (type === 'error') bgColor = '#e74c3c';
    if (type === 'info') bgColor = '#3498db';
    
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(messageElement);
    
    // Remover mensagem após 3 segundos
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
        const snap = await getDoc(doc(db, "amorVaultX92", "linhaTempoAnna2026"));

        if (snap.exists()) {
            const data = snap.data();

            acceptanceDate = data.acceptanceDate
                ? new Date(data.acceptanceDate)
                : null;

            specialDates = data.specialDates || [];
        }

        console.log("Dados carregados do Firebase");
    } catch (e) {
        console.error("Erro ao carregar Firebase:", e);
        specialDates = [];
    }
}

// Salvar dados no localStorage
async function saveData() {
    try {
        await setDoc(doc(db, "amorVaultX92", "linhaTempoAnna2026"), {
            acceptanceDate: acceptanceDate
                ? acceptanceDate.toISOString()
                : null,
            specialDates: specialDates
        });

        console.log("Dados salvos no Firebase");
    } catch (e) {
        console.error("Erro ao salvar Firebase:", e);
        showMessage("Erro ao salvar no banco!", "error");
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
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
