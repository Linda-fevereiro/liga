// Estrutura inicial com localStorage para persistência
const storedData = JSON.parse(localStorage.getItem('teamData')) || {
    teamPoints: { A: 0, B: 0, C: 0, D: 0, E: 0 },
    teamHistory: { A: [], B: [], C: [], D: [], E: [] },
    lastMonth: new Date().getMonth(),
    roundWinners: [], // Armazena os ganhadores de cada rodada
    monthWinners: [], // Armazena os ganhadores de cada mês
};

const { teamPoints, teamHistory } = storedData;
let lastMonth = storedData.lastMonth;

// Nomes dos times
const teamNames = {
    A: "Flamengo RJW",
    B: "Barcelona Ofici@l",
    C: "Fclfamiliaunida",
    D: "FLA LOUCA",
    E: "TEAM D1AMOND",
};

// Atualiza o localStorage com os dados mais recentes
function updateLocalStorage() {
    const dataToStore = {
        teamPoints,
        teamHistory,
        lastMonth,
    };
    localStorage.setItem('teamData', JSON.stringify(dataToStore));
}

// Função para adicionar pontos a uma equipe
function addPoints(teamId) {
    const inputElement = document.getElementById(`input${teamId}`);
    const totalElement = document.getElementById(`re${teamId}`);
    const pointsToAdd = parseFloat(inputElement.value);

    checkMonthChange(); // Verifica se o mês mudou e reinicia pontos, se necessário

    if (!isNaN(pointsToAdd)) {
        teamPoints[teamId] += pointsToAdd;

        const currentRound = teamHistory[teamId].length + 1;
        teamHistory[teamId].push(`${currentRound}ª rodada: ${pointsToAdd} pontos`);

        totalElement.textContent = teamPoints[teamId];
        inputElement.value = '';

        // Atualiza ganhador da rodada com base na última pontuação
        updateWinners(teamId, pointsToAdd); 

        updateRanking(); // Atualiza o ranking
        updateLocalStorage(); // Salva no localStorage
    } else {
        alert("Por favor, insira um número válido.");
        inputElement.value = '';
    }
}

// Função para editar o histórico de uma equipe
function editHistory(teamId, roundIndex) {
    const newPoints = prompt("Digite a nova pontuação para esta rodada:");
    if (newPoints && !isNaN(newPoints)) {
        newPoints = parseFloat(newPoints);
        const oldEntry = teamHistory[teamId][roundIndex];
        const oldPoints = parseFloat(oldEntry.split(": ")[1]);
        const updatedEntry = `${roundIndex + 1}ª rodada: ${newPoints} pontos`;

        // Atualiza o histórico e os pontos totais
        teamHistory[teamId][roundIndex] = updatedEntry;
        teamPoints[teamId] += newPoints - oldPoints;

        // Atualiza a exibição e o localStorage
        updatePanel();
        updateRanking();
        updateLocalStorage();
    } else {
        alert("Por favor, insira um número válido.");
    }
}

// Função para remover uma entrada do histórico de uma equipe
function removeHistory(teamId, roundIndex) {
    const pointsToRemove = parseFloat(teamHistory[teamId][roundIndex].split(": ")[1]);
    teamPoints[teamId] -= pointsToRemove;

    // Remove o histórico
    teamHistory[teamId].splice(roundIndex, 1);

    // Atualiza a exibição e o localStorage
    updatePanel();
    updateRanking();
    updateLocalStorage();
}

// Verifica mudança de mês
function checkMonthChange() {
    const currentMonth = new Date().getMonth();
    if (currentMonth !== lastMonth) {
        resetMonthlyPoints(); // Reinicia os pontos do mês
        lastMonth = currentMonth;
        updateLocalStorage();
    }
}

// Reinicia os pontos do mês
function resetMonthlyPoints() {
    for (let teamId in teamPoints) {
        teamPoints[teamId] = 0;
        teamHistory[teamId] = [];
        document.getElementById(`re${teamId}`).textContent = '0';
    }
    document.getElementById('ganhadorMes').textContent = 'Aguardando...';
}

// Atualiza o ranking
function updateRanking() {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = ''; // Limpa o ranking atual

    const sortedTeams = Object.keys(teamPoints).sort((a, b) => teamPoints[b] - teamPoints[a]);

    sortedTeams.forEach(teamId => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${teamNames[teamId]}: ${teamPoints[teamId]} pontos</strong>
            <div class="points-list">
                Histórico: 
                ${teamHistory[teamId].map((entry, index) => `
                    <span onclick="editHistory('${teamId}', ${index})" style="cursor: pointer; color: black;">${entry}</span>
                    <span onclick="removeHistory('${teamId}', ${index})" style="cursor: pointer; color: red;">(remover)</span>
                `).join(' | ')}
            </div>
        `;
        rankingList.appendChild(listItem);
    });
}
function updateWinners(lastUpdatedTeam, lastPointsAdded) {
  // Atualiza o ganhador da rodada com base na pontuação mais alta da rodada atual
  let highestPoints = -Infinity;
  let rodadaWinner = null;

  for (let teamId in teamPoints) {
      if (teamHistory[teamId].length > 0) {
          const lastRoundPoints = parseFloat(
              teamHistory[teamId][teamHistory[teamId].length - 1].split(": ")[1]
          );
          if (lastRoundPoints > highestPoints) {
              highestPoints = lastRoundPoints;
              rodadaWinner = teamId;
          }
      }
  }

  if (rodadaWinner !== null) {
      document.getElementById('ganhadorRodada').textContent = `${teamNames[rodadaWinner]} (${highestPoints} pontos)`;
      document.getElementById('parabensRodada').textContent = `Parabéns, ${teamNames[rodadaWinner]}!`;
  }
    // Encontra o ganhador do mês
    const mesWinner = Object.keys(teamPoints).reduce((a, b) => teamPoints[a] > teamPoints[b] ? a : b);
    document.getElementById('ganhadorMes').textContent = teamNames[mesWinner];
    document.getElementById('parabensMes').textContent = `Parabéns, ${teamNames[mesWinner]}!`;

    // Encontra o ganhador do ano
    const anoWinner = Object.keys(teamPoints).reduce((a, b) => teamPoints[a] > teamPoints[b] ? a : b);
    document.getElementById('ganhadorAno').textContent = teamNames[anoWinner];
    document.getElementById('parabensAno').textContent = `Parabéns, ${teamNames[anoWinner]}!`;
}

// Inicializa a página
function initializePage() {
    for (let teamId in teamPoints) {
        document.getElementById(`re${teamId}`).textContent = teamPoints[teamId];
    }
    updateRanking(); // Atualiza o ranking na inicialização
    updateWinners(); // Atualiza os ganhadores na inicialização
    initializeCarousel(); // Inicializa o carrossel
}

// Configuração do carrossel
let currentSlide = 0;

function initializeCarousel() {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'flex' : 'none';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    // Botões de navegação manual
    document.getElementById('nextSlide').addEventListener('click', nextSlide);
    document.getElementById('prevSlide').addEventListener('click', prevSlide);

    // Intervalo automático
    setInterval(nextSlide, 3000); // Muda de slide a cada 3 segundos

    showSlide(currentSlide); // Mostra o primeiro slide
}

// Função que salva a pontuação
function savePoints(teamId) {
    const teamPointsElement = document.getElementById(`input${teamId}`);
    const teamPointsValue = parseFloat(teamPointsElement.value);
    if (!isNaN(teamPointsValue)) {
        teamPoints[teamId] += teamPointsValue;
        document.getElementById(`re${teamId}`).innerText = teamPoints[teamId];
        updateLocalStorage();
        teamPointsElement.value = ''; // Limpa o campo de entrada
    } else {
        alert("Insira um valor numérico válido!");
    }
}

// Atualiza o painel de pontos
function updatePanel() {
    for (let teamId in teamPoints) {
        document.getElementById(`re${teamId}`).textContent = teamPoints[teamId];
    }
}

// Inicializa a página
window.onload = () => {
    initializePage();
    updatePanel();
};
