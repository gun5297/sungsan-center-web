// ===== useMyPage: 마이페이지 =====
import { onAuthChange, logout } from '../../firebase/auth.js';
import { getUserDoc, updateUserDoc, getPendingUsers, approveUser, rejectUser } from '../../firebase/services/userService.js';
import { getPasswords, updatePasswords } from '../../firebase/services/settingsService.js';

const ROLE_LABELS = {
  admin: '관리자',
  general: '일반',
  director: '관리자',      // 레거시 호환
  teacher: '관리자',       // 레거시 호환
  social_worker: '관리자'  // 레거시 호환
};

export function initMyPage() {
  const root = document.getElementById('mypageRoot');
  root.innerHTML = '<div class="loading-state" style="padding:80px 0;">불러오는 중</div>';

  onAuthChange(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    try {
      const userDoc = await getUserDoc(user.uid);
      if (!userDoc || !userDoc.approved) {
        window.location.href = 'login.html';
        return;
      }
      renderMyPage(root, user, userDoc);
    } catch (e) {
      console.error('마이페이지 로드 실패:', e);
      root.innerHTML = '<div class="empty-state" style="padding:80px 0;">페이지를 불러올 수 없습니다.<br><a href="index.html">메인으로</a></div>';
    }
  });
}

async function renderMyPage(root, user, userDoc) {
  const roleLabel = ROLE_LABELS[userDoc.role] || userDoc.role;
  const isAdmin = userDoc.role === 'admin' || userDoc.role === 'director' || userDoc.role === 'teacher' || userDoc.role === 'social_worker';

  // 비밀번호 관리 섹션 (관리자만)
  let passwordSection = '';
  if (isAdmin) {
    try {
      const passwords = await getPasswords();
      passwordSection = `
        <div class="mypage-card mt">
          <div class="mypage-section-title">비밀번호 관리</div>
          <div class="mypage-info-list" style="margin-bottom:0;">
            <div class="mypage-info-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
              <span class="mypage-info-label">관리자 가입 인증 비밀번호</span>
              <div style="display:flex;gap:8px;width:100%;align-items:center;">
                <input type="text" id="pwAdminSignup" class="input-field" value="${passwords.adminSignup || ''}" style="margin-bottom:0;flex:1;" />
                <button class="edit-btn" onclick="savePassword('adminSignup')">저장</button>
              </div>
            </div>
            <div class="mypage-info-row" style="flex-direction:column;align-items:flex-start;gap:8px;">
              <span class="mypage-info-label">출석 패드 진입 비밀번호</span>
              <div style="display:flex;gap:8px;width:100%;align-items:center;">
                <input type="text" id="pwAttendance" class="input-field" value="${passwords.attendance || ''}" style="margin-bottom:0;flex:1;" />
                <button class="edit-btn" onclick="savePassword('attendance')">저장</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      console.error('비밀번호 설정 로드 실패:', e);
    }
  }

  // 승인 대기자 목록 (관리자만)
  let pendingSection = '';
  if (isAdmin) {
    try {
      const pending = await getPendingUsers();
      if (pending.length > 0) {
        pendingSection = `
          <div class="mypage-card mt">
            <div class="mypage-section-title">승인 대기 계정 <span class="pending-count">${pending.length}</span></div>
            <div class="pending-list">
              ${pending.map(u => `
                <div class="pending-item">
                  <div class="pending-info">
                    <div class="pending-name">${u.name}</div>
                    <div class="pending-detail">${ROLE_LABELS[u.role] || u.role} · ${u.email} · ${u.phone || '-'}</div>
                  </div>
                  <div class="pending-actions">
                    <button class="approve-btn" onclick="approveAccount('${u.id}')">승인</button>
                    <button class="reject-btn" onclick="rejectAccount('${u.id}')">거절</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        pendingSection = `
          <div class="mypage-card mt">
            <div class="mypage-section-title">승인 대기 계정</div>
            <div class="empty-state" style="padding:24px 0;">대기 중인 계정이 없습니다</div>
          </div>
        `;
      }
    } catch (e) {
      console.error('승인 대기 목록 조회 실패:', e);
    }
  }

  root.innerHTML = `
    <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

    <div class="mypage-card">
      <div class="mypage-header">
        <div class="mypage-avatar">${userDoc.name.charAt(0)}</div>
        <div>
          <div class="mypage-name">${userDoc.name}</div>
          <div class="mypage-role-badge role-${userDoc.role}">${roleLabel}</div>
        </div>
      </div>

      <div class="mypage-info-list">
        <div class="mypage-info-row">
          <span class="mypage-info-label">이메일</span>
          <span class="mypage-info-value">${userDoc.email}</span>
        </div>
        <div class="mypage-info-row">
          <span class="mypage-info-label">연락처</span>
          <span class="mypage-info-value">${userDoc.phone || '-'}</span>
        </div>
        <div class="mypage-info-row">
          <span class="mypage-info-label">직책</span>
          <span class="mypage-info-value">${roleLabel}</span>
        </div>
      </div>

      <div class="mypage-permission-box">
        <div class="mypage-permission-title">내 권한</div>
        ${getPermissionList(userDoc.role)}
      </div>

      <div class="mypage-actions">
        <button class="btn-upload" onclick="openEditModal()">정보 수정</button>
        <button class="btn-secondary-sm" onclick="doLogout()">로그아웃</button>
      </div>
      <a href="index.html" class="mypage-back-link">← 메인으로</a>
    </div>

    ${passwordSection}

    ${pendingSection}

    <!-- 정보 수정 모달 -->
    <div class="edit-modal-overlay" id="editModal">
      <div class="edit-modal">
        <div class="modal-title">정보 수정</div>
        <div class="form-group">
          <label class="form-label">이름</label>
          <input type="text" id="editName" class="input-field" value="${userDoc.name}" />
        </div>
        <div class="form-group">
          <label class="form-label">이메일</label>
          <input type="email" class="input-field" value="${userDoc.email}" disabled style="background:#f5f0eb;color:#8c7e72;" />
        </div>
        <div class="form-group">
          <label class="form-label">연락처</label>
          <input type="tel" id="editPhone" class="input-field" value="${userDoc.phone || ''}" placeholder="010-0000-0000" />
        </div>
        <div class="form-group">
          <label class="form-label">직책</label>
          <input type="text" class="input-field" value="${roleLabel}" disabled style="background:#f5f0eb;color:#8c7e72;" />
        </div>
        <div class="edit-modal-actions">
          <button class="btn-upload" onclick="saveEdit('${user.uid}')">저장</button>
          <button class="btn-secondary-sm" onclick="closeEditModal()">취소</button>
        </div>
      </div>
    </div>
  `;

  // 모달 바깥 클릭 시 닫기
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });
}

function getPermissionList(role) {
  const adminPerms = ['공지·갤러리·식단·픽업 작성/수정/삭제', '서류함 열람 및 삭제', '회원 계정 승인/거절', '모든 관리 기능'];
  const generalPerms = ['활동 사진 열람'];

  const isAdminRole = role === 'admin' || role === 'director' || role === 'teacher' || role === 'social_worker';
  const list = isAdminRole ? adminPerms : generalPerms;
  return `<ul class="permission-list">${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

// window 노출 함수들
window.doLogout = async () => {
  await logout();
  window.location.href = 'index.html';
};

window.openEditModal = () => {
  const modal = document.getElementById('editModal');
  if (modal) modal.classList.add('active');
};

window.closeEditModal = () => {
  const modal = document.getElementById('editModal');
  if (modal) modal.classList.remove('active');
};

window.saveEdit = async (uid) => {
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  if (!name) { alert('이름을 입력해 주세요.'); return; }
  try {
    await updateUserDoc(uid, { name, phone });
    alert('정보가 수정되었습니다.');
    window.location.reload();
  } catch (e) {
    console.error('정보 수정 실패:', e);
    alert('수정 중 오류가 발생했습니다.');
  }
};

window.approveAccount = async (uid) => {
  if (!confirm('이 계정을 승인하시겠습니까?')) return;
  try {
    await approveUser(uid);
    alert('승인되었습니다.');
    window.location.reload();
  } catch (e) {
    console.error('승인 실패:', e);
    alert('승인 중 오류가 발생했습니다.');
  }
};

window.savePassword = async (field) => {
  const inputId = field === 'adminSignup' ? 'pwAdminSignup' : 'pwAttendance';
  const value = document.getElementById(inputId).value.trim();
  if (!value) { alert('비밀번호를 입력해 주세요.'); return; }
  try {
    await updatePasswords({ [field]: value });
    alert('비밀번호가 변경되었습니다.');
  } catch (e) {
    console.error('비밀번호 변경 실패:', e);
    alert('변경 중 오류가 발생했습니다.');
  }
};

window.rejectAccount = async (uid) => {
  if (!confirm('이 계정을 거절하시겠습니까?')) return;
  try {
    await rejectUser(uid);
    alert('거절되었습니다.');
    window.location.reload();
  } catch (e) {
    console.error('거절 실패:', e);
    alert('거절 중 오류가 발생했습니다.');
  }
};
