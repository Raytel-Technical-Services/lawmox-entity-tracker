// Lawmox Entity Tracker Frontend JavaScript

class EntityTracker {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000'; // Update this to your deployed API URL
        this.entities = [];
        this.accounts = [];
        this.tasks = [];
        this.currentSection = 'entities';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEntities();
        this.showSection('entities');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.showSection(section);
            });
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshCurrentSection();
        });

        // Entity form
        document.getElementById('saveEntity').addEventListener('click', () => {
            this.saveEntity();
        });

        // Account form
        document.getElementById('saveAccount').addEventListener('click', () => {
            this.saveAccount();
        });

        // Task form
        document.getElementById('saveTask').addEventListener('click', () => {
            this.saveTask();
        });

        // Add task step
        document.getElementById('addStep').addEventListener('click', () => {
            this.addTaskStep();
        });

        // Task entity change - update accounts dropdown
        document.getElementById('taskEntity').addEventListener('change', (e) => {
            this.updateAccountsDropdown(e.target.value);
        });

        // Remove task step (event delegation)
        document.getElementById('taskSteps').addEventListener('click', (e) => {
            if (e.target.closest('.remove-step')) {
                e.target.closest('.task-step').remove();
            }
        });
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification('API call failed. Please check your connection.', 'error');
            throw error;
        }
    }

    async loadData() {
        try {
            await Promise.all([
                this.loadEntities(),
                this.loadAccounts(),
                this.loadTasks(),
                this.loadTaskSteps()
            ]);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    async loadEntities() {
        try {
            this.entities = await this.apiCall('/entities');
            this.renderEntities();
        } catch (error) {
            console.error('Failed to load entities:', error);
        }
    }

    async loadAccounts() {
        try {
            this.accounts = await this.apiCall('/accounts');
            this.renderAccounts();
        } catch (error) {
            console.error('Failed to load accounts:', error);
        }
    }

    async loadTasks() {
        try {
            this.tasks = await this.apiCall('/tasks');
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
        }
    }

    async loadTaskSteps() {
        try {
            this.taskSteps = await this.apiCall('/task-steps');
            this.renderTaskSteps();
        } catch (error) {
            console.error('Failed to load task steps:', error);
        }
    }

    renderEntities() {
        const tbody = document.getElementById('entitiesTableBody');
        
        if (this.entities.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-building"></i>
                            <p>No entities found. Add your first entity to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.entities.map(entity => `
            <tr>
                <td><strong>${entity.entity_name}</strong></td>
                <td>${entity.ein || '-'}</td>
                <td>${entity.date_of_formation ? new Date(entity.date_of_formation).toLocaleDateString() : '-'}</td>
                <td>${entity.state_of_formation || '-'}</td>
                <td>${entity.entity_type || '-'}</td>
                <td><span class="badge status-badge status-${entity.status}">${entity.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary edit-entity" data-id="${entity.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-entity" data-id="${entity.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Add event listeners
        tbody.querySelectorAll('.edit-entity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editEntity(e.target.closest('button').dataset.id);
            });
        });

        tbody.querySelectorAll('.delete-entity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteEntity(e.target.closest('button').dataset.id);
            });
        });
    }

    renderAccounts() {
        const tbody = document.getElementById('accountsTableBody');
        
        if (this.accounts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-user-circle"></i>
                            <p>No accounts found. Add your first account to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.accounts.map(account => {
            const entity = this.entities.find(e => e.id === account.entity_id);
            return `
                <tr>
                    <td><strong>${account.account_name}</strong></td>
                    <td>${entity ? entity.entity_name : 'Unknown'}</td>
                    <td>${account.account_type || '-'}</td>
                    <td>${account.username || '-'}</td>
                    <td>
                        ${account.login_url ? 
                            `<a href="${account.login_url}" target="_blank" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-external-link-alt me-1"></i>Login
                            </a>` : '-'}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-account" data-id="${account.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-account" data-id="${account.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        tbody.querySelectorAll('.edit-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editAccount(e.target.closest('button').dataset.id);
            });
        });

        tbody.querySelectorAll('.delete-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteAccount(e.target.closest('button').dataset.id);
            });
        });
    }

    renderTasks() {
        const tbody = document.getElementById('tasksTableBody');
        
        if (this.tasks.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>No tasks found. Add your first task to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.tasks.map(task => {
            const entity = this.entities.find(e => e.id === task.entity_id);
            const account = this.accounts.find(a => a.id === task.account_id);
            
            return `
                <tr>
                    <td><strong>${task.task_title}</strong></td>
                    <td>${entity ? entity.entity_name : 'Unknown'}</td>
                    <td>${account ? account.account_name : '-'}</td>
                    <td>${task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</td>
                    <td><span class="badge priority-${task.priority}">${task.priority}</span></td>
                    <td><span class="badge status-badge status-${task.status}">${task.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        tbody.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTask(e.target.closest('button').dataset.id);
            });
        });

        tbody.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTask(e.target.closest('button').dataset.id);
            });
        });
    }

    renderTaskSteps() {
        const tbody = document.getElementById('taskStepsTableBody');
        
        if (this.taskSteps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>No task steps found. Add your first task step to get started.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.taskSteps.map(step => {
            const task = this.tasks.find(t => t.id === step.task_id);
            
            return `
                <tr>
                    <td><strong>${step.step_name}</strong></td>
                    <td>${task ? task.task_title : 'Unknown'}</td>
                    <td>${step.description || '-'}</td>
                    <td><span class="badge status-badge status-${step.status}">${step.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-task-step" data-id="${step.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-task-step" data-id="${step.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        tbody.querySelectorAll('.edit-task-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editTaskStep(e.target.closest('button').dataset.id);
            });
        });

        tbody.querySelectorAll('.delete-task-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTaskStep(e.target.closest('button').dataset.id);
            });
        });
    }

    populateEntityDropdowns() {
        const accountEntitySelect = document.getElementById('accountEntity');
        const taskEntitySelect = document.getElementById('taskEntity');
        
        const entityOptions = '<option value="">Select Entity</option>' + 
            this.entities.map(entity => `<option value="${entity.id}">${entity.entity_name}</option>`).join('');
        
        accountEntitySelect.innerHTML = entityOptions;
        taskEntitySelect.innerHTML = entityOptions;
    }

    updateAccountsDropdown(entityId) {
        const taskAccountSelect = document.getElementById('taskAccount');
        const entityAccounts = this.accounts.filter(account => account.entity_id === entityId);
        
        const accountOptions = '<option value="">Select Account (Optional)</option>' + 
            entityAccounts.map(account => `<option value="${account.id}">${account.account_name}</option>`).join('');
        
        taskAccountSelect.innerHTML = accountOptions;
    }

    async saveEntity() {
        const form = document.getElementById('entityForm');
        const entityId = document.getElementById('entityId').value;
        
        const entityData = {
            entity_name: document.getElementById('entityName').value,
            ein: document.getElementById('entityEIN').value,
            date_of_formation: document.getElementById('formationDate').value || null,
            registered_address: document.getElementById('registeredAddress').value,
            state_of_formation: document.getElementById('stateOfFormation').value,
            entity_type: document.getElementById('entityType').value,
            status: document.getElementById('entityStatus').value
        };

        try {
            if (entityId) {
                await this.apiCall(`/entities/${entityId}`, 'PUT', entityData);
                this.showNotification('Entity updated successfully', 'success');
            } else {
                await this.apiCall('/entities', 'POST', entityData);
                this.showNotification('Entity created successfully', 'success');
            }
            
            bootstrap.Modal.getInstance(document.getElementById('entityModal')).hide();
            form.reset();
            document.getElementById('entityId').value = '';
            this.loadEntities();
        } catch (error) {
            this.showNotification('Failed to save entity', 'error');
        }
    }

    async saveAccount() {
        const form = document.getElementById('accountForm');
        const accountId = document.getElementById('accountId').value;
        
        const accountData = {
            entity_id: document.getElementById('accountEntity').value,
            account_name: document.getElementById('accountName').value,
            login_url: document.getElementById('loginUrl').value,
            username: document.getElementById('accountUsername').value,
            password: document.getElementById('accountPassword').value,
            account_type: document.getElementById('accountType').value,
            notes: document.getElementById('accountNotes').value
        };

        try {
            if (accountId) {
                await this.apiCall(`/accounts/${accountId}`, 'PUT', accountData);
                this.showNotification('Account updated successfully', 'success');
            } else {
                await this.apiCall('/accounts', 'POST', accountData);
                this.showNotification('Account created successfully', 'success');
            }
            
            bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();
            form.reset();
            document.getElementById('accountId').value = '';
            this.loadAccounts();
        } catch (error) {
            this.showNotification('Failed to save account', 'error');
        }
    }

    async saveTask() {
        const form = document.getElementById('taskForm');
        const taskId = document.getElementById('taskId').value;
        
        // Get task steps
        const steps = [];
        document.querySelectorAll('.task-step').forEach((stepElement, index) => {
            const description = stepElement.querySelector('.step-description').value;
            if (description) {
                steps.push({
                    step_order: index + 1,
                    step_description: description,
                    completed: false
                });
            }
        });

        const taskData = {
            entity_id: document.getElementById('taskEntity').value,
            account_id: document.getElementById('taskAccount').value || null,
            task_title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            deadline: document.getElementById('taskDeadline').value || null,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            steps: steps
        };

        try {
            if (taskId) {
                await this.apiCall(`/tasks/${taskId}`, 'PUT', taskData);
                this.showNotification('Task updated successfully', 'success');
            } else {
                await this.apiCall('/tasks', 'POST', taskData);
                this.showNotification('Task created successfully', 'success');
            }
            
            bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
            form.reset();
            document.getElementById('taskId').value = '';
            this.resetTaskSteps();
            this.loadTasks();
        } catch (error) {
            this.showNotification('Failed to save task', 'error');
        }
    }

    async editEntity(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity) return;

        document.getElementById('entityId').value = entity.id;
        document.getElementById('entityName').value = entity.entity_name;
        document.getElementById('entityEIN').value = entity.ein || '';
        document.getElementById('formationDate').value = entity.date_of_formation || '';
        document.getElementById('registeredAddress').value = entity.registered_address || '';
        document.getElementById('stateOfFormation').value = entity.state_of_formation || '';
        document.getElementById('entityType').value = entity.entity_type || '';
        document.getElementById('entityStatus').value = entity.status;

        new bootstrap.Modal(document.getElementById('entityModal')).show();
    }

    async editAccount(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        if (!account) return;

        document.getElementById('accountId').value = account.id;
        document.getElementById('accountEntity').value = account.entity_id;
        document.getElementById('accountName').value = account.account_name;
        document.getElementById('loginUrl').value = account.login_url || '';
        document.getElementById('accountUsername').value = account.username || '';
        document.getElementById('accountPassword').value = ''; // Don't populate password for security
        document.getElementById('accountType').value = account.account_type || '';
        document.getElementById('accountNotes').value = account.notes || '';

        new bootstrap.Modal(document.getElementById('accountModal')).show();
    }

    async editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('taskId').value = task.id;
        document.getElementById('taskEntity').value = task.entity_id;
        this.updateAccountsDropdown(task.entity_id);
        document.getElementById('taskAccount').value = task.account_id || '';
        document.getElementById('taskTitle').value = task.task_title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskDeadline').value = task.deadline || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskStatus').value = task.status;

        // Load task steps
        this.resetTaskSteps();
        if (task.steps && task.steps.length > 0) {
            const stepsContainer = document.getElementById('taskSteps');
            stepsContainer.innerHTML = '';
            
            task.steps.forEach(step => {
                const stepElement = this.createTaskStepElement(step.step_description);
                stepsContainer.appendChild(stepElement);
            });
        }

        new bootstrap.Modal(document.getElementById('taskModal')).show();
    }

    async deleteEntity(entityId) {
        if (!confirm('Are you sure you want to delete this entity? This will also delete all associated accounts and tasks.')) {
            return;
        }

        try {
            await this.apiCall(`/entities/${entityId}`, 'DELETE');
            this.showNotification('Entity deleted successfully', 'success');
            this.loadEntities();
        } catch (error) {
            this.showNotification('Failed to delete entity', 'error');
        }
    }

    async deleteAccount(accountId) {
        if (!confirm('Are you sure you want to delete this account?')) {
            return;
        }

        try {
            await this.apiCall(`/accounts/${accountId}`, 'DELETE');
            this.showNotification('Account deleted successfully', 'success');
            this.loadAccounts();
        } catch (error) {
            this.showNotification('Failed to delete account', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            await this.apiCall(`/tasks/${taskId}`, 'DELETE');
            this.showNotification('Task deleted successfully', 'success');
            this.loadTasks();
        } catch (error) {
            this.showNotification('Failed to delete task', 'error');
        }
    }

    addTaskStep() {
        const stepsContainer = document.getElementById('taskSteps');
        const stepElement = this.createTaskStepElement();
        stepsContainer.appendChild(stepElement);
    }

    createTaskStepElement(description = '') {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'task-step mb-2';
        stepDiv.innerHTML = `
            <div class="input-group">
                <input type="text" class="form-control step-description" placeholder="Step description" value="${description}">
                <button type="button" class="btn btn-outline-danger remove-step">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return stepDiv;
    }

    resetTaskSteps() {
        const stepsContainer = document.getElementById('taskSteps');
        stepsContainer.innerHTML = `
            <div class="task-step mb-2">
                <div class="input-group">
                    <input type="text" class="form-control step-description" placeholder="Step description">
                    <button type="button" class="btn btn-outline-danger remove-step">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EntityTracker();
});
