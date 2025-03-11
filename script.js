document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("balance")) {
        loadBank();
    }
});

function loadBank() {
    let balance = localStorage.getItem("dogBalance") || 0;
    document.getElementById("balance").textContent = balance;

    let inventory = JSON.parse(localStorage.getItem("dogInventory")) || [];
    let inventoryDiv = document.getElementById("inventory");
    inventoryDiv.innerHTML = inventory.length ? inventory.join(", ") : "Пусто";

    let scanner = new Instascan.Scanner({ video: document.getElementById("preview") });
    scanner.addListener("scan", (content) => {
        processQR(content);
        scanner.stop();
        document.getElementById("preview").style.display = "none";
    });

    document.getElementById("scan-btn").addEventListener("click", () => {
        Instascan.Camera.getCameras().then((cameras) => {
            if (cameras.length > 0) {
                scanner.start(cameras[0]);
                document.getElementById("preview").style.display = "block";
            } else {
                alert("Камера не найдена!");
            }
        });
    });
}

function processQR(data) {
    let obj = JSON.parse(data);
    let balance = parseInt(localStorage.getItem("dogBalance")) || 0;
    let inventory = JSON.parse(localStorage.getItem("dogInventory")) || [];

    if (obj.type === "add") {
        balance += obj.value;
        alert(`Баланс пополнен на ${obj.value} DogCoins!`);
    } else if (obj.type === "buy" && balance >= obj.price) {
        balance -= obj.price;
        inventory.push(obj.value);
        alert(`Куплен DogArtifact: ${obj.value}`);
    } else {
        alert("Недостаточно средств!");
    }

    localStorage.setItem("dogBalance", balance);
    localStorage.setItem("dogInventory", JSON.stringify(inventory));
    loadBank();
}

function generateQR(type, value) {
    let data = type === "add"
        ? { type: "add", value: value }
        : { type: "buy", value: value, price: value === "Косточка" ? 20 : 30 };

    document.getElementById("qr-code").innerHTML = "";
    new QRCode(document.getElementById("qr-code"), JSON.stringify(data));
}
