// ==============================================
// BESTOW E-COMMERCE — COMPLETE JS WITH VALIDATION
// ==============================================

// ============================================
// 🔑 PAYMENT & BUSINESS CONFIGURATION
// ============================================
const PAYMENT_CONFIG = {
    razorpay: {
        key: 'rzp_test_T2bYpqwXj12AAb',  // ⬅️ Your Razorpay Key ID
        merchant_name: 'Bestow',
        merchant_logo: '',
        theme_color: '#de2128'
    },
    upi: {
        upi_id: 'sathishbalakrishnan18-3@okaxis',  // ⬅️ Your UPI ID
        merchant_name: 'Bestow'
    },
    business: {
        whatsapp: '916382052530',  // ⬅️ Your WhatsApp (with country code)
        name: 'Bestow'
    }
};

// ============================================
// ✅ VALIDATION FUNCTIONS
// ============================================
const VALIDATORS = {
    // Indian mobile number: 10 digits, starts with 6-9
    phone: function(value){
        const cleaned = value.replace(/\D/g,'').slice(-10);
        if(!cleaned) return {ok:false, msg:'Phone number is required'};
        if(cleaned.length !== 10) return {ok:false, msg:'Phone must be 10 digits'};
        if(!/^[6-9]\d{9}$/.test(cleaned)) return {ok:false, msg:'Invalid Indian mobile number'};
        return {ok:true, value:cleaned};
    },
    
    // Email: standard format
    email: function(value){
        const trimmed = value.trim().toLowerCase();
        if(!trimmed) return {ok:false, msg:'Email is required'};
        if(trimmed.length > 100) return {ok:false, msg:'Email too long'};
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!regex.test(trimmed)) return {ok:false, msg:'Invalid email format'};
        return {ok:true, value:trimmed};
    },
    
    // Indian Pincode: exactly 6 digits, not starting with 0
    pincode: function(value){
        const cleaned = value.replace(/\D/g,'');
        if(!cleaned) return {ok:false, msg:'Pincode is required'};
        if(cleaned.length !== 6) return {ok:false, msg:'Pincode must be 6 digits'};
        if(!/^[1-9]\d{5}$/.test(cleaned)) return {ok:false, msg:'Invalid pincode'};
        return {ok:true, value:cleaned};
    },
    
    // Name: letters, spaces, dots, min 2 chars, max 50
    name: function(value){
        const trimmed = value.trim();
        if(!trimmed) return {ok:false, msg:'Name is required'};
        if(trimmed.length < 2) return {ok:false, msg:'Name too short (min 2 chars)'};
        if(trimmed.length > 50) return {ok:false, msg:'Name too long (max 50 chars)'};
        if(!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return {ok:false, msg:'Name can only contain letters'};
        return {ok:true, value:trimmed};
    },
    
    // Address: min 10 chars, max 200
    address: function(value){
        const trimmed = value.trim();
        if(!trimmed) return {ok:false, msg:'Address is required'};
        if(trimmed.length < 10) return {ok:false, msg:'Address too short (min 10 chars)'};
        if(trimmed.length > 200) return {ok:false, msg:'Address too long'};
        return {ok:true, value:trimmed};
    },
    
    // City: letters, spaces, min 2 chars
    city: function(value){
        const trimmed = value.trim();
        if(!trimmed) return {ok:false, msg:'City is required'};
        if(trimmed.length < 2) return {ok:false, msg:'City name too short'};
        if(!/^[a-zA-Z\s.-]+$/.test(trimmed)) return {ok:false, msg:'City can only contain letters'};
        return {ok:true, value:trimmed};
    },
    
    // Password: min 6 chars
    password: function(value){
        if(!value) return {ok:false, msg:'Password is required'};
        if(value.length < 6) return {ok:false, msg:'Password too short (min 6 chars)'};
        if(value.length > 50) return {ok:false, msg:'Password too long'};
        return {ok:true, value:value};
    },
    
    // UPI ID format: name@bank
    upiId: function(value){
        const trimmed = value.trim().toLowerCase();
        if(!trimmed) return {ok:false, msg:'UPI ID is required'};
        const regex = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;
        if(!regex.test(trimmed)) return {ok:false, msg:'Invalid UPI ID (e.g., name@paytm)'};
        return {ok:true, value:trimmed};
    },
    
    // Transaction ID: 6-50 chars, alphanumeric
    transactionId: function(value){
        const trimmed = value.trim();
        if(!trimmed) return {ok:false, msg:'Transaction ID is required'};
        if(trimmed.length < 6) return {ok:false, msg:'Transaction ID too short (min 6 chars)'};
        if(trimmed.length > 50) return {ok:false, msg:'Transaction ID too long'};
        if(!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return {ok:false, msg:'Invalid Transaction ID format'};
        return {ok:true, value:trimmed};
    }
};

// ============================================
// 🎨 INLINE ERROR DISPLAY
// ============================================
function showFieldError(fieldId, msg){
    const field = document.getElementById(fieldId);
    if(!field) return;
    clearFieldError(fieldId);
    field.classList.add('field-error');
    
    const errEl = document.createElement('div');
    errEl.className = 'field-err-msg';
    errEl.id = fieldId + '_err';
    errEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
    
    const parent = field.closest('.inp-icon') || field.closest('.f-group') || field.parentElement;
    parent.appendChild(errEl);
    
    field.classList.add('shake');
    setTimeout(()=>field.classList.remove('shake'), 500);
    field.focus();
}

function clearFieldError(fieldId){
    const field = document.getElementById(fieldId);
    if(!field) return;
    field.classList.remove('field-error');
    const existing = document.getElementById(fieldId + '_err');
    if(existing) existing.remove();
}

function clearAllErrors(){
    document.querySelectorAll('.field-err-msg').forEach(e=>e.remove());
    document.querySelectorAll('.field-error').forEach(e=>e.classList.remove('field-error'));
}

function showSuccessField(fieldId){
    const field = document.getElementById(fieldId);
    if(!field) return;
    clearFieldError(fieldId);
    field.classList.add('field-valid');
    setTimeout(()=>field.classList.remove('field-valid'), 2000);
}

function attachValidation(fieldId, validatorName){
    const field = document.getElementById(fieldId);
    if(!field) return;
    
    if(validatorName === 'phone'){
        field.addEventListener('input', function(){
            this.value = this.value.replace(/\D/g,'').slice(0,10);
            clearFieldError(fieldId);
        });
    }
    else if(validatorName === 'pincode'){
        field.addEventListener('input', function(){
            this.value = this.value.replace(/\D/g,'').slice(0,6);
            clearFieldError(fieldId);
        });
    }
    else {
        field.addEventListener('input', function(){
            clearFieldError(fieldId);
        });
    }
    
    field.addEventListener('blur', function(){
        if(!this.value.trim()) return;
        const result = VALIDATORS[validatorName](this.value);
        if(!result.ok){
            showFieldError(fieldId, result.msg);
        } else {
            showSuccessField(fieldId);
        }
    });
}

function validateForm(fields){
    clearAllErrors();
    let firstErrorField = null;
    let allValid = true;
    const values = {};
    
    for(const f of fields){
        const el = document.getElementById(f.id);
        if(!el) continue;
        const result = VALIDATORS[f.validator](el.value);
        if(!result.ok){
            showFieldError(f.id, result.msg);
            if(!firstErrorField) firstErrorField = f.id;
            allValid = false;
        } else {
            values[f.id] = result.value;
        }
    }
    
    if(!allValid && firstErrorField){
        document.getElementById(firstErrorField)?.scrollIntoView({behavior:'smooth', block:'center'});
        toast('Please fix the errors below', 'e');
    }
    
    return {valid: allValid, values: values};
}

// ============================================
// CATEGORY & PRODUCTS DATA
// ============================================
const CATS = {
    'awards':{icon:'fa-trophy',name:'Awards'},
    'keychains':{icon:'fa-key',name:'Keychains'},
    'fridge-magnets':{icon:'fa-magnet',name:'Fridge Magnets'},
    'photo-frames':{icon:'fa-image',name:'Photo Frames'},
    'badges':{icon:'fa-id-badge',name:'Badges'},
    'name-boards':{icon:'fa-chalkboard',name:'Name Boards'},
    'caricatures':{icon:'fa-paint-brush',name:'Caricatures'},
    'combo-gifts':{icon:'fa-gifts',name:'Combo Gifts'}
};

const DEF_PRODS = [
    {id:1,name:"Crystal Star Award Trophy",category:"awards",price:1299,originalPrice:1999,description:"Premium crystal star award trophy with custom engraving. Perfect for corporate events and recognition ceremonies.",image:"",rating:4.9,stock:20,featured:true,bestseller:true,newArrival:false},
    {id:2,name:"Wooden Shield Award Plaque",category:"awards",price:899,originalPrice:1499,description:"Elegant wooden shield plaque with brass plate for custom text engraving.",image:"",rating:4.7,stock:15,featured:true,bestseller:false,newArrival:true},
    {id:3,name:"Acrylic Achievement Award",category:"awards",price:699,originalPrice:999,description:"Modern acrylic award with laser-cut design and UV printed text.",image:"",rating:4.6,stock:30,featured:false,bestseller:true,newArrival:false},
    {id:4,name:"3D Crystal Photo Keychain",category:"keychains",price:449,originalPrice:699,description:"Premium 3D crystal keychain with laser-engraved photo. Comes with LED light base.",image:"",rating:4.8,stock:50,featured:true,bestseller:true,newArrival:false},
    {id:5,name:"Metal Name Keychain - Gold",category:"keychains",price:249,originalPrice:399,description:"Elegant gold-plated metal keychain with custom name engraving.",image:"",rating:4.5,stock:80,featured:false,bestseller:true,newArrival:true},
    {id:6,name:"Wooden Photo Keychain",category:"keychains",price:199,originalPrice:349,description:"Handcrafted wooden keychain with printed photo. Eco-friendly.",image:"",rating:4.4,stock:60,featured:false,bestseller:false,newArrival:true},
    {id:7,name:"Custom Photo Fridge Magnet",category:"fridge-magnets",price:149,originalPrice:249,description:"High-quality photo fridge magnet with vibrant color printing.",image:"",rating:4.5,stock:100,featured:true,bestseller:true,newArrival:false},
    {id:8,name:"Acrylic Shape Fridge Magnet",category:"fridge-magnets",price:199,originalPrice:349,description:"Custom-shaped acrylic fridge magnet with UV photo print.",image:"",rating:4.6,stock:70,featured:false,bestseller:false,newArrival:true},
    {id:9,name:"Wooden Engraved Photo Frame",category:"photo-frames",price:599,originalPrice:999,description:"Beautiful handcrafted wooden photo frame with custom engraving.",image:"",rating:4.8,stock:25,featured:true,bestseller:true,newArrival:false},
    {id:10,name:"LED Light Photo Frame",category:"photo-frames",price:799,originalPrice:1299,description:"Modern LED backlit photo frame with custom photo. Multiple light modes.",image:"",rating:4.7,stock:18,featured:true,bestseller:false,newArrival:true},
    {id:11,name:"Couple Rotating Photo Frame",category:"photo-frames",price:899,originalPrice:1499,description:"Rotating photo frame for multiple photos. Perfect anniversary gift.",image:"",rating:4.6,stock:12,featured:false,bestseller:true,newArrival:false},
    {id:12,name:"Custom Printed Pin Badge",category:"badges",price:99,originalPrice:179,description:"Custom printed pin badge. Great for events and teams. Min order: 10.",image:"",rating:4.3,stock:500,featured:false,bestseller:true,newArrival:false},
    {id:13,name:"Metal Name Badge - Premium",category:"badges",price:249,originalPrice:399,description:"Premium metal name badge with magnetic backing.",image:"",rating:4.5,stock:100,featured:true,bestseller:false,newArrival:true},
    {id:14,name:"Acrylic Desk Name Board",category:"name-boards",price:499,originalPrice:799,description:"Premium acrylic desk name board with LED edge lighting.",image:"",rating:4.7,stock:25,featured:true,bestseller:true,newArrival:true},
    {id:15,name:"Wooden Wall Name Board",category:"name-boards",price:699,originalPrice:1099,description:"Elegant wooden wall-mounted name board with custom engraving.",image:"",rating:4.6,stock:20,featured:false,bestseller:false,newArrival:false},
    {id:16,name:"Door Name Plate - Brass",category:"name-boards",price:899,originalPrice:1399,description:"Traditional brass door name plate. Weather resistant.",image:"",rating:4.8,stock:15,featured:true,bestseller:false,newArrival:false},
    {id:17,name:"Single Person Caricature",category:"caricatures",price:799,originalPrice:1299,description:"Fun hand-drawn digital caricature. Printed on premium art paper with frame.",image:"",rating:4.9,stock:30,featured:true,bestseller:true,newArrival:false},
    {id:18,name:"Couple Caricature Portrait",category:"caricatures",price:1199,originalPrice:1899,description:"Romantic couple caricature art. Custom themes available.",image:"",rating:4.8,stock:20,featured:true,bestseller:true,newArrival:true},
    {id:19,name:"Family Caricature - 4 Persons",category:"caricatures",price:1799,originalPrice:2799,description:"Fun family caricature with up to 4 people. Premium framed print.",image:"",rating:4.7,stock:10,featured:false,bestseller:false,newArrival:true},
    {id:20,name:"Birthday Combo Gift Set",category:"combo-gifts",price:1499,originalPrice:2299,description:"Complete birthday gift set: Mug + photo frame + keychain + card.",image:"",rating:4.8,stock:15,featured:true,bestseller:true,newArrival:false},
    {id:21,name:"Anniversary Combo Hamper",category:"combo-gifts",price:1999,originalPrice:2999,description:"Premium anniversary combo: Frame + cushion + caricature + magnets.",image:"",rating:4.9,stock:10,featured:true,bestseller:false,newArrival:true},
    {id:22,name:"Corporate Gift Combo",category:"combo-gifts",price:999,originalPrice:1599,description:"Professional gift set: Badge + name board + certificate frame.",image:"",rating:4.5,stock:40,featured:false,bestseller:false,newArrival:false},
    {id:23,name:"Magnetic Photo Set (6 pcs)",category:"fridge-magnets",price:349,originalPrice:599,description:"Set of 6 custom photo fridge magnets in different shapes.",image:"",rating:4.6,stock:40,featured:false,bestseller:true,newArrival:true},
    {id:24,name:"Resin Trophy Award",category:"awards",price:599,originalPrice:899,description:"Colourful resin trophy with custom plate. Multiple designs.",image:"",rating:4.4,stock:50,featured:false,bestseller:false,newArrival:false}
];

// ============================================
// STORAGE HELPERS
// ============================================
function init(){
    if(!localStorage.getItem('bst_p')) localStorage.setItem('bst_p', JSON.stringify(DEF_PRODS));
    if(!localStorage.getItem('bst_o')) localStorage.setItem('bst_o', '[]');
    if(!localStorage.getItem('bst_c')) localStorage.setItem('bst_c', '[]');
    if(!localStorage.getItem('bst_cart')) localStorage.setItem('bst_cart', '[]');
}
const gP = () => JSON.parse(localStorage.getItem('bst_p')) || [];
const sP = d => localStorage.setItem('bst_p', JSON.stringify(d));
const gO = () => JSON.parse(localStorage.getItem('bst_o')) || [];
const sO = d => localStorage.setItem('bst_o', JSON.stringify(d));
const gC = () => JSON.parse(localStorage.getItem('bst_c')) || [];
const sC = d => localStorage.setItem('bst_c', JSON.stringify(d));
const gK = () => JSON.parse(localStorage.getItem('bst_cart')) || [];
const sK = d => localStorage.setItem('bst_cart', JSON.stringify(d));

// ============================================
// INIT ON LOAD
// ============================================
window.addEventListener('load', () => {
    init();
    setTimeout(() => document.getElementById('preloader').classList.add('gone'), 1200);
    renderProds();
    updateBadge();
    mkParticles();
    animNums();
    setupFilters();
    chkLogin();
});

// ============================================
// PARTICLES & ANIMATIONS
// ============================================
function mkParticles(){
    const c = document.getElementById('heroBgParticles');
    if(!c) return;
    for(let i=0; i<25; i++){
        const p = document.createElement('div');
        p.classList.add('particle');
        const s = Math.random()*6 + 2;
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${Math.random()>.5?'rgba(222,33,40,.4)':'rgba(255,255,255,.2)'};animation-duration:${Math.random()*15+10}s;animation-delay:${Math.random()*10}s;`;
        c.appendChild(p);
    }
}

function animNums(){
    const els = document.querySelectorAll('.hn-val[data-target]');
    const obs = new IntersectionObserver(es => es.forEach(e => {
        if(e.isIntersecting){
            cntUp(e.target, +e.target.dataset.target);
            obs.unobserve(e.target);
        }
    }));
    els.forEach(el => obs.observe(el));
}

function cntUp(el, t){
    let c = 0;
    const inc = t/80;
    const iv = setInterval(() => {
        c += inc;
        if(c >= t){
            el.textContent = t;
            clearInterval(iv);
        } else {
            el.textContent = Math.floor(c);
        }
    }, 20);
}

// ============================================
// NAVIGATION
// ============================================
function toggleNav(){
    document.getElementById('navMenu').classList.toggle('on');
    document.getElementById('navBurger').classList.toggle('open');
}

document.querySelectorAll('.nav-menu a').forEach(a => a.addEventListener('click', () => {
    document.getElementById('navMenu').classList.remove('on');
    document.getElementById('navBurger').classList.remove('open');
}));

window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', scrollY > 50);
    document.getElementById('btt').classList.toggle('vis', scrollY > 400);
    document.querySelectorAll('section[id]').forEach(s => {
        const t = s.offsetTop - 100;
        if(scrollY >= t && scrollY < t + s.offsetHeight){
            document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
            const l = document.querySelector(`.nav-menu a[href="#${s.id}"]`);
            if(l) l.classList.add('active');
        }
    });
});

function scrollToSec(id){
    document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
}

function setupFilters(){
    document.getElementById('filterBar')?.addEventListener('click', e => {
        const b = e.target.closest('.fbtn');
        if(!b) return;
        document.querySelectorAll('#filterBar .fbtn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        renderProds(b.dataset.cat);
    });
}

// ============================================
// RENDER PRODUCTS
// ============================================
function renderProds(cat='all', q=''){
    const g = document.getElementById('prodGrid');
    if(!g) return;
    let ps = gP();
    if(cat && cat !== 'all') ps = ps.filter(p => p.category === cat);
    if(q){
        const t = q.toLowerCase();
        ps = ps.filter(p => p.name.toLowerCase().includes(t) || p.category.includes(t) || p.description.toLowerCase().includes(t));
    }
    if(!ps.length){
        g.innerHTML = '<div class="no-prod"><i class="fas fa-box-open"></i><h3>No products found</h3><p>Try another category</p></div>';
        return;
    }
    g.innerHTML = ps.map(p => {
        const d = p.originalPrice ? Math.round((1 - p.price/p.originalPrice) * 100) : 0;
        const ic = CATS[p.category]?.icon || 'fa-gift';
        const im = p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<div class=\\'p-ph\\'><i class=\\'fas ${ic}\\'></i></div>'">` : `<div class="p-ph"><i class="fas ${ic}"></i></div>`;
        return `<div class="p-card">
            <div class="p-badges">${p.newArrival?'<span class="p-badge bg-new">New</span>':''}${p.bestseller?'<span class="p-badge bg-best">Bestseller</span>':''}${d>0?`<span class="p-badge bg-sale">${d}% OFF</span>`:''}</div>
            <div class="p-img">${im}
                <div class="p-actions">
                    <button class="p-act-btn" onclick="viewProd(${p.id})"><i class="fas fa-eye"></i></button>
                    <button class="p-act-btn" onclick="addCart(${p.id})"><i class="fas fa-shopping-cart"></i></button>
                    <button class="p-act-btn" onclick="buyNow(${p.id})"><i class="fas fa-bolt"></i></button>
                </div>
            </div>
            <div class="p-info">
                <div class="p-cat-tag">${CATS[p.category]?.name || p.category}</div>
                <h3 class="p-name">${p.name}</h3>
                <div class="p-stars">${stars(p.rating)}<span>(${p.rating})</span></div>
                <div class="p-price">
                    <span class="pr-now">₹${p.price}</span>
                    ${p.originalPrice?`<span class="pr-was">₹${p.originalPrice}</span>`:''}
                    ${d>0?`<span class="pr-off">${d}% OFF</span>`:''}
                </div>
                <button class="p-add-btn" onclick="addCart(${p.id})"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
            </div>
        </div>`;
    }).join('');
}

function stars(r){
    let h = '';
    for(let i=1; i<=5; i++){
        if(i <= Math.floor(r)) h += '<i class="fas fa-star"></i>';
        else if(i - r < 1 && i - r > 0) h += '<i class="fas fa-star-half-alt"></i>';
        else h += '<i class="far fa-star"></i>';
    }
    return h;
}

function filterCat(c){
    scrollToSec('products');
    setTimeout(() => {
        document.querySelectorAll('#filterBar .fbtn').forEach(b => {
            b.classList.remove('active');
            if(b.dataset.cat === c) b.classList.add('active');
        });
        renderProds(c);
    }, 400);
}

function doSearch(){
    const t = document.getElementById('searchInput').value.trim();
    if(t){
        scrollToSec('products');
        setTimeout(() => renderProds('all', t), 300);
    }
}

document.getElementById('searchInput')?.addEventListener('keypress', e => {
    if(e.key === 'Enter') doSearch();
});

// ============================================
// PRODUCT DETAIL VIEW
// ============================================
let dQ = 1;

function viewProd(id){
    const p = gP().find(x => x.id === id);
    if(!p) return;
    dQ = 1;
    const d = p.originalPrice ? Math.round((1 - p.price/p.originalPrice) * 100) : 0;
    const ic = CATS[p.category]?.icon || 'fa-gift';
    const im = p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.outerHTML='<i class=\\'fas ${ic}\\'></i>'">` : `<i class="fas ${ic}"></i>`;
    
    document.getElementById('prodDetailArea').innerHTML = `<div class="pd-grid">
        <div class="pd-img">${im}</div>
        <div>
            <div class="pd-cat">${CATS[p.category]?.name || p.category}</div>
            <h2 class="pd-title">${p.name}</h2>
            <div class="pd-rat">${stars(p.rating)} <span>${p.rating}/5</span></div>
            <div class="pd-pr-row">
                <span class="pd-pr">₹${p.price}</span>
                ${p.originalPrice?`<span class="pd-op">₹${p.originalPrice}</span>`:''}
                ${d>0?`<span class="pr-off" style="margin-left:10px">${d}% OFF</span>`:''}
            </div>
            <p class="pd-desc">${p.description}</p>
            <div class="pd-qty">
                <label>Quantity:</label>
                <div class="qty-ctrl">
                    <button onclick="chDQ(-1)">−</button>
                    <span id="dQV">1</span>
                    <button onclick="chDQ(1)">+</button>
                </div>
                <span style="font-size:13px;color:#999">${p.stock} in stock</span>
            </div>
            <div class="pd-btns">
                <button class="btn-primary" onclick="addCart(${p.id},dQ);closeOv('prodOverlay')"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
                <button class="btn-outline-dk" onclick="buyNow(${p.id})"><i class="fas fa-bolt"></i> Buy Now</button>
            </div>
            <div class="pd-feats">
                <h4>Features</h4>
                <ul>
                    <li><i class="fas fa-check"></i> 100% Customizable</li>
                    <li><i class="fas fa-check"></i> Premium Quality</li>
                    <li><i class="fas fa-check"></i> Free Shipping above ₹999</li>
                    <li><i class="fas fa-check"></i> 7-Day Returns</li>
                </ul>
            </div>
        </div>
    </div>`;
    openOv('prodOverlay');
}

function chDQ(d){
    dQ = Math.max(1, dQ + d);
    document.getElementById('dQV').textContent = dQ;
}

// ============================================
// CART MANAGEMENT
// ============================================
function addCart(pid, qty=1){
    const p = gP().find(x => x.id === pid);
    if(!p) return;
    let c = gK();
    const e = c.find(x => x.pid === pid);
    if(e) e.qty += qty;
    else c.push({pid, qty});
    sK(c);
    updateBadge();
    renderCart();
    toast(`${p.name} added to cart!`);
}

function rmCart(pid){
    sK(gK().filter(x => x.pid !== pid));
    updateBadge();
    renderCart();
}

function updQty(pid, d){
    let c = gK();
    const i = c.find(x => x.pid === pid);
    if(i){
        i.qty += d;
        if(i.qty <= 0) c = c.filter(x => x.pid !== pid);
    }
    sK(c);
    updateBadge();
    renderCart();
}

function updateBadge(){
    document.getElementById('cartBadge').textContent = gK().reduce((s, i) => s + i.qty, 0);
}

function toggleCart(){
    document.getElementById('cartDim').classList.toggle('on');
    document.getElementById('cartDrawer').classList.toggle('on');
    renderCart();
}

function renderCart(){
    const el = document.getElementById('cartBody'), cart = gK(), ps = gP();
    if(!cart.length){
        el.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-basket"></i><p>Your cart is empty</p></div>';
        document.getElementById('cartTotalVal').textContent = '₹0';
        return;
    }
    let tot = 0;
    el.innerHTML = cart.map(item => {
        const p = ps.find(x => x.id === item.pid);
        if(!p) return '';
        tot += p.price * item.qty;
        const ic = CATS[p.category]?.icon || 'fa-gift';
        const im = p.image ? `<img src="${p.image}" alt="" onerror="this.outerHTML='<i class=\\'fas ${ic}\\'></i>'">` : `<i class="fas ${ic}"></i>`;
        return `<div class="ci">
            <div class="ci-img">${im}</div>
            <div class="ci-det">
                <h4>${p.name}</h4>
                <span class="ci-pr">₹${p.price}</span>
                <div class="ci-qty">
                    <button class="qb" onclick="updQty(${p.id},-1)">−</button>
                    <span>${item.qty}</span>
                    <button class="qb" onclick="updQty(${p.id},1)">+</button>
                </div>
            </div>
            <button class="ci-del" onclick="rmCart(${p.id})"><i class="fas fa-trash-alt"></i></button>
        </div>`;
    }).join('');
    document.getElementById('cartTotalVal').textContent = `₹${tot.toLocaleString()}`;
}

function buyNow(pid){
    let c = gK();
    if(!c.find(x => x.pid === pid)){
        c.push({pid, qty:1});
        sK(c);
        updateBadge();
    }
    closeOv('prodOverlay');
    startCheckout();
}

// ============================================
// CHECKOUT WITH VALIDATION
// ============================================
let orderTotal = 0, currentOrderId = '', shippingData = {};

function startCheckout(){
    if(!gK().length){
        toast('Cart is empty!', 'e');
        return;
    }
    document.getElementById('cartDim').classList.remove('on');
    document.getElementById('cartDrawer').classList.remove('on');
    renderShippingStep();
    openOv('checkOverlay');
}

function renderShippingStep(){
    const u = JSON.parse(localStorage.getItem('bst_u'));
    document.getElementById('checkContent').innerHTML = `<div class="m-head"><div class="m-icon"><i class="fas fa-credit-card"></i></div><h2>Checkout</h2></div>
    <div class="ck-steps">
        <div class="ck-step active"><span>1</span> Shipping</div><div class="ck-line"></div>
        <div class="ck-step"><span>2</span> Payment</div><div class="ck-line"></div>
        <div class="ck-step"><span>3</span> Done</div>
    </div>
    <h3>Shipping Information</h3>
    <div class="f-row">
        <div class="f-group"><label>Full Name *</label><input type="text" id="sName" placeholder="Enter your full name" value="${u?.name||''}" maxlength="50"></div>
        <div class="f-group"><label>Phone Number *</label><input type="tel" id="sPhone" placeholder="10-digit mobile" value="${u?.phone||''}" maxlength="10"></div>
    </div>
    <div class="f-group"><label>Email Address *</label><input type="email" id="sEmail" placeholder="your@email.com" value="${u?.email||''}" maxlength="100"></div>
    <div class="f-group"><label>Delivery Address *</label><textarea id="sAddr" rows="3" placeholder="House no, Street, Locality (min 10 chars)" maxlength="200">${u?.address||''}</textarea></div>
    <div class="f-row">
        <div class="f-group"><label>City *</label><input type="text" id="sCity" placeholder="e.g., Coimbatore" maxlength="50"></div>
        <div class="f-group"><label>Pincode *</label><input type="text" id="sPin" placeholder="6-digit pincode" maxlength="6"></div>
    </div>
    <div class="f-group"><label>Customization Notes <span style="color:#999;font-weight:400">(Optional)</span></label><textarea id="sNotes" rows="2" placeholder="Special instructions for your order..." maxlength="500"></textarea></div>
    <button onclick="goPayStep()" class="btn-primary btn-block">Continue to Payment <i class="fas fa-arrow-right"></i></button>`;
    
    // Attach real-time validation
    setTimeout(() => {
        attachValidation('sName', 'name');
        attachValidation('sPhone', 'phone');
        attachValidation('sEmail', 'email');
        attachValidation('sAddr', 'address');
        attachValidation('sCity', 'city');
        attachValidation('sPin', 'pincode');
    }, 100);
}

function goPayStep(){
    // Validate all shipping fields
    const validation = validateForm([
        {id:'sName', validator:'name'},
        {id:'sPhone', validator:'phone'},
        {id:'sEmail', validator:'email'},
        {id:'sAddr', validator:'address'},
        {id:'sCity', validator:'city'},
        {id:'sPin', validator:'pincode'}
    ]);
    
    if(!validation.valid) return;
    
    // Use validated/cleaned values
    shippingData = {
        name: validation.values.sName,
        phone: validation.values.sPhone,
        email: validation.values.sEmail,
        address: validation.values.sAddr,
        city: validation.values.sCity,
        pincode: validation.values.sPin,
        notes: document.getElementById('sNotes').value.trim()
    };
    
    // Calculate totals
    const cart = gK(), ps = gP();
    let tot = 0, html = '';
    cart.forEach(item => {
        const p = ps.find(x => x.id === item.pid);
        if(p){
            const st = p.price * item.qty;
            tot += st;
            html += `<div class="os-line"><span>${p.name} × ${item.qty}</span><strong>₹${st.toLocaleString()}</strong></div>`;
        }
    });
    const ship = tot >= 999 ? 0 : 99;
    tot += ship;
    orderTotal = tot;
    html += `<div class="os-line"><span>Shipping</span><span>${ship===0?'<span style="color:#4CAF50;font-weight:700">FREE</span>':'₹99'}</span></div>`;
    html += `<div class="os-total"><span>Total</span><span class="os-val">₹${tot.toLocaleString()}</span></div>`;
    
    document.getElementById('checkContent').innerHTML = `<div class="m-head"><div class="m-icon"><i class="fas fa-credit-card"></i></div><h2>Payment Method</h2></div>
    <div class="ck-steps">
        <div class="ck-step done"><span>1</span> Shipping</div><div class="ck-line"></div>
        <div class="ck-step active"><span>2</span> Payment</div><div class="ck-line"></div>
        <div class="ck-step"><span>3</span> Done</div>
    </div>
    <h3>Order Summary</h3>
    <div class="order-sum">${html}</div>
    <div class="pay-methods">
        <h4>Select Payment Method</h4>
        <label class="pay-opt pay-opt-recommended">
            <input type="radio" name="payM" value="razorpay" checked>
            <div class="pay-opt-body"><i class="fas fa-bolt"></i><div><h4>Pay Online (Razorpay)</h4><p>Cards, UPI, Net Banking, Wallets</p></div></div>
        </label>
        <label class="pay-opt">
            <input type="radio" name="payM" value="upi_direct">
            <div class="pay-opt-body"><i class="fas fa-qrcode"></i><div><h4>Direct UPI / QR Code</h4><p>Scan QR with GPay, PhonePe, Paytm</p></div></div>
        </label>
        <label class="pay-opt">
            <input type="radio" name="payM" value="cod">
            <div class="pay-opt-body"><i class="fas fa-money-bill-wave"></i><div><h4>Cash on Delivery</h4><p>Pay when you receive</p></div></div>
        </label>
    </div>
    <div class="ck-btns">
        <button onclick="renderShippingStep()" class="btn-outline-dk"><i class="fas fa-arrow-left"></i> Back</button>
        <button onclick="processPayment()" class="btn-primary"><i class="fas fa-lock"></i> Proceed</button>
    </div>`;
}

// ============================================
// PAYMENT PROCESSING
// ============================================
function processPayment(){
    const m = document.querySelector('input[name="payM"]:checked').value;
    if(m === 'cod'){
        if(confirm(`Confirm COD order for ₹${orderTotal.toLocaleString()}?`)){
            finalizeOrder('cod', 'COD-' + Date.now());
        }
    } else if(m === 'razorpay'){
        processRazorpay();
    } else if(m === 'upi_direct'){
        showUPIPayment();
    }
}

function processRazorpay(){
    if(typeof Razorpay === 'undefined'){
        toast('Payment gateway not loaded. Refresh page.', 'e');
        return;
    }
    
    currentOrderId = 'BST-' + String(gO().length + 1).padStart(3, '0');
    
    const opts = {
        key: PAYMENT_CONFIG.razorpay.key,
        amount: orderTotal * 100,
        currency: 'INR',
        name: PAYMENT_CONFIG.razorpay.merchant_name,
        description: `Order ${currentOrderId}`,
        image: PAYMENT_CONFIG.razorpay.merchant_logo,
        handler: function(r){
            finalizeOrder('razorpay', r.razorpay_payment_id);
        },
        prefill: {
            name: shippingData.name,
            email: shippingData.email,
            contact: shippingData.phone
        },
        notes: {
            order_id: currentOrderId,
            address: shippingData.address
        },
        theme: {color: PAYMENT_CONFIG.razorpay.theme_color},
        modal: {
            ondismiss: function(){
                toast('Payment cancelled.', 'e');
            }
        }
    };
    
    try {
        const rzp = new Razorpay(opts);
        rzp.on('payment.failed', function(r){
            toast('Payment failed: ' + (r.error.description || 'Error'), 'e');
        });
        rzp.open();
    } catch(err){
        toast('Payment gateway error. Try again.', 'e');
    }
}

function showUPIPayment(){
    currentOrderId = 'BST-' + String(gO().length + 1).padStart(3, '0');
    const uid = PAYMENT_CONFIG.upi.upi_id;
    const nm = PAYMENT_CONFIG.upi.merchant_name;
    const note = 'Order ' + currentOrderId;
    const params = `pa=${uid}&pn=${encodeURIComponent(nm)}&am=${orderTotal}&cu=INR&tn=${encodeURIComponent(note)}`;
    const upiLink = `upi://pay?${params}`;
    const gpay = `tez://upi/pay?${params}`;
    const phonepe = `phonepe://pay?${params}`;
    const paytm = `paytmmp://pay?${params}`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&margin=10`;
    
    document.getElementById('checkContent').innerHTML = `<div class="m-head">
        <div class="m-icon"><i class="fas fa-qrcode"></i></div>
        <h2>UPI Payment</h2>
        <p>${isMobile?'Choose your UPI app':'Scan QR with your UPI app'}</p>
    </div>
    <div class="ck-steps">
        <div class="ck-step done"><span>1</span> Shipping</div><div class="ck-line"></div>
        <div class="ck-step active"><span>2</span> Payment</div><div class="ck-line"></div>
        <div class="ck-step"><span>3</span> Done</div>
    </div>
    <div class="upi-pay-wrap">
        <div class="upi-amount-card">
            <p class="upi-amount-label">Amount to Pay</p>
            <p class="upi-amount-val">₹${orderTotal.toLocaleString()}</p>
            <p class="upi-order-label">Order: ${currentOrderId}</p>
        </div>
        ${isMobile ? `
        <div class="upi-apps-grid">
            <h4 style="font-size:16px;font-weight:700;color:#333;margin-bottom:15px;text-align:center"><i class="fas fa-mobile-alt"></i> Pay with your UPI App</h4>
            <a href="${gpay}" class="upi-app-btn">
                <div class="upi-app-icon" style="background:white">
                    <svg width="28" height="28" viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/></svg>
                </div>
                <div class="upi-app-info"><span class="upi-app-name">Google Pay</span><span class="upi-app-tag">Tap to pay</span></div>
                <i class="fas fa-chevron-right upi-app-arrow"></i>
            </a>
            <a href="${phonepe}" class="upi-app-btn">
                <div class="upi-app-icon" style="background:#5f259f;color:white"><strong style="font-size:14px">PP</strong></div>
                <div class="upi-app-info"><span class="upi-app-name">PhonePe</span><span class="upi-app-tag">Tap to pay</span></div>
                <i class="fas fa-chevron-right upi-app-arrow"></i>
            </a>
            <a href="${paytm}" class="upi-app-btn">
                <div class="upi-app-icon" style="background:#00BAF2;color:white"><strong style="font-size:16px">P</strong></div>
                <div class="upi-app-info"><span class="upi-app-name">Paytm</span><span class="upi-app-tag">Tap to pay</span></div>
                <i class="fas fa-chevron-right upi-app-arrow"></i>
            </a>
            <a href="${upiLink}" class="upi-app-btn">
                <div class="upi-app-icon" style="background:linear-gradient(135deg,#de2128,#b91c22);color:white"><i class="fas fa-th"></i></div>
                <div class="upi-app-info"><span class="upi-app-name">Other UPI Apps</span><span class="upi-app-tag">BHIM, Amazon Pay, WhatsApp Pay</span></div>
                <i class="fas fa-chevron-right upi-app-arrow"></i>
            </a>
        </div>
        <div class="upi-divider"><span>OR SCAN QR</span></div>
        <div class="upi-qr-box"><img src="${qr}" alt="QR" onerror="this.style.display='none'"></div>
        ` : `
        <div class="upi-qr-box" style="margin-top:20px"><img src="${qr}" alt="QR" onerror="this.style.display='none'"></div>
        <div class="upi-mobile-suggest">
            <i class="fas fa-mobile-alt"></i>
            <p><strong>On Mobile?</strong> Open this page on your phone to pay directly via UPI apps.</p>
        </div>
        `}
        <div class="upi-id-box">
            <p class="upi-id-label">Pay using UPI ID</p>
            <div class="upi-id-row">
                <span class="upi-id-text">${uid}</span>
                <button onclick="copyUPI('${uid}')" class="upi-copy-btn"><i class="fas fa-copy"></i> Copy</button>
            </div>
        </div>
        <div class="upi-instructions">
            <p><i class="fas fa-info-circle"></i> How to Pay:</p>
            <ol>${isMobile?'<li>Tap your preferred UPI app above</li><li>Verify amount and enter PIN</li><li>Copy Transaction ID from your app</li><li>Paste below and confirm</li>':'<li>Open UPI app on your phone</li><li>Scan QR code above</li><li>Enter PIN to pay</li><li>Enter Transaction ID below</li>'}</ol>
        </div>
        <div class="upi-txn-input-wrap">
            <label>UPI Transaction ID / Reference *</label>
            <input type="text" id="upiTxnId" placeholder="e.g., 423456789012" maxlength="50">
            <p class="upi-help-txt">Find this in your UPI app after payment</p>
        </div>
        <div class="ck-btns">
            <button onclick="goPayStep()" class="btn-outline-dk"><i class="fas fa-arrow-left"></i> Back</button>
            <button onclick="confirmUPI()" class="btn-primary"><i class="fas fa-check"></i> Confirm Payment</button>
        </div>
    </div>`;
    
    // Attach validation to transaction ID
    setTimeout(() => {
        attachValidation('upiTxnId', 'transactionId');
    }, 100);
}

function copyUPI(u){
    if(navigator.clipboard){
        navigator.clipboard.writeText(u).then(() => toast('UPI ID copied!')).catch(() => fbCopy(u));
    } else {
        fbCopy(u);
    }
}

function fbCopy(t){
    const a = document.createElement('textarea');
    a.value = t;
    a.style.position = 'fixed';
    a.style.left = '-9999px';
    document.body.appendChild(a);
    a.select();
    try {
        document.execCommand('copy');
        toast('Copied!');
    } catch(e){
        toast('Copy manually', 'e');
    }
    document.body.removeChild(a);
}

function confirmUPI(){
    clearAllErrors();
    const txnVal = VALIDATORS.transactionId(document.getElementById('upiTxnId').value);
    if(!txnVal.ok){
        showFieldError('upiTxnId', txnVal.msg);
        return;
    }
    finalizeOrder('upi', txnVal.value);
}

// ============================================
// FINALIZE ORDER + WHATSAPP NOTIFICATION
// ============================================
function finalizeOrder(method, paymentId){
    const cart = gK(), ps = gP();
    let tot = 0;
    const items = cart.map(item => {
        const p = ps.find(x => x.id === item.pid);
        if(p){
            tot += p.price * item.qty;
            return {
                productId: p.id,
                name: p.name,
                price: p.price,
                quantity: item.qty,
                subtotal: p.price * item.qty
            };
        }
        return null;
    }).filter(Boolean);
    
    const ship = tot >= 999 ? 0 : 99;
    tot += ship;
    const oid = currentOrderId || 'BST-' + String(gO().length + 1).padStart(3, '0');
    const dt = new Date();
    
    const order = {
        id: oid,
        customer: {
            name: shippingData.name,
            email: shippingData.email,
            phone: shippingData.phone,
            address: shippingData.address,
            city: shippingData.city,
            pincode: shippingData.pincode
        },
        items,
        total: tot,
        shipping: ship,
        paymentMethod: method,
        paymentId: paymentId || null,
        paymentStatus: method === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        date: dt.toISOString(),
        notes: shippingData.notes,
        tracking: [{
            status: 'Order Placed',
            date: dt.toISOString(),
            description: 'Your order has been received'
        }]
    };
    
    const orders = gO();
    orders.push(order);
    sO(orders);
    
    // Update customer
    const u = JSON.parse(localStorage.getItem('bst_u'));
    if(u){
        const cs = gC();
        const c = cs.find(x => x.email === u.email);
        if(c){
            if(!c.orders) c.orders = [];
            c.orders.push(oid);
            c.totalSpent = (c.totalSpent || 0) + tot;
            sC(cs);
        }
    }
    
    // Update stock
    const prods = gP();
    items.forEach(item => {
        const p = prods.find(x => x.id === item.productId);
        if(p) p.stock = Math.max(0, p.stock - item.quantity);
    });
    sP(prods);
    
    // Clear cart
    sK([]);
    updateBadge();
    
    renderSuccessStep(order);
    toast('Order placed!');
    
    // Auto WhatsApp after 1.5 seconds
    setTimeout(() => sendWhatsApp(order), 1500);
}

function buildWAMsg(o){
    const d = new Date(o.date);
    const ds = d.toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'});
    const ts = d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
    const pm = {
        'razorpay': '💳 Online (Razorpay)',
        'upi': '📱 UPI',
        'cod': '💵 Cash on Delivery'
    };
    const ps = o.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING';
    
    let il = '';
    o.items.forEach((i, n) => {
        il += `\n${n+1}. *${i.name}*\n   Qty: ${i.quantity} × ₹${i.price} = ₹${i.subtotal.toLocaleString()}`;
    });
    
    return `🎁 *NEW ORDER - BESTOW* 🎁
━━━━━━━━━━━━━━━━━━

📋 *Order ID:* *${o.id}*
📅 ${ds} • ${ts}

👤 *Customer*
Name: *${o.customer.name}*
📞 ${o.customer.phone}
📧 ${o.customer.email}

📍 *Delivery Address*
${o.customer.address}
${o.customer.city} - ${o.customer.pincode}

🛍️ *Items (${o.items.length})*${il}

━━━━━━━━━━━━━━━━━━
Subtotal: ₹${(o.total - o.shipping).toLocaleString()}
Shipping: ${o.shipping === 0 ? 'FREE' : '₹' + o.shipping}
*TOTAL: ₹${o.total.toLocaleString()}*
━━━━━━━━━━━━━━━━━━

💳 *Payment*
${pm[o.paymentMethod] || o.paymentMethod}
Status: ${ps}
${o.paymentId ? `Txn ID: ${o.paymentId}` : ''}
${o.notes ? `\n📝 *Notes:* ${o.notes}` : ''}

━━━━━━━━━━━━━━━━━━
🙏 *Bestow* - Elevate Your Memories`;
}

function sendWhatsApp(o){
    const msg = buildWAMsg(o);
    window.open(`https://wa.me/${PAYMENT_CONFIG.business.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
}

function resendWA(oid){
    const o = gO().find(x => x.id === oid);
    if(o) sendWhatsApp(o);
}

function renderSuccessStep(o){
    const ml = {
        'razorpay': 'Online Payment',
        'upi': 'UPI Payment',
        'cod': 'Cash on Delivery'
    };
    
    document.getElementById('checkContent').innerHTML = `<div class="m-head">
        <div class="m-icon" style="background:rgba(76,175,80,.1);color:#4CAF50"><i class="fas fa-check-circle"></i></div>
    </div>
    <div class="ck-steps">
        <div class="ck-step done"><span>1</span> Shipping</div><div class="ck-line"></div>
        <div class="ck-step done"><span>2</span> Payment</div><div class="ck-line"></div>
        <div class="ck-step active"><span>3</span> Done</div>
    </div>
    <div class="order-done">
        <div class="done-check"><i class="fas fa-check-circle"></i></div>
        <h2>Order Placed! 🎉</h2>
        <p>Thank you for shopping with Bestow</p>
        <div class="done-oid">${o.id}</div>
        <div style="background:var(--lg2);padding:20px;border-radius:12px;margin:20px auto;max-width:450px;text-align:left">
            <p style="font-size:13px;color:#666;margin-bottom:8px"><strong>👤</strong> ${o.customer.name}</p>
            <p style="font-size:13px;color:#666;margin-bottom:8px"><strong>📞</strong> ${o.customer.phone}</p>
            <p style="font-size:13px;color:#666;margin-bottom:8px"><strong>💳</strong> ${ml[o.paymentMethod] || o.paymentMethod}</p>
            ${o.paymentId ? `<p style="font-size:12px;color:#999;margin-bottom:8px"><strong>🆔</strong> ${o.paymentId}</p>` : ''}
            <p style="font-size:14px;color:#de2128;font-weight:700"><strong>💰 ₹${o.total.toLocaleString()}</strong></p>
        </div>
        <div style="background:linear-gradient(135deg,#25D366,#128C7E);color:white;padding:20px;border-radius:12px;margin:20px auto;max-width:450px">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
                <i class="fab fa-whatsapp" style="font-size:32px"></i>
                <div style="text-align:left">
                    <h4 style="font-size:16px;font-weight:700;margin:0">WhatsApp Notification</h4>
                    <p style="font-size:12px;opacity:.9;margin:0">Order details sent to our team</p>
                </div>
            </div>
            <p style="font-size:12px;opacity:.95;text-align:left;line-height:1.5;margin-top:10px">📲 Your order confirmation is being sent via WhatsApp. Our team will contact you for customization details.</p>
        </div>
        <p style="font-size:14px;color:#999;margin:20px 0">Track your order anytime with the Order ID above</p>
        <div class="done-btns">
            <button onclick="resendWA('${o.id}')" class="btn-primary" style="background:#25D366"><i class="fab fa-whatsapp"></i> Send via WhatsApp Again</button>
            <button onclick="closeOv('checkOverlay');scrollToSec('tracking')" class="btn-primary"><i class="fas fa-truck"></i> Track Order</button>
            <button onclick="closeOv('checkOverlay')" class="btn-outline-dk">Continue Shopping</button>
        </div>
    </div>`;
}

// ============================================
// ORDER TRACKING
// ============================================
function trackOrder(){
    const tid = document.getElementById('trackInput').value.trim().toUpperCase();
    const r = document.getElementById('trackResult');
    
    if(!tid){
        toast('Enter Order ID!', 'e');
        return;
    }
    
    const o = gO().find(x => x.id === tid);
    if(!o){
        r.innerHTML = `<div class="track-inner"><div class="tk-404"><i class="fas fa-exclamation-circle"></i><h3>Order Not Found</h3><p>Check your Order ID.</p></div></div>`;
        return;
    }
    
    const steps = [
        {s:'Order Placed', i:'fa-clipboard-check'},
        {s:'Confirmed', i:'fa-check-circle'},
        {s:'Processing', i:'fa-cogs'},
        {s:'Shipped', i:'fa-shipping-fast'},
        {s:'Delivered', i:'fa-box-open'}
    ];
    const si = {pending:0, confirmed:1, processing:2, shipped:3, delivered:4};
    const ci = si[o.status] || 0;
    
    let tl = steps.map((st, idx) => {
        let cls = '';
        if(idx < ci) cls = 'done';
        else if(idx === ci) cls = 'now';
        const te = o.tracking && o.tracking[idx];
        const dt = te ? new Date(te.date).toLocaleDateString() : '';
        const desc = te ? te.description : 'Pending';
        return `<div class="tk-step ${cls}"><div class="tk-ic"><i class="fas ${st.i}"></i></div><div class="tk-info"><h4>${st.s}</h4><p>${desc}${dt?' • '+dt:''}</p></div></div>`;
    }).join('');
    
    const pm = {'razorpay':'Online', 'upi':'UPI', 'cod':'COD'};
    r.innerHTML = `<div class="track-inner">
        <div class="tk-head">
            <h3>Order: ${o.id}</h3>
            <p>${new Date(o.date).toLocaleDateString()} | ₹${o.total.toLocaleString()} | ${pm[o.paymentMethod] || o.paymentMethod}</p>
            ${o.paymentId ? `<p style="font-size:12px;color:#999;margin-top:5px">Ref: ${o.paymentId}</p>` : ''}
        </div>
        <div class="tk-timeline">${tl}</div>
        <div style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #eee">
            <button onclick="resendWA('${o.id}')" class="btn-primary" style="background:#25D366"><i class="fab fa-whatsapp"></i> Contact via WhatsApp</button>
        </div>
    </div>`;
}

// ============================================
// AUTH (WITH VALIDATION)
// ============================================
function showAuth(t){
    if(t === 'admin'){
        document.getElementById('custAuthArea').style.display = 'none';
        document.getElementById('admAuthArea').style.display = 'block';
    } else {
        document.getElementById('custAuthArea').style.display = 'block';
        document.getElementById('admAuthArea').style.display = 'none';
        goLogin();
    }
    openOv('authOverlay');
    clearAllErrors();
    
    // Attach validation
    setTimeout(() => {
        if(t === 'customer'){
            attachValidation('lEmail', 'email');
            attachValidation('lPass', 'password');
            attachValidation('rName', 'name');
            attachValidation('rEmail', 'email');
            attachValidation('rPhone', 'phone');
            attachValidation('rPass', 'password');
        }
    }, 100);
}

function goLogin(){
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('regArea').style.display = 'none';
    document.getElementById('authH').textContent = 'Customer Login';
    document.getElementById('authP').textContent = 'Sign in to your account';
    clearAllErrors();
}

function goRegister(){
    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('regArea').style.display = 'block';
    document.getElementById('authH').textContent = 'Create Account';
    document.getElementById('authP').textContent = 'Register for a new account';
    clearAllErrors();
}

function custLogin(){
    clearAllErrors();
    const emailVal = VALIDATORS.email(document.getElementById('lEmail').value);
    const passVal = VALIDATORS.password(document.getElementById('lPass').value);
    
    if(!emailVal.ok){
        showFieldError('lEmail', emailVal.msg);
        return;
    }
    if(!passVal.ok){
        showFieldError('lPass', passVal.msg);
        return;
    }
    
    const c = gC().find(x => x.email === emailVal.value && x.password === passVal.value);
    if(c){
        localStorage.setItem('bst_u', JSON.stringify(c));
        closeOv('authOverlay');
        toast(`Welcome back, ${c.name}!`);
        setLoginUI(c);
    } else {
        toast('Invalid email or password!', 'e');
        showFieldError('lPass', 'Invalid credentials');
    }
}

function custRegister(){
    clearAllErrors();
    
    const validation = validateForm([
        {id:'rName', validator:'name'},
        {id:'rEmail', validator:'email'},
        {id:'rPhone', validator:'phone'},
        {id:'rPass', validator:'password'}
    ]);
    
    if(!validation.valid) return;
    
    // Address is optional but if provided, validate it
    const addrVal = document.getElementById('rAddr').value.trim();
    let addrFinal = '';
    if(addrVal){
        const aRes = VALIDATORS.address(addrVal);
        if(!aRes.ok){
            showFieldError('rAddr', aRes.msg);
            return;
        }
        addrFinal = aRes.value;
    }
    
    const cs = gC();
    if(cs.find(c => c.email === validation.values.rEmail)){
        showFieldError('rEmail', 'Email already registered');
        return;
    }
    
    const nc = {
        id: cs.length + 1,
        name: validation.values.rName,
        email: validation.values.rEmail,
        phone: validation.values.rPhone,
        password: validation.values.rPass,
        address: addrFinal,
        orders: [],
        totalSpent: 0,
        joinedDate: new Date().toISOString()
    };
    cs.push(nc);
    sC(cs);
    localStorage.setItem('bst_u', JSON.stringify(nc));
    closeOv('authOverlay');
    toast(`Welcome to Bestow, ${nc.name}!`);
    setLoginUI(nc);
}

function setLoginUI(c){
    const b = document.getElementById('custLoginBtn');
    if(b && c){
        b.innerHTML = `<i class="fas fa-user-check"></i> <span class="btn-label">${c.name.split(' ')[0]}</span>`;
        b.onclick = function(){
            if(confirm('Logout?')){
                localStorage.removeItem('bst_u');
                b.innerHTML = '<i class="fas fa-user"></i> <span class="btn-label">Login</span>';
                b.onclick = () => showAuth('customer');
                toast('Logged out');
            }
        };
    }
}

function chkLogin(){
    const c = JSON.parse(localStorage.getItem('bst_u'));
    if(c) setLoginUI(c);
}

function togEye(id, btn){
    const i = document.getElementById(id);
    const ic = btn.querySelector('i');
    if(i.type === 'password'){
        i.type = 'text';
        ic.className = 'fas fa-eye-slash';
    } else {
        i.type = 'password';
        ic.className = 'fas fa-eye';
    }
}

// ============================================
// ADMIN PANEL
// ============================================
function admLogin(){
    const u = document.getElementById('aUser').value.trim();
    const p = document.getElementById('aPass').value;
    const c = document.getElementById('aCode').value.trim();
    
    if(u === 'admin' && p === 'admin123' && c === 'BESTOW2024'){
        closeOv('authOverlay');
        refreshAdm();
        openOv('adminOverlay');
        toast('Welcome, Admin!');
    } else {
        toast('Invalid credentials!', 'e');
    }
}

function admTab(t, btn){
    document.querySelectorAll('.adm-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.adm-nav').forEach(b => b.classList.remove('active'));
    document.getElementById('pane-' + t)?.classList.add('active');
    btn.classList.add('active');
    
    if(t === 'overview') refreshOvw();
    if(t === 'a-products') refreshAP();
    if(t === 'a-orders') refreshAO();
    if(t === 'a-customers') refreshAC();
    if(t === 'a-analytics') refreshAna();
}

function refreshAdm(){
    refreshOvw();
    refreshAP();
    refreshAO();
    refreshAC();
    refreshAna();
}

function refreshOvw(){
    const o = gO(), p = gP(), c = gC();
    document.getElementById('dsRev').textContent = '₹' + o.reduce((s, x) => s + (x.total || 0), 0).toLocaleString();
    document.getElementById('dsOrd').textContent = o.length;
    document.getElementById('dsProd').textContent = p.length;
    document.getElementById('dsCust').textContent = c.length;
    
    const rc = o.slice(-5).reverse();
    document.getElementById('recentOrdTb').innerHTML = rc.map(x => {
        const pm = {'razorpay':'Online', 'upi':'UPI', 'cod':'COD'};
        return `<tr><td><strong>${x.id}</strong></td><td>${x.customer.name}</td><td style="font-weight:700;color:#de2128">₹${x.total.toLocaleString()}</td><td><span class="pi-method">${pm[x.paymentMethod] || x.paymentMethod}</span></td><td><span class="st-badge st-${x.status}">${x.status}</span></td><td>${new Date(x.date).toLocaleDateString()}</td></tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:#999">No orders</td></tr>';
}

function refreshAP(){
    const ps = gP();
    document.getElementById('admProdTb').innerHTML = ps.map(p => {
        const ic = CATS[p.category]?.icon || 'fa-gift';
        const im = p.image ? `<img src="${p.image}" alt="" onerror="this.outerHTML='<i class=\\'fas ${ic}\\'></i>'">` : `<i class="fas ${ic}"></i>`;
        return `<tr><td><div class="p-thumb">${im}</div></td><td><strong>${p.name}</strong></td><td>${CATS[p.category]?.name || p.category}</td><td style="font-weight:700;color:#de2128">₹${p.price}</td><td>${p.stock}</td><td><div class="tbl-acts"><button class="be" onclick="editProd(${p.id})"><i class="fas fa-edit"></i> Edit</button><button class="bd" onclick="delProd(${p.id})"><i class="fas fa-trash"></i></button></div></td></tr>`;
    }).join('');
}

function showProdForm(){
    document.getElementById('prodFormBox').style.display = 'block';
    document.getElementById('pfTitle').textContent = 'Add New Product';
    document.getElementById('pfId').value = '';
    document.getElementById('prodForm').reset();
    document.getElementById('pfStock').value = '10';
    document.getElementById('pfRate').value = '4.5';
}

function hideProdForm(){
    document.getElementById('prodFormBox').style.display = 'none';
}

function editProd(id){
    const p = gP().find(x => x.id === id);
    if(!p) return;
    document.getElementById('prodFormBox').style.display = 'block';
    document.getElementById('pfTitle').textContent = 'Edit Product';
    document.getElementById('pfId').value = id;
    document.getElementById('pfName').value = p.name;
    document.getElementById('pfCat').value = p.category;
    document.getElementById('pfPrice').value = p.price;
    document.getElementById('pfOrig').value = p.originalPrice || '';
    document.getElementById('pfDesc').value = p.description;
    document.getElementById('pfImg').value = p.image || '';
    document.getElementById('pfStock').value = p.stock;
    document.getElementById('pfRate').value = p.rating;
    document.getElementById('pfFeat').checked = p.featured;
    document.getElementById('pfBest').checked = p.bestseller;
    document.getElementById('pfNew').checked = p.newArrival;
}

function saveProd(e){
    e.preventDefault();
    const ps = gP();
    const eid = document.getElementById('pfId').value;
    const d = {
        name: document.getElementById('pfName').value,
        category: document.getElementById('pfCat').value,
        price: +document.getElementById('pfPrice').value,
        originalPrice: +document.getElementById('pfOrig').value || null,
        description: document.getElementById('pfDesc').value,
        image: document.getElementById('pfImg').value || '',
        stock: +document.getElementById('pfStock').value,
        rating: +document.getElementById('pfRate').value,
        featured: document.getElementById('pfFeat').checked,
        bestseller: document.getElementById('pfBest').checked,
        newArrival: document.getElementById('pfNew').checked
    };
    
    if(eid){
        const i = ps.findIndex(p => p.id === +eid);
        if(i !== -1) ps[i] = {...ps[i], ...d};
        toast('Updated!');
    } else {
        d.id = ps.reduce((m, p) => Math.max(m, p.id), 0) + 1;
        ps.push(d);
        toast('Added!');
    }
    sP(ps);
    hideProdForm();
    refreshAP();
    renderProds();
}

function delProd(id){
    if(!confirm('Delete?')) return;
    sP(gP().filter(p => p.id !== id));
    refreshAP();
    renderProds();
    toast('Deleted');
}

function refreshAO(f='all'){
    let os = gO();
    if(f !== 'all') os = os.filter(o => o.status === f);
    const pm = {'razorpay':'Razorpay', 'upi':'UPI', 'cod':'COD'};
    
    document.getElementById('admOrdTb').innerHTML = os.map(o => `<tr>
        <td><strong>${o.id}</strong></td>
        <td><strong>${o.customer.name}</strong><br><small style="color:#999">${o.customer.phone}</small></td>
        <td>${o.items.map(i => `${i.name} ×${i.quantity}`).join('<br>')}</td>
        <td style="font-weight:700;color:#de2128">₹${o.total.toLocaleString()}</td>
        <td class="pay-info-cell"><span class="pi-method">${pm[o.paymentMethod] || o.paymentMethod}</span>${o.paymentId ? `<br><span class="pi-id">${o.paymentId}</span>` : ''}</td>
        <td><span class="st-badge st-${o.status}">${o.status}</span></td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>
            <select onchange="updOrdSt('${o.id}',this.value)" style="padding:5px;border-radius:6px;border:1px solid #ddd;font-size:11px;font-family:'Poppins',sans-serif;width:100%;margin-bottom:5px">
                ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
            </select>
            <button onclick="resendWA('${o.id}')" style="padding:4px 8px;background:#25D366;color:white;border:none;border-radius:5px;font-size:10px;cursor:pointer;width:100%;font-family:'Poppins',sans-serif"><i class="fab fa-whatsapp"></i> WA</button>
        </td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:#999">No orders</td></tr>';
}

function admOrdFilt(s, btn){
    document.querySelectorAll('#ordFiltBar .fbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    refreshAO(s);
}

function updOrdSt(oid, ns){
    const os = gO();
    const o = os.find(x => x.id === oid);
    if(o){
        o.status = ns;
        const descs = {
            pending: 'Order received',
            confirmed: 'Confirmed',
            processing: 'Being prepared',
            shipped: 'Shipped',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        const sl = ['pending','confirmed','processing','shipped','delivered'];
        const si = sl.indexOf(ns);
        if(!o.tracking) o.tracking = [];
        if(si >= 0){
            for(let i = 0; i <= si; i++){
                if(!o.tracking[i]){
                    o.tracking[i] = {
                        status: sl[i],
                        date: new Date().toISOString(),
                        description: descs[sl[i]]
                    };
                }
            }
        }
        sO(os);
        refreshOvw();
        toast(`${oid} → ${ns}`);
    }
}

function refreshAC(){
    const cs = gC();
    document.getElementById('admCustTb').innerHTML = cs.map(c => `<tr><td><strong>${c.name}</strong></td><td>${c.email}</td><td>${c.phone}</td><td style="font-weight:700">${(c.orders||[]).length}</td><td style="font-weight:700;color:#de2128">₹${(c.totalSpent||0).toLocaleString()}</td><td>${c.joinedDate ? new Date(c.joinedDate).toLocaleDateString() : 'N/A'}</td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#999">No customers</td></tr>';
}

function refreshAna(){
    const os = gO(), ps = gP();
    const cs = {};
    os.forEach(o => o.items.forEach(item => {
        const p = ps.find(x => x.id === item.productId);
        if(p){
            const cn = CATS[p.category]?.name || p.category;
            cs[cn] = (cs[cn] || 0) + item.quantity;
        }
    }));
    
    const mx = Math.max(...Object.values(cs), 1);
    document.getElementById('anaCatBars').innerHTML = Object.entries(cs).map(([c, n]) => `<div class="br-row"><span class="br-lbl">${c}</span><div class="br-trk"><div class="br-fill" style="width:${n/mx*100}%"></div></div><span class="br-val">${n}</span></div>`).join('') || '<p style="color:#999;text-align:center">No data</p>';
    
    const sc = {};
    const colors = {
        pending: '#FF9800',
        confirmed: '#2196F3',
        processing: '#9C27B0',
        shipped: '#00BCD4',
        delivered: '#4CAF50',
        cancelled: '#F44336'
    };
    os.forEach(o => sc[o.status] = (sc[o.status] || 0) + 1);
    document.getElementById('anaStatus').innerHTML = Object.entries(sc).map(([s, n]) => `<div class="st-row"><div class="st-dot" style="background:${colors[s]||'#999'}"></div><span class="st-nm">${s.charAt(0).toUpperCase()+s.slice(1)}</span><span class="st-ct">${n}</span></div>`).join('') || '<p style="color:#999;text-align:center">No data</p>';
}

// ============================================
// MODAL HELPERS
// ============================================
function openOv(id){
    document.getElementById(id).classList.add('on');
    document.body.style.overflow = 'hidden';
}

function closeOv(id){
    document.getElementById(id).classList.remove('on');
    document.body.style.overflow = '';
    clearAllErrors();
}

document.querySelectorAll('.overlay').forEach(ov => ov.addEventListener('click', function(e){
    if(e.target === this){
        this.classList.remove('on');
        document.body.style.overflow = '';
        clearAllErrors();
    }
}));

// ============================================
// TOAST NOTIFICATION
// ============================================
function toast(msg, type){
    const t = document.getElementById('toastEl');
    t.querySelector('.toast-ic').className = 'toast-ic fas ' + (type === 'e' ? 'fa-exclamation-circle err' : 'fa-check-circle');
    t.querySelector('.toast-tx').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================
// CONTACT FORM (WITH VALIDATION)
// ============================================
function sendContact(e){
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea');
    
    const name = inputs[0].value.trim();
    const phone = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const subject = inputs[3].value.trim();
    const message = inputs[4].value.trim();
    
    // Validate name
    const nameRes = VALIDATORS.name(name);
    if(!nameRes.ok){
        toast(nameRes.msg, 'e');
        inputs[0].focus();
        return;
    }
    
    // Validate phone
    const phoneRes = VALIDATORS.phone(phone);
    if(!phoneRes.ok){
        toast(phoneRes.msg, 'e');
        inputs[1].focus();
        return;
    }
    
    // Validate email
    const emailRes = VALIDATORS.email(email);
    if(!emailRes.ok){
        toast(emailRes.msg, 'e');
        inputs[2].focus();
        return;
    }
    
    // Validate subject
    if(!subject || subject.length < 3){
        toast('Please enter a subject (min 3 chars)', 'e');
        inputs[3].focus();
        return;
    }
    
    // Validate message
    if(!message || message.length < 10){
        toast('Message too short (min 10 chars)', 'e');
        inputs[4].focus();
        return;
    }
    
    toast('Message sent! We\'ll get back to you soon.');
    form.reset();
}
