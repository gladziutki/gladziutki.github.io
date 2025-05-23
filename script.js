// --- BEGIN AUTHENTICATION AND USER MANAGEMENT ---

const USERS_STORAGE_KEY = 'portalUsers';
const AUTH_STORAGE_KEY = 'loggedInUser';

let users = []; // Will be loaded from localStorage

// Default users if localStorage is empty
const defaultUsers = [
    { id: 1, username: 'admin1', password: 'password', role: 'admin' },
    { id: 2, username: 'admin2', password: 'password', role: 'admin' },
    { id: 3, username: 'user1', password: 'password', role: 'user' },
    { id: 4, username: 'user2', password: 'password', role: 'user' }
];

function loadUsers() {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        try {
            users = JSON.parse(storedUsers);
            if (!users || users.length === 0) { // Handle empty or corrupted storage
                users = [...defaultUsers];
                saveUsers();
            }
        } catch (e) {
            console.error("Error parsing users from localStorage:", e);
            users = [...defaultUsers]; // Fallback to default
            saveUsers();
        }
    } else {
        users = [...defaultUsers];
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function generateUserId() {
    if (users.length === 0) {
        return 1;
    }
    return Math.max(...users.map(u => u.id)) + 1;
}

function login(username, password) {
    loadUsers(); // Ensure users are loaded
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

function getAllUsers() {
    loadUsers(); // Ensure users are loaded before returning
    return users;
}

function displayUserInfo() {
    const currentUser = getCurrentUser();
    const userInfoDiv = document.getElementById('userInfo');
    const userInfoAdminDiv = document.getElementById('userInfoAdmin');
    const addNoticeBtnElement = document.getElementById('addNoticeBtn');
    const adminLinkElement = document.getElementById('adminLink');

    if (currentUser) {
        const welcomeMessage = `Witaj, <span>${currentUser.username}</span>!`;
        const logoutButtonHTML = `<button onclick="logout()" class="btn btn-secondary">Wyloguj</button>`;

        if (userInfoDiv) {
            userInfoDiv.innerHTML = `${welcomeMessage} ${logoutButtonHTML}`;
            if (addNoticeBtnElement) addNoticeBtnElement.style.display = 'inline-block';
            if (adminLinkElement) {
                adminLinkElement.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
            }
        }
        if (userInfoAdminDiv) {
            userInfoAdminDiv.innerHTML = `${welcomeMessage} ${logoutButtonHTML}`;
        }
    } else {
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<button id="showLoginModalBtn" class="btn btn-primary">Zaloguj się</button>`;
            const newLoginBtn = document.getElementById('showLoginModalBtn');
            if (newLoginBtn) {
                newLoginBtn.addEventListener('click', () => {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'block';
                });
            }
            if (addNoticeBtnElement) addNoticeBtnElement.style.display = 'none';
            if (adminLinkElement) adminLinkElement.style.display = 'none';
        }
        if (userInfoAdminDiv) {
            userInfoAdminDiv.innerHTML = '';
        }
    }
}

function checkAuth() {
    loadUsers(); // Ensure users are loaded for auth checks
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'admin.html') {
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
    }

    if (currentUser && currentPage === 'login.html') { // Obsolete login.html
        window.location.href = 'index.html';
        return false;
    }
    
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
    if (!propertyBoard) return; // Guard clause if propertyBoard is not on the page
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
        
        const today = new Date();
        const expiryDate = new Date(property.expiry);
        const isExpired = today > expiryDate;
        
        if (isExpired) {
            propertyElement.classList.add('expired');
        }
        
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
        
        propertyElement.addEventListener('click', () => {
            window.location.href = `details.html?id=${property.id}`;
        });
        
        propertyBoard.appendChild(propertyElement);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', options);
}

function getCategoryName(categorySlug) {
    const categories = {
        'sprzedaz': 'Sprzedaż',
        'wynajem': 'Wynajem'
    };
    return categories[categorySlug] || categorySlug;
}

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
        if (properties.length === 0) return 1;
        return Math.max(...properties.map(p => p.id)) + 1;
    };

    const createPropertyObject = (imageUrl) => ({
        id: getNextId(), title, category, propertyType, price, area, rooms,
        location, content, contact,
        date: new Date().toISOString().split('T')[0],
        expiry, imageUrl
    });

    const finalizePropertyAddition = (property) => {
        properties.unshift(property);
        localStorage.setItem('propertyListings', JSON.stringify(properties));
        if (typeof applyFilters === 'function') applyFilters(); // Check if applyFilters exists
        if (propertyModal) propertyModal.style.display = 'none';
        if (propertyForm) propertyForm.reset();
        alert('Oferta została dodana pomyślnie!');
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            finalizePropertyAddition(createPropertyObject(e.target.result));
        }
        reader.readAsDataURL(imageFile);
    } else {
        finalizePropertyAddition(createPropertyObject(getDefaultImageUrl(propertyType)));
    }
}

function filterByCategory(propertiesArray, category) {
    if (category === 'all') return propertiesArray;
    return propertiesArray.filter(property => property.category === category);
}

function filterByPropertyType(propertiesArray, type) {
    if (type === 'all') return propertiesArray;
    return propertiesArray.filter(property => property.propertyType === type);
}

function filterByPrice(propertiesArray, priceRange) {
    if (priceRange === 'all') return propertiesArray;
    const [min, max] = priceRange.split('-').map(Number);
    return propertiesArray.filter(property => property.price >= min && property.price <= max);
}

function filterByRooms(propertiesArray, roomCount) {
    if (roomCount === 'all') return propertiesArray;
    if (roomCount === '5+') return propertiesArray.filter(property => property.rooms >= 5);
    return propertiesArray.filter(property => property.rooms === parseInt(roomCount));
}

function applyFilters() {
    const activeCategoryElement = document.querySelector('.categories li.active');
    if (!activeCategoryElement) return; // Guard if no active category
    const activeCategory = activeCategoryElement.dataset.category;
    
    const selectedPropertyType = propertyTypeFilter ? propertyTypeFilter.value : 'all';
    const selectedPriceRange = priceRangeFilter ? priceRangeFilter.value : 'all';
    const selectedRoomCount = roomCountFilter ? roomCountFilter.value : 'all';
    
    let filteredProperties = filterByCategory(properties, activeCategory); // Start with all properties
    filteredProperties = filterByPropertyType(filteredProperties, selectedPropertyType);
    if (selectedPriceRange !== 'all') {
        filteredProperties = filterByPrice(filteredProperties, selectedPriceRange);
    }
    if (selectedRoomCount !== 'all') {
        filteredProperties = filterByRooms(filteredProperties, selectedRoomCount);
    }
    displayProperties(filteredProperties);
}

function searchProperties() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    if (searchTerm.trim() === '') {
        if (typeof applyFilters === 'function') applyFilters();
        return;
    }
    const searchResults = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.content.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        getPropertyTypeName(property.propertyType).toLowerCase().includes(searchTerm)
    );
    displayProperties(searchResults);
}

document.addEventListener('DOMContentLoaded', () => {
    const authPassed = checkAuth();
    if (!authPassed) return;

    loadComments();

    const loginFormInModal = document.getElementById('loginFormInModal');
    if (loginFormInModal) {
        loginFormInModal.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const user = login(username, password);
            const errorMessageDiv = document.getElementById('loginModalErrorMessage');
            if (user) {
                if (errorMessageDiv) errorMessageDiv.textContent = '';
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'none';
                displayUserInfo();
            } else {
                if (errorMessageDiv) errorMessageDiv.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło.';
            }
        });
    }

    const oldLoginForm = document.getElementById('loginForm');
    if (oldLoginForm && window.location.pathname.endsWith('login.html')) {
        oldLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const user = login(username, password);
            const errorMessageDiv = document.getElementById('loginErrorMessage');
            if (user) {
                if (errorMessageDiv) errorMessageDiv.textContent = '';
                window.location.href = 'index.html';
            } else {
                if (errorMessageDiv) errorMessageDiv.textContent = 'Nieprawidłowa nazwa użytkownika lub hasło.';
            }
        });
    }

    if (window.location.pathname.endsWith('admin.html')) {
        setupAdminPage();
    }

    // Wczytaj nieruchomości z localStorage lub użyj domyślnych (tylko na stronach z propertyBoard)
    const propertyBoardElement = document.getElementById('propertyBoard');
    if (propertyBoardElement) {
        const storedProperties = localStorage.getItem('propertyListings');
        if (storedProperties) {
            try {
                properties = JSON.parse(storedProperties);
                if (!properties || properties.length === 0) {
                    properties = [...defaultProperties];
                    localStorage.setItem('propertyListings', JSON.stringify(properties));
                }
            } catch (e) {
                console.error("Error parsing properties from localStorage:", e);
                properties = [...defaultProperties];
                localStorage.setItem('propertyListings', JSON.stringify(properties));
            }
        } else {
            properties = [...defaultProperties];
            localStorage.setItem('propertyListings', JSON.stringify(properties));
        }
        displayProperties(properties); // Wyświetl nieruchomości
    }
    
    // Ustaw minimalną datę dla pola wyboru daty wygaśnięcia (tylko na stronach z propertyExpiry)
    const propertyExpiryInput = document.getElementById('propertyExpiry');
    if (propertyExpiryInput) {
        const today = new Date().toISOString().split('T')[0];
        propertyExpiryInput.min = today;
    }

    // Obsługa modala
    if (addNoticeBtn && propertyModal) {
        addNoticeBtn.addEventListener('click', () => {
            propertyModal.style.display = 'block';
        });
    }
    if (closeModal && propertyModal) {
        closeModal.addEventListener('click', () => {
            propertyModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (propertyModal && e.target === propertyModal) {
            propertyModal.style.display = 'none';
        }
    });

    // Obsługa formularza dodawania oferty
    if (propertyForm) {
        propertyForm.addEventListener('submit', addNewProperty);
    }

    // Obsługa wyszukiwania
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', searchProperties);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchProperties();
            }
        });
    }

    // Obsługa kategorii
    if (categoryLinks && categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', () => {
                categoryLinks.forEach(cat => cat.classList.remove('active'));
                link.classList.add('active');
                if (typeof applyFilters === 'function') applyFilters();
            });
        });
    }

    // Obsługa filtrów
    if (propertyTypeFilter) propertyTypeFilter.addEventListener('change', applyFilters);
    if (priceRangeFilter) priceRangeFilter.addEventListener('change', applyFilters);
    if (roomCountFilter) roomCountFilter.addEventListener('change', applyFilters);
});

// Funkcje specyficzne dla panelu admina
function setupAdminPage() {
    const adminPanelContainer = document.getElementById('adminPanelContainer');
    const accessDeniedMessage = document.getElementById('accessDeniedMessage');
    const userListTableBody = document.getElementById('userListTableBody');
    const showAddUserFormBtn = document.getElementById('showAddUserFormBtn');
    const userFormContainer = document.getElementById('userFormContainer');
    const userForm = document.getElementById('userForm');
    const userFormTitle = document.getElementById('userFormTitle');
    const cancelUserFormBtn = document.getElementById('cancelUserFormBtn');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password'); // Reference to password input

    const currentUser = getCurrentUser();

    if (currentUser && currentUser.role === 'admin') {
        if (adminPanelContainer) adminPanelContainer.style.display = 'block';
        if (accessDeniedMessage) accessDeniedMessage.style.display = 'none';
        
        renderUserTable();

        if (showAddUserFormBtn) {
            showAddUserFormBtn.addEventListener('click', () => {
                if(userForm) userForm.reset();
                if(userIdInput) userIdInput.value = '';
                if(passwordInput) passwordInput.required = true; // Password required for new user
                if(passwordInput) passwordInput.placeholder = ''; // Reset placeholder
                if(userFormTitle) userFormTitle.textContent = 'Dodaj Nowego Użytkownika';
                if (userFormContainer) userFormContainer.style.display = 'block';
            });
        }

        if (cancelUserFormBtn) {
            cancelUserFormBtn.addEventListener('click', () => {
                if (userFormContainer) userFormContainer.style.display = 'none';
                if(userForm) userForm.reset();
            });
        }

        if (userForm) {
            userForm.addEventListener('submit', handleUserFormSubmit);
        }

        if (userListTableBody) {
            userListTableBody.addEventListener('click', (event) => {
                const target = event.target.closest('button'); // Get the button itself if clicked on icon
                if (!target) return;

                if (target.classList.contains('edit-user-btn')) {
                    const userIdToEdit = target.dataset.userid;
                    handleEditUser(userIdToEdit);
                } else if (target.classList.contains('delete-user-btn')) {
                    const userIdToDelete = target.dataset.userid;
                    handleDeleteUser(userIdToDelete);
                }
            });
        }
    } else {
        if (adminPanelContainer) adminPanelContainer.style.display = 'none';
        if (accessDeniedMessage) accessDeniedMessage.style.display = 'block';
    }
}

function renderUserTable() {
    const userListTableBody = document.getElementById('userListTableBody');
    if (!userListTableBody) return;

    loadUsers();
    userListTableBody.innerHTML = '';

    users.forEach(user => {
        const row = userListTableBody.insertRow();
        row.insertCell().textContent = user.username;
        
        const roleCell = row.insertCell();
        roleCell.textContent = user.role === 'admin' ? 'Administrator' : 'Użytkownik';
        roleCell.className = user.role === 'admin' ? 'role-admin' : 'role-user';
        
        row.insertCell().textContent = user.id;

        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <button class="btn btn-sm btn-warning edit-user-btn" data-userid="${user.id}"><i class="fas fa-edit"></i> Edytuj</button>
            <button class="btn btn-sm btn-danger delete-user-btn" data-userid="${user.id}" style="margin-left: 5px;"><i class="fas fa-trash"></i> Usuń</button>
        `;
    });
}

function handleUserFormSubmit(event) {
    event.preventDefault();
    const userIdToEdit = document.getElementById('userId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!username) {
        alert('Nazwa użytkownika jest wymagana.');
        return;
    }

    loadUsers();

    if (userIdToEdit) { // Editing
        const userIndex = users.findIndex(u => u.id === parseInt(userIdToEdit));
        if (userIndex > -1) {
            if (users.some(u => u.username === username && u.id !== parseInt(userIdToEdit))) {
                alert('Ta nazwa użytkownika jest już zajęta.');
                return;
            }
            users[userIndex].username = username;
            if (password) {
                users[userIndex].password = password;
            }
            users[userIndex].role = role;
            alert('Użytkownik zaktualizowany pomyślnie.');
        }
    } else { // Adding new
        if (!password) {
            alert('Hasło jest wymagane dla nowego użytkownika.');
            return;
        }
        if (users.some(u => u.username === username)) {
            alert('Ta nazwa użytkownika jest już zajęta.');
            return;
        }
        const newUser = {
            id: generateUserId(),
            username: username,
            password: password,
            role: role
        };
        users.push(newUser);
        alert('Użytkownik dodany pomyślnie.');
    }

    saveUsers();
    renderUserTable();
    const userFormContainer = document.getElementById('userFormContainer');
    if(userFormContainer) userFormContainer.style.display = 'none';
    const userForm = document.getElementById('userForm');
    if(userForm) userForm.reset();
}

function handleEditUser(userIdString) {
    const userId = parseInt(userIdString);
    loadUsers();
    const userToEdit = users.find(u => u.id === userId);

    if (userToEdit) {
        const userFormTitle = document.getElementById('userFormTitle');
        const userIdInput = document.getElementById('userId');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('role');
        const userFormContainer = document.getElementById('userFormContainer');

        if(userFormTitle) userFormTitle.textContent = 'Edytuj Użytkownika';
        if(userIdInput) userIdInput.value = userToEdit.id;
        if(usernameInput) usernameInput.value = userToEdit.username;
        if(passwordInput) {
            passwordInput.value = '';
            passwordInput.required = false;
            passwordInput.placeholder = 'Pozostaw puste, aby nie zmieniać';
        }
        if(roleSelect) roleSelect.value = userToEdit.role;
        if(userFormContainer) userFormContainer.style.display = 'block';
    }
}

function handleDeleteUser(userIdString) {
    const userId = parseInt(userIdString);
    const currentUser = getCurrentUser();

    if (currentUser && currentUser.id === userId) {
        alert("Nie możesz usunąć samego siebie.");
        return;
    }

    if (confirm('Czy na pewno chcesz usunąć tego użytkownika? Tej operacji nie można cofnąć.')) {
        loadUsers();
        users = users.filter(u => u.id !== userId);
        saveUsers();
        renderUserTable();
        alert('Użytkownik usunięty.');
    }
}
