/**
 * PlacementHub - Company Management Module
 * Handles Company CRUD, Search, and Form Validations.
 */

const companiesModule = (() => {
    let companiesCache = [];

    // DOM Elements
    const tableBody = document.getElementById('companiesTableBody');
    const countLabel = document.getElementById('companyCountLabel');
    const searchInput = document.getElementById('companySearchInput');
    const btnReset = document.getElementById('companyFilterReset');
    const btnAdd = document.getElementById('btnAddCompany');
    const form = document.getElementById('companyForm');
    const modalTitle = document.getElementById('companyModalTitle');
    const btnSave = document.getElementById('btnSaveCompany');

    function init() {
        if (btnAdd) {
            btnAdd.addEventListener('click', openAddModal);
        }

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        if (searchInput) {
            searchInput.addEventListener('input', debounce(loadCompanies, 300));
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                loadCompanies();
            });
        }
    }

    /**
     * Fetch & render companies
     */
    async function loadCompanies() {
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4">Loading companies...</td></tr>';

        const params = {};
        if (searchInput && searchInput.value.trim()) {
            params.search = searchInput.value.trim();
        }

        const res = await API.getCompanies(params);
        if (!res.success) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger">${res.message || 'Failed to load companies.'}</td></tr>`;
            return;
        }

        companiesCache = res.data || [];
        renderTable(companiesCache);

        // Also update company filter dropdown in placements section
        if (typeof placementsModule !== 'undefined' && placementsModule.updateCompanyOptions) {
            placementsModule.updateCompanyOptions(companiesCache);
        }
    }

    /**
     * Render companies table rows
     */
    function renderTable(companies) {
        if (!tableBody) return;

        if (countLabel) {
            countLabel.textContent = `Showing ${companies.length} compan${companies.length === 1 ? 'y' : 'ies'}`;
        }

        if (companies.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" class="text-center py-4">No companies found matching your search.</td></tr>';
            return;
        }

        tableBody.innerHTML = companies.map(c => {
            const skillsList = (c.required_skills || '')
                .split(',')
                .map(sk => sk.trim())
                .filter(Boolean);

            const skillsHtml = skillsList.length > 0
                ? `<div class="tag-list">${skillsList.slice(0, 3).map(sk => `<span class="skill-pill">${app.escapeHtml(sk)}</span>`).join('')}${skillsList.length > 3 ? `<span class="skill-pill">+${skillsList.length - 3}</span>` : ''}</div>`
                : '<span class="text-muted">-</span>';

            return `
                <tr>
                    <td><strong>${app.escapeHtml(c.company_id)}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: var(--slate-900);">${app.escapeHtml(c.company_name)}</div>
                    </td>
                    <td>
                        <div>${app.escapeHtml(c.hr_name)}</div>
                        <div class="student-sub">${app.escapeHtml(c.hr_email)}</div>
                    </td>
                    <td>${app.escapeHtml(c.job_role)}</td>
                    <td><span class="badge badge-pkg">₹${parseFloat(c.package).toFixed(2)} LPA</span></td>
                    <td>${app.escapeHtml(c.location)}</td>
                    <td><strong>${formatDate(c.drive_date)}</strong></td>
                    <td>${skillsHtml}</td>
                    <td class="text-right">
                        <div class="table-actions">
                            <button class="btn-icon-action edit" title="Edit Company" onclick="companiesModule.openEditModal(${c.id})">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon-action delete" title="Delete Company" onclick="companiesModule.deleteCompany(${c.id}, '${app.escapeHtml(c.company_name)}')">
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
     * Open Add Company Modal
     */
    function openAddModal() {
        if (!form) return;
        form.reset();
        document.getElementById('companyDbId').value = '';
        if (modalTitle) modalTitle.textContent = 'Add New Company';
        if (btnSave) btnSave.textContent = 'Save Company';
        clearFormErrors();
        app.openModal('companyModal');
    }

    /**
     * Open Edit Company Modal
     */
    async function openEditModal(companyDbId) {
        clearFormErrors();

        let company = companiesCache.find(c => c.id === companyDbId);
        if (!company) {
            const res = await API.getCompany(companyDbId);
            if (!res.success) {
                app.showToast('Could not fetch company details', 'error');
                return;
            }
            company = res.data;
        }

        // Fill Form Fields
        document.getElementById('companyDbId').value = company.id;
        document.getElementById('companyId').value = company.company_id;
        document.getElementById('companyName').value = company.company_name;
        document.getElementById('companyHrName').value = company.hr_name;
        document.getElementById('companyHrEmail').value = company.hr_email;
        document.getElementById('companyJobRole').value = company.job_role;
        document.getElementById('companyPackage').value = company.package;
        document.getElementById('companyLocation').value = company.location;
        document.getElementById('companyDriveDate').value = company.drive_date;
        document.getElementById('companyRequiredSkills').value = company.required_skills || '';

        if (modalTitle) modalTitle.textContent = 'Edit Company Details';
        if (btnSave) btnSave.textContent = 'Update Company';

        app.openModal('companyModal');
    }

    /**
     * Handle Form Submission (Create or Update)
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const dbId = document.getElementById('companyDbId').value;
        const companyId = document.getElementById('companyId').value.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const hrName = document.getElementById('companyHrName').value.trim();
        const hrEmail = document.getElementById('companyHrEmail').value.trim();
        const jobRole = document.getElementById('companyJobRole').value.trim();
        const pkgVal = document.getElementById('companyPackage').value.trim();
        const location = document.getElementById('companyLocation').value.trim();
        const driveDate = document.getElementById('companyDriveDate').value;
        const requiredSkills = document.getElementById('companyRequiredSkills').value.trim();

        // Client-side validations
        let hasError = false;

        if (!companyId) {
            setFieldError('companyId', 'Company ID is required.');
            hasError = true;
        }
        if (!companyName) {
            setFieldError('companyName', 'Company name is required.');
            hasError = true;
        }
        if (!hrName) {
            setFieldError('companyHrName', 'HR Contact Name is required.');
            hasError = true;
        }
        if (!hrEmail) {
            setFieldError('companyHrEmail', 'HR Email is required.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hrEmail)) {
            setFieldError('companyHrEmail', 'Please enter a valid email address.');
            hasError = true;
        }
        if (!jobRole) {
            setFieldError('companyJobRole', 'Job role is required.');
            hasError = true;
        }

        const pkg = parseFloat(pkgVal);
        if (isNaN(pkg) || pkg <= 0) {
            setFieldError('companyPackage', 'Package must be a valid positive number (> 0).');
            hasError = true;
        }

        if (!location) {
            setFieldError('companyLocation', 'Location is required.');
            hasError = true;
        }
        if (!driveDate) {
            setFieldError('companyDriveDate', 'Drive date is required.');
            hasError = true;
        }

        if (hasError) return;

        const payload = {
            company_id: companyId.toUpperCase(),
            company_name: companyName,
            hr_name: hrName,
            hr_email: hrEmail.toLowerCase(),
            job_role: jobRole,
            package: pkg,
            location,
            drive_date: driveDate,
            required_skills: requiredSkills
        };

        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Saving...';
        }

        let res;
        if (dbId) {
            res = await API.updateCompany(dbId, payload);
        } else {
            res = await API.createCompany(payload);
        }

        if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = dbId ? 'Update Company' : 'Save Company';
        }

        if (!res.success) {
            if (res.error && typeof res.error === 'object') {
                let mapped = false;
                if (res.error.company_id) {
                    setFieldError('companyId', res.error.company_id.join(' '));
                    mapped = true;
                }
                if (res.error.hr_email) {
                    setFieldError('companyHrEmail', res.error.hr_email.join(' '));
                    mapped = true;
                }
                if (res.error.package) {
                    setFieldError('companyPackage', res.error.package.join(' '));
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

        app.showToast(dbId ? 'Company updated successfully!' : 'Company created successfully!', 'success');
        app.closeModal('companyModal');
        loadCompanies();
        app.loadDashboardStats();
    }

    /**
     * Delete a company
     */
    function deleteCompany(id, companyName) {
        app.requestDeleteConfirm(
            `Are you sure you want to delete "${companyName}"? All associated placement records will also be removed.`,
            async () => {
                const res = await API.deleteCompany(id);
                if (res.success) {
                    app.showToast('Company deleted successfully', 'success');
                    loadCompanies();
                    app.loadDashboardStats();
                } else {
                    app.showToast(res.message || 'Failed to delete company', 'error');
                }
            }
        );
    }

    function setFieldError(fieldKey, message) {
        const errEl = document.getElementById(`error_${fieldKey}`);
        if (errEl) errEl.textContent = message;
    }

    function clearFormErrors() {
        document.querySelectorAll('#companyModal .field-error').forEach(el => el.textContent = '');
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
        loadCompanies,
        openAddModal,
        openEditModal,
        deleteCompany
    };
})();
