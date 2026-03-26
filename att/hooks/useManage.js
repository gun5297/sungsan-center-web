// ===== 아동 관리 (CRUD) — Firestore 연동 =====

import { getStudents, createStudent, updateStudent, deleteStudentFs, getAllStudents } from '../data.js';
import { on } from '../../js/events.js';
import { escapeHtml } from '../../js/utils.js';
import { checkAttendancePassword } from '../../firebase/services/settingsService.js';

let manageUnlocked = false;
let editingStudentId = null;
// Firestore docId를 매핑 (studentId → docId)
let editingDocId = null;

async function renderStudentList() {
  try {
    const students = await getStudents();
    const list = document.getElementById('manageStudentList');

    if (students.length === 0) {
      list.innerHTML = '<div class="manage-empty">등록된 아동이 없습니다</div>';
      return;
    }

    list.innerHTML = students.map(s => `
      <div class="manage-row">
        <div class="manage-row-id">${s.id}</div>
        <div class="manage-row-info">
          <div class="manage-row-name">${escapeHtml(s.name)}</div>
          <div class="manage-row-detail">${escapeHtml(s.school)} · ${escapeHtml(s.parent)}</div>
        </div>
        <div class="manage-row-actions">
          <button class="manage-edit-btn" data-action="editStudent" data-id="${s.id}">수정</button>
          <button class="manage-del-btn" data-action="deleteStudent" data-id="${s.id}">삭제</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('[useManage] renderStudentList 실패:', e);
  }
}

function clearStudentForm() {
  document.getElementById('stuId').value = '';
  document.getElementById('stuName').value = '';
  document.getElementById('stuSchool').value = '';
  document.getElementById('stuParent').value = '';
}

async function unlockManage() {
  const pw = document.getElementById('managePw').value;
  try {
    const ok = await checkAttendancePassword(pw);
    if (ok) {
      manageUnlocked = true;
      document.getElementById('manageLock').classList.add('hidden');
      document.getElementById('manageUnlocked').classList.remove('hidden');
      document.getElementById('managePw').value = '';
      document.getElementById('manageLockError').classList.add('hidden');
      renderStudentList();
    } else {
      document.getElementById('manageLockError').classList.remove('hidden');
    }
  } catch (e) {
    console.error('[useManage] 비밀번호 확인 실패:', e);
    document.getElementById('manageLockError').classList.remove('hidden');
  }
}

async function addStudent() {
  const id = document.getElementById('stuId').value.trim().padStart(4, '0');
  const name = document.getElementById('stuName').value.trim();
  const school = document.getElementById('stuSchool').value.trim();
  const parent = document.getElementById('stuParent').value.trim();

  if (!id || !name || !school || !parent) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  try {
    const students = await getStudents();

    if (editingStudentId) {
      // 수정 모드
      if (id !== editingStudentId && students.some(s => s.id === id)) {
        alert('이미 사용 중인 번호입니다.');
        return;
      }

      if (editingDocId) {
        // Firestore 문서 업데이트
        await updateStudent(editingDocId, { id, name, school, parent });
      }

      editingStudentId = null;
      editingDocId = null;
      document.getElementById('stuSubmitBtn').textContent = '추가';
      document.getElementById('stuCancelBtn').classList.add('hidden');
    } else {
      // 추가 모드
      if (students.some(s => s.id === id)) {
        alert('이미 사용 중인 번호입니다.');
        return;
      }
      await createStudent({ id, name, school, parent });
    }

    clearStudentForm();
    // Firestore 구독이 자동으로 캐시를 갱신하므로 약간의 지연 후 렌더
    setTimeout(() => renderStudentList(), 500);
  } catch (e) {
    console.error('[useManage] addStudent 실패:', e);
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
}

async function editStudent(id) {
  try {
    const students = await getStudents();
    const s = students.find(st => st.id === id);
    if (!s) return;

    editingStudentId = id;
    editingDocId = s.docId || null; // Firestore 문서 ID
    document.getElementById('stuId').value = s.id;
    document.getElementById('stuName').value = s.name;
    document.getElementById('stuSchool').value = s.school;
    document.getElementById('stuParent').value = s.parent;
    document.getElementById('stuSubmitBtn').textContent = '저장';
    document.getElementById('stuCancelBtn').classList.remove('hidden');

    document.querySelector('.manage-form').scrollIntoView({ behavior: 'smooth' });
  } catch (e) {
    console.error('[useManage] editStudent 실패:', e);
  }
}

function cancelEditStudent() {
  editingStudentId = null;
  editingDocId = null;
  document.getElementById('stuSubmitBtn').textContent = '추가';
  document.getElementById('stuCancelBtn').classList.add('hidden');
  clearStudentForm();
}

async function deleteStudent(id) {
  if (!confirm('이 아동을 삭제하시겠습니까?')) return;

  try {
    const students = await getStudents();
    const s = students.find(st => st.id === id);
    if (!s) return;

    if (s.docId) {
      // Firestore에서 삭제
      await deleteStudentFs(s.docId);
    }

    // Firestore 구독이 자동으로 캐시를 갱신하므로 약간의 지연 후 렌더
    setTimeout(() => renderStudentList(), 500);
  } catch (e) {
    console.error('[useManage] deleteStudent 실패:', e);
    alert('삭제에 실패했습니다. 다시 시도해주세요.');
  }
}

// 이벤트 위임 등록
on('unlockManage', (e, el) => unlockManage());
on('unlockManage', (e, el) => {
  if (e.key === 'Enter') unlockManage();
}, 'keydown');
on('addStudent', () => addStudent());
on('editStudent', (e, el) => editStudent(el.dataset.id));
on('cancelEditStudent', () => cancelEditStudent());
on('deleteStudent', (e, el) => deleteStudent(el.dataset.id));
