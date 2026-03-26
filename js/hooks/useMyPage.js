// ===== useMyPage: 마이페이지 =====
import { escapeHtml } from '../utils.js';
import { onAuthChange, logout } from '../../firebase/auth.js';
import { getUserDoc, updateUserDoc, getPendingUsers, approveUser, rejectUser, isAdminRole } from '../../firebase/services/userService.js';
import { getPasswords, updatePasswords } from '../../firebase/services/settingsService.js';
import { subscribeChildren, createChild, updateChild, deleteChild } from '../../firebase/services/childService.js';
import { getMyChildren, linkChild, unlinkChild, subscribeMyChildren } from '../../firebase/services/childLinkService.js';
import { getRecentLogs } from '../../firebase/services/auditService.js';
import { logAction } from '../../firebase/services/auditService.js';

const ROLE_LABELS = {
  admin: '관리자',
  general: '일반',
  director: '관리자',      // 레거시 호환
  teacher: '관리자',       // 레거시 호환
  social_worker: '관리자'  // 레거시 호환
};

// 모듈 레벨 상태
let _allChildren = [];
let _myLinks = [];
let _childSearchTerm = '';
let _currentUser = null;
let _unsubChildren = null;
let _unsubMyChildren = null;

export function initMyPage() {
  const root = document.getElementById('mypageRoot');
  root.innerHTML = '<div class="loading-state mypage-loading-state">불러오는 중</div>';

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
      _currentUser = user;
      renderMyPage(root, user, userDoc);
    } catch (e) {
      console.error('마이페이지 로드 실패:', e);
      root.innerHTML = '<div class="empty-state mypage-loading-state">페이지를 불러올 수 없습니다.<br><a href="index.html">메인으로</a></div>';
    }
  });
}

async function renderMyPage(root, user, userDoc) {
  const roleLabel = ROLE_LABELS[userDoc.role] || userDoc.role;
  const isAdmin = isAdminRole(userDoc.role);

  // 비밀번호 관리 섹션 (관리자만)
  let passwordSection = '';
  if (isAdmin) {
    try {
      const passwords = await getPasswords();
      passwordSection = `
        <div class="mypage-card mt">
          <div class="mypage-section-title">비밀번호 관리</div>
          <div class="mypage-info-list">
            <div class="mypage-info-row mypage-info-row--vertical">
              <span class="mypage-info-label">관리자 가입 인증 비밀번호</span>
              <div class="mypage-pw-row">
                <input type="text" id="pwAdminSignup" class="input-field" value="${escapeHtml(passwords.adminSignup || '')}" />
                <button class="edit-btn" onclick="savePassword('adminSignup')">저장</button>
              </div>
            </div>
            <div class="mypage-info-row mypage-info-row--vertical">
              <span class="mypage-info-label">출석 패드 진입 비밀번호</span>
              <div class="mypage-pw-row">
                <input type="text" id="pwAttendance" class="input-field" value="${escapeHtml(passwords.attendance || '')}" />
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
                    <div class="pending-name">${escapeHtml(u.name)}</div>
                    <div class="pending-detail">${escapeHtml(ROLE_LABELS[u.role] || u.role)} · ${escapeHtml(u.email)} · ${escapeHtml(u.phone || '-')}</div>
                  </div>
                  <div class="pending-actions">
                    <button class="approve-btn" onclick="approveAccount('${escapeHtml(u.id)}')">승인</button>
                    <button class="reject-btn" onclick="rejectAccount('${escapeHtml(u.id)}')">거절</button>
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
            <div class="empty-state mypage-empty-sm">대기 중인 계정이 없습니다</div>
          </div>
        `;
      }
    } catch (e) {
      console.error('승인 대기 목록 조회 실패:', e);
    }
  }

  // 동의 관리 섹션 (일반 사용자만)
  let consentSection = '';
  if (!isAdmin) {
    const photoConsent = userDoc.photoConsent !== false; // 기본값 true
    consentSection = `
      <div class="mypage-card mt">
        <div class="mypage-section-title">동의 관리</div>
        <div class="mypage-info-list">
          <div class="mypage-info-row">
            <span class="mypage-info-label">개인정보 수집 동의</span>
            <span class="mypage-info-value mypage-consent-value">O (필수)</span>
          </div>
          <div class="mypage-info-row">
            <span class="mypage-info-label">사진촬영 동의</span>
            <span class="mypage-info-value ${photoConsent ? 'mypage-consent-value' : 'mypage-consent-revoked'}" id="photoConsentStatus">${photoConsent ? 'O' : 'X (철회됨)'}</span>
          </div>
        </div>
        <div class="mypage-consent-actions">
          ${photoConsent
            ? `<button class="btn-secondary-sm mypage-consent-withdraw" onclick="withdrawPhotoConsent('${escapeHtml(user.uid)}')">사진촬영 동의 철회</button>`
            : `<button class="btn-secondary-sm mypage-consent-grant" onclick="grantPhotoConsent('${escapeHtml(user.uid)}')">사진촬영 동의 재동의</button>`
          }
        </div>
        <p class="mypage-consent-note">※ 사진촬영 동의를 철회하면 갤러리에서 해당 아동의 사진이 접근 불가 처리됩니다.</p>
      </div>
    `;
  }

  // 아동 관리 섹션 (관리자) 또는 내 아이 관리 섹션 (일반)
  const childSection = isAdmin
    ? `<div class="mypage-card mt" id="childMgmtCard">
        <div class="mypage-section-title">아동 관리</div>
        <div class="child-toolbar">
          <input type="text" class="input-field child-search" id="childSearch" placeholder="이름으로 검색" oninput="filterChildren(this.value)" />
          <button class="btn-upload child-add-btn" onclick="openChildModal()">아동 추가</button>
        </div>
        <div id="childListWrap"><div class="empty-state mypage-empty-sm">불러오는 중...</div></div>
      </div>`
    : `<div class="mypage-card mt" id="myChildCard">
        <div class="mypage-section-title">내 아이 관리</div>
        <div id="myChildListWrap"><div class="empty-state mypage-empty-sm">불러오는 중...</div></div>
        <button class="btn-upload mypage-link-child-btn" onclick="openLinkChildModal()">아이 연결하기</button>
      </div>`;

  root.innerHTML = `
    <a href="index.html" class="auth-logo">성산<span>지역아동센터</span></a>

    <div class="mypage-card">
      <div class="mypage-header">
        <div class="mypage-avatar">${escapeHtml(userDoc.name.charAt(0))}</div>
        <div>
          <div class="mypage-name">${escapeHtml(userDoc.name)}</div>
          <div class="mypage-role-badge role-${escapeHtml(userDoc.role)}">${escapeHtml(roleLabel)}</div>
        </div>
      </div>

      <div class="mypage-info-list">
        <div class="mypage-info-row">
          <span class="mypage-info-label">이메일</span>
          <span class="mypage-info-value">${escapeHtml(userDoc.email)}</span>
        </div>
        <div class="mypage-info-row">
          <span class="mypage-info-label">연락처</span>
          <span class="mypage-info-value">${escapeHtml(userDoc.phone || '-')}</span>
        </div>
        <div class="mypage-info-row">
          <span class="mypage-info-label">직책</span>
          <span class="mypage-info-value">${escapeHtml(roleLabel)}</span>
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
      <a href="index.html" class="mypage-back-link">&larr; 메인으로</a>
    </div>

    ${passwordSection}

    ${pendingSection}

    ${consentSection}

    ${childSection}

    ${isAdmin ? `
    <div class="mypage-card mt">
      <div class="mypage-section-title">데이터 내보내기</div>
      <div class="mypage-actions mypage-actions--wrap">
        <button class="btn-secondary-sm" onclick="exportChildren()">아동 목록 CSV</button>
        <button class="btn-secondary-sm" onclick="exportNotices()">공지사항 CSV</button>
        <button class="btn-secondary-sm" onclick="exportMedications()">투약 기록 CSV</button>
      </div>
    </div>
    ` : ''}

    ${isAdmin ? `
    <div class="mypage-card mt">
      <div class="mypage-section-title">활동 로그</div>
      <div id="auditLogList" class="audit-log-list"><div class="empty-state mypage-empty-md">로그 불러오는 중...</div></div>
    </div>
    ` : ''}

    <!-- 정보 수정 모달 -->
    <div class="edit-modal-overlay" id="editModal">
      <div class="edit-modal">
        <div class="modal-title">정보 수정</div>
        <div class="form-group">
          <label class="form-label">이름</label>
          <input type="text" id="editName" class="input-field" value="${escapeHtml(userDoc.name)}" />
        </div>
        <div class="form-group">
          <label class="form-label">이메일</label>
          <input type="email" class="input-field input-disabled" value="${escapeHtml(userDoc.email)}" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">연락처</label>
          <input type="tel" id="editPhone" class="input-field" value="${escapeHtml(userDoc.phone || '')}" placeholder="010-0000-0000" />
        </div>
        <div class="form-group">
          <label class="form-label">직책</label>
          <input type="text" class="input-field input-disabled" value="${escapeHtml(roleLabel)}" disabled />
        </div>
        <div class="edit-modal-actions">
          <button class="btn-upload" onclick="saveEdit('${escapeHtml(user.uid)}')">저장</button>
          <button class="btn-secondary-sm" onclick="closeEditModal()">취소</button>
        </div>
      </div>
    </div>

    <!-- 아동 추가/수정 모달 (관리자) -->
    <div class="edit-modal-overlay" id="childModal">
      <div class="edit-modal child-modal-wide">
        <div class="modal-title" id="childModalTitle">아동 추가</div>
        <input type="hidden" id="childEditId" value="" />
        <div class="child-form-grid">
          <div class="form-group">
            <label class="form-label">이름 *</label>
            <input type="text" id="childName" class="input-field" placeholder="아동 이름" />
          </div>
          <div class="form-group">
            <label class="form-label">생년월일</label>
            <input type="date" id="childBirth" class="input-field" />
          </div>
          <div class="form-group">
            <label class="form-label">성별</label>
            <select id="childGender" class="input-field">
              <option value="">선택</option>
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">학교/학년</label>
            <input type="text" id="childSchool" class="input-field" placeholder="예: 증산초 3학년" />
          </div>
          <div class="form-group">
            <label class="form-label">보호자 이름</label>
            <input type="text" id="childGuardianName" class="input-field" placeholder="보호자 이름" />
          </div>
          <div class="form-group">
            <label class="form-label">보호자 연락처</label>
            <input type="tel" id="childGuardianPhone" class="input-field" placeholder="010-0000-0000" />
          </div>
          <div class="form-group">
            <label class="form-label">관계</label>
            <input type="text" id="childGuardianRelation" class="input-field" placeholder="예: 모" />
          </div>
          <div class="form-group">
            <label class="form-label">입소일</label>
            <input type="date" id="childEnrollDate" class="input-field" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">알레르기</label>
          <input type="text" id="childAllergy" class="input-field" placeholder="없으면 비워두세요" />
        </div>
        <div class="form-group">
          <label class="form-label">특이사항</label>
          <textarea id="childNote" class="input-field" rows="2" placeholder="없으면 비워두세요"></textarea>
        </div>
        <div class="edit-modal-actions">
          <button class="btn-upload" onclick="saveChild()">저장</button>
          <button class="btn-secondary-sm" onclick="closeChildModal()">취소</button>
        </div>
      </div>
    </div>

    <!-- 아이 연결 모달 (일반 사용자) -->
    <div class="edit-modal-overlay" id="linkChildModal">
      <div class="edit-modal">
        <div class="modal-title">아이 연결하기</div>
        <div class="form-group">
          <label class="form-label">아동 선택 *</label>
          <input type="text" id="linkChildSearch" class="input-field" placeholder="이름으로 검색" oninput="filterLinkChildren(this.value)" />
          <div class="link-child-list" id="linkChildList"></div>
          <input type="hidden" id="linkChildId" value="" />
          <input type="hidden" id="linkChildName" value="" />
          <div id="linkChildSelected" class="link-child-selected hidden"></div>
        </div>
        <div class="form-group">
          <label class="form-label">관계 *</label>
          <select id="linkRelation" class="input-field">
            <option value="">선택해 주세요</option>
            <option value="부">부</option>
            <option value="모">모</option>
            <option value="조부">조부</option>
            <option value="조모">조모</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div class="edit-modal-actions">
          <button class="btn-upload" onclick="confirmLinkChild()">연결</button>
          <button class="btn-secondary-sm" onclick="closeLinkChildModal()">취소</button>
        </div>
      </div>
    </div>
  `;

  // 모달 바깥 클릭 시 닫기
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });
  document.getElementById('childModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeChildModal();
  });
  document.getElementById('linkChildModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLinkChildModal();
  });

  // 아동 실시간 구독 시작
  if (_unsubChildren) _unsubChildren();
  _unsubChildren = subscribeChildren((children) => {
    _allChildren = children;
    if (isAdmin) renderChildList();
  });

  // 감사 로그 로드 (관리자만)
  if (isAdmin) {
    loadAuditLogs();
  }

  // 일반 사용자: 내 아이 연결 실시간 구독
  if (!isAdmin) {
    if (_unsubMyChildren) _unsubMyChildren();
    _unsubMyChildren = subscribeMyChildren(user.uid, (links) => {
      _myLinks = links;
      renderMyChildList();
    });
  }
}

// ===== 관리자: 아동 목록 렌더링 =====
function renderChildList() {
  const wrap = document.getElementById('childListWrap');
  if (!wrap) return;

  const filtered = _childSearchTerm
    ? _allChildren.filter(c => c.name && c.name.includes(_childSearchTerm))
    : _allChildren;

  if (filtered.length === 0) {
    wrap.innerHTML = `<div class="empty-state mypage-empty-sm">${_childSearchTerm ? '검색 결과가 없습니다' : '등록된 아동이 없습니다'}</div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="child-table-wrap">
      <table class="child-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>학교/학년</th>
            <th>보호자</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(c => `
            <tr class="${c.status === 'inactive' ? 'inactive-row' : ''}">
              <td class="child-name-cell">${escapeHtml(c.name || '-')}</td>
              <td>${escapeHtml(c.school || '-')}</td>
              <td>${escapeHtml(c.guardianName || '-')}</td>
              <td><span class="child-status-badge status-${escapeHtml(c.status || 'active')}">${c.status === 'inactive' ? '퇴소' : '재원'}</span></td>
              <td class="child-action-cell">
                <button class="child-edit-btn" onclick="openChildEditModal('${escapeHtml(c.id)}')">수정</button>
                ${c.status !== 'inactive'
                  ? `<button class="child-inactive-btn" onclick="deactivateChild('${escapeHtml(c.id)}')">퇴소</button>`
                  : `<button class="child-active-btn" onclick="reactivateChild('${escapeHtml(c.id)}')">복원</button>`}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="child-count">총 ${filtered.length}명 (재원 ${filtered.filter(c => c.status !== 'inactive').length}명)</div>
  `;
}

// ===== 일반 사용자: 내 아이 목록 렌더링 =====
function renderMyChildList() {
  const wrap = document.getElementById('myChildListWrap');
  if (!wrap) return;

  if (_myLinks.length === 0) {
    wrap.innerHTML = '<div class="empty-state mypage-empty-sm">연결된 아이가 없습니다</div>';
    return;
  }

  wrap.innerHTML = `
    <div class="my-child-list">
      ${_myLinks.map(link => `
        <div class="my-child-item">
          <div class="my-child-info">
            <div class="my-child-name">${escapeHtml(link.childName || '-')}</div>
            <div class="my-child-relation">${escapeHtml(link.relation || '-')}</div>
          </div>
          <button class="reject-btn" onclick="unlinkMyChild('${escapeHtml(link.id)}')">연결 해제</button>
        </div>
      `).join('')}
    </div>
  `;
}

function getPermissionList(role) {
  const adminPerms = ['공지·갤러리·식단·픽업 작성/수정/삭제', '서류함 열람 및 삭제', '회원 계정 승인/거절', '아동 명단 관리', '모든 관리 기능'];
  const generalPerms = ['활동 사진 열람', '내 아이 연결 관리'];

  const list = isAdminRole(role) ? adminPerms : generalPerms;
  return `<ul class="permission-list">${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

// ===== window 노출 함수들 =====

window.doLogout = async () => {
  if (_unsubChildren) _unsubChildren();
  if (_unsubMyChildren) _unsubMyChildren();
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
  if (!name) { showToast('이름을 입력해 주세요.', 'warning'); return; }
  try {
    await updateUserDoc(uid, { name, phone });
    showToast('정보가 수정되었습니다.', 'success');
    window.location.reload();
  } catch (e) {
    console.error('정보 수정 실패:', e);
    showToast('수정 중 오류가 발생했습니다.', 'error');
  }
};

window.approveAccount = async (uid) => {
  if (!await showConfirm('이 계정을 승인하시겠습니까?')) return;
  try {
    await approveUser(uid);
    logAction('approve', 'user', uid, '계정 승인');
    showToast('승인되었습니다.', 'success');
    window.location.reload();
  } catch (e) {
    console.error('승인 실패:', e);
    showToast('승인 중 오류가 발생했습니다.', 'error');
  }
};

window.savePassword = async (field) => {
  const inputId = field === 'adminSignup' ? 'pwAdminSignup' : 'pwAttendance';
  const value = document.getElementById(inputId).value.trim();
  if (!value) { showToast('비밀번호를 입력해 주세요.', 'warning'); return; }
  try {
    await updatePasswords({ [field]: value });
    showToast('비밀번호가 변경되었습니다.', 'success');
  } catch (e) {
    console.error('비밀번호 변경 실패:', e);
    showToast('변경 중 오류가 발생했습니다.', 'error');
  }
};

window.rejectAccount = async (uid) => {
  if (!await showConfirm('이 계정을 거절하시겠습니까?')) return;
  try {
    await rejectUser(uid);
    logAction('reject', 'user', uid, '계정 거절');
    showToast('거절되었습니다.', 'success');
    window.location.reload();
  } catch (e) {
    console.error('거절 실패:', e);
    showToast('거절 중 오류가 발생했습니다.', 'error');
  }
};

// ===== 아동 관리 (관리자) =====

window.filterChildren = (term) => {
  _childSearchTerm = term.trim();
  renderChildList();
};

window.openChildModal = () => {
  document.getElementById('childModalTitle').textContent = '아동 추가';
  document.getElementById('childEditId').value = '';
  document.getElementById('childName').value = '';
  document.getElementById('childBirth').value = '';
  document.getElementById('childGender').value = '';
  document.getElementById('childSchool').value = '';
  document.getElementById('childGuardianName').value = '';
  document.getElementById('childGuardianPhone').value = '';
  document.getElementById('childGuardianRelation').value = '';
  document.getElementById('childEnrollDate').value = '';
  document.getElementById('childAllergy').value = '';
  document.getElementById('childNote').value = '';
  document.getElementById('childModal').classList.add('active');
};

window.openChildEditModal = (childId) => {
  const child = _allChildren.find(c => c.id === childId);
  if (!child) return;

  document.getElementById('childModalTitle').textContent = '아동 정보 수정';
  document.getElementById('childEditId').value = childId;
  document.getElementById('childName').value = child.name || '';
  document.getElementById('childBirth').value = child.birth || '';
  document.getElementById('childGender').value = child.gender || '';
  document.getElementById('childSchool').value = child.school || '';
  document.getElementById('childGuardianName').value = child.guardianName || '';
  document.getElementById('childGuardianPhone').value = child.guardianPhone || '';
  document.getElementById('childGuardianRelation').value = child.guardianRelation || '';
  document.getElementById('childEnrollDate').value = child.enrollDate || '';
  document.getElementById('childAllergy').value = child.allergy || '';
  document.getElementById('childNote').value = child.note || '';
  document.getElementById('childModal').classList.add('active');
};

window.closeChildModal = () => {
  document.getElementById('childModal').classList.remove('active');
};

window.saveChild = async () => {
  const name = document.getElementById('childName').value.trim();
  if (!name) { showToast('아동 이름을 입력해 주세요.', 'warning'); return; }

  const data = {
    name,
    birth: document.getElementById('childBirth').value,
    gender: document.getElementById('childGender').value,
    school: document.getElementById('childSchool').value.trim(),
    guardianName: document.getElementById('childGuardianName').value.trim(),
    guardianPhone: document.getElementById('childGuardianPhone').value.trim(),
    guardianRelation: document.getElementById('childGuardianRelation').value.trim(),
    enrollDate: document.getElementById('childEnrollDate').value,
    allergy: document.getElementById('childAllergy').value.trim(),
    note: document.getElementById('childNote').value.trim()
  };

  const editId = document.getElementById('childEditId').value;

  try {
    if (editId) {
      await updateChild(editId, data);
      showToast('아동 정보가 수정되었습니다.', 'success');
    } else {
      await createChild(data);
      showToast('아동이 등록되었습니다.', 'success');
    }
    closeChildModal();
  } catch (e) {
    console.error('아동 저장 실패:', e);
    showToast('저장 중 오류가 발생했습니다.', 'error');
  }
};

window.deactivateChild = async (childId) => {
  if (!await showConfirm('이 아동을 퇴소 처리하시겠습니까?')) return;
  try {
    await updateChild(childId, { status: 'inactive' });
    showToast('퇴소 처리되었습니다.', 'success');
  } catch (e) {
    console.error('퇴소 처리 실패:', e);
    showToast('처리 중 오류가 발생했습니다.', 'error');
  }
};

window.reactivateChild = async (childId) => {
  if (!await showConfirm('이 아동을 재원 상태로 복원하시겠습니까?')) return;
  try {
    await updateChild(childId, { status: 'active' });
    showToast('복원되었습니다.', 'success');
  } catch (e) {
    console.error('복원 실패:', e);
    showToast('처리 중 오류가 발생했습니다.', 'error');
  }
};

// ===== 동의 관리 (일반 사용자) =====

window.withdrawPhotoConsent = async (uid) => {
  if (!await showConfirm('사진촬영 동의를 철회하시겠습니까?\n\n철회 시 갤러리에서 해당 아동의 사진이 접근 불가 처리됩니다.')) return;
  try {
    await updateUserDoc(uid, { photoConsent: false });
    showToast('사진촬영 동의가 철회되었습니다.', 'success');
    window.location.reload();
  } catch (e) {
    console.error('동의 철회 실패:', e);
    showToast('처리 중 오류가 발생했습니다.', 'error');
  }
};

window.grantPhotoConsent = async (uid) => {
  if (!await showConfirm('사진촬영에 다시 동의하시겠습니까?')) return;
  try {
    await updateUserDoc(uid, { photoConsent: true });
    showToast('사진촬영 동의가 완료되었습니다.', 'success');
    window.location.reload();
  } catch (e) {
    console.error('동의 처리 실패:', e);
    showToast('처리 중 오류가 발생했습니다.', 'error');
  }
};

// ===== 아이 연결 (일반 사용자) =====

window.openLinkChildModal = () => {
  document.getElementById('linkChildId').value = '';
  document.getElementById('linkChildName').value = '';
  document.getElementById('linkChildSearch').value = '';
  document.getElementById('linkRelation').value = '';
  document.getElementById('linkChildSelected').classList.add('hidden');
  document.getElementById('linkChildModal').classList.add('active');
  renderLinkChildList('');
};

window.closeLinkChildModal = () => {
  document.getElementById('linkChildModal').classList.remove('active');
};

window.filterLinkChildren = (term) => {
  renderLinkChildList(term.trim());
};

function renderLinkChildList(term) {
  const listEl = document.getElementById('linkChildList');
  if (!listEl) return;

  const alreadyLinkedIds = new Set(_myLinks.map(l => l.childId));
  let available = _allChildren.filter(c => c.status !== 'inactive' && !alreadyLinkedIds.has(c.id));
  if (term) available = available.filter(c => c.name && c.name.includes(term));

  if (available.length === 0) {
    listEl.innerHTML = '<div class="empty-state mypage-empty-search">검색 결과가 없습니다</div>';
    return;
  }

  listEl.innerHTML = available.map(c => `
    <div class="link-child-option" onclick="selectLinkChild('${escapeHtml(c.id)}', '${escapeHtml((c.name || '').replace(/'/g, "\\'"))}')">
      <span class="link-child-option-name">${escapeHtml(c.name)}</span>
      <span class="link-child-option-school">${escapeHtml(c.school || '')}</span>
    </div>
  `).join('');
}

window.selectLinkChild = (childId, childName) => {
  document.getElementById('linkChildId').value = childId;
  document.getElementById('linkChildName').value = childName;
  document.getElementById('linkChildSelected').classList.remove('hidden');
  document.getElementById('linkChildSelected').innerHTML = `<span>선택: <strong>${escapeHtml(childName)}</strong></span>`;
  document.getElementById('linkChildList').innerHTML = '';
  document.getElementById('linkChildSearch').value = '';
};

window.confirmLinkChild = async () => {
  const childId = document.getElementById('linkChildId').value;
  const childName = document.getElementById('linkChildName').value;
  const relation = document.getElementById('linkRelation').value;
  if (!childId) { showToast('아동을 선택해 주세요.', 'warning'); return; }
  if (!relation) { showToast('관계를 선택해 주세요.', 'warning'); return; }

  try {
    await linkChild(_currentUser.uid, childId, childName, relation);
    showToast('아이가 연결되었습니다.', 'success');
    closeLinkChildModal();
  } catch (e) {
    console.error('아이 연결 실패:', e);
    showToast('연결 중 오류가 발생했습니다.', 'error');
  }
};

window.unlinkMyChild = async (linkId) => {
  if (!await showConfirm('이 아이 연결을 해제하시겠습니까?')) return;
  try {
    await unlinkChild(linkId);
    showToast('연결이 해제되었습니다.', 'success');
  } catch (e) {
    console.error('연결 해제 실패:', e);
    showToast('해제 중 오류가 발생했습니다.', 'error');
  }
};

// ===== 감사 로그 =====
async function loadAuditLogs() {
  const el = document.getElementById('auditLogList');
  if (!el) return;
  try {
    const logs = await getRecentLogs(20);
    if (logs.length === 0) {
      el.innerHTML = '<div class="empty-state mypage-empty-md">아직 기록된 활동이 없습니다</div>';
      return;
    }
    el.innerHTML = logs.map(log => {
      const ts = log.timestamp ? new Date(log.timestamp.seconds * 1000) : null;
      const timeStr = ts ? `${ts.getMonth()+1}/${ts.getDate()} ${ts.getHours()}:${String(ts.getMinutes()).padStart(2,'0')}` : '-';
      const actionLabel = { create: '생성', update: '수정', delete: '삭제', approve: '승인', reject: '거절' };
      return `
        <div class="audit-log-item">
          <span class="audit-time">${timeStr}</span>
          <span class="audit-action action-${log.action}">${actionLabel[log.action] || log.action}</span>
          <span class="audit-summary">${escapeHtml(log.summary || '')}</span>
          <span class="audit-user">${escapeHtml(log.userName || '')}</span>
        </div>
      `;
    }).join('');
  } catch (e) {
    el.innerHTML = '<div class="empty-state mypage-empty-md">로그를 불러올 수 없습니다</div>';
  }
}
