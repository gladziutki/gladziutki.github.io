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
    // Wczytaj nieruchomości z localStorage lub użyj domyślnych
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
    
    // Ustaw minimalną datę dla pola wyboru daty wygaśnięcia
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('propertyExpiry').min = today;
});

// Obsługa modala
addNoticeBtn.addEventListener('click', () => {
    propertyModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    propertyModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === propertyModal) {
        propertyModal.style.display = 'none';
    }
});

// Obsługa formularza
propertyForm.addEventListener('submit', addNewProperty);

// Obsługa wyszukiwania
searchBtn.addEventListener('click', searchProperties);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchProperties();
    }
});

// Obsługa kategorii
categoryLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Usuń klasę active ze wszystkich linków
        categoryLinks.forEach(cat => cat.classList.remove('active'));
        
        // Dodaj klasę active do klikniętego linku
        link.classList.add('active');
        
        // Zastosuj filtry
        applyFilters();
    });
});

// Obsługa filtrów
propertyTypeFilter.addEventListener('change', applyFilters);
priceRangeFilter.addEventListener('change', applyFilters);
roomCountFilter.addEventListener('change', applyFilters);
