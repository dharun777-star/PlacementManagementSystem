/**
 * PlacementHub - Student Management Module
 * Handles Student CRUD, Filtering, Searching, and Validation.
 */

const studentsModule = (() => {
    let studentsCache = [];

    // DOM Elements
    const tableBody = document.getElementById('studentsTableBody');
    const countLabel = document.getElementById('studentCountLabel');
    const searchInput = document.getElementById('studentSearchInput');
    const deptFilter = document.getElementById('studentDeptFilter');
    const statusFilter = document.getElementById('studentStatusFilter');
    const btnReset = document.getElementById('studentFilterReset');
    const btnAdd = document.getElementById('btnAddStudent');
    const form = document.getElementById('studentForm');
    const modalTitle = document.getElementById('studentModalTitle');
    const btnSave = document.getElementById('btnSaveStudent');

    function init() {
        if (btnAdd) {
            btnAdd.addEventListener('click', openAddModal);
        }

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Search & Filter listeners
        if (searchInput) {
            searchInput.addEventListener('input', debounce(loadStudents, 300));
        }
        if (deptFilter) {
            deptFilter.addEventListener('change', loadStudents);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', loadStudents);
        }
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (deptFilter) deptFilter.value = '';
                if (statusFilter) statusFilter.value = '';
                loadStudents();
            });
        }
    }

    /**
     * Fetch & render students
     */
    async function loadStudents() {
        if (!tableBody) return;

        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Loading students...</td></tr>';

        const params = {};
        if (searchInput && searchInput.value.trim()) {
            params.search = searchInput.value.trim();
        }
        if (deptFilter && deptFilter.value) {
            params.department = deptFilter.value;
        }
        if (statusFilter && statusFilter.value) {
            params.placement_status = statusFilter.value;
        }

        const res = await API.getStudents(params);
        if (!res.success) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">${res.message || 'Failed to load students.'}</td></tr>`;
            return;
        }

        studentsCache = res.data || [];
        renderTable(studentsCache);
    }

    /**
     * Render students table rows
     */
    function renderTable(students) {
        if (!tableBody) return;

        if (countLabel) {
            countLabel.textContent = `Showing ${students.length} student${students.length === 1 ? '' : 's'}`;
        }

        if (students.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No students found matching your criteria.</td></tr>';
            return;
        }

        tableBody.innerHTML = students.map(s => {
            const skillsList = (s.skills || '')
                .split(',')
                .map(sk => sk.trim())
                .filter(Boolean);

            const skillsHtml = skillsList.length > 0
                ? `<div class="tag-list">${skillsList.slice(0, 3).map(sk => `<span class="skill-pill">${app.escapeHtml(sk)}</span>`).join('')}${skillsList.length > 3 ? `<span class="skill-pill">+${skillsList.length - 3}</span>` : ''}</div>`
                : '<span class="text-muted">-</span>';

            const statusClass = s.placement_status === 'Placed' ? 'badge-success' : 'badge-warning';

            return `
                <tr>
                    <td><strong>${app.escapeHtml(s.student_id)}</strong></td>
                    <td>
                        <div style="font-weight: 600; color: var(--slate-900);">${app.escapeHtml(s.name)}</div>
                    </td>
                    <td>
                        <div>${app.escapeHtml(s.email)}</div>
                        <div class="student-sub">${app.escapeHtml(s.phone)}</div>
                    </td>
                    <td>
                        <span class="badge badge-primary">${app.escapeHtml(s.department)}</span>
                        <div class="student-sub">Year ${s.year}</div>
                    </td>
                    <td><strong>${parseFloat(s.cgpa).toFixed(2)}</strong></td>
                    <td>${skillsHtml}</td>
                    <td><span class="badge ${statusClass}">${s.placement_status}</span></td>
                    <td class="text-right">
                        <div class="table-actions">
                            <button class="btn-icon-action edit" title="Edit Student" onclick="studentsModule.openEditModal(${s.id})">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon-action delete" title="Delete Student" onclick="studentsModule.deleteStudent(${s.id}, '${app.escapeHtml(s.name)}')">
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
     * Open Add Student Modal
     */
    function openAddModal() {
        if (!form) return;
        form.reset();
        document.getElementById('studentDbId').value = '';
        if (modalTitle) modalTitle.textContent = 'Add New Student';
        if (btnSave) btnSave.textContent = 'Save Student';
        clearFormErrors();
        app.openModal('studentModal');
    }

    /**
     * Open Edit Student Modal
     */
    async function openEditModal(studentDbId) {
        clearFormErrors();

        // Check local cache first or fetch from API
        let student = studentsCache.find(s => s.id === studentDbId);
        if (!student) {
            const res = await API.getStudent(studentDbId);
            if (!res.success) {
                app.showToast('Could not fetch student details', 'error');
                return;
            }
            student = res.data;
        }

        // Fill Form Fields
        document.getElementById('studentDbId').value = student.id;
        document.getElementById('studentId').value = student.student_id;
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentPhone').value = student.phone;
        document.getElementById('studentDept').value = student.department;
        document.getElementById('studentYear').value = student.year;
        document.getElementById('studentCgpa').value = student.cgpa;
        document.getElementById('studentStatus').value = student.placement_status;
        document.getElementById('studentSkills').value = student.skills || '';

        if (modalTitle) modalTitle.textContent = 'Edit Student Details';
        if (btnSave) btnSave.textContent = 'Update Student';

        app.openModal('studentModal');
    }

    /**
     * Handle Form Submission (Create or Update)
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        clearFormErrors();

        const dbId = document.getElementById('studentDbId').value;
        const studentId = document.getElementById('studentId').value.trim();
        const name = document.getElementById('studentName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const phone = document.getElementById('studentPhone').value.trim();
        const department = document.getElementById('studentDept').value;
        const year = parseInt(document.getElementById('studentYear').value, 10);
        const cgpaVal = document.getElementById('studentCgpa').value.trim();
        const placementStatus = document.getElementById('studentStatus').value;
        const skills = document.getElementById('studentSkills').value.trim();

        // Client-side validations
        let hasError = false;

        if (!studentId) {
            setFieldError('studentId', 'Student ID is required.');
            hasError = true;
        }
        if (!name) {
            setFieldError('studentName', 'Name is required.');
            hasError = true;
        }
        if (!email) {
            setFieldError('studentEmail', 'Email is required.');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError('studentEmail', 'Please enter a valid email address.');
            hasError = true;
        }

        const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
        if (!phone) {
            setFieldError('studentPhone', 'Phone number is required.');
            hasError = true;
        } else if (!/^\d{10,15}$/.test(cleanPhone)) {
            setFieldError('studentPhone', 'Phone number must have between 10 and 15 digits.');
            hasError = true;
        }

        if (!department) {
            setFieldError('studentDept', 'Please select a department.');
            hasError = true;
        }

        const cgpa = parseFloat(cgpaVal);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            setFieldError('studentCgpa', 'CGPA must be a number between 0.00 and 10.00.');
            hasError = true;
        }

        if (hasError) return;

        const payload = {
            student_id: studentId.toUpperCase(),
            name,
            email: email.toLowerCase(),
            phone,
            department,
            year,
            cgpa,
            placement_status: placementStatus,
            skills
        };

        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Saving...';
        }

        let res;
        if (dbId) {
            // Update existing student
            res = await API.updateStudent(dbId, payload);
        } else {
            // Create new student
            res = await API.createStudent(payload);
        }

        if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = dbId ? 'Update Student' : 'Save Student';
        }

        if (!res.success) {
            // Check for field-specific validation errors from DRF
            if (res.error && typeof res.error === 'object') {
                let mapped = false;
                if (res.error.student_id) {
                    setFieldError('studentId', res.error.student_id.join(' '));
                    mapped = true;
                }
                if (res.error.email) {
                    setFieldError('studentEmail', res.error.email.join(' '));
                    mapped = true;
                }
                if (res.error.phone) {
                    setFieldError('studentPhone', res.error.phone.join(' '));
                    mapped = true;
                }
                if (res.error.cgpa) {
                    setFieldError('studentCgpa', res.error.cgpa.join(' '));
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

        app.showToast(dbId ? 'Student updated successfully!' : 'Student created successfully!', 'success');
        app.closeModal('studentModal');
        loadStudents();
        app.loadDashboardStats();
    }

    /**
     * Delete a student
     */
    function deleteStudent(id, studentName) {
        app.requestDeleteConfirm(
            `Are you sure you want to delete student "${studentName}"? All associated placement records will also be removed.`,
            async () => {
                const res = await API.deleteStudent(id);
                if (res.success) {
                    app.showToast('Student deleted successfully', 'success');
                    loadStudents();
                    app.loadDashboardStats();
                } else {
                    app.showToast(res.message || 'Failed to delete student', 'error');
                }
            }
        );
    }

    function setFieldError(fieldKey, message) {
        const errEl = document.getElementById(`error_${fieldKey}`);
        if (errEl) errEl.textContent = message;
    }

    function clearFormErrors() {
        document.querySelectorAll('#studentModal .field-error').forEach(el => el.textContent = '');
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
        loadStudents,
        openAddModal,
        openEditModal,
        deleteStudent
    };
})();
