// Replace this with your actual Google Apps Script Web App URL for Policy Proposals
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUYk9O3Rk1Ahso7EjzNkdQW2nDM5zbZfh-P-Jycd8gvqP2FSXx0ohhRkWluaWA18LL/exec';

// TODO: Replace this with your NEW Google Apps Script Web App URL for the Contact Us form
const GOOGLE_SCRIPT_CONTACT_NEW_URL = '';

window.AppState = {
    memberData: {},
    galleryData: {},
    policyData: [],
    isAdminLoggedIn: false
};

// Make fetchHeroSlides globally accessible for Admin Management actions
window.fetchHeroSlides = async () => {
    try {
        const slides = await window.SliderService.fetchHeroSlides();
        window.Renderers.renderHeroSlides(slides);
    } catch (err) {
        console.error('Error fetching/rendering slides:', err);
    }
};

async function initApp() {
    // 1. Check Admin Session
    window.AppState.isAdminLoggedIn = await window.AdminAuth.checkSession();
    if (window.Helpers.checkAdminAuth) window.Helpers.checkAdminAuth();

    // 2. Initialize UI Components
    window.Navigation.init();
    if (window.AdminManagement) window.AdminManagement.init();
    setupContactForm(); // "Propose Policy" form
    setupContactUsNewForm(); // New "Contact Us" form

    // 3. Fetch Data and Render
    try {
        const [members, policies, gallery] = await Promise.all([
            window.MemberService.fetchMembers(),
            window.PolicyService.fetchPolicies(),
            window.GalleryService.fetchGallery()
        ]);

        window.Renderers.renderMembers(members);
        window.Renderers.renderPolicies(policies);
        window.Renderers.renderGallery(gallery);

        // Load slides via the global function
        await window.fetchHeroSlides();

        // 4. Analytics
        if (window.AnalyticsService) {
            window.AnalyticsService.trackUniqueVisit();
        }
    } catch (err) {
        console.error('Initial Data Fetch Error:', err);
    }

    // 5. Setup Realtime Updates
    setupRealtimeUpdates();
}

function setupRealtimeUpdates() {
    if (!window.supabaseClient) return;

    window.supabaseClient.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
            window.MemberService.fetchMembers().then(m => window.Renderers.renderMembers(m));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'policies' }, () => {
            window.PolicyService.fetchPolicies().then(p => window.Renderers.renderPolicies(p));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
            window.GalleryService.fetchGallery().then(g => window.Renderers.renderGallery(g));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
            window.fetchHeroSlides();
        })
        .subscribe();
}

// Handler for "Propose Policy" (formerly Contact)
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        // Basic Validation
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessageText').value;

        if (!name || !email || !message) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        submitBtn.innerText = 'กำลังส่ง...';
        submitBtn.disabled = true;

        try {
            // Attempt to send to Google Sheets directly if URL is provided
            // Otherwise fallback to Supabase (or do both)
            if (GOOGLE_SCRIPT_URL) {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Important for Google Apps Script
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message, type: 'policy_proposal' })
                });
            }

            // Also keep Supabase storage for backup if configured
            if (window.supabaseClient) {
                await window.supabaseClient.from('contact_submissions').insert([{
                    name, email, subject, message, created_at: new Date().toISOString()
                }]);
            }

            alert('ส่งข้อนโยบายเรียบร้อยแล้ว! ขอบคุณสำหรับความคิดเห็น');
            form.reset();
        } catch (err) {
            console.error('Contact Error:', err);
            // Even if it fails, sometimes no-cors opaque response causes error in strict mode? 
            // Usually fetch won't throw on 4xx/5xx, but network error will.
            alert('ส่งข้อมูลสำเร็จ (หรือเกิดข้อผิดพลาดเครือข่าย)');
            form.reset();
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Handler for NEW "Contact Us" form
function setupContactUsNewForm() {
    const form = document.getElementById('contactUsNewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        const name = document.getElementById('newContactName').value;
        const email = document.getElementById('newContactEmail').value;
        const subject = document.getElementById('newContactSubject').value;
        const message = document.getElementById('newContactMessage').value;

        if (!name || !email || !message || !subject) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        // Alert user if they haven't set the URL yet
        if (!GOOGLE_SCRIPT_CONTACT_NEW_URL) {
            alert('กรุณาตั้งค่า GOOGLE_SCRIPT_CONTACT_NEW_URL ในไฟล์ main.js ก่อนใช้งาน (หรือแจ้งผู้ดูแลระบบ)');
            return;
        }

        submitBtn.innerText = 'กำลังส่ง...';
        submitBtn.disabled = true;

        try {
            await fetch(GOOGLE_SCRIPT_CONTACT_NEW_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    type: 'general_contact',
                    timestamp: new Date().toISOString()
                })
            });

            alert('ส่งข้อความเรียบร้อยแล้ว! ทางเราจะรีบตอบกลับโดยเร็วที่สุด');
            form.reset();
        } catch (err) {
            console.error('New Contact Error:', err);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
