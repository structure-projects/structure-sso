<!--
AgreementModal.vue - 协议弹窗组件
功能说明：
- 用户协议和隐私协议弹窗浏览
- 支持两种协议类型：用户协议、隐私协议
- 响应式设计，适配不同屏幕尺寸
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="protocolTitle"
    width="90%"
    :close-on-click-modal="true"
    class="agreement-dialog"
    :style="{
      '--el-dialog-margin-top': '8vh',
      marginTop: '8vh',
      width: '85vw',
      maxHeight: '85vh'
    }"
    @closed="handleClosed"
  >
    <div class="agreement-content" ref="contentRef">
      <div class="agreement-text" v-html="protocolContent" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          我已阅读
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  type: 'user' | 'privacy';
  merged?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'closed'): void;
}>();

const contentRef = ref<HTMLElement>();

// 协议标题
const protocolTitle = computed(() => {
  if (props.merged) {
    return '用户协议与隐私政策';
  }
  return props.type === 'user' ? '用户协议' : '隐私政策';
});

// 用户协议内容
const userAgreementContent = `
      <h3>用户服务协议</h3>
      <p>欢迎您使用我们的平台服务！本协议是您与我们之间关于使用平台服务的法律协议。请您仔细阅读本协议的全部内容，特别是涉及您权利和义务的条款。</p>
      <p>本协议内容包括协议正文及所有我们已经发布的或将来可能发布的各类规则。所有规则为本协议不可分割的一部分，与协议正文具有同等法律效力。</p>
      
      <h4>1. 服务概述</h4>
      <p>我们致力于为用户提供安全、稳定、便捷的互联网服务，包括但不限于信息浏览、内容发布、在线交流、数据存储等功能。用户可以通过注册账号使用这些服务。</p>
      <p>我们保留随时变更、中断或终止部分或全部服务的权利，且无需事先通知用户。我们不对服务的持续性、可靠性或可用性作出任何明示或暗示的保证。</p>
      
      <h4>2. 用户账号注册与管理</h4>
      <p>用户在使用本平台服务前，需要注册一个账号。注册时需要提供真实、准确、完整的信息，包括但不限于手机号、用户名等。</p>
      <p>用户应妥善保管账号密码及相关信息，对通过其账号进行的所有活动和行为承担全部责任。如发现账号被盗用或异常使用，应立即通知我们。</p>
      <p>用户有权随时注销账号，但注销后将无法恢复账号数据。</p>
      
      <h4>3. 用户行为规范</h4>
      <p>用户在使用本平台服务时，应遵守法律法规及本协议的规定，不得从事以下行为：</p>
      <ul>
        <li>发布或传播违法、有害、虚假、欺诈或侵犯他人合法权益的信息；</li>
        <li>攻击、侵入、破坏本平台的系统或网络；</li>
        <li>滥用服务，包括但不限于发送垃圾信息、恶意注册账号等；</li>
        <li>未经授权使用他人账号或信息；</li>
        <li>其他违反法律法规或损害平台及其他用户利益的行为。</li>
      </ul>
      <p>我们有权对违反上述规定的用户采取警告、限制功能、冻结账号、终止服务等措施。</p>
      
      <h4>4. 知识产权</h4>
      <p>本平台上所有内容，包括但不限于文字、图片、音频、视频、软件、商标、标识等，其知识产权均归我们或相关权利人所有。</p>
      <p>未经我们或相关权利人书面许可，用户不得复制、传播、修改、使用或授权他人使用上述内容。</p>
      <p>用户在平台上发布的内容，其著作权归用户所有，但授予我们全球范围内的非独家许可，允许我们使用、复制、修改、传播该内容以提供服务。</p>
      
      <h4>5. 隐私保护</h4>
      <p>我们重视用户的隐私保护，将按照隐私政策的规定收集、使用和保护用户的个人信息。</p>
      <p>我们不会未经用户同意向第三方披露用户的个人信息，除非法律法规要求或用户授权。</p>
      
      <h4>6. 免责声明</h4>
      <p>在法律法规允许的范围内，我们不对因使用或无法使用本服务而产生的任何直接或间接损失承担责任，包括但不限于数据丢失、利润损失、业务中断等。</p>
      <p>我们对第三方网站或服务的内容、安全性或可靠性不承担任何责任。用户链接到第三方网站或使用第三方服务的风险由用户自行承担。</p>
      
      <h4>7. 协议的修改与终止</h4>
      <p>我们有权根据业务发展需要修改本协议，修改后的协议将在平台上公布。用户继续使用服务即视为同意修改后的协议。</p>
      <p>用户可以随时通知我们终止使用服务，我们也可以根据本协议的规定终止对用户的服务。</p>
      
      <h4>8. 法律适用与争议解决</h4>
      <p>本协议的解释和执行适用中华人民共和国法律。</p>
      <p>因本协议产生的争议，双方应首先通过友好协商解决；协商不成的，任何一方均可向我们所在地有管辖权的法院提起诉讼。</p>
      
      <h4>9. 其他条款</h4>
      <p>本协议构成双方之间关于使用服务的完整协议，取代之前的所有口头或书面协议。</p>
      <p>如果本协议的任何条款被认定为无效或不可执行，该条款应被视为删除，但不影响其他条款的效力。</p>
      
      <p style="text-align: right; margin-top: 40px; font-size: 13px; color: #999;">用户协议更新日期：2026年5月22日</p>
      <p style="text-align: right; font-size: 13px; color: #999;">版本号：V1.0</p>
    `;

// 隐私政策内容
const privacyPolicyContent = `
      <h3>隐私政策</h3>
      <p>我们非常重视您的个人信息保护！本隐私政策旨在向您说明我们如何收集、使用、存储、共享和保护您的个人信息，以及您对个人信息享有的权利。</p>
      <p>请您在使用我们的服务前，仔细阅读并理解本隐私政策。如果您不同意本隐私政策的任何内容，请不要使用我们的服务。</p>
      
      <h4>1. 我们收集的信息</h4>
      <p>为了提供更好的服务，我们会收集以下类型的个人信息：</p>
      <h5>1.1 注册信息</h5>
      <p>当您注册账号时，我们会收集您的手机号、用户名、密码等信息，用于身份验证和账号管理。</p>
      <h5>1.2 使用信息</h5>
      <p>我们会收集您使用服务的相关信息，包括但不限于访问记录、浏览历史、搜索记录、操作日志等，用于优化服务和提供个性化体验。</p>
      <h5>1.3 设备信息</h5>
      <p>我们会收集您使用的设备信息，包括设备型号、操作系统、浏览器类型、IP地址、位置信息等，用于保障服务安全和优化性能。</p>
      <h5>1.4 其他信息</h5>
      <p>您主动提供的其他信息，如反馈意见、上传的内容等。</p>
      
      <h4>2. 我们如何使用信息</h4>
      <p>我们收集的信息主要用于以下目的：</p>
      <ul>
        <li>提供、维护和改进服务；</li>
        <li>验证用户身份，保障账号安全；</li>
        <li>提供个性化的内容和推荐；</li>
        <li>分析用户行为，优化服务体验；</li>
        <li>发送重要通知，如安全提醒、服务更新等；</li>
        <li>遵守法律法规，履行法律义务。</li>
      </ul>
      
      <h4>3. 信息存储</h4>
      <p>我们会将您的个人信息存储在安全的服务器上，并采取符合业界标准的安全措施保护您的信息。</p>
      <p>您的个人信息将在您使用服务期间及服务终止后保留一段时间，以满足法律要求和提供必要的服务支持。</p>
      <p>我们会定期备份数据，以防止数据丢失。</p>
      
      <h4>4. 信息共享</h4>
      <p>我们不会未经您的明确同意向第三方共享您的个人信息，但以下情况除外：</p>
      <ul>
        <li>法律法规要求或政府部门强制要求；</li>
        <li>为了保护我们或他人的合法权益；</li>
        <li>您明确授权或同意；</li>
        <li>与可信的第三方合作伙伴共享，用于提供或优化服务，但我们会要求合作伙伴遵守隐私保护规定。</li>
      </ul>
      
      <h4>5. 信息安全</h4>
      <p>我们采取了多层次的安全措施保护您的个人信息，包括：</p>
      <ul>
        <li>数据加密传输和存储；</li>
        <li>访问控制和身份验证；</li>
        <li>安全审计和监控；</li>
        <li>定期安全评估和漏洞修复。</li>
      </ul>
      <p>尽管我们采取了这些措施，但互联网环境并非绝对安全，我们无法保证您的信息绝对安全。</p>
      
      <h4>6. 您的权利</h4>
      <p>您对自己的个人信息享有以下权利：</p>
      <ul>
        <li>访问权：您可以访问您的个人信息；</li>
        <li>更正权：您可以更正不准确的个人信息；</li>
        <li>删除权：在符合法律规定的情况下，您可以要求删除您的个人信息；</li>
        <li>撤回同意权：您可以撤回对信息收集和使用的同意；</li>
        <li>数据可携带权：您可以请求获取您的个人信息副本。</li>
      </ul>
      <p>您可以通过我们提供的渠道行使这些权利。</p>
      
      <h4>7. 第三方服务</h4>
      <p>我们的服务可能包含第三方提供的内容或链接，这些第三方可能会收集您的信息。</p>
      <p>本隐私政策不适用于第三方服务，我们不对第三方的隐私行为负责。请您在使用第三方服务前，阅读其隐私政策。</p>
      
      <h4>8. 政策更新</h4>
      <p>我们可能会适时更新本隐私政策，更新后的政策将在平台上公布。</p>
      <p>如果我们对隐私政策进行重大变更，我们会通过适当的方式通知您，如弹窗提示、邮件通知等。</p>
      
      <h4>9. 联系我们</h4>
      <p>如果您对本隐私政策有任何疑问或建议，或者需要行使您的权利，请通过以下方式联系我们：</p>
      <p>客服邮箱：support@example.com</p>
      <p>客服热线：400-XXX-XXXX</p>
      
      <p style="text-align: right; margin-top: 40px; font-size: 13px; color: #999;">隐私政策更新日期：2026年5月22日</p>
      <p style="text-align: right; font-size: 13px; color: #999;">版本号：V1.0</p>
    `;

// 协议内容（实际项目中应从后端或配置文件获取）
const protocolContent = computed(() => {
  if (props.merged) {
    return userAgreementContent + privacyPolicyContent;
  }
  if (props.type === 'user') {
    return userAgreementContent;
  } else {
    return privacyPolicyContent;
  }
});

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// 弹窗关闭回调
const handleClosed = () => {
  if (contentRef.value) {
    contentRef.value.scrollTop = 0;
  }
  emit('closed');
};
</script>

<style lang="scss" scoped>
.agreement-dialog {
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }
  
  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    width: 100%;
    margin: 0;
    line-height: 1.5;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    flex: 1;
    overflow: hidden;
    width: 100%;
    max-height: calc(85vh - 130px);
    min-height: 200px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-lighter);
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
  }
}

.agreement-content {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(85vh - 130px);
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
    
    &:hover {
      background: var(--el-text-color-placeholder);
    }
  }
  
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color) transparent;
}

.agreement-text {
  line-height: 1.8;
  color: var(--el-text-color-primary);
  font-size: 14px;
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding-bottom: 12px;
  }
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-top: 28px;
    margin-bottom: 14px;
    color: var(--el-text-color-primary);
    padding-left: 12px;
    border-left: 4px solid var(--el-color-primary);
  }
  
  h5 {
    font-size: 14px;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 10px;
    color: var(--el-text-color-primary);
  }
  
  p {
    margin-bottom: 14px;
    text-align: justify;
    text-indent: 2em;
  }
  
  ul {
    margin: 12px 0;
    padding-left: 32px;
    
    li {
      margin-bottom: 8px;
      list-style-type: disc;
    }
  }
  
  a {
    color: var(--el-color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .agreement-dialog {
    :deep(.el-dialog) {
      width: calc(100vw - 20px) !important;
      max-width: calc(100vw - 20px) !important;
      max-height: calc(100vh - 20px) !important;
      margin: 10px !important;
      border-radius: 12px;
    }
    
    :deep(.el-dialog__wrapper) {
      padding: 10px;
    }
    
    :deep(.el-dialog__header) {
      padding: 16px;
    }
    
    :deep(.el-dialog__title) {
      font-size: 16px;
    }
    
    :deep(.el-dialog__body) {
      max-height: calc(100vh - 160px);
    }
  }
  
  .agreement-content {
    padding: 16px;
    max-height: 60vh;
  }
  
  .agreement-text {
    font-size: 13px;
    
    h3 {
      font-size: 18px;
    }
    
    h4 {
      font-size: 15px;
    }
  }
  
  .dialog-footer {
    padding: 12px 16px;
  }
}
</style>
