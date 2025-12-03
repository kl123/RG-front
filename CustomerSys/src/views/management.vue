<template>
  <div class="admin-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <i class="fas fa-shield-alt"></i>
          <h2>权限管理</h2>
        </div>
      </div>
      
      <div class="sidebar-menu">
        <div class="menu-section">
          <div class="menu-title">核心功能</div>
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['menu-item', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
            <i v-if="activeTab === tab.id" class="fas fa-chevron-right indicator"></i>
          </button>
        </div>
        
        <div class="menu-section">
          <div class="menu-title">快捷操作</div>
          <button class="menu-item" @click="openAddUserDialog">
            <i class="fas fa-user-plus"></i>
            <span>添加用户</span>
          </button>
          <button class="menu-item" @click="openAddRoleDialog">
            <i class="fas fa-plus-circle"></i>
            <span>添加角色</span>
          </button>
          <button class="menu-item" @click="activeTab = 'permissions'">
            <i class="fas fa-key"></i>
            <span>权限分配</span>
          </button>
        </div>
        
        <div class="menu-section">
          <div class="menu-title">系统状态</div>
          <div class="stats">
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <div class="stat-info">
                <div class="stat-value">{{ users.length }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-user-tag"></i>
              <div class="stat-info">
                <div class="stat-value">{{ roles.length }}</div>
                <div class="stat-label">角色数量</div>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-user-check"></i>
              <div class="stat-info">
                <div class="stat-value">{{ activeUsersCount }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar">
            <i class="fas fa-user-cog"></i>
          </div>
          <div class="user-info">
            <div class="user-name">系统管理员</div>
            <div class="user-role">超级管理员</div>
          </div>
        </div>
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <div class="breadcrumb">
          <span class="breadcrumb-item">系统管理</span>
          <i class="fas fa-chevron-right"></i>
          <span class="breadcrumb-item active">{{ activeTabName }}</span>
        </div>
        <div class="top-actions">
          <div class="search-container">
            <i class="fas fa-search"></i>
            <input 
              v-if="activeTab === 'users'"
              type="text" 
              v-model="userSearchQuery" 
              placeholder="搜索用户..."
            />
            <input 
              v-else-if="activeTab === 'roles'"
              type="text" 
              v-model="roleSearchQuery" 
              placeholder="搜索角色..."
            />
          </div>
          <button class="btn-refresh" @click="refreshData">
            <i class="fas fa-redo-alt"></i>
          </button>
          <div class="notifications">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </div>
        </div>
      </div>

      <!-- 主要内容 -->
      <div class="content-area">
        <!-- 用户管理 -->
        <div v-show="activeTab === 'users'" class="content-section">
          <UserManagement 
            :users="filteredUsers"
            :roles="roles"
            :filter-role="userFilterRole"
            :filter-status="userFilterStatus"
            :sort-by="userSortBy"
            @update:filter-role="userFilterRole = $event"
            @update:filter-status="userFilterStatus = $event"
            @update:sort-by="userSortBy = $event"
            @edit-user="editUser"
            @toggle-user-status="toggleUserStatus"
            @delete-user="deleteUser"
            @batch-enable="batchEnableUsers"
            @batch-disable="batchDisableUsers"
            @batch-delete="batchDeleteUsers"
            @export-users="exportUsers"
            @open-add-user-dialog="openAddUserDialog"
          />
        </div>

        <!-- 角色管理 -->
        <div v-show="activeTab === 'roles'" class="content-section">
          <RoleManagement 
            :roles="filteredRoles"
            :users="users"
            @edit-role="editRole"
            @delete-role="deleteRole"
            @manage-permissions="manageRolePermissions"
            @assign-users="assignUsersToRole"
            @duplicate-role="duplicateRole"
            @open-add-role-dialog="openAddRoleDialog"
          />
        </div>

        <!-- 权限绑定 -->
        <div v-show="activeTab === 'permissions'" class="content-section">
          <PermissionBinding 
            :roles="roles"
            :selected-role-id="selectedRoleForPermission"
            :permission-categories="permissionCategories"
            @select-role="selectRoleForPermission"
            @save-permissions="savePermissions"
            @open-add-role-dialog="openAddRoleDialog"
          />
        </div>
      </div>
    </div>

    <!-- 添加用户对话框 -->
    <div v-if="showAddUserDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
          <button class="btn-icon close" @click="closeAddUserDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="saveUser">
            <div class="form-row">
              <div class="form-group">
                <label for="username">用户名 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="userForm.username" 
                  required
                  placeholder="请输入用户名"
                />
              </div>
              <div class="form-group">
                <label for="name">姓名 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="userForm.name" 
                  required
                  placeholder="请输入真实姓名"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="email">邮箱 <span class="required">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="userForm.email" 
                  required
                  placeholder="example@domain.com"
                />
              </div>
              <div class="form-group">
                <label for="phone">手机号</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="userForm.phone" 
                  placeholder="请输入手机号码"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="password" v-if="!editingUser">密码 <span class="required">*</span></label>
                <label for="password" v-else>密码 <span class="hint">(留空表示不修改)</span></label>
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="userForm.password" 
                  :required="!editingUser"
                  placeholder="请输入密码"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="form-group">
                <label for="role">角色 <span class="required">*</span></label>
                <select id="role" v-model="userForm.role" required>
                  <option value="">请选择角色</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="status">状态</label>
                <select id="status" v-model="userForm.status">
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="closeAddUserDialog">取消</button>
          <button class="btn btn-primary" @click="saveUser">{{ editingUser ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>

    <!-- 添加角色对话框 -->
    <div v-if="showAddRoleDialog" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingRole ? '编辑角色' : '添加角色' }}</h3>
          <button class="btn-icon close" @click="closeAddRoleDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label for="roleName">角色名称 <span class="required">*</span></label>
              <input 
                type="text" 
                id="roleName" 
                v-model="roleForm.name" 
                required
                placeholder="请输入角色名称"
              />
            </div>
            <div class="form-group">
              <label for="roleDescription">角色描述</label>
              <textarea 
                id="roleDescription" 
                v-model="roleForm.description" 
                rows="3"
                placeholder="请输入角色描述"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="roleIcon">角色图标</label>
              <div class="icon-selector">
                <div 
                  v-for="icon in roleIcons" 
                  :key="icon"
                  :class="['icon-option', { selected: roleForm.icon === icon }]"
                  @click="roleForm.icon = icon"
                >
                  <i :class="icon"></i>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="closeAddRoleDialog">取消</button>
          <button class="btn btn-primary" @click="saveRole">{{ editingRole ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UserManagement from './UserManagement.vue'
import RoleManagement from './RoleManagement.vue'
import PermissionBinding from './PermissionBinding.vue'

// 标签页数据
const tabs = ref([
  { id: 'users', name: '用户管理', icon: 'fas fa-users' },
  { id: 'roles', name: '角色管理', icon: 'fas fa-user-tag' },
  { id: 'permissions', name: '权限绑定', icon: 'fas fa-key' }
])

// 活动标签页
const activeTab = ref('users')

// 计算属性
const activeTabName = computed(() => {
  const tab = tabs.value.find(t => t.id === activeTab.value)
  return tab ? tab.name : ''
})

// 数据初始化
const initUsers = () => {
  return [
    { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', phone: '13800138000', role: 1, status: 'active', createdAt: '2023-01-15' },
    { id: 2, username: 'zhangsan', name: '张三', email: 'zhangsan@example.com', phone: '13900139001', role: 2, status: 'active', createdAt: '2023-02-20' },
    { id: 3, username: 'lisi', name: '李四', email: 'lisi@example.com', phone: '13700137002', role: 3, status: 'active', createdAt: '2023-03-10' },
    { id: 4, username: 'wangwu', name: '王五', email: 'wangwu@example.com', phone: '13600136003', role: 3, status: 'inactive', createdAt: '2023-04-05' },
    { id: 5, username: 'zhaoliu', name: '赵六', email: 'zhaoliu@example.com', phone: '13500135004', role: 2, status: 'active', createdAt: '2023-05-12' }
  ]
}

const initRoles = () => {
  return [
    { id: 1, name: '超级管理员', description: '拥有系统所有权限', icon: 'fas fa-crown', isSystem: true, permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    { id: 2, name: '管理员', description: '管理系统日常操作', icon: 'fas fa-user-shield', isSystem: false, permissions: [1, 2, 5, 6, 9, 10] },
    { id: 3, name: '普通用户', description: '普通系统用户', icon: 'fas fa-user', isSystem: false, permissions: [5, 6] },
    { id: 4, name: '审核员', description: '负责内容审核', icon: 'fas fa-user-check', isSystem: false, permissions: [7, 8] }
  ]
}

const initPermissionCategories = () => {
  return [
    {
      id: 1,
      name: '用户管理',
      description: '用户账户相关权限',
      permissions: [
        { id: 1, name: '查看用户', description: '查看用户列表和详情', code: 'user:read' },
        { id: 2, name: '添加用户', description: '添加新用户账户', code: 'user:create' },
        { id: 3, name: '编辑用户', description: '修改用户信息', code: 'user:update' },
        { id: 4, name: '删除用户', description: '删除用户账户', code: 'user:delete' }
      ]
    },
    {
      id: 2,
      name: '角色管理',
      description: '角色和权限相关权限',
      permissions: [
        { id: 5, name: '查看角色', description: '查看角色列表和详情', code: 'role:read' },
        { id: 6, name: '管理角色', description: '添加、编辑和删除角色', code: 'role:manage' },
        { id: 7, name: '分配权限', description: '为角色分配权限', code: 'role:permission' }
      ]
    },
    {
      id: 3,
      name: '内容管理',
      description: '系统内容相关权限',
      permissions: [
        { id: 8, name: '查看内容', description: '查看系统内容', code: 'content:read' },
        { id: 9, name: '发布内容', description: '发布新内容', code: 'content:create' },
        { id: 10, name: '编辑内容', description: '修改现有内容', code: 'content:update' },
        { id: 11, name: '删除内容', description: '删除系统内容', code: 'content:delete' },
        { id: 12, name: '审核内容', description: '审核用户提交的内容', code: 'content:review' }
      ]
    }
  ]
}

// 响应式数据
const users = ref(initUsers())
const roles = ref(initRoles())
const permissionCategories = ref(initPermissionCategories())

// 用户管理相关状态
const userSearchQuery = ref('')
const userFilterRole = ref('')
const userFilterStatus = ref('')
const userSortBy = ref('createdAt')
const selectedUsers = ref([])
const selectAllUsers = ref(false)

// 角色管理相关状态
const roleSearchQuery = ref('')

// 权限管理相关状态
const selectedRoleForPermission = ref('')
const selectedPermissions = ref([])

// 对话框状态
const showAddUserDialog = ref(false)
const showAddRoleDialog = ref(false)
const editingUser = ref(null)
const editingRole = ref(null)
const showPassword = ref(false)

// 表单数据
const userForm = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  role: '',
  status: 'active'
})

const roleForm = ref({
  name: '',
  description: '',
  icon: 'fas fa-user'
})

// 角色图标选项
const roleIcons = ref([
  'fas fa-user',
  'fas fa-user-shield',
  'fas fa-user-tie',
  'fas fa-user-md',
  'fas fa-user-graduate',
  'fas fa-user-check',
  'fas fa-user-cog',
  'fas fa-user-edit'
])

// 计算属性
const activeUsersCount = computed(() => {
  return users.value.filter(user => user.status === 'active').length
})

const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // 搜索过滤
  if (userSearchQuery.value) {
    const query = userSearchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    )
  }
  
  // 角色过滤
  if (userFilterRole.value) {
    result = result.filter(user => user.role.toString() === userFilterRole.value)
  }
  
  // 状态过滤
  if (userFilterStatus.value) {
    result = result.filter(user => user.status === userFilterStatus.value)
  }
  
  // 排序
  result.sort((a, b) => {
    if (userSortBy.value === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    } else if (userSortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else if (userSortBy.value === 'role') {
      return a.role - b.role
    }
    return 0
  })
  
  return result
})

const filteredRoles = computed(() => {
  let result = [...roles.value]
  
  if (roleSearchQuery.value) {
    const query = roleSearchQuery.value.toLowerCase()
    result = result.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 辅助函数
const getUsersByRole = (roleId) => {
  return users.value.filter(user => user.role === roleId)
}

const getRoleById = (roleId) => {
  return roles.value.find(r => r.id === roleId)
}

// 用户管理方法
const openAddUserDialog = (user = null) => {
  editingUser.value = user
  if (user) {
    userForm.value = { ...user, password: '' }
  } else {
    userForm.value = {
      username: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      status: 'active'
    }
  }
  showPassword.value = false
  showAddUserDialog.value = true
}

const closeAddUserDialog = () => {
  showAddUserDialog.value = false
  editingUser.value = null
}

const saveUser = () => {
  if (editingUser.value) {
    // 更新用户
    const index = users.value.findIndex(u => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { 
        ...users.value[index], 
        ...userForm.value
      }
    }
  } else {
    // 添加新用户
    const newUser = {
      id: Math.max(...users.value.map(u => u.id)) + 1,
      ...userForm.value,
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.value.push(newUser)
  }
  closeAddUserDialog()
}

const editUser = (user) => {
  openAddUserDialog(user)
}

const toggleUserStatus = (user) => {
  user.status = user.status === 'active' ? 'inactive' : 'active'
}

const deleteUser = (user) => {
  if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }
}

const batchEnableUsers = (userIds) => {
  users.value.forEach(user => {
    if (userIds.includes(user.id)) {
      user.status = 'active'
    }
  })
}

const batchDisableUsers = (userIds) => {
  users.value.forEach(user => {
    if (userIds.includes(user.id)) {
      user.status = 'inactive'
    }
  })
}

const batchDeleteUsers = (userIds) => {
  if (confirm(`确定要删除选中的 ${userIds.length} 个用户吗？`)) {
    users.value = users.value.filter(user => !userIds.includes(user.id))
  }
}

const exportUsers = () => {
  alert('导出用户功能')
}

// 角色管理方法
const openAddRoleDialog = (role = null) => {
  editingRole.value = role
  if (role) {
    roleForm.value = { ...role }
  } else {
    roleForm.value = {
      name: '',
      description: '',
      icon: 'fas fa-user'
    }
  }
  showAddRoleDialog.value = true
}

const closeAddRoleDialog = () => {
  showAddRoleDialog.value = false
  editingRole.value = null
}

const saveRole = () => {
  if (editingRole.value) {
    // 更新角色
    const index = roles.value.findIndex(r => r.id === editingRole.value.id)
    if (index !== -1) {
      roles.value[index] = { 
        ...roles.value[index], 
        ...roleForm.value
      }
    }
  } else {
    // 添加新角色
    const newRole = {
      id: Math.max(...roles.value.map(r => r.id)) + 1,
      ...roleForm.value,
      isSystem: false,
      permissions: []
    }
    roles.value.push(newRole)
  }
  closeAddRoleDialog()
}

const editRole = (role) => {
  openAddRoleDialog(role)
}

const deleteRole = (role) => {
  if (role.isSystem) {
    alert('系统角色不能删除')
    return
  }
  
  const usersWithRole = getUsersByRole(role.id)
  if (usersWithRole.length > 0) {
    alert(`无法删除角色 "${role.name}"，因为有 ${usersWithRole.length} 个用户正在使用该角色`)
    return
  }
  
  if (confirm(`确定要删除角色 "${role.name}" 吗？`)) {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index !== -1) {
      roles.value.splice(index, 1)
    }
  }
}

const manageRolePermissions = (role) => {
  selectedRoleForPermission.value = role.id
  activeTab.value = 'permissions'
}

const assignUsersToRole = (role) => {
  alert(`为角色 "${role.name}" 分配用户`)
}

const duplicateRole = (role) => {
  const newRole = {
    ...role,
    id: Math.max(...roles.value.map(r => r.id)) + 1,
    name: `${role.name} (副本)`,
    isSystem: false
  }
  roles.value.push(newRole)
}

// 权限管理方法
const selectRoleForPermission = (roleId) => {
  selectedRoleForPermission.value = roleId
}

const savePermissions = (permissions) => {
  if (!selectedRoleForPermission.value) return
  
  const role = roles.value.find(r => r.id === selectedRoleForPermission.value)
  if (role) {
    role.permissions = [...permissions]
    alert('权限保存成功！')
  }
}

// 其他方法
const refreshData = () => {
  alert('数据已刷新')
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    alert('已退出登录')
  }
}

// 初始化
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 左侧导航栏样式 */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo i {
  font-size: 28px;
  color: #3498db;
}

.logo h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-section {
  margin-bottom: 24px;
}

.menu-title {
  padding: 0 20px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.menu-item {
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  position: relative;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background: rgba(52, 152, 219, 0.2);
  color: white;
  border-left: 3px solid #3498db;
}

.menu-item i:first-child {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.menu-item span {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.menu-item .indicator {
  font-size: 12px;
  color: #3498db;
}

.stats {
  padding: 0 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item i {
  font-size: 20px;
  color: #3498db;
  width: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar i {
  font-size: 16px;
  color: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.logout-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f9fa;
}

.top-bar {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #7f8c8d;
}

.breadcrumb-item.active {
  color: #2c3e50;
  font-weight: 600;
}

.breadcrumb i {
  font-size: 12px;
  color: #bdc3c7;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-container i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  font-size: 14px;
}

.search-container input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-container input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn-refresh {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-refresh:hover {
  background: #f8f9fa;
  color: #3498db;
}

.notifications {
  position: relative;
  cursor: pointer;
  padding: 8px;
}

.notifications i {
  font-size: 18px;
  color: #7f8c8d;
}

.notifications .badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

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

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  color: #2c3e50;
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group .required {
  color: #e74c3c;
}

.form-group .hint {
  color: #95a5a6;
  font-size: 12px;
  font-weight: normal;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #95a5a6;
  cursor: pointer;
  padding: 5px;
}

/* 图标选择器 */
.icon-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.icon-option {
  width: 50px;
  height: 50px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #7f8c8d;
  transition: all 0.3s ease;
}

.icon-option:hover {
  border-color: #3498db;
  color: #3498db;
}

.icon-option.selected {
  border-color: #3498db;
  background-color: #3498db;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-menu {
    max-height: 300px;
  }
  
  .top-bar {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }
  
  .breadcrumb {
    align-self: flex-start;
  }
  
  .top-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-container {
    flex: 1;
    max-width: 400px;
  }
  
  .content-area {
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .content-area {
    padding: 12px;
  }
  
  .dialog {
    width: 95%;
  }
}
</style>