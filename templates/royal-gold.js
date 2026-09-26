const royalGoldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#FFFBF0"/>
    <rect x="15" y="15" width="370" height="270" rx="15" fill="none" stroke="#B38A4A" stroke-width="2" opacity="0.8"/>
    <rect x="20" y="20" width="360" height="260" rx="12" fill="none" stroke="#B38A4A" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
    <circle cx="200" cy="115" r="30" fill="none" stroke="#B38A4A" stroke-width="2"/>
    <text x="200" y="118" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="20" font-weight="bold" fill="#B38A4A">R &amp; G</text>
    <text x="50%" y="180" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="24" font-weight="bold" fill="#3E2723">Royal Gold</text>
    <text x="50%" y="210" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" letter-spacing="3" fill="#B38A4A" opacity="0.9">ELEGANT THEME</text>
</svg>`;
const royalGoldThumb = 'data:image/svg+xml;base64,' + btoa(royalGoldSvg);

window.registerTemplate({
    id: 'royal-gold',
    name: 'Royal Islamic Gold',
    thumb: royalGoldThumb,
    scrollable: true,
    
    // Default colors and fonts if the user hasn't customized them yet
    defaults: { 
        colors: { 
            primary: '#B38A4A', // Gold
            bg: '#FFFBF0',      // Cream/Ivory
            text: '#3E2723'     // Dark Brown
        }, 
        fonts: { 
            heading: "'Playfair Display', serif" 
        } 
    },

    render: function(d, isEditMode) {
        // Fallback to defaults if data is missing
        const colors = d.design?.colors?.primary ? d.design.colors : this.defaults.colors;
        const fonts = d.design?.fonts || this.defaults.fonts;
        const set = d.settings || {};

        // Safe HTML escaping helper
        const escape = (val, fallback = '') => String(val || fallback)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Helper function to create clickable/editable blocks in Edit Mode
        const wrap = (key, content, hideKey) => {
            const isHidden = (hideKey && set[hideKey] === false);
            // In public view, completely remove hidden sections
            if(!isEditMode) return isHidden ? '' : content;
            
            // In edit mode, wrap with a clickable div and a pen icon
            return `<div class="editable-block ${isHidden ? 'hidden-block' : ''} w-full transition-all" data-edit="${key}">
                        <div class="edit-badge shadow-lg"><i class="fa-solid fa-pen"></i></div>
                        ${content}
                    </div>`;
        };

        const groomName = escape(d.couple?.groom, 'Groom Name');
        const brideName = escape(d.couple?.bride, 'Bride Name');
        
        // Custom Initials / Monogram
        const defaultInitials = `${groomName.charAt(0)} &amp; ${brideName.charAt(0)}`;
        const displayInitials = d.couple?.customInitials ? escape(d.couple.customInitials) : defaultInitials;

        // Start and Optional End Time
        const formatTime = (t) => window.formatTimeTo12Hour ? window.formatTimeTo12Hour(t) : t;
        const eventTime = formatTime(escape(d.mainEvent?.time, '11:00 AM'));
        const endTime = d.mainEvent?.endTime ? formatTime(escape(d.mainEvent.endTime)) : '';
        const displayTime = endTime ? `${eventTime} - ${endTime}` : eventTime;

        const eventVenue = escape(d.mainEvent?.venue, 'Grand Wedding Hall');
        const eventAddress = escape(d.mainEvent?.address, 'City, Area');

        // Handle Auditorium / Venue Image
        let venueImageHtml = '';
        if (d.mainEvent?.venueImage) {
            venueImageHtml = `<div class="w-full max-w-[340px] h-[160px] rounded-2xl overflow-hidden shadow-md my-4 mx-auto border" style="border-color: ${colors.primary}40;"><img src="${d.mainEvent.venueImage}" class="w-full h-full object-cover"></div>`;
        } else {
            // Simple icon only, no large ugly box
            venueImageHtml = `<div class="text-center my-4 text-3xl" style="color: ${colors.primary};">
                                <i class="fa-solid fa-hotel animate-pulse"></i>
                             </div>`;
        }

        // Generate Calendar View with Animated Pulsing Date
        const dateParts = /^\d{4}-\d{2}-\d{2}$/.test(d.mainEvent?.date || '') ? d.mainEvent.date.split('-').map(Number) : null;
        const selectedDate = dateParts ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;
        const monthLabel = selectedDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate) : 'Select Wedding Date';
        
        const calendar = (() => {
            if (!selectedDate) return '<div class="bs-calendar-grid bs-calendar-empty text-brown-800/60">Choose the wedding date in Event Details</div>';
            const year = selectedDate.getFullYear(), month = selectedDate.getMonth(), selectedDay = selectedDate.getDate();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
            const cells = Array.from({ length: firstDay }, () => '<span></span>');
            for (let day = 1; day <= daysInMonth; day++) {
                cells.push(`<span class="${day === selectedDay ? 'rg-selected-day' : ''}">${day}${day === selectedDay ? '<b>♥</b>' : ''}</span>`);
            }
            return `<div class="bs-calendar-week text-brown-800/50">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<span>${day}</span>`).join('')}</div><div class="bs-calendar-grid">${cells.join('')}</div>`;
        })();

        // Beautiful Adaptable RSVP Form for Guests (styled for light ivory theme)
        const rsvpHtml = (set.showRsvp && !isEditMode) ? `
            <div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto shadow-xl" style="font-family: 'Poppins', sans-serif; background: rgba(0,0,0,0.02); border: 1px solid ${colors.primary}50; color: ${colors.text};">
                <h3 class="text-lg font-bold mb-2" style="color: ${colors.primary}">Will You Attend?</h3>
                <p class="text-[11px] opacity-75 mb-4">Please let us know if you can make it to our celebration.</p>
                ${window.renderPublicRsvpForm ? window.renderPublicRsvpForm(colors, isEditMode, false) : ''}
            </div>
        ` : (isEditMode && set.showRsvp ? `<div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto border border-dashed text-xs opacity-75" style="border-color: ${colors.primary}80; color: ${colors.text};">RSVP Form Area (Enabled)</div>` : '');

        let html = `
        <style>
            .bs-calendar{margin:25px auto;padding:20px 10px;border-top:1px solid ${colors.primary}40;border-bottom:1px solid ${colors.primary}40;text-align:center;width:100%}
            .bs-calendar h3{font-size:20px;margin:0 0 12px;color:${colors.primary}}
            .bs-calendar-week{display:grid;grid-template-columns:repeat(7,1fr);font-size:11px;color:rgba(0,0,0,.6);margin-bottom:8px}
            .bs-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:10px 4px;font-size:14px}
            .bs-calendar-grid span{position:relative;display:grid;place-items:center;min-height:26px}
            
            @keyframes rgPulse{0%{transform:scale(1);box-shadow:0 0 0 0 ${colors.primary}65}70%{transform:scale(1.08);box-shadow:0 0 0 10px ${colors.primary}00}100%{transform:scale(1);box-shadow:0 0 0 0 ${colors.primary}00}}
            .rg-selected-day{background:${colors.primary}30;border-radius:50%;font-weight:700;animation:rgPulse 2s infinite;border:2px solid ${colors.primary}}
            .rg-selected-day b{position:absolute;right:-2px;top:-6px;color:#e11d48;font-size:12px}

            .rg-monogram {
                width: 60px;
                height: 60px;
                margin: 20px auto;
                border-radius: 50%;
                border: 2px solid ${colors.primary};
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: ${fonts.heading};
                font-size: 16px;
                font-weight: bold;
                color: ${colors.primary};
            }
            .rg-reminder-btn {
                display: inline-block;
                border: 2px solid ${colors.primary};
                background: transparent;
                color: ${colors.primary};
                padding: 10px 30px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.2s;
                margin-top: 15px;
            }
            .rg-reminder-btn:hover {
                background: ${colors.primary};
                color: ${colors.bg};
            }
        </style>
        <div class="w-full min-h-[900px] h-full relative p-6 md:p-10 flex flex-col items-center text-center font-sans overflow-hidden" 
             style="background-color: ${colors.bg}; color: ${colors.text};">
            
            <!-- Decorative Outer Border -->
            <div class="absolute inset-4 md:inset-6 border-[3px] rounded-2xl pointer-events-none opacity-60 z-0" 
                 style="border-color: ${colors.primary};"></div>
            <div class="absolute inset-5 md:inset-7 border border-dashed rounded-xl pointer-events-none opacity-40 z-0" 
                 style="border-color: ${colors.primary};"></div>
            
            <!-- Main Content Container -->
            <div class="relative z-10 w-full flex flex-col items-center py-10 my-auto max-w-[350px]">
        `;
        
        // 1. Bismillah (Content Modal)
        html += wrap('content', `
            <div class="font-arabic text-3xl md:text-4xl mb-8 font-bold tracking-wide drop-shadow-sm" 
                 style="color: ${colors.primary}; font-family: 'Amiri', serif;">
                 بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </div>
        `, 'showBismillah');

        // 2. Top Heading (Content Modal)
        html += wrap('content', `
            <div class="text-[10px] md:text-xs uppercase tracking-[0.35em] mb-10 font-bold opacity-80" 
                 style="color: ${colors.text}">
                 ${d.content?.heading || 'We Cordially Invite You'}
            </div>
        `);
        
        // 3. Couple Section (Couple Modal)
        let photosHtml = '';
        if (d.couple?.groomPhoto || d.couple?.bridePhoto) {
            photosHtml = `<div class="flex justify-center items-center gap-6 mb-6 mt-4">`;
            if (d.couple.groomPhoto) {
                photosHtml += `<div class="flex flex-col items-center gap-1.5">
                                 <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 shadow-md overflow-hidden shrink-0 flex items-center justify-center" style="border-color: ${colors.primary}; bg: rgba(255,255,255,0.05);">
                                     <img src="${d.couple.groomPhoto}" class="w-full h-full rounded-full object-cover" style="aspect-ratio: 1/1;">
                                 </div>
                                 <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${colors.primary};">Groom</span>
                             </div>`;
            }
            if (d.couple.groomPhoto && d.couple.bridePhoto) {
                photosHtml += `<div class="text-serif text-lg italic font-bold my-auto" style="color: ${colors.primary};">&amp;</div>`;
            }
            if (d.couple.bridePhoto) {
                photosHtml += `<div class="flex flex-col items-center gap-1.5">
                                 <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 shadow-md overflow-hidden shrink-0 flex items-center justify-center" style="border-color: ${colors.primary}; bg: rgba(255,255,255,0.05);">
                                     <img src="${d.couple.bridePhoto}" class="w-full h-full rounded-full object-cover" style="aspect-ratio: 1/1;">
                                 </div>
                                 <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${colors.primary};">Bride</span>
                             </div>`;
            }
            photosHtml += `</div>`;
        }

        html += wrap('couple', `
            <div class="w-full mb-10">
                ${photosHtml}
                <h1 class="text-4xl md:text-5xl font-bold mb-3 drop-shadow-sm leading-tight" 
                    style="font-family: ${fonts.heading}; color: ${colors.primary}">${groomName}</h1>
                
                <div class="flex items-center justify-center gap-3 my-4 opacity-70">
                    <div class="h-px w-12" style="background-color: ${colors.primary}"></div>
                    <span class="text-xl md:text-2xl italic font-serif" style="color: ${colors.primary}">&amp;</span>
                    <div class="h-px w-12" style="background-color: ${colors.primary}"></div>
                </div>
                
                <h1 class="text-4xl md:text-5xl font-bold mt-3 drop-shadow-sm leading-tight" 
                    style="font-family: ${fonts.heading}; color: ${colors.primary}">${brideName}</h1>
            </div>
        `);

        // Custom initials Monogram
        html += wrap('couple', `
            <div class="rg-monogram">${displayInitials}</div>
        `);

        // 4. Message Text (Content Modal)
        html += wrap('content', `
            <p class="text-sm md:text-base leading-relaxed mb-10 px-4 opacity-80 whitespace-pre-line font-medium">
                ${d.content?.message || 'to join us on our special day\nand bless our new beginning.'}
            </p>
        `);
        
        // 5. Quranic Verse (Quran Modal)
        html += wrap('quran', `
            <div class="my-8 py-6 w-[85%] mx-auto relative">
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-px opacity-50" style="background-color: ${colors.primary}"></div>
                <p class="font-arabic text-2xl md:text-3xl mb-3 leading-loose" style="color: ${colors.primary}; font-family: 'Amiri', serif;">
                    ${d.content?.arabicText || 'وَخَلَقْنَاكُمْ أَزْوَاجًا'}
                </p>
                <p class="text-[10px] md:text-xs uppercase tracking-widest opacity-70 font-semibold">
                    ${d.content?.translation || '"And We created you in pairs"'}
                </p>
                <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-px opacity-50" style="background-color: ${colors.primary}"></div>
            </div>
        `, 'showQuote');

        // Calendar block
        html += wrap('mainEvent', `
            <div class="bs-calendar">
                <h3><i class="fa-regular fa-calendar-days"></i> ${monthLabel}</h3>
                ${calendar}
            </div>
        `);

        if (set.showCountdown) {
            html += wrap('mainEvent', window.renderCountdownHtml ? window.renderCountdownHtml(d, colors, 'my-5') : '', 'showCountdown');
        }

        // 6. Main Event (Main Event Modal)
        const mapBtnHtml = (d.mainEvent?.mapUrl && !isEditMode) 
            ? `<a href="${safeMapUrl}" target="_blank" class="inline-block text-[10px] uppercase tracking-wider font-bold border-2 px-6 py-2 rounded-full hover:shadow-md transition-all active:scale-95 mr-2" style="border-color: ${colors.primary}; color: ${colors.primary}">Get Directions</a>`
            : (isEditMode ? `<div class="inline-block text-[10px] uppercase tracking-wider font-bold border-2 px-6 py-2 rounded-full opacity-80 mr-2" style="border-color: ${colors.primary}; color: ${colors.primary}">Directions</div>` : '');

        const reminderBtnHtml = isEditMode
            ? `<span class="rg-reminder-btn"><i class="fa-regular fa-bell"></i> Reminder</span>`
            : `<button type="button" class="rg-reminder-btn" onclick="addWeddingReminder(this)" data-title="${escape(encodeURIComponent(`${d.mainEvent?.title || 'Nikah Ceremony'} — ${groomName} & ${brideName}`))}" data-location="${escape(encodeURIComponent(`${eventVenue}, ${eventAddress}`))}" data-date="${d.mainEvent?.date || ''}" data-time="${escape(eventTime)}"><i class="fa-regular fa-bell"></i> Reminder</button>`;

        html += wrap('mainEvent', `
            <div class="bg-black/5 backdrop-blur-sm rounded-3xl p-8 w-full shadow-inner border border-black/5 mt-4">
                <h3 class="text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-4" 
                    style="color: ${colors.primary}">${d.mainEvent?.title || 'Nikah Ceremony'}</h3>
                
                <div class="font-semibold text-xl mb-1">${d.mainEvent?.date || 'Your Wedding Date'}</div>
                <div class="text-sm opacity-80 mb-6 font-medium">${displayTime}</div>
                
                <div class="font-bold text-lg leading-tight mb-2">${eventVenue}</div>
                <div class="text-xs md:text-sm opacity-70 mb-2 leading-relaxed">${eventAddress}</div>
                
                ${venueImageHtml}

                <div class="mt-4 pt-3 flex justify-center items-center gap-1 border-t border-black/5">
                    ${set.showMap !== false ? mapBtnHtml : ''}
                    ${reminderBtnHtml}
                </div>
            </div>
        `);

        html += rsvpHtml;

        html += `
            </div>
        </div>`;
        
        return html;
    }
});
