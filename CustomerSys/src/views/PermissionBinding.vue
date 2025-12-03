<template>
  <div class="content-section">
    <div class="section-header">
      <div class="section-title">
        <h2><i class="fas fa-key"></i> 权限绑定</h2>
        <p class="section-description">为角色分配系统功能权限</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-primary" @click="handleSavePermissions" :disabled="!selectedRoleId">
          <i class="fas fa-save"></i> 保存权限
        </button>
      </div>
    </div>
    
    <div class="permission-manager">
      <div class="role-selector-section">
        <h3><i class="fas fa-user-tag"></i> 选择角色</h3>
        <div class="role-selector-grid">
          <div 
            v-for="role in roles" 
            :key="role.id"
            :class="['role-selector-card', { active: selectedRoleId === role.id }]"
            @click="selectRole(role.id)"
          >
            <div class="selector-icon" :style="{ backgroundColor: getRoleColor(role.id) }">
              <i :class="role.icon"></i>
            </div>
            <div class="selector-info">
              <h4>{{ role.name }}</h4>
              <p>{{ role.description }}</p>
            </div>
            <div class="selector-badge">
              {{ role.permissions.length }} 个权限
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedRoleId" class="permission-editor">
        <div class="permission-editor-header">
          <h3>
            <i class="fas fa-key"></i> 
            {{ getSelectedRole()?.name }} 权限配置
          </h3>
          <div class="permission-actions">
            <button class="btn btn-outline" @click="selectAll">
              <i class="fas fa-check-square"></i> 全选
            </button>
            <button class="btn btn-outline" @click="clearAll">
              <i class="fas fa-times-circle"></i> 清空
            </button>
            <button class="btn btn-outline" @click="reset">
              <i class="fas fa-undo"></i> 重置
            </button>
          </div>
        </div>
        
        <div class="permission-categories">
          <div v-for="category in permissionCategories" :key="category.id" class="permission-category">
            <div class="category-header" @click="toggleCategory(category.id)">
              <div class="category-title">
                <i class="fas fa-folder"></i>
                <h4>{{ category.name }}</h4>
                <span class="category-count">
                  {{ getSelectedPermissionsInCategory(category.id).length }}/{{ category.permissions.length }}
                </span>
              </div>
              <i :class="['category-toggle', expandedCategories.includes(category.id) ? 'fas fa-chevron-up' : 'fas fa-chevron-down']"></i>
            </div>
            
            <div v-if="expandedCategories.includes(category.id)" class="permission-list">
              <div class="category-actions">
                <button class="btn-link" @click="selectAllInCategory(category.id)">
                  全选
                </button>
                <button class="btn-link" @click="clearAllInCategory(category.id)">
                  清空
                </button>
              </div>
              
              <div class="permission-items">
                <div 
                  v-for="permission in category.permissions" 
                  :key="permission.id"
                  :class="['permission-item', { selected: selectedPermissions.includes(permission.id) }]"
                  @click="togglePermission(permission.id)"
                >
                  <div class="permission-checkbox">
                    <i 
                      v-if="selectedPermissions.includes(permission.id)" 
                      class="fas fa-check"
                    ></i>
                  </div>
                  <div class="permission-info">
                    <div class="permission-name">{{ permission.name }}</div>
                    <div class="permission-description">{{ permission.description }}</div>
                  </div>
                  <div class="permission-code">
                    <code>{{ permission.code }}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="permission-summary">
          <div class="summary-stats">
            <div class="stat">
              <div class="stat-value">{{ selectedPermissions.length }}</div>
              <div class="stat-label">已选权限</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ totalPermissions }}</div>
              <div class="stat-label">总权限数</div>
            </div>
            <div class="stat">
              <div class="stat-value">{{ coverage }}%</div>
              <div class="stat-label">覆盖率</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-role-selected">
        <div class="empty-state">
          <i class="fas fa-user-tag"></i>
          <h3>请选择一个角色</h3>
          <p>从上方选择要配置权限的角色，或点击下方创建新角色</p>
          <button class="btn btn-primary" @click="$emit('open-add-role-dialog')">
            <i class="fas fa-plus-circle"></i> 创建新角色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  roles: {
    type: Array,
    required: true
  },
  selectedRoleId: {
    type: [String, Number],
    default: ''
  },
  permissionCategories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select-role', 'save-permissions', 'open-add-role-dialog'])

// 本地状态
const selectedPermissions = ref([])
const expandedCategories = ref([])

// 计算属性
const totalPermissions = computed(() => {
  return props.permissionCategories.reduce((total, category) => 
    total + category.permissions.length, 0
  )
})

const coverage = computed(() => {
  return ((selectedPermissions.value.length / totalPermissions.value) * 100).toFixed(1)
})

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

const getSelectedRole = () => {
  return props.roles.find(role => role.id === props.selectedRoleId)
}

const getSelectedPermissionsInCategory = (categoryId) => {
  const category = props.permissionCategories.find(c => c.id === categoryId)
  if (!category) return []
  
  return category.permissions.filter(p => 
    selectedPermissions.value.includes(p.id)
  )
}

// 事件处理
const selectRole = (roleId) => {
  emit('select-role', roleId)
}

const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index === -1) {
    expandedCategories.value.push(categoryId)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

const selectAll = () => {
  const allPermissions = []
  props.permissionCategories.forEach(category => {
    category.permissions.forEach(permission => {
      allPermissions.push(permission.id)
    })
  })
  selectedPermissions.value = allPermissions
}

const clearAll = () => {
  selectedPermissions.value = []
}

const reset = () => {
  const role = getSelectedRole()
  if (role) {
    selectedPermissions.value = [...role.permissions]
  } else {
    selectedPermissions.value = []
  }
}

const selectAllInCategory = (categoryId) => {
  const category = props.permissionCategories.find(c => c.id === categoryId)
  if (!category) return
  
  category.permissions.forEach(permission => {
    if (!selectedPermissions.value.includes(permission.id)) {
      selectedPermissions.value.push(permission.id)
    }
  })
}

const clearAllInCategory = (categoryId) => {
  const category = props.permissionCategories.find(c => c.id === categoryId)
  if (!category) return
  
  selectedPermissions.value = selectedPermissions.value.filter(permId => 
    !category.permissions.some(p => p.id === permId)
  )
}

const togglePermission = (permissionId) => {
  const index = selectedPermissions.value.indexOf(permissionId)
  if (index === -1) {
    selectedPermissions.value.push(permissionId)
  } else {
    selectedPermissions.value.splice(index, 1)
  }
}

const handleSavePermissions = () => {
  emit('save-permissions', [...selectedPermissions.value])
}

// 监听选中的角色变化，更新权限选择
watch(() => props.selectedRoleId, (newRoleId) => {
  if (newRoleId) {
    const role = props.roles.find(r => r.id === newRoleId)
    if (role) {
      selectedPermissions.value = [...role.permissions]
    }
  } else {
    selectedPermissions.value = []
  }
  expandedCategories.value = []
}, { immediate: true })
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-link {
  background: transparent;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

/* 权限管理样式 */
.permission-manager {
  padding: 24px;
}

.role-selector-section {
  margin-bottom: 32px;
}

.role-selector-section h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.role-selector-card {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.role-selector-card:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.role-selector-card.active {
  border-color: #3498db;
  background: #e8f4fc;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.selector-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.selector-info {
  flex: 1;
}

.selector-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 16px;
}

.selector-info p {
  margin: 0 0 12px 0;
  color: #7f8c8d;
  font-size: 13px;
  line-height: 1.4;
}

.selector-badge {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
}

.permission-editor {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.permission-editor-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permission-editor-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.permission-categories {
  padding: 24px;
}

.permission-category {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.permission-category:last-child {
  margin-bottom: 0;
}

.category-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.category-header:hover {
  background: #f0f0f0;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.category-title i {
  color: #3498db;
  font-size: 16px;
}

.category-title h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.category-count {
  background: #3498db;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.category-toggle {
  color: #95a5a6;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.permission-list {
  padding: 20px;
}

.category-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.permission-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.permission-item:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.permission-item.selected {
  background: #e8f4fc;
  border-color: #3498db;
}

.permission-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: white;
  flex-shrink: 0;
}

.permission-item.selected .permission-checkbox {
  background: #3498db;
  border-color: #3498db;
}

.permission-item.selected .permission-checkbox i {
  font-size: 12px;
}

.permission-info {
  flex: 1;
}

.permission-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.permission-description {
  font-size: 13px;
  color: #7f8c8d;
}

.permission-code {
  flex-shrink: 0;
}

.permission-code code {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
}

.permission-summary {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.summary-stats .stat {
  text-align: center;
}

.summary-stats .stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #3498db;
  margin-bottom: 4px;
}

.summary-stats .stat-label {
  font-size: 12px;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-role-selected {
  padding: 60px 20px;
  text-align: center;
  color: #95a5a6;
  background: white;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}

.no-role-selected i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-role-selected h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.no-role-selected p {
  margin: 0 0 20px 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .role-selector-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  
  .permission-manager {
    padding: 16px;
  }
  
  .permission-editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .permission-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .role-selector-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  
  .permission-categories {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .section-header {
    padding: 16px;
  }
  
  .role-selector-grid {
    grid-template-columns: 1fr;
  }
  
  .permission-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .permission-checkbox {
    align-self: flex-start;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 20px;
  }
}
</style>