<template>
  <div class="content-section">
    <div class="section-header">
      <div class="section-title">
        <h2><i class="fas fa-user-tag"></i> 角色管理</h2>
        <p class="section-description">管理系统角色及其权限分配</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" @click="$emit('open-add-role-dialog')">
          <i class="fas fa-plus-circle"></i> 添加角色
        </button>
      </div>
    </div>
    
    <div class="roles-container">
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-card-header">
          <div class="role-icon" :style="{ backgroundColor: getRoleColor(role.id) }">
            <i :class="role.icon"></i>
          </div>
          <div class="role-info">
            <h3>{{ role.name }}</h3>
            <p>{{ role.description }}</p>
            <div class="role-meta">
              <span class="meta-item">
                <i class="fas fa-users"></i> {{ getUsersByRole(role.id).length }} 个用户
              </span>
              <span class="meta-item">
                <i class="fas fa-key"></i> {{ role.permissions.length }} 个权限
              </span>
            </div>
          </div>
          <div class="role-actions">
            <button class="btn-icon" @click="$emit('edit-role', role)" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button 
              class="btn-icon delete" 
              @click="$emit('delete-role', role)" 
              title="删除" 
              :disabled="role.isSystem"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <div class="role-card-body">
          <div class="permission-preview">
            <div class="permission-title">权限预览：</div>
            <div class="permission-tags">
              <span 
                v-for="permissionId in role.permissions.slice(0, 5)" 
                :key="permissionId"
                class="permission-tag"
              >
                {{ getPermissionName(permissionId) }}
              </span>
              <span v-if="role.permissions.length > 5" class="permission-more">
                +{{ role.permissions.length - 5 }} 更多
              </span>
            </div>
          </div>
          
          <div class="user-preview">
            <div class="user-title">用户预览：</div>
            <div class="user-avatars">
              <div 
                v-for="user in getUsersByRole(role.id).slice(0, 5)" 
                :key="user.id"
                class="user-avatar-small"
                :style="{ backgroundColor: getAvatarColor(user.username) }"
                :title="user.name"
              >
                {{ user.name.charAt(0) }}
              </div>
              <div 
                v-if="getUsersByRole(role.id).length > 5" 
                class="user-avatar-small more"
                :title="`还有 ${getUsersByRole(role.id).length - 5} 个用户`"
              >
                +{{ getUsersByRole(role.id).length - 5 }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="role-card-footer">
          <button class="btn btn-outline" @click="$emit('manage-permissions', role)">
            <i class="fas fa-key"></i> 管理权限
          </button>
          <button class="btn btn-outline" @click="$emit('assign-users', role)">
            <i class="fas fa-user-plus"></i> 分配用户
          </button>
          <button 
            v-if="!role.isSystem"
            class="btn btn-outline" 
            @click="$emit('duplicate-role', role)"
          >
            <i class="fas fa-copy"></i> 复制角色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  },
  users: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'edit-role',
  'delete-role',
  'manage-permissions',
  'assign-users',
  'duplicate-role',
  'open-add-role-dialog'
])

// 辅助函数
const getRoleColor = (roleId) => {
  const colors = {
    1: '#ff6b6b',
    2: '#4ecdc4',
    3: '#45b7d1',
    4: '#96ceb4'
  }
  return colors[roleId] || '#95a5a6'
}

const getPermissionName = (permissionId) => {
  // 这里应该从父组件获取权限数据
  // 简化处理，直接返回权限ID
  return `权限 ${permissionId}`
}

const getUsersByRole = (roleId) => {
  return props.users.filter(user => user.role === roleId)
}

const getAvatarColor = (username) => {
  const colors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ]
  const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}
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

.btn-icon.delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.delete:disabled:hover {
  background: white;
  border-color: #ddd;
  color: #7f8c8d;
}

/* 角色卡片样式 */
.roles-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 24px;
}

.role-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.role-card-header {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.role-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.role-info {
  flex: 1;
}

.role-info h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.role-info p {
  margin: 0 0 12px 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.4;
}

.role-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 12px;
  color: #95a5a6;
  display: flex;
  align-items: center;
  gap: 4px;
}

.role-actions {
  display: flex;
  gap: 4px;
}

.role-card-body {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.permission-preview,
.user-preview {
  margin-bottom: 16px;
}

.permission-preview:last-child,
.user-preview:last-child {
  margin-bottom: 0;
}

.permission-title,
.user-title {
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 8px;
  font-weight: 500;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #2c3e50;
}

.permission-more {
  padding: 4px 8px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #3498db;
  cursor: pointer;
}

.user-avatars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.user-avatar-small.more {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 1px solid #e0e0e0;
  cursor: pointer;
}

.role-card-footer {
  padding: 16px 20px;
  display: flex;
  gap: 8px;
  background: #f8f9fa;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .roles-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

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
  
  .roles-container {
    grid-template-columns: 1fr;
  }
  
  .role-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .role-actions {
    align-self: flex-end;
    margin-top: -40px;
  }
  
  .role-card-footer {
    flex-wrap: wrap;
  }
}

@media (max-width: 576px) {
  .section-header {
    padding: 16px;
  }
  
  .roles-container {
    padding: 16px;
  }
  
  .role-card {
    margin-bottom: 16px;
  }
  
  .role-card-header {
    padding: 16px;
  }
  
  .role-card-body {
    padding: 16px;
  }
  
  .role-card-footer {
    padding: 12px 16px;
  }
  
  .role-card-footer .btn {
    flex: 1;
    min-width: 100px;
    justify-content: center;
  }
}
</style>