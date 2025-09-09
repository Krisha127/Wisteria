/* ---------------- Loader ---------------- */
window.addEventListener("load", () => {
  const loader = document.querySelector(".loader-container");
  const content = document.querySelector(".content");

  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      if (content) content.style.display = "block";
    }, 600);
  }
});

/* ---------------- Nav Toggle ---------------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
}

/* ---------------- Wishlist & Cart ---------------- */
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateBadges() {
  const wishCount = document.getElementById("wish-count");
  const cartCount = document.getElementById("cart-count");

  if (wishCount) wishCount.textContent = wishlist.length;
  if (cartCount) cartCount.textContent = cart.reduce((n, item) => n + (item.qty || 1), 0);
}

/* ---------------- Hero Video ---------------- */
const heroVideo = document.getElementById("heroVideo");

if (heroVideo) {
  const mobileReels = [
    "videos/video1.mp4",
    "videos/video2.mp4",
    "videos/video3.mp4",
    "videos/video4.mp4"
  ];

  const desktopVideos = [
    "videos/desktop1.mp4",
    "videos/desktop2.mp4"
  ];

  let index = 0;

  function playNextVideo() {
    const isMobile = window.innerWidth < 768;
    const videos = isMobile ? mobileReels : desktopVideos;

    heroVideo.src = videos[index];
    heroVideo.play();
    index = (index + 1) % videos.length;
  }

  heroVideo.addEventListener("ended", playNextVideo);
  playNextVideo();

  // Update video when resizing screen
  window.addEventListener("resize", () => {
    index = 0;
    playNextVideo();
  });
}

/* ---------------- Modal Elements ---------------- */
const modal = document.getElementById("cartModal");
const closeBtn = modal?.querySelector(".close");
const modalImg = document.getElementById("modal-img");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalColor = document.getElementById("modal-color");
const modalQty = document.getElementById("modal-qty");
const confirmAdd = document.getElementById("confirmAdd");

let currentProduct = null;

/* ---------------- Product Buttons ---------------- */
document.querySelectorAll(".product-card").forEach(card => {
  const wishBtn = card.querySelector(".btn-wish");
  const cartBtn = card.querySelector(".btn-cart");

  const product = {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseInt(card.dataset.price),
    image: card.dataset.image,
    colors: card.dataset.colors ? JSON.parse(card.dataset.colors) : []
  };

  // Wishlist
  if (wishBtn) {
    wishBtn.addEventListener("click", () => {
      if (!wishlist.find(p => p.id === product.id)) {
        wishlist.push(product);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateBadges();
        alert(`${product.name} added to Wishlist!`);
      }
    });
  }

  // Open Cart Modal
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      currentProduct = product;

      modalImg.src = product.image;
      modalName.textContent = product.name;
      modalPrice.textContent = "₹" + product.price;
      modalQty.value = 1;

      // Load product-specific colors
      modalColor.innerHTML = "";
      if (product.colors.length > 0) {
        product.colors.forEach(c => {
          const opt = document.createElement("option");
          opt.value = c;
          opt.textContent = c;
          modalColor.appendChild(opt);
        });
      }

      modal.style.display = "block";
    });
  }
});

/* ---------------- Modal Close ---------------- */
if (closeBtn) {
  closeBtn.addEventListener("click", () => (modal.style.display = "none"));
}
window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ---------------- Confirm Add to Cart ---------------- */
if (confirmAdd) {
  confirmAdd.addEventListener("click", () => {
    if (!currentProduct) return;

    const qty = parseInt(modalQty.value);
    const color = modalColor.value;

    let found = cart.find(p => p.id === currentProduct.id && p.color === color);
    if (found) {
      found.qty += qty;
    } else {
      cart.push({ ...currentProduct, qty, color });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateBadges();
    alert(`${currentProduct.name} added to Cart!`);
    modal.style.display = "none";
  });
}

/* ---------------- Render Cart Page ---------------- */
const cartGrid = document.getElementById("cart-grid");
const cartTotal = document.getElementById("cart-total");

if (cartGrid) {
  function renderCart() {
    cartGrid.innerHTML = '';
    if (cart.length === 0) {
      cartGrid.innerHTML = '<p>Your cart is empty 😢</p>';
      cartTotal.textContent = '';
      return;
    }
    let total = 0;
    cart.forEach(item => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <div class="thumb" style="background-image:url('${item.image}')"></div>
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>
        <p>Quantity: <input type="number" class="qty-input" value="${item.qty}" min="1" style="width:50px;"></p>
        <div class="actions">
          <button class="btn-outline btn-remove">Remove</button>
        </div>
      `;
      card.querySelector(".btn-remove").addEventListener("click", () => {
        cart = cart.filter(p => p.id !== item.id || p.color !== item.color);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateBadges();
      });
      card.querySelector(".qty-input").addEventListener("change", e => {
        const val = parseInt(e.target.value);
        if (val > 0) item.qty = val;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateBadges();
      });
      cartGrid.appendChild(card);
      total += item.price * item.qty;
    });
    cartTotal.textContent = `Total: ₹${total}`;
  }
  renderCart();
}

/* ---------------- Render Wishlist Page ---------------- */
const wishlistGrid = document.getElementById("wishlist-grid");
if (wishlistGrid) {
  function renderWishlist() {
    wishlistGrid.innerHTML = '';
    if (wishlist.length === 0) {
      wishlistGrid.innerHTML = '<p>Your wishlist is empty 😢</p>';
      return;
    }
    wishlist.forEach(item => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <div class="thumb" style="background-image:url('${item.image}')"></div>
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>
        <div class="actions">
          <button class="btn-outline btn-remove">Remove</button>
          <button class="btn-primary btn-cart">Add to Cart</button>
        </div>
      `;
      card.querySelector(".btn-remove").addEventListener("click", () => {
        wishlist = wishlist.filter(p => p.id !== item.id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        renderWishlist();
        updateBadges();
      });
      card.querySelector(".btn-cart").addEventListener("click", () => {
        let found = cart.find(p => p.id === item.id);
        if (found) found.qty += 1;
        else cart.push({ ...item, qty: 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        updateBadges();
        alert(`${item.name} added to Cart!`);
      });
      wishlistGrid.appendChild(card);
    });
  }
  renderWishlist();
}
/* ---------------- Custom Order Chat ---------------- */
const chatCircle = document.getElementById("customChat");
const chatModal = document.getElementById("chatModal");
const chatClose = document.getElementById("chatClose");
const customOrderForm = document.getElementById("customOrderForm");
const chatSuccess = document.getElementById("chatSuccess");

// Open chat
chatCircle.addEventListener("click", () => {
  chatModal.style.display = "block";
});

// Close chat
chatClose.addEventListener("click", () => {
  chatModal.style.display = "none";
});

// Handle form submission
customOrderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const text = document.getElementById("customText").value;
  const fileInput = document.getElementById("customImage");
  const file = fileInput.files[0];

  if (!text && !file) {
    alert("Please provide details or upload an image!");
    return;
  }

  // Convert file to Base64 if exists
  if (file) {
    const reader = new FileReader();
    reader.onload = function() {
      const order = {
        message: text,
        image: reader.result,
        timestamp: new Date().toISOString()
      };
      saveOrder(order);
    }
    reader.readAsDataURL(file);
  } else {
    const order = { message: text, image: null, timestamp: new Date().toISOString() };
    saveOrder(order);
  }
});

// Save order in localStorage (or send to backend later)
function saveOrder(order) {
  let orders = JSON.parse(localStorage.getItem("customOrders")) || [];
  orders.push(order);
  localStorage.setItem("customOrders", JSON.stringify(orders));

  customOrderForm.reset();
  chatSuccess.style.display = "block";
  setTimeout(() => {
    chatSuccess.style.display = "none";
    chatModal.style.display = "none";
  }, 2000);
}

/* ---------------- Initialize badges ---------------- */
updateBadges();
