<template>
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
          @click="$emit('tab-change', tab.id)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
          <i v-if="activeTab === tab.id" class="fas fa-chevron-right indicator"></i>
        </button>
      </div>
      
      <div class="menu-section">
        <div class="menu-title">快捷操作</div>
        <button class="menu-item" @click="$emit('add-user')">
          <i class="fas fa-user-plus"></i>
          <span>添加用户</span>
        </button>
        <button class="menu-item" @click="$emit('add-role')">
          <i class="fas fa-plus-circle"></i>
          <span>添加角色</span>
        </button>
        <button class="menu-item" @click="$emit('go-permissions')">
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
      <button class="logout-btn" @click="$emit('logout')">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  },
  users: {
    type: Array,
    required: true
  },
  roles: {
    type: Array,
    required: true
  },
  activeUsersCount: {
    type: Number,
    required: true
  }
})

defineEmits(['tab-change', 'add-user', 'add-role', 'go-permissions', 'logout'])
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-menu {
    max-height: 300px;
  }
}

@media (max-width: 576px) {
  .sidebar-header {
    padding: 16px;
  }
  
  .logo h2 {
    font-size: 18px;
  }
  
  .menu-item {
    padding: 10px 16px;
  }
  
  .sidebar-footer {
    padding: 16px;
  }
}
</style>