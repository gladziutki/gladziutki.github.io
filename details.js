document.addEventListener('DOMContentLoaded', () => {
    const propertyDetailsContainer = document.getElementById('propertyDetailsContainer');
    if (!propertyDetailsContainer) {
        console.error('Element propertyDetailsContainer not found!');
        return;
    }

    // Helper function to safely set text content
    const setText = (id, text) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text !== undefined && text !== null ? text : 'Brak danych';
        } else {
            console.warn(`Element with ID ${id} not found.`);
        }
    };

    // Helper function to set image source
    const setImage = (id, src, alt) => {
        const element = document.getElementById(id);
        if (element) {
            element.src = src || 'images/placeholder.jpg'; // Fallback image
            element.alt = alt || 'Zdjęcie nieruchomości';
        } else {
            console.warn(`Element with ID ${id} not found.`);
        }
    };
    
    // Formatowanie daty
    function formatDate(dateString) {
        if (!dateString) return 'Brak danych';
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
        return categories[categorySlug] || categorySlug || 'Brak danych';
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
        return types[typeSlug] || typeSlug || 'Brak danych';
    }

    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = parseInt(urlParams.get('id'));

    if (isNaN(propertyId)) {
        setText('detailsTitle', 'Błąd');
        setText('detailsContent', 'Nieprawidłowy identyfikator nieruchomości.');
        propertyDetailsContainer.innerHTML = '<p class="error-message">Nieprawidłowy identyfikator nieruchomości. <a href="index.html">Wróć do strony głównej</a>.</p>';
        return;
    }

    // Load properties from localStorage
    const storedProperties = localStorage.getItem('propertyListings');
    let properties = [];
    if (storedProperties) {
        try {
            properties = JSON.parse(storedProperties);
        } catch (e) {
            console.error("Error parsing properties from localStorage:", e);
            propertyDetailsContainer.innerHTML = '<p class="error-message">Błąd podczas wczytywania danych. <a href="index.html">Wróć do strony głównej</a>.</p>';
            return;
        }
    } else {
        propertyDetailsContainer.innerHTML = '<p class="error-message">Brak danych o nieruchomościach. <a href="index.html">Wróć do strony głównej</a>.</p>';
        return;
    }

    // Find the property by ID
    const property = properties.find(p => p.id === propertyId);

    if (property) {
        document.title = `${property.title || 'Szczegóły'} - Portal Nieruchomości`; // Update page title

        setText('detailsTitle', property.title);
        
        const formattedPrice = property.category === 'wynajem' 
            ? `${(property.price || 0).toLocaleString('pl-PL')} zł/miesiąc`
            : `${(property.price || 0).toLocaleString('pl-PL')} zł`;
        setText('detailsPrice', formattedPrice);
        
        setText('detailsLocation', property.location);
        setImage('detailsImage', property.imageUrl, property.title);

        setText('detailsCategory', getCategoryName(property.category));
        setText('detailsPropertyType', getPropertyTypeName(property.propertyType));
        setText('detailsArea', property.area);
        setText('detailsRooms', property.rooms > 0 ? (property.rooms === 1 ? '1 pokój' : property.rooms < 5 ? `${property.rooms} pokoje` : `${property.rooms} pokoi`) : 'Nie dotyczy');
        
        const pricePerSqM = property.area > 0 ? Math.round((property.price || 0) / property.area).toLocaleString('pl-PL') : 'N/A';
        setText('detailsPricePerSqM', pricePerSqM);

        setText('detailsDateAdded', formatDate(property.date));
        setText('detailsExpiryDate', formatDate(property.expiry));
        
        // Check for expiration
        const today = new Date();
        const expiryDate = new Date(property.expiry);
        if (today > expiryDate) {
            const expiryElement = document.getElementById('detailsExpiryDate');
            if (expiryElement) {
                expiryElement.innerHTML += ' <span style="color: red; font-weight: bold;">(Wygasła)</span>';
            }
        }

        setText('detailsContent', property.content);
        setText('detailsContact', property.contact);

    } else {
        document.title = 'Nie znaleziono - Portal Nieruchomości';
        setText('detailsTitle', 'Nie znaleziono');
        propertyDetailsContainer.innerHTML = `<p class="error-message">Nie znaleziono nieruchomości o ID: ${propertyId}. <a href="index.html">Wróć do strony głównej</a>.</p>`;
        // Hide or clear other fields if property not found
        setImage('detailsImage', 'images/placeholder.jpg', 'Nie znaleziono');
        setText('detailsPrice', '');
        setText('detailsLocation', '');
        setText('detailsCategory', '');
        setText('detailsPropertyType', '');
        setText('detailsArea', '');
        setText('detailsRooms', '');
        setText('detailsPricePerSqM', '');
        setText('detailsDateAdded', '');
        setText('detailsExpiryDate', '');
        setText('detailsContent', 'Brak opisu.');
        setText('detailsContact', 'Brak danych.');
    }
});
