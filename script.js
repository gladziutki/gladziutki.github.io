// --- BEGIN AUTHENTICATION AND USER MANAGEMENT ---

// User data (in a real app, this would come from a backend)
const users = [
    { id: 1, username: 'admin1', password: 'password', isAdmin: true },
    { id: 2, username: 'admin2', password: 'password', isAdmin: true },
    { id: 3, username: 'user1', password: 'password', isAdmin: false },
    { id: 4, username: 'user2', password: 'password', isAdmin: false }
];

const AUTH_STORAGE_KEY = 'loggedInUser';

function login(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Always redirect to index.html on logout, which will then update its UI
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

function getAllUsers() {
    // In a real app, ensure only admins can call this or it's on a secure endpoint
    return users;
}

function displayUserInfo() {
    const currentUser = getCurrentUser();
    const userInfoDiv = document.getElementById('userInfo'); // For index.html header
    const userInfoAdminDiv = document.getElementById('userInfoAdmin'); // For admin.html header
    
    // Elements on index.html that change based on login state
    const addNoticeBtnElement = document.getElementById('addNoticeBtn');
    const adminLinkElement = document.getElementById('adminLink');

    if (currentUser) {
        // Logged IN state
        const welcomeMessage = `Witaj, <span>${currentUser.username}</span>!`;
        const logoutButtonHTML = `<button onclick="logout()" class="btn btn-secondary">Wyloguj</button>`;

        if (userInfoDiv) { // Handling for index.html header
            userInfoDiv.innerHTML = `${welcomeMessage} ${logoutButtonHTML}`;
            if (addNoticeBtnElement) addNoticeBtnElement.style.display = 'inline-block'; // Show "Dodaj ofertę"
            if (adminLinkElement) { // Show/Hide "Panel Admina"
                adminLinkElement.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
            }
        }
        if (userInfoAdminDiv) { // Handling for admin.html header
            userInfoAdminDiv.innerHTML = `${welcomeMessage} ${logoutButtonHTML}`;
        }
    } else { 
        // Logged OUT state
        if (userInfoDiv) { // Handling for index.html header
            userInfoDiv.innerHTML = `<button id="showLoginModalBtn" class="btn btn-primary">Zaloguj się</button>`;
            // Add event listener for the dynamically created login button
            const newLoginBtn = document.getElementById('showLoginModalBtn');
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', () => {
                    const loginModal = document.getElementById('loginModal'); // The new modal on index.html
                    if (loginModal) loginModal.style.display = 'block';
                });
            }
            if (addNoticeBtnElement) addNoticeBtnElement.style.display = 'none'; // Hide "Dodaj ofertę"
            if (adminLinkElement) adminLinkElement.style.display = 'none'; // Hide "Panel Admina"
        }
        if (userInfoAdminDiv) { // For admin.html (user should be redirected anyway)
            userInfoAdminDiv.innerHTML = '';
        }
    }
}

function checkAuth() {
    const currentUser = getCurrentUser();
    // Get current page filename, default to 'index.html' if path is '/' or empty
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; 

    // If trying to access admin.html
    if (currentPage === 'admin.html') {
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = 'index.html'; // Redirect to index, login will be prompted there if needed
            return false; // Stop further script execution
        }
    }

    // If logged in and on the (now obsolete) login.html, redirect to index.html
    if (currentUser && currentPage === 'login.html') {
        window.location.href = 'index.html';
        return false; // Stop further script execution
    }
    
    // For all pages (including index.html, whether logged in or not), update the UI.
    // displayUserInfo will handle showing login button or user info.
    displayUserInfo();
    return true; 
}

// --- END AUTHENTICATION AND USER MANAGEMENT ---

// --- BEGIN COMMENT MANAGEMENT ---
let comments = [];
const COMMENTS_STORAGE_KEY = 'propertyComments';

function loadComments() {
    const storedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (storedComments) {
        try {
            comments = JSON.parse(storedComments);
        } catch (e) {
            console.error("Error parsing comments from localStorage:", e);
            comments = []; // Fallback to empty array
        }
    } else {
        comments = []; // Initialize if nothing in storage
    }
}

function saveComments() {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
}

function addComment(propertyId, userId, username, text) {
    const newComment = {
        commentId: `comment_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`, // Unique ID
        propertyId: parseInt(propertyId), // Ensure propertyId is a number
        userId: parseInt(userId),         // Ensure userId is a number
        username: username,
        text: text,
        timestamp: new Date().toISOString()
    };
    comments.push(newComment);
    saveComments();
    return newComment;
}

function getCommentsForProperty(propertyId) {
    const numPropertyId = parseInt(propertyId); // Ensure comparison with number
    return comments
        .filter(comment => comment.propertyId === numPropertyId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first
}

// --- END COMMENT MANAGEMENT ---


// Dane nieruchomości - wczytywane z localStorage lub domyślne
let properties = [];

const defaultProperties = [
    {
        id: 1,
        title: "Mieszkanie 3-pokojowe w centrum Warszawy",
        category: "sprzedaz",
        propertyType: "mieszkanie",
        price: 750000,
        area: 65,
        rooms: 3,
        location: "Warszawa, Śródmieście",
        content: "Piękne mieszkanie w zabytkowej kamienicy po pełnym remoncie. Wysokie sufity, duże okna, nowoczesne wykończenie. W pobliżu metro, sklepy i restauracje.",
        contact: "anna.kowalska@email.pl | tel. 123-456-789",
        date: "2025-05-18",
        expiry: "2025-07-18",
        imageUrl: "images/Mieszkanie.jpg"
    },
    {
        id: 2,
        title: "Dom jednorodzinny z ogrodem",
        category: "sprzedaz",
        propertyType: "dom",
        price: 950000,
        area: 180,
        rooms: 5,
        location: "Kraków, Bronowice",
        content: "Przestronny dom z ogrodem 800m². Doskonały dla rodziny. Garaż na 2 samochody, taras, nowoczesna kuchnia. Cisza i spokój przy dobrej komunikacji z centrum.",
        contact: "sprzedaz@domkrakow.pl | tel. 987-654-321",
        date: "2025-05-19",
        expiry: "2025-08-19",
        imageUrl: "images/Dom.jpg"
    },
    {
        id: 3,
        title: "Kawalerka do wynajęcia - Gdańsk",
        category: "wynajem",
        propertyType: "mieszkanie",
        price: 2200,
        area: 28,
        rooms: 1,
        location: "Gdańsk, Wrzeszcz",
        content: "Przytulna kawalerka w doskonałej lokalizacji. Umeblowana, z aneksem kuchennym. Blisko Politechniki Gdańskiej i centrum handlowego.",
        contact: "wynajem.gdansk@email.pl | tel. 555-123-456",
        date: "2025-05-20",
        expiry: "2025-06-20",
        imageUrl: "images/Mieszkanie.jpg"
    },
    {
        id: 4,
        title: "Działka budowlana - Konstancin",
        category: "sprzedaz",
        propertyType: "dzialka",
        price: 320000,
        area: 1200,
        rooms: 0,
        location: "Konstancin-Jeziorna",
        content: "Działka budowlana w prestiżowej dzielnicy. Media na granicy działki. Idealna pod dom jednorodzinny. Cisza, zieleń, dobra komunikacja z Warszawą.",
        contact: "nieruchomosci@konstancin.pl | tel. 333-222-111",
        date: "2025-05-17",
        expiry: "2025-09-17",
        imageUrl: "images/Dom.jpg"
    },
    {
        id: 5,
        title: "Lokal użytkowy w centrum Wrocławia",
        category: "wynajem",
        propertyType: "lokal",
        price: 8500,
        area: 85,
        rooms: 0,
        location: "Wrocław, Stare Miasto",
        content: "Reprezentacyjny lokal w centrum miasta. Idealny na biuro, salon kosmetyczny lub sklep. Duże witryny, klimatyzacja, parking w pobliżu.",
        contact: "biuro@wroclaw-lokale.pl | tel. 444-555-666",
        date: "2025-05-21",
        expiry: "2025-07-21",
        imageUrl: "images/Dom.jpg"
    },
    {
        id: 6,
        title: "Mieszkanie 2-pokojowe z balkonem",
        category: "wynajem",
        propertyType: "mieszkanie",
        price: 3200,
        area: 48,
        rooms: 2,
        location: "Poznań, Grunwald",
        content: "Słoneczne mieszkanie z balkonem w nowym budownictwie. Umeblowane, z miejscem parkingowym. Blisko komunikacji miejskiej i sklepów.",
        contact: "mieszkanie.poznan@email.pl | tel. 111-222-333",
        date: "2025-05-16",
        expiry: "2025-06-16",
        imageUrl: "images/Mieszkanie.jpg"
    }
];

// Elementy DOM
const propertyBoard = document.getElementById('propertyBoard');
const addNoticeBtn = document.getElementById('addNoticeBtn');
const propertyModal = document.getElementById('propertyModal');
const closeModal = document.querySelector('.close');
const propertyForm = document.getElementById('propertyForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryLinks = document.querySelectorAll('.categories li');
const propertyTypeFilter = document.getElementById('propertyType');
const priceRangeFilter = document.getElementById('priceRange');
const roomCountFilter = document.getElementById('roomCount');

// Wyświetlanie nieruchomości
function displayProperties(propertiesArray) {
    propertyBoard.innerHTML = '';
    
    if (propertiesArray.length === 0) {
        propertyBoard.innerHTML = '<p class="no-results">Nie znaleziono żadnych ofert.</p>';
        return;
    }
    
    propertiesArray.forEach(property => {
        const propertyElement = document.createElement('div');
        propertyElement.className = 'property';
        propertyElement.dataset.category = property.category;
        propertyElement.dataset.id = property.id; // Add property ID
        
        // Sprawdzenie czy oferta wygasła
        const today = new Date();
        const expiryDate = new Date(property.expiry);
        const isExpired = today > expiryDate;
        
        if (isExpired) {
            propertyElement.classList.add('expired');
        }
        
        // Formatowanie ceny
        const formattedPrice = property.category === 'wynajem' 
            ? `${property.price.toLocaleString('pl-PL')} zł/miesiąc`
            : `${property.price.toLocaleString('pl-PL')} zł`;
        
        propertyElement.innerHTML = `
            <img src="${property.imageUrl}" alt="${property.title}" class="property-image">
            <div class="property-header">
                <h3 class="property-title">${property.title}</h3>
                <span class="property-category ${property.category}">${getCategoryName(property.category)}</span>
            </div>
            <div class="property-price">${formattedPrice}</div>
            <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</div>
            
            <div class="property-info">
                <div class="property-info-item">
                    <i class="fas fa-expand-arrows-alt"></i>
                    ${property.area} m²
                </div>
                ${property.rooms > 0 ? `
                <div class="property-info-item">
                    <i class="fas fa-bed"></i>
                    ${property.rooms} ${property.rooms === 1 ? 'pokój' : property.rooms < 5 ? 'pokoje' : 'pokoi'}
                </div>` : ''}
                <div class="property-info-item">
                    <i class="fas fa-home"></i>
                    ${getPropertyTypeName(property.propertyType)}
                </div>
                <div class="property-info-item">
                    <i class="fas fa-calculator"></i>
                    ${Math.round(property.price / property.area).toLocaleString('pl-PL')} zł/m²
                </div>
            </div>
            
            <div class="property-content">
                ${property.content}
            </div>
            <div class="property-details">
                <div class="property-contact">
                    <strong>Kontakt:</strong> ${property.contact}
                </div>
                <div class="property-expiry">
                    <strong>Data ważności:</strong> ${formatDate(property.expiry)}
                    ${isExpired ? '<span class="expired-label">Wygasła</span>' : ''}
                </div>
            </div>
        `;
        
        // Add click event listener to redirect to details page
        propertyElement.addEventListener('click', () => {
            window.location.href = `details.html?id=${property.id}`;
        });
        
        propertyBoard.appendChild(propertyElement);
    });
}

// Formatowanie daty
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', options);
}

// Pobranie nazwy kategorii
function getCategoryName(categorySlug) {
    const categories = {
        'sprzedaz': 'Sprzedaż',
        'wynajem': 'Wynajem'
    };
    
    return categories[categorySlug] || categorySlug;
}

// Pobranie nazwy typu nieruchomości
function getPropertyTypeName(typeSlug) {
    const types = {
        'mieszkanie': 'Mieszkanie',
        'dom': 'Dom',
        'dzialka': 'Działka',
        'lokal': 'Lokal',
        'garaz': 'Garaż'
    };
    
    return types[typeSlug] || typeSlug;
}

// Obsługa dodawania nowej oferty
function addNewProperty(e) {
    e.preventDefault();
    
    const title = document.getElementById('propertyTitle').value;
    const category = document.getElementById('propertyCategory').value;
    const propertyType = document.getElementById('propertyTypeForm').value;
    const price = parseInt(document.getElementById('propertyPrice').value);
    const area = parseInt(document.getElementById('propertyArea').value);
    const rooms = parseInt(document.getElementById('propertyRooms').value) || 0;
    const location = document.getElementById('propertyLocation').value;
    const content = document.getElementById('propertyContent').value;
    const contact = document.getElementById('propertyContact').value;
    const expiry = document.getElementById('propertyExpiry').value;
    const imageFile = document.getElementById('propertyImage').files[0];

    const getDefaultImageUrl = (propType) => {
        return propType === 'mieszkanie' ? "images/Mieszkanie.jpg" : "images/Dom.jpg";
    };

    const getNextId = () => {
        if (properties.length === 0) {
            return 1;
        }
        return Math.max(...properties.map(p => p.id)) + 1;
    };

    const createPropertyObject = (imageUrl) => {
        return {
            id: getNextId(),
            title,
            category,
            propertyType, // This is the propertyType from the form
            price,
            area,
            rooms,
            location,
            content,
            contact,
            date: new Date().toISOString().split('T')[0],
            expiry,
            imageUrl: imageUrl
        };
    };

    const finalizePropertyAddition = (property) => {
        properties.unshift(property); // Dodaj na początek tablicy
        localStorage.setItem('propertyListings', JSON.stringify(properties)); // Zapisz w localStorage
        applyFilters();
        propertyModal.style.display = 'none';
        propertyForm.reset();
        alert('Oferta została dodana pomyślnie!');
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newProperty = createPropertyObject(e.target.result); // Use uploaded image
            finalizePropertyAddition(newProperty);
        }
        reader.readAsDataURL(imageFile);
    } else {
        const newProperty = createPropertyObject(getDefaultImageUrl(propertyType)); // Use default based on propertyType
        finalizePropertyAddition(newProperty);
    }
}

// Filtrowanie nieruchomości według kategorii
function filterByCategory(category) {
    if (category === 'all') {
        return properties;
    } else {
        return properties.filter(property => property.category === category);
    }
}

// Filtrowanie według typu nieruchomości
function filterByPropertyType(propertiesArray, type) {
    if (type === 'all') {
        return propertiesArray;
    }
    return propertiesArray.filter(property => property.propertyType === type);
}

// Filtrowanie według ceny
function filterByPrice(propertiesArray, priceRange) {
    if (priceRange === 'all') {
        return propertiesArray;
    }
    
    const [min, max] = priceRange.split('-').map(Number);
    return propertiesArray.filter(property => 
        property.price >= min && property.price <= max
    );
}

// Filtrowanie według liczby pokoi
function filterByRooms(propertiesArray, roomCount) {
    if (roomCount === 'all') {
        return propertiesArray;
    }
    
    if (roomCount === '5+') {
        return propertiesArray.filter(property => property.rooms >= 5);
    }
    
    return propertiesArray.filter(property => property.rooms === parseInt(roomCount));
}

// Zastosowanie wszystkich filtrów
function applyFilters() {
    const activeCategory = document.querySelector('.categories li.active').dataset.category;
    const selectedPropertyType = propertyTypeFilter.value;
    const selectedPriceRange = priceRangeFilter.value;
    const selectedRoomCount = roomCountFilter.value;
    
    let filteredProperties = filterByCategory(activeCategory);
    filteredProperties = filterByPropertyType(filteredProperties, selectedPropertyType);
    
    if (selectedPriceRange !== 'all') {
        filteredProperties = filterByPrice(filteredProperties, selectedPriceRange);
    }
    
    if (selectedRoomCount !== 'all') {
        filteredProperties = filterByRooms(filteredProperties, selectedRoomCount);
    }
    
    displayProperties(filteredProperties);
}

// Wyszukiwanie nieruchomości
function searchProperties() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        applyFilters();
        return;
    }
    
    const searchResults = properties.filter(property => {
        return (
            property.title.toLowerCase().includes(searchTerm) ||
            property.content.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm) ||
            getPropertyTypeName(property.propertyType).toLowerCase().includes(searchTerm)
        );
    });
    
    displayProperties(searchResults);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const authPassed = checkAuth(); // Perform auth check first
    if (!authPassed) return; // If auth check redirects, stop further processing

    loadComments(); // Load comments on DOMContentLoaded

    // Handle login form submission (now in a modal on index.html)
    const loginFormInModal = document.getElementById('loginFormInModal'); // ID of form in the new modal
    if (loginFormInModal) {
        loginFormInModal.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const user = login(username, password);
            const errorMessageDiv = document.getElementById('loginModalErrorMessage'); // Error message div in modal
            
            if (user) {
                if(errorMessageDiv) errorMessageDiv.textContent = '';
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none'; // Close modal
                displayUserInfo(); // Refresh header UI
                // No redirect needed if already on index.html, UI updates handle it.
            } else {
                if(errorMessageDiv) errorMessageDiv.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło.';
            }
        });
    }

    // Logic for the old login.html page (can be removed if login.html is deleted)
    const oldLoginForm = document.getElementById('loginForm'); // This is the ID from the original login.html
    if (oldLoginForm && window.location.pathname.endsWith('login.html')) { // Only run if on login.html
        oldLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const user = login(username, password);
            const errorMessageDiv = document.getElementById('loginErrorMessage');
            if (user) {
                if(errorMessageDiv) errorMessageDiv.textContent = '';
                window.location.href = 'index.html'; 
            } else {
                if(errorMessageDiv) errorMessageDiv.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło.';
            }
        });
    }

    // Handle admin page logic on admin.html
    const adminPanelContainer = document.getElementById('adminPanelContainer');
    const accessDeniedMessage = document.getElementById('accessDeniedMessage');
    const userListTableBody = document.getElementById('userListTableBody');

    if (window.location.pathname.endsWith('admin.html')) {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.isAdmin) {
            if (adminPanelContainer) adminPanelContainer.style.display = 'block';
            if (accessDeniedMessage) accessDeniedMessage.style.display = 'none';
            
            if (userListTableBody) {
                const allUsers = getAllUsers();
                userListTableBody.innerHTML = ''; // Clear existing rows
                allUsers.forEach(user => {
                    const row = userListTableBody.insertRow();
                    row.insertCell().textContent = user.username;
                    const roleCell = row.insertCell();
                    roleCell.textContent = user.isAdmin ? 'Administrator' : 'Użytkownik';
                    roleCell.className = user.isAdmin ? 'role-admin' : 'role-user';
                    row.insertCell().textContent = user.id;
                });
            }
        } else {
            if (adminPanelContainer) adminPanelContainer.style.display = 'none';
            if (accessDeniedMessage) accessDeniedMessage.style.display = 'block';
            // Optional: redirect to login if not admin, handled by checkAuth already
            // if (!currentUser) window.location.href = 'login.html';
        }
    }


    // Wczytaj nieruchomości z localStorage lub użyj domyślnych
    // This part only runs if on a page that needs properties (e.g., index.html)
    const propertyBoardElement = document.getElementById('propertyBoard');
    if (propertyBoardElement) { // Check if propertyBoard exists on the current page
        const storedProperties = localStorage.getItem('propertyListings');
    if (storedProperties) {
        try {
            properties = JSON.parse(storedProperties);
            // Ensure IDs are correctly set if we load from localStorage, especially if it was empty or corrupted
            if (!properties || properties.length === 0) {
                properties = [...defaultProperties];
                localStorage.setItem('propertyListings', JSON.stringify(properties));
            }
        } catch (e) {
            console.error("Error parsing properties from localStorage:", e);
            properties = [...defaultProperties]; // Fallback to default
            localStorage.setItem('propertyListings', JSON.stringify(properties));
        }
    } else {
        properties = [...defaultProperties];
        localStorage.setItem('propertyListings', JSON.stringify(properties));
    }

        // Wyświetl wszystkie nieruchomości na start
        displayProperties(properties);
    }
    
    // Ustaw minimalną datę dla pola wyboru daty wygaśnięcia
    const propertyExpiryInput = document.getElementById('propertyExpiry');
    if (propertyExpiryInput) {
        const today = new Date().toISOString().split('T')[0];
        propertyExpiryInput.min = today;
    }
});

// Obsługa modala - ensure these elements exist before adding listeners
if (addNoticeBtn) {
    addNoticeBtn.addEventListener('click', () => {
        propertyModal.style.display = 'block';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        propertyModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (propertyModal && e.target === propertyModal) {
        propertyModal.style.display = 'none';
    }
});

// Obsługa formularza - ensure this element exists
if (propertyForm) {
    propertyForm.addEventListener('submit', addNewProperty);
}

// Obsługa wyszukiwania
searchBtn.addEventListener('click', searchProperties);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchProperties();
    }
});

// Obsługa kategorii - ensure these elements exist
if (categoryLinks && categoryLinks.length > 0) {
    categoryLinks.forEach(link => {
        link.addEventListener('click', () => {
            categoryLinks.forEach(cat => cat.classList.remove('active'));
            link.classList.add('active');
            applyFilters();
        });
    });
}

// Obsługa filtrów - ensure these elements exist
if (propertyTypeFilter) propertyTypeFilter.addEventListener('change', applyFilters);
if (priceRangeFilter) priceRangeFilter.addEventListener('change', applyFilters);
if (roomCountFilter) roomCountFilter.addEventListener('change', applyFilters);
