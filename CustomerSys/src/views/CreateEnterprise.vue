<template>
  <div class="create-enterprise-container">
    <!-- 左侧系统信息区域 -->
    <div class="left-section">
      <div class="system-title">智能企业管理系统</div>
      <div class="system-subtitle">驱动企业数字化转型，赋能智能化管理</div>
      
      <div class="system-indicators">
        <div class="indicator-title">系统关键指标</div>
        <div class="chart-container">
          <!-- 这里使用简单的图表模拟，实际项目中可以使用Chart.js或ECharts -->
          <div class="chart">
            <div class="chart-line green-line"></div>
            <div class="chart-line orange-line"></div>
            <div class="chart-grid"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧创建企业账户表单区域 -->
    <div class="right-section">
      <div class="header">
        <a href="/" class="back-link">← 返回首页</a>
        <div class="header-icons">
          <span class="icon">📞</span>
          <span class="icon">⚙️</span>
          <span class="icon">ℹ️</span>
        </div>
      </div>

      <div class="form-container">
        <h1 class="form-title">创建企业账户</h1>
        
        <div class="progress-steps">
          <div class="step active">
            <div class="step-number">1</div>
            <div class="step-text">企业基本信息</div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-text">管理员账户</div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- 企业基本信息表单 -->
          <div class="form-row">
            <div class="form-group">
              <label for="enterpriseName">企业名称<span class="required">*</span></label>
              <input 
                type="text" 
                id="enterpriseName" 
                v-model="form.enterpriseName" 
                placeholder="请输入企业全称"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="contactPerson">负责人姓名<span class="required">*</span></label>
              <input 
                type="text" 
                id="contactPerson" 
                v-model="form.contactPerson" 
                placeholder="企业法人/总经理姓名"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="enterpriseAddress">企业地址<span class="required">*</span></label>
              <input 
                type="text" 
                id="enterpriseAddress" 
                v-model="form.enterpriseAddress" 
                placeholder="企业官方详细地址"
                required
              >
              <div class="hint">用于接收重要通知和邮寄信息</div>
            </div>
            
            <div class="form-group">
              <label for="contactPhone">联系电话<span class="required">*</span></label>
              <input 
                type="tel" 
                id="contactPhone" 
                v-model="form.contactPhone" 
                placeholder="企业负责人手机号码"
                required
              >
            </div>
          </div>

          <!-- 管理员账户表单 -->
          <div class="form-row">
            <div class="form-group">
              <label for="adminUsername">登录用户名<span class="required">*</span></label>
              <input 
                type="text" 
                id="adminUsername" 
                v-model="form.adminUsername" 
                placeholder="管理员账号"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">设置密码<span class="required">*</span></label>
              <div class="password-container">
                <input 
                  :type="showPassword ? 'text' : 'password'" 
                  id="password" 
                  v-model="form.password" 
                  placeholder="设置登录密码"
                  required
                  @input="checkPasswordStrength"
                >
                <span class="toggle-password" @click="togglePasswordVisibility">
                  {{ showPassword ? '👁️' : '🙈' }}
                </span>
              </div>
              <!-- 密码强度指示器 -->
              <div class="password-strength" v-if="form.password">
                <div class="strength-bar">
                  <div class="strength-fill" :style="{ width: passwordStrength.width + '%', backgroundColor: passwordStrength.color }"></div>
                </div>
                <div class="strength-text">{{ passwordStrength.text }}</div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">确认密码<span class="required">*</span></label>
              <div class="password-container">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  id="confirmPassword" 
                  v-model="form.confirmPassword" 
                  placeholder="确认登录密码"
                  required
                >
                <span class="toggle-password" @click="toggleConfirmPasswordVisibility">
                  {{ showConfirmPassword ? '👁️' : '🙈' }}
                </span>
              </div>
              <div class="hint" v-if="form.confirmPassword && form.password !== form.confirmPassword" style="color: red;">
                两次输入的密码不一致
              </div>
            </div>
          </div>

          <!-- 协议同意 -->
          <div class="agreement">
            <input type="checkbox" id="agreement" v-model="form.agreed" required>
            <label for="agreement">
              我已阅读并同意《<a href="#">企业用户注册协议</a>》和《<a href="#">隐私政策</a>》
            </label>
          </div>

          <!-- 按钮区域 -->
          <div class="button-container">
            <button type="button" class="contact-btn">联系客服</button>
            <button type="submit" class="next-btn" :disabled="!form.agreed || form.password !== form.confirmPassword">下一步</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

// 表单数据
const form = reactive({
  enterpriseName: '',
  contactPerson: '',
  enterpriseAddress: '',
  contactPhone: '',
  adminUsername: '',
  password: '',
  confirmPassword: '',
  agreed: false
});

// 密码可见性控制
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// 密码强度检查
const passwordStrength = ref({
  width: 0,
  color: '#ddd',
  text: '请输入密码'
});

const checkPasswordStrength = () => {
  const password = form.password;
  let strength = 0;
  
  // 长度检查
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // 复杂度检查
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  // 更新强度指示器
  if (strength <= 2) {
    passwordStrength.value = {
      width: 33,
      color: '#dc3545',
      text: '弱'
    };
  } else if (strength <= 4) {
    passwordStrength.value = {
      width: 66,
      color: '#ffc107',
      text: '中'
    };
  } else {
    passwordStrength.value = {
      width: 100,
      color: '#28a745',
      text: '强'
    };
  }
};

// 表单提交处理
const handleSubmit = () => {
  if (!form.agreed) {
    alert('请阅读并同意《企业用户注册协议》和《隐私政策》');
    return;
  }
  
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致');
    return;
  }
  
  // 表单验证通过，可以进行下一步操作
  console.log('表单数据：', form);
  // 这里可以添加路由跳转或API请求
};
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}
</style>

<style scoped>
.create-enterprise-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 左侧系统信息区域 */
.left-section {
  width: 35%;
  background-color: #0066CC;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.system-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.system-subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 60px;
}

.system-indicators {
  flex: 1;
}

.indicator-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.chart-container {
  height: 250px;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.chart-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20% 33.33%;
}

.chart-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  border-radius: 3px;
  transform-origin: left;
  animation: drawLine 2s ease-out forwards;
}

.green-line {
  background-color: #00FF00;
  height: 4px;
  animation-delay: 0.3s;
}

.orange-line {
  background-color: #FFA500;
  height: 3px;
  animation-delay: 0.6s;
}

@keyframes drawLine {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 右侧表单区域 */
.right-section {
  width: 65%;
  padding: 40px;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.back-link {
  color: #0066CC;
  text-decoration: none;
  font-size: 14px;
}

.header-icons {
  display: flex;
  gap: 15px;
  font-size: 18px;
}

.form-container {
  max-width: 600px;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.progress-steps {
  display: flex;
  margin-bottom: 40px;
}

.step {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #0066CC;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  margin-right: 10px;
}

.step-text {
  font-size: 14px;
  color: #666;
}

.active .step-text {
  color: #0066CC;
  font-weight: bold;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  flex: 1;
}

label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

input[type="text"],
input[type="password"],
input[type="tel"] {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #0066CC;
}

.required {
  color: red;
  margin-left: 5px;
}

.hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* 密码可见性切换 */
.password-container {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 5px;
}

.strength-bar {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 5px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-text {
  font-size: 12px;
  color: #666;
}

/* 协议复选框 */
.agreement {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
}

.agreement input[type="checkbox"] {
  margin-right: 10px;
  margin-top: 2px;
  width: auto;
}

.agreement label {
  font-weight: normal;
  font-size: 12px;
  color: #666;
  flex: 1;
}

.agreement a {
  color: #0066CC;
  text-decoration: none;
}

/* 按钮样式 */
.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contact-btn {
  background-color: white;
  color: #0066CC;
  border: 1px solid #0066CC;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.contact-btn:hover {
  background-color: #f0f8ff;
}

.next-btn {
  background-color: #0066CC;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.next-btn:hover {
  background-color: #0052a3;
}

.next-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .create-enterprise-container {
    flex-direction: column;
  }
  
  .left-section {
    width: 100%;
    height: 300px;
  }
  
  .right-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .button-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .contact-btn,
  .next-btn {
    width: 100%;
  }
}
</style>