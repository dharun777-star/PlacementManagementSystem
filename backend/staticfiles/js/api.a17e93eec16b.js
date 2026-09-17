/**
 * PlacementHub - REST API Client
 * Connects frontend directly to Django REST Framework backend.
 */

const API = (() => {
    // Determine base URL:
    // If opened via Django server (e.g., http://127.0.0.1:8000/), use relative /api/
    // If opened as standalone HTML (e.g., Live Server or file://), use full backend URL
    const getBaseUrl = () => {
        if (window.location.protocol.startsWith('http') && window.location.port === '8000') {
            return '/api';
        }
        return 'http://127.0.0.1:8000/api';
    };

    const BASE_URL = getBaseUrl();

    /**
     * Generic fetch wrapper with JSON serialization and robust error extraction.
     */
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            // 204 No Content has no body
            if (response.status === 204) {
                return { success: true, data: null };
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: data,
                    message: formatErrorMessage(data, response.status)
                };
            }

            return {
                success: true,
                status: response.status,
                data
            };
        } catch (err) {
            console.error(`API Error on ${options.method || 'GET'} ${url}:`, err);
            return {
                success: false,
                status: 0,
                message: 'Unable to connect to backend server. Make sure Django is running on http://127.0.0.1:8000'
            };
        }
    }

    /**
     * Converts DRF error object or array into a clean readable string.
     */
    function formatErrorMessage(errorObj, statusCode) {
        if (typeof errorObj === 'string') return errorObj;
        if (errorObj.detail) return errorObj.detail;
        if (errorObj.message) return errorObj.message;

        const messages = [];
        for (const [key, val] of Object.entries(errorObj)) {
            const fieldName = key.replace(/_/g, ' ').toUpperCase();
            if (Array.isArray(val)) {
                messages.push(`${fieldName}: ${val.join(' ')}`);
            } else if (typeof val === 'object') {
                messages.push(`${fieldName}: ${JSON.stringify(val)}`);
            } else {
                messages.push(`${fieldName}: ${val}`);
            }
        }

        if (messages.length > 0) {
            return messages.join('\n');
        }

        return `Server returned error (${statusCode})`;
    }

    return {
        // Dashboard
        getDashboardStats: () => request('/dashboard/stats/'),

        // Students CRUD
        getStudents: (params = {}) => {
            const query = new URLSearchParams();
            if (params.search) query.set('search', params.search);
            if (params.department) query.set('department', params.department);
            if (params.placement_status) query.set('placement_status', params.placement_status);
            const qStr = query.toString();
            return request(`/students/${qStr ? '?' + qStr : ''}`);
        },
        getStudent: (id) => request(`/students/${id}/`),
        createStudent: (studentData) => request('/students/', {
            method: 'POST',
            body: JSON.stringify(studentData)
        }),
        updateStudent: (id, studentData) => request(`/students/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        }),
        patchStudent: (id, partialData) => request(`/students/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(partialData)
        }),
        deleteStudent: (id) => request(`/students/${id}/`, {
            method: 'DELETE'
        }),

        // Companies CRUD
        getCompanies: (params = {}) => {
            const query = new URLSearchParams();
            if (params.search) query.set('search', params.search);
            const qStr = query.toString();
            return request(`/companies/${qStr ? '?' + qStr : ''}`);
        },
        getCompany: (id) => request(`/companies/${id}/`),
        createCompany: (companyData) => request('/companies/', {
            method: 'POST',
            body: JSON.stringify(companyData)
        }),
        updateCompany: (id, companyData) => request(`/companies/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(companyData)
        }),
        deleteCompany: (id) => request(`/companies/${id}/`, {
            method: 'DELETE'
        }),

        // Placements CRUD
        getPlacements: (params = {}) => {
            const query = new URLSearchParams();
            if (params.search) query.set('search', params.search);
            if (params.company) query.set('company', params.company);
            if (params.status) query.set('status', params.status);
            const qStr = query.toString();
            return request(`/placements/${qStr ? '?' + qStr : ''}`);
        },
        getPlacement: (id) => request(`/placements/${id}/`),
        createPlacement: (placementData) => request('/placements/', {
            method: 'POST',
            body: JSON.stringify(placementData)
        }),
        updatePlacement: (id, placementData) => request(`/placements/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(placementData)
        }),
        deletePlacement: (id) => request(`/placements/${id}/`, {
            method: 'DELETE'
        })
    };
})();
