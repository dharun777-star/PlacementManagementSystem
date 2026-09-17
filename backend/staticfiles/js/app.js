/**
 * PlacementHub - Main App Controller
 * Manages SPA navigation, Modals, Toast notifications, and Dashboard Analytics.
 */

const app = (() => {
    let currentSection = 'dashboard';
    let pendingDeleteAction = null;

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    const btnQuickAdd = document.getElementById('btnQuickAdd');
    const quickAddLabel = document.getElementById('quickAddLabel');
    const btnRefreshData = document.getElementById('btnRefreshData');
    const toastContainer = document.getElementById('toastContainer');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');
    const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');

    // Section Titles and Subtitles map
    const sectionMetadata = {
        'dashboard': {
            title: 'Placement Dashboard',
            subtitle: 'Overview of placement drives, students & recruitment records',
            addBtn: 'Add Student',
            addAction: () => studentsModule.openAddModal()
        },
        'students': {
            title: 'Student Management',
            subtitle: 'Manage student profiles, academic performance, and placement status',
            addBtn: 'Add Student',
            addAction: () => studentsModule.openAddModal()
        },
        'companies': {
            title: 'Company Management',
            subtitle: 'Manage recruiting partners, upcoming drives, job roles, and packages',
            addBtn: 'Add Company',
            addAction: () => companiesModule.openAddModal()
        },
        'placements': {
            title: 'Placement Records',
            subtitle: 'Track student job offers, selected candidates, and packages',
            addBtn: 'Add Placement',
            addAction: () => placementsModule.openAddModal()
        },
        'viva-guide': {
            title: 'Viva & API Documentation',
            subtitle: 'Architecture details, REST APIs map, and viva exam preparation guide',
            addBtn: 'Add Student',
            addAction: () => studentsModule.openAddModal()
        }
    };

    /**
     * Initialize the Application
     */
    function init() {
        setupNavigation();
        setupModals();
        setupMobileMenu();
        setupDeleteConfirmation();
        loadDashboardStats();

        // Refresh button click
        if (btnRefreshData) {
            btnRefreshData.addEventListener('click', () => {
                refreshCurrentSection();
                showToast('View refreshed', 'info');
            });
        }

        // Quick add button in topbar
        if (btnQuickAdd) {
            btnQuickAdd.addEventListener('click', () => {
                const meta = sectionMetadata[currentSection];
                if (meta && typeof meta.addAction === 'function') {
                    meta.addAction();
                }
            });
        }
    }

    /**
     * SPA Section Switcher
     */
    function navigateTo(sectionId) {
        if (!sectionMetadata[sectionId]) return;

        currentSection = sectionId;

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionId);
        });

        // Update main content section visibility
        document.querySelectorAll('.page-section').forEach(sec => {
            sec.classList.remove('active');
        });
        const targetSec = document.getElementById(`section-${sectionId}`);
        if (targetSec) {
            targetSec.classList.add('active');
        }

        // Update header texts
        const meta = sectionMetadata[sectionId];
        if (pageTitle) pageTitle.textContent = meta.title;
        if (pageSubtitle) pageSubtitle.textContent = meta.subtitle;
        if (quickAddLabel) quickAddLabel.textContent = meta.addBtn;

        // Hide quick add button on viva guide
        if (btnQuickAdd) {
            btnQuickAdd.style.display = (sectionId === 'viva-guide') ? 'none' : 'inline-flex';
        }

        // Close mobile drawer if open
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }

        // Trigger section data load
        refreshCurrentSection();
    }

    /**
     * Refresh data of active section
     */
    function refreshCurrentSection() {
        switch (currentSection) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'students':
                studentsModule.loadStudents();
                break;
            case 'companies':
                companiesModule.loadCompanies();
                break;
            case 'placements':
                placementsModule.loadPlacements();
                break;
        }
    }

    /**
     * Setup sidebar navigation click events
     */
    function setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                if (section) navigateTo(section);
            });
        });
    }

    /**
     * Setup Mobile menu toggle
     */
    function setupMobileMenu() {
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    /**
     * Modal Handling
     */
    function setupModals() {
        // Close modal when clicking outside of modal card
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    closeModal(modal.id);
                });
            }
        });
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Clear any lingering error messages
            modal.querySelectorAll('.field-error').forEach(el => el.textContent = '');
            modal.classList.add('active');
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Delete Confirmation Modal Dialog
     */
    function setupDeleteConfirmation() {
        if (btnConfirmDelete) {
            btnConfirmDelete.addEventListener('click', async () => {
                if (typeof pendingDeleteAction === 'function') {
                    btnConfirmDelete.disabled = true;
                    btnConfirmDelete.textContent = 'Deleting...';
                    try {
                        await pendingDeleteAction();
                    } finally {
                        btnConfirmDelete.disabled = false;
                        btnConfirmDelete.textContent = 'Delete Record';
                        closeModal('deleteConfirmModal');
                        pendingDeleteAction = null;
                    }
                }
            });
        }
    }

    function requestDeleteConfirm(message, onConfirm) {
        if (deleteConfirmMessage) {
            deleteConfirmMessage.textContent = message || 'Are you sure you want to delete this record?';
        }
        pendingDeleteAction = onConfirm;
        openModal('deleteConfirmModal');
    }

    /**
     * Toast Notification System
     */
    function showToast(message, type = 'info', duration = 3500) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // SVG Icon according to type
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        } else {
            iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0ea5e9" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `
            ${iconSvg}
            <div style="white-space: pre-line;">${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOutToast 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Load Dashboard Statistics
     */
    async function loadDashboardStats() {
        const res = await API.getDashboardStats();
        if (!res.success) {
            showToast(res.message || 'Failed to fetch dashboard statistics', 'error');
            return;
        }

        const data = res.data;

        // Populate Counter Elements
        const elTotalStudents = document.getElementById('statTotalStudents');
        const elTotalCompanies = document.getElementById('statTotalCompanies');
        const elPlacedStudents = document.getElementById('statPlacedStudents');
        const elNotPlacedStudents = document.getElementById('statNotPlacedStudents');
        const elRateBadge = document.getElementById('statPlacementRateBadge');
        const elHighestPkg = document.getElementById('statHighestPackage');
        const elAvgPkg = document.getElementById('statAvgPackage');
        const elTotalPlacements = document.getElementById('statTotalPlacements');

        if (elTotalStudents) elTotalStudents.textContent = data.total_students || 0;
        if (elTotalCompanies) elTotalCompanies.textContent = data.total_companies || 0;
        if (elPlacedStudents) elPlacedStudents.textContent = data.placed_students || 0;
        if (elNotPlacedStudents) elNotPlacedStudents.textContent = data.not_placed_students || 0;
        if (elRateBadge) elRateBadge.textContent = `${data.placement_rate || 0}% Placement Rate`;
        if (elHighestPkg) elHighestPkg.textContent = `₹${data.highest_package || 0} LPA`;
        if (elAvgPkg) elAvgPkg.textContent = `₹${data.avg_package || 0} LPA`;
        if (elTotalPlacements) elTotalPlacements.textContent = data.total_placements || 0;

        // Render Department-wise Progress Bars
        renderDeptBreakdown(data.dept_breakdown || []);

        // Render Recent Placements Table snippet
        renderRecentPlacements(data.recent_placements || []);

        // Render Top Hiring Companies
        renderTopCompanies(data.top_companies || []);
    }

    function renderDeptBreakdown(deptList) {
        const container = document.getElementById('deptBreakdownList');
        if (!container) return;

        if (!deptList || deptList.length === 0) {
            container.innerHTML = '<div class="empty-state-mini">No department records found.</div>';
            return;
        }

        container.innerHTML = deptList.map(dept => {
            const pct = dept.total > 0 ? Math.round((dept.placed / dept.total) * 100) : 0;
            return `
                <div class="dept-item">
                    <div class="dept-info">
                        <span><strong>${dept.department}</strong> (${dept.placed} of ${dept.total} Placed)</span>
                        <span>${pct}%</span>
                    </div>
                    <div class="dept-bar-track">
                        <div class="dept-bar-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderRecentPlacements(placements) {
        const tbody = document.getElementById('recentPlacementsBody');
        if (!tbody) return;

        if (!placements || placements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No recent placements found.</td></tr>';
            return;
        }

        tbody.innerHTML = placements.map(p => {
            const studentName = p.student_details ? p.student_details.name : (p.student_name || 'N/A');
            const companyName = p.company_details ? p.company_details.company_name : (p.company_name || 'N/A');
            return `
                <tr>
                    <td><strong>${escapeHtml(studentName)}</strong></td>
                    <td>${escapeHtml(companyName)}</td>
                    <td>${escapeHtml(p.job_role || '-')}</td>
                    <td><span class="badge badge-pkg">₹${p.package} LPA</span></td>
                    <td><span class="badge ${p.status === 'Selected' || p.status === 'Joined' ? 'badge-success' : 'badge-info'}">${p.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    function renderTopCompanies(companies) {
        const container = document.getElementById('topCompaniesList');
        if (!container) return;

        if (!companies || companies.length === 0) {
            container.innerHTML = '<div class="text-center py-4 text-muted">No recruitment data yet.</div>';
            return;
        }

        container.innerHTML = companies.map(c => `
            <div class="top-company-row">
                <span class="top-company-name">${escapeHtml(c.company__company_name || 'Company')}</span>
                <span class="top-company-hires">${c.hires} Hires</span>
            </div>
        `).join('');
    }

    /**
     * Basic HTML Escaper for XSS prevention
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Auto-init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        navigateTo,
        refreshCurrentSection,
        openModal,
        closeModal,
        requestDeleteConfirm,
        showToast,
        loadDashboardStats,
        escapeHtml
    };
})();
