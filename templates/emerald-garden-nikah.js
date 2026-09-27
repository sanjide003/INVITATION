const emeraldGardenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#0F2C20"/>
    <rect x="15" y="15" width="370" height="270" rx="20" fill="none" stroke="#D4AF37" stroke-width="2" opacity="0.8"/>
    <path d="M 15 50 Q 200 15 385 50" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/>
    <path d="M 15 250 Q 200 285 385 250" fill="none" stroke="#D4AF37" stroke-width="1.5" opacity="0.7"/>
    <circle cx="200" cy="115" r="28" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.8"/>
    <text x="200" y="118" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="18" font-weight="bold" fill="#D4AF37">E &amp; G</text>
    <text x="50%" y="180" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="24" font-weight="bold" fill="#D4AF37">Emerald &amp; Gold</text>
    <text x="50%" y="210" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#FBF8EE" opacity="0.8">ROYAL NIKAH</text>
</svg>`;
const emeraldGardenThumb = 'data:image/svg+xml;base64,' + btoa(emeraldGardenSvg);

window.registerTemplate({
    id: 'emerald-garden-nikah',
    name: 'Royal Emerald & Gold Nikah',
    thumb: emeraldGardenThumb,
    freeform: false,
    scrollable: true,
    defaults: {
        colors: {
            primary: '#D4AF37',     // Royal Metallic Gold
            bg: '#0F2C20',          // Deep Royal Emerald Green
            text: '#FBF8EE'         // Cream Pearl White
        },
        fonts: {
            heading: "'Playfair Display', serif"
        }
    },
    render: function(d, isEditMode) {
        const colors = {
            primary: d?.design?.colors?.primary || this.defaults.colors.primary,
            bg: d?.design?.colors?.bg || this.defaults.colors.bg,
            text: d?.design?.colors?.text || this.defaults.colors.text
        };
        const set = d?.settings || {};

        // Safe HTML escaping helper
        const escape = (val, fallback = '') => String(val ?? fallback)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Studio standard edit wrapper
        const edit = (key, contentHtml, visibilityKey) => {
            if (visibilityKey && set[visibilityKey] === false) {
                return isEditMode ? `<div class="template-hidden" data-edit="${key}">${contentHtml}</div>` : '';
            }
            return isEditMode
                ? `<div class="template-editable" data-edit="${key}">
                     <span class="template-edit-pen" title="Edit this section"><i class="fa-solid fa-pen"></i></span>
                     ${contentHtml}
                   </div>`
                : contentHtml;
        };

        const bismillahText = escape(d?.content?.bismillah, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ');
        const headingText = escape(d?.content?.heading, 'Together with their families');
        const groomName = escape(d?.couple?.groom, 'Groom Name');
        const brideName = escape(d?.couple?.bride, 'Bride Name');
        const groomPhoto = d?.couple?.groomPhoto;
        const bridePhoto = d?.couple?.bridePhoto;
        
        // Custom Initials / Monogram
        const defaultInitials = `${groomName.charAt(0)}${brideName.charAt(0)}`.toUpperCase();
        const displayInitials = d?.couple?.customInitials ? escape(d.couple.customInitials) : defaultInitials;

        const invitationMsg = escape(d?.content?.message, 'Cordially invite you to share in the joy and blessings of their wedding celebration as they unite in holy matrimony.');
        const arabicQuote = escape(d?.content?.arabicText, 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُסِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا');
        const translationQuote = escape(d?.content?.translation, '"And among His signs is that He created for you mates that you may find peace in them."');
        const eventTitle = escape(d?.mainEvent?.title, 'Nikah Ceremony & Reception');
        const dateParts = /^\d{4}-\d{2}-\d{2}$/.test(d?.mainEvent?.date || '') ? d.mainEvent.date.split('-').map(Number) : null;
        const selectedDate = dateParts ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;
        const eventDate = selectedDate ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(selectedDate) : 'Your Wedding Date';
        
        // Start and Optional End Time
        const formatTime = (t) => window.formatTimeTo12Hour ? window.formatTimeTo12Hour(t) : t;
        const eventTime = formatTime(escape(d?.mainEvent?.time, '11:00 AM'));
        const endTime = d?.mainEvent?.endTime ? formatTime(escape(d.mainEvent.endTime)) : '';
        const displayTime = endTime ? `${eventTime} - ${endTime}` : eventTime;

        const eventVenue = escape(d?.mainEvent?.venue, 'Grand Wedding Hall');
        const eventAddress = escape(d?.mainEvent?.address, 'City, Area');
        const mapUrl = d?.mainEvent?.mapUrl;
        const isValidMapUrl = typeof mapUrl === 'string' && /^https?:\/\//i.test(mapUrl.trim());
        const safeMapUrl = isValidMapUrl ? escape(mapUrl.trim()) : '';

        // Handle Auditorium / Venue Image
        let venueImageHtml = '';
        if (d?.mainEvent?.venueImage) {
            venueImageHtml = `<div class="w-full max-w-[340px] h-[180px] rounded-2xl overflow-hidden shadow-md my-4 mx-auto border-2 border-white/30"><img src="${d.mainEvent.venueImage}" class="w-full h-full object-cover"></div>`;
        } else {
            // Simple icon only, no large ugly box
            venueImageHtml = `<div class="text-center my-4 text-3xl" style="color: ${colors.primary};">
                                <i class="fa-solid fa-hotel animate-pulse"></i>
                             </div>`;
        }

        // Generate Calendar View with Animated Pulsing Date
        const monthLabel = selectedDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate) : 'Select Wedding Date';
        
        const calendar = (() => {
            if (!selectedDate) return '<div class="bs-calendar-grid bs-calendar-empty text-white/60">Choose the wedding date in Event Details</div>';
            const year = selectedDate.getFullYear(), month = selectedDate.getMonth(), selectedDay = selectedDate.getDate();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
            const cells = Array.from({ length: firstDay }, () => '<span></span>');
            for (let day = 1; day <= daysInMonth; day++) {
                cells.push(`<span class="${day === selectedDay ? 'rnk-selected-day' : ''}">${day}${day === selectedDay ? '<b>♥</b>' : ''}</span>`);
            }
            return `<div class="bs-calendar-week text-white/50">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<span>${day}</span>`).join('')}</div><div class="bs-calendar-grid">${cells.join('')}</div>`;
        })();

        const styles = `
            <style>
                .rnk-container {
                    background-color: ${colors.bg};
                    color: ${colors.text};
                    font-family: 'Poppins', sans-serif;
                    min-height: 100%;
                    width: 100%;
                    max-width: 480px;
                    margin: 0 auto;
                    position: relative;
                    box-sizing: border-box;
                    padding: 36px 18px 52px;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    background-image: 
                        radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.18) 0%, transparent 60%),
                        radial-gradient(circle at 50% 100%, rgba(212, 175, 55, 0.12) 0%, transparent 50%),
                        linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%);
                }

                /* Islamic Arch & Royal Border Frames */
                .rnk-border-outer {
                    position: absolute;
                    inset: 12px;
                    border: 1.5px solid ${colors.primary};
                    border-radius: 28px;
                    pointer-events: none;
                    opacity: 0.75;
                    box-shadow: inset 0 0 15px rgba(212, 175, 55, 0.15);
                }
                .rnk-border-inner {
                    position: absolute;
                    inset: 18px;
                    border: 1px dashed ${colors.primary};
                    border-radius: 22px;
                    pointer-events: none;
                    opacity: 0.4;
                }

                /* Corner Ornaments */
                .rnk-corner {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    pointer-events: none;
                    opacity: 0.85;
                }
                .rnk-corner-tl { top: 12px; left: 12px; border-top: 3px solid ${colors.primary}; border-left: 3px solid ${colors.primary}; border-top-left-radius: 28px; }
                .rnk-corner-tr { top: 12px; right: 12px; border-top: 3px solid ${colors.primary}; border-right: 3px solid ${colors.primary}; border-top-right-radius: 28px; }
                .rnk-corner-bl { bottom: 12px; left: 12px; border-bottom: 3px solid ${colors.primary}; border-left: 3px solid ${colors.primary}; border-bottom-left-radius: 28px; }
                .rnk-corner-br { bottom: 12px; right: 12px; border-bottom: 3px solid ${colors.primary}; border-right: 3px solid ${colors.primary}; border-bottom-right-radius: 28px; }

                /* Studio Edit Pen Indicator */
                .template-editable {
                    position: relative;
                    cursor: pointer;
                    transition: outline 0.2s ease, background-color 0.2s ease;
                    border-radius: 14px;
                }
                .template-editable:hover {
                    outline: 2px dashed #3B82F6;
                    background-color: rgba(59, 130, 246, 0.08);
                }
                .template-edit-pen {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #2563EB, #1D4ED8);
                    color: #FFFFFF;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.35);
                    z-index: 50;
                }
                .template-hidden {
                    opacity: 0.35;
                    filter: grayscale(80%);
                    position: relative;
                    cursor: pointer;
                    margin-bottom: 12px;
                }
                .template-hidden::after {
                    content: "Hidden Layer (Tap to edit)";
                    display: block;
                    font-size: 9px;
                    text-align: center;
                    color: #EF4444;
                    font-weight: 700;
                    margin-top: 4px;
                    letter-spacing: 0.1em;
                }

                /* Luxury Glassmorphism Card */
                .rnk-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(212, 175, 55, 0.32);
                    border-radius: 22px;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                }

                .rnk-gold-gradient {
                    background: linear-gradient(135deg, #FFEAA7 0%, ${colors.primary} 50%, #C3922E 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .rnk-gold-btn {
                    background: linear-gradient(135deg, #D4AF37 0%, #AA8022 100%);
                    color: #0F2C20;
                    font-weight: 700;
                    box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .rnk-gold-btn:active {
                    transform: scale(0.97);
                }

                /* Keyframe Animations */
                @keyframes rnkRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rnkPulseGlow {
                    0%, 100% { box-shadow: 0 0 12px rgba(212, 175, 55, 0.25); }
                    50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.65); }
                }
                @keyframes rnkFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes rnkShimmer {
                    0% { opacity: 0.7; }
                    50% { opacity: 1; }
                    100% { opacity: 0.7; }
                }

                .rnk-spin { animation: rnkRotate 30s linear infinite; transform-origin: center; }
                .rnk-floating { animation: rnkFloat 5s ease-in-out infinite; }
                .rnk-glow { animation: rnkPulseGlow 3.5s infinite; }
                .rnk-shimmer { animation: rnkShimmer 2.5s infinite; }

                /* Calendar View Styles with Pulsing Highlight */
                .bs-calendar{margin:25px auto;padding:20px 10px;border-top:1px solid rgba(255,255,255,.15);border-bottom:1px solid rgba(255,255,255,.15);text-align:center}
                .bs-calendar h3{font-size:22px;margin:0 0 12px;color:${colors.primary}}
                .bs-calendar-week{display:grid;grid-template-columns:repeat(7,1fr);font-size:11px;color:rgba(255,255,255,.6);margin-bottom:8px}
                .bs-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px 4px;font-size:14px}
                .bs-calendar-grid span{position:relative;display:grid;place-items:center;min-height:26px}
                
                @keyframes rnkPulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(212,175,55,0.65)}70%{transform:scale(1.08);box-shadow:0 0 0 10px rgba(212,175,55,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(212,175,55,0)}}
                .rnk-selected-day{background:rgba(212,175,55,0.45);border-radius:50%;font-weight:700;animation:rnkPulse 2s infinite;border:2px solid ${colors.primary}}
                .rnk-selected-day b{position:absolute;right:-2px;top:-6px;color:#f596c2;font-size:12px}

                @media (prefers-reduced-motion: reduce) {
                    .rnk-spin, .rnk-floating, .rnk-glow, .rnk-shimmer, .rnk-selected-day {
                        animation: none !important;
                    }
                }
            </style>
        `;

        const mandalaSvg = `
            <div class="text-center mb-6 relative w-24 h-24 mx-auto flex items-center justify-center">
                <svg class="rnk-spin absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="${colors.primary}" stroke-width="1.3" aria-hidden="true" style="animation: rnkRotate 30s linear infinite; transform-origin: center;">
                    <circle cx="50" cy="50" r="44" stroke-dasharray="2 3" opacity="0.6"/>
                    <circle cx="50" cy="50" r="32" opacity="0.8"/>
                    <circle cx="50" cy="50" r="10" fill="${colors.primary}" fill-opacity="0.15"/>
                    <path d="M50 6 C40 28, 28 40, 6 50 C28 60, 40 72, 50 94 C60 72, 72 60, 94 50 C72 40, 60 28, 50 6 Z" stroke-width="1.6"/>
                    <circle cx="50" cy="6" r="2.5" fill="${colors.primary}"/>
                    <circle cx="94" cy="50" r="2.5" fill="${colors.primary}"/>
                    <circle cx="50" cy="94" r="2.5" fill="${colors.primary}"/>
                    <circle cx="6" cy="50" r="2.5" fill="${colors.primary}"/>
                </svg>
                <div class="absolute font-serif text-sm font-bold tracking-tight z-10" style="color: ${colors.primary};">
                    ${displayInitials}
                </div>
            </div>
        `;

        const bismillahSection = edit('bismillah', `
            <div class="text-center mb-5 px-3">
                <p class="font-arabic text-2xl md:text-3xl font-bold rnk-gold-gradient leading-loose tracking-wide">
                    ${bismillahText}
                </p>
                <div class="w-16 h-0.5 mx-auto mt-2 opacity-60" style="background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);"></div>
            </div>
        `, 'showBismillah');

        const headingSection = edit('heading', `
            <div class="text-center mb-6 px-4">
                <span class="inline-block text-[11px] uppercase tracking-[0.3em] font-semibold opacity-90 rnk-shimmer" style="color: ${colors.primary};">
                    ${headingText}
                </span>
            </div>
        `, 'showHeading');

        // Only display photographs if explicitly provided, else keep layout beautifully clean
        let photosHtml = '';
        if (groomPhoto || bridePhoto) {
            photosHtml = `
                <div class="flex items-center justify-center gap-4 mb-5 w-full">
                    ${groomPhoto ? `
                        <div class="relative w-20 h-20 rounded-full p-1 rnk-glow shrink-0 aspect-square flex items-center justify-center" style="border: 2px solid ${colors.primary};">
                            <img src="${groomPhoto}" alt="${groomName}" class="w-full h-full object-cover rounded-full aspect-square" style="aspect-ratio: 1/1;" />
                        </div>
                    ` : ''}
                    ${(groomPhoto && bridePhoto) ? `
                        <span class="rnk-gold-gradient text-2xl font-serif italic opacity-80">&amp;</span>
                    ` : ''}
                    ${bridePhoto ? `
                        <div class="relative w-20 h-20 rounded-full p-1 rnk-glow shrink-0 aspect-square flex items-center justify-center" style="border: 2px solid ${colors.primary};">
                            <img src="${bridePhoto}" alt="${brideName}" class="w-full h-full object-cover rounded-full aspect-square" style="aspect-ratio: 1/1;" />
                        </div>
                    ` : ''}
                </div>
            `;
        }

        const coupleSection = edit('couple', `
            <div class="rnk-card p-6 text-center my-5 rnk-floating relative overflow-hidden">
                <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-yellow-500/5 blur-xl pointer-events-none"></div>
                ${photosHtml}
                <div class="space-y-1">
                    <h1 class="font-serif text-3xl md:text-4xl font-bold tracking-wide rnk-gold-gradient leading-tight">
                        ${groomName}
                    </h1>
                    <div class="py-1">
                        <span class="inline-block font-script text-2xl md:text-3xl opacity-80" style="color: ${colors.primary};">&amp;</span>
                    </div>
                    <h1 class="font-serif text-3xl md:text-4xl font-bold tracking-wide rnk-gold-gradient leading-tight">
                        ${brideName}
                    </h1>
                </div>
                <div class="w-20 h-[1.5px] mx-auto mt-4 opacity-40" style="background: ${colors.primary};"></div>
                <p class="text-[10px] uppercase tracking-[0.25em] mt-3 opacity-80" style="color: ${colors.primary};">
                    The Wedding Celebration
                </p>
            </div>
        `, 'showCouple');

        const messageSection = edit('message', `
            <div class="text-center my-6 px-4">
                <p class="text-xs md:text-sm leading-relaxed opacity-90 font-light italic font-serif" style="color: ${colors.text}; max-width: 380px; margin: 0 auto;">
                    "${invitationMsg}"
                </p>
            </div>
        `, 'showMessage');

        const quranSection = edit('quran', `
            <div class="rnk-card p-5 my-6 text-center" style="border-left: 3px solid ${colors.primary}; border-right: 3px solid ${colors.primary};">
                <p class="font-arabic text-lg md:text-xl leading-loose font-bold rnk-gold-gradient mb-2">
                    ${arabicQuote}
                </p>
                <p class="text-[11px] uppercase tracking-wider opacity-85 leading-normal" style="color: ${colors.text};">
                    ${translationQuote}
                </p>
            </div>
        `, 'showQuote');

        // Map and Reminder Buttons Setup
        const mapBtnHtml = (set.showMap !== false && isValidMapUrl && !isEditMode) ? `
            <a href="${safeMapUrl}" target="_blank" rel="noopener noreferrer" class="rnk-gold-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider no-underline mr-2">
                <i class="fa-solid fa-location-dot"></i> Get Directions
            </a>
        ` : (isEditMode ? `<span class="rnk-gold-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider opacity-70 mr-2"><i class="fa-solid fa-location-dot"></i> Map</span>` : '');

        const reminderBtnHtml = isEditMode
            ? `<span class="rnk-gold-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider opacity-70"><i class="fa-regular fa-bell"></i> Reminder</span>`
            : `<button type="button" class="rnk-gold-btn inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider" onclick="addWeddingReminder(this)" data-title="${escape(encodeURIComponent(`${eventTitle} — ${groomName} & ${brideName}`))}" data-location="${escape(encodeURIComponent(`${eventVenue}, ${eventAddress}`))}" data-date="${d?.mainEvent?.date || ''}" data-time="${escape(eventTime)}"><i class="fa-regular fa-bell"></i> Reminder</button>`;

        const mainEventSection = edit('mainEvent', `
            <div class="rnk-card p-6 my-6 text-center">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center rnk-glow" style="border: 1.5px solid ${colors.primary}; color: ${colors.primary}; background: rgba(0,0,0,0.25);">
                    <i class="fa-solid fa-calendar-heart text-base"></i>
                </div>
                
                <h2 class="font-serif text-xl font-bold tracking-wider uppercase rnk-gold-gradient mb-3">
                    ${eventTitle}
                </h2>

                <div class="space-y-1.5 mb-4 text-xs md:text-sm">
                    <p class="font-semibold tracking-wider opacity-95">
                        <i class="fa-regular fa-calendar-days mr-2" style="color: ${colors.primary};"></i> ${eventDate}
                    </p>
                    <p class="opacity-85 font-light">
                        <i class="fa-regular fa-clock mr-2" style="color: ${colors.primary};"></i> ${displayTime}
                    </p>
                </div>

                <div class="py-2.5 px-4 rounded-xl inline-block mb-2" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(212, 175, 55, 0.2);">
                    <p class="font-medium text-xs tracking-wide rnk-gold-gradient">${eventVenue}</p>
                    <p class="text-[11px] opacity-75 tracking-wider mt-0.5">${eventAddress}</p>
                </div>

                ${venueImageHtml}

                <div class="mt-5 pt-4 flex justify-center items-center gap-1" style="border-top: 1.5px solid rgba(212, 175, 55, 0.25);">
                    ${mapBtnHtml}
                    ${reminderBtnHtml}
                </div>
            </div>
        `, 'showEvent');

        const calendarSection = edit('mainEvent', `
            <div class="bs-calendar">
                <h3><i class="fa-regular fa-calendar-days"></i> ${monthLabel}</h3>
                ${calendar}
            </div>
        `, 'showEvent');

        const monogramSection = edit('couple', `
            <div class="text-center my-6">
                <div class="w-16 h-16 mx-auto rounded-full border-2 border-dashed flex items-center justify-center font-serif text-xl font-bold rnk-gold-gradient" style="border-color: ${colors.primary};">
                    ${displayInitials}
                </div>
            </div>
        `, 'showCouple');

        let blessingActionHtml = '';
        if (!isEditMode) {
            blessingActionHtml = `
                <div class="text-center my-6">
                    <button onclick="if(typeof window.triggerConfettiShower === 'function'){ window.triggerConfettiShower(); } else { alert('Barakallahu lakuma! Blessings showered.'); }" class="rnk-gold-btn px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto">
                        <i class="fa-solid fa-sparkles"></i> Shower Blessings
                    </button>
                </div>
            `;
        }

        const footerSection = `
            <div class="text-center mt-10 pt-4 pb-2 relative opacity-70">
                <div class="w-12 h-0.5 mx-auto mb-3 opacity-40" style="background: ${colors.primary};"></div>
                <p class="font-serif italic text-sm rnk-gold-gradient">${groomName} &amp; ${brideName}</p>
                <p class="text-[9px] tracking-[0.25em] uppercase mt-1 opacity-70">Royal Nikah Celebration</p>
            </div>
        `;

        // Beautiful Adaptable RSVP Form for Guests
        const rsvpHtml = (set.showRsvp && !isEditMode) ? `
            <div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto rnk-card shadow-xl" style="font-family: 'Poppins', sans-serif; border: 1px solid ${colors.primary}40; color: ${colors.text};">
                <h3 class="text-lg font-bold mb-2 rnk-gold-gradient">Will You Attend?</h3>
                <p class="text-[11px] opacity-75 mb-4">Please let us know if you can make it to our celebration.</p>
                ${window.renderPublicRsvpForm ? window.renderPublicRsvpForm(colors, isEditMode, true) : ''}
            </div>
        ` : (isEditMode && set.showRsvp ? `<div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto border border-dashed text-xs opacity-75" style="border-color: ${colors.primary}80; color: ${colors.text};">RSVP Form Area (Enabled)</div>` : '');

        return `
            ${styles}
            <div class="rnk-container">
                <div class="rnk-border-outer"></div>
                <div class="rnk-border-inner"></div>
                <div class="rnk-corner rnk-corner-tl"></div>
                <div class="rnk-corner rnk-corner-tr"></div>
                <div class="rnk-corner rnk-corner-bl"></div>
                <div class="rnk-corner rnk-corner-br"></div>

                <div class="relative z-10">
                    ${mandalaSvg}
                    ${bismillahSection}
                    ${headingSection}
                    ${coupleSection}
                    ${messageSection}
                    ${quranSection}
                    ${calendarSection}
                    ${set.showCountdown ? edit('mainEvent', window.renderCountdownHtml ? window.renderCountdownHtml(d, colors, 'my-5') : '', 'showCountdown') : ''}
                    ${mainEventSection}
                    ${rsvpHtml}
                    ${blessingActionHtml}
                    ${footerSection}
                </div>
            </div>
        `;
    }
});
