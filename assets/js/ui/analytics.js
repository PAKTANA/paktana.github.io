window.AnalyticsUI = {
    async fetchAnalyticsData() {
        try {
            const visitors = await window.AnalyticsService.fetchTotalVisitors();
            if (document.getElementById('totalVisitorsDisplay')) {
                document.getElementById('totalVisitorsDisplay').textContent = (visitors || 0).toLocaleString();
            }

            const pageViews = await window.AnalyticsService.fetchPageViews();
            const container = document.getElementById('analyticsPageViews');
            if (container) {
                if (pageViews && pageViews.length > 0) {
                    // Sort descending by views
                    pageViews.sort((a, b) => b.view_count - a.view_count);

                    container.innerHTML = '';
                    const labelsMap = {
                        'home': 'หน้าแรก',
                        'policies': 'นโยบาย',
                        'leadership': 'ทำเนียบสมาชิก',
                        'activities': 'กิจกรรม',
                        'contact': 'ติดต่อเรา',
                        'admin': 'ผู้ดูแลระบบ',
                        'manage_members': 'จัดการสมาชิก',
                        'gallery': 'แกลเลอรี่'
                    };

                    pageViews.forEach(row => {
                        const label = labelsMap[row.page_id] || row.page_id;
                        const el = document.createElement('div');
                        el.className = 'flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default';
                        el.innerHTML = `
                            <div class="flex items-center gap-3">
                                <span class="w-2 h-2 rounded-full ${row.view_count > 100 ? 'bg-green-500' : 'bg-gray-300'}"></span>
                                <span class="font-bold text-gray-700 font-serif">${label}</span>
                            </div>
                            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black shadow-inner flex items-center gap-1">
                                👁️ ${row.view_count.toLocaleString()}
                            </span>
                        `;
                        container.appendChild(el);
                    });
                } else {
                    container.innerHTML = '<div class="text-center text-gray-400 py-4 flex flex-col items-center gap-2"><span class="text-2xl">📉</span><span>ไม่มีข้อมูลการเข้าชม</span></div>';
                }
            }

            const ratings = await window.AnalyticsService.fetchRatings();
            if (ratings && ratings.length > 0) {
                const total = ratings.length;
                const avg = ratings.reduce((acc, r) => acc + r.rating, 0) / total;
                if (document.getElementById('avgRatingDisplay')) {
                    document.getElementById('avgRatingDisplay').textContent = avg.toFixed(1);
                }
                if (document.getElementById('totalRatingsDisplay')) {
                    document.getElementById('totalRatingsDisplay').textContent = `จาก ${total} คน`;
                }

                const feedbackList = document.getElementById('analyticsFeedbackList');
                if (feedbackList) {
                    feedbackList.innerHTML = '';
                    ratings.slice(0, 20).forEach(r => {
                        const el = document.createElement('div');
                        el.className = 'p-3 bg-white rounded-lg border border-gray-100';
                        el.innerHTML = `
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-yellow-500 font-bold">${'★'.repeat(r.rating)}</span>
                                <span class="text-gray-400 text-xs">${new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                            </div>
                            ${r.comment ? `<p class="text-gray-700 text-sm italic">"${r.comment}"</p>` : ''}
                        `;
                        feedbackList.appendChild(el);
                    });
                }
            }

            // Render chart regardless of ratings
            this.renderAnalyticsChart(pageViews);

        } catch (err) {
            console.error('Fetch Analytics UI Error:', err);
        }
    },

    renderAnalyticsChart(pageViews) {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;

        // Ensure pageViews is an array
        const views = pageViews || [];

        if (window.analyticsChartInstance) window.analyticsChartInstance.destroy();

        const labelsMap = {
            'home': 'หน้าแรก',
            'policies': 'นโยบาย',
            'leadership': 'ทำเนียบ',
            'activities': 'กิจกรรม',
            'contact': 'ติดต่อเรา',
            'admin': 'Admin'
        };

        // Prepare data with default zeros if needed, or just map existing
        const labels = views.map(v => labelsMap[v.page_id] || v.page_id);
        const data = views.map(v => v.view_count);

        window.analyticsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'จำนวนการเข้าชม (ครั้ง)',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        titleFont: { size: 14, family: "'Sarabun', sans-serif" },
                        bodyFont: { size: 14, family: "'Sarabun', sans-serif" }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6' },
                        ticks: { font: { family: "'Sarabun', sans-serif" } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Sarabun', sans-serif", weight: 'bold' } }
                    }
                }
            }
        });
    },

    currentRating: 0,
    setRating(n) {
        this.currentRating = n;
        const stars = document.getElementById('starRating').children;
        for (let i = 0; i < 5; i++) {
            stars[i].style.color = i < n ? '#fbbf24' : '#d1d5db';
        }
    },

    async submitRating() {
        if (window.AppState.isAdminLoggedIn) {
            alert('ผู้ดูแลระบบไม่สามารถให้คะแนนได้');
            return;
        }

        if (this.currentRating === 0) {
            alert('กรุณาเลือกดาวเพื่อระบุความพึงพอใจ');
            return;
        }

        const comment = document.getElementById('ratingComment').value;
        const btn = document.querySelector('#ratingModal button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'กำลังส่ง...';

        try {
            await window.AnalyticsService.submitRating(this.currentRating, comment);
            window.Helpers.showSuccessToast('ขอบคุณสำหรับคะแนนครับ!');
            window.Modals.closeModal('ratingModal');
            this.currentRating = 0;
            // Clear stars
            const stars = document.getElementById('starRating').children;
            for (let i = 0; i < 5; i++) stars[i].style.color = '#d1d5db';
            document.getElementById('ratingComment').value = '';
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    openAnalyticsModal() {
        if (!window.AppState.isAdminLoggedIn) return;
        this.fetchAnalyticsData();
        window.Modals.openModal('analyticsModal');
    }
};

window.setRating = (n) => window.AnalyticsUI.setRating(n);
window.submitRating = () => window.AnalyticsUI.submitRating();
window.fetchAnalyticsData = () => window.AnalyticsUI.fetchAnalyticsData();
window.openAnalyticsModal = () => window.AnalyticsUI.openAnalyticsModal();
