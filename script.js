// Общие функции
let artifacts = JSON.parse(localStorage.getItem('dogArtifacts') || [];
let balance = parseInt(localStorage.getItem('dogBalance')) || 0;

function updateBalance() {
    if (window.location.pathname.endsWith('index.html')) {
        document.getElementById('balance').textContent = balance;
        localStorage.setItem('dogBalance', balance);
    }
}

function updateArtifacts() {
    if (window.location.pathname.endsWith('index.html')) {
        const container = document.getElementById('artifacts');
        container.innerHTML = artifacts.map(a => `
            <div class="artifact">
                <h3>${a.name}</h3>
                <img src="${a.image}" style="width: 80px">
            </div>
        `).join('');
    }
}

// Для DogBank
let scanner = null;

function startScan() {
    const preview = document.getElementById('preview');
    scanner = new Instascan.Scanner({ video: preview });
    
    scanner.addListener('scan', content => {
        handleScannedCode(content);
    });
    
    Instascan.Camera.getCameras().then(cameras => {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            alert('Камера не найдена!');
        }
    });
}

function handleScannedCode(content) {
    if (content.startsWith('DOGADD:')) {
        const amount = parseInt(content.split(':')[1]);
        balance += amount;
        alert(`+${amount} DogCoins!`);
        updateBalance();
    } else if (content.startsWith('DOGBUY:')) {
        const itemId = content.split(':')[1];
        buyItem(itemId);
    }
}

// Для DogShop
const shopItems = [
    { id: 1, name: 'Золотая кость', price: 100, image: 'https://example.com/bone.png' },
    { id: 2, name: 'Счастливый ошейник', price: 200, image: 'https://example.com/collar.png' },
    { id: 'secret', name: 'Секретная награда', price: 500, image: 'https://example.com/secret.png' },
    { id: 'add100', name: 'Пополнение +100', price: 'FREE', special: 'add' }
];

function generateShop() {
    if (window.location.pathname.endsWith('shop.html')) {
        const container = document.querySelector('.shop-items');
        container.innerHTML = shopItems.map(item => `
            <div class="shop-item">
                <h3>${item.name}</h3>
                <img src="${item.image}" style="width: 100px">
                <p>Цена: ${item.price} DogCoins</p>
                <button onclick="generateQR(${JSON.stringify(item)})">Получить DogQR</button>
                <div id="qr-${item.id}" class="qr-code"></div>
            </div>
        `).join('');
    }
}

function generateQR(item) {
    let qrContent;
    if (item.special === 'add') {
        qrContent = `DOGADD:100`;
    } else {
        qrContent = `DOGBUY:${item.id}`;
    }
    
    const qr = qrcode(0, 'M');
    qr.addData(qrContent);
    qr.make();
    
    const qrElement = document.getElementById(`qr-${item.id}`);
    qrElement.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2 });
}

function buyItem(itemId) {
    const item = shopItems.find(i => i.id == itemId);
    if (!item) return alert('Товар не найден!');
    
    if (balance >= item.price) {
        balance -= item.price;
        artifacts.push({
            name: item.name,
            image: item.image
        });
        localStorage.setItem('dogArtifacts', JSON.stringify(artifacts));
        updateBalance();
        updateArtifacts();
        alert('Покупка успешна!');
    } else {
        alert('Недостаточно средств!');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateBalance();
    updateArtifacts();
    generateShop();
});