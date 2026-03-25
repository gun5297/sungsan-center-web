// ===== useMyPage: 마이페이지 =====
import { onAuthChange, logout } from '../../firebase/auth.js';
import { getUserDoc, updateUserDoc, getPendingUsers, approveUser, rejectUser } from '../../firebase/services/userService.js';

const ROLE_LABELS = {
  director: '센터장',
  teacher: '선생님',
  social_worker: '사회복무요원'
};

export function initMyPage() {
  const root = document.getElementById('mypageRoot');
  root.innerHTML = '<div class="loading-state" style="padding:80px 0;">불러오는 중</div>';

  onAuthChange(async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    const userDoc = await getUserDoc(user.uid);
    if (!userDoc || !userDoc.approved) {
      window.location.href = 'login.html';
      return;
    }

    renderMyPage(root, user, userDoc);
  });
}

async function renderMyPage(root, user, userDoc) {
  const roleLabel = ROLE_LABELS[userDoc.role] || userDoc.role;
  const isDirector = userDoc.role === 'director';

  // 승인 대기자 목록 (센터장만)
  let pendingSection = '';
  if (isDirector) {
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
      <div style="text-align:center;margin-top:12px;">
        <a href="index.html" style="font-size:0.85rem;color:var(--text-sub);">← 메인으로</a>
      </div>
    </div>

    ${pendingSection}

    <!-- 정보 수정 모달 -->
    <div class="modal-overlay" id="editModal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);display:none;align-items:center;justify-content:center;z-index:2000;">
      <div style="background:#fff;border-radius:16px;padding:32px;width:90%;max-width:400px;">
        <div class="modal-title">정보 수정</div>
        <label class="form-label" style="margin-top:16px;">이름</label>
        <input type="text" id="editName" class="input-field" value="${userDoc.name}" />
        <label class="form-label">연락처</label>
        <input type="tel" id="editPhone" class="input-field" value="${userDoc.phone || ''}" placeholder="010-0000-0000" />
        <div style="display:flex;gap:12px;margin-top:8px;">
          <button class="btn-upload" onclick="saveEdit('${user.uid}')">저장</button>
          <button class="btn-secondary-sm" onclick="closeEditModal()">취소</button>
        </div>
      </div>
    </div>
  `;
}

function getPermissionList(role) {
  const items = {
    director: ['공지·갤러리·식단·픽업 작성/수정/삭제', '서류함 열람 및 삭제', '회원 계정 승인/거절', '모든 관리자 기능'],
    teacher: ['공지·갤러리·식단·픽업 작성/수정/삭제', '서류함 열람 및 삭제'],
    social_worker: ['공지 작성 (수정·삭제 불가)', '서류함 열람만 가능']
  };
  const list = items[role] || [];
  return `<ul class="permission-list">${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

// window 노출 함수들
window.doLogout = async () => {
  await logout();
  window.location.href = 'index.html';
};

window.openEditModal = () => {
  const modal = document.getElementById('editModal');
  if (modal) modal.style.display = 'flex';
};

window.closeEditModal = () => {
  const modal = document.getElementById('editModal');
  if (modal) modal.style.display = 'none';
};

window.saveEdit = async (uid) => {
  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  if (!name) { alert('이름을 입력해 주세요.'); return; }
  await updateUserDoc(uid, { name, phone });
  alert('정보가 수정되었습니다.');
  window.location.reload();
};

window.approveAccount = async (uid) => {
  if (!confirm('이 계정을 승인하시겠습니까?')) return;
  await approveUser(uid);
  alert('승인되었습니다.');
  window.location.reload();
};

window.rejectAccount = async (uid) => {
  if (!confirm('이 계정을 거절하시겠습니까?')) return;
  await rejectUser(uid);
  alert('거절되었습니다.');
  window.location.reload();
};
