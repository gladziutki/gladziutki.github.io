// Dane ogłoszeń - w rzeczywistej aplikacji pobierane z bazy danych
let notices = [
    {
        id: 1,
        title: "Poszukiwany programista JavaScript",
        category: "praca",
        content: "Firma IT poszukuje programisty JavaScript z minimum 2-letnim doświadczeniem. Oferujemy atrakcyjne wynagrodzenie i elastyczne godziny pracy.",
        contact: "rekrutacja@firma.pl | tel. 123-456-789",
        date: "2025-05-18",
        expiry: "2025-06-18"
    },
    {
        id: 2,
        title: "Sprzedam laptopa Dell XPS 15",
        category: "sprzedaz",
        content: "Sprzedam laptopa Dell XPS 15, 16GB RAM, SSD 512GB, procesor i7 11-gen. Stan bardzo dobry, używany 1 rok. Cena 4500 zł do negocjacji.",
        contact: "jan.kowalski@email.pl | tel. 987-654-321",
        date: "2025-05-19",
        expiry: "2025-06-19"
    },
    {
        id: 3,
        title: "Korepetycje z matematyki",
        category: "uslugi",
        content: "Udzielam korepetycji z matematyki dla uczniów szkół podstawowych i średnich. Jestem studentem matematyki stosowanej. Cena: 60 zł/godz.",
        contact: "matematyka@korepetycje.pl | tel. 555-123-456",
        date: "2025-05-20",
        expiry: "2025-07-20"
    },
    {
        id: 4,
        title: "Wynajmę mieszkanie 2-pokojowe",
        category: "mieszkania",
        content: "Wynajmę mieszkanie 2-pokojowe o powierzchni 48m² w centrum miasta. Mieszkanie po remoncie, umeblowane. Cena: 2000 zł + opłaty.",
        contact: "mieszkanie@wynajme.pl | tel. 333-222-111",
        date: "2025-05-17",
        expiry: "2025-06-17"
    },
    {
        id: 5,
        title: "Oddam kocięta",
        category: "rozne",
        content: "Oddam w dobre ręce 3 kocięta (2 miesięczne). Są już samodzielne, korzystają z kuwety, przyzwyczajone do dzieci.",
        contact: "kocieta@email.pl | tel. 444-555-666",
        date: "2025-05-21",
        expiry: "2025-06-21"
    },
    {
        id: 6,
        title: "Firma sprzątająca zatrudni pracowników",
        category: "praca",
        content: "Firma sprzątająca zatrudni osoby do sprzątania biur. Praca na pełen etat lub 1/2 etatu. Wynagrodzenie od 3000 zł netto.",
        contact: "praca@sprzatanie.pl | tel. 111-222-333",
        date: "2025-05-16",
        expiry: "2025-06-16"
    }
];

// Elementy DOM
const noticeBoard = document.getElementById('noticeBoard');
const addNoticeBtn = document.getElementById('addNoticeBtn');
const noticeModal = document.getElementById('noticeModal');
const closeModal = document.querySelector('.close');
const noticeForm = document.getElementById('noticeForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryLinks = document.querySelectorAll('.categories li');

// Wyświetlanie ogłoszeń
function displayNotices(noticesArray) {
    noticeBoard.innerHTML = '';
    
    if (noticesArray.length === 0) {
        noticeBoard.innerHTML = '<p class="no-results">Nie znaleziono żadnych ogłoszeń.</p>';
        return;
    }
    
    noticesArray.forEach(notice => {
        const noticeElement = document.createElement('div');
        noticeElement.className = 'notice';
        noticeElement.dataset.category = notice.category;
        
        // Sprawdzenie czy ogłoszenie wygasło
        const today = new Date();
        const expiryDate = new Date(notice.expiry);
        const isExpired = today > expiryDate;
        
        if (isExpired) {
            noticeElement.classList.add('expired');
        }
        
        noticeElement.innerHTML = `
            <div class="notice-header">
                <h3 class="notice-title">${notice.title}</h3>
                <span class="notice-category ${notice.category}">${getCategoryName(notice.category)}</span>
            </div>
            <div class="notice-content">
                ${notice.content}
            </div>
            <div class="notice-details">
                <div class="notice-contact">
                    <strong>Kontakt:</strong> ${notice.contact}
                </div>
                <div class="notice-expiry">
                    <strong>Data ważności:</strong> ${formatDate(notice.expiry)}
                    ${isExpired ? '<span class="expired-label">Wygasło</span>' : ''}
                </div>
            </div>
        `;
        
        noticeBoard.appendChild(noticeElement);
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
        'praca': 'Praca',
        'sprzedaz': 'Sprzedaż',
        'uslugi': 'Usługi',
        'mieszkania': 'Mieszkania',
        'rozne': 'Różne'
    };
    
    return categories[categorySlug] || categorySlug;
}

// Obsługa dodawania nowego ogłoszenia
function addNewNotice(e) {
    e.preventDefault();
    
    const title = document.getElementById('noticeTitle').value;
    const category = document.getElementById('noticeCategory').value;
    const content = document.getElementById('noticeContent').value;
    const contact = document.getElementById('noticeContact').value;
    const expiry = document.getElementById('noticeExpiry').value;
    
    const newNotice = {
        id: notices.length + 1,
        title,
        category,
        content,
        contact,
        date: new Date().toISOString().split('T')[0],
        expiry
    };
    
    notices.unshift(newNotice); // Dodaj na początek tablicy
    
    // Odśwież listę ogłoszeń
    const activeCategory = document.querySelector('.categories li.active').dataset.category;
    filterNotices(activeCategory);
    
    // Zamknij modal
    noticeModal.style.display = 'none';
    
    // Resetuj formularz
    noticeForm.reset();
    
    // Komunikat o powodzeniu
    alert('Ogłoszenie zostało dodane pomyślnie!');
}

// Filtrowanie ogłoszeń według kategorii
function filterNotices(category) {
    if (category === 'all') {
        displayNotices(notices);
    } else {
        const filteredNotices = notices.filter(notice => notice.category === category);
        displayNotices(filteredNotices);
    }
}

// Wyszukiwanie ogłoszeń
function searchNotices() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        const activeCategory = document.querySelector('.categories li.active').dataset.category;
        filterNotices(activeCategory);
        return;
    }
    
    const searchResults = notices.filter(notice => {
        return (
            notice.title.toLowerCase().includes(searchTerm) ||
            notice.content.toLowerCase().includes(searchTerm) ||
            notice.contact.toLowerCase().includes(searchTerm)
        );
    });
    
    displayNotices(searchResults);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Wyświetl wszystkie ogłoszenia na start
    displayNotices(notices);
    
    // Ustaw minimalną datę dla pola wyboru daty wygaśnięcia
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('noticeExpiry').min = today;
});

// Obsługa modala
addNoticeBtn.addEventListener('click', () => {
    noticeModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    noticeModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === noticeModal) {
        noticeModal.style.display = 'none';
    }
});

// Obsługa formularza
noticeForm.addEventListener('submit', addNewNotice);

// Obsługa wyszukiwania
searchBtn.addEventListener('click', searchNotices);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchNotices();
    }
});

// Obsługa kategorii
categoryLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Usuń klasę active ze wszystkich linków
        categoryLinks.forEach(cat => cat.classList.remove('active'));
        
        // Dodaj klasę active do klikniętego linku
        link.classList.add('active');
        
        // Filtruj ogłoszenia
        const category = link.dataset.category;
        filterNotices(category);
    });
});
