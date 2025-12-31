// --- 3. LOGIKA MOBILE MENU (HAMBURGER) ---
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
const mobileOrderBtn = document.getElementById("mobile-order-btn");

// Fungsi Toggle Menu
function toggleMobileMenu() {
    mobileMenu.classList.toggle("hidden");
    // Opsional: Ganti icon dari 'menu' jadi 'close' saat terbuka
    const icon = mobileMenuBtn.querySelector("span");
    if (mobileMenu.classList.contains("hidden")) {
        icon.innerText = "menu";
    } else {
        icon.innerText = "close";
    }
}

// Event Klik Tombol Hamburger
mobileMenuBtn.addEventListener("click", toggleMobileMenu);

// Tutup menu otomatis saat link diklik (Biar gak nutupin layar setelah pindah section)
mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
        if (!mobileMenu.classList.contains("hidden")) {
            toggleMobileMenu();
        }
    });
});

// Sambungkan tombol Order Now di mobile ke fungsi toggle keranjang yang sudah kamu buat
mobileOrderBtn.addEventListener("click", () => {
    toggleMobileMenu(); // Tutup menu dulu
    toggleCart();       // Baru buka keranjang
});



// --- 1. LOGIKA ACTIVE NAVBAR PADA SCROLL & CLICK ---
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav .hidden.md\\:flex a");

// Fungsi untuk mengatur class active
function setActiveLink(id) {
    navLinks.forEach((link) => {
        link.classList.remove("text-primary", "font-bold");
        if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("text-primary", "font-bold");
        }
    });
}

function makeNavbarActive() {
    let current = "";
    const scrollPosition = window.scrollY;

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        // Offset 100-150px biasanya ideal untuk mendeteksi section yang aktif
        if (scrollPosition >= sectionTop - 100) {
            current = section.getAttribute("id");
        }
    });

    if (current) {
        setActiveLink(current);
    }
}

// Event Listener untuk Klik (Biar langsung active tanpa nunggu scroll selesai)
navLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        const targetId = this.getAttribute("href").substring(1);
        setActiveLink(targetId);
    });
});

// Event untuk scroll dan saat halaman dimuat
window.addEventListener("scroll", makeNavbarActive);
window.addEventListener("load", makeNavbarActive);


function showNotification(productName) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notification = document.createElement("div");
    // Styling bar hijau
    notification.className = `
        flex items-center gap-3 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl 
        transform transition-all duration-500 translate-y-10 opacity-0 min-w-[300px]
    `;
    
    notification.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <div class="flex-1">
            <p class="text-sm font-medium">
                <span class="font-bold">${productName}</span> berhasil ditambahkan
            </p>
        </div>
    `;

    container.appendChild(notification);

    // Animasi Muncul
    setTimeout(() => {
        notification.classList.remove("translate-y-10", "opacity-0");
        notification.classList.add("translate-y-0", "opacity-100");
    }, 10);

    // Hilang Otomatis (3 detik)
    setTimeout(() => {
        notification.classList.add("opacity-0", "translate-x-10");
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}


// --- 2. LOGIKA KERANJANG (ADVANCED) ---
let cart = [];

const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartBtn = document.getElementById("close-cart");
const orderBtnNavbar = document.getElementById("order-now-btn");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotalPrice = document.getElementById("cart-total-price");
const whatsappFinalBtn = document.getElementById("whatsapp-final-btn");

// Fungsi Buka/Tutup Drawer
function toggleCart() {
    cartDrawer.classList.toggle("hidden");
}

orderBtnNavbar.addEventListener("click", toggleCart);
closeCartBtn.addEventListener("click", toggleCart);
cartOverlay.addEventListener("click", toggleCart);

// Tambah Produk ke Keranjang
function addToCart(name, priceStr) {
    const priceNum = parseFloat(priceStr.replace(/[^0-9]+/g, ""));
    
    // Cek apakah produk sudah ada di cart
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: priceNum,
            quantity: 1
        });
    }

    updateCartUI();
    showNotification(name);
}

// Tambah/Kurang Quantity di Modal
function changeQuantity(name, delta) {
    const itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += delta;
        
        // Jika quantity 0, hapus dari list
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    updateCartUI();
}

function updateCartUI() {
    // 1. Update jumlah item di tombol navbar
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // orderBtnNavbar.innerText = `Order Now (${totalItems})`;
    const buttonText = totalItems > 0 ? `Order Now (${totalItems})` : "Order Now";

    if (orderBtnNavbar) {
        orderBtnNavbar.innerText = buttonText;
    }

    const mobileOrderBtn = document.getElementById("mobile-order-btn");
    if (mobileOrderBtn) {
        mobileOrderBtn.innerText = buttonText;
    }

    // Helper untuk format Rupiah
    const formatIDR = (brp) => "Rp " + brp.toLocaleString('id-ID');

    // 2. Render List di Modal
    cartItemsList.innerHTML = "";
    let totalHarga = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-2">shopping_cart_off</span>
                <p>Belum ada pesanan.</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalHarga += subtotal;

            cartItemsList.innerHTML += `
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700">
                    <div class="flex-1">
                        <h4 class="font-bold text-sm dark:text-white">${item.name}</h4>
                        <p class="text-xs text-primary font-semibold">${formatIDR(item.price)} / item</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <button onclick="changeQuantity('${item.name}', -1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">-</button>
                        <span class="font-bold w-4 text-center">${item.quantity}</span>
                        <button onclick="changeQuantity('${item.name}', 1)" class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors">+</button>
                    </div>
                </div>
            `;
        });
    }

    cartTotalPrice.innerText = formatIDR(totalHarga);
}

// Logika Kirim WhatsApp Akhir
whatsappFinalBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Wah, pesanan kamu kosong nih!");
        return;
    }

    const formatIDR = (brp) => "Rp " + brp.toLocaleString('id-ID');
    let phoneNumber = "6281908029053"; 
    let message = "PESANAN BARU - FIRDAUS BAKERY & CAKE\n";
    let total = 0;

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        message += `${index + 1}. ${item.name} x${item.quantity}\n`;
        message += `Subtotal: ${formatIDR(subtotal)}\n\n`;
        total += subtotal;
    });

    message += `---------------------------------------------------------\n`;
    message += `TOTAL ESTIMASI: ${formatIDR(total)}\n\n`;
    message += `Tolong disiapkan ya, saya akan datang untuk mengambil/membayar pesanan.`;

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
});

// Update Listener Tombol Add to Order
document.querySelectorAll("button").forEach(button => {
    if (button.innerText.includes("add_shopping_cart") || button.innerText.includes("Add to Order")) {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            const card = this.closest(".group");
            const name = card.querySelector("h3").innerText;
            const price = card.querySelector("span.rounded").innerText;
            addToCart(name, price);
        });
    }
});


// --- 4. LOGIKA TOGGLE SHOW MORE & SHOW LESS ---
const menuContainer = document.getElementById("menu-container");
const showMoreBtn = document.getElementById("show-more-btn");
const btnText = document.getElementById("btn-text");
const btnIcon = document.getElementById("btn-icon");
const menuItems = menuContainer.children;

let isExpanded = false; // Status apakah menu sedang terbuka semua atau tidak

function updateMenuDisplay() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // Jika status isExpanded true, tampilkan semua. Jika false, cuma tampilkan 3.
        for (let i = 0; i < menuItems.length; i++) {
            if (i < 3 || isExpanded) {
                menuItems[i].classList.remove("hidden");
            } else {
                menuItems[i].classList.add("hidden");
            }
        }
        
        // Update Teks dan Icon Tombol
        btnText.innerText = isExpanded ? "Sembunyikan" : "Lihat Selengkapnya";
        btnIcon.innerText = isExpanded ? "expand_less" : "expand_more";
        showMoreBtn.parentElement.classList.remove("hidden");
    } else {
        // Di Desktop tampilkan semua tanpa kecuali
        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].classList.remove("hidden");
        }
        showMoreBtn.parentElement.classList.add("hidden");
    }
}

// Event Klik Tombol
showMoreBtn.addEventListener("click", function() {
    isExpanded = !isExpanded; // Balikkan status (true jadi false, false jadi true)
    updateMenuDisplay();

    // Opsional: Scroll kembali ke atas menu jika user klik "Sembunyikan"
    if (!isExpanded) {
        document.getElementById("menu").scrollIntoView({ behavior: 'smooth' });
    }
});

// Jalankan saat load dan resize
window.addEventListener("load", updateMenuDisplay);
window.addEventListener("resize", updateMenuDisplay);