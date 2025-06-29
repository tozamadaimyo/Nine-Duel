const playerHand = document.getElementById('player-hand');
const opponentHand = document.getElementById('opponent-hand');
const playerPlayedCard = document.getElementById('player-played-card');
const opponentPlayedCard = document.getElementById('opponent-played-card');
const playerGainedCards = document.getElementById('player-gained-cards');
const opponentGainedCards = document.getElementById('opponent-gained-cards');
const playerScoreEl = document.getElementById('player-score');
const opponentScoreEl = document.getElementById('opponent-score');
const gameMessage = document.getElementById('game-message');
const startButton = document.getElementById('start-button');
const modeCPU = document.getElementById('mode-cpu');

let playerScore = 0;
let opponentScore = 0;
let playerDeck = [];
let opponentDeck = [];
let isPlayerTurn = true;
let roundWinner = null; // 'player' or 'opponent'

// ゲーム開始
startButton.addEventListener('click', () => {
    // 初期化
    playerScore = 0;
    opponentScore = 0;
    playerDeck = [];
    opponentDeck = [];
    playerScoreEl.textContent = 0;
    opponentScoreEl.textContent = 0;
    playerHand.innerHTML = '';
    opponentHand.innerHTML = '';
    playerPlayedCard.innerHTML = '';
    opponentPlayedCard.innerHTML = '';
    playerGainedCards.innerHTML = '';
    opponentGainedCards.innerHTML = '';
    gameMessage.textContent = '';

    // プレイヤーと相手の山札をそれぞれ作成（1-9のカードを1枚ずつ）
    const createShuffledDeck = () => {
        const newDeck = [];
        for (let i = 1; i <= 9; i++) {
            newDeck.push(i);
        }
        // 山札をシャッフル
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    };

    playerDeck = createShuffledDeck();
    opponentDeck = createShuffledDeck();

    // 手札を表示
    renderHands();

    gameMessage.textContent = 'あなたの番です。';
    isPlayerTurn = true;
    startButton.disabled = true;
});

// 手札の表示を更新
function renderHands() {
    playerHand.innerHTML = '';
    opponentHand.innerHTML = '';

    playerDeck.forEach(cardValue => {
        const card = createCard(cardValue, 'player');
        playerHand.appendChild(card);
    });

    opponentDeck.forEach(cardValue => {
        const card = createCard(cardValue, 'opponent', false); // CPU戦なら裏面
        opponentHand.appendChild(card);
    });
}

// カード要素を作成
function createCard(value, player, isFront = true) {
    const card = document.createElement('div');
    card.classList.add('card');
    if (isFront) {
        card.textContent = value;
        card.classList.add(player === 'player' ? 'player-card-front' : 'opponent-card-front');
        // プレイヤーのカードには常にクリックイベントを設定
        if (player === 'player') {
            card.addEventListener('click', () => playCard(card, value));
        }
    } else {
        card.classList.add('card-back');
    }
    return card;
}

// プレイヤーがカードを出す（同時プレイ処理）
function playCard(cardElement, playerCardValue) {
    if (!isPlayerTurn) return;
    isPlayerTurn = false; // ダブルクリック防止

    // --- プレイヤーの処理 ---
    const playerCardIndex = playerDeck.indexOf(playerCardValue);
    playerDeck.splice(playerCardIndex, 1);

    // --- 相手の処理 ---
    const opponentCardValue = opponentDeck.pop(); // シンプルに最後のカードを出す

    // --- 手札の表示を更新 ---
    renderHands();

    // --- 両方のカードを同時に場に出す ---
    gameMessage.textContent = 'せーの！';
    playerPlayedCard.innerHTML = '';
    opponentPlayedCard.innerHTML = '';

    // 少し間を置いてカードを表示して判定へ
    setTimeout(() => {
        playerPlayedCard.appendChild(createCard(playerCardValue, 'player'));
        opponentPlayedCard.appendChild(createCard(opponentCardValue, 'opponent'));

        setTimeout(judgeRound, 1000); // 1秒後に勝敗判定
    }, 500); // 0.5秒後にカードオープン
}

// 相手（CPU）のターンはplayCardに統合されたため不要になりました。

// ラウンドの勝敗判定
function judgeRound() {
    const playerCardValue = parseInt(playerPlayedCard.firstChild.textContent);
    const opponentCardValue = parseInt(opponentPlayedCard.firstChild.textContent);

    let message = '';
    if (playerCardValue > opponentCardValue) {
        playerScore += playerCardValue + opponentCardValue;
        roundWinner = 'player';
        message = `あなたの勝ち！ (+${playerCardValue + opponentCardValue}点)`;
    } else if (opponentCardValue > playerCardValue) {
        opponentScore += playerCardValue + opponentCardValue;
        roundWinner = 'opponent';
        message = `相手の勝ち！ (+${playerCardValue + opponentCardValue}点)`;
    } else {
        // 引き分けの場合は、前のラウンドの勝者がカードを得る
        if (roundWinner === 'player') {
            playerScore += playerCardValue + opponentCardValue;
            message = `引き分け。前の勝者（あなた）がカードを獲得。 (+${playerCardValue + opponentCardValue}点)`;
        } else if (roundWinner === 'opponent') {
            opponentScore += playerCardValue + opponentCardValue;
            message = `引き分け。前の勝者（相手）がカードを獲得。 (+${playerCardValue + opponentCardValue}点)`;
        } else {
            // 初回ラウンドが引き分けの場合
            message = '引き分け。カードは場に残ります。';
            // この実装ではカードは次のラウンドに持ち越されず、単純に得点なし
        }
    }

    gameMessage.textContent = message;
    updateScores();
    moveGainedCards();

    // ゲーム終了判定
    if (playerDeck.length === 0) {
        endGame();
        return;
    }

    // 次のターンへ
    setTimeout(() => {
        playerPlayedCard.innerHTML = '';
        opponentPlayedCard.innerHTML = '';
        isPlayerTurn = true;
        gameMessage.textContent = 'あなたの番です。';
    }, 2000);
}

// スコアを更新
function updateScores() {
    playerScoreEl.textContent = playerScore;
    opponentScoreEl.textContent = opponentScore;
}

// 獲得したカードを移動
function moveGainedCards() {
    const playerCard = playerPlayedCard.firstChild.cloneNode(true);
    const opponentCard = opponentPlayedCard.firstChild.cloneNode(true);
    playerCard.classList.add('gained-card');
    opponentCard.classList.add('gained-card');

    if (roundWinner === 'player') {
        playerGainedCards.appendChild(playerCard);
        playerGainedCards.appendChild(opponentCard);
    } else if (roundWinner === 'opponent') {
        opponentGainedCards.appendChild(playerCard);
        opponentGainedCards.appendChild(opponentCard);
    }
    // 引き分けで勝者なしの場合は何もしない
}

// ゲーム終了処理
function endGame() {
    let finalMessage = 'ゲーム終了！';
    if (playerScore > opponentScore) {
        finalMessage += 'あなたの勝利！';
    } else if (opponentScore > playerScore) {
        finalMessage += '相手の勝利！';
    } else {
        finalMessage += '引き分け！';
    }
    finalMessage += `最終スコア: あなた ${playerScore} - 相手 ${opponentScore}`;
    gameMessage.textContent = finalMessage;
    startButton.disabled = false;
}
