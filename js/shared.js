/**
 * Velmont Resto - Shared UI & Integration System
 * Cozy Game UI Theme
 */

// 1. Role System Configuration
const VELMONT_ROLES = {
    ceo: { key: 'ceo', name: 'Moza Leonardo', title: 'CEO / Owner', level: 6, icon: 'ph-crown', color: '#F4BA41' },
    manager: { key: 'manager', name: 'Valerie Swan', title: 'Manajer Outlet', level: 5, icon: 'ph-briefcase', color: '#D66D40' },
    svp: { key: 'svp', name: 'Kael Percival', title: 'SVP Operational', level: 4, icon: 'ph-shield-check', color: '#4A90E2' },
    supplier: { key: 'supplier', name: 'Winston Stark', title: 'Supplier Bahan', level: 4, icon: 'ph-truck', color: '#5D8A56' },
    warlok: { key: 'warlok', name: 'Budi Warlok', title: 'Intern / Warlok', level: 1, icon: 'ph-user', color: '#9A7B6D' }
};

// Page access permissions (minimum level required)
const VELMONT_PAGE_PERMISSIONS = {
    'dashboard.html': 1,
    'attendance.html': 1,
    'inventory.html': 1,
    'admin-booking-list.html': 4,
    'finance.html': 5,
    'payroll.html': 5,
    'admin-users.html': 6
};

// Base path helper
const getBasePath = () => {
    return window.location.pathname.includes('/pages/') ? '../' : './';
};

// Get current page file name
const getCurrentPageName = () => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'index.html';
};

// 2. Initialize default data in localStorage if empty
const initDefaultData = () => {
    if (!localStorage.getItem('velmont_users')) {
        localStorage.setItem('velmont_users', JSON.stringify([
            { id: 'usr-1', name: 'Moza Leonardo', role: 'ceo', salary: 15000000 },
            { id: 'usr-2', name: 'Valerie Swan', role: 'manager', salary: 8500000 },
            { id: 'usr-3', name: 'Kael Percival', role: 'svp', salary: 6000000 },
            { id: 'usr-4', name: 'Budi Warlok', role: 'warlok', salary: 2500000 }
        ]));
    }
    if (!localStorage.getItem('velmont_session_role')) {
        localStorage.setItem('velmont_session_role', 'ceo'); // Default initial simulator role
    }
    if (!localStorage.getItem('velmont_bookings')) {
        localStorage.setItem('velmont_bookings', JSON.stringify([
            { id: 'B-101', name: 'Lord Yudha', date: '2026-05-27', time: '19:00', guests: 4, type: 'VIP Room', status: 'pending', notes: 'Anniversary dinner' },
            { id: 'B-102', name: 'Kenzo', date: '2026-05-27', time: '14:30', guests: 2, type: 'Indoor Cozy', status: 'approved', notes: 'Meeting bisnis' }
        ]));
    }
    if (!localStorage.getItem('velmont_finance')) {
        localStorage.setItem('velmont_finance', JSON.stringify([
            { id: 'F-1', date: '2026-05-25', desc: 'Modal Awal Kasir', type: 'CAPITAL', amount: 5000000, user: 'CEO Moza' },
            { id: 'F-2', date: '2026-05-25', desc: 'Pembelian Kopi & Gula', type: 'EXPENSE', amount: 350000, user: 'Manajer Valerie' },
            { id: 'F-3', date: '2026-05-26', desc: 'Booking VIP Room B-102', type: 'INCOME', amount: 1200000, user: 'System' }
        ]));
    }
    if (!localStorage.getItem('velmont_inventory_warlok')) {
        localStorage.setItem('velmont_inventory_warlok', JSON.stringify([
            { id: 'I-1', name: 'Biji Kopi Arabika', qty: 15, unit: 'kg', status: 'Cukup' },
            { id: 'I-2', name: 'Susu Premium', qty: 5, unit: 'karton', status: 'Menipis' }
        ]));
    }
};

initDefaultData();

// 3. Inject CSS for Global Sidebar Navigation & Responsive Layout
const injectGlobalStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        html {
            overflow-y: auto !important;
            height: auto !important;
        }

        body {
            padding: 30px 30px 50px 290px !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            display: flex !important;
            flex-direction: row !important;
            min-height: 100vh !important;
            height: auto !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
            transition: padding-left 0.3s ease;
        }

        .game-window {
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            flex-grow: 1;
        }

        .card-body {
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
        }

        /* Cozy Game Sidebar */
        .cozy-sidebar {
            position: fixed;
            top: 20px;
            left: 20px;
            bottom: 20px;
            width: 250px;
            background: #FDF8F5;
            border: 4px solid #4A332A;
            border-radius: 24px;
            box-shadow: 0 10px 0 #4A332A, 0 15px 25px rgba(0, 0, 0, 0.4);
            z-index: 999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Nunito', sans-serif;
            transition: transform 0.3s ease, left 0.3s ease;
        }

        .sidebar-header {
            background: #4A332A;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #FDF8F5;
            border-bottom: 4px solid #4A332A;
        }

        .sidebar-logo {
            width: 38px;
            height: 38px;
            object-fit: contain;
            border-radius: 8px;
            border: 2px solid #FDF8F5;
            background: #fff;
        }

        .sidebar-brand-name {
            font-size: 1.1rem;
            font-weight: 900;
            letter-spacing: 0.5px;
        }

        .sidebar-profile {
            padding: 15px;
            border-bottom: 2px dashed #E8D8D0;
            background: #FFFBF9;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .profile-name {
            font-weight: 800;
            font-size: 0.95rem;
            color: #4A332A;
        }

        .profile-role-badge {
            font-size: 0.75rem;
            font-weight: 900;
            padding: 3px 8px;
            border-radius: 8px;
            color: white;
            width: fit-content;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .sidebar-nav {
            flex-grow: 1;
            padding: 15px 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            overflow-y: auto;
        }

        .nav-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-radius: 12px;
            color: #4A332A;
            text-decoration: none;
            font-weight: 800;
            font-size: 0.9rem;
            transition: all 0.15s ease;
            border: 2px solid transparent;
        }

        .nav-item-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .nav-item:hover {
            background-color: #FFF2EB;
            border-color: #4A332A;
            transform: scale(1.02);
        }

        .nav-item.active {
            background-color: #D66D40;
            color: white;
            border-color: #4A332A;
            box-shadow: 0 4px 0 #4A332A;
        }

        .nav-item.active i {
            color: white !important;
        }

        .nav-item.locked {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #F1ECE9;
        }
        
        .nav-item.locked:hover {
            transform: none;
            border-color: transparent;
            background-color: #F1ECE9;
        }

        .lock-icon {
            font-size: 1rem;
            color: #9A7B6D;
        }

        .pending-badge {
            background: #E74C3C;
            color: white;
            font-size: 0.7rem;
            font-weight: 900;
            padding: 2px 6px;
            border-radius: 8px;
            border: 1.5px solid #4A332A;
        }

        .sidebar-footer {
            padding: 15px;
            background: #FDF8F5;
            border-top: 3px dashed #E8D8D0;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .simulator-selector-label {
            font-size: 0.7rem;
            font-weight: 900;
            color: #9A7B6D;
            text-transform: uppercase;
        }

        .simulator-select {
            width: 100%;
            padding: 8px;
            border-radius: 10px;
            border: 2px solid #4A332A;
            font-family: 'Nunito', sans-serif;
            font-weight: 800;
            background: white;
            cursor: pointer;
            color: #4A332A;
        }

        /* Hamburger Button for Mobile */
        .sidebar-toggle-btn {
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1000;
            background: #D66D40;
            border: 3px solid #4A332A;
            border-radius: 12px;
            width: 44px;
            height: 44px;
            color: white;
            align-items: center;
            justify-content: center;
            font-size: 1.4rem;
            cursor: pointer;
            box-shadow: 0 4px 0 #4A332A;
        }
        
        .sidebar-toggle-btn:active {
            transform: translateY(4px);
            box-shadow: 0 0 0 transparent;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
            body {
                padding: 70px 20px 40px 20px !important;
            }
            .cozy-sidebar {
                transform: translateX(-280px);
                left: -280px;
            }
            .cozy-sidebar.show-sidebar {
                transform: translateX(0);
                left: 20px;
            }
            .sidebar-toggle-btn {
                display: flex;
            }
        }
    `;
    document.head.appendChild(styleEl);
};

// 4. Get active role object
const getActiveRole = () => {
    const roleKey = localStorage.getItem('velmont_session_role') || 'ceo';
    return VELMONT_ROLES[roleKey] || VELMONT_ROLES.ceo;
};

// 5. Generate and inject Sidebar UI
const injectSidebar = () => {
    const activeRole = getActiveRole();
    const basePath = getBasePath();
    const currentPage = getCurrentPageName();
    
    // Count pending bookings
    let pendingCount = 0;
    try {
        const bookings = JSON.parse(localStorage.getItem('velmont_bookings') || '[]');
        pendingCount = bookings.filter(b => b.status === 'pending').length;
    } catch(e) {}

    // HTML Structure for Sidebar
    const sidebarHtml = `
        <div class="cozy-sidebar" id="global-cozy-sidebar">
            <div class="sidebar-header">
                <img src="${basePath}assets/logo.png" alt="Velmont Logo" class="sidebar-logo">
                <span class="sidebar-brand-name">Velmont Resto</span>
            </div>
            
            <div class="sidebar-profile">
                <div class="profile-name" id="sb-profile-name">${activeRole.name}</div>
                <div class="profile-role-badge" id="sb-profile-badge" style="background-color: ${activeRole.color}">
                    <i class="ph-bold ${activeRole.icon}"></i> ${activeRole.title}
                </div>
            </div>
            
            <div class="sidebar-nav">
                <a href="${basePath}pages/dashboard.html" class="nav-item ${currentPage === 'dashboard.html' ? 'active' : ''}">
                    <span class="nav-item-content">
                        <i class="ph-bold ph-chart-pie-slice" style="color:#D66D40"></i> Dashboard
                    </span>
                </a>
                
                <!-- Absensi (Level 1+) -->
                ${createNavItem('attendance.html', 'ph-clock', '#D66D40', 'Absensi Kerja', activeRole.level, currentPage, basePath)}
                
                <!-- Inventori (Level 1+) -->
                ${createNavItem('inventory.html', 'ph-package', '#F4BA41', 'Gudang Stok', activeRole.level, currentPage, basePath)}
                
                <!-- Admin Booking List (Level 4+) -->
                ${createNavItem('admin-booking-list.html', 'ph-notebook', '#5D8A56', 'Kelola Booking', activeRole.level, currentPage, basePath, pendingCount)}
                
                <!-- Buku Keuangan (Level 5+) -->
                ${createNavItem('finance.html', 'ph-wallet', '#4A90E2', 'Buku Keuangan', activeRole.level, currentPage, basePath)}
                
                <!-- Slip Gaji (Level 5+) -->
                ${createNavItem('payroll.html', 'ph-coins', '#E74C3C', 'Gaji & Payroll', activeRole.level, currentPage, basePath)}
                
                <!-- Admin Users (Level 6+) -->
                ${createNavItem('admin-users.html', 'ph-users-three', '#8E44AD', 'Daftar Karyawan', activeRole.level, currentPage, basePath)}
            </div>
            
            <div class="sidebar-footer">
                <span class="simulator-selector-label">Simulator Role</span>
                <select class="simulator-select" onchange="changeGlobalSimulatedRole(this.value)">
                    <option value="warlok" ${activeRole.key === 'warlok' ? 'selected' : ''}>Budi Warlok (Intern - Lvl 1)</option>
                    <option value="svp" ${activeRole.key === 'svp' ? 'selected' : ''}>Kael Percival (SVP - Lvl 4)</option>
                    <option value="supplier" ${activeRole.key === 'supplier' ? 'selected' : ''}>Winston Stark (Supplier - Lvl 4)</option>
                    <option value="manager" ${activeRole.key === 'manager' ? 'selected' : ''}>Valerie Swan (Manajer - Lvl 5)</option>
                    <option value="ceo" ${activeRole.key === 'ceo' ? 'selected' : ''}>Moza Leonardo (CEO - Lvl 6)</option>
                </select>
            </div>
        </div>

        <button class="sidebar-toggle-btn" id="global-sidebar-toggle">
            <i class="ph-bold ph-list"></i>
        </button>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHtml);

    // Bind Toggle Button for Mobile
    const toggleBtn = document.getElementById('global-sidebar-toggle');
    const sidebar = document.getElementById('global-cozy-sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show-sidebar');
        });
    }
};

// Helper function to build dynamic nav items based on role access
function createNavItem(page, icon, color, label, userLevel, currentPage, basePath, badgeCount = 0) {
    const requiredLevel = VELMONT_PAGE_PERMISSIONS[page];
    const isLocked = userLevel < requiredLevel;
    const isActive = currentPage === page;
    
    if (isLocked) {
        return `
            <div class="nav-item locked" title="Butuh Level ${requiredLevel}+ untuk akses">
                <span class="nav-item-content">
                    <i class="ph-bold ${icon}" style="color:#9A7B6D"></i> ${label}
                </span>
                <i class="ph-bold ph-lock-key lock-icon"></i>
            </div>
        `;
    } else {
        return `
            <a href="${basePath}pages/${page}" class="nav-item ${isActive ? 'active' : ''}">
                <span class="nav-item-content">
                    <i class="ph-bold ${icon}" style="color:${color}"></i> ${label}
                </span>
                ${badgeCount > 0 ? `<span class="pending-badge">${badgeCount}</span>` : ''}
            </a>
        `;
    }
}

// 6. Handle Role Swapping Globally
window.changeGlobalSimulatedRole = (roleKey) => {
    localStorage.setItem('velmont_session_role', roleKey);
    
    // Check if the current page is allowed for the new role
    const currentPage = getCurrentPageName();
    const requiredLevel = VELMONT_PAGE_PERMISSIONS[currentPage] || 0;
    const newRole = VELMONT_ROLES[roleKey];
    
    if (newRole.level < requiredLevel) {
        // Not authorized anymore for this page, redirect to dashboard
        window.location.href = getBasePath() + 'pages/dashboard.html';
    } else {
        // Reload to update sidebar and local UI elements
        window.location.reload();
    }
};

// 7. Verify Hak Akses on Page Load
const checkPageAuthorization = () => {
    const currentPage = getCurrentPageName();
    const requiredLevel = VELMONT_PAGE_PERMISSIONS[currentPage];
    
    if (requiredLevel !== undefined) {
        const activeRole = getActiveRole();
        
        // Hide local simulator selectors since the sidebar handles it centrally
        const localSelector = document.getElementById('role-selector');
        if (localSelector) {
            localSelector.style.display = 'none';
            const localTesterBar = localSelector.closest('.tester-bar');
            if (localTesterBar) localTesterBar.style.display = 'none';
        }

        const forbiddenPanel = document.getElementById('forbidden-panel');
        const mainContentLayout = document.getElementById('main-content-layout');

        if (activeRole.level < requiredLevel) {
            // Show forbidden panel
            if (forbiddenPanel) {
                forbiddenPanel.style.display = 'flex';
            }
            if (mainContentLayout) {
                mainContentLayout.style.display = 'none';
            }
        } else {
            // Authorized
            if (forbiddenPanel) {
                forbiddenPanel.style.display = 'none';
            }
            if (mainContentLayout) {
                mainContentLayout.style.display = '';
            }
        }
    }
};

// Execute shared initializer on load
document.addEventListener('DOMContentLoaded', () => {
    injectGlobalStyles();
    injectSidebar();
    checkPageAuthorization();
});
