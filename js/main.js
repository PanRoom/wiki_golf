// ========== main.js (全ページ共通の処理) ==========

// グローバル変数：現在のユーザー情報を保持
import { supabase } from './supabaseClient.js';

// グローバル変数：現在のユーザー情報を保持
let currentUser = null;

// DOM読み込み完了時に実行
document.addEventListener('DOMContentLoaded', () => {
    // ========== モーダル制御 ==========
    const authModal = document.getElementById('auth-modal');
    const openModalButton = document.getElementById('login-modal-button');
    const closeModalButton = document.querySelector('.close-button');

    // 「ログイン/新規登録」ボタンを押したらモーダルを表示
    if (openModalButton) {
        openModalButton.addEventListener('click', () => {
            authModal.style.display = 'flex';
        });
    }

    // 「×」ボタンを押したらモーダルを閉じる
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    // モーダルの外側をクリックしても閉じる
    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // ========== フォーム関連のイベントリスナー ==========
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    const showRegisterLink = document.getElementById('show-register-form');
    const showLoginLink = document.getElementById('show-login-form');
    
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(registerForm) registerForm.addEventListener('submit', handleRegister);
    if(logoutButton) logoutButton.addEventListener('click', handleLogout);
    if(showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(true); });
    if(showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms(false); });

    // ページ読み込み時にログイン状態を確認
    checkLoginStatus();
});


// ========== 認証API通信 ==========
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username-input').value;
    const password = document.getElementById('register-password-input').value;
    const authErrorEl = document.getElementById('auth-error');
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: `${username}@example.com`, // Supabaseはemailを必須とするためダミーを使用
            password: password,
            options: {
                data: { username: username }
            }
        });

        if (error) throw error;

        if (data.user) {
            alert('ユーザー登録が完了しました。確認メールを送信しましたので、メールアドレスを確認してください。');
            toggleAuthForms(false); // ログインフォームに切り替え
            authErrorEl.textContent = '';
        } else {
            throw new Error('登録に失敗しました。');
        }
    } catch (error) {
        authErrorEl.textContent = error.message;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username-input').value;
    const password = document.getElementById('login-password-input').value;
    const authErrorEl = document.getElementById('auth-error');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${username}@example.com`, // 登録時と同じダミーメールを使用
            password: password,
        });

        if (error) throw error;

        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', data.user.id)
                .single();

            if (profileError) throw profileError;

            currentUser = {
                id: data.user.id,
                username: profile.username
            };
            await updateUI(); // UI更新を待つ
            document.getElementById('auth-modal').style.display = 'none'; // ログイン成功でモーダルを閉じる
            
            // マイページやランキングページにいたらリロードして最新情報を反映
            const currentPage = window.location.pathname;
            if (currentPage.endsWith('mypage.html') || currentPage.endsWith('ranking.html')) {
                window.location.reload();
            }
        } else {
            throw new Error('ログインに失敗しました。');
        }
    } catch (error) {
        authErrorEl.textContent = error.message;
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('ログアウトエラー:', error.message);
        return;
    }
    currentUser = null;
    await updateUI(); // UI更新を待つ
    // もしマイページにいたらトップにリダイレクト
    if(window.location.pathname.endsWith('mypage.html')) {
        window.location.href = 'index.html';
    }
}

async function checkLoginStatus() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();

            if (profileError) throw profileError;

            currentUser = {
                id: session.user.id,
                username: profile.username
            };
        } else {
            currentUser = null;
        }
    } catch (error) {
        console.error('セッションチェックエラー:', error.message);
        currentUser = null;
    }
    await updateUI();
}

// ========== UI更新 ==========
async function updateUI() {
    // DOM要素の取得
    const userInfoEl = document.getElementById('user-info');
    const guestAreaEl = document.getElementById('guest-area');
    const mypageLink = document.getElementById('mypage-link');
    const authErrorEl = document.getElementById('auth-error');

    // DOM要素が存在するかチェック
    if (!userInfoEl || !guestAreaEl || !mypageLink) return;

    if (currentUser) {
        // ログイン状態
        userInfoEl.style.display = 'block';
        guestAreaEl.style.display = 'none';
        mypageLink.style.display = 'block';
        document.getElementById('login-username').textContent = currentUser.username;
    } else {
        // ゲスト状態
        userInfoEl.style.display = 'none';
        guestAreaEl.style.display = 'block';
        mypageLink.style.display = 'none';
    }
    if(authErrorEl) authErrorEl.textContent = ''; 
}

function toggleAuthForms(showRegister) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authErrorEl = document.getElementById('auth-error');

    if (!loginForm || !registerForm) return;

    if (showRegister) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
    if(authErrorEl) authErrorEl.textContent = '';
}