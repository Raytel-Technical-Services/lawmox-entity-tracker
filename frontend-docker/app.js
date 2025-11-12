class LawmoxEntityTracker {
    constructor() {
        this.apiBaseUrl = window.location.origin; // Use same origin for single container
        this.entities = [];
        this.accounts = [];
        this.tasks = [];
        this.taskSteps = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Entity events
        document.getElementById('addEntityBtn').addEventListener('click', () => this.showEntityModal());
        document.getElementById('saveEntityBtn').addEventListener('click', () => this.saveEntity());
        document.getElementById('editEntityBtn').addEventListener('click', () => this.editEntity());
        document.getElementById('deleteEntityBtn').addEventListener('click', () => this.deleteEntity());

        // Account events
        document.getElementById('addAccountBtn').addEventListener('click', () => this.showAccountModal());
        document.getElementById('saveAccountBtn').addEventListener('click', () => this.saveAccount());
        document.getElementById('editAccountBtn').addEventListener('click', () => this.editAccount());
        document.getElementById('deleteAccountBtn').addEventListener('click', () => this.deleteAccount());

        // Task events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showTaskModal());
        document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());
        document.getElementById('editTaskBtn').addEventListener('click', () => this.editTask());
        document.getElementById('deleteTaskBtn').addEventListener('click', () => this.deleteTask());

        // Task step events
        document.getElementById('addTaskStepBtn').addEventListener('click', () => this.showTaskStepModal());
        document.getElementById('saveTaskStepBtn').addEventListener('click', () => this.saveTaskStep());
        document.getElementById('editTaskStepBtn').addEventListener('click', () => this.editTaskStep());
        document.getElementById('deleteTaskStepBtn').addEventListener('click', () => this.deleteTaskStep());

        // Close modal events
        document.querySelectorAll('.btn-close, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                }
            });
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
            this.showAlert('Error: ' + error.message, 'danger');
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

    // Entity methods
    renderEntities() {
        const tbody = document.getElementById('entitiesTableBody');
        tbody.innerHTML = '';

        this.entities.forEach(entity => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entity.entity_name}</td>
                <td>${entity.ein || '-'}</td>
                <td>${entity.state_of_formation || '-'}</td>
                <td>${entity.entity_type || '-'}</td>
                <td><span class="badge bg-${entity.status === 'active' ? 'success' : 'secondary'}">${entity.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="tracker.selectEntity('${entity.id}')">Select</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    selectEntity(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) {
            this.selectedEntityId = entityId;
            document.getElementById('selectedEntityName').textContent = entity.entity_name;
            
            // Filter related data
            const entityAccounts = this.accounts.filter(a => a.entity_id === entityId);
            const entityTasks = this.tasks.filter(t => t.entity_id === entityId);
            
            this.renderAccounts(entityAccounts);
            this.renderTasks(entityTasks);
            
            // Switch to accounts tab
            const accountsTab = new bootstrap.Tab(document.getElementById('accounts-tab'));
            accountsTab.show();
        }
    }

    showEntityModal(entity = null) {
        const modal = new bootstrap.Modal(document.getElementById('entityModal'));
        
        if (entity) {
            document.getElementById('entityModalTitle').textContent = 'Edit Entity';
            document.getElementById('entityName').value = entity.entity_name;
            document.getElementById('entityEIN').value = entity.ein || '';
            document.getElementById('entityDate').value = entity.date_of_formation || '';
            document.getElementById('entityAddress').value = entity.registered_address || '';
            document.getElementById('entityState').value = entity.state_of_formation || '';
            document.getElementById('entityType').value = entity.entity_type || '';
            document.getElementById('entityStatus').value = entity.status;
            this.editingEntityId = entity.id;
        } else {
            document.getElementById('entityModalTitle').textContent = 'Add New Entity';
            document.getElementById('entityForm').reset();
            this.editingEntityId = null;
        }
        
        modal.show();
    }

    async saveEntity() {
        const entityData = {
            entity_name: document.getElementById('entityName').value,
            ein: document.getElementById('entityEIN').value || null,
            date_of_formation: document.getElementById('entityDate').value || null,
            registered_address: document.getElementById('entityAddress').value || null,
            state_of_formation: document.getElementById('entityState').value || null,
            entity_type: document.getElementById('entityType').value || null,
            status: document.getElementById('entityStatus').value
        };

        try {
            if (this.editingEntityId) {
                await this.apiCall(`/entities/${this.editingEntityId}`, 'PUT', entityData);
            } else {
                await this.apiCall('/entities', 'POST', entityData);
            }
            
            await this.loadEntities();
            bootstrap.Modal.getInstance(document.getElementById('entityModal')).hide();
            this.showAlert('Entity saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save entity:', error);
        }
    }

    async editEntity() {
        if (this.selectedEntityId) {
            const entity = this.entities.find(e => e.id === this.selectedEntityId);
            if (entity) {
                this.showEntityModal(entity);
            }
        } else {
            this.showAlert('Please select an entity first', 'warning');
        }
    }

    async deleteEntity() {
        if (this.selectedEntityId && confirm('Are you sure you want to delete this entity?')) {
            try {
                await this.apiCall(`/entities/${this.selectedEntityId}`, 'DELETE');
                await this.loadEntities();
                this.selectedEntityId = null;
                document.getElementById('selectedEntityName').textContent = 'None selected';
                this.showAlert('Entity deleted successfully!', 'success');
            } catch (error) {
                console.error('Failed to delete entity:', error);
            }
        }
    }

    // Account methods
    renderAccounts(accounts = this.accounts) {
        const tbody = document.getElementById('accountsTableBody');
        tbody.innerHTML = '';

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.account_name}</td>
                <td>${account.username}</td>
                <td>${account.entity_id ? 'Linked' : 'Standalone'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="tracker.selectAccount('${account.id}')">Select</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    selectAccount(accountId) {
        this.selectedAccountId = accountId;
        const account = this.accounts.find(a => a.id === accountId);
        if (account) {
            document.getElementById('selectedAccountName').textContent = account.account_name;
        }
    }

    showAccountModal(account = null) {
        const modal = new bootstrap.Modal(document.getElementById('accountModal'));
        
        if (account) {
            document.getElementById('accountModalTitle').textContent = 'Edit Account';
            document.getElementById('accountName').value = account.account_name;
            document.getElementById('accountUsername').value = account.username;
            document.getElementById('accountPassword').value = '';
            document.getElementById('accountEntity').value = account.entity_id || '';
            this.editingAccountId = account.id;
        } else {
            document.getElementById('accountModalTitle').textContent = 'Add New Account';
            document.getElementById('accountForm').reset();
            this.editingAccountId = null;
        }
        
        modal.show();
    }

    async saveAccount() {
        const accountData = {
            account_name: document.getElementById('accountName').value,
            username: document.getElementById('accountUsername').value,
            password: document.getElementById('accountPassword').value,
            entity_id: document.getElementById('accountEntity').value || null
        };

        try {
            if (this.editingAccountId) {
                // For editing, we'd need a password update endpoint
                this.showAlert('Account editing not implemented yet', 'warning');
            } else {
                await this.apiCall('/accounts', 'POST', accountData);
            }
            
            await this.loadAccounts();
            bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();
            this.showAlert('Account saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save account:', error);
        }
    }

    // Task methods
    renderTasks(tasks = this.tasks) {
        const tbody = document.getElementById('tasksTableBody');
        tbody.innerHTML = '';

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.task_name}</td>
                <td>${task.description || '-'}</td>
                <td><span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span></td>
                <td>${task.entity_id ? 'Linked' : 'Standalone'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="tracker.selectTask('${task.id}')">Select</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    selectTask(taskId) {
        this.selectedTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('selectedTaskName').textContent = task.task_name;
            
            // Load task steps
            const taskSteps = this.taskSteps.filter(s => s.task_id === taskId);
            this.renderTaskSteps(taskSteps);
            
            // Switch to task steps tab
            const taskStepsTab = new bootstrap.Tab(document.getElementById('task-steps-tab'));
            taskStepsTab.show();
        }
    }

    showTaskModal(task = null) {
        const modal = new bootstrap.Modal(document.getElementById('taskModal'));
        
        if (task) {
            document.getElementById('taskModalTitle').textContent = 'Edit Task';
            document.getElementById('taskName').value = task.task_name;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskEntity').value = task.entity_id || '';
            this.editingTaskId = task.id;
        } else {
            document.getElementById('taskModalTitle').textContent = 'Add New Task';
            document.getElementById('taskForm').reset();
            this.editingTaskId = null;
        }
        
        modal.show();
    }

    async saveTask() {
        const taskData = {
            task_name: document.getElementById('taskName').value,
            description: document.getElementById('taskDescription').value || null,
            status: document.getElementById('taskStatus').value,
            entity_id: document.getElementById('taskEntity').value || null
        };

        try {
            if (this.editingTaskId) {
                await this.apiCall(`/tasks/${this.editingTaskId}`, 'PUT', taskData);
            } else {
                await this.apiCall('/tasks', 'POST', taskData);
            }
            
            await this.loadTasks();
            bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
            this.showAlert('Task saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    }

    // Task step methods
    renderTaskSteps(steps = this.taskSteps) {
        const tbody = document.getElementById('taskStepsTableBody');
        tbody.innerHTML = '';

        steps.forEach(step => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${step.step_name}</td>
                <td>${step.description || '-'}</td>
                <td><span class="badge bg-${this.getStatusColor(step.status)}">${step.status}</span></td>
                <td>${step.task_id || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="tracker.selectTaskStep('${step.id}')">Select</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    selectTaskStep(stepId) {
        this.selectedTaskStepId = stepId;
        const step = this.taskSteps.find(s => s.id === stepId);
        if (step) {
            document.getElementById('selectedTaskStepName').textContent = step.step_name;
        }
    }

    showTaskStepModal(step = null) {
        const modal = new bootstrap.Modal(document.getElementById('taskStepModal'));
        
        if (step) {
            document.getElementById('taskStepModalTitle').textContent = 'Edit Task Step';
            document.getElementById('taskStepName').value = step.step_name;
            document.getElementById('taskStepDescription').value = step.description || '';
            document.getElementById('taskStepStatus').value = step.status;
            document.getElementById('taskStepTask').value = step.task_id || '';
            this.editingTaskStepId = step.id;
        } else {
            document.getElementById('taskStepModalTitle').textContent = 'Add New Task Step';
            document.getElementById('taskStepForm').reset();
            if (this.selectedTaskId) {
                document.getElementById('taskStepTask').value = this.selectedTaskId;
            }
            this.editingTaskStepId = null;
        }
        
        modal.show();
    }

    async saveTaskStep() {
        const stepData = {
            step_name: document.getElementById('taskStepName').value,
            description: document.getElementById('taskStepDescription').value || null,
            status: document.getElementById('taskStepStatus').value,
            task_id: document.getElementById('taskStepTask').value
        };

        try {
            if (this.editingTaskStepId) {
                await this.apiCall(`/task-steps/${this.editingTaskStepId}`, 'PUT', stepData);
            } else {
                await this.apiCall('/task-steps', 'POST', stepData);
            }
            
            await this.loadTaskSteps();
            bootstrap.Modal.getInstance(document.getElementById('taskStepModal')).hide();
            this.showAlert('Task step saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save task step:', error);
        }
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'in_progress': 'info',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the app
const tracker = new LawmoxEntityTracker();
