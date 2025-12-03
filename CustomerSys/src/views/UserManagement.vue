<template>
  <div class="content-section">
    <div class="section-header">
      <div class="section-title">
        <h2><i class="fas fa-users"></i> 用户管理</h2>
        <p class="section-description">管理系统用户账户，包括添加、编辑、删除用户</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-secondary" @click="$emit('export-users')">
          <i class="fas fa-download"></i> 导出
        </button>
        <button class="btn btn-primary" @click="$emit('open-add-user-dialog')">
          <i class="fas fa-user-plus"></i> 添加用户
        </button>
      </div>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>角色筛选：</label>
        <select 
          :value="filterRole" 
          @change="$emit('update:filterRole', $event.target.value)"
        >
          <option value="">全部角色</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态筛选：</label>
        <select 
          :value="filterStatus" 
          @change="$emit('update:filterStatus', $event.target.value)"
        >
          <option value="">全部状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
      <div class="filter-group">
        <label>排序：</label>
        <select 
          :value="sortBy" 
          @change="$emit('update:sortBy', $event.target.value)"
        >
          <option value="createdAt">创建时间</option>
          <option value="name">用户姓名</option>
          <option value="role">用户角色</option>
        </select>
      </div>
    </div>
    
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
            </th>
            <th>用户信息</th>
            <th>联系方式</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ selected: selectedUsers.includes(user.id) }">
            <td>
              <input type="checkbox" :value="user.id" v-model="selectedUsers">
            </td>
            <td>
              <div class="user-info-cell">
                <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(user.username) }">
                  {{ user.name.charAt(0) }}
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-username">@{{ user.username }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="contact-info">
                <div class="email">
                  <i class="fas fa-envelope"></i> {{ user.email }}
                </div>
                <div class="phone" v-if="user.phone">
                  <i class="fas fa-phone"></i> {{ user.phone }}
                </div>
              </div>
            </td>
            <td>
              <div class="role-cell">
                <span class="role-badge" :style="{ backgroundColor: getRoleColor(user.role) }">
                  <i :class="getRoleIcon(user.role)"></i>
                  {{ getRoleName(user.role) }}
                </span>
              </div>
            </td>
            <td>
              <div class="status-cell">
                <span :class="['status-badge', user.status]">
                  <i :class="user.status === 'active' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ user.status === 'active' ? '启用' : '禁用' }}
                </span>
              </div>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon" @click="$emit('edit-user', user)" title="编辑">
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  :class="['btn-icon', user.status === 'active' ? 'deactivate' : 'activate']" 
                  @click="$emit('toggle-user-status', user)"
                  :title="user.status === 'active' ? '禁用用户' : '启用用户'"
                >
                  <i :class="user.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
                <button class="btn-icon delete" @click="$emit('delete-user', user)" title="删除">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="users.length === 0" class="empty-state">
        <i class="fas fa-user-slash"></i>
        <p>没有找到匹配的用户</p>
        <button class="btn btn-primary" @click="$emit('open-add-user-dialog')">
          <i class="fas fa-user-plus"></i> 添加用户
        </button>
      </div>
      
      <div v-if="selectedUsers.length > 0" class="batch-actions">
        <span>已选择 {{ selectedUsers.length }} 个用户</span>
        <div class="batch-buttons">
          <button class="btn btn-outline" @click="handleBatchEnable">
            <i class="fas fa-user-check"></i> 批量启用
          </button>
          <button class="btn btn-outline" @click="handleBatchDisable">
            <i class="fas fa-user-slash"></i> 批量禁用
          </button>
          <button class="btn btn-danger" @click="handleBatchDelete">
            <i class="fas fa-trash"></i> 批量删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  roles: {
    type: Array,
    required: true
  },
  filterRole: {
    type: String,
    default: ''
  },
  filterStatus: {
    type: String,
    default: ''
  },
  sortBy: {
    type: String,
    default: 'createdAt'
  }
})

const emit = defineEmits([
  'edit-user',
  'toggle-user-status',
  'delete-user',
  'batch-enable',
  'batch-disable',
  'batch-delete',
  'export-users',
  'open-add-user-dialog',
  // 添加更新事件
  'update:filterRole',
  'update:filterStatus',
  'update:sortBy'
])

// 本地状态
const selectedUsers = ref([])
const selectAll = ref(false)

// 辅助函数
const getRoleName = (roleId) => {
  const role = props.roles.find(r => r.id === roleId)
  return role ? role.name : '未知角色'
}

const getRoleIcon = (roleId) => {
  const role = props.roles.find(r => r.id === roleId)
  return role ? role.icon : 'fas fa-user'
}

const getRoleColor = (roleId) => {
  const colors = {
    1: '#ff6b6b',
    2: '#4ecdc4',
    3: '#45b7d1',
    4: '#96ceb4'
  }
  return colors[roleId] || '#95a5a6'
}

const getAvatarColor = (username) => {
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ]
  const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 事件处理
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = props.users.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const handleBatchEnable = () => {
  emit('batch-enable', [...selectedUsers.value])
  selectedUsers.value = []
}

const handleBatchDisable = () => {
  emit('batch-disable', [...selectedUsers.value])
  selectedUsers.value = []
}

const handleBatchDelete = () => {
  emit('batch-delete', [...selectedUsers.value])
  selectedUsers.value = []
}

// 监听用户列表变化
watch(() => props.users, () => {
  selectAll.value = false
  selectedUsers.value = []
})
</script>

<style scoped>
.content-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title h2 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title h2 i {
  color: #3498db;
}

.section-description {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2980b9 0%, #2573a7 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
  background: white;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.btn-icon.delete:hover {
  color: #e74c3c;
  border-color: #e74c3c;
  background: #ffeaea;
}

.btn-icon.deactivate:hover {
  color: #f39c12;
  border-color: #f39c12;
  background: #fff3cd;
}

.btn-icon.activate:hover {
  color: #27ae60;
  border-color: #27ae60;
  background: #d5edda;
}

.filters {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  min-width: 120px;
}

.filter-group select:focus {
  outline: none;
  border-color: #3498db;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
  white-space: nowrap;
}

.data-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.data-table tbody tr.selected {
  background-color: #e8f4fc;
}

.data-table td {
  padding: 16px 24px;
  color: #2c3e50;
  font-size: 14px;
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-username {
  font-size: 12px;
  color: #7f8c8d;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-info .email,
.contact-info .phone {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.contact-info i {
  color: #95a5a6;
  font-size: 12px;
  width: 14px;
}

.role-cell,
.status-cell {
  display: flex;
  align-items: center;
}

.role-badge {
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-badge.active {
  background-color: #d5edda;
  color: #27ae60;
}

.status-badge.inactive {
  background-color: #ffeaea;
  color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #95a5a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 16px;
}

.batch-actions {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.batch-actions span {
  font-weight: 500;
  color: #2c3e50;
}

.batch-buttons {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .section-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .filters {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group select {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .section-header {
    padding: 16px;
  }
  
  .filters {
    padding: 16px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>