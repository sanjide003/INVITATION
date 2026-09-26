const auroraLuxeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#0A0A0B"/>
    <circle cx="350" cy="50" r="100" fill="#D8B27C" opacity="0.1"/>
    <circle cx="50" cy="250" r="100" fill="#7355A4" opacity="0.1"/>
    <rect x="20" y="20" width="360" height="260" rx="10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <rect x="25" y="25" width="350" height="250" rx="8" fill="none" stroke="#D8B27C" stroke-width="1" opacity="0.4"/>
    <text x="50%" y="130" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="32" font-weight="bold" fill="#D8B27C">A U R O R A</text>
    <text x="50%" y="175" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="18" font-style="italic" fill="#F7F2EA">L u x e</text>
    <line x1="170" y1="210" x2="230" y2="210" stroke="#D8B27C" stroke-width="1.5" opacity="0.7"/>
</svg>`;
const auroraLuxeThumb = 'data:image/svg+xml;base64,' + btoa(auroraLuxeSvg);

window.registerTemplate({
    id: 'aurora-luxe',
    name: 'Aurora Luxe',
    thumb: auroraLuxeThumb,
    freeform: false,
    scrollable: true,
    defaults: {
        colors: {
            primary: '#D8B27C',
            bg: '#0A0A0B',
            text: '#F7F2EA'
        },
        fonts: {
            heading: "'Playfair Display', serif"
        }
    },
    render: function(d, isEditMode) {
        const colors = d.design?.colors || this.defaults.colors;
        const fonts = d.design?.fonts || this.defaults.fonts;
        const set = d.settings || {};
        const couple = d.couple || {};
        const content = d.content || {};
        const event = d.mainEvent || {};
        const safe = (value, fallback = '') => String(value ?? fallback)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const editWrap = (key, contentHtml, hideKey) => {
            const hidden = hideKey && set[hideKey] === false;
            if (!isEditMode) return hidden ? '' : contentHtml;
            return `<div class="al-editable ${hidden ? 'al-hidden' : ''}" data-edit="${key}">
                <span class="al-edit-badge"><i class="fa-solid fa-pen"></i></span>${contentHtml}
            </div>`;
        };

        const primary = safe(colors.primary, '#D8B27C');
        const bg = safe(colors.bg, '#0A0A0B');
        const text = safe(colors.text, '#F7F2EA');
        const groom = safe(couple.groom, 'Groom Name');
        const bride = safe(couple.bride, 'Bride Name');
        
        // Handle Couple Initials / Monogram Override
        const initials = couple.customInitials ? safe(couple.customInitials) : `${groom.charAt(0)}${bride.charAt(0)}`.toUpperCase();
        
        const heading = safe(content.heading, 'Together with their families');
        const message = safe(content.message, 'Invite you to celebrate a beautiful beginning, a promise made for a lifetime.');
        const arabic = safe(content.arabicText, 'وَخَلَقْنَاكُمْ أَزْوَاجًا');
        const translation = safe(content.translation, 'And We created you in pairs');
        const eventTitle = safe(event.title, 'The Nikah Ceremony');
        const date = safe(event.date, 'Your Wedding Date');
        
        // Handle Start & Optional End Time
        const formatTime = (t) => window.formatTimeTo12Hour ? window.formatTimeTo12Hour(t) : t;
        const time = formatTime(safe(event.time, '11:00 AM'));
        const endTime = event.endTime ? formatTime(safe(event.endTime)) : '';
        const displayTime = endTime ? `${time} - ${endTime}` : time;

        const venue = safe(event.venue, 'Grand Wedding Hall');
        const address = safe(event.address, 'City, Area');
        const map = event.mapUrl ? safe(event.mapUrl) : '';

        // Display portrait card if the user uploads a photo, otherwise display an elegant monogram placeholder
        let portraitsHtml = '';
        if (couple.groomPhoto || couple.bridePhoto) {
            portraitsHtml = `<div class="flex justify-center items-center gap-6 mb-6 mt-4 w-full">`;
            if (couple.groomPhoto) {
                portraitsHtml += `<div class="flex flex-col items-center gap-1.5">
                                     <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 shadow-lg overflow-hidden shrink-0 flex items-center justify-center" style="border-color: ${primary}; bg: rgba(255,255,255,0.05);">
                                         <img src="${couple.groomPhoto}" class="w-full h-full rounded-full object-cover" style="aspect-ratio: 1/1;">
                                     </div>
                                     <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${primary};">Groom</span>
                                 </div>`;
            }
            if (couple.groomPhoto && couple.bridePhoto) {
                portraitsHtml += `<div class="text-serif text-lg italic font-bold my-auto" style="color: ${primary};">&amp;</div>`;
            }
            if (couple.bridePhoto) {
                portraitsHtml += `<div class="flex flex-col items-center gap-1.5">
                                     <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 shadow-lg overflow-hidden shrink-0 flex items-center justify-center" style="border-color: ${primary}; bg: rgba(255,255,255,0.05);">
                                         <img src="${couple.bridePhoto}" class="w-full h-full rounded-full object-cover" style="aspect-ratio: 1/1;">
                                     </div>
                                     <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${primary};">Bride</span>
                                 </div>`;
            }
            portraitsHtml += `</div>`;
        } else {
            portraitsHtml = `<div class="my-6 mx-auto w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-serif text-3xl font-bold tracking-widest text-accent" style="color: ${primary};">
                                ${initials}
                             </div>`;
        }

        // Handle Auditorium / Venue Image
        let venueImageHtml = '';
        if (event.venueImage) {
            venueImageHtml = `<div class="w-full h-[140px] rounded-xl overflow-hidden shadow-md my-3 border border-white/20"><img src="${event.venueImage}" class="w-full h-full object-cover"></div>`;
        } else {
            // Simple icon only, no large ugly box
            venueImageHtml = `<div class="text-center my-4 text-3xl" style="color: ${primary};">
                                <i class="fa-solid fa-hotel"></i>
                             </div>`;
        }

        // Generate Calendar View with Animated Pulsing Date
        const dateParts = /^\d{4}-\d{2}-\d{2}$/.test(event.date || '') ? event.date.split('-').map(Number) : null;
        const selectedDate = dateParts ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;
        const monthLabel = selectedDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate) : 'Select Wedding Date';
        
        const calendar = (() => {
            if (!selectedDate) return '<div class="al-calendar-empty">Select wedding date in event details</div>';
            const year = selectedDate.getFullYear(), month = selectedDate.getMonth(), selectedDay = selectedDate.getDate();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
            const cells = Array.from({ length: firstDay }, () => '<span></span>');
            for (let day = 1; day <= daysInMonth; day++) {
                cells.push(`<span class="${day === selectedDay ? 'al-selected-day' : ''}">${day}${day === selectedDay ? '<b>♥</b>' : ''}</span>`);
            }
            return `<div class="al-calendar-week">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<span>${day}</span>`).join('')}</div><div class="al-calendar-grid">${cells.join('')}</div>`;
        })();

        // Map and Reminder buttons in standard layout
        const mapBtnHtml = set.showMap !== false ? (map && !isEditMode ? `<a class="al-map" href="${map}" target="_blank" rel="noopener"><i class="fa-solid fa-location-arrow"></i> Directions</a>` : `<span class="al-map"><i class="fa-solid fa-location-arrow"></i> Directions</span>`) : '';
        const reminderBtnHtml = isEditMode 
            ? `<span class="al-map inline-flex cursor-pointer"><i class="fa-regular fa-bell"></i> Reminder</span>` 
            : `<button type="button" class="al-map inline-flex" onclick="addWeddingReminder(this)" data-title="${safe(encodeURIComponent(`${eventTitle} — ${groom} & ${bride}`))}" data-location="${safe(encodeURIComponent(`${venue}, ${address}`))}" data-date="${event.date || ''}" data-time="${safe(time)}"><i class="fa-regular fa-bell"></i> Reminder</button>`;

        // Beautiful Adaptable RSVP Form for Guests
        const rsvpHtml = (set.showRsvp && !isEditMode) ? `
            <div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto shadow-xl" style="font-family: 'Poppins', sans-serif; background: rgba(255,255,255,0.05); border: 1px solid ${primary}40; color: ${text};">
                <h3 class="text-lg font-bold mb-2" style="color: ${primary}">Will You Attend?</h3>
                <p class="text-[11px] opacity-75 mb-4">Please let us know if you can make it to our celebration.</p>
                ${window.renderPublicRsvpForm ? window.renderPublicRsvpForm(colors, isEditMode, true) : ''}
            </div>
        ` : (isEditMode && set.showRsvp ? `<div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto border border-dashed text-xs opacity-75" style="border-color: ${primary}80; color: ${text};">RSVP Form Area (Enabled)</div>` : '');

        return `
<style>
.al-root{--al-primary:${primary};--al-bg:${bg};--al-text:${text};--al-heading:${fonts.heading || "'Playfair Display',serif"};position:relative;min-height:100%;overflow:hidden;background:${bg};color:${text};font-family:Poppins,sans-serif;isolation:isolate}
.al-root *{box-sizing:border-box}
.al-noise{position:absolute;inset:0;opacity:.075;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E")}
.al-glow{position:absolute;border-radius:999px;filter:blur(55px);pointer-events:none;opacity:.22;animation:alFloat 9s ease-in-out infinite alternate}
.al-glow.a{width:240px;height:240px;right:-100px;top:90px;background:${primary}}
.al-glow.b{width:190px;height:190px;left:-100px;bottom:170px;background:#7355A4;animation-delay:-3s}
.al-orb{position:absolute;width:330px;height:330px;right:-210px;top:420px;border:1px solid rgba(255,255,255,.12);border-radius:50%;animation:alSpin 28s linear infinite}
.al-orb:before,.al-orb:after{content:"";position:absolute;inset:30px;border:1px solid rgba(255,255,255,.07);border-radius:50%}
.al-orb:after{inset:72px}
.al-shell{position:relative;z-index:2;min-height:800px;padding:26px 22px 34px;display:flex;flex-direction:column}
.al-top{display:flex;align-items:center;justify-content:space-between;animation:alRise .9s cubic-bezier(.2,.8,.2,1) both}
.al-monogram{height:38px;padding:0 15px;border:1px solid rgba(255,255,255,.24);border-radius:999px;display:flex;align-items:center;justify-content:center;color:var(--al-primary);font-family:var(--al-heading);font-size:13px;font-weight:700;letter-spacing:0.05em}
.al-label{font-size:8px;letter-spacing:.32em;text-transform:uppercase;opacity:.56}
.al-bismillah{margin-top:38px;text-align:center;color:var(--al-primary);font-family:Amiri,serif;font-size:23px;animation:alReveal 1.1s .15s both}
.al-hero{text-align:center;margin-top:24px}
.al-heading{font-size:9px;letter-spacing:.25em;text-transform:uppercase;opacity:.58;margin-bottom:16px;animation:alReveal 1s .2s both}
.al-names{font-family:var(--al-heading);font-size:46px;line-height:.91;font-weight:500;letter-spacing:-.035em;animation:alRise 1s .3s both}
.al-name{display:block}
.al-amp{display:block;font-family:var(--al-heading);font-size:20px;color:var(--al-primary);font-style:italic;margin:8px 0}
.al-rule{width:72px;height:1px;background:var(--al-primary);opacity:.55;margin:20px auto}
.al-message{max-width:315px;margin:0 auto;font-size:10px;line-height:1.9;opacity:.67;animation:alReveal 1s .55s both}
.al-portraits{display:flex;justify-content:center;align-items:center;margin:26px 0 25px;animation:alRise 1.1s .45s both}
.al-photo{width:106px;height:132px;object-fit:cover;border-radius:54px 54px 10px 10px;border:1px solid rgba(255,255,255,.22);padding:4px;background:rgba(255,255,255,.04);box-shadow:0 18px 45px rgba(0,0,0,.35)}
.al-photo:first-child{transform:rotate(-5deg) translateX(8px)}
.al-photo:last-child{transform:rotate(5deg) translateX(-8px)}
.al-photo-mid{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:${bg};border:1px solid var(--al-primary);color:var(--al-primary);z-index:3;font-family:var(--al-heading);font-size:20px}
.al-quote{margin:4px auto 25px;padding:17px 10px;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12);text-align:center;animation:alReveal 1s .65s both}
.al-arabic{font-family:Amiri,serif;font-size:23px;line-height:1.5;color:var(--al-primary)}
.al-translation{font-size:8px;letter-spacing:.08em;opacity:.5;margin-top:6px}
.al-event{position:relative;margin-top:auto;padding:21px;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025));backdrop-filter:blur(14px);box-shadow:0 22px 55px rgba(0,0,0,.22);animation:alRise 1.1s .75s both}
.al-event:before{content:"";position:absolute;inset:5px;border:1px solid rgba(216,178,124,.13);border-radius:18px;pointer-events:none}
.al-event-title{font-size:8px;letter-spacing:.25em;text-transform:uppercase;color:var(--al-primary);margin-bottom:12px}
.al-date{font-family:var(--al-heading);font-size:22px;line-height:1.1}
.al-time{font-size:9px;opacity:.55;margin-top:4px}
.al-venue{font-size:11px;font-weight:600;margin-top:16px}
.al-address{font-size:8px;opacity:.5;margin-top:3px}
.al-map{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:9px 15px;border:1px solid var(--al-primary);border-radius:999px;color:var(--al-primary);font-size:8px;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;transition:.3s ease;margin-right:8px;cursor:pointer;background:transparent}
.al-map:hover{background:var(--al-primary);color:${bg};transform:translateY(-2px)}
.al-footer{text-align:center;font-size:7px;letter-spacing:.22em;text-transform:uppercase;opacity:.35;margin-top:20px}
.al-editable{position:relative;cursor:pointer;border-radius:12px;transition:.2s ease}
.al-editable:hover{outline:2px solid #3B82F6;outline-offset:3px;background:rgba(59,130,246,.05)}
.al-edit-badge{position:absolute;right:5px;top:5px;width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#3B82F6;color:#fff;font-size:10px;opacity:0;transform:scale(.75);transition:.2s ease;z-index:20;box-shadow:0 5px 15px rgba(0,0,0,.25)}
.al-editable:hover .al-edit-badge{opacity:1;transform:scale(1)}
.al-hidden{opacity:.3;filter:grayscale(1)}

.al-calendar{margin:25px auto;padding:15px 10px;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1);text-align:center}
.al-calendar h3{font-family:var(--al-heading);font-size:18px;margin:0 0 10px;color:var(--al-primary)}
.al-calendar-week{display:grid;grid-template-columns:repeat(7,1fr);font-size:9px;color:rgba(255,255,255,.5);margin-bottom:8px}
.al-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px 4px;font-size:11px}
.al-calendar-grid span{position:relative;display:grid;place-items:center;min-height:22px}
@keyframes alPulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(216,178,124,.5)}70%{transform:scale(1.08);box-shadow:0 0 0 6px rgba(216,178,124,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(216,178,124,0)}}
.al-selected-day{background:rgba(216,178,124,.3);border-radius:50%;font-weight:700;animation:alPulse 2s infinite;border:1.5px solid var(--al-primary)}
.al-selected-day b{position:absolute;right:-2px;top:-4px;color:var(--al-primary);font-size:10px}
.al-calendar-empty{font-size:11px;opacity:.5}

@keyframes alRise{from{opacity:0;transform:translateY(22px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes alReveal{from{opacity:0;clip-path:inset(0 0 100% 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes alFloat{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(15px,-18px,0) scale(1.08)}}
@keyframes alSpin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.al-root *,.al-glow,.al-orb{animation:none!important;transition:none!important}}
</style>

<div class="al-root">
    <div class="al-noise"></div><div class="al-glow a"></div><div class="al-glow b"></div><div class="al-orb"></div>
    <div class="al-shell">
        <div class="al-top">
            ${editWrap('couple', `<div class="al-monogram">${initials}</div>`, 'showCouple')}
        </div>

        ${editWrap('bismillah', `<div class="al-bismillah">${safe(content.bismillah, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ')}</div>`, 'showBismillah')}

        <div class="al-hero">
            ${editWrap('heading', `<div class="al-heading">${heading}</div>`, 'showHeading')}
            ${editWrap('couple', `<div class="al-names"><span class="al-name">${groom}</span><span class="al-amp">&amp;</span><span class="al-name">${bride}</span></div>`, 'showCouple')}
            ${editWrap('message', `<div><div class="al-rule"></div><p class="al-message">${message.replace(/\n/g,'<br>')}</p></div>`, 'showMessage')}
        </div>

        ${editWrap('couple', portraitsHtml, 'showCouple')}

        ${editWrap('quran', `<div class="al-quote"><div class="al-arabic">${arabic}</div><div class="al-translation">${translation}</div></div>`, 'showQuote')}

        ${editWrap('mainEvent', `
            <div class="al-calendar">
                <h3><i class="fa-regular fa-calendar-days"></i> ${monthLabel}</h3>
                ${calendar}
            </div>
        `, 'showEvent')}

        ${set.showCountdown ? editWrap('mainEvent', window.renderCountdownHtml ? window.renderCountdownHtml(d, { primary, bg, text }, 'my-5') : '', 'showCountdown') : ''}

        ${editWrap('mainEvent', `<div class="al-event"><div class="al-event-title">${eventTitle}</div><div class="al-date">${date}</div><div class="al-time">${displayTime}</div><div class="al-venue">${venue}</div><div class="al-address">${address}</div>${venueImageHtml}${mapBtnHtml}${reminderBtnHtml}</div>`, 'showEvent')}
        
        ${rsvpHtml}
    </div>
</div>`;
    }
});
