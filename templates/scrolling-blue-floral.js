window.addWeddingReminder = async function(button) {
    const decode = (value) => decodeURIComponent(value || '');
    const title = decode(button.dataset.title) || 'Wedding Invitation';
    const locationStr = decode(button.dataset.location) || 'Wedding Venue';
    const rawDate = button.dataset.date;
    const rawTime = button.dataset.time || '11:00';

    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        if (window.showToast) window.showToast("Calendar date is not set correctly.", "error");
        return;
    }

    // Parse Time (supports 12h/24h formats)
    let hour = 11, minute = 0;
    const match = rawTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
        hour = parseInt(match[1], 10);
        minute = parseInt(match[2], 10);
        const ampm = match[3];
        if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
            if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
        }
    }
    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    // Create event Date objects
    const eventDateTime = new Date(`${rawDate}T${formattedTime}:00`);
    const endDateTime = new Date(eventDateTime.getTime() + (2 * 60 * 60 * 1000)); // default 2 hours duration

    const formatDateIcs = (dateObj) => {
        return dateObj.getUTCFullYear() +
            String(dateObj.getUTCMonth() + 1).padStart(2, '0') +
            String(dateObj.getUTCDate()).padStart(2, '0') + 'T' +
            String(dateObj.getUTCHours()).padStart(2, '0') +
            String(dateObj.getUTCMinutes()).padStart(2, '0') + '00Z';
    };

    const startIcs = formatDateIcs(eventDateTime);
    const endIcs = formatDateIcs(endDateTime);

    // Create and append the modal markup
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'reminder-modal-overlay';
    modalOverlay.className = 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4';
    modalOverlay.style.fontFamily = "'Poppins', sans-serif";

    modalOverlay.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform scale-95 opacity-0 transition-all duration-300 flex flex-col text-gray-800" id="reminder-modal-box">
            <!-- Header -->
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center gap-3">
                    <span class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <i class="fa-regular fa-bell text-lg"></i>
                    </span>
                    <div class="text-left">
                        <h3 class="font-bold text-gray-900 text-base">Add Reminder</h3>
                        <p class="text-xs text-gray-500">Set a reminder on your calendar</p>
                    </div>
                </div>
                <button id="reminder-btn-close" class="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 transition"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <!-- Body -->
            <div class="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 text-left">Select Reminder Offset</label>
                    <div class="grid grid-cols-2 gap-2" id="reminder-presets-container">
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="0">At Event Time</button>
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="1h">1 Hour Before</button>
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="1d">1 Day Before</button>
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="2d">2 Days Before</button>
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="3d">3 Days Before</button>
                        <button type="button" class="reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150" data-val="custom">Custom Time</button>
                    </div>
                </div>
                
                <!-- Custom Date Time Input Group -->
                <div id="reminder-custom-fields" class="hidden space-y-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 transition-all duration-200">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="text-left">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date</label>
                            <input type="date" id="reminder-custom-date" class="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none">
                        </div>
                        <div class="text-left">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Time</label>
                            <input type="time" id="reminder-custom-time" class="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 outline-none">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer Actions -->
            <div class="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-2">
                <button type="button" id="reminder-btn-download" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition duration-200 text-sm">
                    <i class="fa-solid fa-download"></i> Download Calendar File (.ics)
                </button>
                <button type="button" id="reminder-btn-google" class="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition duration-200 text-sm">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5"> Add to Google Calendar
                </button>
            </div>
        </div>
    </div>
    `;

    document.body.appendChild(modalOverlay);

    // Fade and Scale in
    const modalBox = document.getElementById('reminder-modal-box');
    setTimeout(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
        modalBox.classList.add('scale-100', 'opacity-100');
    }, 10);

    let selectedTrigger = '1d'; // default is 1 day before

    // Highlight Preset Button
    const highlightPreset = (val) => {
        document.querySelectorAll('.reminder-preset-btn').forEach(btn => {
            if (btn.getAttribute('data-val') === val) {
                btn.className = 'reminder-preset-btn border-2 border-blue-600 bg-blue-50/50 rounded-xl py-3 px-2 text-center text-xs font-bold text-blue-700 transition duration-150';
            } else {
                btn.className = 'reminder-preset-btn border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl py-3 px-2 text-center text-xs font-semibold text-gray-700 transition duration-150';
            }
        });

        const customFields = document.getElementById('reminder-custom-fields');
        if (val === 'custom') {
            customFields.classList.remove('hidden');
        } else {
            customFields.classList.add('hidden');
        }
    };

    highlightPreset(selectedTrigger);

    // Add preset button listeners
    document.querySelectorAll('.reminder-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTrigger = btn.getAttribute('data-val');
            highlightPreset(selectedTrigger);
        });
    });

    // Close Modal Logic
    const closeModal = () => {
        modalBox.classList.remove('scale-100', 'opacity-100');
        modalBox.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    };

    document.getElementById('reminder-btn-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Helper: Escape ICS text values
    const escapeIcs = (value) => value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

    // Generate Trigger String
    const getTrigger = () => {
        if (selectedTrigger === '0') return 'PT0S';
        if (selectedTrigger === '1h') return '-PT1H';
        if (selectedTrigger === '1d') return '-P1D';
        if (selectedTrigger === '2d') return '-P2D';
        if (selectedTrigger === '3d') return '-P3D';
        if (selectedTrigger === 'custom') {
            const customDateVal = document.getElementById('reminder-custom-date').value;
            const customTimeVal = document.getElementById('reminder-custom-time').value;
            if (!customDateVal || !customTimeVal) {
                if (window.showToast) window.showToast("Please fill out both custom date and time.", "error");
                return null;
            }
            const customReminderDate = new Date(`${customDateVal}T${customTimeVal}:00`);
            const diffMs = eventDateTime.getTime() - customReminderDate.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            // If the custom reminder is after the event, we handle that as a positive/negative trigger
            if (diffMins >= 0) {
                return `-PT${diffMins}M`;
            } else {
                return `PT${Math.abs(diffMins)}M`;
            }
        }
        return '-P1D';
    };

    // Download ICS Logic
    document.getElementById('reminder-btn-download').addEventListener('click', async () => {
        const trigger = getTrigger();
        if (!trigger) return; // invalid custom inputs

        const ics = `BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//Wedding Studio//Reminder//EN\r
BEGIN:VEVENT\r
UID:${Date.now()}@wedding-studio\r
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\r
DTSTART:${startIcs}\r
DTEND:${endIcs}\r
SUMMARY:${escapeIcs(title)}\r
LOCATION:${escapeIcs(locationStr)}\r
BEGIN:VALARM\r
TRIGGER:${trigger}\r
ACTION:DISPLAY\r
DESCRIPTION:Wedding reminder: ${escapeIcs(title)}\r
END:VALARM\r
END:VEVENT\r
END:VCALENDAR`;

        const file = new File([ics], 'wedding-reminder.ics', { type: 'text/calendar' });
        try {
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ title: 'Add wedding reminder', files: [file] });
                closeModal();
                return;
            }
        } catch (error) {
            if (error.name === 'AbortError') return;
        }

        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        closeModal();
        if (window.showToast) window.showToast("Reminder calendar file downloaded!", "success");
    });

    // Google Calendar Logic
    document.getElementById('reminder-btn-google').addEventListener('click', () => {
        const trigger = getTrigger();
        if (!trigger) return; // invalid custom inputs

        const formatGoogleDate = (dateObj) => {
            return dateObj.getUTCFullYear() +
                String(dateObj.getUTCMonth() + 1).padStart(2, '0') +
                String(dateObj.getUTCDate()).padStart(2, '0') + 'T' +
                String(dateObj.getUTCHours()).padStart(2, '0') +
                String(dateObj.getUTCMinutes()).padStart(2, '0') + '00Z';
        };

        const googleStart = formatGoogleDate(eventDateTime);
        const googleEnd = formatGoogleDate(endDateTime);

        const googleUrl = new URL('https://calendar.google.com/calendar/render');
        googleUrl.searchParams.set('action', 'TEMPLATE');
        googleUrl.searchParams.set('text', title);
        googleUrl.searchParams.set('dates', `${googleStart}/${googleEnd}`);
        googleUrl.searchParams.set('details', `Wedding Invitation reminder.\nVenue: ${locationStr}`);
        googleUrl.searchParams.set('location', locationStr);

        window.open(googleUrl.toString(), '_blank');
        closeModal();
    });
};

const blueFloralSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <rect width="100%" height="100%" fill="#30497f"/>
    <rect x="15" y="15" width="370" height="270" rx="10" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
    <circle cx="15" cy="15" r="30" fill="#9fb4ef" opacity="0.3"/>
    <circle cx="385" cy="15" r="30" fill="#9fb4ef" opacity="0.3"/>
    <circle cx="15" cy="285" r="30" fill="#9fb4ef" opacity="0.3"/>
    <circle cx="385" cy="285" r="30" fill="#9fb4ef" opacity="0.3"/>
    <text x="50%" y="140" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="28" font-weight="bold" fill="#ffffff">Blue Floral</text>
    <text x="50%" y="175" dominant-baseline="middle" text-anchor="middle" font-family="'Playfair Display', serif" font-size="18" font-style="italic" fill="#9fb4ef">Story</text>
</svg>`;
const blueFloralThumb = 'data:image/svg+xml;base64,' + btoa(blueFloralSvg);

window.registerTemplate({
    id: 'scrolling-blue-floral',
    name: 'Blue Floral Story',
    thumb: blueFloralThumb,
    freeform: false,
    scrollable: true,
    defaults: { colors: { primary: '#ffffff', bg: '#30497f', text: '#ffffff' }, fonts: { heading: "'Playfair Display', serif" } },
    render: function(d, isEditMode) {
        const colors = { ...this.defaults.colors, ...(d.design?.colors || {}) };
        const content = d.content || {}, couple = d.couple || {}, event = d.mainEvent || {}, set = d.settings || {};
        const escape = (value, fallback = '') => String(value || fallback).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const edit = (key, html, visibilityKey) => {
            if (visibilityKey && set[visibilityKey] === false) return isEditMode ? `<div class="bs-hidden" data-edit="${key}">${html}</div>` : '';
            return isEditMode ? `<div class="bs-editable" data-edit="${key}"><span class="bs-pen"><i class="fa-solid fa-pen"></i></span>${html}</div>` : html;
        };
        const groom = escape(couple.groom, 'Groom Name'), bride = escape(couple.bride, 'Bride Name');
        const dateParts = /^\d{4}-\d{2}-\d{2}$/.test(event.date || '') ? event.date.split('-').map(Number) : null;
        const selectedDate = dateParts ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) : null;
        const date = selectedDate ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(selectedDate) : 'Your Wedding Date';
        const monthLabel = selectedDate ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(selectedDate) : 'Select a date';
        
        // Handle optional End Time display
        const formatTime = (t) => window.formatTimeTo12Hour ? window.formatTimeTo12Hour(t) : t;
        const time = formatTime(escape(event.time, 'Time'));
        const endTime = event.endTime ? formatTime(escape(event.endTime)) : '';
        const displayTime = endTime ? `${time} - ${endTime}` : time;
        
        const title = escape(event.title, 'Nikah Ceremony'), venue = escape(event.venue, 'Venue Name'), address = escape(event.address, 'City, Area');
        const heading = escape(content.heading, 'Save the Date');
        const message = escape(content.message, 'With immense pleasure, we invite you to witness and celebrate our sacred union.');
        const arabic = escape(content.arabicText, 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ');
        const translation = escape(content.translation, 'May Allah bless you, shower His blessings upon you, and bring you together in goodness.');
        const mapUrl = event.mapUrl && /^https?:\/\//i.test(event.mapUrl) ? escape(event.mapUrl) : '';
        const location = mapUrl ? `<a class="bs-pill" href="${mapUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i> Location</a>` : `<span class="bs-pill"><i class="fa-solid fa-location-dot"></i> Location</span>`;
        const flower = (className) => `<div class="bs-flower ${className}" aria-hidden="true"><span style="--r:0deg"></span><span style="--r:45deg"></span><span style="--r:90deg"></span><span style="--r:135deg"></span><span style="--r:180deg"></span><span style="--r:225deg"></span><span style="--r:270deg"></span><span style="--r:315deg"></span><i></i></div>`;
        const reminder = isEditMode ? '<span class="bs-reminder-action"><i class="fa-regular fa-bell"></i> Reminder</span>' : `<button type="button" class="bs-reminder-action" onclick="addWeddingReminder(this)" data-title="${escape(encodeURIComponent(`${title} — ${groom} & ${bride}`))}" data-location="${escape(encodeURIComponent(`${venue}, ${address}`))}" data-date="${event.date || ''}" data-time="${escape(time)}"><i class="fa-regular fa-bell"></i> Add Reminder</button>`;
        
        // Handle Couple Initials Customization
        const defaultInitials = `${groom.charAt(0)} <em>&amp;</em> ${bride.charAt(0)}`;
        const displayInitials = couple.customInitials ? escape(couple.customInitials) : defaultInitials;

        // Handle Auditorium / Venue Image
        let venueImageHtml = '';
        if (event.venueImage) {
            venueImageHtml = `<div class="w-full max-w-[340px] h-[180px] rounded-2xl overflow-hidden shadow-md my-4 mx-auto border-2 border-white/50"><img src="${event.venueImage}" class="w-full h-full object-cover"></div>`;
        } else {
            // Simple icon only, no large ugly box
            venueImageHtml = `<div class="text-center my-4 text-4xl text-[#9fb4ef]">
                                <i class="fa-solid fa-hotel animate-pulse"></i>
                             </div>`;
        }

        const calendar = (() => {
            if (!selectedDate) return '<div class="bs-calendar-grid bs-calendar-empty">Choose the wedding date in Event Details</div>';
            const year = selectedDate.getFullYear(), month = selectedDate.getMonth(), selectedDay = selectedDate.getDate();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
            const cells = Array.from({ length: firstDay }, () => '<span></span>');
            for (let day = 1; day <= daysInMonth; day++) cells.push(`<span class="${day === selectedDay ? 'bs-selected-day' : ''}">${day}${day === selectedDay ? '<b>♥</b>' : ''}</span>`);
            return `<div class="bs-calendar-week">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<span>${day}</span>`).join('')}</div><div class="bs-calendar-grid">${cells.join('')}</div>`;
        })();

        // Beautiful Adaptable RSVP Form for Guests
        const rsvpHtml = (set.showRsvp && !isEditMode) ? `
            <div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto shadow-xl" style="font-family: 'Poppins', sans-serif; background: rgba(255,255,255,0.05); border: 1px solid ${colors.primary}40; color: ${colors.text};">
                <h3 class="text-lg font-bold mb-2" style="color: ${colors.primary}">Will You Attend?</h3>
                <p class="text-[11px] opacity-75 mb-4">Please let us know if you can make it to our celebration.</p>
                ${window.renderPublicRsvpForm ? window.renderPublicRsvpForm(colors, isEditMode, true) : ''}
            </div>
        ` : (isEditMode && set.showRsvp ? `<div class="w-full max-w-[340px] rounded-3xl p-6 text-center my-8 mx-auto border border-dashed text-xs opacity-75" style="border-color: ${colors.primary}80; color: ${colors.text};">RSVP Form Area (Enabled)</div>` : '');

        // Render bride and groom portraits beautifully above names
        let portraitsHtml = '';
        if (couple.groomPhoto || couple.bridePhoto) {
            portraitsHtml = `<div class="flex justify-center items-center gap-4 mb-6 mt-4 w-full">`;
            if (couple.groomPhoto) {
                portraitsHtml += `<div class="flex flex-col items-center gap-1.5">
                                     <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 border-[#9fb4ef]/60 bg-white/10 shadow-lg overflow-hidden shrink-0 aspect-square flex items-center justify-center">
                                         <img src="${couple.groomPhoto}" class="w-full h-full rounded-full object-cover aspect-square" style="aspect-ratio: 1/1;">
                                     </div>
                                     <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${colors.primary};">Groom</span>
                                 </div>`;
            }
            if (couple.groomPhoto && couple.bridePhoto) {
                portraitsHtml += `<div class="text-[#9fb4ef] font-serif text-lg italic font-bold my-auto" style="color: ${colors.primary};">&amp;</div>`;
            }
            if (couple.bridePhoto) {
                portraitsHtml += `<div class="flex flex-col items-center gap-1.5">
                                     <div class="w-20 h-20 md:w-24 md:h-24 rounded-full p-1 border-2 border-[#9fb4ef]/60 bg-white/10 shadow-lg overflow-hidden shrink-0 aspect-square flex items-center justify-center">
                                         <img src="${couple.bridePhoto}" class="w-full h-full rounded-full object-cover aspect-square" style="aspect-ratio: 1/1;">
                                     </div>
                                     <span class="text-[9px] uppercase tracking-wider font-semibold opacity-70" style="color: ${colors.primary};">Bride</span>
                                 </div>`;
            }
            portraitsHtml += `</div>`;
        }

        return `<style>
            .bs-root{--blue:${colors.bg};--ink:${colors.text};--accent:#9fb4ef;min-height:2250px;position:relative;overflow:hidden;padding:55px 31px 70px;color:var(--ink);text-align:center;background-color:var(--blue);background-image:linear-gradient(30deg,rgba(255,255,255,.025) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,.025) 87.5%),linear-gradient(150deg,rgba(255,255,255,.025) 12%,transparent 12.5%,transparent 87%,rgba(255,255,255,.025) 87.5%);background-size:42px 74px;font-family:Poppins,sans-serif}
            .bs-flower{position:absolute;z-index:2;width:118px;height:118px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.22));animation:bsSway 4.8s ease-in-out infinite;transform-origin:50% 100%}.bs-flower.top{right:-35px;top:32px}.bs-flower.left{left:-45px;top:680px;animation-delay:-1.6s}.bs-flower.right{right:-50px;top:1130px;animation-delay:-3s}.bs-flower span{position:absolute;left:40px;top:4px;width:38px;height:82px;border-radius:70% 70% 60% 60%;background:linear-gradient(90deg,#e8eaf1,#fff 52%,#d9dde7);transform-origin:19px 55px;transform:rotate(var(--r)) translateY(-28px)}.bs-flower i{position:absolute;left:44px;top:44px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#5b4213 0 12%,#d5a91d 14% 52%,#785d1b 54% 62%,transparent 64%)}@keyframes bsSway{0%,100%{transform:rotate(-5deg) translateY(0)}50%{transform:rotate(6deg) translateY(-7px)}}
            .bs-frame{position:absolute;inset:16px;border:3px solid #fff;border-radius:210px 210px 0 0;opacity:.92;pointer-events:none}.bs-frame:after{content:"";position:absolute;inset:7px;border:2px solid rgba(170,190,245,.8);border-radius:200px 200px 0 0}
            .bs-content{position:relative;z-index:1}.bs-arabic{font:700 44px Amiri,serif;line-height:1.25;margin:155px 20px 18px}.bs-sub{font:16px 'Playfair Display',serif;letter-spacing:.03em}.bs-names{font-family:'Playfair Display',serif;font-size:65px;line-height:.9;margin:108px 0 80px;letter-spacing:-.05em}.bs-names small{display:block;font:22px Poppins,sans-serif;letter-spacing:.02em;margin-bottom:6px}.bs-amp{display:block;color:var(--accent);font-size:44px;margin:13px}.bs-date-label{border-top:2px dotted rgba(255,255,255,.6);border-bottom:2px dotted rgba(255,255,255,.6);padding:26px 0;margin:0 28px;font:42px 'Playfair Display',serif}.bs-date{font:700 32px Poppins,sans-serif;margin:11px 0;color:#fff}.bs-date span{color:var(--accent);font-weight:400}.bs-venue{font-size:18px;font-weight:700;margin-top:45px}.bs-address{font-size:13px;opacity:.75;margin-top:5px}.bs-pill{display:inline-flex;align-items:center;gap:10px;margin:35px auto 93px;padding:13px 38px;border-radius:999px;background:#fff;color:#111;text-decoration:none;font-weight:600}.bs-dots{font-size:26px;letter-spacing:9px;color:var(--accent);margin:0 0 70px}.bs-story-title{font:62px 'Playfair Display',serif;margin:0 0 55px}.bs-story-title em{color:var(--accent);font-style:normal}.bs-message-title{font:700 19px 'Playfair Display',serif;margin-bottom:17px}.bs-message{font:16px 'Playfair Display',serif;line-height:1.75;max-width:330px;margin:auto;white-space:pre-line}.bs-reminder{margin:70px auto 60px}.bs-reminder-action{display:inline-block;border:0;background:rgba(255,255,255,.92);color:#111;padding:14px 39px;border-radius:999px;font:18px Poppins,sans-serif;cursor:pointer}.bs-reminder-action:active{transform:scale(.97)}.bs-calendar{margin:50px auto 95px;padding:25px 10px;border-top:1px solid rgba(255,255,255,.3);border-bottom:1px solid rgba(255,255,255,.3)}.bs-calendar h3{font-size:28px;margin:0 0 16px}.bs-calendar p{margin:0;font-size:13px;opacity:.75}.bs-calendar-week{display:grid;grid-template-columns:repeat(7,1fr);font-size:12px;letter-spacing:0;color:rgba(255,255,255,.68);word-spacing:15px;margin:22px 0 12px}.bs-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:12px 4px;align-items:center;font-size:16px}.bs-calendar-grid span{position:relative;min-height:27px;display:grid;place-items:center}
            
            @keyframes bsPulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(245,150,194,0.65)}70%{transform:scale(1.08);box-shadow:0 0 0 10px rgba(245,150,194,0)}100%{transform:scale(1);box-shadow:0 0 0 0 rgba(245,150,194,0)}}
            .bs-selected-day{background:rgba(245,150,194,0.45);border-radius:999px;font-weight:700;animation:bsPulse 2s infinite;border:2.5px solid #f596c2}
            
            .bs-selected-day b{position:absolute;right:-3px;top:-8px;color:#f596c2;font-size:16px}.bs-calendar-empty{font-size:13px;opacity:.75;padding:25px 5px}.bs-event{display:flex;gap:18px;align-items:center;text-align:left;max-width:340px;margin:46px auto}.bs-icon{flex:0 0 62px;height:62px;border-radius:50%;display:grid;place-items:center;background:#fff;color:var(--blue);font-size:27px}.bs-event h4{font-size:28px;line-height:1;margin:0 0 8px}.bs-event p{margin:0;font-size:14px;line-height:1.55}.bs-quote{margin:105px auto 0;padding-top:48px;border-top:1px solid rgba(255,255,255,.35)}.bs-quote .arabic{font:32px Amiri,serif;line-height:1.5}.bs-quote .translation{font:italic 16px 'Playfair Display',serif;line-height:1.6;margin-top:16px}.bs-editable{position:relative;cursor:pointer;border-radius:10px}.bs-editable:hover{outline:2px solid #60a5fa;outline-offset:4px}.bs-pen{position:absolute;right:2px;top:2px;background:#2563eb;color:#fff;width:27px;height:27px;border-radius:50%;display:grid;place-items:center;font-size:11px;z-index:2}.bs-hidden{opacity:.3;filter:grayscale(1)}
        </style><div class="bs-root">${flower('top')}${flower('left')}${flower('right')}<div class="bs-frame"></div><div class="bs-content">
            ${edit('bismillah', `<div class="bs-arabic">${escape(content.bismillah, 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ')}</div><div class="bs-sub">In the Name of Allah, The Most Gracious, The Most Merciful</div>`, 'showBismillah')}
            ${edit('couple', `<div class="bs-names">${portraitsHtml}${groom}<span class="bs-amp">&amp;</span>${bride}</div>`, 'showCouple')}
            ${edit('heading', `<div class="bs-date-label">${heading}</div>`, 'showHeading')}${edit('mainEvent', `<div class="bs-date"><span>${date}</span><br>${displayTime}</div>`, 'showEvent')}
            ${set.showCountdown ? edit('mainEvent', window.renderCountdownHtml ? window.renderCountdownHtml(d, colors, 'my-5') : '', 'showCountdown') : ''}
            ${edit('mainEvent', `<div class="bs-venue">${venue}</div><div class="bs-address">${address}</div>${venueImageHtml}${location}`, 'showEvent')}
            <div class="bs-dots">● ● ●</div>
            ${edit('couple', `<div class="bs-story-title">${displayInitials}</div>`, 'showCouple')}
            ${edit('message', `<div class="bs-message-title">Dear Beloved Family &amp; Friends!</div><div class="bs-message">${message.replace(/\n/g, '<br>')}</div>`, 'showMessage')}
            <div class="bs-reminder">${reminder}</div><div class="bs-dots">● ● ●</div>
            ${edit('mainEvent', `<div class="bs-calendar"><h3><i class="fa-regular fa-calendar-days"></i> ${monthLabel}</h3><p>Hold the Date</p>${calendar}</div>`, 'showEvent')}
            ${edit('mainEvent', `<div class="bs-event"><div class="bs-icon"><i class="fa-solid fa-rings-wedding"></i></div><div><h4>${title}</h4><p><strong>${date} · ${displayTime}</strong><br>${venue}</p></div></div>`, 'showEvent')}
            ${edit('quran', `<div class="bs-quote"><div class="arabic">${arabic}</div><div class="translation">“${translation}”</div></div>`, 'showQuote')}
            ${rsvpHtml}
        </div></div>`;
    }
});
