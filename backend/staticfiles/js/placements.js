/**
 * PlacementHub - Placement Records Module
 * Handles Placement CRUD, Student/Company Selectors, Filtering, and Auto-sync.
 */

const placementsModule = (() => {
    let placementsCache = [];
    let studentsListCache = [];
    let companiesListCache = [];

    // DOM Elements
    const tableBody = document.getElementById('placementsTableBody');
    const countLabel = document.getElementById('placementCountLabel');
    const searchInput = document.getElementById('placementSearchInput');
    const companyFilter = document.getElementById('placementCompanyFilter');
    const statusFilter = document.getElementById('placementStatusFilter');
    const btnReset = document.getElementById('placementFilterReset');
    const btnAdd = document.getElementById('btnAddPlacement');
    const form = document.getElementById('placementForm');
    const modalTitle = document.getElementById('placementModalTitle');
    const btnSave = document.getElementById('btnSavePlacement');

    // Form Selectors
    const selStudent = document.getElementById('placementStudent');
    const selCompany = document.getElementById('placementCompany');
    const inputRole = document.getElementById('placementJobRole');
    const inputPkg = document.getElementById('placementPackage');

    function init() {
        if (btnAdd) {
            btnAdd.addEventListener('click', openAddModal);
        }

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        if (searchInput) {
            searchInput.addEventListener('input', debounce(loadPlacements, 300));
        }

        if (companyFilter) {
            companyFilter.addEventListener('change', loadPlacements);
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', loadPlacements);
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (companyFilter) companyFilter.value = '';
                if (statusFilter) statusFilter.value = '';
                loadPlacements();
            });
        }

        // Auto-fill role and package when company is chosen in placement modal
        if (selCompany) {
            selCompany.addEventListener('change', () => {
                const compId = parseInt(selCompany.value, 10);
                const comp = companiesListCache.find(c => c.id === compId);
                if (comp) {
                    if (inputRole && !inputRole.value) inputRole.value = comp.job_role;
                    if (inputPkg && !inputPkg.value) inputPkg.value = comp.package;
                }
            });
        }
    }

    /**
     * Fetch & render placement records
     */
    async function loadPlacements() {
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Loading placements...</td></tr>';

        const params = {};
        if (searchInput && searchInput.value.trim()) {
            params.search = searchInput.value.trim();
        }
        if (companyFilter && companyFilter.value) {
            params.company = companyFilter.value;
        }
        if (statusFilter && statusFilter.value) {
            params.status = statusFilter.value;
        }

        const res = await API.getPlacements(params);
        if (!res.success) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${res.message || 'Failed to load placements.'}</td></tr>`;
            return;
        }

        placementsCache = res.data || [];
        renderTable(placementsCache);

        // Preload student and company options for modal
        preloadDropdownData();
    }

    /**
     * Preload students and companies for dropdown select elements
     */
    async function preloadDropdownData() {
        const [resStudents, resCompanies] = await Promise.all([
            API.getStudents(),
            API.getCompanies()
        ]);

        if (resStudents.success) {
            studentsListCache = resStudents.data || [];
        }
        if (resCompanies.success) {
            companiesListCache = resCompanies.data || [];
            updateCompanyFilterDropdown(companiesListCache);
        }
    }

    function updateCompanyFilterDropdown(companies) {
        if (!companyFilter) return;
        const currentVal = companyFilter.value;
        let html = '<option value="">All Companies</option>';
        companies.forEach(c => {
            html += `<option value="${c.id}" ${currentVal == c.id ? 'selected' : ''}>${app.escapeHtml(c.company_name)}</option>`;
        });
        companyFilter.innerHTML = html;
    }

    function populateModalDropdowns(selectedStudentId = null, selectedCompanyId = null) {
        if (selStudent) {
            let sHtml = '<option value="">Choose Student...</option>';
            studentsListCache.forEach(s => {
                const isSelected = selectedStudentId && s.id === selectedStudentId;
                sHtml += `<option value="${s.id}" ${isSelected ? 'selected' : ''}>${app.escapeHtml(s.student_id)} - ${app.escapeHtml(s.name)} (${s.department})</option>`;
            });
            selStudent.innerHTML = sHtml;
        }

        if (selCompany) {
            let cHtml = '<option value="">Choose Company...</option>';
            companiesListCache.forEach(c => {
                const isSelected = selectedCompanyId && c.id === selectedCompanyId;
                cHtml += `<option value="${c.id}" ${isSelected ? 'selected' : ''}>${app.escapeHtml(c.company_name)} (${c.job_role} - ₹${c.package} LPA)</option>`;
            });
            selCompany.innerHTML = cHtml;
        }
    }

    /**
     * Render placements table rows
     */
    function renderTable(placements) {
        if (!tableBody) return;

        if (countLabel) {
            countLabel.textContent = `Showing ${placements.length} placement${placements.length === 1 ? '' : 's'}`;
        }

        if (placements.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No placement records found matching your filters.</td></tr>';
            return;
        }

        tableBody.innerHTML = placements.map(p => {
            const studentName = p.student_details ? p.student_details.name : (p.student_name || 'N/A');
            const studentRoll = p.student_details ? p.student_details.student_id : (p.student_roll || '');
            const studentDept = p.student_details ? p.student_details.department : '';
            const companyName = p.company_details ? p.company_details.company_name : (p.company_name || 'N/A');

            let statusBadgeClass = 'badge-info';
            if (p.status === 'Selected' || p.status === 'Joined') statusBadgeClass = 'badge-success';
            if (p.status === 'Pending') statusBadgeClass = 'badge-warning';
            if (p.status === 'Offered') statusBadgeClass = 'badge-primary';

            return `
                <tr>
                    <td><strong>${app.escapeHtml(p.placement_id)}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: var(--slate-900);">${app.escapeHtml(studentName)}</div>
                        <div class="student-sub">${app.escapeHtml(studentRoll)} ${studentDept ? `(${studentDept})` : ''}</div>
                    </td>
                    <td><strong>${app.escapeHtml(companyName)}</strong></td>
                    <td>${app.escapeHtml(p.job_role)}</td>
                    <td><span class="badge badge-pkg">₹${parseFloat(p.package).toFixed(2)} LPA</span></td>
                    <td>${formatDate(p.placement_date)}</td>
                    <td><span class="badge ${statusBadgeClass}">${p.status}</span></td>
                    <td class="text-right">
                        <div class="table-actions">
                            <button class="btn-icon-action edit" title="Edit Placement" onclick="placementsModule.openEditModal(${p.id})">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon-action delete" title="Delete Placement" onclick="placementsModule.deletePlacement(${p.id}, '${app.escapeHtml(studentName)}', '${app.escapeHtml(companyName)}')">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Open Add Placement Modal
     */
    async function openAddModal() {
        if (!form) return;
        form.reset();
        document.getElementById('placementDbId').value = '';

        // Auto-generate next suggested placement ID e.g. PLC006
        const nextId = `PLC${String(placementsCache.length + 1).padStart(3, '0')}`;
        document.getElementById('placementId').value = nextId;

        // Default date to today
        document.getElementById('placementDate').value = new Date().toISOString().split('T')[0];

        if (modalTitle) modalTitle.textContent = 'Add Placement Record';
        if (btnSave) btnSave.textContent = 'Save Placement';

        clearFormErrors();
        await preloadDropdownData();
        populateModalDropdowns();

        app.openModal('placementModal');
    }

    /**
     * Open Edit Placement Modal
     */
    async function openEditModal(placementDbId) {
        clearFormErrors();

        let placement = placementsCache.find(p => p.id === placementDbId);
        if (!placement) {
            const res = await API.getPlacement(placementDbId);
            if (!res.success) {
                app.showToast('Could not fetch placement details', 'error');
                return;
            }
            placement = res.data;
        }

        await preloadDropdownData();
        populateModalDropdowns(placement.student, placement.company);

        // Fill Form Fields
        document.getElementById('placementDbId').value = placement.id;
        document.getElementById('placementId').value = placement.placement_id;
        document.getElementById('placementStatus').value = placement.status;
        document.getElementById('placementStudent').value = placement.student;
        document.getElementById('placementCompany').value = placement.company;
        document.getElementById('placementJobRole').value = placement.job_role;
        document.getElementById('placementPackage').value = placement.package;
        document.getElementById('placementDate').value = placement.placement_date;

        if (modalTitle) modalTitle.textContent = 'Edit Placement Record';
        if (btnSave) btnSave.textContent = 'Update Placement';

        app.openModal('placementModal');
    }

    /**
     * Handle Form Submission (Create or Update)
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const dbId = document.getElementById('placementDbId').value;
        const placementId = document.getElementById('placementId').value.trim();
        const status = document.getElementById('placementStatus').value;
        const student = document.getElementById('placementStudent').value;
        const company = document.getElementById('placementCompany').value;
        const jobRole = document.getElementById('placementJobRole').value.trim();
        const pkgVal = document.getElementById('placementPackage').value.trim();
        const placementDate = document.getElementById('placementDate').value;

        // Client-side validations
        let hasError = false;

        if (!placementId) {
            setFieldError('placementId', 'Placement ID is required.');
            hasError = true;
        }
        if (!student) {
            setFieldError('placementStudent', 'Please select a student.');
            hasError = true;
        }
        if (!company) {
            setFieldError('placementCompany', 'Please select a company.');
            hasError = true;
        }
        if (!jobRole) {
            setFieldError('placementJobRole', 'Job role is required.');
            hasError = true;
        }

        const pkg = parseFloat(pkgVal);
        if (isNaN(pkg) || pkg <= 0) {
            setFieldError('placementPackage', 'Package must be a valid positive number (> 0).');
            hasError = true;
        }

        if (!placementDate) {
            setFieldError('placementDate', 'Placement date is required.');
            hasError = true;
        }

        if (hasError) return;

        const payload = {
            placement_id: placementId.toUpperCase(),
            student: parseInt(student, 10),
            company: parseInt(company, 10),
            job_role: jobRole,
            package: pkg,
            placement_date: placementDate,
            status
        };

        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Saving...';
        }

        let res;
        if (dbId) {
            res = await API.updatePlacement(dbId, payload);
        } else {
            res = await API.createPlacement(payload);
        }

        if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = dbId ? 'Update Placement' : 'Save Placement';
        }

        if (!res.success) {
            if (res.error && typeof res.error === 'object') {
                let mapped = false;
                if (res.error.placement_id) {
                    setFieldError('placementId', res.error.placement_id.join(' '));
                    mapped = true;
                }
                if (res.error.package) {
                    setFieldError('placementPackage', res.error.package.join(' '));
                    mapped = true;
                }
                if (res.error.student) {
                    setFieldError('placementStudent', res.error.student.join(' '));
                    mapped = true;
                }
                if (res.error.company) {
                    setFieldError('placementCompany', res.error.company.join(' '));
                    mapped = true;
                }
                if (!mapped) {
                    app.showToast(res.message, 'error');
                }
            } else {
                app.showToast(res.message, 'error');
            }
            return;
        }

        app.showToast(dbId ? 'Placement record updated successfully!' : 'Placement created successfully (Student status updated)!', 'success');
        app.closeModal('placementModal');
        loadPlacements();
        app.loadDashboardStats();
    }

    /**
     * Delete a placement
     */
    function deletePlacement(id, studentName, companyName) {
        app.requestDeleteConfirm(
            `Are you sure you want to delete placement for "${studentName}" at "${companyName}"? The student's placement status will automatically revert if no other active offers exist.`,
            async () => {
                const res = await API.deletePlacement(id);
                if (res.success) {
                    app.showToast('Placement deleted successfully', 'success');
                    loadPlacements();
                    app.loadDashboardStats();
                } else {
                    app.showToast(res.message || 'Failed to delete placement', 'error');
                }
            }
        );
    }

    function setFieldError(fieldKey, message) {
        const errEl = document.getElementById(`error_${fieldKey}`);
        if (errEl) errEl.textContent = message;
    }

    function clearFormErrors() {
        document.querySelectorAll('#placementModal .field-error').forEach(el => el.textContent = '');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    function debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        loadPlacements,
        openAddModal,
        openEditModal,
        deletePlacement,
        updateCompanyOptions: updateCompanyFilterDropdown
    };
})();
