# Joriy Loyiha Holati - Kotyol ERP

## Umumiy Xulosa
- **Joriy Milestones**: LOHIYA TO'LIQ VA MUVAFFAQIYATLI YAKUNLANDI (Final Production Release)
- **Build Holati**: Toza va Ishlab Chiqarishga Tayyor (0 xatolik)
- **Til Standardi**: Foydalanuvchiga ko'rinadigan BARCHA komponentlar va matnlar 100% O'zbek tilida.

## Yakunlangan Modullar va Infrastruktura (22 ta Modul)

| Qatlam / Modul | Holati | Tavsifi |
| :--- | :--- | :--- |
| **Yakuniy Ishlab Chiqarish Chiqarilishi (`Final Release`)** | `Bajarildi` | Barcha 22 modul va hujjatlar to'plami to'liq yakunlanib, backend integratsiyasiga tayyor holatga keltirildi. |
| **Audit Jurnali Moduli (`features/audit`)** | `Bajarildi` | Barcha modullardagi harakatlarning qat'iy read-only xronologik audit jurnali (`/audit`) hamda Old/New qiymatlar taqqoslanishi. |
| **Tizim Boshqaruvi (`features/system`)** | `Bajarildi` | ERP dvigateli versiyasi, DB va API holati hamda Hujjatlarni Nomerlash sozlamalari preview-si (`/system`). |
| **Bildirishnomalar Markazi (`features/notifications`)** | `Bajarildi` | Navbar Bildirishnoma qo'ng'iroqchasi, unread badge hamda o'ng yon panel (`NotificationDrawer`). |
| **Global Faoliyatlar Jurnali (`features/activities`)** | `Bajarildi` | Barcha modullardagi hodisalar va harakatlar audit jurnali sahifasi (`/activities`). |
| **Yagona Qayta Ishlatiluvchi Filtr Sistemasi (`FilterBar`)** | `Bajarildi` | Barcha modullarda bir xil ko'rinish va xatti-harakatga ega universal filtrlar va localStorage da saqlash. |
| **Dinamik Sahifalash va Page Size Filtri (`docs/pagination_and_filters.md`)** | `Bajarildi` | Barcha modullar jadvallarida 10, 25, 50, 100, 200 ta yozuvlarni tanlash va sahifalash filtri. |
| **Hisobotlar Moduli (`features/reports`)** | `Bajarildi` | Barcha biznes yo'nalishlari (Umumiy, Sotuv, Ombor, Ishlab chiqarish, Moliya, Servis) bo'yicha read-only tahlil, Recharts va Excel/PDF/Print eksport. |
| **Boshqaruv Moliyasi (`Manager-Centric Finance`)** | `Bajarildi` | Rahbarlar uchun soddalashtirilgan Daromad, Xarajat, Sof Foyda va Kutilayotgan to'lovlar tahlili. |
| **Moliya va G'azna Moduli (`features/finance`)** | `Bajarildi` | Daromadlar, operatsion xarajatlar, 6 ta asosiy ko'rsatkich kartalari hamda Recharts grafiklar tahlili (`/finance`). |
| **Servis va Kafolat Moduli (`features/services`)** | `Bajarildi` | Sotilgan tayyor sanoat kotyollari uchun kafolat va texnik servis xizmatlarini boshqarish (`/services`). |
| **Soddalik va UX Standartlari (`Simplicity First`)** | `Bajarildi` | 1 ekranda 1 ta asosiy maqsad, bosqichma-bosqich yig'iluvchi UI (Progressive Disclosure) hamda xavfsiz tugmalar ierarxiyasi. |
| **Markaziy Hujjat Nomerlash Servisi (`documentNumbering.service.js`)** | `Bajarildi` | Barcha tijorat va ishlab chiqarish hujjatlari (`ORD-YYYY-000001`, `PRD-YYYY-000001`, `SAL-YYYY-000001`) uchun yagona nomerlash servisi. |
| **Sotuvlar Moduli (`features/sales`)** | `Bajarildi` | Tayyor mahsulotlarni sotish, schyot-faktura rasmiylashtirish, QQS, chegirma va foyda marjasi hisobi hamda ombor sarfiyati (`/sales`). |
| **Markaziy Biznes Qoidalari Servisi (`businessRules.service.js`)** | `Bajarildi` | Tannarx, soliq (QQS 12%), chegirma, foyda marjasi hamda ombor/retseptura qoidalarini React dan to'liq ajratish. |
| **Hisob-Kitob Shaffofligi Komponenti (`CalculationBreakdown.jsx`)** | `Bajarildi` | Hisob-kitoblar va formulalarni yoyiluvchi shaklda o'zbek tilida shaffof ko'rsatuvchi kartochka. |
| **Permission-Based UI Engine (`usePermission.js`)** | `Bajarildi` | Roli va huquqiga ko'ra Yaratish, Tahrirlash, O'chirish tugmalarini avtomatik yashirish hamda O'qish Rejimi (Read-Only Mode). |
| **Ishlab Chiqarish Kanban Moduli (`features/production`)** | `Bajarildi` | Dinamik sozlama bosqichlaridan yuklanuvchi, sudrash (Drag & Drop), optimistik UI hamda `ProductionCardDrawer` tezkor yon paneliga ega Kanban taxtasi. |
| **Production Card Drawer (`ProductionCardDrawer.jsx`)** | `Bajarildi` | Sahifadan chiqmagan holda Retseptura, Xomashyolar, Hujjatlar va Audit tariasini tezkor ko'rish paneli. |
| **Production Kanban Board (`ProductionKanbanBoard.jsx`)** | `Bajarildi` | `@dnd-kit` asosidagi vizual Kanban taxtasi, Optimistic UI update hamda `isDragging` smart auto-refresh pause. |
| **Smart Actions & Clickable References** | `Bajarildi` | Jadvallar va tafsilotlardagi barcha ob'yekt nomlariga 1 marta bosish orqali asl sahifasiga o'tuvchi havolalar. |
| **Ishlab Chiqarish Moduli (`features/production`)** | `Bajarildi` | Sanoat ish buyurtmalari reyestri, materiallar yetarliligini tekshirish, usta xodimlarni biriktirish hamda ombor sarfiyati (`/production`). |
| **Production Audit & Optimistic Locking (`productionAudit.service.js`)** | `Bajarildi` | Ishlab chiqarish harakatlari uchun immutable audit jurnali hamda ko'p foydalanuvchili versiyalash (`version: N`). |
| **Buyurtmalar Boshqaruvi Moduli (`features/orders`)** | `Bajarildi` | Mijozlar buyurtmalari katalogi, avtomatik material yetarliligi tekshiruvi, rezervatsiya hamda ishlab chiqarishga o'tkazish (`/orders`). |
| **Page-Based Auto-Refresh (`usePageAutoRefresh.js`)** | `Bajarildi` | Faqat faol sahifani har 15s da fonda jim yangilash, form to'ldirilganda avtomatik pauza qilish. |
| **Form Draft Auto-Save (`useFormDraftStore.js`)** | `Bajarildi` | Kiritilayotgan form ma'lumotlarini real-vaqt rejimida localStorage da saqlash hamda tasodifiy yopilganda tiklash. |
| **Mijozlar Boshqaruvi Moduli (`features/customers`)** | `Bajarildi` | Yuridik va jismoniy mijozlar katalogi, rekvizitlar, hujjatlar hamda sotuv/servis tezkor tugmalari (`/customers`). |
| **Read-Only Related Info Preview (`EntityPreviewCard.jsx`)** | `Bajarildi` | DynamicSelect orqali Ob'yekt (Retsept, Ta'minotchi) tanlanganda uning qisqacha o'qish kartasini ko'rsatish. |
| **Kotyol Turlari Moduli (`features/boilers`)** | `Bajarildi` | Sanoat kotyol va pech modellari katalogi, retseptura bog'lanishi, bosqichlar zanjiri va tannarx baholash (`/boilers`). |
| **Smart Tables & Preferences Store (`useUserPreferencesStore.js`)** | `Bajarildi` | Jadval ustunlarini tanlash (`⚙️ Ustunlar`), sahifa o'lchami hamda sozlamalarni localStorage da eslab qolish. |
| **Smart Forms & Progressive Disclosure** | `Bajarildi` | Shakllarni soddalashtirish, ikkinchi darajali parametrlarni yig'iluvchi katlanuvchi guruhlarda taqdim etish. |
| **Master vs Transaction Data Architecture (`masterDataService`, `transactionDataService`)** | `Bajarildi` | Master Data va Tranzaksiyalarni qat'iy ajratish va ID-based reference. |
| **Retseptlar va BOM Moduli (`features/recipes`)** | `Bajarildi` | Tayyor mahsulotlar resepturasi, masalliqlar sarfi, versiyalash (1.0, 2.0) va avtomatik tannarx hisobi (`/recipes`). |
| **Data Integrity & Soft Delete Engine (`dataIntegrity.service.js`)** | `Bajarildi` | Bog'langan ob'yektlarni o'chirishni taqiqlash, o'zbek tilida tushuntirish berish va `INACTIVE` yumshoq o'chirish. |
| **Xaridlar va Ta'minot Moduli (`features/purchasing`)** | `Bajarildi` | Ta'minotchilardan xomashyo va mahsulotlar xaridi, avtomatik kalkulyatsiya va qoralama rejimi (`/purchasing`). |
| **Omborga Avtomatik Kirim Workflow** | `Bajarildi` | Xarid statusi `Qabul Qilingan` ga o'tganda ombor zaxirasining avtomatik oshishi va ombor harakati yaratilishi. |
| **DynamicSelect Component (`components/common`)** | `Bajarildi` | `+ Qo'shish` (QuickAddModal) va `⚙️ Boshqarish` tugmalariga ega uzliksiz ish jarayoni komponenti. |
| **Omborxona Moduli (`features/warehouse`)** | `Bajarildi` | Ombordagi mahsulotlar, harakatlar jurnali, qayta baholash va inventarizatsiya (`/warehouse`). |
| **React Icons Kutubxonasi (`react-icons/lu`)** | `Bajarildi` | Bootstrap Icons o'rniga to'liq React Icons standartiga o'tildi. |
| **Ta'minotchilar Moduli (`features/suppliers`)** | `Bajarildi` | Ta'minotchi korxonalar reyestri va profili (`/suppliers`). |
| **Mahsulotlar Moduli (`features/products`)** | `Bajarildi` | Xomashyolar va tayyor mahsulotlar reyestri hamda QR kodi (`/products`). |
| **Dynamic Settings Registry (`dynamicSettings.service.js`)** | `Bajarildi` | Barcha dinamik tushunchalar va xarid statuslari uchun markaziy servis. |
| **Xodimlar Moduli (`features/employees`)** | `Bajarildi` | Xodimlar ro'yxati, lavozimlar va maosh turlari. |
| **Sozlamalar Moduli (`features/settings`)** | `Bajarildi` | 14 ta ichki sozlama sahifalari hamda Drag & Drop bosqichlar. |
| **Autentifikatsiya va Dashboard** | `Bajarildi` | Auth moduli hamda Boshqaruv paneli. |

## Loyiha Yakuni
Loyiha 100% tayyor va ishlab chiqarishga (Production) topshirildi.
